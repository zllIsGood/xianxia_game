
class OSATarget7Panel extends ActivityPanel {

	public type2PanelList: any[] = [];
	public cruPanel: any;

	constructor() {
		super();
	}

	public open(...param: any[]): void {
		if (this.cruPanel) 
		{
			this.cruPanel.close();
			DisplayUtils.removeFromParent(this.cruPanel);
		}

		let config:ActivityType7Config[] = GlobalConfig.ActivityType7Config[this.activityID];
		if (!this.type2PanelList[this.activityID]) {
			let showType:number = config[1].showType;
			let panel: ActivityPanel = ObjectPool.pop(`OSATarget7Panel${showType == ActivityType7Data.TYPE_RING || showType == ActivityType7Data.TYPE_HEFUBOSS ? 1 : showType}`);
			panel.top = 0;
			panel.bottom = 0;
			panel.left = 0;
			panel.right = 0;
			panel.activityID = this.activityID;
			this.type2PanelList[this.activityID + ""] = panel;
		}
		
		this.cruPanel = this.type2PanelList[this.activityID + ""];
		this.cruPanel.open();
		this.addChild(this.cruPanel);
	}

	public close(...param: any[]): void {
		if(this.cruPanel) this.cruPanel.close();
		DisplayUtils.removeFromParent(this.cruPanel);
	}
	
	public updateData() {
		this.cruPanel.updateData();
	}

}
