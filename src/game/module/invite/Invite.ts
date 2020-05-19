class Invite extends BaseSystem {

	public model: DailyInviteModel = new DailyInviteModel();
	public infoRecordModel: DailyInviteInfoRecordModel = new DailyInviteInfoRecordModel();

	public isFirstLoad: Boolean = true;

	public wanbaAddDeskReward: number = 0;
	public wanbaAddDeskState: number = 0; // 0:未点击，1:已点击

	public constructor() {
		super();

		this.sysId = PackageID.CollectGiftInvite;
		this.regNetMsg(1, this.collectGift);
		this.regNetMsg(2, this.inviteInfo);
		this.regNetMsg(3, this.dailyInvite);
		this.regNetMsg(4, this.inviteSuccess);
		this.regNetMsg(5, this.appendInvieteSuccess);
		this.regNetMsg(8, this.postAddDeskGift);
		this.regNetMsg(9, this.addDeskGiftState);
		
	}

	public static ins(): Invite {
		return super.ins() as Invite;
	}

	/** 请求领取收藏礼包 */
	public sendCollectGift(): void {
		let bytes: GameByteArray = this.getBytes(1);
		this.sendToServer(bytes);
	}

	/** 请求分享奖励 */
	public sendInviteAwake(): void {
		let bytes: GameByteArray = this.getBytes(2);
		this.sendToServer(bytes);
	}

	/**
	 * 领取邀请奖励
	 * @param type 领取奖励类型, 1:每日邀请, 2: 累计邀请
	 * @param index 奖励序号
	 */
	public sendDailyInviteAwake(type: number, index: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(type);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/** 邀请成功记录 */
	public sendInviteSuccess(): void {
		let bytes: GameByteArray = this.getBytes(4);
		this.sendToServer(bytes);
	}

	/** 邀请上报 */
	public sendInviteRepor(actorId: string): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeString(actorId);
		this.sendToServer(bytes);
	}

	public sendDailyInviteSuccess(): void {
		let bytes: GameByteArray = this.getBytes(7);
		this.sendToServer(bytes);
	}

	/** 请求领取收藏礼包 */
	public sendAddDeskGift(): void {
		let bytes: GameByteArray = this.getBytes(8);
		this.sendToServer(bytes);
	}


	private collectGift(bytes: GameByteArray): void {
		// 0领取成功 1重复领取 2背包已满 
		let result: number = bytes.readByte();
		let str: string;
		switch (result) {
			case 0:
                str = "|C:0x35e62d&T:领取成功|";
				break;
			case 1:
				str = "|C:0xf3311e&T:重复领取|";
				break;
			case 2:
				str = "|C:0xf3311e&T:背包已满|";
				break;
			case 3:
				str = "|C:0xf3311e&T:已使用过同类型|";
				break;
		}
		UserTips.ins().showTips(str);
	}

	public postAddDeskGift(bytes: GameByteArray): void {
		// 0领取成功 1重复领取 2背包已满 
		let result: number = bytes.readByte();
		let str: string;
		switch (result) {
			case 0:
                str = "|C:0x35e62d&T:领取成功|";
                this.wanbaAddDeskReward = 1;
				this.postDeskGiftState();
				break;
			case 1:
				str = "|C:0xf3311e&T:已领取过奖励|";
				break;
			case 2:
				str = "|C:0xf3311e&T:背包已满|";
				break;
			case 3:
				str = "|C:0xf3311e&T:已使用过同类型|";
				break;
		}
		UserTips.ins().showTips(str);
	}

	public addDeskGiftState(bytes: GameByteArray): void {
		this.wanbaAddDeskReward = bytes.readByte();
		this.postDeskGiftState();
	}

	public postDeskGiftState() {}

	private inviteInfo(bytes: GameByteArray): void {
		
	}

	private dailyInvite(bytes: GameByteArray): void {
		this.model.parserData(bytes);
		// console.log('=============================')
		// let keys = Object.keys(this.model);
		// for(let i in keys) {
		// 	let key = keys[i];
		// 	console.log(`${key}: ${this.model[key]}`);
		// }
		// console.log('=============================')
		this.postDailyInviteData();
		
		/** 更新红点提示 */
		this.postInvite();

		/** 目前邀请功能只在小游戏上有, 所以先进行平台区分 */
		if (LocationProperty.isWeChatMode && this.model.isReport == 0) {
			/**
			 * 小游戏的分享, 第一次进入时会将数据保存到window里的WxgameQuery
			 */
			if (window['WxgameQuery']) {
				let query = window['WxgameQuery'];
				let account: string = query['act'];
				this.sendInviteRepor(account);
			} else {
				this.sendInviteRepor('0');
			}
		}
	}

	private inviteSuccess(bytes: GameByteArray): void {
		this.infoRecordModel.parserData(bytes);
	}

	private appendInvieteSuccess(bytes: GameByteArray): void {
		
		this.infoRecordModel.updateInfo(bytes);
		this.postUpdateInviteData();
	}

	public postUpdateInviteData(): void {

	}

	public postDailyInviteData() {
		
	}

	public postCollectGift() {
	
	}

	public postInvite() {
		
	}

	public getInviteInfo(): InviteadConfig {
		let inviteadConfig = GlobalConfig.InviteadConfig;
        let allKeys = Object.keys(inviteadConfig);
        let len = allKeys.length;
        let random = Math.floor(Math.random() * len);
        return inviteadConfig[allKeys[random]];
	}

	/**
	 * getCheckAwake
	 */
	public getCheckAwake() {
		
	}
}

namespace GameSystem {
	export let invite = Invite.ins.bind(Invite);
}