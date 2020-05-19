class GuildSkillPanel extends BaseComponent {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private skillBmp1: eui.Image;
	private skillBmp2: eui.Image;
	private skillBmp3: eui.Image;
	private praGroup: eui.Group;
	private praName: eui.Label;
	private praCurBase: eui.Label;
	private praNextLab: eui.Label;
	private praCon: eui.Label;
	private praCost: eui.Label;
	private praCost0: eui.Label;
	private praBtn: eui.Button;
	private learnLab: eui.Label;
	private selectBmp: eui.Image;
	private selectBmpX: number[] = [0, 104, 236, 368];
	private selectBmpY: number[] = [0, 339, 117, 339];
	private selectIconID: number;
	private selectSkillID: number;
	private selectSkillBmp: eui.Image;
	private lvTxt: eui.Label;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;
	private praBtnMc: eui.Group;
	private mc: MovieClip;
	/**0普通 1特殊 */
	private selectSkillType: number;

	public curRole: number = 0;

	constructor() {
		super();
		// this.skinName = "GuildSkillWinSkin";
		this.selectIconID = 2;
	}

	protected childrenCreated() {
		this.init();
	}


	public init() {
		this.learnLab.textFlow = (new egret.HtmlTextParser).parser(`无法升级技能，请先提升练功房等级  <a href="event:"><font color='#0FEE27'><u>前往提升</u></font></a>`);
	}

	public static openCheck(...param: any[]): boolean {
		let rtn = (Guild.ins().guildID != 0);
		if (!rtn) {
			UserTips.ins().showTips("还未加入仙盟！");
		}
		return rtn;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.praBtn, this.onTap);
		this.addTouchEvent(this.skillBmp1, this.onTap);
		this.addTouchEvent(this.skillBmp2, this.onTap);
		this.addTouchEvent(this.skillBmp3, this.onTap);
		this.learnLab.addEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.observe(Guild.ins().postGuildSkillInfo, this.update);
		this.observe(Guild.ins().postMyGuildInfo, this.updateMyInfo);
		this.observe(GameLogic.ins().postChildRole, this.updateRole);
		this.observe(Guild.ins().postGuildInfo, this.update);
		this.observe(GuildRedPoint.ins().postLianGongRedPoint, this.updateRedPoint);
		Guild.ins().sendGuildSkillInfo();
		Guild.ins().sendMyGuildInfo();
		this.praBtnMc.touchEnabled = false;

		this.update();
	}

	public close() {

	}
	private updateRedPoint() {
		if (!GuildRedPoint.ins().roleSkillTabs[this.curRole]) {
			GuildRedPoint.ins().roleSkillTabs[this.curRole] = {};
			GuildRedPoint.ins().roleSkillTabs[this.curRole][1] = false;
			GuildRedPoint.ins().roleSkillTabs[this.curRole][2] = false;
			GuildRedPoint.ins().roleSkillTabs[this.curRole][3] = false;
		}

		this.redPoint1.visible = GuildRedPoint.ins().roleSkillTabs[this.curRole][1];
		this.redPoint2.visible = GuildRedPoint.ins().roleSkillTabs[this.curRole][2];
		this.redPoint3.visible = GuildRedPoint.ins().roleSkillTabs[this.curRole][3];
	}
	private onLink(): void {
		ViewManager.ins().open(GuildWin, 1);
	}

	private updateRole(): void {
		Guild.ins().sendGuildSkillInfo();
	}

	private updateMyInfo(): void {
		this.praCon.text = "" + Guild.ins().myCon;
	}

	public update(roleId: number = -1): void {
		this.curRole = roleId > -1 ? roleId : this.curRole;
		this.updateMyInfo();
		this.selectSkill(this.selectIconID);
		this.updateRedPoint();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.skillBmp1:
				this.selectSkill(1);
				this.selectSkillBmp.source = 'guildskill_1';
				break;
			case this.skillBmp2:
				this.selectSkill(2);
				this.selectSkillBmp.source = 'guildskill_2';
				break;
			case this.skillBmp3:
				this.selectSkill(3);
				this.selectSkillBmp.source = 'guildskill_3';
				break;
			case this.praBtn:
				this.learnBtnOnClick();
				break;
		}
	}

	private learnBtnOnClick(): void {
		let roleSkillInfo: GuildRoleSkillInfo = Guild.ins().getSkllInfoByIndex(this.curRole);
		if (Assert(roleSkillInfo.guildSkillInfo[this.selectSkillID - 1], `仙盟技能学习报错 curRole:${this.curRole},selectSkillID:${this.selectSkillID}`)) {
			return;
		}
		let level: number = roleSkillInfo.guildSkillInfo[this.selectSkillID - 1].level;
		let buildLevel: number = Guild.ins().getBuildingLevels(GuildBuilding.GUILD_LIANGONGFANG - 1);

		let maxLevel: number = GlobalConfig.GuildCommonSkillConfig[this.selectSkillID].length;
		let csInfoNext: GuildCommonSkillConfig = level >= maxLevel ? null : this.getCommonSkillDP(this.selectSkillID, level + 1);
		if (buildLevel == 0 || level >= GlobalConfig.GuildConfig.commonSkillLevels[buildLevel - 1]) {
			UserTips.ins().showTips("达到上限，请先提升练功房");
			return;
		}
		if (csInfoNext.contribute > Guild.ins().myCon) {
			UserTips.ins().showTips("贡献不足");
			return;
		}
		else if (Actor.gold < csInfoNext.money) {
			UserTips.ins().showTips("金币不足");
			return;
		}
		Guild.ins().sendLearnGuildSkill(this.curRole, this.selectSkillID);
	}

	private selectSkill(selectId: number): void {
		this.selectIconID = selectId;
		this.selectBmp.x = this.selectBmpX[selectId];
		this.selectBmp.y = this.selectBmpY[selectId];
		this.selectPraSkill(selectId);
	}

	/**
	 * 获取战斗力接口
	 */
	public getTotalPower(): number {
		let roleSkillInfo: GuildRoleSkillInfo = Guild.ins().getSkllInfoByIndex(this.curRole);
		let power: number = 0;
		for (let i = 1; i < 4; i++) {
			let level: number = roleSkillInfo.guildSkillInfo[this.selectSkillID - 1].level;
			if (level > 0) {
				let csInfoNext: GuildCommonSkillConfig = this.getCommonSkillDP(i, level);
				power += UserBag.getAttrPower(csInfoNext.attrs);
			}
		}
		return power;
	}

	private selectPraSkill(selectId: number): void {
		this.praGroup.visible = true;
		this.selectSkillID = selectId;
		this.selectSkillType = 1;
		let roleSkillInfo: GuildRoleSkillInfo = Guild.ins().getSkllInfoByIndex(this.curRole);
		if (!roleSkillInfo) return;
		let level: number = roleSkillInfo.guildSkillInfo[this.selectSkillID - 1].level;
		let csInfo: GuildCommonSkillConfig = this.getCommonSkillDP(this.selectSkillID, level);
		let maxLevel: number = this.getCommonSkillLength(this.selectSkillID);
		let buildLevel: number = Guild.ins().getBuildingLevels(GuildBuilding.GUILD_LIANGONGFANG - 1);
		this.praCurBase.textColor = level == 0 ? 0x72D70B : 0xDEDDD0;
		this.praCurBase.text = level == 0 ? "未学习" : AttributeData.getAttStr(csInfo.attrs, 0, 1, "：", true);
		this.praName.text = GlobalConfig.GuildConfig.commonSkillNames[this.selectSkillID - 1];
		this.learnLab.visible = (buildLevel < 1 || level >= GlobalConfig.GuildConfig.commonSkillLevels[buildLevel - 1]);
		this.praBtn.visible = !this.learnLab.visible;
		if (level < maxLevel) {
			let csInfoNext: GuildCommonSkillConfig = this.getCommonSkillDP(this.selectSkillID, level + 1);
			this.praNextLab.text = AttributeData.getAttStr(csInfoNext.attrs, 0, 1, "：", true);
			let colorStr: string = Guild.ins().myCon >= csInfoNext.contribute ? "DEDDD0" : "f3311e";
			let temp: string = `<font color='#${colorStr}'>` + csInfoNext.contribute + "</font>";
			this.praCost.textFlow = (new egret.HtmlTextParser()).parser(temp);
			this.praCost0.text = csInfoNext.money + "";
			this.praCost0.textColor = Actor.gold >= csInfoNext.money ? 0xDEDDD0 : 0xf3311e;
			this.updateMc();
		}
		else {
			this.praNextLab.text = "已满级";
			this.praCost.text = "0";
			this.praCost0.text = "0";
			this.praCost0.textColor = 0xDEDDD0;
			DisplayUtils.removeFromParent(this.mc);
		}
		this.lvTxt.text = `等级${level}`;
	}
	private updateMc() {
		if (!GuildRedPoint.ins().roleSkillTabs[this.curRole][this.selectSkillID] || this.learnLab.visible) {
			DisplayUtils.removeFromParent(this.mc);
			return;
		}

		if (!this.mc)
			this.mc = new MovieClip;

		if (!this.mc.parent) {
			this.mc.x = this.praBtnMc.width / 2;
			this.mc.y = this.praBtnMc.height / 2 + 2;
			this.praBtnMc.addChild(this.mc);
		}

		this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
	}

	private getCommonSkillDP(skillID: number, level: number): GuildCommonSkillConfig {
		let infos: GuildCommonSkillConfig[] = GlobalConfig.GuildCommonSkillConfig[skillID];
		if (level == 0) {
			return infos[1];
		}
		for (var key in infos) {
			let element = infos[key];
			if (element.level == level)
				return element;
		}
		return null;
	}

	private getCommonSkillLength(skillId: number): number {
		let infos: GuildCommonSkillConfig[] = GlobalConfig.GuildCommonSkillConfig[skillId];
		let len: number = 0;
		for (var key in infos) {
			len++;
		}
		return len;
	}
}