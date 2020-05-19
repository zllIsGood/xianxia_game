class OSA3HeroesPanel extends BaseView{

	public bg:eui.Image;

	public infoBg:eui.Group;

	public actTime:eui.Label;

	public actInfo:eui.Label;

	public active:eui.Button;

	public redPoint:eui.Image;

	public state:eui.Label;

	public already:eui.Label;

	public activityID:number;

	public constructor(...param: any[]) {
		super();
		this.skinName = "OSA3Heroes";
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();


	}

	public init() {
		this.updateData();
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.active, this.onTap);
		this.observe(ThreeHeroes.ins().postInfoChange, this.updateData);
		this.updateData();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.active, this.onTap);
		this.removeObserve();
		
	}

	private onTap(e: egret.TouchEvent): void {
		if (e.currentTarget == this.active)
		{
			if (ThreeHeroes.ins().awardState == ThreeHeroes.NotActive)
				ViewManager.ins().open(VipWin, [4]);
			else if (ThreeHeroes.ins().awardState == ThreeHeroes.CanGet)
				ThreeHeroes.ins().sendReward();
			else if (ThreeHeroes.ins().awardState == ThreeHeroes.Active)
				UserTips.ins().showTips("再登陆" + (GlobalConfig.LoginActivateConfig.loginDays - ThreeHeroes.ins().loginDays) + "天可领取20000元宝");
		}
	}
	
	private getTime(activityData: ActivityType0Data):string
	{
		let openTime:{day:number,hours:number,min:number} = GlobalConfig.GuildBattleConst.openServer;
		let date = new Date(activityData.startTime);
		let head  = (date.getMonth()+1)+"月"+date.getDate()+"日-";
		date = new Date(activityData.endTime - DateUtils.SECOND_PER_DAY*1000);
		let end  = (date.getMonth()+1)+"月"+date.getDate()+"日" + "23:59";
		return head + end;
	}

	public updateData() {

		let activityData: ActivityType0Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType0Data;
		let beganTime = Math.floor(activityData.startTime/1000 - GameServer.serverTime / 1000);
		let endedTime = Math.floor(activityData.endTime/1000 - GameServer.serverTime / 1000);

		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this.actTime.text = this.getTime(activityData);
		}

		let state:number = ThreeHeroes.ins().awardState;
		this.active.enabled = state != ThreeHeroes.Geted;
		this.redPoint.visible = state == ThreeHeroes.CanGet;
		if (state == ThreeHeroes.NotActive) //未激活
		{
			this.active.label = "激活";
		}
		else if (state == ThreeHeroes.CanGet || state == ThreeHeroes.Active) //激活
		{
			this.active.label = "领取奖励";
		}
		else //已领取
		{
			this.active.label = "已领取";
		}	

		let config: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		this.actInfo.text = config.acDesc;
		this.state.text = state == ThreeHeroes.Active ? ("再登陆" + (GlobalConfig.LoginActivateConfig.loginDays - ThreeHeroes.ins().loginDays) + "天可领取20000元宝") : "";
	}
}