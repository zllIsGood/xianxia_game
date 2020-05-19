class RRoleSelectPanel extends BaseView {

	public roles: eui.ToggleButton[];
	public role0: eui.ToggleButton;
	public role1: eui.ToggleButton;
	public role2: eui.ToggleButton;

	private _otherPlayerData: OtherPlayerData;

	/** 当前选择的角色 */
	private _curRole: number = 0;

	constructor() {
		super();
		this.skinName = "RoleSelectPanelSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(){
		this.roles = [this.role0, this.role1, this.role2];
		this.addTouchEvent(this, this.onClick);
	}

	public open(): void {
		this.setCurRole(0);
		
	}

	public set otherPlayerData(value: OtherPlayerData) {
		this._otherPlayerData = value;
		this.updateRole();
	}
	public setOtherPlaterData(value: OtherPlayerData) {
		this._otherPlayerData = value;
		this.updateRole();	
	}

	public getCurRole(): number {
		return this._curRole;
	}

	public setCurRole(value: number) {
		this._curRole = value;

		for (let i = 0; i < this.roles.length; i++) {
			let element: eui.ToggleButton = this.roles[i];
			element.selected = i == value;
		}

		this.dispatchEventWith(egret.Event.CHANGE, false, this._curRole);
	}

	private onClick(e: egret.TouchEvent): void {
		let index: number = this.roles.indexOf(e.target);
		if (index > -1) {
			let roleBtn: eui.ToggleButton = e.target as eui.ToggleButton;
			if (this._otherPlayerData.roleData[index]) {
				//切换角色
				this.setCurRole(index);
			}
			else {
				roleBtn.selected = false;
			}
		}
	}

	private updateRole(): void {
		let role: eui.ToggleButton;
		let roleData: Role;
		for (let i = 0; i < this.roles.length; i++) {
			role = this.roles[i];
			roleData = this._otherPlayerData.roleData[i];
			if (roleData) {
				role['jobImg'].visible = true;
				role['jobImg'].source = `common1_profession${roleData.job}`;
				role.icon = `main_role_head${roleData.job}`;
			}
			else {
				role.icon = ``;
				role['jobImg'].visible = false;
			}
		}
	}

	public destructor(): void {
		this.removeTouchEvent(this, this.onClick);
		DisplayUtils.removeFromParent(this);

	}
}