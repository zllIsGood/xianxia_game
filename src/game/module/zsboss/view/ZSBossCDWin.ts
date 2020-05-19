
class ZSBossCDWin extends BaseEuiView {

	public closeBtn:eui.Button;
	public check:eui.CheckBox;
	public sure:eui.Button;
	public giveUp:eui.Button;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ZSBossCDSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.check.selected = param[0];
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.sure, this.onTap);
		this.addTouchEvent(this.giveUp, this.onTap);
		this.addChangeEvent(this.check, this.selectChange);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.sure, this.onTap);
		this.removeTouchEvent(this.giveUp, this.onTap);
		this.check.removeEventListener(egret.Event.CHANGE, this.selectChange, this);
	}

	private selectChange(e:egret.Event):void{
		if(this.check.selected)
		{
			UserTips.ins().showTips( "已开启挑战中自动复活"); 
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.sure:
				if(ZsBoss.ins().checkIsMoreMoney())
				{
					UserBoss.ins().sendClearCD();
					ViewManager.ins().close(this);
				}
				break;
			case this.giveUp:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(ZSBossCDWin, LayerManager.UI_Popup);