class GuildBossDetailWin extends BaseEuiView {
	private closeBtn: eui.Button;
	private chanllage: eui.Button;
	//自己仙盟BOSS血条
	private bosshp: eui.ProgressBar;
	//奖励进度 100-BOSS血量进度
	private rewardBar: eui.ProgressBar;
	private index: number = 0;
	private bgClose: eui.Rect;
	private cantchanllage: eui.Label;
	private bossname: eui.Label;
	private chanllagecount: eui.Label;
	private rankBtn: eui.Button;
	private bossImage: eui.Image;
	private state:eui.Label;
	constructor() {
		super();
		this.skinName = "GuildBossTipSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}


	public open(...param: any[]): void {
		this.index = param[0];
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.chanllage, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.rankBtn, this.onTap);
		// this.addTouchEvent(this.rewardBtn, this.onTap);\
		this.observe(GuildBoss.ins().postGuildBossDetailChange, this.setView);
		this.observe(GuildBoss.ins().postGuildBossInfoChange, this.setView);
		this.observe(GuildBoss.ins().postChallengeSuccess, this.challengeSuccess);
		this.observe(GuildBoss.ins().postGuildBossRankInfoChange, this.setRank);
		// this.setView();
		// this.setBosInfo();
		GuildBoss.ins().sendGetBossInfo();
		GuildBoss.ins().sendGetBossRankInfo(this.index + 1);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.chanllage, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.rankBtn, this.onTap);
		// this.removeTouchEvent(this.rewardBtn, this.onTap);
		this.removeObserve();
	}

	private setView(): void {
		this.chanllagecount.text = `挑战次数${GuildBoss.ins().leftTimes}/${GlobalConfig.GuildBossConfig.dayTimes}`;
		// this.selfname.text = Guild.ins().guildName;
		let id: number = GuildBoss.ins().passId;
		this.chanllagecount.visible = GuildBoss.ins().isOpen() && (id == this.index);

		this.chanllage.visible = GuildBoss.ins().isOpen() && (this.index <= id);
		this.cantchanllage.visible = GuildBoss.ins().isOpen() && !this.chanllage.visible;

		let config: GuildBossInfoConfig = GlobalConfig.GuildBossInfoConfig[this.index + 1];
		let bossConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.boss["monId"]];
		this.bossname.text = bossConfig.name;

		this.bossImage.source = config.ShowImg;//`gb_b${this.index + 1}`;
		let state: number = GuildBoss.ins().passRecord[this.index + 1];
		for (let i: number = 0; i < config.passAwards.length; i++) {
			this[`itemicon${i}`].isShowName(false);
			this[`itemicon${i}`].data = config.passAwards[i];
		}

		let rewardConfig = GlobalConfig.GuildBossHpAwardsConfig[this.index + 1];
		for (let i: number = 3; i < 7; i++) {
			this[`itemicon${i}`].isShowName(false);
			this[`itemicon${i}`].data = rewardConfig[i - 2].awards[0];
		}



		if (this.index < id) {
			this.bosshp.value = 0;
			this.bosshp.maximum = 0;
			this.rewardBar.value = 100;
			this.rewardBar.maximum = 100;
		} else if (this.index == id) {
			let selfValue: number = 0;
			selfValue = Math.ceil(((bossConfig.hp - GuildBoss.ins().bossHP) / bossConfig.hp) * 10000) / 100;
			this.bosshp.maximum = 100;
			this.bosshp.value = selfValue;
			this.rewardBar.value = 100 - selfValue;
			this.rewardBar.maximum = 100;
		} else {
			this.bosshp.value = 100;
			this.bosshp.maximum = 100;

			this.rewardBar.value = 0;
			this.rewardBar.maximum = 100;
		}

		this.chanllage.enabled = true;
		if (state == 0 || this.bosshp.value ) {
			this.chanllage.label = "挑 战";
		} else if (state == 1) {
			this.chanllage.label = "领 取";
		} else {
			this.chanllage.label = "已领取";
			this.chanllage.enabled = false;
		}

		this.state.visible = !GuildBoss.ins().isOpen();
		if( this.state.visible ){
			this.cantchanllage.visible = this.chanllage.visible = false;
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(GuildBossWin);
				break;
			case this.chanllage:
				if (this.chanllage.label == "挑 战") {
					if (GuildBoss.ins().challengeTime > GameServer.serverTime) {
						UserTips.ins().showTips("|C:0x35e62d&T:正在挑战中，请稍后|");
						return;
					}
					if (GuildBoss.ins().leftTimes <= 0) {
						UserTips.ins().showTips("没有挑战次数");
						return;
					}
					GuildBoss.ins().sendChallengeBoss();
				} else if (this.chanllage.label == "领 取") {
					GuildBoss.ins().sendGetBossReward(this.index + 1);
				}
				break;
			case this.rankBtn:
				ViewManager.ins().open(GuildBossRankWin, this.index);
				break;
			case this.bgClose:
				ViewManager.ins().close(GuildBossDetailWin);
				break;
			// case this.rewardBtn:
			// 	GuildBoss.ins().sendGetBossReward();
			// 	break;
		}
	}

	private challengeSuccess(): void {
		ViewManager.ins().close(GuildBossWin);
		ViewManager.ins().close(GuildMap);
		ViewManager.ins().close(GuildBossDetailWin);
	}


	private guildname0: eui.Label;
	private guildname1: eui.Label;
	private guildname2: eui.Label;

	private rankGroup0: eui.Group;
	private rankGroup1: eui.Group;
	private rankGroup2: eui.Group;
	private setRank(): void {
		let rankArr: any[] = GuildBoss.ins().guildRankDic[this.index + 1];
		let config: GuildBossInfoConfig = GlobalConfig.GuildBossInfoConfig[this.index + 1];
		let bossConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.boss["monId"]];

		for (let i: number = 0; i < 3; i++) {
			if (rankArr && rankArr[i]) {
				this[`rankGroup${i}`].visible = true;
				this[`guildname${i}`].text = rankArr[i].name;

				let selfValue: number = 0;
				let perCount: number = Math.ceil((rankArr[i].damage / bossConfig.hp) * 10000) / 100;
				selfValue = perCount > 100 ? 100 : perCount;
				this[`hpbar${i}`].value = selfValue;
				this[`hpbar${i}`].maximum = 100;
				this[`bosshpbg${i}`].visible = this[`hpbar${i}`].visible = true;
			} else {
				this[`bosshpbg${i}`].visible = this[`hpbar${i}`].visible = false;
			}
		}
	}
}

ViewManager.ins().reg(GuildBossDetailWin, LayerManager.UI_Popup);
