/**
 * 每日签到
 */
class DailyCheckIn extends BaseSystem {
	/**签到天数 */
	public _loginTimes: number = 0;
	/**连续签到天数 */
	public conLoginTimes: number = 0;
	// public stateList: number[] = null;
	public todayReward: boolean = false;

	public rewardIndex;

	/**可补签的index列表 */
	public comTimesIndexList: number[] = [];

	public constructor() {
		super();

		this.sysId = PackageID.DailyCheckIn;

		this.regNetMsg(1, this.postCheckInData);
		// this.regNetMsg(2, this.doCheckIn);
	}

	public static ins(): DailyCheckIn {
		return super.ins() as DailyCheckIn;
	}

	/**
	 * 登陆次数(当月)
	 * @returns number
	 */
	public get loginTimes(): number {
		return this._loginTimes;
	}

	/**
	 * 处理签到数据
	 * 54-1
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public postCheckInData(bytes: GameByteArray): void {
		this._loginTimes = bytes.readShort();
		this.todayReward = bytes.readBoolean()
		this.conLoginTimes = bytes.readShort();
		this.rewardIndex = bytes.readShort();
		// this.rewardList = {};
		// for (let i: number = 0; i < len; i++) {
		// 	this.rewardList[id] = 2;
		// }
	}


	// public checkReCheckIn(index: number): boolean {
	// 	return this.stateList && index < this.stateList.length && !this.stateList[index];
	// }

	/**
	 * 请求签到
	 * 54-1
	 * @param  {number} index
	 * @returns void
	 */
	public sendCheckIn(index: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 请求补签
	 * 54-2
	 * @param  {number} index
	 * @returns void
	 */
	public sendReCheckIn(index: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 处理签到
	 * 54-2
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	// public doCheckIn(bytes: GameByteArray): void {
	// 	let success: number = bytes.readInt();
	// 	let index: number = bytes.readInt();
	// 	this.postCheckIn([Boolean(success), index]);
	// }

	public postCheckIn(param: any[]): any[] {
		return param;
	}


	/**
	 * 领取连续登陆奖励
	 * 54-3
	 * @param  {number} index
	 * @returns void
	 */
	public sendGetReward(index: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/**
	 * 请求补签（暂时不用）
	 * 54-3
	 * @param  {number} index
	 * @returns void
	 */
	// public sendComplement(index: number): void {
	// 	let bytes: GameByteArray = this.getBytes(3);
	// 	bytes.writeInt(index);
	// 	this.sendToServer(bytes);
	// }

	/**
	 * 处理补签（暂时不用）
	 * 54-3
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	// public doComplement(bytes: GameByteArray): void {
	// 	let success: number = bytes.readInt();
	// 	let index: number = bytes.readInt();

	// 	//刷新状态链表
	// 	if (this.stateList && index < this.stateList.length) {
	// 		this.stateList[index] = success;
	// 	}

	// 	this.postComplement([Boolean(success), index]);
	// }

	public postComplement(param: any[]): any[] {
		return param;
	}

	/**
	 * 显示红点
	 * @returns boolean
	 */
	public showRedPoint(): boolean {
		let result: boolean = this.canNormalCheckIn() || this.checkConReward();
		return result;
	}

	/**
	 * 可以普通签到
	 * @returns boolean
	 */
	public canNormalCheckIn(): boolean {

		return !this.todayReward;
	}

	public checkConReward(): boolean {
		// let rewardList: MonthSignDaysConfig = this.getRewardList();
		// if (rewardList) {
		let days = this.getRewardList(this.rewardIndex) ? this.getRewardList(this.rewardIndex).days : 0
		return this.conLoginTimes >= days;
		// }
		// return false;
	}

	public getCheckInState(day: number): number {
		if (day > this.loginTimes) {
			return DailyCheckInState.notYet;
		} else if (day < this.loginTimes) {
			return DailyCheckInState.hasChecked;
		} else {
			if (this.todayReward) {
				return DailyCheckInState.hasChecked;
			} else {
				return DailyCheckInState.canCheck;
			}
		}
	}

	public getRewardDays(): number {
		return 0;
	}

	public getRewardList(index: number): MonthSignDaysConfig {
		if (GlobalConfig.MonthSignDaysConfig[index + 1]) {
			return GlobalConfig.MonthSignDaysConfig[index + 1];
		}
		return null;
	}
}


namespace GameSystem {
	export let  dailycheckin = DailyCheckIn.ins.bind(DailyCheckIn);
}

enum DailyCheckInState {
	/**
	 * 还未领取
	 */
	notYet = 0,
	/**
	 * 准备领取
	 */
	canCheck,
	/**
	 * 领取过了
	 */
	hasChecked,
}