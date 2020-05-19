/**
 * Created by Administrator on 2017/6/1.
 */
class GuildRedPoint extends BaseSystem {
	public static Tab_LianGong = 0;
	/** 仙盟红点 */
	hanghui: boolean = false;

	/** 分配奖励 */
	sendReward: boolean = false;

	/** 红包 */
	redBag: boolean = false;

	/** 天盟争霸 */
	sczb: boolean = false;

	/** 仙盟大厅 */
	hhdt: boolean = false;

	/** 管理页签 */
	gldt: boolean = false;

	/** 仙盟BOSS */
	hhBoss: boolean = false;

	/** 每日奖励 */
	dayReward: boolean = false;

	/** 神树*/
	guildFire: boolean = false;

	/** 人物头像红点*/
	roleTabs: Map<Map<boolean>> = {};

	/** 练功房每个人物的技能红点*/
	roleSkillTabs: Map<Map<boolean>> = {};

	/** 练功房分页红点*/
	liangongRed: boolean = false;

	constructor() {
		super();

		this.roleTabs = {};
		this.roleSkillTabs = {};

		this.associated(this.postDayReward,
			GuildWar.ins().postDayRewardInfo
		);

		this.associated(this.postSczb,
			this.postDayReward,
			this.postRedBag
		);

		this.associated(this.postSendReward,
			GuildWar.ins().postAssignsReward,
			GuildWar.ins().postSendRewardSuccess
		);

		this.associated(this.postRedBag,
			this.postSendReward,
			GuildWar.ins().postRedBagInfo,
		);

		this.associated(this.postHhdt,
			Guild.ins().postApplyInfos,
			Guild.ins().postJoinGuild,
			Guild.ins().postMyGuildInfo,
			this.postLianGongRedPoint,
			this.postGldt
		);

		this.associated(this.postGldt,
			Guild.ins().postUpBuilding,
			Guild.ins().postManageList,
			Guild.ins().postGuildMoney,
			Guild.ins().postMyGuildInfo
		);

		this.associated(this.postHanghui,
			this.postSendReward,
			this.postSczb,
			this.postHhdt,
			this.postGuildFire,
			this.postLianGongRedPoint,
			Actor.ins().postLevelChange,
			GuildFB.ins().postGuildFubenInfo,
			GuildRobber.ins().postGuildRobberInfo,
			GuildWar.ins().postGuildWarStarInfo,
			Guild.ins().postGuildInfo,
			this.postHanghuiBoss,
		);

		this.associated(this.postHanghuiBoss,
			GuildBoss.ins().postGuildBossDetailChange,
			GuildBoss.ins().postGuildBossInfoChange
		);

		this.associated(this.postGuildFire,
			UserBag.ins().postItemAdd,
			UserBag.ins().postItemDel,
			Guild.ins().postUpdateFire
		);
		this.associated(this.postLianGongRedPoint,
			Guild.ins().postLearnGuildSkill,
			Guild.ins().postUpBuilding,
			Guild.ins().postGuildSkillInfo,
			Guild.ins().postMyGuildInfo
		);

	}

	public static ins(): GuildRedPoint {
		return super.ins() as GuildRedPoint;
	}

	postGuildFire(): boolean {
		let oldv = this.guildFire;

		let conf = GlobalConfig.GuildConfig;
		let item = UserBag.ins().getBagItemById(conf.bonfireItem);
		if (item && item.count >= (conf.bonfirecaution || 1)) {
			this.guildFire = true;
		} else {
			this.guildFire = false;
		}
		return this.guildFire != oldv;
	}

	postHhdt(): boolean {
		let oldv = this.hhdt;
		this.hhdt = Guild.ins().hasApplys() || this.gldt;
		return this.hhdt != oldv;
	}

	postGldt(): boolean {
		let oldv = this.gldt;
		this.gldt = Guild.ins().isUpGradeBuilding();
		return this.gldt != oldv;
	}

	postDayReward(): boolean {
		let oldv = this.dayReward;
		this.dayReward = GuildWar.ins().getModel().canGetDay && !GuildWar.ins().getModel().getDayReward;
		return this.dayReward != oldv;
	}

	postSczb(): number | boolean {
		let oldv = this.sczb;
		this.sczb = this.dayReward || this.redBag;
		return this.sczb != oldv;
	}

	postRedBag(): number | boolean {
		let oldv = this.redBag;
		this.redBag = GuildWar.ins().getModel().isHaveRedBag();
		return this.redBag != oldv;
	}

	postSendReward(): number | boolean {
		let oldv = this.sendReward;
		this.sendReward = GuildWar.ins().getModel().canSendReward;
		return this.sendReward != oldv;
	}

	postHanghui(): number | boolean {
		let oldv = this.hanghui;
		let t: boolean = false;
		if (GuildFB.ins().hasbtn()) //仙盟副本红点
			t = true;
		if ((Guild.ins().guildID == undefined || Guild.ins().guildID == 0) && Actor.level > 69) //没有仙盟
			t = true;

		this.hanghui = t ||
			this.sendReward ||
			this.redBag ||
			this.sczb ||
			this.hhBoss ||
			this.guildFire ||
			this.liangongRed ||
			GuildWar.ins().getModel().isWatStart ||
			this.hhdt;
		return this.hanghui != oldv;
	}

	postHanghuiBoss(): number | boolean {
		let oldv = this.hhBoss;
		this.hhBoss = GuildBoss.ins().getBossRewardState() || GuildBoss.ins().getBossChallenge();
		return this.hhBoss != oldv;
	}

	public postLianGongRedPoint() {
		this.liangongRed = false;
		let tab = GuildRedPoint.Tab_LianGong;
		let len: number = SubRoles.ins().subRolesLen;
		for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
			if (!role)
				continue;
			let roleSkillInfo: GuildRoleSkillInfo = Guild.ins().getSkllInfoByIndex(role.index);
			if (!roleSkillInfo)
				continue;
			if (!this.roleTabs[tab])
				this.roleTabs[tab] = {};
			this.roleTabs[tab][roleIndex] = false;
			//角色每个练功技能
			for (let selectSkillID = 1; selectSkillID <= 3; selectSkillID++) {
				if (!this.roleSkillTabs[roleIndex])
					this.roleSkillTabs[roleIndex] = {};
				this.roleSkillTabs[roleIndex][selectSkillID] = false;

				let maxLevel: number = GlobalConfig.GuildCommonSkillConfig[selectSkillID].length;
				let level: number = roleSkillInfo.guildSkillInfo[selectSkillID - 1].level;
				if (level >= maxLevel)
					continue;
				let csInfoNext: GuildCommonSkillConfig = this.getCommonSkillDP(selectSkillID, level + 1);
				if (!csInfoNext)
					continue;
				if (csInfoNext.contribute > Guild.ins().myCon) {
					// UserTips.ins().showTips("贡献不足");
					continue;
				}
				if (Actor.gold < csInfoNext.money) {
					// UserTips.ins().showTips("金币不足");
					continue;
				}
				let buildLevel: number = Guild.ins().getBuildingLevels(GuildBuilding.GUILD_LIANGONGFANG - 1);
				let learnLab = (buildLevel < 1 || level >= GlobalConfig.GuildConfig.commonSkillLevels[buildLevel - 1]);
				if (learnLab) {
					// UserTips.ins().showTips("练功房等级不足");
					continue;
				}

				this.roleSkillTabs[roleIndex][selectSkillID] = true;
				this.liangongRed = true;
			}
			for (let r in this.roleSkillTabs[roleIndex]) {
				if (this.roleSkillTabs[roleIndex][r]) {
					this.roleTabs[tab][roleIndex] = true;
					break;
				}
			}

		}

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
}

namespace GameSystem {
	let guildredpoint = GuildRedPoint.ins.bind(GuildRedPoint);
}