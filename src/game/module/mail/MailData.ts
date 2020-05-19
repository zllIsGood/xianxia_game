/**
 * 邮件系统
 */
class MailData {
	public handle: number;	   //唯一id

	public title: string;	   //标题

	public times: number;	   //时间

	public type: number;		//状态（0：未读，1已读）

	public receive: number;	 //附件是否领取（-1没有附件，0可领取，1已领取）

	//-----------------详细数据
	public text: string;		//正文

	public item: RewardData[];	//附件


	/**
	 * 详细数据处理
	 * @param bytes
	 */
	public parser(bytes: GameByteArray): void {

		this.disposeData(bytes);

		this.item = [];

		this.text = bytes.readString();

		let len: number = bytes.readInt();

		for (let i = 0; i < len; i++) {
			let reward = new RewardData;
			reward.parser(bytes);
			this.item.push(reward);
		}
	}

	/**
	 * 简单数据处理
	 * @param bytes
	 */
	public disposeData(bytes: GameByteArray): void {

		this.handle = bytes.readInt();

		this.title = bytes.readString();

		this.times = bytes.readInt();

		this.type = bytes.readInt();

		this.receive = bytes.readInt();
	}

}
