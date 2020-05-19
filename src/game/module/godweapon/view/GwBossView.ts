/**
 * Created by hrz on 2017/11/16.
 */

class GwBossView extends BaseView {
    private tower:eui.Group;

    private tower0:eui.Group;
    private towerInfo0:eui.Label;//神兵塔 开启信息0-4
    private towerRedPoint0:eui.Image;

    private tower1:eui.Group;
    private towerInfo1:eui.Label;//神兵塔 开启信息0-4

    private tower2:eui.Group;
    private towerInfo2:eui.Label;//神兵塔 开启信息0-4

    private tower3:eui.Group;
    private towerInfo3:eui.Label;//神兵塔 开启信息0-4

    private tower4:eui.Group;
    private towerInfo4:eui.Label;//神兵塔 开启信息0-4

    private gw0:eui.Group;
    private info0:eui.Label;//神兵圣域 开启信息0-2
    private img0:eui.Image;
    private titleBg0:eui.Image;
    private title0:eui.Image;

    private gw1:eui.Group;
    private info1:eui.Label;//神兵圣域 开启信息0-2
    private img1:eui.Image;
    private titleBg1:eui.Image;
    private title1:eui.Image;

    private gw2:eui.Group;
    private info2:eui.Label;//神兵圣域 开启信息0-2
    private leftTime:eui.Label;//神兵圣域 开启信息0-2
    private img2:eui.Image;
    private titleBg2:eui.Image;
    private title2:eui.Image;

    /** boss提醒设置 */
    private remindTpis: eui.Label;
    
    private numToStr = [`一`,`二`,`三`,`四`,`五`];
    constructor(){
        super();
        // this.skinName = `GwBossSkin`;
    }

    protected childrenCreated(){
        super.childrenCreated();

        this.remindTpis.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.remindTpis.text}</u></a>`);
		this.remindTpis.touchEnabled = true;
    }

    open() {
        this.addTouchEvent(this.gw0, this.onTap);
        this.addTouchEvent(this.gw1, this.onTap);
        this.addTouchEvent(this.gw2, this.onTap);

        this.addTouchEvent(this.tower, this.onTap);
        // this.addTouchEvent(this.tower0, this.onTap);
        // this.addTouchEvent(this.tower1, this.onTap);
        // this.addTouchEvent(this.tower2, this.onTap);
        // this.addTouchEvent(this.tower3, this.onTap);
        // this.addTouchEvent(this.tower4, this.onTap);
        this.remindTpis.addEventListener(egret.TextEvent.LINK, this.onLink, this);

        this.observe(UserZs.ins().postZsLv, this.initData);
        this.observe(UserBoss.ins().postWorldBoss, this.onUpdateBoss);

        TimerManager.ins().doTimer(5000, 0, this.onUpdateTime, this);
        TimerManager.ins().doTimer(1000, 0, this.onUpdateDieTime, this);
        this.initData();

    }

    private onUpdateTime() {
        UserBoss.ins().sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_GODWEAPON);
        UserBoss.ins().sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP);
    }

    private onUpdateDieTime() {
        this.initData();
    }

    private initData() {

        let gwList = UserBoss.ins().worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON].concat();
        gwList.sort(this.compareFn);

        let topList = UserBoss.ins().worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP].concat();
        topList.sort(this.compareFn);

        let gwType = 0;
        for (let i = 0; i < gwList.length; i++) {
            let data = gwList[i];
            let config = GlobalConfig.WorldBossConfig[data.id];
            let infoTxt = `(${config.zsLevel[0]}转-${config.zsLevel[1]}转)`;
            this[`redPoint${i}`].visible = false;
            gwType = config.type;
            if (data.canInto) {
                this.setGwState(i, 2);
                if (data.isDie) {
                    let time: number = data.relieveTime - egret.getTimer();
                    time = time < 0 ? 0 : time;
                    infoTxt += `\n${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}`;
                } else {
                    this[`redPoint${i}`].visible = this.checkCanInto(config.type);
                }
            } else {
                this.setGwState(i, 0);
            }

            this[`info${i}`].text = infoTxt;
        }

        for (let i = 0; i < topList.length; i++) {
            let data = topList[i];
            let config = GlobalConfig.WorldBossConfig[data.id];
            let infoTxt = `${this.numToStr[i]}层(${config.zsLevel[0]}转-${config.zsLevel[1]}转)`;
            this[`towerRedPoint${i}`].visible = false;

            if (data.canInto) {
                this.setTopState(i, 2);
                if (data.isDie) {
                    let time: number = data.relieveTime - egret.getTimer();
                    time = time < 0 ? 0 : time;
                    infoTxt += `\n${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}`;
                } else {
                    this[`towerRedPoint${i}`].visible = this.checkCanInto(config.type);
                }
            } else {
                this.setTopState(i, 0);
            }

            this[`towerInfo${i}`].text = infoTxt;
        }
        this.leftTime.text = `今日剩余圣域归属次数：${UserBoss.ins().worldBossBelongTime[gwType]}`;
    }

    private checkCanInto(type:number) {
        let needYb = GlobalConfig.WorldBossBaseConfig.challengeItemYb[type-1];
        if(Actor.yb >= needYb)
            return true;
        let itemId = GlobalConfig.WorldBossBaseConfig.challengeItem[type-1];
        let item = UserBag.ins().getItemByTypeAndId(0, itemId);
        if (item && item.count)
            return true;
        return false;
    }

    private setGwState(index:number, state:number) {
        let states = ['locked','normal','selected'];

        this[`img${index}`].source = `gw_field_${states[state]}_${index}`;
        this[`titleBg${index}`].source = `gw_title_bg_${state == 0 ? 1 : 0}`;
        this[`title${index}`].source = `gw_title_${state == 0 ? "locked_" : ""}${index+1}`;

        this[`info${index}`].textColor = state == 0 ? 0xA9A9A9 : 0x00FF00;
    }

    private setTopState(index:number, state:number) {
        this[`tower${index}`].visible = state != 0;
        this[`towerInfo${index}`].textColor = state == 0 ? 0xA9A9A9 : 0x00FF00;
    }

    private onUpdateBoss(_type:number) {
        if (_type == UserBoss.BOSS_SUBTYPE_GODWEAPON || _type == UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP) {
            this.initData();
        }
    }

    private compareFn(a: WorldBossItemData, b: WorldBossItemData): number {
        if (a.id < b.id) {
            return -1;
        } else {
            return 1;
        }
    }

    private onLink(): void {
		ViewManager.ins().open(PubBossRemindWin, UserBoss.BOSS_SUBTYPE_GODWEAPON);
    }
    
    close() {
        this.removeTouchEvent(this.gw0, this.onTap);
        this.removeTouchEvent(this.gw1, this.onTap);
        this.removeTouchEvent(this.gw2, this.onTap);

        this.removeTouchEvent(this.tower, this.onTap);
        // this.removeTouchEvent(this.tower0, this.onTap);
        // this.removeTouchEvent(this.tower1, this.onTap);
        // this.removeTouchEvent(this.tower2, this.onTap);
        // this.removeTouchEvent(this.tower3, this.onTap);
        // this.removeTouchEvent(this.tower4, this.onTap);
        this.remindTpis.removeEventListener(egret.TextEvent.LINK, this.onLink, this);
        this.removeObserve();

        TimerManager.ins().removeAll(this);
    }

    private onTap(e:egret.TouchEvent){
        let tar = e.currentTarget;
        if (tar == this.tower) {
            let gwList = UserBoss.ins().worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP].concat();
            for (let data of gwList) {
                if(data.canInto) {
                    ViewManager.ins().open(GwBossChallengeView, data);
                }
            }
            return;
        }
        let index = this.getClickGwIndex(tar);
        if (index > -1) {
            if (!KfArenaSys.ins().checkIsMatching()) {
                return;
            }
            let gwList = UserBoss.ins().worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON].concat();
            gwList.sort(this.compareFn);
            if (gwList[index].canInto) {
                // ViewManager.ins().open(GwBossChallengeView, gwList[index]);

                let bossData = gwList[index];
                let config = GlobalConfig.WorldBossConfig[bossData.id];
                if(bossData.isDie) {
                    UserTips.ins().showTips(`BOSS未复活`);
                }
                else if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
                    ViewManager.ins().open(BagFullTipsWin, UserBag.BAG_ENOUGH);
                } else {
                    let endTime = Math.ceil((UserBoss.ins().worldBossCd[config.type] - egret.getTimer()) / 1000);
                    if (endTime > 0) {
                        UserTips.ins().showTips(`|C:0xf3311e&T:冷却中，${endTime}秒后可进行挑战|`);
                        return false;
                    }

                    // let needYb = GlobalConfig.WorldBossBaseConfig.challengeItemYb[config.type-1];
                    // let itemId = GlobalConfig.WorldBossBaseConfig.challengeItem[config.type-1];
                    // let item = UserBag.ins().getBagGoodsByTypeAndId(0, itemId);
                    // if ((!item || !item.count) && Actor.yb < needYb) {
                    //     UserTips.ins().showTips(`元宝不足`);
                    //     ViewManager.ins().close(this);
                    //     return false;
                    // }

                    UserBoss.ins().sendChallengWorldBoss(bossData.id, config.type);
                }
            }
        } else {
            index = this.getClickTowerIndex(tar);
            if (index > -1) {
                let gwList = UserBoss.ins().worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP].concat();
                gwList.sort(this.compareFn);
                if (gwList[index].canInto) {
                    ViewManager.ins().open(GwBossChallengeView, gwList[index]);
                }
            }
        }
    }

    private getClickTowerIndex(tar) {
        for (let i = 0; i < 5; i++) {
            if(tar == this[`tower${i}`])
                return i;
        }
        return -1;
    }

    private getClickGwIndex(tar) {
        for (let i = 0; i < 3; i++) {
            if(tar == this[`gw${i}`])
                return i;
        }
        return -1;
    }
}