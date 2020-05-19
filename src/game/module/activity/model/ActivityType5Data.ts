class ActivityType5Data extends ActivityBaseData {

	public recrod: number;//领取状态
	public logTime: number;

	public constructor(bytes: GameByteArray) {
		if (!bytes)
			return;
	
		super(bytes);
		this.recrod = bytes.readInt();
	}

	public updateRecord(bytes: GameByteArray):void
	{
		this.recrod = bytes.readInt();
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		let short: number = bytes.readShort();
		this.recrod = bytes.readInt();
	}

	public updateData(bytes: GameByteArray): void {
		this.logTime = bytes.readInt();
	}
	//活动是否开启
	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);

		if (beganTime < 0 && endedTime > 0) {
			return true;
		}
		return false;
	}

	//是否可以领取奖励
	public canReward(index: number = 0): boolean {
		if (index == 0) {
			index = this.logTime;
		}
		let configs: ActivityType5Config[] = GlobalConfig['ActivityType5Config'][this.id];
		for (let k in configs) {
			let statu: number = (this.recrod >> configs[k].index) & 1;
			if (statu == 0 && configs[k].day <= this.logTime) {
				return true;
			}
		}
		return false;
	}

	public checkOneDayStatu(index: number = 0): boolean {
		if (index == 0) {
			index = this.logTime;
		}
		let configs: ActivityType5Config[] = GlobalConfig['ActivityType5Config'][this.id];
		let statu: number = (this.recrod >> index) & 1;
		if (statu == 0) {
			return true;
		}
		return false;
	}

	public getCurDay() {

		let day = Activity.ins().LoginDayList[this.id] || 0

		return day;
	}
}