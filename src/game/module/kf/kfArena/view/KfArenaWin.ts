/**
 * Created by MPeter on 2018/3/12.
 *  跨服3v3竞技场- 主界面
 */
class KfArenaWin extends BaseEuiView {
	/** 页签对应索引 **/
	public static Page_Select_Macth = 0;//匹配页
	public static Page_Select_Rank = 1;//排行页
	public static Page_Select_Join = 2; //参与
	public static Page_Select_Duan = 3;//段位
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;
	public roleSelect: RoleSelectPanel;	//上部角色选择部分
	public rankPanel: KfArenaRankPanel;	 //排行
	private macthPanel: KfArenaMacthPanel; //匹配
	private joinPanel: KfArenaJoinPanel; //参与
	public duanPanel: KfArenaDuanPanel; //段位
	public redPointGroup: eui.Group;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	private seeRule: eui.Button;
	private oldIndex: number;

	public constructor() {
		super();
		this.skinName = "KfArenaSkin";
		this.isTopLevel = true;
	}

	protected childrenCreated(): void {
		this.init();
	}

	public init() {
		
		this.viewStack.selectedIndex = KfArenaWin.Page_Select_Macth;
		this.tab.dataProvider = this.viewStack;
	}

	public open(...param): void {
		this.tab.selectedIndex = this.viewStack.selectedIndex = !isNaN(param[0]) ? param[0] : KfArenaWin.Page_Select_Macth;
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addTouchEvent(this.seeRule, this.onTouch);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.observe(KfArenaRedPoint.ins().postRedPoint, this.redPointEx);
		this.observe(KfArenaSys.ins().postTeamInfo, this.updateChat);
		this.redPointEx();
		this.setOpenIndex(this.tab.selectedIndex);
	}

	public static openCheck(...param): boolean {
		if(!KfArenaSys.ins().isServerOpen){
			UserTips.ins().showTips(`|C:0xf3311e&T:跨服内所有服务器都达到开服${GlobalConfig.CrossArenaBase.openDay}天后开启跨服竞技场玩法|`);
			return false;
		}
		if (GlobalConfig.CrossArenaBase.openDay > GameServer.serverOpenDay + 1) {
			UserTips.ins().showTips(`|C:0xf3311e&T:开服${GlobalConfig.CrossArenaBase.openDay}天开启|`);
			return false;
		}
		if (UserZs.ins().lv < GlobalConfig.CrossArenaBase.zhuanshengLevel) {
			UserTips.ins().showTips(`|C:0xf3311e&T:转生等级${GlobalConfig.CrossArenaBase.zhuanshengLevel}转开启|`);
			return false;
		}
		return true;
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(e.currentTarget.selectedIndex)) {
			e.preventDefault();
			return;
		}
	}

	private checkIsOpen(index: number) {
		return true;
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.seeRule:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[42].text);
				break;
		}
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.redPointEx();
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private setOpenIndex(selectedIndex: number): void {
		this.isOpenChatUI(selectedIndex);

		//调用上一个页面的关闭函数
		if (!isNaN(this.oldIndex) && this.viewStack.getElementAt(this.oldIndex)["close"])
			this.viewStack.getElementAt(this.oldIndex)["close"]();
		this.oldIndex = selectedIndex;

		switch (selectedIndex) {
			case KfArenaWin.Page_Select_Rank:
				this.rankPanel.open();
				break;
			case KfArenaWin.Page_Select_Macth:
				this.macthPanel.open();
				break;
			case KfArenaWin.Page_Select_Join:
				this.joinPanel.open();
				break;
			case KfArenaWin.Page_Select_Duan:
				this.duanPanel.open();
				break;
		}


	}

	public redPointEx() {
		this.redPoint0.visible = KfArenaRedPoint.ins().redpoint_1 > 0;
		this.redPoint1.visible = false;
		this.redPoint2.visible = KfArenaRedPoint.ins().redpoint_2 > 0;
		this.redPoint3.visible = KfArenaRedPoint.ins().redpoint_3 > 0;
	}

	public updateChat(): void {
		this.isOpenChatUI(this.tab.selectedIndex);
	}

	@callDelay(50)
	public isOpenChatUI(index: number): void {
		let isJoinTeam: boolean = KfArenaSys.ins().getIsJoinTeam();
		if (index == KfArenaWin.Page_Select_Macth && isJoinTeam) {
			this.tab.bottom = 154;
			//打开聊天界面
			if (!ViewManager.ins().isShow(ChatMainUI))
				ViewManager.ins().open(ChatMainUI);
			this.redPointGroup.bottom = 181;
		} else {
			if (ViewManager.ins().isShow(ChatMainUI))
				ViewManager.ins().close(ChatMainUI);
			this.tab.bottom = 112;
			this.redPointGroup.bottom = 139;
		}
	}
}
ViewManager.ins().reg(KfArenaWin, LayerManager.UI_Main);
