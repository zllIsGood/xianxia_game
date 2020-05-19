/**经验 金币炼制窗口 */
class ExpGoldWin extends BaseEuiView {

	public goUpBtn: eui.Button;
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public depictLabel: eui.Label;
	public depictLabel0: eui.Label;
	public depictLabel1: eui.Label;
	public goldConst: PriceIcon;
	public group: eui.Group;

	public constImg: eui.Image;
	public getAll: eui.Label;


	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "exprefineSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.goUpBtn, this.onTap);
		this.observe(UserExpGold.ins().postExpUpdate, this.refreshShow);
		this.refreshShow();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.goUpBtn, this.onTap);
	}

	private refreshShow(): void {
		if (UserExpGold.ins().checkIsOver()) {
			this.getAll.visible = true;
			this.group.visible = false;
		} else {
			this.group.visible = true;
			this.getAll.visible = false;
			this.constImg.source = "exprefine_json.explz_" + UserExpGold.ins().index;
			let str: string = "可立即提升至<font color='#35e62d'>" + UserExpGold.ins().checkUpLevel() + "</font>级";
			this.depictLabel0.textFlow = new egret.HtmlTextParser().parser(str);
			let needGold: number = GlobalConfig.RefinesystemExpConfig[UserExpGold.ins().index].yuanBao;
			if (Actor.yb >= needGold) {
				this.goldConst.setText("<font color='#35e62d'>" + UserExpGold.ins().getIndexNeedGold() + "</font>");
			} else {
				this.goldConst.setText("<font color='#f3311e'>" + UserExpGold.ins().getIndexNeedGold() + "</font>");
			}

			let endedTime: number = UserExpGold.ins().remainTime;
			this.depictLabel.text = "剩余时间：" + DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3); 
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.goUpBtn:
				//购买按钮点击
				UserExpGold.ins().checkIsCanPlay();
				break;
		}
	}
}

ViewManager.ins().reg(ExpGoldWin, LayerManager.UI_Main);