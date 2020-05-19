/**
 * RoleWin
 */
class RRoleWin extends BaseEuiView {
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
	public bgClose: eui.Rect;
	constructor() {
		super();
		this.skinName = "RRoleWinSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		// this.setSkinPart("roleSelect", new RRoleSelectPanel());
		// this.setSkinPart("roleInfoPanel", new RRoleInfoPanel());

		this.viewStack.selectedIndex = 0;
	}


	public open(...param: any[]): void {
		this.otherPlayerData = param[0];
		// this.roleSelect.otherPlayerData = this.otherPlayerData;
		this.roleSelect.setOtherPlaterData(this.otherPlayerData);
		this.nameTxt.text = this.otherPlayerData.name;

		this.addTouchEvent(this, this.onClick);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.roleSelect.setCurRole(0);
		this.setRoleInfo();
		this.roleInfoPanel.showZhanling(this.otherPlayerData);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onClick);
	}

	public destoryView(): void {
		super.destoryView();

		this.roleSelect.destructor();
		this.roleInfoPanel.close();
	}

	private setRoleInfo(): void {
		let tempData = this.otherPlayerData.roleData[0];
		this.nameTxt.text = this.otherPlayerData.name;
		this.guildNameText.x = this.nameTxt.x + this.nameTxt.textWidth + 10;
		this.guildNameText.text = this.otherPlayerData.guildName ? `仙盟：${this.otherPlayerData.guildName}` : "";
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
			case this.bgClose:
				ViewManager.ins().close(this);
				let uiview2: UIView2 = ViewManager.ins().getView(UIView2) as UIView2;
				if (uiview2)
					uiview2.closeNav(UIView2.NAV_ROLE);
				break;
		}
	}

	/**屏蔽部分入口
	 * type = 1 1v1玩家界面查看
	 * type = 2 跨服消费榜用到
	*/
	public hideEx(type: number = 1): void {
		// switch (type) {
		// 	case 1:
		// 		this.roleInfoPanel.juesexiangxi.visible = false;
		// 		this.roleInfoPanel.powerPanel.visible = false;
		// 		if (this.likeBtn) this.likeBtn.visible = true;
		// 		break;
		// 	case 2:
		// 		this.roleInfoPanel.juesexiangxi.visible = false;
		// 		this.roleInfoPanel.powerPanel.visible = false;
		// 		if (this.likeBtn) this.likeBtn.visible = false;
		// 		break;
		// }
	}
}

ViewManager.ins().reg(RRoleWin, LayerManager.UI_Main);