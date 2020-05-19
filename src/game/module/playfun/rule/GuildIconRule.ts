class GuildIconRule extends RuleIconBase {
	public constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			GuildRedPoint.ins().postHanghui
		];
	}

	checkShowIcon(): boolean {
		return (Actor.level >= GlobalConfig.GuildConfig.openLevel);
	}

	checkShowRedPoint(): number {
		return Number(GuildRedPoint.ins().hanghui);
	}

	tapExecute(): void {
		if (Actor.level >= GlobalConfig.GuildConfig.openLevel) {
			if (Guild.ins().guildID == undefined || Guild.ins().guildID == 0)
				ViewManager.ins().open(GuildApplyWin);
			else
				ViewManager.ins().open(GuildMap);
		} else {
			UserTips.ins().showTips(`${GlobalConfig.GuildConfig.openLevel}级开启`);
		}
	}
}