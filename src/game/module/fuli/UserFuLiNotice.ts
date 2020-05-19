class UserFuLiNotice extends BaseSystem {
	public awardState = false;

	public constructor() {
		super();

		this.sysId = PackageID.FuLiNotice;
		this.regNetMsg(1, this.doNoticeInfo);//有新的公告内容
		this.regNetMsg(2, this.doGetRewardBack);//领取奖励返回
	}

	public static ins(): UserFuLiNotice {
		return super.ins() as UserFuLiNotice;
	}

	public doNoticeInfo(bytes: GameByteArray){
		this.awardState = true;
		this.postUpdateShow();
	}

	public doGetRewardBack(bytes: GameByteArray):void{
		this.awardState = false;
		
		let getState = bytes.readShort();
		this.postNoticeInfo(getState);
	}

	public getAward():void{
		this.awardState = false;
		this.sendBaseProto(1);
	}

	public postUpdateShow():void{

	}

	public postNoticeInfo(state:number):number{
		return state;
	}

}

namespace GameSystem {
	export let userFuLiNotice = UserFuLiNotice.ins.bind(UserFuLiNotice);
}