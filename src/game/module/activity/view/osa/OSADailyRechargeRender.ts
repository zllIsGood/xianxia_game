/**
 * Created by hrz on 2017/9/5.
 */

class OSADailyRechargeRender extends BaseItemRender {
    private reward:eui.List;
    private info:eui.Label;
    private getBtn:eui.Button;

    constructor(){
        super();
        this.skinName = `OSADailyRechargeItem`;
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.init();
    }

    public init() {
        
        this.reward.itemRenderer = ItemBase;
        this.getBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
    }

    dataChanged(){
        super.dataChanged();
        let config = this.data as DailyRechargeConfig|LoopRechargeConfig;

        this.info.text = `累计充值${config.pay}元宝`;
        this.reward.dataProvider = new eui.ArrayCollection(config.awardList.concat());

        let data: RechargeData = Recharge.ins().getRechargeData(0);
        if (data.curDayPay >= config.pay) {
            let state = ((data.isAwards >> config.index) & 1);
            if (state) {
                this.getBtn.label = `已领取`;
                this.getBtn.enabled = false;
            } else {
                this.getBtn.label = `领取`;
                this.getBtn.enabled = true;
            }
        } else {
            this.getBtn.label = `未完成`;
            this.getBtn.enabled = false;
        }
    }

    private onTap(e:egret.TouchEvent) {
        Recharge.ins().getDayReward(this.data.index);
    }
}