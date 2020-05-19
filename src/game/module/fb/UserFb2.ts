/**副本管理器2 */
class UserFb2 extends BaseSystem {

	public constructor() {
		super();
		this.sysId = PackageID.FbChallenge;
		this.regNetMsg(1, this.postUpDataInfo);
		this.regNetMsg(2, this.postRewardStatu);
		this.regNetMsg(3, this.doGetFbTime);
		this.regNetMsg(4, this.postGetReward);
		this.regNetMsg(5, this.postLotteryReward);
	}

	public static ins(): UserFb2 {
		return super.ins() as UserFb2;
	}

	/**
	 * 发送挑战副本
	 * 24-1
	 * @param fbID 副本id
	 */
	public sendChallenge(): void {
		this.sendBaseProto(1);
	}


	/**
	 * 查看每日奖励
	 * 24-2
	 * @param fbID 副本id
	 */
	public sendrequestDayReward(): void {
		this.sendBaseProto(2);
	}

	/**
	 * 更新挑战副本信息
	 * 24-1
	 * @param bytes
	 */
	postUpDataInfo(bytes: GameByteArray): void {
		SkyLevelModel.ins().setCruLevelInfo(bytes.readInt());
		SkyLevelModel.ins().dayReward = bytes.readShort();
		SkyLevelModel.ins().lotteryIndexs = bytes.readInt();
		SkyLevelModel.ins().lotteryUseTimes = bytes.readInt();
	}

	/**
	 * 更新挑战副本信息
	 * 24-2
	 * @param bytes
	 */
	postRewardStatu(bytes: GameByteArray): void {
		let count: number = bytes.readShort();
		SkyLevelModel.ins().dayRewardList = [];
		for (let i: number = 0; i < count; i++) {
			let subType: number = bytes.readInt();
			let subId: number = bytes.readInt();
			let subCount: number = bytes.readInt();
			SkyLevelModel.ins().dayRewardList[i] = [subType, subId, subCount];
		}
		SkyLevelModel.ins().rewardTimes = Math.ceil((count - 12) / 12);
	}

	/**
	 * 更新挑战副本时间
	 * 24-3
	 * @param bytes
	 */
	private doGetFbTime(bytes: GameByteArray): void {
		SkyLevelModel.ins().setLimtTimeDown(bytes.readShort());
	}

	/**
	 * 发送挑战副本
	 * 24-4
	 * @param fbID 副本id
	 */
	public sendGetDayReward(): void {
		this.sendBaseProto(4);
	}

	/**
	 * 请求转盘抽奖
	 * 24-5
	 */
	public sendBeginLottery():void {
		this.sendBaseProto(5);
	}

	/**
	 * 请求领取抽到的奖励
	 * 24-6
	 */
	public sendGetReward():void {
		this.sendBaseProto(6);
	}

	public postLotteryReward(bytes: GameByteArray):void {
		SkyLevelModel.ins().lotteryUseTimes = bytes.readInt();
		SkyLevelModel.ins().lotteryAwardIndex = bytes.readInt();
	}

	/**
	 * 领取每日奖励返回
	 * 24-4
	 * @param bytes
	 */
	public postGetReward(bytes: GameByteArray): void {

	}
}

namespace GameSystem {
	export let  userfb2 = UserFb2.ins.bind(UserFb2);
}