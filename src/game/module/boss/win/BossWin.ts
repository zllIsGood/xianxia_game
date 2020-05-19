/**
 * 转生Boss窗口
 */
class BossWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;

	/** 个人boss */
	private personalBoss: PersonalBossPanel; //tab 0
	/** 野外boss(全民boss) */
	private publicBoss: PublicBossPanel; //tab 1
	/** 试炼BOSS */
	private worldBoss: WorldBossMainPanel; //tab 2
	private shenyuBoss:ShenyuBossPanel; //tab 3
	private homeBoss:BossHomeMainWin; //tab 4

	private viewStack: eui.ViewStack;
	private tab: eui.TabBar;
	public seeRule: eui.Button;

	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;//神域boss
	private redPoint4: eui.Image; 
	private lastSelect: number;

	private redPoints:eui.Image[];

	constructor() {
		super();
		this.skinName = "BossSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.redPoint2.visible = false;
		if (UserBoss.ins().checkShenyuOpen()) {
			this.redPoints = [];
			for(let i = 0; i < 5; i++){
				this.redPoints.push(this[`redPoint${i}`]);
			}
			if(!this.shenyuBoss.parent){
				this.viewStack.addChildAt(this.shenyuBoss,3);
			}
		} else {
			this.redPoints = [];
			for(let i = 0; i < 5; i++) {
				(i != 3) && this.redPoints.push(this[`redPoint${i}`]);
			}
			if(this.shenyuBoss.parent){
				this.viewStack.removeChild(this.shenyuBoss);
			}
		}
		this.validateNow();

		let redPointGap:number = 115;//红点间的间隔
		let len = this.viewStack.numChildren;
		let startHor:number = -180;
		if(len == 4) startHor = -125;

		for (let i = 0; i < len; i++) {
			if(i == 0)
				this.redPoints[i].horizontalCenter = startHor;
			else
				this.redPoints[i].horizontalCenter = this.redPoints[i-1].horizontalCenter+redPointGap;
		}
	}

	public open(...param: any[]): void {
		UserBoss.ins().init();
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this, this.onTap);
		this.addTouchEvent(this.seeRule, this.onTap);
		this.addChangeEvent(this.tab, this.setSelectedIndex);
		this.addChangingEvent(this.tab, this.checkIsOpen);
		this.observe(UserBoss.ins().postWorldBoss, this.updateRedPoint);
		this.observe(UserFb.ins().postFbInfoUp, this.updatePanel);//特权扫荡
		this.observe(UserFb.ins().postFbInfoUp, this.updateRedPoint);//特权扫荡
		//如果个人boss没有可以挑战的，打开默认挑战野外boss
		if(param[0] == undefined) {
			let tempArr = UserBoss.ins().getListData()[0];
			if (tempArr.length == 0) {
				param[0] = 1;
			}
		}
		this.lastSelect = param.length ? param[0] : 0;
		if(this.lastSelect > this.viewStack.numChildren-1) {
			this.lastSelect = this.viewStack.numChildren-1;
		}

		this.viewStack.selectedIndex = this.lastSelect;
		this.tab.selectedIndex = this.lastSelect;
		this.viewStack.getElementAt(this.lastSelect)['open'](param[1]);

		this.updateRedPoint();
		ViewManager.ins().close(GuildMap);
		ViewManager.ins().close(GuildActivityWin);
		ViewManager.ins().close(TreasureHuntWin);

		this.checkHelpBtn();
	}
	private updatePanel(){
		this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.viewStack.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();
		this.checkHelpBtn();
	}

	private lastIndex: number = 0;
	private setSelectedIndex(e: egret.Event) {
		this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.viewStack.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();


		this.checkHelpBtn();
	}
	private checkHelpBtn(){
		if( UserBoss.ins().checkShenyuOpen() ){
			if (this.lastSelect == 3 ) {
				this.seeRule.visible = false;
			} else {
				this.seeRule.visible = true;
			}
		}else{
			this.seeRule.visible = true;
		}
	}

	public updateRedPoint(): void {
		this.redPoint0.visible = UserFb.isCanChallenge();
		// this.redPoint1.visible = UserBoss.ins().isCanChalleng();
		this.redPoint1.visible = UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_QMBOSS);
		this.redPoint2.visible = UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_WORLDBOSS);
		this.redPoint3.visible = UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_SHENYU);
		this.redPoint4.visible = UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_HOMEBOSS);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this, this.onTap);
		this.viewStack.getElementAt(this.lastSelect)['close']();

		this.removeObserve();
	}

	private onLink(e: egret.TextEvent): void {
		let cost = GlobalConfig.WorldBossBaseConfig.clearCdCost[UserBoss.ins().currBossSubType - 1];
		WarnWin.show(`确定消耗<font color='#ffff00'>${cost}元宝立即清除挑战CD`, () => {
			ViewManager.ins().close(this);
			UserBoss.ins().sendClearCD();
		}, this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.seeRule:
				if (this.viewStack.selectedIndex == 4) {
					ViewManager.ins().open(ZsBossRuleSpeak, 12);
				} else if (this.viewStack.selectedIndex == 3 && !UserBoss.ins().checkShenyuOpen()) {
					ViewManager.ins().open(ZsBossRuleSpeak, 12);
				}
				else {
					ViewManager.ins().open(ZsBossRuleSpeak, this.viewStack.selectedIndex + 1);
				}
				break;
			default:
				if (e.target instanceof eui.Button) {
					let config = e.target.parent['config'];
					switch (e.target.name) {
						//全民boss挑战
						case "publicChallenge":
							// if (UserFb.ins().checkInFB()) return;
							// if (UserBoss.ins().worldBossLeftTime[UserBoss.BOSS_SUBTYPE_QMBOSS] <= 0 && UserVip.ins().lv <= 0) {
							// 	UserTips.ins().showTips("挑战次数不足，首冲即可参与VIP专属BOSS，无限刷就是爽！");
							// }
							// else if (config.zsLevel <= UserZs.ins().lv && config.level <= Actor.level) {
							// 	// UserBoss.ins().sendChallenge((<BossItem>e.target.parent).data.id);
							// 	if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
							// 		ViewManager.ins().open(BagFullTipsWin, UserBag.BAG_ENOUGH);
							// 	} else {
							// 		let endTime = Math.ceil((UserBoss.ins().worldBossCd[UserBoss.BOSS_SUBTYPE_QMBOSS] - egret.getTimer()) / 1000);
							// 		if (endTime > 0) {
							// 			UserTips.ins().showTips(`|C:0xf3311e&T:冷却中，${endTime}秒后可进行挑战|`);
							// 			return;
							// 		}
							// 		UserBoss.ins().sendChallengWorldBoss((<BossItem>e.target.parent).data.id, UserBoss.BOSS_SUBTYPE_QMBOSS);
							// 		ViewManager.ins().close(this);
							// 	}
							// }
							// else {
							// 	UserTips.ins().showTips("|C:0xf3311e&T:等级不足，无法挑战|");
							// }
							// break;
							return;
						case "homeChallenge":
							if (UserFb.ins().checkInFB()) return;

							if (config.zsLevel <= UserZs.ins().lv && config.level <= Actor.level) {
								if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
									ViewManager.ins().open(BagFullTipsWin, UserBag.BAG_ENOUGH);
								} else {
									let endTime = Math.ceil((UserBoss.ins().worldBossCd[UserBoss.BOSS_SUBTYPE_HOMEBOSS] - egret.getTimer()) / 1000);
									if (endTime > 0) {
										UserTips.ins().showTips(`|C:0xf3311e&T:冷却中，${endTime}秒后可进行挑战|`);
										return;
									}
									UserBoss.ins().sendChallengWorldBoss((<BossItem>e.target.parent).data.id, UserBoss.BOSS_SUBTYPE_HOMEBOSS);
									ViewManager.ins().close(this);
								}
							}
							else {
								UserTips.ins().showTips("|C:0xf3311e&T:等级不足，无法挑战|");
							}
							break;
						case "ZsBoss":
							// this.applyFunc(BossFunc.WORLD_BOSS_CHALLENGE);
							// ViewManager.ins().close(this);
							break;
					}

					ViewManager.ins().close(LimitTaskView);
				}
		}
	}

	private checkIsOpen(e: egret.Event) {
		let tab = e.target;
		let zsLv: number = 1;
		ViewManager.ins().close(LimitTaskView);
		if (tab.selectedIndex == 2 && UserZs.ins().lv < zsLv) {
			UserTips.ins().showTips(`${zsLv}转开启`);
			e.$cancelable = true;
			e.preventDefault();
			return;
		}
		// if (tab.selectedIndex == 3 && UserVip.ins().lv < 1) {
		// 	UserTips.ins().showTips(`VIP1开启`);
		// 	e.$cancelable = true;
		// 	e.preventDefault();
		// 	return;
		// }
	}

	public static openCheck(...param): boolean {
		if (param && param.length) {
			if (param[0] == 2) {
				let zsLv: number = 1;
				if (UserZs.ins().lv < zsLv) {
					UserTips.ins().showTips(`${zsLv}转开启`);
					return false;
				}
				return true;
			} else if (param[0] == 4) {
				if(!UserBoss.ins().checkShenyuOpen()) {
					UserTips.ins().showTips(`开服第${GlobalConfig.WorldBossBaseConfig.shenyuOpenDay}天开启`);
					return false;
				}
			}
		}

		if (OpenSystem.ins().checkSysOpen(SystemType.BOSS)) {
			if( !FbWin.isClose )
				ViewManager.ins().close(LiLianWin);
			FbWin.isClose = false;
			return true;
		} else {
			UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.BOSS));
			return false;
		}
	}
}
ViewManager.ins().reg(BossWin, LayerManager.UI_Main);