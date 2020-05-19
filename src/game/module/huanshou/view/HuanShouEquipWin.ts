class HuanShouEquipWin extends BaseEuiView {
	public viewStack: eui.ViewStack;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public tab: eui.TabBar;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public help: eui.Button;

	private lastSelect: number = -1;
	constructor() {
		super();
		this.skinName = `huanShouBgSkin2`;
	}

	public static openCheck(): boolean {

		return UserHuanShou.ins().rank > 0;
	}

	public initUI(): void {
		super.initUI();
		let equipPanel = new HuanShouEquipPanel();
		this.viewStack.addChild(equipPanel);
		let panel = new HuanShouEquipChoosePanel();
		this.viewStack.addChild(panel);
		this.tab.dataProvider = this.viewStack;

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.tab.addEventListener(egret.TouchEvent.CHANGING, this.setSelectedIndex, this);
		this.observe(HuanShouRedPoint.ins().postEquipPosRed, this.onUpdateRed1);
		this.observe(HuanShouRedPoint.ins().postEquipListRed, this.onUpdateRed0);
		if (!this.tab.selectedItem) {
			this.tab.selectedIndex = 0;
			this.viewStack.selectedIndex = 0;
			this.tab.dispatchEvent(new egret.Event(egret.TouchEvent.CHANGING));
		}
		this.onUpdateRed0();
		this.onUpdateRed1();
	}

	public close(...param: any[]): void {

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

	private setSelectedIndex() {
		if (this.lastSelect >= 0)
			this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.tab.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();
	}


	private onUpdateRed0(): void {

		let equipListRed = HuanShouRedPoint.ins().equipListRed;
		let len = equipListRed.length;
		let red = false;
		for (let i = 0; i < len; i++) {
			if (equipListRed[i]) {
				red = true;
				break;
			}
		}
		this.redPoint0.visible = red;
	}

	private onUpdateRed1(): void {

		let equipPosRed = HuanShouRedPoint.ins().equipPosRed;
		let len = equipPosRed.length;
		let red = false;
		for (let i = 0; i < len; i++) {
			if (equipPosRed[i]) {
				red = true;
				break;
			}
		}
		this.redPoint1.visible = red;
	}
}
ViewManager.ins().reg(HuanShouEquipWin, LayerManager.UI_Main2);