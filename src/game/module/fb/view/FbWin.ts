class FbWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private tab: eui.TabBar;
	private fbList: eui.List;
	private fbChallengePanel: FBChallengePanel;
	private fbExpPanel: FbExpPanel;
	private dailyFbPanel: DailyFbPanel;
	
	// private playWayPanel: PlayWayPanel;
	private viewStack: eui.ViewStack;

	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	private fbDataList: number[] = [];
	private lastSelectIndex: number = -1;

	/** 组队副本 */
	public teamfb: TeamFbNewPanel;
	private help: eui.Button;

	constructor() {
		super();
		this.skinName = "DailyFbSkin";
		this.isTopLevel = true;
		// this.setSkinPart("fbChallengePanel", new FBChallengePanel());
		// this.setSkinPart("fbExpPanel", new FbExpPanel());
		// this.setSkinPart("roleSelect", new RoleSelectPanel());

		this.fbList.itemRenderer = FbItem;
		this.fbDataList = UserFb.ins().fbDataList.slice();
		this.fbList.dataProvider = new eui.ArrayCollection(this.fbDataList);
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public static isClose: boolean;
	public static openCheck(...param: any[]): boolean {
		let index = param[0] == undefined ? 0 : param[0];
		let secIndex = param[1] == undefined ? 0 : param[1];

		switch (index) {
			case 3:
				if (!UserFb.ins().isTeamFBOpen()) {
					UserTips.ins().showTips(`开服第${GlobalConfig.TeamFuBenBaseConfig.openDay}天并达到${GlobalConfig.TeamFuBenBaseConfig.needZsLv}转开启`);
					return false;
				}
				break;
			case 2:
				let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[1];
				if (Actor.level < info.levelLimit) {
					UserTips.ins().showTips(`${info.levelLimit}级可挑战`);
					return false;
				}
				break;
			case 1:
				if (Actor.level < GlobalConfig.ExpFubenBaseConfig.openLv) {
					UserTips.ins().showTips(`${GlobalConfig.ExpFubenBaseConfig.openLv}级开启`);
					return false;
				}
				break;
			case 0:
				if (Actor.level < 10) {
					UserTips.ins().showTips("10级开启");
					return false;
				}
				break;
		}
		if (!FbWin.isClose)
			ViewManager.ins().close(LiLianWin);
		FbWin.isClose = false;
		return true;
	
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.fbList, this.onTap);
		this.removeObserve();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.fbList, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.observe(UserFb.ins().postFbInfo, this.updateFbList);
		this.observe(UserFb.ins().postFbInfoUp, this.updateFbList);
		this.observe(FbRedPoint.ins().postTabs, this.updateRedPoint);
		this.observe(UserFb.ins().postFbInfoUp, this.updateRedPoint);
		this.observe(UserFb.ins().postOnHide, this.updateRedPoint);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.checkIsOpen);

		this.updateFbList();

		let index: number = param[0] == undefined ? 0 : param[0];
		let openIndex:number = param[1] == undefined ? 0:param[1];
		this.viewStack.selectedIndex = index;
		this.tab.selectedIndex = index;

		this.setOpenIndex(index, openIndex);
		this.updateRedPoint();
	}

	private updateRedPoint(): void {
		this.redPoint0.visible = FbRedPoint.ins().getRedPoint(0);
		this.redPoint1.visible = FbRedPoint.ins().getRedPoint(1);
		this.redPoint2.visible = FbRedPoint.ins().getRedPoint(2);
		this.redPoint3.visible = FbRedPoint.ins().getRedPoint(3) || UserFb.ins().zuDuiRed;
	}

	private updateFbList(): void {
		let index = this.fbDataList.indexOf(GlobalConfig.ZhanLingConfig.fbIndex);
		if (index >= 0) {
			//如开服时间未达到天仙副本开始天数，则屏蔽
			if (GlobalConfig.ZhanLingConfig.openserverday > GameServer.serverOpenDay + 1) {
				this.fbDataList.splice(index, 1);
			}
		}
		(this.fbList.dataProvider as eui.ArrayCollection).replaceAll(this.fbDataList);
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
			    if (this.viewStack.selectedIndex == 3) {
				   ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[44].text);
				}
				break;
			default:
				if (e.target instanceof eui.Button) {
					let fbID: number = (e.target.parent as FbItem).data;
					let fbConfig: DailyFubenConfig = GlobalConfig.DailyFubenConfig[fbID];
					if (e.target.name == 'add') {
						this.Sweep(fbID,0);
					} else if (e.target.name == 'double') {
						this.Sweep(fbID,1);
					}
					else {
						let fbInfos: FbModel = UserFb.ins().getFbDataById(fbID);
						if (fbInfos.getCount() <= 0) {
							UserTips.ins().showTips("|C:0xf3311e&T:剩余挑战次数不足|");
						}
						else if (fbConfig.levelLimit > Actor.level) {
							UserTips.ins().showTips("|C:0xf3311e&T:转生或等级不足|");
						}
						else {
							//判定玩家特权身份
							// let isPass = Recharge.ins().getCurMaterialFb(fbID);//当前副本是否已通关
							let isPass = UserFb.ins().fbModel[fbID].isPass;//当前副本是否已通关
							if (Recharge.ins().franchise && isPass) {
								// this.Sweep(fbID);
								UserFb.ins().sendChallenge(fbID);
								
								// let win = WarnWin.show(`您当前是尊贵的至尊特权月卡，是否一键扫荡已通关材料副本`,()=>{
								// 		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH100) {
								// 			ViewManager.ins().open(BagFullTipsWin,UserBag.BAG_ENOUGH100);
								// 		}else{
								// 			//算出所需扫荡的fbID集合
								// 			let sweeps:number[] = Recharge.ins().getSweepMaterialFbIds();
								// 			DieGuide.ins().setMaxFb(sweeps);//刷新死亡引导标识位 根据已通关的来算
								// 			for( let i = 0;i < sweeps.length;i++ ){
								// 				this.Sweep(sweeps[i]);
								// 			}
								// 		}
								// 	},this,
								// 	()=>{
								// 		if (UserFb.ins().checkInFB()) return;
								// 		UserFb.ins().sendChallenge(fbConfig.id);
								// 		ViewManager.ins().closeTopLevel();
								// 	});
								// win.setBtnLabel(`扫荡`, `挑战`);
							} else {
								if (UserFb.ins().checkInFB()) return;
								UserFb.ins().sendChallenge(fbConfig.id);
								ViewManager.ins().closeTopLevel();
							}
						}
					}
					ViewManager.ins().close(LimitTaskView);
				}
		}
	}

	private privilageSweep(fbID:number,isDouble:number,callback?:Function){
		let index: number = this.fbDataList.lastIndexOf(fbID);
		let item = (<FbItem>this.fbList.getVirtualElementAt(index));
		if (item)
			item.starSaoDang(isDouble,callback);
	}

	private Sweep(fbID: number,isDouble:number) {
		let fbConfig: DailyFubenConfig = GlobalConfig.DailyFubenConfig[fbID];
		let discount: number = GlobalConfig.MonthCardConfig.sweepPrecent / 100;
		let addValue: number = Recharge.ins().monthDay > 0 ? 1 - discount : 1;
		let buyPrice: number = fbConfig.buyPrice[UserFb.ins().getFbDataById(fbID).vipBuyCount] * addValue;
		if (!(Actor.yb >= buyPrice)) {
			UserTips.ins().showTips("元宝不足");
			return;
		}

		DieGuide.ins().setClick(fbID);
		this.privilageSweep(fbID,isDouble);
	
		// WarnWin.show(`是否消耗<font color='#FFB82A'>${buyPrice}元宝</font>扫荡1次【${fbConfig.name}】？<font color='#007BFF'>扫荡将直接获得副本奖励</font>`, () => {
		// 	DieGuide.ins().setClick(fbID);
		// 	let index: number = this.fbDataList.lastIndexOf(fbID);
		// 	(<FbItem>this.fbList.getVirtualElementAt(index)).starSaoDang(0);
		// }, this);
	}

	private setOpenIndex(selectedIndex: number, secIndex: number = 0): void {
		this.help.visible = false;
		if (!FbWin.openCheck(selectedIndex)) {
			this.setOpenIndex(this.lastSelectIndex);
			this.tab.selectedIndex = this.lastSelectIndex;
			return;
		}

		if (this.lastSelectIndex > -1) {
			switch (this.lastSelectIndex) {
				case 0:
					break;
				default:
					this.viewStack.getChildAt(this.lastSelectIndex)['close'] && this.viewStack.getChildAt(this.lastSelectIndex)['close']();
					break;
			}
		}
		this.lastSelectIndex = selectedIndex;
		switch (selectedIndex) {
			case 0:
				this.updateFbList();
				break;
			default:
			this.viewStack.getChildAt(selectedIndex)['open'](secIndex);
			break;
		}

		if (this.viewStack.selectedIndex == 3){
			this.help.visible = true;
			UserFb.ins().zuDuiRed = false;
			UserFb.ins().onShow();
		}
	}

	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private checkIsOpen(e: egret.Event) {
		let tab = e.target;
		if (!FbWin.openCheck(tab.selectedIndex)) {
			e.preventDefault();
			return;
		}

		ViewManager.ins().close(LiLianWin);
		ViewManager.ins().close(LimitTaskView);
	}
}
ViewManager.ins().reg(FbWin, LayerManager.UI_Main);