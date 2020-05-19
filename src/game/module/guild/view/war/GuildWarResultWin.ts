class GuildWarResultWin extends BaseEuiView {
	public bg: eui.Image;
	public starBg: eui.Image;
	public closeBtn: eui.Button;
	public result: eui.Image;
	public guildName: eui.Label;
	public guildPoint: eui.Label;
	public myPoint: eui.Label;
	public guildRank: eui.Label;
	public myRank: eui.Label;
	public list1: eui.List;
	public list2: eui.List;
	/** 倒计时剩余秒 */
	private s: number;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "GuildWarResultSkin";
		this.closeBtn.label = "确定";
		this.list1.itemRenderer = ItemBase;
		this.list2.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {

		this.guildName.text = param[0] == "" ? "虚位以待" : param[0];
		this.myPoint.text = param[1] + "";
		this.guildPoint.text = "" + param[2];
		this.guildRank.text = "第" + param[3] + "名";
		this.myRank.text = param[4] > 0 ? "第" + param[4] + "名" : "未上榜";

		var pointReward: RewardData[] = GuildWar.ins().getModel().getRewardByPoint(param[1]);
		var pointRank: RewardData[] = GuildWar.ins().getModel().getMyPointRankReward(param[4]);
		this.list1.dataProvider = new eui.ArrayCollection(pointRank.concat(pointReward));
		this.list2.dataProvider = new eui.ArrayCollection(GuildWar.ins().getModel().creatGuildRankReward(param[3]));

		this.s = 10;
		this.addTouchEvent(this.closeBtn, this.onTap);
	}

	public close(...param: any[]): void {
		// App.TimerManager.remove(this.updateCloseBtnLabel, this);
		this.removeTouchEvent(this.closeBtn, this.onTap);
	}

	private onTap(): void {
		ViewManager.ins().close(GuildWarResultWin);
	}

	// private updateCloseBtnLabel(): void {
	// 	this.s--;
	// 	if (this.s <= 0)
	// 		ViewManager.ins().close(GuildWarResultWin);
	// 	this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	// }
}
ViewManager.ins().reg(GuildWarResultWin, LayerManager.UI_Popup);