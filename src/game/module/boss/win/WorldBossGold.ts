class WorldBossGold extends BaseEuiView {

	public okBtn: eui.Button;
	public infoTxt: eui.Label;
	public price: PriceIcon;

	private s: number;

	constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossGoldSkin";
	}

	public open(...param: any[]): void {

		let hurt: number = param[0];
		let gold: number = param[1];

		this.infoTxt.textFlow = (new egret.HtmlTextParser()).parser(`本次挑战BOSS详情：\n<font size='18' color='#A89C88'>	造成伤害：<font color='#23CA23'>${hurt}</font>\n	获得奖励：</font>`);

		this.price.setType(MoneyConst.gold);
		this.price.setPrice(gold);

		this.s = 10;
		this.updateBtn();
		TimerManager.ins().doTimer(1000, this.s, this.updateBtn, this);

		this.addTouchEvent(this.okBtn, this.onTap);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.okBtn, this.onTap);

		TimerManager.ins().remove(this.updateBtn, this);

		UserFb.ins().sendExitFb();
	}

	private onTap(e?: egret.TouchEvent): void {

		ViewManager.ins().close(this);
	}

	private updateBtn(): void {
		this.s--;
		this.okBtn.label = `确 定（${this.s}s）`;
		if (this.s <= 0) {
			this.onTap();
		}
	}
}

ViewManager.ins().reg(WorldBossGold, LayerManager.UI_Main);