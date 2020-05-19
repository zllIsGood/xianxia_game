class WingAttrWin extends BaseEuiView {
	private bg: eui.Image;
	private job: eui.Image;
	private attr: eui.Label;
	private closeBtn:eui.Button;
	private attrsData: AttributeData[];   //属性
	private wingsData:WingsData;
	/** 当前选择的角色 */
	public curRole: number;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WingAttrSkin";
	}


	public open(...param: any[]): void {
		this.curRole = param[0];
		
		this.setRoleAttr(this.curRole);
		this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEvent(this.closeBtn, this.onClose);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
		this.removeTouchEvent(this.closeBtn, this.onClose);
	}
	private onClose(e:egret.TouchEvent){
		ViewManager.ins().close(this);
	}
	private otherClose(e: egret.TouchEvent) {
		if (e.target == this.bg || e.target instanceof eui.Button)
			return;
		ViewManager.ins().close(this);
	}

	private setRoleAttr(roleId: number): void {
		this.wingsData = SubRoles.ins().getSubRoleByIndex(roleId).wingsData;
		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[this.wingsData.lv];
		this.attr.text = AttributeData.getAttStr(config.attr, 1);
	}
}

ViewManager.ins().reg(WingAttrWin, LayerManager.UI_Main);
