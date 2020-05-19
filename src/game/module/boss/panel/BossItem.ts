class BossItem extends BaseItemRender {

	private timeTxt: eui.Label;
	// private infoTxt: eui.Label;
	private infoTxt0: eui.Label;
	private nameTxt: eui.Label;

	private challengeBtn: eui.Button;

	private bar: eui.ProgressBar;

	private head: eui.Image;
	private bg: eui.Image;
	private barBg: eui.Image;

	private list: eui.List;

	private needLv: eui.Group;

	private levelRequire: eui.Label;

	private carnival: eui.Label;

	public config: any;
	public nameTxt0: eui.Label;
	public boxBtn: eui.Button;
	// public config: PublicBossConfig;

	private ac = new eui.ArrayCollection();
	constructor() {
		super();
	}

	public childrenCreated() {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.list.dataProvider = this.ac;

	}

	public dataChanged(): void {
		let limitStr: string = '';
		let color: string = '';
		let canChallenge: boolean;
		let boss: MonstersConfig;
		let model: WorldBossItemData = this.data;
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[model.id];
		this.list.itemRenderer = ItemBase;
		this.config = config;
		EuiUtil.replaceAC(this.ac, config.showReward);
		let isDie: boolean = model.isDie;
		// this.infoTxt.touchEnabled = true;
		// this.infoTxt.addEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.boxBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);

		this.infoTxt0.touchEnabled = true;

		canChallenge = UserBoss.isCanChallenge(config);
		if (config.samsaraLv > 0) {
			limitStr = `${config.showName}开启`;
		}
		else {
			if (config.zsLevel > 0) {
				limitStr = `${config.zsLevel}转开启`;
			} else {
				limitStr = `${config.level}级开启`;
			}
		}
		color = canChallenge ? "23CA23" : "f15a25";
		this.levelRequire.text = limitStr;

		// this.infoTxt.textFlow = (new egret.HtmlTextParser()).parser(`争夺：<u><a href="event:2">${model.people}人</a></u>${model.challengeing ? `<font color="#23C42A">（挑战中）</font>` : ``}`);

		// this.infoTxt.visible = !isDie;

		this.bar.value = model.hp;
		this.bar.maximum = 100;
		boss = GlobalConfig.MonstersConfig[config.bossId];

		this.timeTxt.visible = isDie;
		if (this.timeTxt.visible) {
			this.updateTime();
			TimerManager.ins().doTimer(100, 0, this.updateTime, this);
		}
		let actData = Activity.ins().getActivityDataById(45) as ActivityType24Data;
		if (actData && actData.isOpenActivity() && config.type == 2) {
			this.carnival.visible = this.timeTxt.visible;
		}
		else {
			this.carnival.visible = false;
		}

		TimerManager.ins().remove(this.updateCDTime, this);

		this.challengeBtn.visible = !isDie;
		if (config.type == UserBoss.BOSS_SUBTYPE_QMBOSS) {
			this.challengeBtn.name = "publicChallenge";
		} else if (config.type == UserBoss.BOSS_SUBTYPE_SHENYU) {
			this.challengeBtn.name = "shenyuChallenge";
		}
		if (this.challengeBtn.visible) {
			let cdTime: number = (UserBoss.ins().cdTime - egret.getTimer()) / 1000;
			if (model.challengeing && cdTime > 0) {
				this.challengeBtn.enabled = false;
				this.challengeBtn.touchEnabled = false;
				this.updateCDTime();
				TimerManager.ins().doTimer(100, 0, this.updateCDTime, this);
			}
			else {
				this.challengeBtn.label = '挑战';
				this.challengeBtn.enabled = true;
				this.challengeBtn.touchEnabled = true;
			}
		}

		this.barBg.visible = this.bar.visible = true;
		if (boss) {
			this.head.source = `monhead${boss.head}_png`;
			let levelStr: string;
			if (config.samsaraLv > 0) {
				levelStr = config.showName;
			} else if (config.zsLevel > 0) {
				levelStr = `${config.zsLevel}转`;
			} else {
				levelStr = `${config.level}级`;
			}
			this.nameTxt0.text = levelStr;
			this.nameTxt.text = `${boss.name}`;
		}

		this.needLv.visible = !canChallenge;
		this.challengeBtn.visible = this.challengeBtn.visible && canChallenge;
	}

	private updateCDTime(): void {
		let cdTime: number = (UserBoss.ins().cdTime - egret.getTimer()) / 1000;
		this.challengeBtn.label = `冷却中（${cdTime.toFixed(0)}）`;
		if (cdTime <= 0) {
			this.challengeBtn.label = '挑战';
			this.challengeBtn.enabled = true;
			this.challengeBtn.touchEnabled = true;
			TimerManager.ins().remove(this.updateCDTime, this);
			this.bar.value = 100;
		}
	}

	private updateTime(): void {
		let model: WorldBossItemData = this.data;
		let time: number = model.relieveTime - egret.getTimer();
		this.timeTxt.text = `${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}后重生`;
		if (time <= 0) {
			this.timeTxt.visible = false;
			this.carnival.visible = false;
			UserBoss.ins().sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_QMBOSS);
			TimerManager.ins().remove(this.updateTime, this);
		}
	}


	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.boxBtn:
				WarnWin.show(this.config.rewardsDesc, null, this, null, null, "sure");
				break
		}
	}

	private onRemove() {
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		TimerManager.ins().removeAll(this);
	}
}