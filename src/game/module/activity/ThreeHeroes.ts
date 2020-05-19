class ThreeHeroes extends BaseSystem {

	/** 未激活 */
	public static NotActive:number = 0;

	/** 已激活 */
	public static Active:number = 1;

	/** 可领取 */
	public static CanGet:number = 2;

	/** 已领取 */
	public static Geted:number = 3;

	/** 领奖状态 */
	public awardState:number;

	/**  */

	/** 登陆天数 */
	public loginDays:number;

	/** 3天后是否显示图标 */
	public showIcon3DaysLater:boolean;

	public constructor() {
		super();

		this.sysId = PackageID.ThreeHeroes;
		this.regNetMsg(1, this.doGotAward);
		this.regNetMsg(2, this.doAwardInfo);			
	}

	public static ins():ThreeHeroes
	{
		return super.ins() as ThreeHeroes;
	}

	/**
	 * 是否领取成功
	 * 59-1
	 * @param bytes
	 */
	private doGotAward(bytes:GameByteArray):void
	{
		if (bytes.readByte() > 0)
		{
			this.awardState = ThreeHeroes.Geted;
			this.postInfoChange();
		}
	}

	/**
	 * 奖励信息
	 * 59-2
	 * @param bytes
	 */
	private doAwardInfo(bytes:GameByteArray):void
	{
		let state:boolean = bytes.readBoolean();
		this.loginDays = bytes.readShort();
		this.showIcon3DaysLater = bytes.readBoolean();
		ActivityDataFactory.createEx();

		let data: ActivityType0Data = Activity.ins().activityData[ActivityBtnType.THREE_HEROES];
		if (data)
		{
			let beganTime = Math.floor((data.startTime - GameServer.serverTime) / 1000);
			let endedTime = Math.floor((data.endTime - GameServer.serverTime) / 1000);
			if (beganTime < 0 && endedTime > 0) 
			{
				if (UserVip.ins().lv >= GlobalConfig.LoginActivateConfig.vipLevel)
					this.awardState = ThreeHeroes.Active;
				else
					this.awardState = ThreeHeroes.NotActive;

				MessageCenter.addListener(UserVip.ins().postUpdateVipData, this.updateStateByVip, this);
				MessageCenter.addListener(UserVip.ins().postUpdataExp, this.updateStateByVip, this);
			}
			else
			{
				if (this.showIcon3DaysLater)
				{
					if (this.loginDays >= GlobalConfig.LoginActivateConfig.loginDays)
						this.awardState = ThreeHeroes.CanGet;
					else
						this.awardState = ThreeHeroes.Active;
				}
				else
					this.awardState = state ? ThreeHeroes.Geted  : ThreeHeroes.NotActive;

				MessageCenter.ins().removeAll(this);
			}	
		}

		Activity.ins().postActivityIsGetAwards();
		this.postInfoChange();
	}

	private updateStateByVip():void
	{
		let data: ActivityType0Data = Activity.ins().activityData[ActivityBtnType.THREE_HEROES];
		if (data)
		{
			let beganTime = Math.floor((data.startTime - GameServer.serverTime) / 1000);
			let endedTime = Math.floor((data.endTime - GameServer.serverTime) / 1000);
			if (beganTime < 0 && endedTime > 0) 
			{
				if (UserVip.ins().lv >= GlobalConfig.LoginActivateConfig.vipLevel)
					this.awardState = ThreeHeroes.Active;
				else
					this.awardState = ThreeHeroes.NotActive;
			}			
		}

		this.postInfoChange();
	}

	/**
	 * 领取活动奖励
	 * 59-1
	 */
	public sendReward(): void 
	{
		let bytes: GameByteArray = this.getBytes(1);
		this.sendToServer(bytes);
	}

	/**派发活动信息变更 */
	public postInfoChange(): void {

	}
}


namespace GameSystem {
	export let  threeHeros = ThreeHeroes.ins.bind(ThreeHeroes);
}