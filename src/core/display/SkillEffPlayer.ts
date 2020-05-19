/**
 * 技能效果播放器
 *
 * 必须重写bottomLayer,topLayer,setTimeout
 */
class SkillEffPlayer {

	static bottomLayer: egret.DisplayObjectContainer;
	static topLayer: egret.DisplayObjectContainer;
	static fixedLayer: egret.DisplayObjectContainer;
	static setTimeout: (time: number, fun: () => void, funThis: any) => void;
	static shake: (e: CharMonster, range: number, time: number, count: number, probability: number) => void;

	static urlRoot: string = ``;

	static get urlSkill(): string {
		return `${RES_DIR_SKILL}`;
	}

	static get urlSkillEff(): string {
		return `${RES_DIR_SKILLEFF}`;
	}

	static playConfigs(configs: SkillEffConfig[], param: EffParam) {

		if (!this.setTimeout) {
			console.warn(`SkillEffPlayer.setTimeout未设置`);
			return;
		}

		for (let i = 0; i < configs.length; i++) {

			let config: SkillEffConfig = configs[i];
			//初始化没有的值，且不修改源
			config = SkillEffConfig.initValue(config);

			this.setTimeout(config.delay / param.rate, () => {

				if (config.type > 50) {
					let typeFun = this[`type${config.type}`];
					if (typeFun) {
						typeFun.call(this, param, config);
					}
					return;
				}
				let mc: MovieClip = ObjectPool.pop(`MovieClip`);
				mc.rate = config.playSpeed * (config.isRate ? param.rate : 1);
				let fileName = SkillEffPlayer.urlSkillEff + config.effectId + (config.isDir ? DirUtil.get5DirBy8Dir(param.initParam.dir) : ``);
				mc.playFile(fileName + param.append, config.playCount, () => {
					this.removeMC(mc);
				});
				mc.x = config.x;
				mc.y = config.y;
				if (param.offset) {
					mc.x += param.offset.x;
					mc.y += param.offset.y;
				}
				if (typeof config.rotation == "string") {
					let str = config.rotation + "";
					let rots = str.split(`|`);
					let rotMin = +rots[0];
					let rotMax = +rots[1] - +rots[0];
					mc.rotation = Math.random() * rotMax + rotMin;
				}
				else {
					mc.rotation = config.rotation;
				}
				mc.scaleX = config.scaleX * (config.isDir ? DirUtil.isScaleX(param.initParam.dir) ? -1 : 1 : 1);
				mc.scaleY = config.scaleY;
				mc.alpha = config.alpha;
				mc.anchorOffsetX = config.cx;
				mc.anchorOffsetY = config.cy;
				let layer: number = config.layer;
				if (config.dirPos.length && config.dirPos[param.initParam.dir]) {
					let dirPos = config.dirPos[param.initParam.dir];
					if (!isNaN(dirPos.x))
						mc.x += dirPos.x;
					if (!isNaN(dirPos.y))
						mc.y += dirPos.y;
					if (!isNaN(dirPos.layer))
						layer = dirPos.layer;
					if (!isNaN(dirPos.rotation))
						mc.rotation += dirPos.rotation;
					if (!isNaN(dirPos.scaleX))
						mc.scaleX = dirPos.scaleX;
					if (!isNaN(dirPos.scaleY))
						mc.scaleY = dirPos.scaleY;
					if (!isNaN(dirPos.cx))
						mc.anchorOffsetX = dirPos.cx;
					if (!isNaN(dirPos.cy))
						mc.anchorOffsetY = dirPos.cy;
				}
				if (config.isRot && param.target) {
					let targetXY: XY = config.isInit ? {
						x: param.initParam.tar[0].x,
						y: param.initParam.tar[0].y
					} : param.target[0];
					let angle = MathUtils.getAngle(MathUtils.getRadian2(param.source.x, param.source.y, targetXY.x, targetXY.y));
					mc.rotation = angle + mc.rotation;
				}
				param.mc = mc;
				let layerFun = this[`layer${layer}`];
				if (layerFun) {
					layerFun.call(this, param);
				}

				let typeFun = this[`type${config.type}`];
				if (typeFun) {
					typeFun.call(this, param, config);
				}

				if (config.tween.length > 0) {
					let tw = egret.Tween.get(mc);
					for (let j = 0; j < config.tween.length; j += 2) {
						let to = config.tween[j];
						tw.to(to, config.tween[j + 1].time);
					}
				}
			}, this);
		}
	}

	/**
	 * 播放技能效果
	 * @param skillId   技能id
	 * @param source    施法者
	 * @param target    目标列表
	 * @param hitFun    命中回调
	 * @param rate      延时的除数
	 * @param append    特效名追加字符
	 */
	static play(skillId: string | number,
		source: CharMonster,
		target: CharMonster[] = [],
		hitFun: (probability: number) => void = null,
		rate: number = 1,
		offset: XY = null,
		append: string = ``) {

		let url = `${this.urlRoot}${this.urlSkill}${skillId}.json`;
		RES.getResByUrl(url, (configs) => {
			if (!configs) {
				console.log(`没有这个技能 -- ${skillId}`);
				return;
			}

			let param = new EffParam;
			param.initParam = { dir: source.dir, x: source.x, y: source.y, tar: [] };
			for (let i = 0; target && i < target.length; i++) {
				param.initParam.tar.push({ dir: target[i].dir, x: target[i].x, y: target[i].y });
			}
			param.source = source;
			param.target = target;
			param.hitFun = hitFun;
			param.rate = rate;
			param.offset = offset;
			param.append = append;

			this.playConfigs(configs, param);

		}, this, RES.ResourceItem.TYPE_JSON);
	}

	private static type1(param: EffParam, config: SkillEffConfig) {
		let target = param.target;
		let source = param.source;
		let mc = param.mc;
		let hitFun = param.hitFun;

		let targetXY: XY = config.isInit ? { x: param.initParam.tar[0].x, y: param.initParam.tar[0].y } : target[0];

		let t = egret.Tween.get(mc);

		let jl = config.dis || MathUtils.getDistanceByObject(source, targetXY);

		if (config.sDis) jl += config.sDis;

		let angle = MathUtils.getAngle(MathUtils.getRadian2(source.x, source.y, targetXY.x, targetXY.y)) + config.range;

		if (config.sDis) {
			let p2 = MathUtils.getDirMove(angle, config.sDis);
			mc.x += p2.x;
			mc.y += p2.y;
		}

		let p1 = MathUtils.getDirMove(angle, jl, mc.x, mc.y);
		t.to({ 'x': p1.x, 'y': p1.y }, jl / config.moveSpeed * 1000).call(() => {
			this.removeMC(mc);
			if (config.hit && hitFun)
				hitFun(config.probability);

			if (config.exEff)
				this.play(config.exEff, source, target, hitFun, 1, null, param.append);
		});
	}

	private static removeMC(mc: MovieClip) {
		mc.stop();
		mc.$getRenderNode().cleanBeforeRender();
		if (mc.parent)
			mc.parent.removeChild(mc);
		egret.Tween.removeTweens(mc);
		mc.rate = mc.alpha = mc.scaleX = mc.scaleY = 1;
		mc.anchorOffsetX = mc.anchorOffsetY = mc.rotation = mc.x = mc.y = 0;
		ObjectPool.push(mc);
	}

	private static type96(param: EffParam, config: SkillEffConfig) {
		if (!this.shake) {
			console.warn(`SkillEffPlayer.shake未设置`);
			return;
		}
		let source = param.source;
		this.shake(source, config.range, config.time, config.playCount, config.probability);
	}

	private static type97(param: EffParam, config: SkillEffConfig) {
		let target = param.target;
		let source = param.source;

		if (GameMap.fbType != 0) return;
		target[0].stopMove();
		let isMainRole = target[0] == EntityManager.ins().getNoDieRole();

		let jl = config.dis || MathUtils.getDistanceByObject(source, target[0]);
		let angle = MathUtils.getAngle(MathUtils.getRadian2(source.x, source.y, target[0].x, target[0].y));
		let p = MathUtils.getDirMove(angle, jl, target[0].x, target[0].y);
		let data: any = BresenhamLine.isAbleToThrough(
			GameMap.point2Grip(target[0].x),
			GameMap.point2Grip(target[0].y),
			GameMap.point2Grip(p.x),
			GameMap.point2Grip(p.y));
		if (data[0] == 0) {
			if (GameMap.point2Grip(target[0].x) == data[2] && GameMap.point2Grip(target[0].y) == data[3]) {
				p.x = target[0].x;
				p.y = target[0].y;
			} else {
				p.x = GameMap.grip2Point(data[2]);
				p.y = GameMap.grip2Point(data[3]);
			}
		}
		p.x = Math.max(Math.min(p.x, GameMap.MAX_WIDTH), 0);
		p.y = Math.max(Math.min(p.y, GameMap.MAX_HEIGHT), 0);

		jl = MathUtils.getDistanceByObject(target[0], p);
		if (jl <= 0) return;

		let t = egret.Tween.get(target[0].moveTweenObj);
		t.to({ 'x': p.x, 'y': p.y }, jl / config.moveSpeed * 1000);
	}

	private static type98(param: EffParam, config: SkillEffConfig) {
		let target = param.target;
		let source = param.source;

		if (GameMap.fbType != 0 || target == void 0)
			return;

		source.stopMove();
		let isMainRole = source == EntityManager.ins().getNoDieRole();

		let jl = config.dis || Math.max(MathUtils.getDistanceByObject(source, target[0]) - config.offsetDis);
		let angle = MathUtils.getAngle(MathUtils.getRadian2(source.x, source.y, target[0].x, target[0].y));
		let p = MathUtils.getDirMove(angle, jl, target[0].x, target[0].y);
		let data: any = BresenhamLine.isAbleToThrough(
			GameMap.point2Grip(target[0].x),
			GameMap.point2Grip(target[0].y),
			GameMap.point2Grip(p.x),
			GameMap.point2Grip(p.y));
		if (data[0] == 0) {
			if (GameMap.point2Grip(target[0].x) == data[2] && GameMap.point2Grip(target[0].y) == data[3]) {
				p.x = target[0].x;
				p.y = target[0].y;
			} else {
				p.x = GameMap.grip2Point(data[2]);
				p.y = GameMap.grip2Point(data[3]);
			}
		}
		p.x = Math.max(Math.min(p.x, GameMap.MAX_WIDTH), 0);
		p.y = Math.max(Math.min(p.y, GameMap.MAX_HEIGHT), 0);

		jl = MathUtils.getDistanceByObject(target[0], p);

		if (jl <= 0) {
			if (source.action == EntityAction.FLY) source.playAction(EntityAction.STAND);
			return
		};

		p = MathUtils.getDirMove(angle, jl, source.x, source.y);

		if (!GameMap.checkWalkableByPixel(p.x, p.y)) {
			if (source.action == EntityAction.FLY) source.playAction(EntityAction.STAND);
			return
		}

		let t: egret.Tween = egret.Tween.get(source.moveTweenObj);
		t.to({ 'x': p.x, 'y': p.y }, jl / config.moveSpeed * 1000);
		TimerManager.ins().doTimer(jl / config.moveSpeed * 1000, 1, () => {
			if (source.action == EntityAction.FLY) source.playAction(EntityAction.STAND);
		}, this)
	}

	private static type99(param: EffParam, config: SkillEffConfig) {
		let hitFun = param.hitFun;
		if (hitFun) hitFun(config.probability);
	}

	private static layer0(param: EffParam): void {
		let source = param.source;
		let mc = param.mc;
		mc.x += source.x;
		mc.y += source.y;
		if (!this.bottomLayer) {
			console.warn(`SkillEffPlayer.bottomLayer未设置`);
			return;
		}
		this.bottomLayer.addChild(mc);
	}

	private static layer1(param: EffParam): void {
		let source = param.source;
		let mc = param.mc;
		source.addChildAt(mc, 0);
	}

	private static layer2(param: EffParam): void {
		let source = param.source;
		let mc = param.mc;
		source.addChild(mc);
	}

	private static layer3(param: EffParam): void {
		let source = param.source;
		let mc = param.mc;
		mc.x += source.x;
		mc.y += source.y;
		if (!this.topLayer) {
			console.warn(`SkillEffPlayer.topLayer未设置`);
			return;
		}
		this.topLayer.addChild(mc);
	}

	private static layer4(param: EffParam): void {
		let target = param.target;
		let mc = param.mc;
		mc.x += target[0].x;
		mc.y += target[0].y;
		if (!this.bottomLayer) {
			console.warn(`SkillEffPlayer.bottomLayer未设置`);
			return;
		}
		this.bottomLayer.addChild(mc);
	}

	private static layer5(param: EffParam): void {
		let target = param.target;
		let mc = param.mc;
		target[0].addChildAt(mc, 0);
	}

	private static layer6(param: EffParam): void {
		let target = param.target;
		let mc = param.mc;
		target[0].addChild(mc);
	}

	private static layer7(param: EffParam): void {
		let target = param.target;
		let mc = param.mc;
		mc.x += target[0].x;
		mc.y += target[0].y;
		if (!this.topLayer) {
			console.warn(`SkillEffPlayer.topLayer未设置`);
			return;
		}
		this.topLayer.addChild(mc);
	}

	private static layer8(param: EffParam): void {
		if (!this.fixedLayer) {
			console.warn(`SkillEffPlayer.topLayer未设置`);
			return;
		}
		this.fixedLayer.addChild(param.mc);
	}
}

class EffParam {
	mc: MovieClip;
	source: CharMonster;
	target: CharMonster[];
	initParam: { dir: number, x: number, y: number, tar };
	hitFun: (probability: number) => void;
	append: string = ``;
	offset: XY;
	rate: number = 1;
}

class SkillEffConfig {
	/** 类型 */
	type: number = 0;
	/** 延时毫秒 */
	delay: number = 0;
	/** 层级 */
	layer: number = 3;
	/** 坐标x */
	x: number = 0;
	/** 坐标y */
	y: number = 0;
	/** 特效id */
	effectId: number = 0;
	/** 播放速度 */
	playSpeed: number = 1;
	/** 水平缩放 */
	scaleX: number = 1;
	/** 垂直缩放 */
	scaleY: number = 1;
	/** 旋转角度 */
	rotation: number = 0;
	/** 特效带方向 */
	isDir: number = 0;
	/** 移动速度 */
	moveSpeed: number = 100;
	/** 播放次数 */
	playCount: number = 1;
	/** 距离 */
	dis: number = 0;
	/** 开始距离 */
	sDis: number = 0;
	/** 偏移距离 */
	offsetDis: number = 0;
	/** 透明 */
	alpha: number = 1;
	/** 是否以目标点旋转 */
	isRot: number = 0;
	/** 完成后是否命中 */
	hit: number = 0;
	/** 中心点x */
	cx: number = 0;
	/** 中心点y */
	cy: number = 0;
	/** 幅度|角度 */
	range: number = 0;
	/** 持续时间 */
	time: number = 0;
	/** 攻速影响 */
	isRate: number = 0;
	/** 是否拿初始属性做计算 */
	isInit: number = 0;
	/** 概率*/
	probability: number = 1;
	/** 后续特效 */
	exEff: string = "";
	/** 随目标方向偏移的坐标 */
	dirPos: {
		x: number, y: number, layer: number,
		rotation: number, scaleX: number, scaleY: number
		cx: number, cy: number
	}[] = [];

	tween = [];

	static o = new SkillEffConfig();

	static initValue(config: SkillEffConfig): SkillEffConfig {
		config["__proto__"] = this.o;
		return config;
	}
}