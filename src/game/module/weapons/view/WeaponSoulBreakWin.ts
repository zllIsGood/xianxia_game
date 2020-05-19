/**
 * 剑灵激活/突破/升级tips
 *
 */
class WeaponSoulBreakWin extends BaseEuiView {
	public static TUPO = 1;
	public static JIHUO = 2;
	public static SHENGJI = 3;

	public static maxCir = 9;

	private lock: eui.Image;
	private star: eui.Group;

	/** 突破 **/
	private tupo: eui.Group;
	private tpattr0: eui.Label;
	private tpattr3: eui.Label;
	private tpright1: eui.Label;
	private tpattr4: eui.Label;
	private g2: eui.Group;
	private tpattr5: eui.Label;
	private tpattr6: eui.Label;
	private tpright2: eui.Image;
	private tpattr7: eui.Label;

	private tpattr1: eui.Label;
	private tpright0: eui.Label;
	private tpattr2: eui.Label;
	private name3: eui.Label;
	private material: WeaponSoulbreakItem;
	private btntupo: eui.Button;

	private item1: ItemIcon;
	/** 激活 **/
	private jihuo: eui.Group;
	private name1: eui.Label;
	private jhattr0: eui.Label;
	private jhattr1: eui.Label;
	private btnjihuo: eui.Button;
	private material1: WeaponSoulbreakItem;

	private bgClose: eui.Rect;
	private roleId: number;
	private slot: number;
	private maxSum: number;
	private curSum: number;
	private needItemId: number;
	private tipsType: number;


	/** 升级 **/
	private lianhua: eui.Group;
	private name2: eui.Label;

	//X->Y
	private lhattr3: eui.Label;
	private lhright1: eui.Image;
	private lhattr4: eui.Label;

	//Z->X
	private lhattr1: eui.Label;//属性名
	private lhattr5: eui.Label;
	private lhright0: eui.Image;
	private lhattr6: eui.Label;
	private lhattr2: eui.Label;
	private lhattr7: eui.Label;
	private lhright2: eui.Image;
	private lhattr8: eui.Label;

	private costgroup0: eui.Group;
	private micon0: eui.Image;
	private countLabel1: eui.Label;//X/Y
	private btnlianhua: eui.Button;
	private maxdesc0: eui.Label;

	private title: eui.Label;
	private effs: MovieClip[];
	private upLvEff: MovieClip;
	private flys: boolean[];
	private finisheff: MovieClip;
	constructor() {
		super();
		this.skinName = 'weaponSoulBreak';

	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.btnjihuo, this.onClick);
		this.removeTouchEvent(this.btntupo, this.onClick);
		this.removeTouchEvent(this.btnlianhua, this.onClick);
		this.removeTouchEvent(this.bgClose, this.onClick);
		TimerManager.ins().remove(this.timeClock, this);
		this.removeObserve();
		DisplayUtils.removeFromParent(this.upLvEff);
		DisplayUtils.removeFromParent(this.finisheff);
		for (let i = 0; i < this.effs.length; i++)
			DisplayUtils.removeFromParent(this.effs[i])
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.btnjihuo, this.onClick);//激活
		this.addTouchEvent(this.btntupo, this.onClick);//突破
		this.addTouchEvent(this.btnlianhua, this.onClick);//升级
		this.addTouchEvent(this.bgClose, this.onClick);
		this.observe(Weapons.ins().postWeaponsUpLevel, this.callback);
		//WeaponSoulBreakWin.JIHUO,role.index,slot
		this.tipsType = param[0];
		this.roleId = param[1];
		this.slot = param[2];
		this.effs = [];
		this.flys = [];
		this.update();
	}
	private calldesc: string = "";
	public callback() {
		UserTips.ins().showTips(`${this.calldesc}成功`);
		if (this.calldesc == "激活") {
			this.star.visible = true;
			this.lock.visible = false;
			this.tipsType = WeaponSoulBreakWin.SHENGJI;
			// ViewManager.ins().close(this);
			this.callbackToUpdate();
		}
		else if (this.calldesc == "升级") {
			this.playUpLvEff();
		}
		else if (this.calldesc == "突破") {
			this.playflyEff();
		}
		// this.callbackToUpdate();
	}
	private callbackToUpdate() {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let wsinfo: WeaponsInfo = role.weapons.getSlotByInfo(this.slot);
		if (wsinfo.assault)
			this.tipsType = WeaponSoulBreakWin.TUPO;
		else if (this.calldesc == "突破") {//突破返回
			this.btntupo.touchEnabled = true;
			this.tipsType = WeaponSoulBreakWin.SHENGJI;
		}
		this.update();
	}
	@callLater
	public update() {
		let wspconfig: WeaponSoulPosConfig[] = GlobalConfig.WeaponSoulPosConfig[this.slot];
		// this.item1.scaleX = 1.3;
		// this.item1.scaleY = 1.3;
		//显示激活
		if (this.tipsType == WeaponSoulBreakWin.JIHUO) {
			this.title.text = "激活";
			this.star.visible = false;
			this.lock.visible = true;
			this.jihuo.visible = true;
			this.tupo.visible = false;
			this.lianhua.visible = false;
			this.item1.imgIcon.source = "b_" + wspconfig[0].icon + "_png";
			this.item1.imgBg.visible = false;
			this.item1.imgJob.visible = false;
			this.name1.text = wspconfig[0].name;
			//背包拥有数
			let itemData: ItemData = UserBag.ins().getBagItemById(wspconfig[0].costItem);
			let costItemLen: number = itemData ? itemData.count : 0;
			this.material1.data = { costItem: wspconfig[0].costItem, costNum: wspconfig[0].costNum, sum: costItemLen };
			if (wspconfig[1].attr) {//未激活就亮1级属性
				let attname: string = AttributeData.getAttrStrByType(wspconfig[1].attr[0].type);//属性名
				this.jhattr0.text = attname + "+" + wspconfig[1].attr[0].value;
				this.jhattr1.visible = true;
				if (wspconfig[1].attr[1]) {
					attname = AttributeData.getAttrStrByType(wspconfig[1].attr[1].type);//属性名
					this.jhattr1.text = attname + "+" + wspconfig[1].attr[1].value;
				}
				else
					this.jhattr1.visible = false;
			}
			this.needItemId = wspconfig[0].costItem;
			this.curSum = costItemLen;
			this.maxSum = wspconfig[0].costNum;
			// this.item1.imgIcon.source = wspconfig[0].icon + "_png";
		}
		//突破
		else if (this.tipsType == WeaponSoulBreakWin.TUPO) {
			this.title.text = "突破";
			this.star.visible = true;
			this.lock.visible = false;
			let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
			let winfo: WeaponsInfo = role.weapons.getSlotByInfo(this.slot);
			this.jihuo.visible = false;
			this.tupo.visible = true;
			this.lianhua.visible = false;
			this.item1.imgIcon.source = "b_" + wspconfig[0].icon + "_png";
			this.item1.imgBg.visible = false;
			this.item1.imgJob.visible = false;
			this.name3.text = wspconfig[0].name;

			//从X->Y
			this.tpattr1.text = winfo.showlv + "";
			this.tpattr2.text = winfo.assault + "";
			this.tpright0.x = this.tpattr1.x + this.tpattr1.width;
			this.tpattr2.x = this.tpright0.x + this.tpright0.width;
			//从Z->X
			if (winfo.attr) {
				this.tpattr0.text = AttributeData.getAttrStrByType(winfo.attr[0].type);//属性名
				this.tpattr3.text = winfo.attr[0].value + "";//当前属性
				let nextconfig: WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[winfo.id][winfo.level + 1];
				this.tpattr4.text = nextconfig.attr[0].value + "";//下一个属性
				this.tpright1.x = this.tpattr3.x + this.tpattr3.width;
				this.tpattr4.x = this.tpright1.x + this.tpright1.width;

				if (winfo.attr[1] && nextconfig.attr[1]) {
					this.g2.visible = true;
					this.tpattr5.text = AttributeData.getAttrStrByType(winfo.attr[1].type);//属性名
					this.tpattr6.text = winfo.attr[1].value + "";//当前属性
					this.tpattr7.text = nextconfig.attr[1].value + "";//下一个属性
					this.tpright2.x = this.tpattr6.x + this.tpattr6.width;
					this.tpattr7.x = this.tpright2.x + this.tpright2.width;
				} else {
					this.g2.visible = false;
				}
			}

			//背包拥有数
			let itemData: ItemData = UserBag.ins().getBagItemById(winfo.costItem);
			let costItemLen: number = itemData ? itemData.count : 0;
			this.material.data = { costItem: winfo.costItem, costNum: winfo.costNum, sum: costItemLen };

			this.needItemId = winfo.costItem;
			this.curSum = costItemLen;
			this.maxSum = winfo.costNum;
		}
		//升级
		else if (this.tipsType == WeaponSoulBreakWin.SHENGJI) {
			this.title.text = "炼化";
			this.star.visible = true;
			this.lock.visible = false;
			this.lianhua.visible = true;
			this.jihuo.visible = false;
			this.tupo.visible = false;
			let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
			let winfo: WeaponsInfo = role.weapons.getSlotByInfo(this.slot);
			let wspconfig: WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[winfo.id][0];
			let nextconfig: WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[winfo.id][winfo.level + 1];
			if (!nextconfig) {
				//满级
				this.costgroup0.visible = false;
				this.btnlianhua.visible = this.costgroup0.visible;
				this.lhright1.visible = this.costgroup0.visible;
				this.lhright0.visible = this.costgroup0.visible;
				this.lhattr4.visible = this.costgroup0.visible;
				this.lhattr6.visible = this.costgroup0.visible;
				this.maxdesc0.visible = !this.costgroup0.visible;
				this.lhright2.visible = this.costgroup0.visible;
				this.lhattr8.visible = this.costgroup0.visible;
				if (winfo.attr) {
					this.lhattr3.text = winfo.showlv + "";
					this.lhattr1.text = AttributeData.getAttrStrByType(winfo.attr[0].type);//属性名
					this.lhattr5.text = winfo.attr[0].value + "";//当前属性

					if (winfo.attr[1]) {
						this[`attr2`].visible = true;
						this.lhattr2.text = AttributeData.getAttrStrByType(winfo.attr[1].type);//属性名
						this.lhattr7.text = winfo.attr[1].value + "";//当前属性
					} else {
						this[`attr2`].visible = false;
					}
				}
				this.name2.text = wspconfig.name;
				this.item1.imgIcon.source = "b_" + wspconfig.icon + "_png";//图片资源只有0级有数据
				this.item1.imgBg.visible = false;
				this.item1.imgJob.visible = false;
				this.updateEff();
				this.addCheckEff();
				return;
			}

			this.item1.imgIcon.source = "b_" + wspconfig.icon + "_png";//图片资源只有0级有数据
			this.item1.imgBg.visible = false;
			this.item1.imgJob.visible = false;
			this.name2.text = wspconfig.name;


			if (winfo.attr) {
				//从X->Y
				this.lhattr3.text = winfo.showlv + "";
				this.lhattr4.text = nextconfig.showlv + "";
				this.lhright1.x = this.lhattr3.x + this.lhattr3.width + this.lhright1.width;
				this.lhattr4.x = this.lhright1.x;

				//从Z->X
				this.lhattr1.text = AttributeData.getAttrStrByType(winfo.attr[0].type);//属性名
				this.lhattr5.text = winfo.attr[0].value + "";//当前属性
				this.lhattr6.text = nextconfig.attr[0].value + "";//下一个属性
				this.lhright0.x = this.lhattr5.x + this.lhattr5.width + this.lhright0.width;
				this.lhattr6.x = this.lhright0.x;

				if (winfo.attr[1] && nextconfig.attr[1]) {
					this[`attr2`].visible = true;
					this.lhattr2.text = AttributeData.getAttrStrByType(winfo.attr[1].type);//属性名
					this.lhattr7.text = winfo.attr[1].value + "";//当前属性
					this.lhattr8.text = nextconfig.attr[1].value + "";//下一个属性
					this.lhright2.x = this.lhattr7.x + this.lhattr7.width + this.lhright2.width;
					this.lhattr8.x = this.lhright2.x;
				} else {
					this[`attr2`].visible = false;
				}

				//背包拥有数
				let itemData: ItemData = UserBag.ins().getBagItemById(winfo.costItem);
				let costItemLen: number = itemData ? itemData.count : 0;
				let itemconfig: ItemConfig = GlobalConfig.ItemConfig[winfo.costItem];
				this.micon0.source = itemconfig.icon + "_png";

				let colorStr: number;
				if (costItemLen >= winfo.costNum)
					colorStr = ColorUtil.GREEN;
				else
					colorStr = ColorUtil.RED;
				this.countLabel1.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${costItemLen}|/|C:0xD1C28F&T:${winfo.costNum}`);

				this.needItemId = winfo.costItem;
				this.curSum = costItemLen;
				this.maxSum = winfo.costNum;


			}
		}
		this.updateEff();
		this.addCheckEff();

	}
	private _shap: egret.Shape;
	private cirimg: eui.Image;
	private updateEff() {
		if (this.star.visible) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
			let winfo: WeaponsInfo = role.weapons.getSlotByInfo(this.slot);
			if (!winfo) {
				UserTips.ins().showTips("显示异常");
				return;
			}
			this.cirimg.visible = true;

			//0级 什么都不显示
			if (!winfo.level) {
				for (let i = 0; i < WeaponSoulBreakWin.maxCir; i++) {
					this["s" + i].visible = false;
				}
				this.cirimg.visible = false;
				return;
			}

			//满级
			if (this.maxdesc0.visible || this.tipsType == WeaponSoulBreakWin.TUPO) {
				for (let i = 0; i < WeaponSoulBreakWin.maxCir; i++) {
					this["s" + i].visible = true;
				}
				// this.cirimg.visible = true;
				DisplayUtils.drawCir(this._shap, (this.star.width >> 1), 360);
				return;
			}

			//1级开始
			let lv: number = winfo.level % 10;
			for (let i = 0; i < WeaponSoulBreakWin.maxCir; i++) {
				if (!lv)
					this["s" + i].visible = false;
				else
					this["s" + i].visible = lv > i;

				//圆
				if (!this._shap)
					this._shap = new egret.Shape();
				if (!this._shap.parent) {
					this.star.addChild(this._shap);
					this.cirimg.mask = this._shap;
					this._shap.x = this._shap.y = this.star.width >> 1;
					this._shap.rotation = -90;
				}
				if (i > 0 && lv > 0) {
					// lv = lv>0?lv:WeaponSoulBreakWin.maxCir;
					DisplayUtils.drawCir(this._shap, (this.star.width >> 1), (lv - 1) * 360 / WeaponSoulBreakWin.maxCir);
				}
				else
					this._shap.graphics.clear();
			}

		}
	}

	private addCheckEff() {
		for (let i = 0; i < WeaponSoulBreakWin.maxCir; i++) {
			if (this["s" + i].visible) {
				if (!this.effs[i]) {
					let mc: MovieClip = new MovieClip;
					this.effs[i] = mc;
				}
				if (!this.effs[i].parent) {
					this["star" + i].addChild(this.effs[i]);
				}
				this.effs[i].x = 21;
				this.effs[i].y = 21;
				this.effs[i].playFile(RES_DIR_EFF + "bally2", -1);
			} else {
				if (this.effs[i] && this.effs[i].parent) {
					DisplayUtils.removeFromParent(this.effs[i])
				}
			}
		}
	}

	//升级成功特效
	private playUpLvEff() {
		if (!this.upLvEff)
			this.upLvEff = new MovieClip;
		if (!this.upLvEff.parent)
			this.star.addChild(this.upLvEff);
		this.upLvEff.x = 145;
		this.upLvEff.y = 140;
		let self = this;
		this.upLvEff.playFile(RES_DIR_EFF + "forgeSuccess", 1, () => {
			DisplayUtils.removeFromParent(self.upLvEff);
		});
		self.callbackToUpdate();
	}
	//飞珠子特效
	private playflyEff() {
		let self = this;
		for (let i = 0; i < this.effs.length; i++) {
			if (this.effs[i] && this.effs[i].parent) {
				this.flys[i] = true;
				let point: egret.Point = this.item1.localToGlobal();
				this['star' + i].globalToLocal(point.x + 38, point.y + 38, point);
				egret.Tween.get(this.effs[i]).to({ x: point.x, y: point.y }, 500).call(() => {
					self.flys[i] = false;
					egret.Tween.removeTweens(self.effs[i]);
					DisplayUtils.removeFromParent(self.effs[i]);
				});
			}
		}

		TimerManager.ins().remove(this.timeClock, this);
		TimerManager.ins().doTimer(100, 0, this.timeClock, this);
	}
	//检测特效播放完毕
	private timeClock() {
		for (let i = 0; i < this.flys.length; i++) {
			if (this.flys[i])
				return;
		}
		TimerManager.ins().remove(this.timeClock, this);
		//都播放完成
		if (!this.finisheff)
			this.finisheff = new MovieClip;
		if (!this.finisheff.parent)
			this.star.addChild(this.finisheff);
		this.finisheff.x = 145;
		this.finisheff.y = 140;
		let self = this;
		this.finisheff.playFile(RES_DIR_EFF + "spirittupo", 1, () => {
			self.callbackToUpdate();
			DisplayUtils.removeFromParent(self.finisheff);
		});
	}


	private onClick(e: egret.Event) {
		switch (e.target) {
			case this.btnjihuo://激活
			case this.btntupo://突破
				if (e.target == this.btnjihuo)
					this.calldesc = "激活";
				else {
					this.calldesc = "突破";
					this.btntupo.touchEnabled = false;
				}
				if (this.curSum < this.maxSum) {
					UserTips.ins().showTips("材料不足");
					UserWarn.ins().setBuyGoodsWarn(this.needItemId);
					return;
				}
				Weapons.ins().sendWeaponsUpLevel(this.roleId, this.slot);
				SoundUtil.ins().playEffect(SoundUtil.FORGE);
				break;
			case this.btnlianhua://升级
				if (this.curSum < this.maxSum) {
					UserTips.ins().showTips("材料不足");
					UserWarn.ins().setBuyGoodsWarn(this.needItemId);
					return;
				}
				this.calldesc = "升级";
				Weapons.ins().sendWeaponsUpLevel(this.roleId, this.slot);
				SoundUtil.ins().playEffect(SoundUtil.FORGE);
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}
ViewManager.ins().reg(WeaponSoulBreakWin, LayerManager.UI_Popup);