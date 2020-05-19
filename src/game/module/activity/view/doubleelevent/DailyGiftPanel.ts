/**
 * Created by Administrator on 2017/10/24.
 */
class DailyGiftPanel extends BaseView
{
    public title:eui.Image;
    public infoBg:eui.Group;
    public actTime1:eui.Label;
    public actDesc:eui.Label;
    public gift:eui.List;

    public activityID:number;

    private _time:number = 0;

    public constructor() {
		super();
		// this.skinName = "DEDailyGiftSkin";
	}

   	protected childrenCreated():void
    {
        super.childrenCreated();
        this.init();
    }

    public init() {
        this.gift.itemRenderer = DailyGiftItemRender;
        this.actDesc.text = GlobalConfig.ActivityConfig[this.activityID].desc;
    }

    public open(...args:any[]):void
    {
        this.observe(Activity.ins().postActivityIsGetAwards, this.update);
        this.observe(UserVip.ins().postUpdateVipData, this.update);
        this.observe(UserVip.ins().postUpdataExp, this.update);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);

        this.update();
    }

    private update():void
    {
        var data:ActivityType2Data = Activity.ins().getDoubleElevenDataByID(this.activityID) as ActivityType2Data;
		var configs = GlobalConfig.ActivityType2Config[this.activityID]; 
		var config:ActivityType2Config;
		var datas:Array<any> = [];
		var i:number = 0;
		var state:number = 0;
        var leftTimes:number = 0;
		for (var k in configs)
		{
            //&& Actor.yb >= config.price && data.sumRMB >= config.needRecharge
			config =  configs[k];
            state = data.buyData[i + 1] >= config.count ? 2 : 1;
            leftTimes = config.count - data.buyData[i + 1];
            if (leftTimes < 0)
                leftTimes = 0;

            datas[i] = [config, state, leftTimes, this.activityID, data.sumRMB];
			i++;
		}
        
        datas.sort(this.sort);
		this.gift.dataProvider = new eui.ArrayCollection(datas);	

        this._time = data.getLeftTime();
        this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);
    }

     private sort(a: any, b: any): number {
        if (a[1] == 1 && b[1] != 1)
            return -1;
        
        if (a[1] == 2 && b[1] != 2)
            return 1;
        
        if (a[0].index < b[0].index)
            return -1;
        
        if (a[0].index > b[0].index)
            return 1;

        return 0;
	}


    public close():void
    {
        this.removeObserve();
		TimerManager.ins().removeAll(this);

    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5,4);
        }
    }
}