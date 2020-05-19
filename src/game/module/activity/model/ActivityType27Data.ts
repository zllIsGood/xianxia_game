
/**
 * 春节活动
 * Created By ade 2019/01/18
 */
class ActivityType27Data extends ActivityBaseData {

    //中奖标记位
	public recrod: number;
	//已寻宝次数
	public num: number = 0;
	//日志
	public logs: any[];
	//极品日志
	public bestlogs: any[];

	constructor(bytes: GameByteArray) {
		super(bytes);
		this.init(bytes);
	}

	init(bytes: GameByteArray) { 
		this.num = bytes.readInt();
		this.recrod = bytes.readInt();
		let len = bytes.readShort();

		if (this.logs) this.logs.length = 0;
		else this.logs = [];

		for (let i = 0; i < len; i++) {
			let data = [bytes.readString(), bytes.readInt()];
			this.logs.push(data);
		}
		this.logs = this.logs.reverse();

		if (this.bestlogs) this.bestlogs.length = 0;
		else this.bestlogs = [];
		len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			let data = [bytes.readString(), bytes.readInt()];
			this.bestlogs.push(data);
		}
	}

	update(bytes: GameByteArray) {
		let index = bytes.readShort();
		this.num = bytes.readInt();
		this.recrod = bytes.readInt();
		let num = bytes.readShort();
		let arr = [];
		for (let i = 0; i < num; i++)
			arr[i] = [bytes.readInt(), bytes.readShort()];

		let type = 0;
		if (index == 2)
			type = 1;

		if (ViewManager.ins().isShow(HuntResultWin))
			Activity.ins().postHuntResult(type, arr, 3, this.id);
		else {
			ViewManager.ins().open(HuntResultWin, type, arr, 2, this.id);
			Activity.ins().postHuntResult(type, arr, 3, this.id);
		}
	}

	isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		if (beganTime < 0 && endedTime > 0)
			return true;

		return false;
	}

	getLeftTime() {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let desc: string = ""
		if (beganTime >= 0) {
			desc = "活动未开启";
		} else if (endedTime <= 0) {
			desc = "活动已结束";
		} else {
			desc = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 4);
		}

		return desc;
	}

	canReward(): boolean {
		return this.checkRedPoint();
	}

	/**
	 * 返回值 0不可领取 1已领取 2可领取
	 * @param index
	 * @returns {number}
	 */
	getStateByIndex(index: number): number {
		let state = (this.recrod >> index) & 1;
		if (state == 0) {
			let config = GlobalConfig.ActivityType27Config[this.id][index];
			if (config && config.dbCount && config.dbCount <= this.num)
				state = 2;
		}
		return state;
	}

	//判断红点
	public checkRedPoint(): boolean {
		let config = GlobalConfig.ActivityType27Config[this.id];
		for (let i in config) {
			if (config[i].dbCount && this.num >= config[i].dbCount && ((this.recrod >> config[i].index) & 1) == 0) {
				return true;
			}
		}
		return false;
	}
}