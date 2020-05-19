/**
 * 飞剑主面板
 */
class FlySwordWin extends BaseEuiView {
	private static FEIJIAN = 0;
	private static CHONGWU = 1;
	private static FEIXIAN = 2;

	private viewStack: eui.ViewStack;
	private closeBtn0: eui.Button;
	private closeBtn: eui.Button;
	private tab: eui.TabBar;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;

	private help: eui.Button;
	public redPointGroup: eui.Group;

	public huanShouPanel:HuanShouPanel;
	public FlySwordPanel:FlySwordPanel;
	public zhanlingPanel:ZhanLingPanel;

	public roleSelect: RoleSelectPanel;
	private curRole: number;

	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "FlySwordWinSkin";
	}

	public initUI(): void {
		super.initUI();
		
		let index: number = FlySwordWin.FEIJIAN;
		if (!FlySword.ins().isOpen()){
			index = FlySwordWin.CHONGWU;
		}

		this.viewStack.selectedIndex = index;
		this.tab.dataProvider = this.viewStack;
	}

	public static openCheck(...param: any[]): boolean {
		let selectedIndex = param[0] == undefined ? FlySwordWin.CHONGWU : param[0];
		switch (selectedIndex) {
			//宠物
			case FlySwordWin.CHONGWU:
			    if (! UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.HUANSHOU)){
					UserTips.ins().showTips(`唤醒宠物开启`);
					return false;
			    }
				break;
			//飞剑
			case FlySwordWin.FEIJIAN:
				if (!FlySword.ins().isOpen()) {
					UserTips.ins().showTips(`唤醒飞剑开启`);
					return false;
				}
				break;
			//天仙
			case FlySwordWin.FEIXIAN:
			    if (!ZhanLingModel.ins().ZhanLingOpen()) {
				    UserTips.ins().showTips(`开服第${GlobalConfig.ZhanLingConfig.openserverday}天并达到${GlobalConfig.ZhanLingConfig.openzhuanshenglv}转开启`);
				    return false;
			    }
			    else if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING)){
				    UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.ZHANLING).name}开启`);
				    return false;
			    }
				break;
		}
		
		return true;
	}


	public open(...param: any[]): void {
		this.redPointGroup.visible = true;
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTapTouching);
		this.addChangeEvent(this.roleSelect, this.onChange);

		this.observe(FlySwordRedPoint.ins().postTotalRedPoint, this.showRoleRedPoint);
		this.observe(FlySwordRedPoint.ins().postLevelRedPoint, this.showRoleRedPoint);
		this.observe(FlySwordRedPoint.ins().postAppearanceRedPoint, this.showRoleRedPoint);

		this.observe(HuanShouRedPoint.ins().postUpgradeRed, this.updateRedPoint);
		this.observe(HuanShouRedPoint.ins().postEquipTotalRed, this.updateRedPoint);
		this.observe(HuanShouRedPoint.ins().postSkillRed, this.updateRedPoint);
		this.observe(HuanShouRedPoint.ins().postDanRed, this.updateRedPoint);
		this.observe(HuanShouRedPoint.ins().postSkinTotalRed, this.updateRedPoint);

		this.observe(ZhanLing.ins().postZhanLingComposeItem, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingInfo, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingUpExp, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingDrug, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingWear, this.updateRedPoint);
		this.observe(UserBag.ins().postItemChange,this.setRedPoint);


		let index : number = FlySwordWin.FEIJIAN;
		if (UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.HUANSHOU) && !FlySword.ins().isOpen()){
			index = FlySwordWin.CHONGWU;
		} 
		if (param[0]) {
			index = param[0];
		}

		let roleIndex = param[1] ? param[1] : 0;
        this.roleSelect.setCurRole(param[0] != undefined ? param[0] : 0);
		this.setOpenTabIndex(index);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.help, this.onTap);

		let num = this.viewStack.numChildren;
		for (let i = 0; i < num; i++) {
			(this.viewStack.getChildAt(i) as any).close();
		}

		this.removeObserve();
	}

	private setOpenTabIndex(index: number): void {
		this.tab.selectedIndex = this.viewStack.selectedIndex = index;
		this.setOpenIndex(index);
		this.setRedPoint();
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
			    // if (this.viewStack.selectedIndex == FlySwordWin.CHONGWU) {
				// 	ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[41].text);
				// } else if (this.viewStack.selectedIndex == FlySwordWin.FEIJIAN){
				// 	ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[41].text);
				// } else if (this.viewStack.selectedIndex == FlySwordWin.FEIXIAN){
				// 	ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[41].text);
				// }
				break;
		}
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private oldIndex: number = FlySwordWin.FEIJIAN
	private setOpenIndex(selectedIndex: number): void {
		this.roleSelect.openRole();
		switch (selectedIndex) {
			//宠物
			case FlySwordWin.CHONGWU:
			    this.roleSelect.hideRole();
				this.huanShouPanel.open();
				break;
			//飞剑
			case FlySwordWin.FEIJIAN:
				if (FlySword.ins().isOpen()) {
					this.FlySwordPanel.open(this.roleSelect.getCurRole());
					this.roleSelect.openRole();
				} else{
					let config = GlobalConfig.FlySwordCommonConfig;
			        if (GameServer.serverOpenDay < config.dayLimit - 1)
				        UserTips.ins().showTips(`开服${config.dayLimit}天开启`);
			        else if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.FLYSWORD))
				        UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.FLYSWORD).name}开启`);
			        else
				        UserTips.ins().showTips(`${Actor.getLevelStr(config.levelLimit)}开启`);
					
                    this.tab.selectedIndex = this.oldIndex;

				}
				break;
			//天仙
			case FlySwordWin.FEIXIAN:
			    if (!ZhanLingModel.ins().ZhanLingOpen()) {
					UserTips.ins().showTips(`开服第${GlobalConfig.ZhanLingConfig.openserverday}天并达到${GlobalConfig.ZhanLingConfig.openzhuanshenglv}转开启`);
					this.tab.selectedIndex = this.oldIndex;
			    } 
			    else if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING)){
				    UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.ZHANLING).name}开启`);
					this.tab.selectedIndex = this.oldIndex;
				}
			    else {
				    this.roleSelect.hideRole();
				    this.zhanlingPanel.open();
			    }
				break;
		}
		 this.oldIndex = this.tab.selectedIndex ;
		this.updateRedPoint();
		this.showRoleRedPoint();
	}

	private updateRedPoint(): void {
		if (!TimerManager.ins().isExists(this.setRedPoint, this)) TimerManager.ins().doTimer(100, 1, this.setRedPoint, this);
	}

	private setRedPoint(): void {
 		let b = false;
		 for (let i: number = 0; i < 3; i++) {
        	 b =  FlySwordRedPoint.ins().totalRedPoint[i];
         if(b) break;
        }

		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];
		let itemId: number = levelConf.itemId;
		let confCount = levelConf.count;
		let bagCount = UserBag.ins().getItemCountById(0, itemId);
		let huan = confCount <= bagCount

		this.redPoint1.visible = b;
		this.redPoint2.visible = HuanShouRedPoint.ins().skillRed || HuanShouRedPoint.ins().skinTotalRed || HuanShouRedPoint.ins().danRed[0] || HuanShouRedPoint.ins().danRed[1] || huan;
		this.redPoint3.visible = ZhanLing.ins().checkRedPoint();
	}

	private onTapTouching(e: egret.Event) {
		if (!FlySwordWin.openCheck(e.currentTarget.selectedIndex)) {
			e.preventDefault();
			return;
		}
		ViewManager.ins().close(LimitTaskView);
	}

	private onChange(e: egret.Event): void {
		this.setRoleId(this.roleSelect.getCurRole());
	}

	private setRoleId(roleId: number): void {
		this.curRole = roleId;
		this.setOpenIndex(this.viewStack.selectedIndex);
	}

	/**
	 * 显示角色红点
	 * @returns void
	 */
	private showRoleRedPoint(): void {
		let len: number = SubRoles.ins().subRolesLen;
		let redPoint = FlySwordRedPoint.ins();
		switch (this.viewStack.selectedIndex) {
			case FlySwordWin.FEIJIAN:
			for (let i: number = 0; i < 3; i++) {
				this.roleSelect.showRedPoint(i, redPoint.totalRedPoint[i]);
			}
				break;
		}
		this.setRedPoint();
	}
}
ViewManager.ins().reg(FlySwordWin, LayerManager.UI_Main);