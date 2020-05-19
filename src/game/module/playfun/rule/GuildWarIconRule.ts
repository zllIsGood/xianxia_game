class GuildWarIconRule extends RuleIconBase {

    private firstTap: boolean = true;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			GuildWar.ins().postGuildWarStarInfo
		];
	}

	checkShowIcon(): boolean {
		return (GuildWar.ins().getModel().getIsShowGuildWarBtn() == 1);
	}

	getEffName(redPointNum: number): string {
		if (this.firstTap || redPointNum){
			this.effX = 38;
			this.effY = 55;
			return "actIconCircle";
		}
		return undefined;
	}

	tapExecute(): void {
		if (Guild.ins().guildID == undefined || Guild.ins().guildID == 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:加入仙盟后才能参与仙盟争霸活动|");
			return;
		}

		GuildWar.ins().requestWinGuildInfo();
		ViewManager.ins().close(GuildMap);
		ViewManager.ins().open(GuildWarMainWin);
		this.firstTap = false;
		this.update();
	}
}