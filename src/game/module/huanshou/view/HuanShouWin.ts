class HuanShouWin extends BaseEuiView {
	private viewStack: eui.ViewStack;
	private closeBtn0: eui.Button;
	private closeBtn: eui.Button;
	private tab: eui.TabBar;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private help: eui.Button;
	// private equipPanel: HuanShouEquipPanel;

	private redPoint2: eui.Image;
	// private redPoint3: eui.Image;
	public redPointGroup: eui.Group;

	private lastSelect: number = -1;

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "huanShouBgSkin";


		this.viewStack.addChild(new HuanShouPanel());

		// this.viewStack.addChild(new HuanShouSkillPanel());
		// this.viewStack.addChild(new HuanShouSkinPanel());
		this.tab.dataProvider = this.viewStack;

	}

	public static openCheck(): boolean {
		let conf = GlobalConfig.HuanShouConf;
		if (conf.dayLimit > GameServer.serverOpenDay + 1) {
			UserTips.ins().showTips(`|C:0xff0000&T:开服第${conf.dayLimit}天开启|`);
			return false;
		}
		let zsLv: number = Math.floor(conf.levelLimit / 1000);
		let lv: number = conf.levelLimit % 1000;
		if (zsLv > UserZs.ins().lv) {
			UserTips.ins().showTips(`|C:0xff0000&T:转生达到${zsLv}级开启|`);
			return false;
		}

		if (lv > Actor.level) {
			UserTips.ins().showTips(`|C:0xff0000&T:等级达到${lv}级开启|`);
			return false;
		}
		return true;
	}


	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.tab.addEventListener(egret.TouchEvent.CHANGING, this.checkIsOpen, this);

		this.observe(HuanShouRedPoint.ins().postUpgradeRed, this.onUpdateRed);
		this.observe(HuanShouRedPoint.ins().postEquipTotalRed, this.onUpdateRed);
		this.observe(HuanShouRedPoint.ins().postSkillRed, this.onUpdateRed);
		this.observe(HuanShouRedPoint.ins().postDanRed, this.onUpdateRed);
		// this.observe(HuanShouRedPoint.ins().postEquipPosRed, this.onUpdateRed3);

		this.observe(HuanShouRedPoint.ins().postSkinTotalRed, this.onUpdateRed);

		if (!this.tab.selectedItem) {
			this.tab.selectedIndex = 0;
			this.viewStack.selectedIndex = 0;
			this.tab.dispatchEvent(new egret.Event(egret.TouchEvent.CHANGING));
		}
		this.onUpdateRed();
		// this.onUpdateRed3();
		// this.onUpdateRed2();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.help, this.onTap);
		this.tab.removeEventListener(egret.TouchEvent.CHANGING, this.checkIsOpen, this);

		this.removeObserve();
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 33);
				break;
		}
	}

	private checkIsOpen(): void {
		this.setSelectedIndex();
	}

	private setSelectedIndex() {
		if (this.lastSelect >= 0)
			this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.tab.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();
	}

	private onUpdateRed(): void {
		this.redPoint0.visible = HuanShouRedPoint.ins().upgradeRed || HuanShouRedPoint.ins().danRed[0] || HuanShouRedPoint.ins().danRed[1] || HuanShouRedPoint.ins().equipTotalRed;
		if (this.viewStack.numElements == 1 && UserHuanShou.ins().rank > 0) {
			this.viewStack.addChild(new HuanShouSkillPanel());
			this.viewStack.addChild(new HuanShouSkinPanel());
			this.tab.dataProvider = this.viewStack;
			if (!this.redPoint1.parent)
				this.redPointGroup.addChild(this.redPoint1);
			if (!this.redPoint2.parent)
				this.redPointGroup.addChild(this.redPoint2);
			this.redPoint1.visible = HuanShouRedPoint.ins().skillRed;
			this.onUpdateRed2();
		}
		else {
			DisplayUtils.removeFromParent(this.redPoint1);
			DisplayUtils.removeFromParent(this.redPoint2);
		}
	}

	private onUpdateRed2(): void {
		this.redPoint2.visible = HuanShouRedPoint.ins().skinTotalRed;
	}

	// private onUpdateRed3(): void {
	// 	if (!this.redPoint3) {
	// 		this.redPoint3 = new eui.Image();
	// 		this.addChild(this.redPoint3);
	// 		this.redPoint3.source = this.redPoint0.source;
	// 		this.redPoint3.x = this.redPoint0.x + (this.redPoint1.x - this.redPoint0.x - 6) * 3;
	// 		this.redPoint3.y = this.redPoint0.y
	// 	}
	// 	if (UserHuanShou.ins().rank == 0) {
	// 		this.redPoint3.visible = false;
	// 		return;
	// 	}

	// 	let equipPosRed = HuanShouRedPoint.ins().equipPosRed;
	// 	let len = equipPosRed.length;
	// 	let red = false;
	// 	for (let i = 0; i < len; i++) {
	// 		if (equipPosRed[i]) {
	// 			red = true;
	// 			break;
	// 		}
	// 	}
	// 	this.redPoint3.visible = red;
	// }
}

ViewManager.ins().reg(HuanShouWin, LayerManager.UI_Main);