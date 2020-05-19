/**
 *
 * @author hepeiye
 *
 */
class ActivityPanel extends BaseView {
	private _activityID: number;
	private _activityBtnType: number = -1;

	constructor() {
		super();
	}

	/**
	 * 活动按钮类型
	 * @returns number
	 */
	get activityBtnType(): number {
		return this._activityBtnType;
	}

	get activityID(): number {
		return this._activityID;
	}

	set activityID(value: number) {
		this._activityID = value;

		let config = GlobalConfig.ActivityConfig[value];
		if (config && config.tabName)
			this.name = config.tabName;

		let abc: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[value];
		this._activityBtnType = abc.type;
	}


	static create(activityID: number,actType: number): ActivityPanel {
		if (activityID > 10000) {//特殊活动分开处理
			let pan: ActivityPanel = ObjectPool.pop(`OSATarget0Panel`);
			pan.activityID = activityID;
			return pan;
		}
		let config = GlobalConfig.ActivityConfig[activityID];
		// let panel: ActivityPanel = ObjectPool.pop(`ActivityType${config.activityType}Panel`);
		let panel: ActivityPanel = ObjectPool.pop(`OSATarget${config.activityType}Panel`);
		panel.activityID = activityID;
		return panel;
	}

	// 子类必须实现
	public updateData() {

	}

	/**
	 * 通过活动id判断是个人活动还是正常活动
	 * */
	static getActivityTypeFromId(activityID: number): number {
		let config: ActivityBtnConfig ;
		if (GlobalConfig.ActivityBtnConfig[activityID]) {//正常活动
			config = GlobalConfig.ActivityBtnConfig[activityID]
		} 
		if (config) {
			return config.activityType;
		}
		return ActivityType.Normal;
	}

}
