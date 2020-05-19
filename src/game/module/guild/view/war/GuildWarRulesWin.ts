class GuildWarRulesWin extends BaseEuiView {

	public bigBg: eui.Image;
	public bg: eui.Image;
	public attr: eui.Label;
	public leftBtn: eui.Button;
	public rightBtn: eui.Button;
	public mapName: eui.Label;

	private cruIndex: number;

	public initUI(): void {
		super.initUI();
		this.skinName = "RuleTipsSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bigBg, this.onTap);
		this.addTouchEvent(this.bg, this.onTap);
		this.addTouchEvent(this.attr, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.cruIndex = GuildWar.ins().getModel().getMapLevelInfo().id;
		this.refushInfo();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bigBg, this.onTap);
		this.removeTouchEvent(this.bg, this.onTap);
		this.removeTouchEvent(this.attr, this.onTap);
		this.removeTouchEvent(this.leftBtn, this.onTap);
		this.removeTouchEvent(this.rightBtn, this.onTap);
	}

	private refushInfo(): void {
		var data: any = GlobalConfig.GuildBattleLevel;
		var info: GuildBattleLevel = data[this.cruIndex];
		this.mapName.text = info.name;
		this.attr.textFlow = TextFlowMaker.generateTextFlow(info.help);
		this.rightBtn.visible = this.cruIndex < 4;
		this.leftBtn.visible = this.cruIndex > 1;
	}

	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.leftBtn:
				--this.cruIndex;
				this.refushInfo();
				break;
			case this.rightBtn:
				++this.cruIndex;
				this.refushInfo();
				break;
			case this.bigBg:
				ViewManager.ins().close(GuildWarRulesWin);
				break;
			default:
				ViewManager.ins().close(GuildWarRulesWin);
		}

	}
}
ViewManager.ins().reg(GuildWarRulesWin, LayerManager.UI_Main);