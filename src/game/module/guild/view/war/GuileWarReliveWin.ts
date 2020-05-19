class GuileWarReliveWin extends BaseEuiView {

	/**1--切下个场景   2--复活 */
	private type: number;
	/** 倒计时剩余秒 */
	private s: number;
	private defaultStr: string;

	public background: eui.Image;
	public killName: eui.Label;
	public mapName: eui.Label;
	public timeDown: eui.Label;
	public closeBtn: eui.Button;
	public guildName: eui.Label;

	private sceneIndex:number;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "SwitchCDSkin";
	}

	public open(...param: any[]): void {
		this.type = param[0];
		this.sceneIndex = param[1];
		switch (this.type) {
			case 1:
				//进入下个场景
				this.currentState = `switch`;
				this.defaultStr = `秒后自动切换区域`;
				this.s = GuildWar.ins().getModel().getCdByType(this.type);
				break;
			case 2:
				//复活
				this.currentState = `revive`;
				this.defaultStr = `秒后在天盟城门复活`;
				this.s = param[1];
				break;
			case 3:
				//退出
				this.currentState = `exit`;
				this.defaultStr = `秒后自动退出活动`;
				this.s = GuildWar.ins().getModel().getCdByType(this.type);
				break;
		}
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.timeDown.text = `${this.s}${this.defaultStr}`;
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);
		TimerManager.ins().doTimer(1000, this.s, this.updateCloseBtnLabel, this);

		this.refushMapInfo();
	}

	public close(...param: any[]): void {

		this.removeTouchEvent(this.closeBtn, this.onTap);
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);

		if (this.type != 1) {
			GuildWar.ins().getModel().killName = "";
		}
	}

	public refushMapInfo(): void {
		if (this.type == 1) {
			this.mapName.text = GuildWar.ins().getModel().getNextMapName(this.sceneIndex);
		} else if (this.type == 2) {
			this.killName.text = `你被 ${GuildWar.ins().getModel().killName} 玩家击败！`;
			this.guildName.text = `所属仙盟：${GuildWar.ins().getModel().killGuild} `;
		}
	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0) {
			if (this.type == 1) {
				GuildWar.ins().requestPlayNextMap(this.sceneIndex);
			}
			if (this.type == 3) {
				UserFb.ins().sendExitFb();
			}
			ViewManager.ins().close(GuileWarReliveWin);
		}
		this.timeDown.text = `${this.s}${this.defaultStr}`;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(GuileWarReliveWin);
				break;
		}
	}
}
ViewManager.ins().reg(GuileWarReliveWin, LayerManager.UI_Main);