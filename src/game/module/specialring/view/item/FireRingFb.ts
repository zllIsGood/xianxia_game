/**
 * Created by hrz on 2017/11/3.
 */

class FireRingFb extends BaseView {
    private g0: eui.Group;
    private g1: eui.Group;
    private g2: eui.Group;
    private barGroup: eui.Group;
    private gold0: PriceIcon;
    private gold1: PriceIcon;
    private gold2: PriceIcon;
    private btnGet0: eui.Button;
    private btnGet1: eui.Button;
    private btnGet2: eui.Button;
    private btnChallenge: eui.Button;
    private btnSD: eui.Button;
    private lbExp0: eui.Label;
    private lbExp1: eui.Label;
    private lbExp2: eui.Label;
    private lbFree: eui.Label;
    private lbVip: eui.Label;
    private lbVip0: eui.Label;
    private bar: eui.ProgressBar;
    private lbTime: eui.Label;
    private lbExp: eui.Label;
    private eff:MovieClip;
    private isUse:boolean = false;

    constructor() {
        super();
        this.name = `副本`
        // this.skinName = `LYRFbSkin`;
    }

    open() {
        this.addTouchEvent(this, this.onTap);
        this.observe(UserFb.ins().postFbRingInfo, this.onUpdate);
        this.observe(UserBag.ins().postItemCountChange,this.UseToItem);
        this.onUpdate();
    }

    close() {
        this.removeTouchEvent(this, this.onTap);
        this.removeObserve();
        DisplayUtils.removeFromParent(this.eff);
        this.eff = null;
    }

    private onUpdate() {
        this.isUse = false;

        let fbExp = UserFb.ins().fbRings;
        let index = 0;
        if(fbExp.canTakeAward) {
            index = 1;
            this.currentState = `free`;
        }
        else {
            index = 0;
            this.currentState = `challenge`;
        }
        this.validateNow();
        this.onInitIndex(index);
    }

    //使用道具返回
    private UseToItem(){
        if( this.isUse ){
            this.isUse = false;
            UserFb.ins().sendChallengeFbRing();
        }
    }

    private getChangeNum(lv?){
        if(lv == undefined) lv = UserVip.ins().lv;
        let count = GlobalConfig.ActorExRingFubenConfig.freeCount;
        return (GlobalConfig.ActorExRingFubenConfig.vipCount[lv]||0) + count;
    }

    private onInitIndex(index) {
        let fbExp = UserFb.ins().fbRings;
        let awards = GlobalConfig.ActorExRingFubenConfig.reward;
        let exp = awards[0].count;
        if (index == 0) { //挑战
            // this.lbTime.text = `今日可挑战次数：${this.getChangeNum()-fbExp.useTime}`;
            this.lbTime.text = `今日可挑战次数：${fbExp.challengeTime}`;
            this.lbExp.text = `${exp}`;
            if (fbExp.challengeTime) {
                this.btnChallenge.enabled = true;
            } else {
                // this.btnChallenge.enabled = false;

                let curTime = this.getChangeNum();
                let nextLv = UserVip.ins().lv + 1;
                let nextTime = this.getChangeNum(nextLv);
                while (nextTime != undefined && nextTime >= curTime) {
                    nextLv += 1;
                    nextTime = this.getChangeNum(nextLv);
                    if(GlobalConfig.ActorExRingFubenConfig.vipCount[nextLv] == undefined) {
                        break;
                    }
                }
                if (nextTime - curTime> 0) {
                    this.lbTime.text = `${UserVip.formatLvStr(nextLv)}可挑战次数+${nextTime-curTime}`;
                }
            }
        }
       else if (index == 1) { //领取奖励
            let recPrice = GlobalConfig.ActorExRingFubenConfig.recPrice;
            let index = 0;
            for (let i in recPrice) {
                this['lbExp' + index].textFlow = TextFlowMaker.generateTextFlow1(`  ${exp * (+i+1)}`);
                let needGold = GlobalConfig.ActorExRingFubenConfig.recPrice[i];

                (this['gold' + index] as PriceIcon).setPrice(needGold);
                index += 1;
            }

            if (Setting.ins().getValue(ClientSet.expFirst) == 0) {
                if(!this.eff) {
                    this.eff = new MovieClip();
                    this.eff.touchEnabled = false;
                    this.eff.x = this.btnGet2.x+this.btnGet2.width/2;
                    this.eff.y = this.btnGet2.y+this.btnGet2.height/2;
                    this.eff.playFile(RES_DIR_EFF + "chargeff2", -1);
                    this.eff.scaleX = 1.1;
                    this.eff.scaleY = 1.1;
                    this.g2.addChild(this.eff);
                }
            }
            if( Actor.level < 80 ){
                this.g1.visible = this.g2.visible = false;
                //this.g0.horizontalCenter = 0;
            }else{
                this.g1.visible = this.g2.visible = true;
                //this.g0.horizontalCenter = -182;
            }
        }
    }

    private onTap(e: egret.TouchEvent) {
        let tar = e.target;
        let fbExp = UserFb.ins().fbRings;
        if (this.checkBtnGet(tar)) {

        } else if (tar == this.btnChallenge) {
            if (UserFb.ins().checkInFB()) return;
            if (fbExp.challengeTime <= 0) {
                let tipText:string = "";
                let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, ItemConst.FIRE_FB);
                if( item ){
                    tipText = `确定使用1个<font color='#FFB82A'>${item.itemConfig.name}</font>道具进入挑战？\n`;

                    WarnWin.show(tipText, function () {
                        this.isUse = true;
                        UserBag.ins().sendUseItem(item.configID,1);
                    }, this);
                    return;
                }

                if (fbExp.buyTime < (GlobalConfig.ActorExRingFubenConfig.vipCount[UserVip.ins().lv]||0)) {
                    tipText = `是否花费${GlobalConfig.ActorExRingFubenConfig.vipcost}元宝挑战烈焰副本？`;
                    WarnWin.show(tipText, function () {
                        UserFb.ins().sendChallengeFbRing();
                    }, this);
                    return;
                }

                tipText = `|C:0xff0000&T:挑战次数不足,无法挑战`;
                UserTips.ins().showTips(tipText);
                return;

            }

            UserFb.ins().sendChallengeFbRing();
        }
    }

    private checkBtnGet(tar): boolean {
        let index = 0;
        if (tar == this.btnGet0) {
            index = 1;
        } else if (tar == this.btnGet1) {
            index = 2;
        } else if (tar == this.btnGet2) {
            index = 3;
        }

        if (index > 0) {
            let cost = GlobalConfig.ActorExRingFubenConfig.recPrice[index-1];
            if (Actor.yb < cost) {
                UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
                return;
            }
            UserFb.ins().sendFbRingTakeAward(index);

        }

        return index > 0
    }
}