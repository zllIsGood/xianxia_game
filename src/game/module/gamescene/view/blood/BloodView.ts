/**
 *  飘血显示层
 * @author
 */
class BloodView extends egret.DisplayObjectContainer {

	// private bloodpPool: ObjectPool; //飘血对象池
	// private missPool: ObjectPool;   //抵挡对象池
	private offY: number = 0;
	private offsetY: number = 0;
	private _lastType: number = 0;
	public constructor() {
		super();
		MessageCenter.addListener(GameLogic.ins().postEntityHpChange, this.showBlood, this);
	}

	/**
	 * 飘血显示
	 * @param target    飘血目标
	 * @param source    伤害源
	 * @param type      0不显示，1命中，2暴击
	 * @param value     伤害值
	 */
	private showBlood(param: Array<any>): void {
		let target = param[0];
		let source = param[1];
		let type = param[2];
		let value = param[3];
		// let skill = param[4];
		// let isFs = param[5];
		if (!target || !source) return;
		// if (!source) return;
		if (target['team'] != Team.My && source != null && source['team'] != Team.My)
			return;

		//威慑
		let isDeter = type & DamageTypes.Deter && source.isMy;
		let isCrit = type & DamageTypes.CRIT && !(isDeter && type == DamageTypes.CRIT);
		let isLucky = type & DamageTypes.Lucky;
		let isHeji = type & DamageTypes.Heji;
		let isMiss = type & DamageTypes.Dodge;
		let isHuanShou = false;//幻兽
		let isZhiMing = type & DamageTypes.ZhiMing;

		if (isZhiMing) isCrit = false;//致命就不显示暴击

		this.offY = EntityManager.CHAR_DEFAULT_TYPEFACE - target.typeface;
		if (this._lastType != type) this.offsetY = 0;
		this._lastType = type;

		if (value == 0 && !isMiss)
			return;

		let chartype: string;
		if (source instanceof CharRole) {
			switch ((<Role>source.infoModel).job) {
				case JobConst.ZhanShi:
					chartype = "fnt_zhanshi";
					break;
				case JobConst.FaShi:
					chartype = "fnt_fashi";
					break;
				case JobConst.DaoShi:
					chartype = "fnt_shushi";
					break;
			}
		} else if (source instanceof CharMonster) {
			chartype = "fnt_shushi";
			//烈焰戒指伤害,戒指类型怪物，用特殊伤害飘字，为止开放了怪物配置的type类型客户端读取，
			//综合评估了下配置增加的体积与功能的扩展和修改幅度，最终决定用这种方法判断... 2017-11-27 MPeter
			let monsterCfg = GlobalConfig.MonstersConfig[source.infoModel.configID];
			if (monsterCfg && monsterCfg.type == MonsterType.Ring) {
				chartype = "fnt_zhanshi";
			}
			if (source.infoModel.type == EntityType.HuanShouMonster) {
				isHuanShou = true;
			}

		} else if (isMiss) {
			//除了上面的情况，其他是不会有闪避的
			return;
		}
		if (source == null) {
			//毒
			chartype = "fnt_shushi";
		}
		if (isHeji || isLucky) {
			if (isMiss) {
				//这个是不会有闪避的
				return;
			}
			chartype = "fnt_bisha";
		}
		//2为角色掉血，其它为伤害
		let numType: string = target['team'] == Team.My ? "fnt_shanghai" : chartype;

		let sv: string = "";
		if (isMiss) {
			sv = "s";
		}
		else if (isHeji && target['team'] != Team.My) {
			sv = value < 0 ? "+" + Math.abs(value) : "p" + (value >> 0) + "";
		} else if (target['team'] != Team.My) {
			if (value < 0)
				sv = "+";
			else if (isCrit || isLucky)
				sv = "c";
			else if (isDeter)
				sv = "d"
			else if (isZhiMing)
				sv = "z";

			sv += Math.abs(value) >> 0;
			//旧的处理，保留
			// sv = value < 0 ? "+" + Math.abs(value) : (isCrit ? "c" : (isDeter ? "d" : (isLucky ? "c" : ""))) + (value >> 0) + "";
		} else {
			sv = value < 0 ? "+" + Math.abs(value) : "" + Math.abs(value);
		}

		let st: string = value < 0 ? "fnt_zhiliao" : numType; //+ (isCrit ? "b" : "");
		((type & DamageTypes.Fujia) || (type & DamageTypes.Lianji)) ? this.offsetY += 25 : this.offsetY = 0;

		let exSign: string;
		if (isHuanShou) {
			exSign = `hs_attack`
		}

		//改为原来的接口创建飘血字体。因为直接从对象池创建出来(ObjectPool.pop("eui.BitmapLabel");)，销毁的逻辑并没有放回对象池(原代码)。有问题
		let offsetX = (`${st}_fnt` == 'fnt_shanghai_fnt' || `${st}_fnt` == `fnt_zhiliao_fnt`) ? -1 : 3;
		offsetX = type & DamageTypes.Heji ? -3 : offsetX;
		let blood = BitmapNumber.ins().createNumPicWithFullName(sv, st, offsetX, this.offsetY);
		if (type & DamageTypes.Heji) {
			this.addChildAt(blood, 1000);
		} else {
			this.addChild(blood);
		}

		// blood.x = target.x - blood.width / 2;
		// blood.y = target.y - 50 - offsety;
		let isAddBlood = value < 0;
		if (chartype == "fnt_shushi") {
			//如果是毒，被施放于怪物身上，则视为加血，飘毒血为向上飘
			isAddBlood = true;
		}
		this.floatImg(blood, type, target, source, isAddBlood);
	}

	//攻击类型1:普通伤害, 2暴击伤害
	public static TYPE: number = 0;

	/**
	 * 漂浮
	 * @param blood  飘血
	 * @param type DamageTypes
	 * @param target    飘血目标-
	 * @param source    伤害源
	 * @param isAddBlood  伤害源
	 */
	private floatImg(blood: eui.BitmapLabel, type: DamageTypes, target: CharRole, source: CharMonster, isAddBlood?: boolean): void {
		let t: egret.Tween = egret.Tween.get(blood);
		if (source == null || target['team'] == Team.My) {
			blood.x = target.x - blood.width / 2;
			blood.y = target.y - 50 - this.offsetY;
			blood.scaleX = blood.scaleY = 1;
			if (type == DamageTypes.CRIT
				|| type == DamageTypes.Lucky
				|| type == DamageTypes.ZhiMing
			) {
				blood.scaleX = blood.scaleY = BloodView.sc_s0;
				let posY1 = blood.y - (EntityManager.CHAR_DEFAULT_TYPEFACE - 80) / 2;
				let posY2 = blood.y - (EntityManager.CHAR_DEFAULT_TYPEFACE - 30);

				blood.y = posY1;
				t.to({
					"y": posY2,
					'scaleX': BloodView.sc_s1,
					'scaleY': BloodView.sc_s1
				}, BloodView.sc_sp1, BloodView.sc_fun1)
					.wait(BloodView.sc_sp2)
					.to({
						alpha: 0,
						'scaleX': BloodView.sc_s2,
						'scaleY': BloodView.sc_s2
					}, BloodView.sc_sp3, BloodView.sc_fun2)
					.call(this.removeFloatTarget, this, [blood]);
			} else {
				blood.scaleX = blood.scaleY = 0.6
				let posY1 = blood.y - (EntityManager.CHAR_DEFAULT_TYPEFACE - 80) / 2;
				let posY2 = blood.y - (EntityManager.CHAR_DEFAULT_TYPEFACE - 30);

				blood.y = posY1;
				t.to({
					"y": posY2,
					'scaleX': .8,
					'scaleY': .8,
				}, BloodView.sn_sp1, BloodView.sn_fun1)
					.wait(BloodView.sn_sp2)
					.to({
						alpha: 0,
						'scaleX': .8,
						'scaleY': .8
					}, BloodView.sn_sp3, BloodView.sn_fun2)
					.call(this.removeFloatTarget, this, [blood]);
			}
		} else {
			let isDeter: boolean = (type & DamageTypes.Deter) && source && source.isMy; // 威慑
			let showBigDater: boolean = (type & DamageTypes.CRIT) && isDeter; //显示威慑(大字)
			if (showBigDater || (type & DamageTypes.CRIT) || (type & DamageTypes.Lucky)) {
				this.playMainRoleBaoAttack(blood, source, target);
			} else if (type & DamageTypes.Heji) {
				this.playPunckAttack(blood, source, target);
			} else {
				this.playMainRoleNormalAttack(blood, source, target);
			}
		}
	}

	private static destroyBlood(blood: eui.BitmapLabel) {
		BitmapNumber.ins().desstroyNumPic(blood);
	}


	/**
	 * 播放主角普通攻击飘血
	 * @param  {eui.BitmapLabel} blood
	 * @param  {CharEffect} attackEntity
	 * @param  {CharEffect} targetEntity
	 * @returns void
	 */
	private playMainRoleNormalAttack(blood: eui.BitmapLabel, attackEntity: CharEffect, targetEntity: CharEffect): void {
		let fromX: number = targetEntity.x;
		let fromY: number = targetEntity.y - 90;
		let dir: number = DirUtil.get8DirBy2Point(attackEntity, targetEntity);
		let sign: number = dir < 4 ? 1 : -1;
		let tempX1: number = fromX + sign * MathUtils.limitInteger(60, 100);
		let tempY1: number = fromY - MathUtils.limitInteger(40, 80);

		let toX: number = tempX1 + sign * MathUtils.limitInteger(100, 160);
		let toY: number = tempY1 - MathUtils.limitInteger(70, 120);
		let time: number = MathUtils.limitInteger(800, 1200);

		let scaleX: number = 1;
		let scaleY: number = 1;

		blood.x = fromX;
		blood.y = fromY;
		blood.scaleX = blood.scaleY = .7;
		blood.alpha = 0;

		let tween: egret.Tween = egret.Tween.get(blood);
		tween.to({ scaleX: scaleX, scaleY: scaleY, x: tempX1, y: tempY1, alpha: 1 }, 100)//变大
			.wait(50)
			.to({ scaleX: .7, scaleY: .7 }, 200)//变小
			.wait(360)//停顿一小会
			.to({ x: toX, y: toY, alpha: 0.3 }, time, egret.Ease.quadOut)
			.to({ alpha: 0 }, 200)
			.call(this.removeFloatTarget, this, [blood]);
	}

	/**
	 * 播放主角暴击飘血
	 * @param  {CharEffect} attackEntity
	 * @param  {CharEffect} targetEntity
	 */
	private playMainRoleBaoAttack(blood: eui.BitmapLabel, attackEntity: CharEffect, targetEntity: CharEffect) {
		let distance: number = 190;
		let duration: number = 1500;

		let fromX: number = targetEntity.x + MathUtils.limitInteger(-20, 20);
		let fromY: number = targetEntity.y + MathUtils.limitInteger(-20, 20);

		let endPt: egret.Point = DirUtil.getExtendPoint2(attackEntity.x, attackEntity.y, fromX, fromY, distance, true);
		let toX: number = endPt.x;
		let toY: number = endPt.y;

		blood.x = fromX;
		blood.y = fromY;

		let tween = egret.Tween.get(blood);
		tween.to({ scaleX: 2.5, scaleY: 2.5 }, 100)
			.to({ scaleX: 1, scaleY: 1 }, 150)
			.to({ x: toX, y: toY, alpha: 0 }, duration)
			.call(this.removeFloatTarget, this, [blood]);
	}

	/**
	 * 播放合击大招
	 * @param  {eui.BitmapLabel} blood
	 * @param  {CharEffect} attackEntity
	 * @returns void
	 */
	private playPunckAttack(blood: eui.BitmapLabel, attackEntity: CharEffect, targetEntity: CharEffect): void {
		//获取舞台基准点
		let sign = Math.random() > .6 ? 1 : -1;
		let fromX = StageUtils.ins().getWidth() / 2 - blood.width / 2 + sign * MathUtils.limitInteger(0, 50);
		let fromY = MathUtils.limitInteger(180, 400);
		let map: MapView = ViewManager.gamescene.map;
		let p = map.globalToLocal(fromX, fromY);
		blood.x = p.x;
		blood.y = p.y;
		blood.scaleX = blood.scaleY = 2.5;
		let tempX = blood.x + MathUtils.limitInteger(20, 30);
		let tempY = blood.y - MathUtils.limitInteger(5, 10);
		let toX = tempX + MathUtils.limitInteger(70, 100);
		let toY = tempY - MathUtils.limitInteger(20, 25);
		let tween = egret.Tween.get(blood);
		tween.to({ scaleX: 1.2, scaleY: 1.2 }, 100)
			.to({ x: tempX, y: tempY }, 1000)
			.to({ x: toX, y: toY, alpha: 0 }, 1000)
			.call(this.removeFloatTarget, this, [blood]);
	}

	private removeFloatTarget(floatTarger: eui.BitmapLabel) {
		DisplayUtils.removeFromParent(floatTarger);
		BloodView.destroyBlood(floatTarger);
	}

	public static sp1: number = 60;
	public static sp2: number = 80;
	public static sp3: number = 80;
	public static sp4: number = 400;
	public static sp5: number = 720;

	public static fun1: Function = egret.Ease.circInOut;
	public static fun2: Function = egret.Ease.circInOut;
	public static fun3: Function = egret.Ease.sineIn;
	public static fun4: Function = null;
	public static fun5: Function = egret.Ease.sineIn;

	public static s0: number = 1.2;
	public static s1: number = 0.4;
	public static s2: number = 0.75;
	public static s3: number = 0.6;
	public static s4: number = 0.6;
	public static s5: number = 0.6;


	public static posX6: number = -18;
	public static posX7: number = -20;
	public static posX8: number = -23;
	public static posX9: number = -30;


	public static posY6: number = 10;
	public static posY7: number = 13;
	public static posY8: number = 16;
	public static posY9: number = 20;

	public static alpha6: number = 0.6;
	public static alpha7: number = 0.5;
	public static alpha8: number = 0.4;
	public static alpha9: number = 0;

	public static sp6: number = 600;
	public static sp7: number = 200;
	public static sp8: number = 400;
	public static sp9: number = 400;

	public static fun6: Function = null;
	public static fun7: Function = null;
	public static fun8: Function = null;
	public static fun9: Function = null;


	public static s6: number = 0.6;
	public static s7: number = 0.6;
	public static s8: number = 0.6;
	public static s9: number = 0.6;

	public static posX1: number = 90;
	public static posX2: number = 0;
	public static posX3: number = 0;

	public static posY1: number = 100;
	public static posY2: number = 0;
	public static posY3: number = 0;
	public static posY4: number = 10;

	public static alpha0: number = 1;
	public static alpha1: number = 1;
	public static alpha2: number = 1;
	public static alpha3: number = 0.9;
	public static alpha4: number = 0.5;
	public static alpha5: number = 0;

	public static startX: number = 70;
	public static startY: number = 75;
	public static changeTime1: number = 300;
	public static changeTime2: number = 1000;
	public static changeY: number = 0.5;
	public static bigScale: number = 3;
	public static endScale: number = 0.6;
	public static bigAlpha: number = 1;
	public static endAlpha1: number = 1;
	public static endAlpha2: number = 0.3;
	public static endTime1: number = 600;
	public static endTime2: number = 500;

	public static c_sp1: number = 80;
	public static c_sp2: number = 200;
	public static c_sp3: number = 200;
	public static c_sp4: number = 1000;
	public static c_sp5: number = 1200;

	public static c_fun1: Function = egret.Ease.circInOut;
	public static c_fun2: Function = egret.Ease.circInOut;
	public static c_fun3: Function = egret.Ease.sineIn;
	public static c_fun4: Function = null;
	public static c_fun5: Function = egret.Ease.sineIn;

	public static c_s0: number = 0.1;
	public static c_s1: number = 0.8;
	public static c_s2: number = 0.8;
	public static c_s3: number = 0.8;
	public static c_s4: number = 0.6;
	public static c_s5: number = 0.1;


	public static c_posX1: number = 0;
	public static c_posX2: number = 100;
	public static c_posX3: number = 120;

	public static c_posY1: number = 120;
	public static c_posY2: number = 10;
	public static c_posY3: number = 10;
	public static c_posY4: number = 10;

	public static c_alpha0: number = 1;
	public static c_alpha1: number = 1;
	public static c_alpha2: number = 1;
	public static c_alpha3: number = 0.6;
	public static c_alpha4: number = 0;
	public static c_alpha5: number = 0;


	public static h_sp1: number = 80;
	public static h_sp2: number = 300;
	public static h_sp3: number = 200;
	public static h_sp4: number = 1000;
	public static h_sp5: number = 1200;

	public static h_fun1: Function = egret.Ease.circInOut;
	public static h_fun2: Function = egret.Ease.circInOut;
	public static h_fun3: Function = egret.Ease.sineIn;
	public static h_fun4: Function = null;
	public static h_fun5: Function = egret.Ease.sineIn;

	public static h_s0: number = 0.1;
	public static h_s1: number = 1.2;
	public static h_s2: number = 1.2;
	public static h_s3: number = 1.2;
	public static h_s4: number = 1.2;
	public static h_s5: number = 1.2;


	public static h_posX1: number = 0;
	public static h_posX2: number = 100;
	public static h_posX3: number = 120;

	public static h_posY1: number = 150;
	public static h_posY2: number = 10;
	public static h_posY3: number = -30;
	public static h_posY4: number = -30;

	public static h_alpha0: number = 1;
	public static h_alpha1: number = 1;
	public static h_alpha2: number = 1;
	public static h_alpha3: number = 0.6;
	public static h_alpha4: number = 0;
	public static h_alpha5: number = 0;

	public static NORMAL_SCALE_1: number = 1.1;
	public static NORMAL_SCALE_2: number = 0.95;

	public static sn_sp1: number = 600;
	public static sn_sp2: number = 200;
	public static sn_sp3: number = 200;

	public static sn_fun1: Function = null;
	public static sn_fun2: Function = null;

	public static sn_s0: number = 1.3;
	public static sn_s1: number = 1.3;
	public static sn_s2: number = 1.3;

	public static sc_sp1: number = 600;
	public static sc_sp2: number = 200;
	public static sc_sp3: number = 200;

	public static sc_fun1: Function = null;
	public static sc_fun2: Function = null;

	public static sc_s0: number = 1.5;
	public static sc_s1: number = 1.5;
	public static sc_s2: number = 1.5;


	//消失X偏移
	public static C_END_DES: number = 0;
	//初始Y偏移
	public static C_YPOS1: number = 120;
	//淡入Y偏移
	public static C_YPOS2: number = 0;
	//淡出Y偏移
	public static C_YPOS3: number = -20;
	//停留等待时间
	public static C_WAIT1: number = 200;
	//淡入时间
	public static C_SPEED1: number = 100;
	//淡出时间
	public static C_SPEED2: number = 600;
}
