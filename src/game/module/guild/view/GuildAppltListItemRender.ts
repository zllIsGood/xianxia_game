class GuildAppltListItemRender extends BaseItemRender {

	private nameLab: eui.Label;
	private attack: eui.Label;
	private ok: eui.Button;
	private cancel: eui.Button;
	private myFace: eui.Image;
	public attack0: eui.Label;
	private vipTitle: eui.Image;
	private labVip: eui.BitmapLabel;

	public constructor() {
		super();
		this.skinName = "MemberApplyItemSkin";
	}

	public onTap(e: eui.Button): void {
		//仙盟战期间  不允许对申请玩家进行操作
		if (GuildWar.ins().getModel().isWatStart) {
			WarnWin.show("仙盟战期间,不允许对申请玩家进行操作", () => {
			}, this);
			return;
		}
		switch (e) {
			case this.ok:
				if (Guild.ins().getMemberNum() >= GlobalConfig.GuildConfig.maxMember[Guild.ins().guildLv - 1]) {
					UserTips.ins().showTips("|C:0xf3311e&T:仙盟成员已满|");
					return;
				}
				Guild.ins().sendProcessJoin(this.data.roleID, 1);
				break;
			case this.cancel:
				Guild.ins().sendProcessJoin(this.data.roleID, 0);
				break;
		}
	}

	protected dataChanged(): void {
		if (this.data instanceof GuildApplyInfo) {
			let info: GuildApplyInfo = this.data;
			if (info.vipLevel > 0) {
				this.nameLab.x = 162;
			} else {
				this.nameLab.x = 109;
			}
			let name: string = "<font color='#C2BAA5'>" + info.name + "</font>";
			this.nameLab.textFlow = (new egret.HtmlTextParser).parser(name);
			this.attack0.text = info.attack + "";
			this.myFace.source = `head_${info.job}${info.sex}`;
			this.vipTitle.visible = this.labVip.visible = info.vipLevel > 0;
			this.labVip.text = info.vipLevel.toString();
		}
	}
}