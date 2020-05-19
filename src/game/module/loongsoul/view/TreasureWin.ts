/**
 * 宝物入口
 */
class TreasureWin extends BaseEuiView {
	private static Longhun = 0;//龙魂
	private static Xinfa = 2;//心法
	private static Yupei = 1;//玉佩
	// private static Shenshou = 3;//神兽守护
	// private static Hungu = 4;//魂骨

	private viewStack: eui.ViewStack;
	private roleSelect: RoleSelectPanel;
	private help: eui.Button;
	private closeBtn: eui.Button;
	private tab: eui.TabBar;

	private ShenluPanel: LongHunWin;
	// private HunguPanel:HunguWin;
	private redPointGroup:eui.Group;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;
	private redPoint4: eui.Image;

	private curRole: number;
	private lastSelect: number = 0;
	private title: eui.Image;
	public constructor() {
		super();
		this.skinName = "TreasureWinSkin";
		this.isTopLevel = true;
	}

	public initUI() {
		super.initUI();
	}
	
	public open(...param: any[]): void {
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.addTouchEvent(this.help, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.observe(HeartMethodRedPoint.ins().postHeartMethodRedPoint, this.showRoleRedPoint);
		// this.observe(ShenshouRedpoint.ins().postRedPoint, this.showTabRedPoint);
		this.lastSelect = param[0] || 0;
		this.curRole = param[1] || 0;

		this.viewStack.selectedIndex = this.lastSelect;
		this.roleSelect.setCurRole(this.curRole);
		this.setOpenIndex(this.viewStack.selectedIndex);

		//玉佩
		this.observe(UserBag.ins().postItemAdd, this.delayRedPoint);
		this.observe(UserBag.ins().postItemDel, this.delayRedPoint);
		this.observe(UserBag.ins().postItemChange, this.delayRedPoint);
		this.observe(Actor.ins().postLevelChange, this.delayRedPoint);
		// this.observe(JadeNew.ins().postJadeData, this.delayRedPoint);

		this.observe(LongHun.ins().postDateUpdate, this.delayRedPoint);
		this.observe(LongHun.ins().postStageUpgrade, this.delayRedPoint);
		this.observe(LongHun.ins().postStageActive, this.delayRedPoint);

		// this.observe(HunguRedPoint.ins().postRedPoint,this.showTabRedPoint);
		this.checkYuPeiRed();
		// this.checkPanel();

		// this.tab.addChild(this.redPoint0);
		// this.tab.addChild(this.redPoint2);
	}

	public close(...param: any[]): void {
		let num = this.viewStack.numChildren;
		for (let i = 0; i < num; i++) {
			(this.viewStack.getChildAt(i) as any).close();
		}
	}
	// private checkPanel(){
	// 	if( Hungu.ins().checkShowOpen() ){
	// 		if( !this.HunguPanel.parent ){
	// 			this.viewStack.addChild(this.HunguPanel);
	// 		}
	// 		if( this.redPoint4.parent ){
	// 			this.redPointGroup.addChild(this.redPoint4);
	// 		}
	// 	}else{
	// 		DisplayUtils.removeFromParent(this.HunguPanel);
	// 		DisplayUtils.removeFromParent(this.redPoint4);
	// 	}
	// }
	private delayRedPoint() {
		if (!TimerManager.ins().isExists(this.checkYuPeiRed, this)) TimerManager.ins().doTimer(60, 1, this.checkYuPeiRed, this);
	}

	private checkYuPeiRed(): void {
		this.redPoint0.visible = false;
		this.redPoint1.visible = JadeNew.ins().checkRed();
		
		for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
			let b = LongHun.ins().canShowRedPointInRole(i);
			if (b) {
				this.redPoint0.visible = b;
				break;
			}
		}

		this.showRoleRedPoint();
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!TreasureWin.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

	private onTabTouch(e: egret.Event) {
		this.setOpenIndex(this.viewStack.selectedIndex);
	}

	private setRoleId(roleId: number): void {
		this.curRole = roleId;
		this.setOpenIndex(this.viewStack.selectedIndex);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.help:
			    if (this.viewStack.selectedIndex == TreasureWin.Xinfa) {
				   ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[41].text);
				// if (this.viewStack.selectedIndex == TreasureWin.Longhun) {

				} else if (this.viewStack.selectedIndex == TreasureWin.Yupei) {
					ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[43].text);
				// } else if (this.viewStack.selectedIndex == TreasureWin.Xinfa) {
				// 	ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[27].text);
				// }else if (this.viewStack.selectedIndex == TreasureWin.Hungu) {
				// 	ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[36].text);
				}
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}

	}

	private setOpenIndex(index) {
		this.lastSelect = index;
		this.help.visible = true;
		this.roleSelect.currentState = `yhead`;
		let param = [];
		switch (this.viewStack.selectedIndex) {
			case TreasureWin.Longhun:
				this.title.source = "mibao_title_png";
				this.help.visible = false;
				break;
			case TreasureWin.Yupei:
				this.title.source = "biaoti_yupei";
				break;
			case TreasureWin.Xinfa:
				this.title.source = "tianshu_title";
				if (this.lastSelect != undefined) {
					let hmwin = this.viewStack.getElementAt(this.lastSelect) as HeartMethodWin;
					if( hmwin )
						param[0] = hmwin.heartId;
				}
				break;
			// case TreasureWin.Shenshou:
			// 	this.help.visible = false;
			// 	this.title.source = "biaoti_shoushen";
			// 	this.roleSelect.currentState = `nohead`;
			// 	break;
			// case TreasureWin.Hungu:
			// 	this.title.source = "hunguName";
			// 	param[0] = HGPOS.ITEM0;
			// 	break;
		}
		if (this.lastSelect != undefined) {
			this.viewStack.getElementAt(this.lastSelect)['close']();
		}
		this.viewStack.getElementAt(this.lastSelect)['open'](this.curRole,param[0]);
		// if (this.lastSelect == TreasureWin.Longhun || this.lastSelect == TreasureWin.Yupei) {
		// 	this.roleSelect.openRole();
		// } else {
		// 	this.roleSelect.hideRole();
		// }
		this.showRoleRedPoint();
	}

	private onChange(e: egret.Event): void {
		this.setRoleId(this.roleSelect.getCurRole());
	}

	/**页签开启判定*/
	private static checkIsOpen(index: number): boolean {
		if (index == TreasureWin.Xinfa && !HeartMethod.ins().checkOpen()) {
			UserTips.ins().showTips(`开服第${GlobalConfig.HeartMethodBaseConfig.serverDay}天并达到${GlobalConfig.HeartMethodBaseConfig.zsLv}转开启`);
			return false;
		}
		
		if (index == TreasureWin.Yupei && !JadeNew.ins().checkOpen()) {
			UserTips.ins().showTips(`开服第${GlobalConfig.JadePlateBaseConfig.openDay}天并达到${GlobalConfig.JadePlateBaseConfig.openlv}级开启`);
			return false;
		}
		
		// if (index == TreasureWin.Shenshou && !ShenshouModel.ins().checkOpen()) {
		// 	UserTips.ins().showTips(`开服第${GlobalConfig.ShenShouConfig.openserverday}天并达到${GlobalConfig.ShenShouConfig.openzhuanshenglv}转开启`);
		// 	return false;
		// }

		// if( index == TreasureWin.Hungu && !Hungu.ins().checkOpen() ){
		// 	UserTips.ins().showTips(`开服第${GlobalConfig.HunGuConf.openserverday}天并达到${GlobalConfig.HunGuConf.openzhuanshenglv}转开启`);
		// 	return false;
		// }

		return true;
	}

	static openCheck(...param) {

		return true;
	}

	/**
	 * 显示页签红点
	 * @returns void
	 */
	private showTabRedPoint(): void {
		this.redPoint2.visible = HeartMethodRedPoint.ins().redPoint;
		// let roleIndex: number = this.roleSelect.getCurRole();
		// this.redPoint3.visible = ShenshouRedpoint.ins().redpoint;
		// this.redPoint4.visible = HunguRedPoint.ins().redPoint;
	}

	/**
	 * 显示角色红点
	 * @returns void
	 */
	private showRoleRedPoint(): void {
		let len: number = SubRoles.ins().subRolesLen;
		switch (this.viewStack.selectedIndex) {
			case TreasureWin.Longhun:
				for (let i: number = 0; i < len; i++) {
					this.roleSelect.showRedPoint(i, LongHun.ins().canShowRedPointInRole(i));
				}
				break;
			case TreasureWin.Yupei:
				for (let i: number = 0; i < len; i++)
					this.roleSelect.showRedPoint(i, JadeNew.ins().checkRedByRoleID(i));
				break;
			case TreasureWin.Xinfa:
				for (let i: number = 0; i < len; i++) {
					let red = false;
					for (let k in HeartMethodRedPoint.ins().roleTabs[i]) {
						if (HeartMethodRedPoint.ins().roleTabs[i][k]) {
							red = true;
							break;
						}
					}
					this.roleSelect.showRedPoint(i, red);
				}
				break;
			// case TreasureWin.Hungu:
			// 	for (let i: number = 0; i < len; i++) {
			// 		let red = HunguRedPoint.ins().roleTabs[i];
			// 		this.roleSelect.showRedPoint(i, red);
			// 	}
			// 	break;

		}
		this.showTabRedPoint();
	}


}

ViewManager.ins().reg(TreasureWin, LayerManager.UI_Main);