
/**
 *
 * 合服boss击杀
 *
 */
class OSATarget7Panel1 extends BaseView {
	
	public activityID: number;

	private actTime:eui.Label;
	private actDesc:eui.Label;

	private cost:eui.Label;
	private boss:eui.Button;
	private costbtn:eui.Button;

	private activityData: ActivityType7Data;
	private bossGroup:eui.Group;
	// private bossMc:MovieClip;
	private redPoint:eui.Image;
	private title:eui.Image;
	constructor() {
		super();

		this.skinName = "hefuHalftimeBoss";

		// this.bossMc = new MovieClip;
		// this.bossGroup.addChild(this.bossMc);
		// this.bossMc.x = this.bossGroup.x;
		// this.bossMc.y = this.bossGroup.y;

	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();

	}

	public init() {
		this.updateData();

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.boss, this.onTap);
		this.addTouchEvent(this.costbtn,this.onTap);
		this.observe(Activity.ins().postRewardResult,this.GetCallBack);
		this.observe(Activity.ins().postChangePage, this.GetCallBack);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.boss, this.onTap);
		this.removeTouchEvent(this.costbtn, this.onTap);
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}
	public onClick(e: egret.TouchEvent){

	}

	public onTap(e: egret.TouchEvent){
		switch (e.currentTarget) {
			case this.boss:
				ViewManager.ins().open(BossWin,1);
				break;
			case this.costbtn:
				if( this.activityData )
					ViewManager.ins().open(BossScoreExchangeWin,this.activityID);
				break;
		}
	}
	private GetCallBack(activityID:number){
		this.updateData();
	}

	public updateData() {
		let cfg:ActivityType7Config = GlobalConfig.ActivityType7Config[this.activityID][1];
		if( cfg.showType == ActivityType7Data.TYPE_RING )
			this.currentState = 'lieyan';
		else
			this.currentState = 'hefu';

		let btncfg:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		if( btncfg )
			this.title.source = btncfg.title;
		this.activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType7Data;

		this.setTime();
		this.actDesc.text = GlobalConfig.ActivityConfig[this.activityID].desc;
		let actdata:ActivityType7Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType7Data;
		this.cost.text = `积分:${actdata.bossScore}`;

		// this.bossMc.playFile(RES_DIR_MONSTER + `monster${10129}_3s`, -1);

		this.redPoint.visible = Activity.ins().getType7RedPoint(this.activityID);
	}

	private setTime(){
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
	}
}