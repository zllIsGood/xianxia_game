/**
 * 活动类型9
 * Created by hujinheng 2017/11/17
 */
class OSATarget9Panel extends ActivityPanel {
	public cruPanel: any;
	public type9PanelList: any[] = [];

	public constructor() {
		super();
	}

	public open(...param: any[]): void {
		let config:ActivityType9Config = GlobalConfig.ActivityType9Config[this.activityID][0];
		if (!this.type9PanelList[this.activityID]) {
			let panel: ActivityPanel = ObjectPool.pop(`OSATarget9Panel${config.showType}`);
			panel.top = 0;
			panel.bottom = 0;
			panel.left = 0;
			panel.right = 0;
			panel.activityID = this.activityID;
			this.type9PanelList[this.activityID + ""] = panel;
		}
		this.cruPanel = this.type9PanelList[this.activityID + ""];
		this.cruPanel.open();
		this.addChild(this.cruPanel);
		// if (!this.cruPanel || this.cruPanel.activityID != this.activityID) {
		// 	if (this.cruPanel) {
		// 		/**
		// 		 * 转盘类型依靠7号消息返回索引(转盘时候7号消息第一次返回奖励索引 第二次返回奖励)
		// 		 * 此处showType1和3类型发送2号消息会用7号消息返回即:ActivityWin的ChangePageCallBack导致转盘提早结束所以跳过这步骤
		// 		 */
		// 		if (config.showType == 1 || config.showType == 3 || config.showType == 4) {
		// 		}//转盘类型
		// 		else {
		// 			this.cruPanel.close();
		// 			DisplayUtils.removeFromParent(this.cruPanel);
		// 		}
		// 	}
		// 	this.cruPanel = ObjectPool.pop(`OSATarget9Panel${config.showType}`);
		// 	this.cruPanel.top = 0;
		// 	this.cruPanel.bottom = 0;
		// 	this.cruPanel.left = 0;
		// 	this.cruPanel.right = 0;
		// 	this.cruPanel.activityID = this.activityID;
		// 	this.cruPanel.open();
		// 	this.addChild(this.cruPanel);
		// }
	}

	public close(...param: any[]): void {
		if (this.cruPanel) this.cruPanel.close();
		DisplayUtils.removeFromParent(this.cruPanel);
	}

	public updateData() {
		this.cruPanel.updateData();
	}

}
