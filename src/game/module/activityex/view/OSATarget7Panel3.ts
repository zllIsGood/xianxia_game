/** 合服限时兑换活动 */
class OSATarget7Panel3 extends BaseView{
	
	public activityID: number;
	private _activityData: ActivityType7Data;

	public title:eui.Image;
	public infoBg:eui.Group;
	public actTime0:eui.Label;
	public actInfo0:eui.Label;
	public num:eui.Label;
	public content:eui.List;

	private _dataCollect:ArrayCollection;

	private _leftTime:number = 0;

	/** 消耗道具ID */
	private _matrailId:number = 0;

	/** 上次道具数量 */
	private _oldCount:number = 0;

	public constructor() {
		super();
		this.skinName = "limitChangeSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
		
	}

	public init() {
		this.actInfo0.text = GlobalConfig.ActivityConfig[this.activityID].desc;
		this.content.itemRenderer = limitChangeItemRender;

	}

	public open(...args:any[]):void
	{
		this.observe(UserBag.ins().postItemAdd, this.updateMaterial);
		this.observe(UserBag.ins().postItemChange, this.updateMaterial);
		this.updateData();
	}

	public close():void
	{
		this.removeObserve();
		TimerManager.ins().remove(this.setTime, this);
		this._leftTime = 0;
		this._oldCount = 0;
	}

	public updateData():void
	{
		this._activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType7Data;
		this.checkTime();
		this.updateList();
	}

	private updateMaterial():void
	{
		let itemData: ItemData = UserBag.ins().getBagItemById(this._matrailId);
		let mCount:number = itemData ? itemData.count : 0;
		if (mCount != this._oldCount)
			this.updateList();
	}

	private updateList():void
	{
		var configs = GlobalConfig.ActivityType7Config[this.activityID]; 
		this._matrailId = configs[1].itemId;
		let itemData: ItemData = UserBag.ins().getBagItemById(this._matrailId);
		let mCount:number = itemData ? itemData.count : 0;
		this.num.text = mCount + "";
		this._oldCount = mCount;

		var config:ActivityType7Config;
		var datas:Array<any> = [];
		var i:number = 0;
		var state:number = 0;
        let pCount:number = 0, sCount:number = 0;
		for (var k in configs)
		{
			config =  configs[k];
			if (config.scount == undefined || config.scount == 0)
				sCount = Number.MAX_VALUE;
			else
				sCount = config.scount - this._activityData.worldRewardsSum[i + 1];
			
			if (config.count == undefined || config.count == 0)
				pCount = Number.MAX_VALUE;
			else
				pCount = config.count - this._activityData.personalRewardsSum[i + 1];

			state = sCount && pCount && mCount >= config.itemCount ? 1 : 0;

            datas[i] = [this.activityID, config, state, pCount, sCount];
			i++;
		}
        
        datas.sort(this.sort);

		if (!this._dataCollect)
		{
			this._dataCollect = new ArrayCollection();
			this.content.dataProvider = this._dataCollect;
		}
				
		this._dataCollect.source = datas;
	}

	 private sort(a: any, b: any): number {
       
	    if (a[2] > b[2])
			return -1;

		if (a[2] < b[2])
			return 1;
		
		if (a[1].index < b[1].index)
			return -1;

        return 1;
	}

	private checkTime():void
	{
		TimerManager.ins().remove(this.setTime, this);
		this._leftTime = 0;
		if (Math.floor((DateUtils.formatMiniDateTime(this._activityData.startTime) - GameServer.serverTime) / 1000) >= 0)
			this.actTime0.text = "活动未开启";
		else
		{
			this._leftTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
			if (this._leftTime <= 0)
				this.actTime0.text = "活动已结束";
			else
			{
				this.actTime0.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 3)
				TimerManager.ins().doTimer(1000, 0, this.setTime, this);
			}
		}
	}

	private setTime():void
	{
		this._leftTime--;
		this.actTime0.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 3)
		if (this._leftTime <= 0)
			this.checkTime();
	}
}