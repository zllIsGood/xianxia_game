/*仙盟活动itemrender*/
class GuildActityItemRender extends BaseItemRender {
	public descLab: eui.Label;
	public nameLab: eui.Label;
	public headBG: eui.Image;
	public taskIcon: eui.Image;
	public getGroup: eui.Group;
	public goBtn0: eui.Button;
	public label: eui.Label;


	public constructor() {
		super();
		this.skinName = "GuildActityItemSkin";
	}

	public onTap(e: eui.Button): void {
		switch (e) {
			case this.goBtn0:
				this.conBtnOnCLick();
				break;
		}
	}

	private conBtnOnCLick(): void {
		let info: GuildActivityConfig = this.data;
		if (GuildRobber.ins().robberTotal - GuildRobber.ins().robberDealNum <= 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:仙盟兽人军团已经全部被击杀了！|");
			return;
		}
		if (info.id == 1) {
			ViewManager.ins().close(GuildActivityWin);
		}
	}

	protected dataChanged(): void {
		let info: GuildActivityConfig = this.data;
		if (info) {
			if (info.id)
				this.taskIcon.source = `guildActity_${info.id}`;
			if (info.context) {
				let content: string = info.context;
				if (info.openDay) {
					// let serverDay: number = Math.floor(GameServer.serverTime / DateUtils.MS_PER_DAY);
					// let guildDay: number = Math.floor(DateUtils.formatMiniDateTime(Guild.ins().guildCreateDate) / DateUtils.MS_PER_DAY);
					if (GameServer.serverOpenDay < info.openDay - 1) {
						let dayStr: string = TextFlowMaker.numberToChinese(info.openDay);
						content = content.replace("\n", (`|C:0x35e62d&S:14&T:（开服第${dayStr}天开启）|\n`));
					}
				}
				this.nameLab.textFlow = TextFlowMaker.generateTextFlow1(content);
			}
			if (info.id == 1) {
				this.descLab.text = `本轮剩余强盗：${GuildRobber.ins().robberTotal - GuildRobber.ins().robberDealNum}/${GuildRobber.ins().robberTotal}`;
			}
			// this.label.text = (GlobalConfig.robberfbconfig.challengeMax - GuildRobber.ins().robberChanllge) + "/" + GlobalConfig.robberfbconfig.challengeMax;
		}
	}

}