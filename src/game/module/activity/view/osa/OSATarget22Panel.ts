/** 活动类型22界面 */
class OSATarget22Panel extends ActivityPanel {
	public cruPanel: any;

	public constructor() {
		super();
	}

	public open(...param: any[]): void {
		let config: ActivityType22_1Config[] = GlobalConfig.ActivityType22_1Config[this.activityID];
		if (!this.cruPanel || this.cruPanel.activityID != this.activityID) {
			if (this.cruPanel) {
				this.cruPanel.close();
				DisplayUtils.removeFromParent(this.cruPanel);
			}
			this.cruPanel = ObjectPool.pop(`OSATarget22Panel${config[1].showType}`,[this.activityID]);
			this.cruPanel.top = 0;
			this.cruPanel.bottom = 0;
			this.cruPanel.left = 0;
			this.cruPanel.right = 0;
			this.cruPanel.activityID = this.activityID;
			this.cruPanel.open();
			this.addChild(this.cruPanel);
		}
	}

	public close(...param: any[]): void {
		if (this.cruPanel) this.cruPanel.close();
	}

	public updateData() {
		this.cruPanel.updateData();
	}

}