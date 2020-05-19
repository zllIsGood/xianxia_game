/**
 * 活动数据
 */
class PfActivity extends BaseSystem {

	/** 微信已分享次数 */
	public wxInviteCount: number = 0;
	/** 下次可分享的时间点 */
	public inviteTime: number;

	/** 是否领取过认证奖励  
	 * 0 未领取
	 * 1 未领取奖励
	*/
	public getRenzhengReward: number = 0;

	public focusState: number = 0;//-1 不显示关注 0 未关注 1 已关注
	public shareState: number = -1;//-1 不显示 其他显示
	public renzhengState: number = -1;//-1 不显示 其他显示

	public wanbaGiftType: number = 0; //1 新手礼包 2 每日礼包 3 节日礼包

	public constructor() {
		super();
		this.sysId = PackageID.pfActivity;
		this.regNetMsg(1, this.doWanBaGift);
		this.regNetMsg(4, this.doWeiXinInviteGift);
		this.regNetMsg(5, this.doRenZhengGift);
	}

	public static ins(): PfActivity {
		return super.ins() as PfActivity;
	}

	protected initLogin() {
		this.sendWanBaGift();
		window["isFocus"] && this.postGuanZhu(window["isFocus"]()); // 关注
		if (window["isVerify"]) { // 实名认证
			LocationProperty.verify = window["isVerify"]()==undefined? -1 : window["isVerify"]();
			this.postRenZheng(LocationProperty.verify);
		}
	}

	public postGuanZhu(code: number) {
		this.focusState = code;
		// console.log(this.focusState);
		if (this.focusState == 1) this.sendGuanZhuGift();
	}

	public postShare(code: number) {
		this.shareState = code;
	}

	public postRenZheng(code: number) {
		this.renzhengState = code;

	}

	/**
	 * 处理玩吧礼包
	 * 33-1
	 * @param bytes
	 */
	private doWanBaGift(bytes: GameByteArray): void {
		//param[0]星期几
		//param[1]是否领取成功
		let day = bytes.readByte();
		let state = bytes.readBoolean();
		let typeStr = bytes.readString();
		ViewManager.ins().open(WanBaGiftWin, day, state, this.wanbaGiftType, typeStr);
	}

	
	// 1 新手礼包
	// 2 每日礼包
	// 3 节日礼包
	public static WANBG_GIFT_KEY = {
		"10001":1,
		"10002":2,
		"10003":3,
	}
	/**
	 * 发送领取玩吧礼包
	 * 33-1
	 */
	public sendWanBaGift(): void {
		if (!LocationProperty.wabgift)
			return;
		// this.sendBaseProto(1);

		this.wanbaGiftType = PfActivity.WANBG_GIFT_KEY[LocationProperty.wabgift];
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeInt(this.wanbaGiftType);
		this.sendToServer(bytes);
	}

	//}

	/**
	 * 请求领取关注奖励
	 * 33-2
	 */
	public sendGuanZhuGift(): void {
		this.sendBaseProto(2);
	}

	/**
	 * 领取分享奖励
	 * 33-4
	 */
	public sendWeiXinInviteGift(): void {
		WarnWin.show("邀请成功！", null, this);
		this.sendBaseProto(4);
	}

	/**
	 * 分享状态信息
	 * 33-4
	 */
	private doWeiXinInviteGift(bytes: GameByteArray): void {
		PfActivity.ins().wxInviteCount = bytes.readInt();
		PfActivity.ins().inviteTime = bytes.readInt();
		this.postInviteInfoUpdate();
	}

	/**
	 * 认证领取状态信息
	 * 33-5
	 */
	private doRenZhengGift(bytes: GameByteArray): void {
		PfActivity.ins().getRenzhengReward = bytes.readInt();
	}


	/**
	 * 领取认证奖励
	 * 33-5
	 */
	public sendRenzhengGift(): void {
		if (LocationProperty.verify == 0 || this.getRenzhengReward == 1)
			return;
		this.sendBaseProto(5);
		this.postRenZheng(-1);
	}


	/**派发分享状态信息 */
	public postInviteInfoUpdate(): void {

	}

	public copyMsgToBoard(msg: string) {
		if (document && document.createElement) {
			let input = document.createElement("input");
			input.value = msg;
			document.body.appendChild(input);
			input.select();
			input.setSelectionRange(0, input.value.length);
			document.execCommand("Copy");
			document.body.removeChild(input);
			return true;
		}
		return false;
	}
}

namespace GameSystem {
	export let  pfactivity = PfActivity.ins.bind(PfActivity);
}