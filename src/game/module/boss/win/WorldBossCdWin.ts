class WorldBossCdWin extends BaseEuiView {

	// public closeBtn: eui.Button;
	public check: eui.CheckBox;
	public sure: eui.Button;
	public giveUp: eui.Button;
	public tipsTxt: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBosstishiSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		// this.check.selected = param[0];
		// this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.sure, this.onTap);
		this.addTouchEvent(this.giveUp, this.onTap);
		this.addChangeEvent(this.check, this.selectChange);
		let cost:number = UserBoss.ins().checkWorldBossNeed();
		this.tipsTxt.textFlow = new egret.HtmlTextParser().parser(`确定需要消耗<font color = '#23C42A'>${cost}元宝</fomt>立即复活吗?`);
	}

	public close(...param: any[]): void {
		// this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.sure, this.onTap);
		this.removeTouchEvent(this.giveUp, this.onTap);
		this.check.removeEventListener(egret.Event.CHANGE, this.selectChange, this);
	}

	private selectChange(e: egret.Event): void {
		// if(this.check.selected)
		// {
		// 	UserTips.ins().showTips( "已开启挑战中自动复活"); 
		// }
		UserBoss.ins().ShowTip = !this.check.selected;
	}

	public static openCheck(...param: any[]): boolean {
		return UserBoss.ins().ShowTip;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sure:
				if (UserBoss.ins().checkRelive()) {
					UserBoss.ins().sendClearCD();
					ViewManager.ins().close(WorldBossCdWin);
					ViewManager.ins().close(WorldBossBeKillWin)
				}
				break;
			case this.giveUp:
				ViewManager.ins().close(WorldBossCdWin);
				// ViewManager.ins().close(WorldBossBeKillWin);
				break;
		}
	}
}

ViewManager.ins().reg(WorldBossCdWin, LayerManager.UI_Popup);
