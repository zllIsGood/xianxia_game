/**
 * Created by Administrator on 2017/10/24.
 */
class FanLinPanel extends BaseView
{
    public title:eui.Image;
    public infoBg:eui.Group;
    public actTime1:eui.Label;
    public actDesc:eui.Label;
    public pay0:eui.Button;
    public pay1:eui.Button;
    public paytxt0:eui.Label;
    public paytxt1:eui.Label;
    public redPoint0:eui.Image;
    public redPoint1:eui.Image;


    public activityID:number;

    private _time:number = 0;

    private _stateList:Array<number>;

    constructor()
    {
        super();
        // this.skinName = "DEFanliSkin";
        this._stateList = [];
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.init();
    }

    public init() {
        this.actDesc.text = GlobalConfig.ActivityConfig[this.activityID].desc;
    }

    public open(...arges:any[]):void
    {
        this.addTouchEvent(this.pay0, this.onPay0);
        this.addTouchEvent(this.pay1, this.onPay1);
        this.observe(Activity.ins().postActivityIsGetAwards, this.update);
        TimerManager.ins().doTimer(1000, 0, this.setTime, this);
        this.update();
    }

    private update():void
    {
        var data:ActivityType3Data = Activity.ins().getDoubleElevenDataByID(this.activityID) as ActivityType3Data;
		var configs = GlobalConfig.ActivityType3Config[this.activityID]; 
        var config:ActivityType3Config;
        var state:number = 0;
        var btns:Array<eui.Button> = [this.pay0, this.pay1];
        var btn:eui.Button;
        var i:number = 0;

        for (var k in configs)
		{
			config =  configs[k];
			state = ((data.recrod >> config.index) & 1) ? 2 : (data.chongzhiNum >= config.val ? 1 : 0);
			btn = btns[i];
            if (state == 2)
                btn.label = "已领取";
            else if (state == 1)
                btn.label = "领取奖励";
            else
                btn.label = "充值¥" + (config.val / 100); 

            btn.enabled = state != 2;
            this._stateList[i] = state;
            this["redPoint" + i].visible = state == 1;
            i++;
		}

        this._time = data.getLeftTime();
        this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);
    }

    public close():void
    {
        this.removeObserve();
        this.removeTouchEvent(this.pay0, this.onPay0);
        this.removeTouchEvent(this.pay1, this.onPay1);
        TimerManager.ins().removeAll(this);
    }

    private onPay0(e:TouchEvent):void
    {
        this.onPay(0);
    }

    private onPay1(e:TouchEvent):void
    {
        this.onPay(1);
    }

    private onPay(index:number):void
    {
        var state:number = this._stateList[index];
        if (state == 0)
        {
            let rdata: RechargeData = Recharge.ins().getRechargeData(0);
			if (!rdata || rdata.num != 2) {
				ViewManager.ins().open(Recharge1Win);
			} else {
				ViewManager.ins().open(ChargeFirstWin);
			}
        }
        else if (state == 1)
             Activity.ins().sendReward(this.activityID, index + 1);
    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);
        }
    }
}