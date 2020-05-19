/**
 * 全民boss标签页
 */
class PublicBossMainWin extends BaseView {

	private list: eui.List;

	private leftText: eui.Label;
	private nameTxt: eui.Label;
	private bossImage: MovieClip;
	private challengeBtn: eui.Button;
	private bossGroup: eui.Group;
	private playerNameTxt: eui.Label;
	private leftCDText: eui.Label;
	private stateImage: eui.Image;

	// private joinRewardList: eui.List;
	private dropRewardList: eui.List;
	constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.list.itemRenderer = WorldBossItem;
		// this.joinRewardList.itemRenderer = ItemBase;
		this.dropRewardList.itemRenderer = ItemBase;
		this.bossImage = new MovieClip;
		this.bossImage.scaleX = -1;
		this.bossImage.scaleY = 1;
		this.bossImage.x = 78;
		this.bossImage.y = 165;
		this.bossGroup.touchEnabled = this.bossGroup.touchChildren = false;
	}

	public open(): void {
		let canPlayList: WorldBossItemData[] = UserBoss.ins().worldBossPlayList[UserBoss.BOSS_SUBTYPE_QMBOSS].slice();
		if (this.bossImage && !this.bossImage.parent) {
			this.bossGroup.addChild(this.bossImage);
		}
		this.observe(UserZs.ins().postZsData, this.setActLevel);
		this.observe(Actor.ins().postLevelChange, this.setActLevel);
		this.setActLevel();

		this.list.dataProvider = new eui.ArrayCollection(canPlayList);
		this.list.selectedIndex = 0;
		this.currData = this.list.dataProvider.getItemAt(0);
		this.addTouchEvent(this.challengeBtn, this.onTap);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onClickMenu, this);
		this.setWin();
	}

	private currData: any;
	private onClickMenu(e: eui.ItemTapEvent): void {
		this.currData = this.list.dataProvider.getItemAt(e.itemIndex);
		this.setWin();
	}

	private endTime: number = 0;
	private setWin(): void {
		if (!this.currData) return;
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.currData.id];
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
		let lvStr: string = config.zsLevel > 0 ? `${config.zsLevel}转` : `${config.level}级`
		this.nameTxt.text = `${bossBaseConfig.name}(${lvStr})`;
		let str: string = "无";
		if (this.currData.roleName != "") {
			str = this.currData.roleName;
			if (this.currData.guildName != "") str = `${str}(${this.currData.guildName})`;
		}

		if (this.currData.bossState == 2) {
			this.stateImage.source = "zdbossyijisha";
		} else if (this.currData.bossState == 1) {
			this.stateImage.source = "zdbosskejisha";
		} else {
			this.stateImage.source = "";
		}

		// let joinArr:number[] = [];
		// joinArr.push(config.joinReward);
		// this.joinRewardList.dataProvider = new eui.ArrayCollection([200013]);

		this.dropRewardList.dataProvider = new eui.ArrayCollection(config.showReward);

		this.playerNameTxt.text = str;
		// this.guildText.text = this.bossData.guildName == "" ? "无" : this.bossData.guildName;
		let count = UserBoss.ins().worldBossLeftTime[UserBoss.BOSS_SUBTYPE_QMBOSS]
		this.leftText.text = `挑战剩余次数:${count}次`;

		this.endTime = Math.floor((UserBoss.ins().worldBossCd[UserBoss.BOSS_SUBTYPE_QMBOSS] - egret.getTimer()) / 1000);

		if (this.endTime > 0) {
			this.challengeBtn.visible = false;
			this.updateTime();
			TimerManager.ins().doTimer(100, 0, this.updateTime, this);
			str = DateUtils.getFormatBySecond(this.endTime, 5, 3);
			this.leftCDText.text = `挑战CD:${str}`;
			// TimerManager.ins().doTimer(1000, this.endTime, () => {
			// 	if (this.endTime < 0) {
			// 		this.leftCDText.text = ``;
			// 		return
			// 	}
			// 	let str: string = DateUtils.getFormatBySecond(this.endTime, 5, 3);
			// 	this.leftCDText.text = `挑战CD:${str}`;
			// 	this.endTime--;
			// }, this);
		} else {
			this.leftCDText.text = ``;
		}

		this.bossImage.playFile(RES_DIR_MONSTER + `monster${bossBaseConfig.avatar}_3s`, -1);
		for (let i: number = 0; i < 4; i++) {
			let item: ItemConfig;
			switch (i) {
				case 0:
					item = GlobalConfig.ItemConfig[config.joinReward];
					break;
				case 1:
					item = GlobalConfig.ItemConfig[config.shieldReward];
					break;
				case 2:
					item = GlobalConfig.ItemConfig[config.belongReward];
					break;
				case 3:
					item = GlobalConfig.ItemConfig[config.killReward];
					break;
			}
			// let item1: ItemConfig = GlobalConfig.ItemConfig[config.showReward[i]];
			// this[`itemIcon1` + i].setData(item);
			// this[`itemIcon2` + i].setData(item1);
		}
	}

	private updateTime(): void {
		let time: number = Math.floor((UserBoss.ins().worldBossCd[UserBoss.BOSS_SUBTYPE_QMBOSS] - egret.getTimer()) / 1000);
		this.leftCDText.text = `挑战CD:${DateUtils.getFormatBySecond(time, 5, 3)}`;
		if (time <= 0) {
			TimerManager.ins().remove(this.updateTime, this);
			this.leftCDText.text = ``;
			this.challengeBtn.visible = true;
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.challengeBtn:
				if (Math.floor((UserBoss.ins().worldBossCd[UserBoss.BOSS_SUBTYPE_QMBOSS] - egret.getTimer()) / 1000) > 0) {
					UserTips.ins().showTips(`挑战CD中`);
					return;
				}
				let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
				let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.currData.id];
				let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
				let bossLv: number = (config.zsLevel || 0) * 1000 + config.level;
				if (bossLv > roleLv) {
					let str: string = config.zsLevel > 0 ? `${config.zsLevel}转` : `${config.level}级`;
					UserTips.ins().showTips(`只有${str}才可以挑战。`);
					return;
				}
				if (UserBag.ins().getSurplusCount() < UserBoss.WB_BAG_ENOUGH) {
					ViewManager.ins().open(BagFullTipsWin,UserBoss.WB_BAG_ENOUGH);
				} else {
					ViewManager.ins().close(BossWin);
					UserBoss.ins().sendChallengWorldBoss(this.currData.id,UserBoss.BOSS_SUBTYPE_QMBOSS);
				}
				break;
		}
	}

	private actLevel: number = 0;
	private setActLevel(): void {
		this.actLevel = UserZs.ins().lv * 10000 + Actor.level;
	}

	public close(): void {
		this.removeObserve();
		this.list.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onClickMenu, this);
		this.removeTouchEvent(this.challengeBtn, this.onTap);
	}
}