/**
 * Created by hrz on 2017/9/5.
 *
 * 每日累计充值
 */

class OSATarget0Panel3 extends BaseView {
    private dailyReward:eui.List;
    private data:eui.Scroller;
    private actTime:eui.Label;
    private actDesc:eui.Label;
    private record:eui.Label;
    public activityID:number;
    private _time:number = 0;
    constructor(){
        super();
        this.skinName = `OSADailyRechargeSkin`;
    }

    protected childrenCreated(){
        super.childrenCreated();
        this.init()
    }

    public init() {
        this.dailyReward.itemRenderer = OSADailyRechargeRender;
    }

    open() {
        this.observe(Recharge.ins().postUpdateRechargeEx, this.updateList);
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.initList();
    }

    updateData() {
        this.updateList();
    }

    private updateList(){
        let dataPro = this.dailyReward.dataProvider as eui.ArrayCollection;
        let source = dataPro.source;
        source.sort(this.sort);
        dataPro.refresh();

        this.updateTime();
        this.updateValue();
    }

    private updateTime(){
        let date: Date = new Date(GameServer.serverTime);
        date.setHours(23,59,59,0);

        this._time = Math.floor((date.getTime()-GameServer.serverTime)/1000);
        if (this._time < 0) this._time = 0;

        this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
        let data: ActivityBtnConfig = Activity.ins().getbtnInfo(this.activityID);
        this.actDesc.text = data.acDesc;
    }

    private initList(){
        let config: any = Recharge.ins().getCurRechargeConfig();

        let arr = [];
        for (let k in config) {
            arr.push(config[k]);
        }

        arr.sort(this.sort);

        this.dailyReward.dataProvider = new eui.ArrayCollection(arr);

        this.updateTime();
        this.updateValue();
    }

    private updateValue(){
        let data: RechargeData = Recharge.ins().getRechargeData(0);
        this.record.text = `已充值${data.curDayPay}元宝`;
    }

    private sort(a,b) {
        let data: RechargeData = Recharge.ins().getRechargeData(0);
        let aState = ((data.isAwards >> a.index) & 1);
        let bState = ((data.isAwards >> b.index) & 1);
        if (aState && !bState) {
            return 1;
        } else if (!aState && bState) {
            return -1;
        } else {
            return a.pay < b.pay ? -1 : 1;
        }
    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
        }
    }

    close() {
        this.removeObserve();
        TimerManager.ins().removeAll(this);
    }
}