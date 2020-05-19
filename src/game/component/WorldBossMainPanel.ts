/**
 * 世界boss标签页
 */
class WorldBossMainPanel extends BaseView {

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
	private type: number = 0;
	private getItemTxt: eui.Label;
	private juan:eui.Group;
	private jcount:eui.Label;
	private jicon:eui.Image;
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
		this.getItemTxt.textFlow = new egret.HtmlTextParser().parser(`<u>${this.getItemTxt.text}</u>`);

	}

	public open(): void {
		this.type = UserBoss.BOSS_SUBTYPE_WORLDBOSS;
		let canPlayList: WorldBossItemData[] = UserBoss.ins().worldBossPlayList[this.type].slice();
		if( !canPlayList.length ){
			UserBoss.ins().updateBossPlayList(this.type);
			canPlayList = UserBoss.ins().worldBossPlayList[this.type].slice();
		}
		if (this.bossImage && !this.bossImage.parent) {
			this.bossGroup.addChild(this.bossImage);
		}
		this.observe(UserBoss.ins().postWorldBoss, this.setWin);
		this.observe(UserZs.ins().postZsData, this.setActLevel);
		this.observe(Actor.ins().postLevelChange, this.setActLevel);
		this.observe(UserBoss.ins().postWorldBoss, this.joinWorldBoss);
		this.observe(UserBag.ins().postItemCountChange,this.UseToItem);
		this.setActLevel();

		this.list.dataProvider = new eui.ArrayCollection(canPlayList);
		this.list.selectedIndex = 0;
		this.currData = this.list.dataProvider.getItemAt(0);
		this.addTouchEvent(this.challengeBtn, this.onTap);
		this.addTouchEvent(this.getItemTxt, this.onTap);

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
		// this.nameTxt.text = `${bossBaseConfig.name}(${lvStr})`;
		this.nameTxt.text = `${bossBaseConfig.name}(${config.zslook[0]}转-${config.zslook[config.zslook.length-1]}转)`;
		let str: string = "无";
		if (this.currData.roleName != "") {
			str = this.currData.roleName;
			if (this.currData.guildName != "") str = `${str}(${this.currData.guildName})`;
		}

		if (this.currData.bossState == 2) {
			this.stateImage.source = "common1_word_killed";
		} else if (this.currData.bossState == 1) {
			this.stateImage.source = "common1_word_kill2";
		} else {
			this.stateImage.source = "";
		}

		// let joinArr:number[] = [];
		// joinArr.push(config.joinReward);
		// this.joinRewardList.dataProvider = new eui.ArrayCollection([200013]);

		this.dropRewardList.dataProvider = new eui.ArrayCollection(config.showReward);

		this.playerNameTxt.text = str;
		// this.guildText.text = this.bossData.guildName == "" ? "无" : this.bossData.guildName;
		let count: number = UserBoss.ins().worldBossLeftTime[this.type];
		this.leftText.text = `挑战剩余次数:${count}次`;
		this.getItemTxt.visible = count>0?false:true;
		this.endTime = Math.floor((UserBoss.ins().worldBossCd[this.type] - egret.getTimer()) / 1000);

		if (this.endTime > 0) {
			this.challengeBtn.visible = false;
			this.updateTime();
			TimerManager.ins().doTimer(100, 0, this.updateTime, this);
			str = DateUtils.getFormatBySecond(this.endTime, 5, 3);
			this.leftCDText.text = `挑战CD:${str}`;
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
		}
		let itemData: ItemData = UserBag.ins().getBagItemById(ItemConst.WORLDBOSS);
		this.showJuan(itemData);
	}
	private showJuan(itemData:ItemData){
		if( !itemData ){
			this.juan.visible = false;
			return;
		}
		this.juan.visible = true;
		this.jicon.source = itemData.itemConfig.icon + "_png";
		this.jcount.text = itemData.count + "";
	}

	private updateTime(): void {
		let time: number = Math.floor((UserBoss.ins().worldBossCd[this.type] - egret.getTimer()) / 1000);
		this.leftCDText.text = `挑战CD:${DateUtils.getFormatBySecond(time, 5, 3)}`;
		if (time <= 0) {
			TimerManager.ins().remove(this.updateTime, this);
			this.leftCDText.text = ``;
			this.challengeBtn.visible = true;
		}
	}
	/**新提示语*/
	private isUse:boolean;
	private showTips():boolean{
		let count: number = UserBoss.ins().worldBossLeftTime[this.type];
		if( count > 0 ){
			return true;
		}

		let tipText = "";
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,ItemConst.WORLDBOSS);
		if( item ){
			tipText = `确定使用1个<font color='#FFB82A'>试炼boss</font>道具进入挑战？\n`;

			WarnWin.show(tipText, function () {
				this.isUse = true;
				UserBag.ins().sendUseItem(item.configID,1);
			}, this);
		}else{
			let vipConfig: VipConfig = GlobalConfig.VipConfig[UserVip.ins().lv];
			if (!vipConfig) {
				UserTips.ins().showTips(`|C:0xf3311e&T:成为VIP可购买挑战次数|`);
				return false;
			}
			if (!vipConfig.boss2buy) {
				UserTips.ins().showTips(`|C:0xf3311e&T:VIP等级不足，提升VIP等级可购买挑战次数|`);
				return false;
			}
			let currentUse: number = UserBoss.ins().worldChallengeTime[this.type];
			//购买次数
			if ( count <= 0 && currentUse >= vipConfig.boss2buy) {
				UserTips.ins().showTips(`|C:0xff0000&T:挑战次数不足,无法挑战`);
				return;
			}

			if (Actor.yb < GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]) {
				UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
				return false;
			}
			tipText = `确定花费<font color='#FFB82A'>${GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]}元宝</font>购买1次挑战次数吗？\n` +
				`今日已购买：${currentUse}/${vipConfig.boss2buy}`

			WarnWin.show(tipText, function () {
				UserBoss.ins().sendBuyChallengeTimes(this.type);
			}, this);
		}

		return false;
	}
	private UseToItem(){
		if( this.isUse ){
			this.isUse = false;
			UserBoss.ins().sendWorldBossInfo(this.type);
		}
	}
	private joinWorldBoss(){
		if( !this.isJoin || !this.currData)return;
		this.isJoin = false;
		if (UserFb.ins().checkInFB()) return;
		if (Math.floor((UserBoss.ins().worldBossCd[this.type] - egret.getTimer()) / 1000) > 0) {
			UserTips.ins().showTips(`挑战CD中`);
			return;
		}
		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.currData.id];
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
		let bossLv: number = config.zsLevel * 1000 + config.level;
		if (bossLv > roleLv) {
			let str: string = config.zsLevel > 0 ? `${config.zsLevel}转` : `${config.level}级`;
			UserTips.ins().showTips(`只有${str}才可以挑战。`);
			return;
		}
		if (UserBag.ins().getSurplusCount() < UserBoss.WB_BAG_ENOUGH) {
			ViewManager.ins().open(BagFullTipsWin, UserBoss.WB_BAG_ENOUGH);
		} else {
			ViewManager.ins().close(BossWin);
			UserBoss.ins().sendChallengWorldBoss(this.currData.id, this.type);
		}
		ViewManager.ins().close(LimitTaskView);
	}
	private isJoin:boolean;
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.challengeBtn:
				this.isJoin = true;
				if( !this.showTips() ) return;
				this.joinWorldBoss();
				break;
			case this.getItemTxt:
				if( !this.showTips() ) return;
				// let vipConfig: VipConfig = GlobalConfig.VipConfig[UserVip.ins().lv];
				// if (!vipConfig) {
				// 	UserTips.ins().showTips(`|C:0xf3311e&T:成为VIP可购买挑战次数|`);
				// 	return;
				// }
				// if (!vipConfig.boss2buy) {
				// 	UserTips.ins().showTips(`|C:0xf3311e&T:VIP等级不足，提升VIP等级可购买挑战次数|`);
				// 	return;
				// }
				// let currentUse: number = UserBoss.ins().worldChallengeTime[this.type];
				// //购买次数
				// if (vipConfig.boss2buy == currentUse) {
				// 	UserTips.ins().showTips(`|C:0xf3311e&T:今日购买次数已达上限|`);
				// 	return;
				// }
                //
				// if (Actor.yb < GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]) {
				// 	UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
				// 	return;
				// }
				// if( !vipConfig.boss2buy ){
				// 	UserTips.ins().showTips(`|C:0xf3311e&T:当前vip等级不能购买|`);
				// 	return;
				// }
                //
				// WarnWin.show(`确定花费<font color='#FFB82A'>${GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]}元宝</font>购买1次挑战次数吗？\n` +
				// 	`今日已购买：${currentUse}/${vipConfig.boss2buy}`, function () {
				// 		UserBoss.ins().sendBuyChallengeTimes(this.type);
				// 	}, this);
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
		this.removeTouchEvent(this.getItemTxt, this.onTap);
	}
}