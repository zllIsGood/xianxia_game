class OSATarget4Panel extends ActivityPanel {

	public type4PanelList: any[] = [];
	public cruPanel: any;


	constructor() { 
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		// this.initPanelList();
	}

	public open(...param: any[]): void {
		if (this.cruPanel) {
			this.cruPanel.close();
			DisplayUtils.removeFromParent(this.cruPanel);
		}
		this.observe(Rank.ins().postRankingData,this.initInfo);
		this.initPanelList();
		// switch (config.openType) {
		// 	case 1:
		// 		if (!this.type4PanelList[this.activityID + ""]) {
		// 			this.type4PanelList[this.activityID + ""] = new OSATarget4Panel2();
		// 			this.type4PanelList[this.activityID + ""].activityID = this.activityID;
		// 		}
		// 		break;
		// 	case 2:
		// 		if (!this.type4PanelList[this.activityID + ""]) {
		// 			this.type4PanelList[this.activityID + ""] = new Activity2Panel1();
		// 			this.type4PanelList[this.activityID + ""].activityID = this.activityID;
		// 		}
		// 		break;
		// 	default:
		// 		break;
		// }

	}
	private initInfo(model: RankModel){
		this.openPanel(model);
	}
	private openPanel(model?: RankModel){
		this.cruPanel = this.type4PanelList[this.activityID + ""];
		this.cruPanel.open(model);
		this.addChild(this.cruPanel);
	}

	public close(...param: any[]): void {
		if(this.cruPanel) this.cruPanel.close();
		DisplayUtils.removeFromParent(this.cruPanel);
	}
	private initPanelList(){
		let config: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		if (!this.type4PanelList[this.activityID + ""]) {
			let panel: OSATarget4Panel2 = new OSATarget4Panel2();
			panel.top = 0;
			panel.bottom = 0;
			panel.left = 0;
			panel.right = 0;
			this.type4PanelList[this.activityID + ""] = panel;
			this.type4PanelList[this.activityID + ""].activityID = this.activityID;
		}
		let rankType:number = GlobalConfig.ActivityType4Config[this.activityID][0].rankType;
		if( rankType && rankType != RankDataType.TYPE_HF_XIAOFEI)
			Rank.ins().sendGetRankingData(rankType);
		else{
			this.openPanel();
		}
	}

	public updateData() {
		this.cruPanel.updateData();
	}
}
