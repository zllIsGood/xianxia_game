/**
 * Created by hrz on 2017/9/4.
 */

class OSATargetDays42ItemRender extends BaseItemRender {
    private get0:eui.Button;
    private reward:ItemBase;
    private num:eui.BitmapLabel;
    private already:eui.Label;
    private rewardList:eui.List;
    constructor(){
        super();
        this.skinName = `OSAItem`;
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.init();
    }

    public init() {
	
        this.get0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap,this);
        this.rewardList.itemRenderer = ItemBase;
    }

    private onTap(e:egret.TouchEvent) {
        Recharge.ins().getRechargeTotalAward(this.data.id);
    }

    dataChanged() {
        super.dataChanged();
        let data = this.data as RechargeDaysAwardsConfig;
        this.num.text = data.id+"";
        // this.reward.data = data.awardList[0];
        this.rewardList.dataProvider = new eui.ArrayCollection(data.awardList);
        if (Recharge.ins().rechargeTotal.hasGetDays.indexOf(data.id)>=0) {
            this.get0.visible = false;
            this.already.visible = true;
        } else {
            this.get0.visible = true;
            this.already.visible = false;

            if (data.id <= Recharge.ins().rechargeTotal.totalDay) {
                this.get0.label = `领取`;
                this.get0.enabled = true;
            } else {
                this.get0.label = `未完成`;
                this.get0.enabled = false;
            }
        }
    }
}