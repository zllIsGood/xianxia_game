class GuildWarMemberHeadRender extends BaseItemRender {

	public roleHead: eui.Image;
	public namebg: eui.Image;
	public roleName: eui.Label;
	public num: eui.Label;

	public clickEffc: MovieClip;
	public attEffect: MovieClip;

	constructor() {
		super();

		this.skinName = "MemberHeadSkin";

		this.clickEffc = new MovieClip;
		this.clickEffc.x = 50;
		this.clickEffc.y = 41;
	}

	public dataChanged(): void {
		this.haveGuildName(false);
		if (!isNaN(this.data)) {
			this.currentState = "war";
			let charSource: CharRole = EntityManager.ins().getEntityBymasterhHandle(this.data) as CharRole;
			if (charSource) {
				let info: Role = <Role>charSource.infoModel;
				this.roleName.textFlow = new egret.HtmlTextParser().parser(`${info.name}\n<font color='#6495ed'>${info.guildName}</font>`);
				// this.roleHead.source = `yuanhead${info.job}${info.sex}`;
				this.roleHead.source = `main_role_head${info.job}`
				if (GuildWar.ins().getModel().attHandle && GuildWar.ins().getModel().attHandle == this.data) {
					this.addAttEffect();
				}
				if (info.guildName) this.haveGuildName(true);
			} else {
				this.roleName.textFlow = new egret.HtmlTextParser().parser("已死亡");
			}
		} else if (this.data instanceof SelectInfoData) {
			this.currentState = "panel";
			this.num.textFlow = new egret.HtmlTextParser().parser(this.data.num + "份");
			this.roleName.textFlow = new egret.HtmlTextParser().parser(this.data.data.name);
			// this.roleHead.source = `yuanhead${this.data.data.job}${this.data.data.sex}`;
			this.roleHead.source = `main_role_head${this.data.data.job}`
		}
	}

	public addAttEffect(): void {
		if (!this.attEffect) {
			this.attEffect = new MovieClip;
			this.attEffect.x = 49;
			this.attEffect.y = 28;
		}
		this.attEffect.playFile(RES_DIR_EFF + "FightingEff", -1);
		this.addChild(this.attEffect);
	}

	public removeAttEffect(): void {
		if (this.attEffect) {
			this.attEffect.stop();
			this.attEffect.destroy();
			this.attEffect = null;
		}
	}

	public showEffect(): void {
		this.clickEffc.playFile(RES_DIR_EFF + "tapCircle", 1);
		this.addChild(this.clickEffc);
	}

	public clearEffect(): void {
		DisplayUtils.removeFromParent(this.clickEffc);
		DisplayUtils.removeFromParent(this.attEffect);
	}

	public haveGuildName(b: boolean) {
		//屏蔽，不改变大小
		// if (b) {
		// 	this.namebg.height = 38;
		// 	this.height = 110;
		// } else {
		// 	this.namebg.height = 26;
		// 	this.height = 98;
		// }
	}
}