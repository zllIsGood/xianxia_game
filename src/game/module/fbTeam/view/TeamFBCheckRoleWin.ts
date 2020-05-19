/**
 * 组队副本查看玩家信息界面
 * @author wanghengshuai
 * 
 */
class TeamFBCheckRoleWin extends BaseEuiView{
	
	/** tabPanel */
	public viewStack: eui.ViewStack;

	public nameTxt: eui.Label;
	public guildNameText: eui.Label;
	public levelText: eui.Label;
	public headIcon: eui.Image;
	public jueweiIcon: eui.Image;

	public otherPlayerData: OtherPlayerData;
	public roleSelect: RRoleSelectPanel;
	public roleInfoPanel: RRoleInfoPanel;
	public closeBtn1:eui.Button;

	public constructor() {
		super();
		this.skinName = "teamFbCheckSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.viewStack.selectedIndex = 0;
	}


	public open(...param: any[]): void {
		this.otherPlayerData = param[0];
		// this.roleSelect.otherPlayerData = this.otherPlayerData;
		this.roleSelect.setOtherPlaterData(this.otherPlayerData);
		this.nameTxt.text = this.otherPlayerData.name;
		this.roleSelect.open();
		this.addTouchEvent(this, this.onClick);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.roleSelect.setCurRole(0);
		this.setRoleInfo();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onClick);
		this.roleInfoPanel.clear();
	}

	public destoryView(): void {
		super.destoryView();

		this.roleSelect.destructor();
		this.roleInfoPanel.close();
	}

	private setRoleInfo(): void {
		let tempData = this.otherPlayerData.roleData[0];
		let server: string = `[S${this.otherPlayerData.serverId}]`;
		if (!this.otherPlayerData.serverId || this.otherPlayerData.serverId == LocationProperty.srvid) server = "";
		this.nameTxt.text = this.otherPlayerData.name + server;
		this.guildNameText.x = this.nameTxt.x + this.nameTxt.textWidth + 10;
		this.guildNameText.text = this.otherPlayerData.guildName ? `公会：${this.otherPlayerData.guildName}` : "";
		let strLv: string = this.otherPlayerData.zhuan ? `${this.otherPlayerData.zhuan}转` : "";
		this.levelText.text = `${strLv}${this.otherPlayerData.level}级`;

		this.headIcon.source = `head_${tempData.job}${tempData.sex}`;

		let lv: number = this.otherPlayerData.lilianLv;
		let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[lv];

		this.jueweiIcon.source = `juewei_1_${config.type}_png`;
	}

	private onChange(e: egret.Event): void {
		this.setView(this.roleSelect.getCurRole());
	}

	private setView(id: number = 0): void {
		this.roleInfoPanel.curRole = this.roleSelect.getCurRole();
		this.roleInfoPanel.open(this.otherPlayerData);
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn1:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(TeamFBCheckRoleWin, LayerManager.UI_Popup);