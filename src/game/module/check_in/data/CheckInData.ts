class CheckInData {
	//签到日期 1,2,3,4,5
	public cDate: number;
	//奖励状态 1未领取，2已领取
	public rewardState: number;

	public paser(bytes: GameByteArray):void
	{
		this.cDate = bytes.readShort();
		this.rewardState = bytes.readShort();
	}
}