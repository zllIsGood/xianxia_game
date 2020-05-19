/**
 * 神羽主界面
 */
class GodWingWin extends BaseEuiView {
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;

	public roleSelect: RoleSelectPanel;
	public godWingPanel: GodWingPanel;
	public godWingComposePanel: GodWingComposePanel;
	public godWingTransferPanel: GodWingTransferPanel;

	private roleIndex: number = 0;

	private redPoint0:eui.Image;
	private redPoint1:eui.Image;
	private redPoint2:eui.Image;

	constructor() {
		super();
		this.skinName = "ShenYuSkin";
		this.isTopLevel = true;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}
	public initUI(): void {
		super.initUI()
	}
	public destoryView(): void {
		super.destoryView();
	}
	public close(...param: any[]): void {
		// this.removeTouchEvent(this.openStatusBtn, this.onTap);
		this.removeObserve();
		this.godWingPanel.close();
		// this.godWingComposePanel.close();
		// this.godWingTransferPanel.close();
	}


	public open(...param: any[]): void {
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.addChangeEvent(this.roleSelect, this.onChange);

		this.observe(GodWingRedPoint.ins().postGodWingRedPoint, this.updateRedPoint);
		this.observe(GodWingRedPoint.ins().postGodWingItem, this.updateRedPoint);
		this.observe(GameLogic.ins().postChildRole, this.updateRedPoint);


		this.roleIndex = param[0] ? param[0] : 0;
		this.roleSelect.setCurRole(this.roleIndex);
		this.godWingPanel.curRole = this.roleIndex;


		this.setOpenIndex(0);
		this.updateRedPoint();
	}
	private onTabTouching(e: egret.TouchEvent){
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}
	//各页签开启条件
	private checkIsOpen(index: number): boolean {

		return true;
	}
	private onChange(e: egret.Event): void {
		TimerManager.ins().doTimer(100,1,()=>{
			this.setRoleId(this.roleSelect.getCurRole())
		},this);
		
	}
	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(this.tab.selectedIndex);
	}
	private setRoleId(roleId: number): void {
		this.godWingPanel.curRole = roleId;
		this.setOpenIndex(this.viewStack.selectedIndex);
	}
	private setOpenIndex(selectedIndex: number): void {
		switch (selectedIndex) {
			case 0://装备
				this.roleSelect.openRole();
				this.godWingPanel.open();
				break;
			case 1://合成
				this.roleSelect.hideRole();
				this.godWingComposePanel.open();
				break;
			case 2://转换
				this.roleSelect.hideRole();
				this.godWingTransferPanel.open();
				break;
		}
		this.tab.selectedIndex = this.viewStack.selectedIndex = selectedIndex;
	}
	private updateRedPoint(){
		if( !GodWingRedPoint.ins().tabs )
			GodWingRedPoint.ins().tabs = {};
		this.redPoint0.visible = GodWingRedPoint.ins().tabs[0];
		this.redPoint1.visible = GodWingRedPoint.ins().tabs[1];
		// this.redPoint2.visible = GodWingRedPoint.ins().tabs[2];
		if( !this.tab.selectedIndex ){
			for( let i = 0; i < SubRoles.ins().subRolesLen;i++ ){
				this.roleSelect.showRedPoint(i,GodWingRedPoint.ins().roleTabs[this.tab.selectedIndex][i]);
			}
		}

	}





}
ViewManager.ins().reg(GodWingWin, LayerManager.UI_Main);