/**
 * 个人boss标签页
 */
class PersonalBossPanel extends BaseView {

	private list: eui.List;

	private rewardList: eui.List;
	// private arrData: eui.ArrayCollection;

	private tempArrData: any[];

	private tempIndex: number;

	private nameTxt: eui.Label;
	private bossImage: MovieClip;
	private challengeBtn: eui.Button;
	private bossGroup: eui.Group;
	private stateImage: eui.Image;
	private config: DailyFubenConfig;
	private canChallengeTxt: eui.Label;

	constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.list.itemRenderer = PersonalBossItem;

		this.rewardList.itemRenderer = ItemBase;
		this.bossImage = new MovieClip;
		this.bossImage.scaleX = -1;
		this.bossImage.scaleY = 1;
		this.bossImage.x = 78;
		this.bossImage.y = 165;
		// this.arrData = new eui.ArrayCollection;
		// this.list.dataProvider = this.arrData;
	}

	public open(...param: any[]): void {
		// this.tempArrData = DailyFubenConfig.getPersonalBossFbIds().sort(this.sortFun);

		this.tempArrData = [];

		let arr = UserBoss.ins().getListData();
		let canPlayArr = arr[0], canNotPlayArr = arr[1], dieArr = arr[2];
		this.tempArrData = canPlayArr.concat(canNotPlayArr, dieArr);

		this.bossGroup.addChild(this.bossImage);
		this.tempIndex = 0;
		this.addTouchEvent(this.challengeBtn, this.onTap);
		this.list.dataProvider = new eui.ArrayCollection(this.tempArrData);
		this.list.selectedIndex = 0;
		let index: number = 0;
		if (param[0])
			index = this.getIdFromBossId(param[0], canPlayArr);
		this.currData = this.list.dataProvider.getItemAt(index);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onClickMenu, this);
		this.setWin();
		// TimerManager.ins().doTimer(50, this.tempArrData.length, this.setOneData, this);
	}
	private getIdFromBossId(bossId: number, canPlayArr: DailyFubenConfig[]) {
		//是否存在可挑战列表
		for (let i = 0; i < canPlayArr.length; i++) {
			if (canPlayArr[i].bossId == bossId) {
				this.list.selectedIndex = i;
				return i;
			}
		}

		return 0;
	}


	private currData: any;

	private onClickMenu(e: eui.ItemTapEvent): void {
		this.currData = this.list.dataProvider.getItemAt(e.itemIndex);
		this.setWin();
	}

	private setWin(): void {
		this.config = this.currData;
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[this.config.bossId];
		// let publicBossConfig: PublicBossConfig = GlobalConfig.PublicBossConfig[this.config.id];
		let lvStr: string;
		if (!this.config.levelLimit && !this.config.zsLevel)
			lvStr = `${bossBaseConfig.level}级`;
		else
			lvStr = this.config.zsLevel > 0 ? `${this.config.zsLevel}转` : `${this.config.levelLimit}级`
		this.nameTxt.text = `${bossBaseConfig.name}(${lvStr})`;
		let str: string = "无";
		this.rewardList.dataProvider = new eui.ArrayCollection(this.config.showItem);
		if (this.currData.roleName != "") {
			str = this.currData.roleName;
			if (this.currData.guildName != "") str = `${str}(${this.currData.guildName})`;
		}
		if (this.config.monthcard && !Recharge.ins().monthDay) {
			this.stateImage.source = "";
		} else if (this.config.specialCard && !Recharge.ins().franchise) {
			this.stateImage.source = "";
		} else {
			if (this.config.zsLevel <= UserZs.ins().lv && this.config.levelLimit <= Actor.level) {
				if (UserFb.ins().getFbDataById(this.currData.id).getCount() > 0) {
					this.stateImage.source = "common1_word_kill2";
				} else {
					this.stateImage.source = "zdbossyijisha";
					this.stateImage.source = "";
				}
			} else {
				this.stateImage.source = "";
			}
		}


		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		let bossLv: number = this.config.zsLevel * 1000 + this.config.levelLimit;

		let showChallenge: boolean;

		if (this.config.monthcard) {
			if (Recharge.ins().monthDay <= 0) {
				this.canChallengeTxt.text = `月卡特权可挑战`;
				showChallenge = false;
			} else {
				this.canChallengeTxt.text = ``;
				showChallenge = true;
			}

		} else if (this.config.specialCard) {
			if (!Recharge.ins().franchise) {
				this.canChallengeTxt.text = `至尊特权可挑战`;
				showChallenge = false;
			} else {
				this.canChallengeTxt.text = ``;
				showChallenge = true;
			}
		} else if (this.config.privilege) {
			if (!Recharge.ins().getIsForeve()) {
				this.canChallengeTxt.text = `贵族特权可挑战`;
				showChallenge = false;
			} else {
				this.canChallengeTxt.text = ``;
				showChallenge = true;
			}
		} else {
			showChallenge = roleLv >= bossLv;
			this.canChallengeTxt.text = this.config.zsLevel > 0 ? `${this.config.zsLevel}转可挑战` : `${this.config.levelLimit}级可挑战`;
		}
		this.challengeBtn.visible = showChallenge;
		this.canChallengeTxt.visible = !showChallenge;

		this.bossImage.playFile(RES_DIR_MONSTER + `monster${bossBaseConfig.avatar}_3s`, -1);

		this.btnLabel();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.challengeBtn:
				if (UserFb.ins().checkInFB()) return;
				if (this.config.zsLevel <= UserZs.ins().lv && this.config.levelLimit <= Actor.level) {
					if (UserFb.ins().getFbDataById(this.currData.id).getCount() <= 0) {
						UserTips.ins().showTips("次数不足，无法挑战");
						return;
					}

					//判定玩家特权身份
					let isPass = UserFb.ins().fbModel[this.config.id].isPass;//当前副本是否已通关
					if (Recharge.ins().franchise && isPass) {
						if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
							ViewManager.ins().open(BagFullTipsWin);
						} else {
							// ViewManager.ins().close(BossWin);
							UserFb.ins().sendChallenge(this.config.id);
						}
						ViewManager.ins().close(LimitTaskView);
						// let win = WarnWin.show(`您当前是尊贵的至尊特权月卡，是否一键扫荡全部已通关个人BOSS`,()=>{
						// 		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH200) {
						// 			ViewManager.ins().open(BagFullTipsWin,UserBag.BAG_ENOUGH200);
						// 		} else {
						// 			ViewManager.ins().close(BossWin);
						// 			//算出所需扫荡的fbID集合
						// 			let sweeps:number[] = Recharge.ins().getSweepPersonalFbIds();
						// 			//发送扫荡个人boss
						// 			// for( let i = 0;i < sweeps.length;i++ ){
						// 			// 	this.Sweep(sweeps[i]);
						// 			// }
						// 		}
						// 		ViewManager.ins().close(LimitTaskView);
						// 	},this,
						// 	()=>{
						// 		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
						// 			ViewManager.ins().open(BagFullTipsWin);
						// 		} else {
						// 			ViewManager.ins().close(BossWin);
						// 			UserFb.ins().sendChallenge(this.currData.id);
						// 		}
						// 		ViewManager.ins().close(LimitTaskView);
						// 	});
						// win.setBtnLabel(`扫荡`, `挑战`);
					} else {
						if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
							ViewManager.ins().open(BagFullTipsWin);
						} else {
							ViewManager.ins().close(BossWin);
							UserFb.ins().sendChallenge(this.currData.id);
						}
						ViewManager.ins().close(LimitTaskView);
					}
				} else {
					UserTips.ins().showTips("|C:0xf3311e&T:等级不足，无法挑战|");
				}
				break;
		}
	}

	public setOneData(): void {
		// if (this.tempArrData && this.arrData) {
		// 	this.arrData.replaceAll(this.tempArrData.slice(0, this.tempIndex));

		// 	this.tempIndex++;
		// }
	}

	public close(): void {
		TimerManager.ins().remove(this.setOneData, this);

		// this.arrData.source = null;

		this.tempArrData = null;
	}

	// private sortFun(config1: DailyFubenConfig, config2: DailyFubenConfig): number {
	// 	if (config1.zsLevel < config2.zsLevel)
	// 		return 1;
	// 	if (config1.zsLevel > config2.zsLevel)
	// 		return -1;

	// 	if (config1.levelLimit < config2.levelLimit)
	// 		return 1;
	// 	if (config1.levelLimit > config2.levelLimit)
	// 		return -1;

	// 	return 0;
	// }

	private sortFun(config1: DailyFubenConfig, config2: DailyFubenConfig): number {
		let count1: number = UserFb.ins().getFbDataById(config1.id).getCount();
		let count2: number = UserFb.ins().getFbDataById(config2.id).getCount();

		if (count1 > count2)
			return -1;
		if (count1 < count2)
			return 1;

		if (config1.zsLevel < config2.zsLevel)
			return -1;
		if (config1.zsLevel > config2.zsLevel)
			return 1;

		if (config1.levelLimit < config2.levelLimit)
			return -1;
		if (config1.levelLimit > config2.levelLimit)
			return 1;

		return 0;
	}

	private btnLabel() {
		let isPass = UserFb.ins().fbModel[this.config.id].isPass;//当前副本是否已通关
		if (Recharge.ins().franchise && isPass) {
			this.challengeBtn.label = "快速挑战"
		} else {
			this.challengeBtn.label = "挑战";
		}
	}
}