class NeiGongWin extends BaseView {

	private stageGroup: eui.Group;
	private stageImg: eui.BitmapLabel;
	private lineGroup: eui.Group;
	private lineBg: eui.Image;
	private _shap: egret.Shape;
	private arrow0: eui.Image;
	private arrow1: eui.Image;

	// public roleSelect: RoleSelectPanel;
	// public levelLabel: eui.Label;
	public costlable: eui.Label;
	public attr1: eui.Label;
	public mixBtn: eui.Button;
	public upBtn: eui.Button;
	public oneKeyUp: eui.Button;
	public barBg: eui.Image;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	// public expBar: eui.ProgressBar;
	public expLabel: eui.Label;
	public costInfo: eui.Group;

	private fightGroup: eui.Group;
	// private totalPower: egret.DisplayObjectContainer;
	private _totalPower: number;
	public curRole: number = 0;

	// private data: NeiGongData;
	private canUp: boolean = false;
	private cruLevelCfg: NeiGongStageConfig;
	/** 当前的特效开关状态*/
	private isLights: boolean[] = [];
	/** 特效列表 */
	private effs: any = {};
	/*初始容器的位置*/
	private starPoint: egret.Point[] = [];
	/*是否有下一级配置*/
	private isNext: boolean = false;
	//是否自动升级
	private isAutoUp: boolean = false;
	//自动升级时标记的等级  每次只升一级
	private signLevel: number = 0;

	private powerPanel: PowerPanel;

	private upLevelMc: MovieClip;
	private ball: eui.Group;

	private moveInMc: MovieClip;

	private stageMc: MovieClip;

	private circleMc: MovieClip;

	private _ballShap: egret.Shape;

	private mcGroup: eui.Group;

	private btnGroup: eui.Group;

	private lastLevel: number;

	private showAct: eui.Group;//内功界面
	private Activation: eui.Group;//内功激活界面

	private UplevelBtn0: eui.Button;//激活按钮
	private redPointAct0: eui.Image;
	private activeTipsTxt0: eui.Label;

	private eff: MovieClip;

	private data: any;
	private mcPos: number[][] = [[52, 77, 0], [47, 55, 18], [55, 30, 36], [75, 12, 54], [110, 0, 72],
	[75, 15, 108], [100, 30, 126], [110, 60, 144], [100, 90, 162], [85, 120, 180]];
	private maxDesc: eui.Label;

	constructor() {
		super();
		this.skinName = "NeiGongSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		// this.totalPower = BitmapNumber.ins().createNumPic(0, "8");
		// this.totalPower.x = 65;
		// this.totalPower.y = 14;
		// this.fightGroup.addChild(this.totalPower);

		this.upLevelMc = new MovieClip();

		// this.stageImg = BitmapNumber.ins().createNumPic(0, "ng0");
		// this.stageImg.x = 25;
		// this.stageImg.y = 12;
		// this.stageGroup.addChild(this.stageImg);

		this._shap = new egret.Shape();
		this.lineGroup.addChild(this._shap);
		this.lineBg.mask = this._shap;
		this._shap.x = this._shap.y = this.lineGroup.width >> 1;
		this._shap.rotation = -196;

		
		this.circleMc = new MovieClip;
		
		this.circleMc.x = 80;
		this.circleMc.y = 75;
		this.mcGroup.addChild(this.circleMc);

		this.moveInMc = new MovieClip;
		this.moveInMc.x = 70;
		this.moveInMc.y = 65;
		this.ball.addChild(this.moveInMc);

		this.stageMc = new MovieClip;
		this.stageMc.x = 52;
		this.stageMc.y = 44;
		this.stageGroup.addChild(this.stageMc);

		// this._ballShap = new egret.Shape();
		// this.mcGroup.addChild(this._ballShap);

		let temp: NeiGongData = NeiGongModel.ins().neiGongList[this.curRole];
		let level: number = temp ? temp.level : 0;
		for (let i: number = 0; i < 10; i++) {
			let point = new egret.Point(this["eff_" + i].x, this["eff_" + i].y);
			this.starPoint[i] = point;
			this.isLights[i] = i < level;
		}

		this.eff = new MovieClip;
		this.eff.x = this.UplevelBtn0.x + this.UplevelBtn0.width / 2;
		this.eff.y = this.UplevelBtn0.y + this.UplevelBtn0.height / 2;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
	}

	public open(...param: any[]): void {
		this.curRole = param[0];
		this.lastLevel = -1;
		this.circleMc.playFile(RES_DIR_EFF + "neigongzhongjianeff", -1);
		if (!this.moveInMc.parent) this.ball.addChild(this.moveInMc);

		// this._shap.x = 48;

		let circleImgMask = new egret.Rectangle(-140, -140, 140 * 2, 140 * 2);
		this.circleMc.mask = circleImgMask;
		// this.circleMc.mask = this._ballShap;

		this.addTouchEvent(this.upBtn, this.onClick);
		this.addTouchEvent(this.mixBtn, this.onClick);
		this.addTouchEvent(this.oneKeyUp, this.onClick);
		this.addTouchEvent(this.UplevelBtn0, this.onClick);
		this.observe(NeiGong.ins().postNeiGongDataChange, this.refushPanelInfo);
		this.observe(Actor.ins().postLevelChange, this.setBtnStatuBarinfo);
		this.observe(NeiGong.ins().postNeiGongAct, this.showActPanel);

		// this.setView();
		// this.moveInMc.playFile(RES_DIR_EFF + "neigongbaozhaeff", -1);
		// this.stageMc.playFile(RES_DIR_EFF + "neigongshengjieff", -1);
		this.refushPanelInfo(true);
		// this.upLevelMc.playFile(RES_DIR_EFF + "piaodongqipaohuang", -1);

		this.showActPanel();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		// this.roleSelect.removeEventListener(egret.Event.CHANGE, this.onChange, this);
		this.removeTouchEvent(this.upBtn, this.onClick);
		this.removeTouchEvent(this.mixBtn, this.onClick);
		this.removeTouchEvent(this.oneKeyUp, this.onClick);
		this.seteffectPost();
		for (let i in this.effs) {
			DisplayUtils.removeFromParent(this.effs[i]);
			if (this.effs[i])
				egret.Tween.removeTweens(this.effs[i]);
		}
		DisplayUtils.removeFromParent(this.eff);
		this.stopAutoUp();
	}

	public static openCheck(): boolean {
		let openLevel: number = GlobalConfig.NeiGongBaseConfig.openLevel;
		if (Actor.level < openLevel) {
			UserTips.ins().showTips(`${openLevel}级开启内功`);
			return false;
		}
		return true;
	}

	/**显示内功激活界面 */
	private showActPanel() {
		//是否显示激活特效界面
		if (NeiGong.ins().isActList[this.curRole].isShow) {
			NeiGong.ins().isActList[this.curRole].isShow = false;
			Activationtongyong.show(0, "内功", `jneigong_png`);
			let role: CharRole = EntityManager.ins().getMainRole(this.curRole);
			if (role)
				role.updateNeiGong();

		}
		this.showAct.visible = NeiGong.ins().ngList[this.curRole] > 0;

		if (!this.showAct.visible) {
			this.Activation.visible = true;
			this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
			if (!this.eff.parent) this.UplevelBtn0.parent.addChild(this.eff);
		} else {
			this.Activation.visible = false;
			DisplayUtils.removeFromParent(this.eff);
		}
		// this.Activation.visible = !this.showAct.visible;
		let openGuanqia: number = GlobalConfig.NeiGongBaseConfig.openGuanqia;
		if (UserFb.ins().guanqiaID <= openGuanqia) {
			this.redPointAct0.visible = false;
		}
		this.activeTipsTxt0.text = `闯关达到 第${openGuanqia + 1} 即可激活内功`;

	}

	private onChange(): void {
		// this.curRole = this.roleSelect.getCurRole();
		this.stopAutoUp();
		this.refushPanelInfo();
	}

	private refushPanelInfo(init?: boolean): void {
		this.data = NeiGongModel.ins().neiGongList[this.curRole];
		if (!this.data) {
			return;
		}
		this.cruLevelCfg = GlobalConfig.NeiGongStageConfig[this.data.stage][this.data.level];
		if (!this.cruLevelCfg) {
			return;
		}
		if (this.lastLevel != this.data.level) {
			this.effectShow(init);
		}
		this.lastLevel = this.data.level;

		this.setAttrCost();
		this.setPowerShow();

		this.setBtnStatuBarinfo();
		this.seteffectPost();
	}

	//设置战斗力显示
	private setPowerShow(): void {
		this._totalPower = UserBag.getAttrPower(this.cruLevelCfg.attribute);
		// BitmapNumber.ins().changeNum(this.totalPower, this._totalPower, "8");
		this.powerPanel.setPower(this._totalPower)
	}

	//设置属性 以及 消耗
	private setAttrCost(): void {
		this.stageImg.x = this.data.stage < 10 ? 40 : 25;
		this.stageImg.text = this.data.stage + "";
		let cost: number = 0;
		let discount: number = GlobalConfig.MonthCardConfig.neiGongGoldPrecent / 100;
		let addValue: number = Recharge.ins().getIsForeve() ? 1 - discount : 1;
		if (!this.data.canMix) {
			cost = Math.floor(this.cruLevelCfg.costMoney * addValue);
		}
		let colorStr: string = "";
		if (Actor.gold >= cost)
			colorStr = "|C:0x35e62d&T:";
		else
			colorStr = "|C:0xf3311e&T:";
		this.canUp = Actor.gold >= cost;
		this.costlable.textFlow = TextFlowMaker.generateTextFlow(colorStr + cost);
		let attrList: AttributeData[] = this.cruLevelCfg.attribute;
		attrList.sort(AttributeData.sortAttribute);
		let len: number = attrList.length;
		//最多显示4个属性

		for (let i: number = 0; i < 3; i++) {
			this["attr" + i].text = len > i ? AttributeData.getAttStrByType(attrList[i], 1) : "";
		}

		let nextStage: number = 0;
		let nextLevel: number = 0;
		if (this.data.level == GlobalConfig.NeiGongBaseConfig.levelPerStage) {
			nextStage = this.data.stage + 1;
			nextLevel = 0;
		} else {
			nextStage = this.data.stage;
			nextLevel = this.data.level + 1;
		}
		let cfgList: NeiGongStageConfig[] = GlobalConfig.NeiGongStageConfig[nextStage];
		let nextConfig: NeiGongStageConfig = cfgList ? cfgList[nextLevel] : null;
		if (nextConfig) {
			let str: string = "";
			let addList: AttributeData[] = nextConfig.attribute;
			addList.sort(AttributeData.sortAttribute);
			//最多显示4个属性
			for (let i: number = 0; i < 3; i++) {
				if (len > i) {
					let attr: AttributeData = attrList[i];
					str = this.getAttrByType(addList, attr);
				}
				this["addAttr" + i].text = str;
				this["arrow" + i].visible = str != "";
			}
			this.isNext = true;
		} else {
			for (let i: number = 0; i < 3; i++) {
				this["addAttr" + i].text = "";
				this["arrow" + i].visible = false;
			}
			this.isNext = false;
		}
	}

	//设置 激活的特效显示
	private effectShow(init?: boolean): void {
		let len: number = this.data.level;
		for (let i: number = 0; i < 10; i++) {
			this["point_" + i].source = i >= len ? "internal_ball_dark" : "internal_ball_ligght";
		}
		if (len > 0)
			DisplayUtils.drawCir(this._shap, (this.lineGroup.width >> 1) + 2, (len - 1) * (180 + 32) / 9);
		else
			this._shap.graphics.clear();
		for (let i in this.effs) {
			DisplayUtils.removeFromParent(this.effs[i]);
			this.effs[i] = null;
		}
		if (init) {
			let temp: NeiGongData = NeiGongModel.ins().neiGongList[this.curRole];
			let level: number = temp ? temp.level : 0;
			for (let i: number = 0; i < 10; i++) {
				this.isLights[i] = i < level;
			}
		}

		for (let i: number = 0; i < len; i++) {
			let mc: MovieClip = this.effs[i] || new MovieClip();
			mc.x = 1;
			mc.y = 30;
			mc.scaleX = 1;
			mc.scaleY = 1;
			this.effs[i] = mc;
			this["eff_" + i].addChild(mc);
			if (!this.isLights[i]) {
				// this.effs[i].visible = false;
				this.isLights[i] = true;
				this.moveEffectOut(i);
			} else {
				mc.playFile(`${RES_DIR_EFF}feishengfire`, -1);
			}
		}
	}

	//设置按钮状态
	private setBtnStatuBarinfo(): void {
		let flag: boolean = this.data.canMix;
		this.upBtn.visible = !flag && this.isNext;
		// this.oneKeyUp.visible = !flag && this.isNext;
		this.mixBtn.visible = flag;
		//这里内功里边不需要红点
		this.redPoint1.visible = false;//flag || NeiGongModel.ins().neiGongList[this.curRole].getCanLevelUp();
		this.redPoint0.visible = false;//!flag && this.cruLevelCfg.tips <= Actor.gold && this.isNext;
		this.costInfo.visible = !flag && this.isNext;
		this.maxDesc.visible = !this.isNext;
		if (flag) {
			this.expLabel.text = "";
			this.upDataExpMcBall(this.cruLevelCfg.totalExp, this.cruLevelCfg.totalExp);
		} else {
			// this.expBar.labelDisplay.visible = true;
			if (this.cruLevelCfg) {
				// this.expBar.maximum = this.cruLevelCfg.totalExp;
				// this.expBar.value = this.data.exp;
				this.upDataExpMcBall(this.data.exp, this.cruLevelCfg.totalExp);
				this.expLabel.text = this.data.exp + "/" + this.cruLevelCfg.totalExp;
			}
		}

		// if (Actor.level >= 60) {
		// 	this.oneKeyUp.visible = !flag && this.isNext;
		// 	this.upBtn.x = 0;
		// 	this.costInfo.x = 12;
		// } else {
		// 	this.upBtn.x = 120;
		// 	// this.costInfo.x = 133;
		// 	// let p:egret.Point = this.btnGroup.localToGlobal();
		// 	// this.costInfo.x = p.x + this.btnGroup.width/2 - this.costInfo.width - 30;
		// 	// this.costInfo.globalToLocal(p.x,p.y,p);
		// 	this.costInfo.horizontalCenter = 0;
		// 	this.oneKeyUp.visible = false;
		// }
		// this.redPoint0.x = this.upBtn.x + 150;
		// this.levelLabel.text = `Lv.${this.data.stage * GlobalConfig.NeiGongBaseConfig.levelPerStage + this.data.level}`;
	}

	private onClick(e: egret.TouchEvent): void {
		if (!this.isNext) {
			UserTips.ins().showTips(`内功已满级`);
			return;
		}
		switch (e.target) {
			case this.upBtn:
				if (this.canUp) {
					NeiGong.ins().sendNeiGongUpLevel(this.curRole);
					SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
				} else {
					if (!Shop.openBuyGoldWin(false)) {
						UserTips.ins().showTips(`金币不足`);
					}
				}
				break;
			case this.mixBtn:
				this.moveEffectIn();
				TimerManager.ins().doTimer(400, 1, () => {
					NeiGong.ins().sendNeiGongUpStage(this.curRole);
					SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
				}, this);
				break;
			case this.oneKeyUp:
				if (this.isAutoUp) {
					this.stopAutoUp();
				}
				else {
					if (!this.canUp) {
						UserTips.ins().showTips(`金币不足`);
						return;
					}
					this.isAutoUp = true;
					this.oneKeyUp.label = `停 止`;
					TimerManager.ins().doTimer(300, 0, this.autoUpStar, this);
				}
				break;
			case this.UplevelBtn0:
				NeiGong.ins().sendNeiGongAct(this.curRole);
				break;
		}
	}

	private stopAutoUp(): void {
		this.isAutoUp = false;
		if (this.oneKeyUp)
			this.oneKeyUp.label = `一键修炼`;
		TimerManager.ins().remove(this.autoUpStar, this);
	}

	private autoUpStar(): void {
		if (this.canUp && this.data.canMix == false && this.isNext) {
			NeiGong.ins().sendNeiGongUpLevel(this.curRole);
			SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
		} else {
			this.stopAutoUp();
		}
	}

	private moveEffectOut(id: number): void {
		let tt: egret.Tween = egret.Tween.get(this["eff_9"]);
		tt.call(() => {
			this.moveInMc.playFile(RES_DIR_EFF + "neigongbaozhaeff", 1, null, false);
		}, this).wait(100).call(() => {
			DisplayUtils.removeFromParent(this.upLevelMc);
			this.ball.addChild(this.upLevelMc);
			this.upLevelMc.x = this.mcPos[id][0];
			this.upLevelMc.y = this.mcPos[id][1];
			this.upLevelMc.rotation = this.mcPos[id][2];
			this.upLevelMc.playFile(RES_DIR_EFF + "piaodongqipaohuang", 1, () => {
				if (this.effs[id])
					this.effs[id].playFile(`${RES_DIR_EFF}feishengfire`, -1);
				let len: number = this.data.level;
				for (let i: number = 0; i < 10; i++) {
					this["point_" + i].source = i >= len ? "internal_ball_dark" : "internal_ball_ligght";
				}
				if (len > 0)
					DisplayUtils.drawCir(this._shap, (this.lineGroup.width >> 1) + 2, (len - 1) * (180 + 32) / 9);
				else
					this._shap.graphics.clear();
			}
				, true);
		}, this);
	}

	private moveEffectIn(): void {
		for (let i in this.effs) {
			let t: egret.Tween = egret.Tween.get(this["eff_" + i]);
			t.to({ "x": 280, "y": 320, "scaleX": 1, "scaleY": 1 }, 390).to({ "alpha": 0 }, 10);
		}
		for (let i: number = 0; i < 10; i++) {
			this.isLights[i] = false;
		}
		let tt: egret.Tween = egret.Tween.get(this["eff_9"]);
		tt.wait(400).call(() => {
			this.moveInMc.playFile(RES_DIR_EFF + "neigongbaozhaeff", 1, null, false);
		}, this).call(() => {
			if (!this.stageMc.parent)
				this.stageGroup.addChild(this.stageMc);
			this.stageMc.playFile(RES_DIR_EFF + "neigongshengjieff", 1, () => {
				DisplayUtils.removeFromParent(this.stageMc);
			});
		}, this);

		for (let i: number = 0; i < 10; i++) {
			this["point_" + i].source = "internal_ball_dark";
		}
	}

	private getAttrByType(attrs: AttributeData[], attr: AttributeData): string {
		let len: number = attrs.length;
		for (let i: number = 0; i < len; i++) {
			if (attrs[i].type == attr.type && attrs[i].value != attr.value) {
				return ` ${AttributeData.getAttStrByType(attrs[i], 1, "", false, false)}`;
			}
		}
		return "";
	}

	private seteffectPost(): void {
		let len: number = this.data ? this.data.level : 0;
		for (let i: number = 0; i < 10; i++) {
			let point = this.starPoint[i];
			if (point) {
				this["eff_" + i].x = i < len ? point.x : 280;
				this["eff_" + i].y = i < len ? point.y : 320;
				this["eff_" + i].scaleX = 1;
				this["eff_" + i].scaleY = 1;
				this["eff_" + i].alpha = 1;
			}
		}
	}

	private toHeight: number = 0;
	private mcWidth: number = 160;
	private mcHeight: number = 160;
	private _currHeight: number = 0;

	private upDataExpMcBall(value, total): void {
		DisplayUtils.drawrect(this._ballShap, this.mcWidth, this.mcHeight);
		this.toHeight = this.mcHeight * (value / total);
		let mask = this.circleMc.mask;
		mask.y = -70 + 140 * (1 - (value / total));
		// let height = this.toHeight >= this.mcHeight ? this.mcHeight : this.toHeight;
		// this.currentHeight(height); 
	}

	public currentHeight(value: number) {
		this._currHeight = value;
		// let y: number = this.mcHeight - Math.floor(this._currHeight);
		// let t: egret.Tween = egret.Tween.get(this._ballShap);
		// t.to({ y: y }, 200).call(() => {

		// }, this);
	}

	public get currHeight(): number {
		return this._currHeight;
	}

	public destoryView(): void {
		// super.destoryView();
		// this.roleSelect.destructor();
	}
}

// ViewManager.ins().reg(NeiGongWin, LayerManager.UI_Main);