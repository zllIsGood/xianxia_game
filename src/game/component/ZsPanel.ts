/**
 * 转生面板
 */
class ZsPanel extends BaseView {

	public group: eui.Group;
	public getBtn: eui.Button;
	public haveTxt: eui.Label;
	public useTxt: eui.Label;
	public nextAtt: eui.Label;
	public curZsLv: eui.Label;
	// public curAttImg: eui.Image;
	// public curAttBg: eui.Image;
	public redPoint: eui.Image;
	public curAtt: eui.Label;
	public maxTxt: eui.Label;
	public link: eui.Label;
	// protected totalPower: egret.DisplayObjectContainer;
	protected _totalPower: number;

	private eff: MovieClip;
	private upLevelEff: MovieClip;
	// private powerGroup: eui.Group;
	private arrowImg: eui.Image;
	private powerPanel: PowerPanel;
	private mainGroup: eui.Group;
	private maxGroup: eui.Group;
	private normalGroup: eui.Group;
	private attr0: eui.Label;
	private attr1: eui.Label;
	private attr2: eui.Label;
	private attr3: eui.Label;

	constructor() {
		super();
        this.skinName = "ZsPanelSkin";
	}

	public childrenCreated(): void {
		this.init();
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public init(): void {
		// this.totalPower = BitmapNumber.ins().createNumPic(0, "8");
		// this.totalPower.x = 80;
		// this.totalPower.y = 11;
		this.link.textFlow = new egret.HtmlTextParser().parser(`<u>获取修为</u>`);
		this.eff = new MovieClip;
		// this.eff.playFile(RES_DIR_EFF + "chargeff1");
		this.eff.x = 411;
		this.eff.y = 90;
		this.eff.touchEnabled = false;
		this.eff.scaleX = 0.8;
		this.eff.scaleY = 0.8;
		// TimerManager.ins().doNext(()=>{
		// 	this.eff.x = this.link.x + this.link.width/2;
		// 	this.eff.y = this.link.y + this.link.height/2;
		// 	this.eff.visible = true;
		// },this);
		// this.eff.visible = false;

		this.upLevelEff = new MovieClip;
		// this.upLevelEff.playFile(RES_DIR_EFF + "zhuanshengeff");
		this.upLevelEff.x = 284;
		this.upLevelEff.y = 314;
		this.upLevelEff.scaleX = this.upLevelEff.scaleY = 2;
		this.upLevelEff.touchEnabled = false;

		this.maxGroup.touchEnabled = false;
	}

	public open(...param: any[]): void {
		// this.powerGroup.addChild(this.totalPower);
		this.addEvents();
	}

	public close(...param: any[]): void {
		this.removeEvent();
	}

	public addEvents(): void {
		this.addTouchEvent(this.getBtn, this.onTap);
		this.addTouchEvent(this.link, this.onTap);
		this.observe(UserZs.ins().postZsData, this.setData);
		this.observe(Actor.ins().postLevelChange, this.setData);
	}

	public removeEvent(): void {
		this.removeTouchEvent(this.getBtn, this.onTap);
		this.removeTouchEvent(this.link, this.onTap);
		DisplayUtils.removeFromParent(this.eff);
		DisplayUtils.removeFromParent(this.upLevelEff);
		this.removeObserve();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.getBtn:
				let ins: UserZs = UserZs.ins();
				let config: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[ins.lv + 1];
				if (ins.exp < config.exp) {
					UserTips.ins().showTips("修为不足");
					// this.mainGroup.addChild(this.upLevelEff);
					// this.upLevelEff.playFile(RES_DIR_EFF + "zhuanshengeff", 1);
					return;
				}
				UserZs.ins().sendZsUpgrade();
				break;
			case this.link:
				ViewManager.ins().open(GainZsWin);
				break;
		}
	}

	private lastZsLevel: number = -1;
	public setData(): void {

		this.curAtt.lineSpacing = 5;
		this.nextAtt.lineSpacing = 5;

		let ins: UserZs = UserZs.ins();

		this.redPoint.visible = ins.canUpgrade();

		this.curZsLv.text = `当前转生等级：${ins.lv}转`;

		this.haveTxt.text = ins.exp + "";

		let config: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[ins.lv];

		this.curAtt.text = AttributeData.getAttStr(config, 1);
		let objAtts: AttributeData[] = [];
		for (let k in AttributeData.translate) {
			if (isNaN(config[k]))
				continue;
			let a: AttributeData = new AttributeData;
			a.type = parseInt(AttributeData.translate[k]);
			a.value = config[k];
			objAtts.push(a);
		}
		let len: number = SubRoles.ins().subRolesLen;
		this._totalPower = UserBag.getAttrPower(objAtts) * len;

		// BitmapNumber.ins().changeNum(this.totalPower, this._totalPower, "8");
		this.powerPanel.setPower(this._totalPower);
		let nextAttConfig: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[ins.lv + 1];
		if (nextAttConfig) {
			this.nextAtt.text = AttributeData.getAttStr(nextAttConfig, 1);
			this.useTxt.text = nextAttConfig.exp + "";
			this.maxGroup.visible = false;
			// this.curAtt0.visible = false;
			this.normalGroup.visible = true;
			//this.getBtn.label = data.exp >= nextAttConfig.exp ? "提升" : "获取修为";
		}
		else {
			let currAttConfig: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[ins.lv];
			// if (currAttConfig) this.nextAtt.text = AttributeData.getAttStr(currAttConfig, 1);
			this.group.visible = false;
			// this.curAttImg.horizontalCenter = 0;
			// this.curAttBg.horizontalCenter = 0;
			this.curAtt.horizontalCenter = 0;
			this.maxTxt.visible = true;
			this.arrowImg.visible = false;
			this.nextAtt.visible = false;
			this.normalGroup.visible = false;
			this.maxGroup.visible = true;
			// this.curAtt0.visible = true;

			let count: number = 0;
			let maxCount: number = 4;
			// if (currAttConfig) {
			// 	for (let k in currAttConfig) {
			// 		if (count >= maxCount) break;
			// 		let a: AttributeData = new AttributeData;
			// 		a.type = parseInt(AttributeData.translate[k]);
			// 		a.value = currAttConfig[k];
			// 		objAtts.push(a);
			// 		this["attr" + count].text = AttributeData.getAttStr(objAtts, 0.5);
			// 		count++
			// 	}
			// }
			for (let i: number = 0; i < objAtts.length; i++) {
				if (i >= 4) break;
				this["attr" + i].text = AttributeData.getAttStr(objAtts[i], 0.5);
			}
		}
		if (this.lastZsLevel != -1 && this.lastZsLevel != ins.lv) {
			if(!this.upLevelEff.parent)this.mainGroup.addChild(this.upLevelEff);
			this.upLevelEff.playFile(RES_DIR_EFF + "zhuanshengeff", 1);
		}
		else {
			DisplayUtils.removeFromParent(this.upLevelEff);
		}
		this.lastZsLevel = ins.lv;

		if (ins.canGet() && nextAttConfig) {
			if(!this.eff.parent)this.group.addChild(this.eff);
			// this.eff.play(-1);
			this.eff.playFile(RES_DIR_EFF + "chargeff1",-1);
		} else
			DisplayUtils.removeFromParent(this.eff);
	}
}