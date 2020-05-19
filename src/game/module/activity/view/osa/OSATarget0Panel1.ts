/**
 * //开服活动-天盟争霸
 */
class OSATarget0Panel1 extends BaseView {

	private go:eui.Button;
	private over:eui.Label;
	private actTime:eui.Label;
	public activityID:number;
	//reward1-4
	private effs:MovieClip[];

	private rewards:{type:number,id:number,count:number}[];
	constructor(...param: any[]) {
		super();
		this.skinName = "OSAComp";
		this.effs = [];
		this.rewards = [
			{type:1,id:900007,count:1},
			{type:1,id:900008,count:1},
			{type:1,id:900009,count:1},
			{type:0,id:2,count:2000}
		];
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.updateData()
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.go, this.onTap);
		this.updateData();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.go, this.onTap);
		this.removeObserve();
		for( let i=0;i<this.effs.length;i++ ){
			if( this.effs[i] )
				DisplayUtils.removeFromParent(this.effs[i]);
		}
		this.effs = [];
	}


	private onTap(e: egret.TouchEvent): void {
		let index: number;
		switch (e.currentTarget) {
			case this.go:
				if( Guild.ins().guildID != 0 ){
					ViewManager.ins().close(ActivityWin);
					GuildWar.ins().requestWinGuildInfo();
					ViewManager.ins().close(GuildMap);
					ViewManager.ins().open(GuildWarMainWin);
				}else{
					UserTips.ins().showTips("还没加入仙盟");
				}
				break;

		}


	}
	private getTime(activityData: ActivityType0Data):string{
		let openTime:{day:number,hours:number,min:number} = GlobalConfig.GuildBattleConst.openServer;
		let date = new Date(activityData.startTime - DateUtils.SECOND_PER_DAY*1000);
		date.setDate(date.getDate()+openTime.day);
		date.setHours(openTime.hours,openTime.min||0,0,0);

		let head  = (date.getMonth()+1)+"月"+date.getDate()+"日"+openTime.hours+":"+openTime.min+"-";
		let end   = openTime.hours+":"+(openTime.min+GlobalConfig.GuildBattleConst.continueTime/60);
		let week  = date.getDay();
		let weeklist = ["(周日)","(周一)","(周二)","(周三)","(周四)","(周五)","(周六)"];
		return head + end + weeklist[Number(week)];
	}
	public updateData(index: number = 1) {
		let activityData: ActivityType0Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType0Data;
		let beganTime = Math.floor(activityData.startTime/1000 - GameServer.serverTime / 1000);
		let endedTime = Math.floor(activityData.endTime/1000 - GameServer.serverTime / 1000);

		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
			this.over.visible = false;
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
			this.over.visible = true;
		} else {
			this.over.visible = false;
			// this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
			this.actTime.text = this.getTime(activityData);
		}
		this.go.visible = !this.over.visible;

		// this.go.visible = true;
		// this.over.visible = false;

		//前三个用控件
		for( let i=1;i<=4;i++ ){
			this["reward"+i].data = this.rewards[i-1];
		}

		for( let i = 1;i <= 3;i++ ){
			let effname = "chuanqizbeff";
			if( !this.effs[i-1] || !this.effs[i-1].parent ){
				let mc = new MovieClip();
				//let p:egret.Point = this["reward"+i].localToGlobal();
				//this["reward"].globalToLocal(p.x, p.y, p);
				mc.x = this["reward"+i].width/2;
				mc.y = this["reward"+i].height/2;
				mc.y -= 10;
				mc.playFile(RES_DIR_EFF + effname, -1);
				this["reward"+i].addChild(mc);

				this.effs.push(mc);
			}
		}



	}
}