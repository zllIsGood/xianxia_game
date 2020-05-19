class GuildWarRewardWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public tab: eui.TabBar;
	public viewStack: eui.ViewStack;
	public title: eui.Image;
	public roleSelect:eui.Component;

	private guildInteRankInfo: GuildInteRankInfo;
	private personalInteRankInfo: PersonalInteRankInfo;
	private guildInteRewardInfo: GuildInteRewardInfo;
	private personInteRewardInfo: PersonInteRewardInfo;

	private type: number = 0;
	private cruPanel: any;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "GuildWarRewardSkin";
		this.isTopLevel = true;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}

	public addPanelList(): void {
		this.guildInteRankInfo = new GuildInteRankInfo();
		this.viewStack.addChild(this.guildInteRankInfo);
		this.personalInteRankInfo = new PersonalInteRankInfo();
		this.viewStack.addChild(this.personalInteRankInfo);
		this.guildInteRewardInfo = new GuildInteRewardInfo();
		this.viewStack.addChild(this.guildInteRewardInfo);
		this.personInteRewardInfo = new PersonInteRewardInfo();
		this.viewStack.addChild(this.personInteRewardInfo);

		this.cruPanel = this.viewStack.getChildAt(0);
		this.tab.dataProvider = this.viewStack;
		// this.title.source = this.type == 1 ? "jzsc_38" : "jzsc_06";
	}

	public open(...param: any[]): void {
		if (param && param[1]) {
			this.type = param[1];
		}
		this.addPanelList();
		if (param && param[0])
			this.viewStack.selectedIndex = param[0];
		else
			this.viewStack.selectedIndex = 0;
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.cruPanel.open();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.cruPanel.close();
		this.viewStack.removeChildren();
		this.type = 0;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(GuildWarRewardWin);
				break;
		}
	}

	private onTabTouch(e: egret.TouchEvent): void {
		if (this.cruPanel) {
			this.cruPanel.close();
		}
		this.cruPanel = this.viewStack.selectedChild;
		this.cruPanel.open();
	}
}
ViewManager.ins().reg(GuildWarRewardWin, LayerManager.UI_Main);