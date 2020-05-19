/**
 * Created by Peach.T on 2017/12/26.
 */
class GuardMainUI extends BaseEuiView {

	public RoleInformation: eui.Group;
	public player1: eui.Group;
	public bloodBar0: eui.ProgressBar;
	public littleBuff1: eui.Image;
	public player1touxiang: eui.Image;
	public CountDown1: eui.Label;
	public player2: eui.Group;
	public bloodBar1: eui.ProgressBar;
	public littleBuff2: eui.Image;
	public player2touxiang: eui.Image;
	public CountDown2: eui.Label;
	public player3: eui.Group;
	public bloodBar2: eui.ProgressBar;
	public littleBuff3: eui.Image;
	public player3touxiang: eui.Image;
	public CountDown3: eui.Label;
	public leftTimeGroup: eui.Group;
	public lastTime: eui.Label;
	public bossBloodGroup: eui.Group;
	public head: eui.Image;
	public grayImg: eui.Image;
	public bloodBar: eui.ProgressBar;
	public hudun: eui.Group;
	public hudunbloodBar: eui.ProgressBar;
	public lvTxt: eui.Label;
	public nameTxt: eui.Label;
	public tipBtn: eui.Button;
	public fubenSkillGroup: eui.Group;
	public skillGroup1: eui.Group;
	public skillBtn1: eui.Button;
	public skilltips1: eui.Label;
	public skillcostnum1: eui.Label;
	public skillcost1: eui.Label;
	public skillGroup2: eui.Group;
	public skillBtn2: eui.Button;
	public skilltips2: eui.Label;
	public skillcost2: eui.Label;
	public skillcostnum2: eui.Label;
	public skillGroup3: eui.Group;
	public skillBtn3: eui.Button;
	public skilltips3: eui.Label;
	public skillcost3: eui.Label;
	public skillcostnum3: eui.Label;
	public refreshHints: eui.Label;
	public refreshHints0: eui.Label;
	public refreshHints1: eui.Label;
	public missionInformation: eui.Group;
	public zongshu0: eui.Label;
	public dangqianbo: eui.Label;
	public dangqianbo1: eui.Label;
	public dangqianbo2: eui.Label;
	public zongshu: eui.Label;
	public zongshu2: eui.Label;
	public jifen: eui.Label;
	public luckyBossBtn: eui.Button;
	public help: eui.Button;
	public redPoint: eui.Image;
	public cdGroup1: eui.Group;
	public cdGroup2: eui.Group;
	public cdGroup3: eui.Group;

	private time1: number;
	private time2: number;
	private time3: number;
	private time: number;

	private shortcutCD1: ShortcutCD;
	private shortcutCD2: ShortcutCD;
	private shortcutCD3: ShortcutCD;

	constructor() {
		super();
		this.skinName = "guardGodWeaponUISkind";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.help, this.onHelp);
		this.addTouchEvent(this.luckyBossBtn, this.onLuckBoss);
		this.addTouchEvent(this.skillBtn1, this.useSkill);
		this.addTouchEvent(this.skillBtn2, this.useSkill);
		this.addTouchEvent(this.skillBtn3, this.useSkill);
		this.observe(GameLogic.ins().postHpChange, this.updateHead);
		this.observe(UserFb.ins().postGuardCopyInfo, this.delayUpdateInfo);
		this.observe(UserSkill.ins().doBuff, this.doBuff);
		this.observe(UserSkill.ins().doRemoveBuff, this.doBuff);
		this.observe(UserFb.ins().postGuardUseSkill, this.useSkillHandler);
		if (GuardWeaponModel.ins().leftTime != undefined) {
			this.beginTime();
		}
		else {
			this.observe(UserFb.ins().postGuardLeftTime, this.beginTime);
		}

		this.updateHeadIcon();
		this.initHp();
		this.updateInfo();

		this.skillBtn1.icon = `${GlobalConfig.GuardGodWeaponConf.sSkillIcon[0]}`;
		this.skillBtn2.icon = `${GlobalConfig.GuardGodWeaponConf.sSkillIcon[1]}`;
		this.skillBtn3.icon = `${GlobalConfig.GuardGodWeaponConf.sSkillIcon[2]}`;
		this.skillcostnum1.text = `${GlobalConfig.GuardGodWeaponConf.sSkillCost[0]}`;
		this.skillcostnum2.text = `${GlobalConfig.GuardGodWeaponConf.sSkillCost[1]}`;
		this.skillcostnum3.text = `${GlobalConfig.GuardGodWeaponConf.sSkillCost[2]}`;

		// this.skillBtn1.filters = FilterUtil.ARRAY_GRAY_FILTER;
		// this.skillBtn2.filters = FilterUtil.ARRAY_GRAY_FILTER;
		// this.skillBtn3.filters = FilterUtil.ARRAY_GRAY_FILTER;
		this.shortcutCD1 = new ShortcutCD(40);
		this.cdGroup1.addChild(this.shortcutCD1);

		this.shortcutCD2 = new ShortcutCD(40);
		this.cdGroup2.addChild(this.shortcutCD2);

		this.shortcutCD3 = new ShortcutCD(40);
		this.cdGroup3.addChild(this.shortcutCD3);
	}

	public close() {

	}

	private updateHeadIcon(): void {
		let len = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < 3; i++) { //头像
			let img = this[`player${i + 1}touxiang`];
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role) {
				img.source = `mainui_p1_json.main_role_head${role.job}`;
			}
			else {
				img.visible = false;
			}
		}
	}

	private onHelp(): void {
		ViewManager.ins().open(ZsBossRuleSpeak, 42);
	}

	private updateBuffInfo() {
		this.isDelayBuff = false;
		let len = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			this.setBuff(i);
		}
	}

	private isDelayBuff:boolean = false;
	private doBuff(): void {
		if(!this.isDelayBuff) {
			this.isDelayBuff = true;
			TimerManager.ins().doTimer(80, 1, this.updateBuffInfo, this);
		}
	}

	private setBuff(index: number): void {
		let role = EntityManager.ins().getMainRole(index);
		if (role) {
			this[`littleBuff${index + 1}`].visible = role.hasBuff(59100);
		}
	}

	public skillCd1: number = 0;
	public skillCd2: number = 0;
	public skillCd3: number = 0;

	private useSkill(e: egret.TouchEvent): void {
		let btn = e.target;
		let index = 1;
		switch (btn) {
			case this.skillBtn1:
				index = 1;
				break;
			case this.skillBtn2:
				index = 2;
				break;
			case this.skillBtn3:
				index = 3;
				if (UserSkill.ins().hejiEnable) {
					UserTips.ins().showTips("怒气已满");
					return;
				}
				break;
		}
		let data = GuardWeaponModel.ins().guardCopyInfo;
		let time = this[`skillCd${index}`];
		if (time > 0) {
			UserTips.ins().showTips(`技能CD中,还剩${time}秒`);
		}
		else if (data.score < GlobalConfig.GuardGodWeaponConf.sSkillCost[index - 1]) {
			UserTips.ins().showTips("技能积分不足");
		}
		else {
			UserFb.ins().guardUseSkill(index);
		}
	}

	private useSkillHandler(index: number): void {
		this[`shortcutCD${index}`].play(GlobalConfig.GuardGodWeaponConf.sSkillCd[index - 1]);
		this[`skillCd${index}`] = GlobalConfig.GuardGodWeaponConf.sSkillCd[index - 1];
		let str = `|C:0x00ff00&T:${GlobalConfig.GuardGodWeaponConf.sSkillUseText[index - 1]}|`;
		UserTips.ins().showTips(str);
	}

	private lastScore: number;
	private lastWave: number;

	private isDelayUpdateInfo:boolean = false;
	private delayUpdateInfo() {
		if(!this.isDelayUpdateInfo) {
			this.isDelayUpdateInfo = true;
			TimerManager.ins().doTimer(200, 1, this.updateInfo, this);
		}
	}

	private updateInfo(): void {
		this.isDelayUpdateInfo = false;

		let data = GuardWeaponModel.ins().guardCopyInfo;
		this.refreshHints0.text = `（${data.wave}/${GuardWeaponModel.ins().getMaxWaves()}）`;
		let time;
		if (this.lastWave != data.wave) {
			time = GuardWeaponModel.ins().getWaveTime(data.wave);
			this.refreshHints1.text = `${time}`;
		}
		this.lastWave = data.wave;
		this.dangqianbo1.text = `${data.minMonsterWave}`;
		this.dangqianbo2.text = `${data.minMonsteNums}`;
		this.zongshu2.text = `${data.monsterNum}`;
		this.zongshu0.text = `${data.score}`;
		this.redPoint.visible = GuardWeaponModel.ins().isCanCallBoss();

		let value;
		if (this.lastScore == undefined) {
			value = data.score;
		}
		else {
			value = data.score - this.lastScore;
		}
		this.lastScore = data.score;
		if (value > 0) {
			let str = `|C:0x00ff00&T:积分+${value}|`;
			UserTips.ins().showTips(str);
		}
	}

	private initHp(): void {
		for (let i: number = 0; i < 3; i++) { //头像
			let progress: eui.ProgressBar = this[`bloodBar${i}`];
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role) {
				let currentHp = role.getAtt(AttributeType.atHp);
				let maxHp = role.getAtt(AttributeType.atMaxHp);
				progress.maximum = 100;
				progress.value = Math.floor(currentHp * 100 / maxHp);
			}
			else {
				progress.visible = false;
			}
		}
	}


	private updateHead([target, hp, oldHp]: [CharMonster, number, number]): void {
		if (!(target instanceof CharRole) || hp == oldHp) return;

		let role = target.infoModel as Role;
		let progress: eui.ProgressBar = this[`bloodBar${role.index}`];
		let currentHp = role.getAtt(AttributeType.atHp);
		let maxHp = role.getAtt(AttributeType.atMaxHp);
		progress.maximum = 100;
		progress.value = currentHp * 100 / maxHp;

		let img = this[`player${role.index + 1}touxiang`];
		if (currentHp == 0) {
			img.filters = FilterUtil.ARRAY_GRAY_FILTER;
			this[`time${role.index + 1}`] = GlobalConfig.GuardGodWeaponConf.recoverCD;
		}
		else {
			img.filters = null;
			this[`time${role.index + 1}`] = 0;
			this[`CountDown${role.index + 1}`].visible = false;
		}
	}

	private setTimeLabel(index: number): void {
		this[`time${index}`]--;
		if (this[`time${index}`] > 0) {
			this[`CountDown${index}`].visible = true;
			this[`CountDown${index}`].text = this[`time${index}`].toString();
		}
		else {
			this[`CountDown${index}`].visible = false;
		}
	}

	private onLuckBoss(): void {
		ViewManager.ins().open(GuardCallBossWin);
	}

	private isBegin;

	private beginTime(): void {
		if (this.isBegin) return;
		this.time = GuardWeaponModel.ins().leftTime;
		this.isBegin = true;
		TimerManager.ins().doTimer(1000, 0, this.runTime, this);
	}

	private runTime(): void {
		this.time -= 1;
		if (this.time > 0) {
			this.lastTime.text = DateUtils.getFormatBySecond(this.time, DateUtils.TIME_FORMAT_12)
		} else {
			this.lastTime.text = "";
			TimerManager.ins().remove(this.runTime, this);
		}

		let str = this.refreshHints1.text;
		let time = +(str);
		if (time > 0) {
			time--;
			this.refreshHints1.text = `${time}`;
		}

		for (let i = 1; i <= 3; i++) {
			if (this[`time${i}`] > 0) this.setTimeLabel(i);
			this.setSkillCd(i);
		}

	}

	private setSkillCd(index: number): void {
		if (this[`skillCd${index}`] > 0) {
			this[`skillCd${index}`]--;
		}
		// let data = GuardWeaponModel.ins().guardCopyInfo;
		// let isCanUse = data.score >= GlobalConfig.GuardGodWeaponConf.sSkillCost[index - 1] && this[`skillCd${index}`] == 0;
		// if (isCanUse) {
		// 	this[`skillBtn${index}`].filters = null;
		// } else {
		// 	this[`skillBtn${index}`].filters = FilterUtil.ARRAY_GRAY_FILTER;
		// }
	}

}

ViewManager.ins().reg(GuardMainUI, LayerManager.UI_Main);