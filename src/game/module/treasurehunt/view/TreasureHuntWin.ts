/**
 *寻宝代码重构 2016-11.17
 * @author hepeiye
 *
 */
class TreasureHuntWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;

	public treasureHuntPanel: TreasureHuntPanel;//寻宝
	public treasureRune: TreasureRunePanel;//符文寻宝
	public treasureChuanshi:TreasureChuanshiPanel; //诛仙寻宝
	// public orangeEquipPanel: OrangeEquipPanel;//神装
	// public legendEquipPanel: LegendEquipPanel;//传奇
	// public treasureStorePanel: TreasureStorePanel;//仓库
	public redGroup:eui.Group;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2:eui.Image;


	/**角色选择面板 */
	// public roleSelectPanel: RoleSelectPanel;
	/** 当前选择的角色 */
	private curRole: number = 0;

	private panelArr: any[];

	private curSelectIndex: number = 0;
	private help:eui.Button;
	private helpIndex:number;
	constructor() {
		super();
		this.skinName = "TreasureHuntSkin";
		this.isTopLevel = true;
		// this.setSkinPart("treasureHuntPanel", new TreasureHuntPanel());
		// this.setSkinPart("treasureRune", new TreasureRunePanel());
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}

	public initUI(): void {
		super.initUI();
		this.panelArr = [this.treasureHuntPanel, this.treasureRune, this.treasureChuanshi];
		this.viewStack.selectedIndex = 0;

		this.checkHeirloomOpen();
		this.tab.dataProvider = this.viewStack;
		// this.roleSelectPanel.visible = false;
	}

	public destoryView(): void {
		super.destoryView();
		// this.roleSelectPanel.destructor();
	}

	public open(...param: any[]): void {
		let page: number = param[0] ? param[0] : 0;
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addTouchEvent(this.help, this.onClick);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.checkIsOpen);
		this.observe(UserBag.ins().postItemChange, this.setRedPoint);//道具变更
		this.observe(UserBag.ins().postItemAdd, this.setRedPoint);//道具添加
		this.observe(UserBag.ins().postItemDel, this.setRedPoint);//道具删除
		this.observe(GameLogic.ins().postChildRole, this.setRedPoint);//子角色变更
		this.observe(Rune.ins().postRuneBoxGift,this.setRedPoint);
		this.observe(GameServer.ins().postServerOpenDay, this.checkHeirloomOpen);
		this.observe(UserZs.ins().postZsLv, this.checkHeirloomOpen);
		// this.addChangeEvent(this.roleSelectPanel, this.switchRole);
		this.setSelectedIndex(page);
		this.setRedPoint();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.closeBtn0, this.onClick);
		// this.roleSelectPanel.removeEventListener(egret.Event.CHANGE, this.switchRole, this);
		this.removeObserve();
		this.panelArr[this.curSelectIndex].close();
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
				if( this.helpIndex )
					ViewManager.ins().open(ZsBossRuleSpeak, this.helpIndex);
				break;
		}
	}

	private switchRole() {
		// let curRole = this.roleSelectPanel.getCurRole();
		// this.legendEquipPanel.setRoleId(curRole);
		// this.orangeEquipPanel.setRoleId(curRole);
	}
	private checkIsOpen(e: egret.Event) {
		let tab = e.target;
		let openlevel: number = GlobalConfig.FuwenTreasureConfig.openlevel;
		if (tab.selectedIndex == 1 && Actor.level < openlevel) {
			UserTips.ins().showTips(`${openlevel}级开启`);
			e.$cancelable = true;
			e.preventDefault();
			return;
		}
	}
	private onTabTouch(e: egret.TouchEvent): void {
		this.panelArr[this.curSelectIndex].close();
		let selectedIndex = e.currentTarget.selectedIndex;
		this.setSelectedIndex(selectedIndex);
		this.setRedPoint();
		ViewManager.ins().close(LimitTaskView);
	}

	private setSelectedIndex(selectedIndex: number) {
		this.curSelectIndex = selectedIndex;
		// this.roleSelectPanel.visible = false;
		this.panelArr[selectedIndex].open();
		this.viewStack.selectedIndex = selectedIndex;
		this.showHelp(selectedIndex);
	}

	private showHelp(selectedIndex:number){
		// console.log("selectedIndex: " + selectedIndex);
		switch(selectedIndex){
			case 1:
				this.help.visible = true;
				this.helpIndex = 13;
				break;
			case 2:
				this.help.visible = true;
				this.helpIndex = 27;
				break;
			case 0:
				this.help.visible = true;
				this.helpIndex = 39;
				break;
			default:
				this.help.visible = false;
				this.helpIndex = 0;
				break;
		}

	}

	public static openCheck(...param: any[]): boolean {
		if( param[0] && param[0] == 2 ){
			if( !Heirloom.ins().isHeirloomHuntOpen() ){
				UserTips.ins().showTips(`开服第${GlobalConfig.HeirloomTreasureConfig.openDay+1}天达到${GlobalConfig.HeirloomTreasureConfig.openZSlevel}转后方可参与`);
				return false;
			}
		}

		if (OpenSystem.ins().checkSysOpen(SystemType.TREASURE)) {
			ViewManager.ins().close(LiLianWin);
			// ViewManager.ins().close(LimitTaskView);
			return true;
		}

		UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.TREASURE));
		return false;
	}

	private setRedPoint(): void {
		// this.redPoint0.visible = this.redPoint1.visible = false;
		// let bool: boolean = false;
		// let len: number = SubRoles.ins().subRolesLen;
		// // let rolePoint: boolean[] = [false, false, false];
		// for (let a: number = 0; a < len; a++) {
		// 	for (let i = 0; i < 8; i++) {
		// 		// let equipItem: eui.Component = this["equip" + i];
		// 		bool = UserEquip.ins().setOrangeEquipItemState(i, SubRoles.ins().getSubRoleByIndex(a));
		// 		if (bool)
		// 			break;
		// 	}
		// 	if (this.viewStack.selectedIndex == 1)
		// 		// this.roleSelectPanel.showRedPoint(a, bool);
		// 		if (bool)
		// 			this.redPoint0.visible = bool;
		// }
		// if (this.redPoint0.visible == false)
		// 	this.redPoint0.visible = UserEquip.ins().checkRedPoint(4);
		// bool = false;
		// for (let a: number = 0; a < len; a++) {
		// 	for (let i = 0; i < 2; i++) {
		// 		bool = UserEquip.ins().setLegendEquipItemUpState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a));
		// 		bool = UserEquip.ins().setLegendEquipItemState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a)) || bool;
		// 		if (bool)
		// 			break;
		// 	}
		// 	if (this.viewStack.selectedIndex == 2)
		// 		// this.roleSelectPanel.showRedPoint(a, bool);
		// 		if (bool)
		// 			this.redPoint1.visible = bool;
		// }
		// if (this.redPoint1.visible == false)
		// 	this.redPoint1.visible = UserEquip.ins().checkRedPoint(5);

		this.redPoint0.visible = Boolean(UserBag.ins().getHuntGoods(0).length);
		this.redPoint1.visible = Boolean(UserBag.ins().getHuntGoods(1).length) || Rune.ins().getIsGetBox()||RuneRedPointMgr.ins().checkCanExchange();
		this.redPoint2.visible = Boolean(Heirloom.ins().isHeirloomHuntOpen() && (UserBag.ins().getHuntGoods(2).length || Heirloom.ins().getIsGetBox()));
	}

	private checkHeirloomOpen():void
	{
		if (Heirloom.ins().isHeirloomHuntOpen())
		{
			if (this.viewStack.length < 3)
			{
				this.viewStack.addChild(this.treasureChuanshi);
				this.redGroup.addChild(this.redPoint2);
				this.tab.dataProvider = this.viewStack;
			}
		}
		else
		{
			if (this.viewStack.length > 2)
			{
				this.viewStack.removeChildAt(2);
				this.redGroup.removeChildAt(2);
				this.tab.dataProvider = this.viewStack;
			}
		}
	}

}

ViewManager.ins().reg(TreasureHuntWin, LayerManager.UI_Main);