/**
 *  怪物类
 * @author
 */
class CharMonster extends CharEffect implements IChar, IFilter {

	public AI_STATE: AI_State = AI_State.Stand;
	/** 称号 */
	protected _title: eui.Image;
	protected _titleMc: MovieClip;

	/** 文件名 */
	protected _fileName: string;

	protected _nameGroup: eui.Group;
	/** 名字显示 */
	protected _nameTxt: eui.Label;
	/** 血量条 */
	protected _hpBar: eui.ProgressBar;

	//滤镜效果
	protected _filters: EntityFilter[] = [];
	protected curFilter: EntityFilter;

	public publicCD: number = 0;

	/** 是否硬直中(不允许直接赋值，需要条用addHardStraight接口) */
	public isHardStraight: boolean;

	/** 技能效果列表 */
	public buffList: any;
	public buffEff: any;

	/** 特效列表 */
	private effs: any;

	/** 持续伤害计时器列表 */
	private damageOverTimeList: any;

	/** 是否攻击中 */
	public atking: boolean;

	/**下一次巡逻时间 */
	public nextPatrolTick: number = 0;

	public myKill: boolean = false;

	//用来死亡移除给当前目标添加 tween
	public dieTweenObj: { alpha: number, factor: number };
	public moveTweenObj: { x: number, y: number };

	/** 烈焰印记 */
	private _lyMark: LyMarkEffect;

	public constructor() {
		super();

		this.touchEnabled = true;
		this.touchChildren = false;

		this.buffList = {};
		this.buffEff = {};
		this.damageOverTimeList = {};
		this.createTweenObj();
		this.effs = {};

		let shadow = this.addMc(CharMcOrder.SHOWDOW, RES_DIR + "yingzi.png", 1);
		shadow.anchorOffsetX = 57 >> 1;
		shadow.anchorOffsetY = 37 >> 1;

		this._hpBar = new eui.ProgressBar();
		this._hpBar.skinName = "bloodBarSkin";
		this._hpBar.anchorOffsetY = 0;
		this._hpBar.labelDisplay.size = 14;
		this._hpBar.visible = false;
		this._hpBar.labelDisplay.visible = false;
		this._hpBar.labelFunction = () => '';
		this.titleCantainer.addChild(this._hpBar);

		this._nameGroup = new eui.Group();
		this._nameGroup.touchEnabled = false;
		this._nameGroup.height = 30;
		this._nameGroup.width = 260;
		// let layout = new eui.HorizontalLayout();
		// layout.gap = -6;
		// layout.horizontalAlign = egret.HorizontalAlign.CENTER;
		// layout.verticalAlign = egret.VerticalAlign.BOTTOM;
		// this._nameGroup.layout = layout;
		this._nameGroup.anchorOffsetY = Math.floor(this._nameGroup.height + 2);
		this._nameGroup.anchorOffsetX = Math.floor(this._nameGroup.width >> 1);
		this.titleCantainer.addChild(this._nameGroup);

		this._nameTxt = new eui.Label;
		// this._nameTxt.width = 200;
		// this._nameTxt.height = 30;
		this._nameTxt.textAlign = 'center';
		this._nameTxt.size = 14;
		this._nameTxt.stroke = 1;
		this._nameTxt.strokeColor = 0x000000;
		this._nameTxt.textColor = 0xeddea9;
		this._nameTxt.bottom = 0;
		this._nameTxt.horizontalCenter = 0;
		// this._nameTxt.anchorOffsetY = this._nameTxt.height + 2;
		// this._nameTxt.anchorOffsetX = this._nameTxt.width >> 1;
		// this._nameTxt.verticalAlign = "bottom";
		this._nameGroup.addChild(this._nameTxt);
		this._nameGroup.visible = false;
		//this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.monsterClick, this);
	}

	/**private monsterClick(e: egret.TouchEvent): void {
		if (!CityCC.ins().isCity && !BattleCC.ins().isBattle()) 
			return;

		if (!this.infoModel || this.infoModel.type != EntityType.Monster)
			return;

		GameLogic.ins().postChangeAttrPoint(this.infoModel.handle);
		e.stopImmediatePropagation();
	}**/

	private createTweenObj() {
		let self = this;
		this.dieTweenObj = {
			set alpha(al) {
				self.alpha = al;
			},
			get alpha() {
				return self.alpha;
			},
			factor: 0
		};

		this.moveTweenObj = {
			set x(x) {
				self.x = x;
			},
			set y(y) {
				self.y = y;
			},
			get x() {
				return self.x;
			},
			get y() {
				return self.y;
			}
		};
	}

	public get infoModel(): EntityModel {
		return this._infoModel as EntityModel;
	}

	public set infoModel(model: EntityModel) {
		this._infoModel = model;

		//烈焰戒指需要添加印记
		if (GlobalConfig.FlameStamp.monsterId.indexOf(model.configID) != -1) {
			if (!this._lyMark)
				this._lyMark = new LyMarkEffect(this._body, model);
		}
		else if (this._lyMark)
			this.clearLyMark();
	}

	public setCharName(str: string): void {
		this._nameTxt.textFlow = TextFlowMaker.generateTextFlow(str);
	}

	public setNameTxtColor(value: number) {
		this._nameTxt.textColor = value;
	}

	/** 使用了烈焰印记技能 */
	public usedLyMarkSkill(): void {
		if (this._lyMark)
			this._lyMark.usedLyMarkSkill();
	}

	/**
	 * 播放动作
	 * @action    动作常量EntityAction.ts
	 */
	public playAction(action: EntityAction, callBack?: () => void): void {
		let isAtkAction = this.isAtkAction();
		if (this._state == action && !isAtkAction && this.isPlaying)
			return;
		if (this.hasBuff(BUFF_GROUP.NUMB) && action != EntityAction.DIE) {
			// console.log("已石化中，不能播放其他动作");
			return;
		}
		if (action == EntityAction.HIT || action == EntityAction.DIE) {
			if (this.infoModel.type == EntityType.Monster &&
				GlobalConfig.MonstersConfig[this.infoModel.configID] &&
				GlobalConfig.MonstersConfig[this.infoModel.configID].type == 4) {
				//烈焰戒指无受击与死亡特效
				return;
			}
		}
		super.playAction(action, callBack);
	}

	public stopMove(): void {
		//停止移动 坐标取整，解决血条变暗问题
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		egret.Tween.removeTweens(this.moveTweenObj);
	}

	public get dir(): number {
		if (this.infoModel) {
			let d = this.infoModel.getDir();
			return d < 0 ? this._dir : d;
		}
		return this._dir;
	}

	public set dir(value: number) {
		if (this._dir == value || this.hasBuff(BUFF_GROUP.NUMB))
			return;
		if (this._state == EntityAction.DIE) {
			return;
		}

		this._dir = value;
		this.loadBody();
	}

	public get action(): EntityAction {
		return this._state;
	}

	/** 慎用（一般使用playAction） */
	public set action(value: EntityAction) {
		if (this._state == EntityAction.DIE) return;
		this._state = value;
	}

	//怪物只有两个方向
	public getResDir(mcType?: CharMcOrder): number {
		let td: number = 2 * (this._dir - 4);
		if (td < 0) td = 0;
		let dir = this._dir - td;
		if (this.infoModel && this.infoModel.dirNum != 2) {
			return dir;
		}
		if (dir < 2) {
			return 1;
		} else {
			return 3;
		}
	}

	public get moveSpeed(): number {
		if (!this.infoModel)
			return 0;
		return this.infoModel.getAtt(AttributeType.atMoveSpeed) / 1000 * GameMap.CELL_SIZE;
	}

	public hram(value: number): void {
		this._hpBar.value = Math.min(this._hpBar.value - value, this.infoModel.getAtt(AttributeType.atMaxHp));
		// if (this.team != Team.My && this instanceof CharRole) {
		// 	console.log(2,this.infoModel.handle,"扣血：",value,"剩余血量：",this._hpBar.value,)
		// }
	}

	public set x(x) {
		x = x >> 0;
		egret.superSetter(CharMonster, this, 'x', x);
	}

	public get x() {
		return egret.superGetter(CharMonster, this, 'x');
	}

	public set y(y) {
		y = y >> 0;
		egret.superSetter(CharMonster, this, 'y', y);
	}

	public get y() {
		return egret.superGetter(CharMonster, this, 'y');
	}

	public set anchorOffsetX(x) {
		x = x >> 0;
		egret.superSetter(CharMonster, this, 'anchorOffsetX', x);
	}

	public get anchorOffsetX() {
		return egret.superGetter(CharMonster, this, 'anchorOffsetX');
	}

	public set anchorOffsetY(y) {
		y = y >> 0;
		egret.superSetter(CharMonster, this, 'anchorOffsetY', y);
	}

	public get anchorOffsetY() {
		return egret.superGetter(CharMonster, this, 'anchorOffsetY');
	}

	public getHP(): number {
		return this._hpBar.value;
	}

	public getRealHp(): number {
		return this.infoModel.getAtt(AttributeType.atHp);
	}

	public reset(): void {
		this._state = EntityAction.STAND;
		this.dir = 3;
		this._hpBar.slideDuration = 500;
		this.myKill = false;
		this.removeAllFilters();
	}

	public destruct(): void {
		//this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.monsterClick, this);
		this.deadDelay();
		this.removeAll();
		this.alpha = 1;
		this.AI_STATE = AI_State.Patrol;
		this._nameTxt.textColor = 0xeddea9;
		this._body.dispose();
		//烈焰印记
		this.clearLyMark();
		this.removeAllEffect();
		this.removeAllFilters();
		//MessageCenter.ins().removeAll(this);
		TimerManager.ins().removeAll(this);
		this.stopMove();
		DisplayUtils.removeFromParent(this);
		ObjectPool.push(this);
	}

	public deadDelay(): void {
		this._hpBar.slideDuration = 0;
		this._hpBar.value = 0;
		//屏蔽原因：当死亡资源没有加载时候，会出现死亡时候玩家死亡特效未播放完就stop，然后因为body移除了事件，导致武器播放的不是死亡特效，屏蔽后并不会造成内存泄漏等问题
		// this._body.stop();
		// this._body.removeEventListener(egret.Event.CHANGE, this.playBody, this);

		this.removeHardStraight();
		for (let i in this.damageOverTimeList) {
			let element: egret.Timer = this.damageOverTimeList[i];
			this.deleteDamageOverTimer(element);
		}
		this.removeAllBuff();
		this.atking = false;
		if (this.haloMc) {
			DisplayUtils.removeFromParent(this.haloMc);
		}
	}


	//清理烈焰印记
	private clearLyMark(): void {
		if (this._lyMark) {
			this._lyMark.destruct();
			this._lyMark = null;
		}
	}

	/** 设置硬直时间 */
	public addHardStraight(time: number): void {
		this.isHardStraight = true;
		TimerManager.ins().doTimer(time, 1, this.removeHardStraight, this);
	}

	public removeHardStraight(): void {
		this.isHardStraight = false;
	}

	/**
	 * 设置主体动画
	 * @param str 文件名
	 */
	public initBody(fileName?: string): void {
		this.addMc(CharMcOrder.BODY, fileName);
	}

	public get isPlaying(): boolean {
		return this._body.isPlaying;
	}

	public isAtkAction(): boolean {
		return this._state == EntityAction.ATTACK || this._state == EntityAction.CAST;
	}

	protected playBody(e: egret.Event): void {
		super.playBody(e);
		this._hpBar.anchorOffsetX = (this._hpBar.width >> 1);
	}

	public resetStand(): void {
		if (!this.isAtkAction())
			return;
		this.playAction(EntityAction.STAND);
	}

	public hasEffById(id: number): boolean {
		if (this.effs && this.effs[id]) {
			return true;
		}
		return false;
	}

	/**
	 * 更新数据显示
	 */
	public updateBlood(force: boolean = false): void {
		if (!this.infoModel)
			return;
		this._hpBar.maximum = this.infoModel.getAtt(AttributeType.atMaxHp);
		//只有不再追血令的时候才可以更新当前血量
		if (force || !(EntityManager.ins().getTeamCount(Team.WillEntity) > 0 && GameMap.fubenID == 0)) {
			this._hpBar.value = this.infoModel.getAtt(AttributeType.atHp);
		}
	}

	/**
	 * 坑爹的策划需求，人行怪加上称号
	 */
	public updateTitle(): void {
		let model = this.infoModel;
		let config = GlobalConfig.MonstersConfig[model.configID];
		let title: number = config && config['titleId'];
		this.removeTitle();
		if (title && title > 0) {
			let config = GlobalConfig.MonsterTitleConf[title];
			if (config) {
				if (config.img) {
					if (this._title == null) {
						this._title = new eui.Image;
						this._title.anchorOffsetX = 230 >> 1;
						this.titleCantainer.addChild(this._title);
					}

					if (config.anchorOffsetY) {
						this._title.anchorOffsetY = config.anchorOffsetY;
					} else {
						this._title.anchorOffsetY = 100;
					}

					this._title.source = config.img;
				} else if (config.eff) {
					if (this._titleMc == null) {
						this._titleMc = ObjectPool.pop("MovieClip");
						this._titleMc.anchorOffsetX = 0;
						this.titleCantainer.addChild(this._titleMc);
					}

					this._titleMc.playFile(RES_DIR_EFF + config.eff, -1);

					if (config.anchorOffsetY) {
						this._titleMc.anchorOffsetY = config.anchorOffsetY;
					} else {
						this._titleMc.anchorOffsetY = 80;
					}
				}
			}
		}
	}

	protected removeTitle() {
		if (this._title) this._title.source = '';
		if (this._titleMc) {
			this._titleMc.destroy();
			this._titleMc = null;
		}
	}

	/**
	 * 死亡处理（表现方面）
	 * @returns void
	 */
	public onDead(callBack?: () => void): void {
		this.stopMove();
		this.showBlood(false);
		this.showName(false);
		this.removeTitle();
		this.playAction(EntityAction.DIE);
		if (callBack) {
			callBack();
		}
	}

	public get isCanAddBlood(): boolean {
		return this._hpBar.value / this._hpBar.maximum < 0.8;
	}

	/** 持续伤害 */
	private damageOverTime(e?: any): void {
		let timer: egret.Timer = e instanceof egret.Timer ? e : e.currentTarget;

		if (timer.currentCount == timer.repeatCount) {
			this.deleteDamageOverTimer(timer);
		}
	}

	private deleteDamageOverTimer(timer: egret.Timer): void {
		for (let i in this.damageOverTimeList) {
			if (this.damageOverTimeList[i] == timer) {
				delete this.damageOverTimeList[i];
				timer.stop();
				timer.removeEventListener(egret.TimerEvent.TIMER, this.damageOverTime, this);
			}
		}
	}

	public addEffect(effID: number): void {
		let config: EffectConfig = GlobalConfig.EffectConfig[effID];
		if (!config)
			return;
		if (config.type == 0) {
			let image: eui.Image = new eui.Image();
			image.source = config.fileName;
			this.addChild(image);
			let t: egret.Tween = egret.Tween.get(image);
			image.x = image.x - 23;
			t.to({ y: -100 }, 2000).call(() => {
				DisplayUtils.removeFromParent(image)
			});
			return;
		}
		let mc: MovieClip = this.effs[effID] || ObjectPool.pop(`MovieClip`);
		mc.playFile(RES_DIR_SKILLEFF + config.fileName);
		this.addChild(mc);
		this.effs[effID] = mc;
	}

	private haloMc: MovieClip;

	public addHalo(str: string): void {
		this.haloMc = this.haloMc ? this.haloMc : ObjectPool.pop(`MovieClip`);
		this.haloMc.playFile(RES_DIR_EFF + str, -1);
		this.addChildAt(this.haloMc, 0);
	}

	public removeEffect(effID: number): void {
		let config: EffectConfig = GlobalConfig.EffectConfig[effID];
		if (!config)
			return;

		if (config.type == 0)
			return;

		let mc: MovieClip = this.effs[effID];
		if (!mc)
			return;
		if (mc instanceof MovieClip) mc.destroy();
		delete this.effs[effID];
	}

	public removeAllEffect() {
		for (let effId in this.effs) {
			let mc: MovieClip = this.effs[effId];
			if (mc && mc instanceof MovieClip) {
				mc.destroy();
			}
		}
		this.effs = {};
	}

	public hasBuff(groupID: number): boolean {
		return !!this.buffList[groupID];
	}

	public addBuff(buff: EntityBuff): void {
		let config: EffectsConfig = buff.effConfig;
		let groupID: number = config.group;

		if (this.buffList[groupID])
			this.removeBuff(this.buffList[groupID]);

		this.buffList[groupID] = buff;

		if (config.effName) {
			let mc: MovieClip = this.buffEff[groupID] || ObjectPool.pop(`MovieClip`);
			mc.playFile(RES_DIR_SKILLEFF + config.effName, -1);
			this.addChild(mc);
			this.buffEff[groupID] = mc;
		}
		if (config.effID) {
			this.addEffect(config.effID);
		}

		if (buff.effConfig.type == SkillEffType.AdditionalState) {
			if (buff.effConfig.args && buff.effConfig.args.i == 9) {//冰冻
				let holdTime: number = buff.effConfig.duration;
				this.addHardStraight(holdTime);
			}
		}

		//中毒
		if (groupID == BUFF_GROUP.POISON) {
			this.addFilter(EntityFilter.poison);
		}
		//添加石化
		if (groupID == BUFF_GROUP.NUMB) {
			this.addFilter(EntityFilter.hard);
		}
	}

	public removeBuff(buff: EntityBuff): void {
		let config: EffectsConfig = buff.effConfig;
		let groupID: number = config.group;
		if (this.buffList[groupID] == buff) {
			buff.dispose();
			ObjectPool.push(this.buffList[groupID]);
			delete this.buffList[groupID];

			if (this.buffEff[groupID]) {
				DisplayUtils.removeFromParent(this.buffEff[groupID]);
				delete this.buffEff[groupID];
			}

			if (config.effID) {
				this.removeEffect(config.effID);
			}

			//移除联合buff
			if (config.unionBuff) {
				let union = this.buffList[config.unionBuff];
				if (union) this.removeBuff(union);
			}
		}

		//移除石化
		if (groupID == BUFF_GROUP.NUMB) {
			this.removeFilter(EntityFilter.hard);
		}

		//移除中毒
		if (groupID == BUFF_GROUP.POISON) {
			this.removeFilter(EntityFilter.poison);
		}
	}

	public removeAllBuff(): void {
		for (let i in this.buffList)
			this.removeBuff(this.buffList[i]);
	}

	private paoPao: PaoPaoView;

	public addPaoPao(paoID: number): void {
		if (!this.paoPao) {
			this.paoPao = new PaoPaoView();
			this.addChildAt(this.paoPao, 100);
			this.paoPao.open();
		}
		this.paoPao.anchorOffsetY = this.myHeight + 70;
		this.paoPao.anchorOffsetX = 46;
		let job: number = (this.infoModel as Role).job;
		this.paoPao.setSpeak(paoID, job);
	}

	public get team(): Team {
		return this._infoModel.team;
	}

	public startPatrol() {
		if (TimerManager.ins().getCurrTime() > this.nextPatrolTick) {
			let p = this.getPointCanMove();
			if (p) {
				GameMap.moveEntity(this, p.x, p.y);
				this.nextPatrolTick = TimerManager.ins().getCurrTime() + MathUtils.limit(this.moveLimTime, this.moveMaxTime);
			}
		}
	}

	public moveRange: number = -1;
	public moveLimTime: number = -1;
	public moveMaxTime: number = -1;

	public setMoveAtt(para: any): void {
		this.moveRange = para[0];
		this.moveLimTime = para[1][0];
		this.moveMaxTime = para[1][1];
	}

	private getPointCanMove(): { x: number, y: number } {
		let count: number = 0;
		let X: number = 0;
		let Y: number = 0;
		let range: number = this.moveRange;
		let p: egret.Point;
		while (count < 100) {
			let X: number = MathUtils.limit((this.x - range) >> 0, (this.x + range) >> 0);
			let Y: number = MathUtils.limit((this.y - range) >> 0, (this.y + range) >> 0);
			if (GameMap.checkWalkableByPixel(X, Y)) {
				p = new egret.Point;
				p.x = X;
				p.y = Y;
				break;
			}
			count++;
		}
		return p;
	}

	protected playCount(): number {
		return this._state == EntityAction.RUN || this._state == EntityAction.STAND ? -1 : 1
	}

	// public shakeIt(): void {
	// 	if (this.action != EntityAction.STAND && this.action != EntityAction.HIT)
	// 		return;
	// 	DisplayUtils.shakeItEntity(this, 3, 200, 1);
	// 	//移动速度为0的视为木桩怪，木桩怪没有Hit
	// 	if (this.moveSpeed) {
	// 		this.playAction(EntityAction.HIT, () => {
	// 			this.playAction(EntityAction.STAND);
	// 		});
	// 	}
	// }

	public showName(b: boolean): void {
		this._nameGroup.visible = b;
	}

	public showBlood(b: boolean): void {
		//神兽不显示血条
		if (b && this.infoModel && this.infoModel.name == `神兽`) {
			return;
		}
		this._hpBar.visible = b;
	}

	public get isMy(): boolean {
		return this.infoModel.isMy;
	}

	//层级优化
	public get weight() {
		if (this._infoModel && this.team == Team.My && this instanceof CharRole) {
			return this.y + 32;//半个格子 GameMap.CELL_SIZE>>1
		}
		return this.y;
	}

	public updateModel(): void {
		this.removeAll();
		(<eui.Image>this._hpBar.thumb).source = this.isMy ? "boolGreen_png" : "boolRed_png";
	}

	/** 添加石化、中毒滤镜 */
	addFilter(filter: EntityFilter): void {
		EntityFilterMgr.addFilter(this, filter);
	}

	removeFilter(filter: EntityFilter): void {
		EntityFilterMgr.removeFilter(this, filter);


		//石化或者中毒状态如果还在，则继续表现当前的状态
		if (this.hasBuff(BUFF_GROUP.NUMB)) this.addFilter(EntityFilter.hard);
		else if (this.hasBuff(BUFF_GROUP.POISON)) this.addFilter(EntityFilter.poison);
	}

	hasFilter(filter: EntityFilter): boolean {
		return this.getFilters().indexOf(filter) >= 0;
	}

	setFilter(filter: EntityFilter): void {
		// if (filter) {
		// 	this._bodyContainer.filters = EntityFilterMgr.buffFilter[filter].filters;
		// 	if (filter == EntityFilter.hard) {
		// 		for (let mcType of this.hasDir) {
		// 			let mc = this.getMc(mcType) as MovieClip;
		// 			if (mc) mc.stop();
		// 		}
		// 	} else {
		// 		for (let mcType of this.hasDir) {
		// 			let mc = this.getMc(mcType) as MovieClip;
		// 			if (mc) mc.play();
		// 		}
		// 	}
		// } else {
		// 	this._bodyContainer.filters = null;
		// 	for (let mcType of this.hasDir) {
		// 		let mc = this.getMc(mcType) as MovieClip;
		// 		if (mc) mc.play();
		// 	}
		// }
		this.curFilter = filter;
		if (filter) {
			this.setMcFilter(filter);
			if (filter == EntityFilter.hard) {
				this.setMcFilterPlayOrStop(false);
			} else {
				this.setMcFilterPlayOrStop(true);
			}
		} else {
			this.setMcFilter(filter);
			this.setMcFilterPlayOrStop(true);
		}
	}

	getFilters(): EntityFilter[] {
		return this._filters;
	}

	protected setMcFilter(filter: EntityFilter) {
		if (egret.Capabilities.renderMode != 'webgl') return;
		for (let mcType in this._disOrder) {
			if (+(mcType) != CharMcOrder.ZHANLING) {
				let mc = this._disOrder[mcType];
				mc.filters = filter ? EntityFilterMgr.buffFilter[filter].filters : null;
			}
		}
	}

	protected setMcFilterPlayOrStop(play: boolean) {
		for (let mcType of this.hasDir) {
			if (mcType == CharMcOrder.ZHANLING) continue;
			let mc = this.getMc(mcType) as MovieClip;
			if (mc) {
				if (play)
					mc.play();
				else
					mc.stop();
			}
		}
	}

	removeAllFilters(): void {
		this._filters.length = 0;
		this._bodyContainer.filters = null;
	}

	public doHitAction() {
		if ((this.action != EntityAction.RUN && this.action != EntityAction.DIE && !this.infoModel.effect && !this.infoModel.avatarEffect) && MathUtils.limitInteger(0, 100) < 15) {
			this.playAction(EntityAction.HIT, () => { this.playAction(EntityAction.STAND) });
		}
	}
}
