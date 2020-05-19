class HomeBossItem extends BaseItemRender {
	// private timeTxt: eui.Label;

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

	public config: any;
	public nameTxt0: eui.Label;
	public boxBtn: eui.Button;

	constructor() {
		super();
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
		this.list.dataProvider = new eui.ArrayCollection(config.showReward);
		let isDie: boolean = model.bossState == 2;
		this.bar.slideDuration = 0;
		this.boxBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.infoTxt0.touchEnabled = true;

		let levelConfig: BossHomeConfig;
		for (let k in GlobalConfig.BossHomeConfig) {
			if (GlobalConfig.BossHomeConfig[k].boss.lastIndexOf(model.id) != -1) {
				levelConfig = GlobalConfig.BossHomeConfig[k];
				break
			}
		}

		if (UserVip.ins().lv >= levelConfig.vip) {
			if (config.zsLevel > 0) {
				canChallenge = UserZs.ins().lv >= config.zsLevel;
				color = canChallenge ? "23CA23" : "f15a25";
				limitStr = `${config.zsLevel}转开启`;
			} else {
				canChallenge = Actor.level >= config.level;
				color = canChallenge ? "23CA23" : "f15a25";
				limitStr = `${config.level}级开启`;
			}
		} else {
			canChallenge = false;
			color = canChallenge ? "23CA23" : "f15a25";
			limitStr = `${UserVip.formatLvStr(levelConfig.vip)}开放`;
		}
		if (isDie) limitStr = "已击杀";
		this.levelRequire.text = limitStr;
		this.bar.value = model.hp;
		this.bar.maximum = 100;
		boss = GlobalConfig.MonstersConfig[config.bossId];

		// this.timeTxt.visible = isDie;
		// if (this.timeTxt.visible) {
		// 	this.updateTime();
		// 	TimerManager.ins().doTimer(100, 0, this.updateTime, this);
		// }

		this.challengeBtn.visible = !isDie;
		this.challengeBtn.name = "homeChallenge";
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
				TimerManager.ins().remove(this.updateCDTime, this);
			}
		}

		this.barBg.visible = this.bar.visible = true;
		if (boss) {
			this.head.source = `monhead${boss.head}_png`;
			let levelStr: string = config.zsLevel > 0 ? `${config.zsLevel}转` : `${config.level}级`;
			this.nameTxt0.text = levelStr;
			this.nameTxt.text = `${boss.name}`;
		}


		this.challengeBtn.visible = this.challengeBtn.visible && canChallenge;
		this.needLv.visible = !this.challengeBtn.visible;
	}

	private updateCDTime(): void {
		let cdTime: number = (UserBoss.ins().cdTime - egret.getTimer()) / 1000;
		this.challengeBtn.label = `冷却中（${cdTime.toFixed(0)}）`;
		if (cdTime <= 0) {
			this.challengeBtn.label = '挑战';
			this.challengeBtn.enabled = true;
			this.challengeBtn.touchEnabled = true;
			TimerManager.ins().remove(this.updateCDTime, this);
		}
	}

	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.boxBtn:
				WarnWin.show(this.config.rewardsDesc, null, this, null, null, "sure");
				break
		}
	}
}