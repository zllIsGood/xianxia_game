/**
 * Created by hrz on 2017/11/20.
 */

class OSATarget5Panel extends ActivityPanel {
	public type5PanelList: any[] = [];
	public cruPanel: any;
	public static targetIndex = {
		157 : "OSATarget5Panel1", //合服7天签到
		210 : "OSATarget5Panel2", //感恩节3天签到
		551: "OSATarget5Panel3",
		2113: "OSATarget5Panel4",
	}
	constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.initPanelList();

	}

	public open(...param: any[]): void {
		this.observe(Activity.ins().postActivityIsGetAwards, this.updateData);
		this.observe(Activity.ins().postChangePage, this.updateData);
		this.observe(Activity.ins().postRewardResult, this.updateData);
		if (this.cruPanel) {
			this.cruPanel.close();
			DisplayUtils.removeFromParent(this.cruPanel);
		}
		let id:number = this.activityID;
		this.initPanelList();
		this.cruPanel = this.type5PanelList[id + ""];
		this.cruPanel.open();
		this.addChild(this.cruPanel);
	}

	public close(...param: any[]): void {
		this.removeObserve();
		if(this.cruPanel) this.cruPanel.close();
		DisplayUtils.removeFromParent(this.cruPanel);
	}
	private initPanelList(){
		let id:number = this.activityID;
		if (!this.type5PanelList[id + ""]) {
			let clsStr = OSATarget5Panel.targetIndex[id] || "OSATarget5Panel_AnyDays";
			let Cls = HYDefine.getDefinitionByName(clsStr);

			this.type5PanelList[id + ""] = new Cls(this.activityID);
			this.type5PanelList[id + ""].top = 0;
			this.type5PanelList[id + ""].bottom = 0;
			this.type5PanelList[id + ""].left = 0;
			this.type5PanelList[id + ""].right = 0;
			this.type5PanelList[id + ""].activityID = this.activityID;
		}
	}

	public updateData() {
		this.cruPanel.updateData();
	}

}