/**
 * 火焰戒指付费副本
 * Created by Peach.T on 2017/11/7.
 */
class OSATarget8Panel extends ActivityPanel {
    public title: eui.Group;
    public chanllage: eui.Button;
    public price: PriceIcon;
    public starNum:eui.BitmapLabel;
    public actTime:eui.Label;
    public rewardsCount:eui.Label;

    /**
     *奖励索引
     */
    private awardIndex: number;
    /**
     *挑战所需元宝
     */
    private needYB: number;

    public constructor() {
        super();
        this.skinName = `OSARingFbSkin`;
    }

    public close(...param: any[]): void {
        this.removeObserve();
    }

    public open(...param: any[]): void {
        this.observe(Activity.ins().postChangePage, this.updateView);
        this.addTouchEvent(this.chanllage, this.onChanllage);
        let actId = 0;
        for( let i in GlobalConfig.ActivityType8Config){
            let cfg:ActivityType8Config = GlobalConfig.ActivityType8Config[i][1];
            if( cfg.showType = ActivityType8Data.TYPE_RING ){//烈焰戒指活动id
                actId = cfg.Id;
                break;
            }
        }
        this.updateView();
    }

    private updateView():void{
        let data: ActivityType8Data = Activity.ins().activityData[this.activityID] as ActivityType8Data;
        let config:ActivityType8Config = GlobalConfig.ActivityType8Config[this.activityID][1];
        if( config.showType == ActivityType8Data.TYPE_RING ){
            let index = Activity.ins().getCurrentRingAwardIndex(data.record);
            let cfg = Activity.ins().getRingAward(index);
            if(cfg){
                this.currentState = 'normal';
                this.price.setPrice(cfg.ybCount);
                this.awardIndex = index;
                this.needYB = cfg.ybCount;
                let rewardsNum = cfg.rewardsNum;
                this.starNum.text = SpecialRing.ins().getCanUpgradeStars(rewardsNum).toString();
                this.rewardsCount.text =  rewardsNum.toString();  
            }else
            {
                let data = Activity.ins().getLastRingAward();
                this.starNum.text = SpecialRing.ins().getCanUpgradeStars(data.rewardsNum).toString();
                 this.rewardsCount.text =  data.rewardsNum.toString();  
                this.currentState = 'fullcount';
                this.price.visible = false;
                this.chanllage.visible = false;
            }
        }
        this.actTime.text = data.getRemainTime();
    }

    private onChanllage(): void {
        if(Actor.yb >= this.needYB){
            Activity.ins().sendReward(this.activityID, this.awardIndex);
            Activity.ins().addEvent();
        }else{
            UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
        }
    }

}
