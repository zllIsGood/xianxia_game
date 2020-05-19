class GuildSkillWin extends BaseEuiView {

	public roleSelect: RoleSelectPanel;
	public redPoint1: eui.Image;
	public redPoint0: eui.Image;
	public viewStack: eui.ViewStack;
	private lastSelect: number;
	public guildskill: GuildSkillPanel;
	public guildstore: eui.Component;
	public tab: eui.TabBar;
	public guildcampfire:GuildFirePanel;

	constructor() {
		super();
		this.skinName = "GuildSkillSkin";
		this.isTopLevel = true;
	}


	public open(...param: any[]): void {
		this.addChangeEvent(this.tab,this.setSelectedIndex);
		this.observe(GuildRedPoint.ins().postGuildFire, this.updateRed);
		this.observe(GuildRedPoint.ins().postLianGongRedPoint, this.updateRoleRedPoint);
		this.observe(GuildRedPoint.ins().postLianGongRedPoint, this.updateRed);
		this.lastSelect = 0;
		this.viewStack.selectedIndex = this.lastSelect;
		this.addChangeEvent(this.roleSelect, this.update);
		this.viewStack.getElementAt(this.lastSelect)['open']();
		this.guildskill.curRole = this.roleSelect.getCurRole();

		this.updateRed();
		this.updateRoleRedPoint();
	}

	private setSelectedIndex(e: egret.Event) {
		this.selectedIndex(this.viewStack.selectedIndex);
	}

	private selectedIndex(index) {
		if (this.lastSelect != undefined) {
			this.viewStack.getElementAt(this.lastSelect)['close']();
		}
		this.lastSelect = index;
		this.viewStack.getElementAt(this.lastSelect)['open']();

		if (this.lastSelect == 0) {
			this.roleSelect.openRole();
		} else {
			this.roleSelect.hideRole();
		}
	}

	public close(...param: any[]): void {
		this.guildskill.close();
		this.guildcampfire.close();
		ViewManager.ins().open(GuildMap);
	}

	private update(): void {
		if (this.guildskill) {
			this.guildskill.update(this.roleSelect.getCurRole());
		}
	}

	private updateRed() {
		this.redPoint1.visible = GuildRedPoint.ins().guildFire;
		this.redPoint0.visible = GuildRedPoint.ins().liangongRed;
	}
	private updateRoleRedPoint(){
		let roleRedPoint: boolean[] = [false, false, false];
		for (let i = 0; i < roleRedPoint.length; i++) {
			this.roleSelect.showRedPoint(i, roleRedPoint[i]);
		}
		for( let i = 0;i < 1;i++ ){//分页
			if( GuildRedPoint.ins().roleTabs[i] ){
				for (let j = 0; j < SubRoles.ins().subRolesLen; j++) {
					this.roleSelect.showRedPoint(j, GuildRedPoint.ins().roleTabs[i][j]);
				}
			}
		}
	}

	public destoryView(){
		super.destoryView();

		this.roleSelect.destructor();
	}
}
ViewManager.ins().reg(GuildSkillWin, LayerManager.UI_Main);