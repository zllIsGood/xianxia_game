class ZsBossResultWin extends BaseEuiView {

	public bg: eui.Image;
	public txt: eui.Label;
	public closeBtn: eui.Button;
	public list: eui.List;
	public first: eui.Label;
	public kill: eui.Label;
	public myrank: eui.Label;

	/** 倒计时剩余秒 */
	private s: number;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "ZsBossResultSkin";
		this.closeBtn.name = "领取奖励";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		let params: any[] = param;
		this.first.text = params[0][0];
		this.kill.text = params[0][1];
		this.myrank.text = "我的排名：" + params[0][2];

		this.list.dataProvider = new eui.ArrayCollection(params[1]);

		this.s = 10;
		this.updateCloseBtnLabel();

		TimerManager.ins().doTimer(1000, 10, this.updateCloseBtnLabel, this);

		this.addTouchEvent(this.closeBtn, this.onTap);
	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);
		this.removeTouchEvent(this.closeBtn, this.onTap);

		if (GameMap.fubenID > 0) {
			UserFb.ins().sendExitFb();
		}
	}

	private onTap(): void {
		ViewManager.ins().close(this);
	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			ViewManager.ins().close(this);
		this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}
}

ViewManager.ins().reg(ZsBossResultWin, LayerManager.UI_Popup);