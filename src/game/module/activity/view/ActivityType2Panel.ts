class ActivityType2Panel extends ActivityPanel {

	public type2PanelList: any[] = [];
	public cruPanel: any;

	constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public open(...param: any[]): void {
		if (this.cruPanel) {
			this.cruPanel.close();
			DisplayUtils.removeFromParent(this.cruPanel);
		}
		let config: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		switch (config.openType) {
			case 1:
				if (!this.type2PanelList[this.activityID + ""]) {
					this.type2PanelList[this.activityID + ""] = new Activity2Panel2();
					this.type2PanelList[this.activityID + ""].activityID = this.activityID;
				}
				break;
			case 2:
				if (!this.type2PanelList[this.activityID + ""]) {
					this.type2PanelList[this.activityID + ""] = new Activity2Panel1();
					this.type2PanelList[this.activityID + ""].activityID = this.activityID;
				}
				break;
			default:
				break;
		}
		this.cruPanel = this.type2PanelList[this.activityID + ""];
		this.cruPanel.open();
		this.addChild(this.cruPanel);
	}

	public close(...param: any[]): void {
		DisplayUtils.removeFromParent(this.cruPanel);
	}


	public updateData() {
		this.cruPanel.updateData();
	}
}
