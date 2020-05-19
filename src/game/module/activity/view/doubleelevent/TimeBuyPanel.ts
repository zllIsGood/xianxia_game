/**
 * Created by Administrator on 2017/10/24.
 */
class TimeBuyPanel extends BaseView
{
    public title:eui.Image;
    public infoBg:eui.Group;
    public actTime1:eui.Label;
    public actDesc:eui.Label;
    public gift:eui.List;
    public timeItem0:TimeBuyTab;
    public timeItem1:TimeBuyTab;
    public timeItem2:TimeBuyTab;
    public timeItem3:TimeBuyTab;


    public activityIDs:Array<number>;

     private _time:number = 0;

     private _selectIndex:number = 0;

     private _arrayCollect:eui.ArrayCollection;

     private _openLeftTime:number = 0;

    constructor()
    {
        super();
        // this.skinName = "DETimeBuySkin";
        this._arrayCollect = new eui.ArrayCollection();
    }

    public childrenCreated():void
    {
        super.childrenCreated();
        this.init();
    }

    public init() {
        this.gift.itemRenderer = TimeBuyItemRender;
        this.gift.dataProvider = this._arrayCollect;
         this.actDesc.text = GlobalConfig.ActivityConfig[this.activityIDs[0]].desc;
    }

    public open(...arges:any[]):void
    {
        this.observe(Activity.ins().postActivityIsGetAwards, this.update);
        this.addTouchEvent(this, this.onTop);
        TimerManager.ins().doTimer(1000, 0, this.setTime, this);
        TimerManager.ins().doTimer(30000, 0, this.getServerTimes, this);
        this.update();
        this.getServerTimes();
    }

    private getServerTimes():void
    {
        var len:number = this.activityIDs.length;
        for (var i:number = 0; i < len; i++)
         Activity.ins().sendChangePage(this.activityIDs[i]);
    }

    private update():void
    {
         var len:number = this.activityIDs.length;
         var data:ActivityType2Data;    
		 var config:ActivityType2Config;
         var leftTime:number = 0; 
         this._openLeftTime = 0;

         for (var i:number = 0; i < len; i++)
         {
            config = GlobalConfig.ActivityType2Config[this.activityIDs[i]][1]; 
           data = Activity.ins().getDoubleElevenDataByID(this.activityIDs[i]) as ActivityType2Data;

            this["timeItem" + i].setData(config, data ? data.isSpecialOpen() : false);
            this["timeItem" + i].setSelected(false);
            this["timeItem" + i].setRedPoint(data && data.isSpecialOpen() && data.canReward());
            this["timeItem" + i].name = i;

            leftTime = data ? data.getSpecialOpenLeftTime() : 0;
            if (leftTime > 0  && this._openLeftTime == 0)
                this._openLeftTime = leftTime;
            
            if (this._openLeftTime > 0 && leftTime > 0 && leftTime < this._openLeftTime)
                this._openLeftTime = leftTime;
         }

        this._time = data ? data.getLeftTime() : 0;
        this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);

        this.updateSelected();
    }

    private updateSelected():void
    { 
        this["timeItem" + this._selectIndex].setSelected(true);

		var configs = GlobalConfig.ActivityType2Config[this.activityIDs[this._selectIndex]]; 
         var data:ActivityType2Data = Activity.ins().getDoubleElevenDataByID(this.activityIDs[this._selectIndex]) as ActivityType2Data;
		var config:ActivityType2Config;
		var datas:Array<any> = [];
		var i:number = 0;
		var state:number = 0;
        var lv:number = UserVip.ins().lv;
        var leftTimes:number = 0;
        var fake:number = 0;
        var scount:number = 0;
		for (var k in configs)
		{
			config =  configs[k];
            state = data ? (data.buyData[i + 1] >= config.count ? 2 : (data.isSpecialOpen() && data.serverBuyData[i + 1] < config.scount ? 1 : 0)) : 0;
            leftTimes = data ? config.count - data.buyData[i + 1] : 0;
            if (leftTimes < 0)
                leftTimes = 0;

            scount = data ? config.scount - data.serverBuyData[i + 1] : 0;
            //假库存当前假库存 = MAX( MIN(（当前真库存 / 真库存上限）* 假库存上限  ， （假库存上限-触发次数）） ,0 )
            fake = data ? Math.floor(Math.max(Math.min(scount / config.scount * config.shamScount, config.shamScount - data.getSpecialStrikeTimes()), 0)) : 0;
            //当真库存<=5个，而假库存>5个时，直接将假库存设为5个。 当真库存=0时，假库存直接设为0
            if (scount <= 5 && fake > 5)
                fake = 5;
            
            if (scount == 0)
                fake = 0;

            datas[i] = [config, state, leftTimes, this.activityIDs[this._selectIndex], scount + fake];
			i++;
		}

        datas.sort(this.sort);
        this._arrayCollect.source = datas;
    }

     private sort(a: any, b: any): number {
        if (a[1] == 1)
            return -1;
        
        if (b[1] == 1)
            return 1;
        
        if (a[0].index < b[0].index)
            return -1;
        
        if (a[0].index > b[0].index)
            return 1;

        return 0;
	}

    public close():void
    {
        TimerManager.ins().removeAll(this);
        this.removeTouchEvent(this, this.onTop);
        this.removeObserve();
    }

    private onTop(e:egret.TouchEvent):void
    {
        switch (e.target)
        {
            case this.timeItem0:
            case this.timeItem1:
            case this.timeItem2:
            case this.timeItem3:
                 this["timeItem" + this._selectIndex].setSelected(false);
                 this._selectIndex = Number(e.target.name);
                 this.updateSelected();
                break;

        }
    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5,4);
        }

        if (this._openLeftTime > 0)
        {
            this._openLeftTime--;
            if (this._openLeftTime == 0)
                this.update();
        }
    }


}