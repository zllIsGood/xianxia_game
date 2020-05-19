/**
 * Created by hrz on 2017/7/6.
 */

class FbExpPanel extends BaseView {
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
    private eff: MovieClip;

    constructor() {
        super();
        this.name = `经验副本`
        // this.skinName = `jinyanskin`;
    }

    open() {
        this.addTouchEvent(this, this.onTap);
        this.observe(UserFb.ins().postFbExpInfo, this.onUpdate);
        this.onUpdate();
    }

    close() {
        this.removeTouchEvent(this, this.onTap);
        this.removeObserve();
        DisplayUtils.removeFromParent(this.eff);
        this.eff = null;
    }

    private onUpdate() {
        let fbExp = UserFb.ins().fbExp;
        let index = 0;
        if (!fbExp.cid && !fbExp.sid) {
            if (fbExp.useTime <= this.getChangeNum()) {
                index = 0;
                this.currentState = `challenge`;
            } else {
                index = 2;
                this.currentState = `sdfb`;
            }
        } else {
            if (fbExp.cid) {
                index = 1;
                this.currentState = `free`;
            } else {
                index = 3;
                this.currentState = `sdget`;
            }
        }
        this.validateNow();
        this.onInitIndex(index);
    }

    private getChangeNum(lv?) {
        if (lv == undefined) lv = UserVip.ins().lv;
        let count = GlobalConfig.ExpFubenBaseConfig.freeCount;
        return (GlobalConfig.ExpFubenBaseConfig.vipCount[lv] || 0) + count;
    }

    private getSdNum(vip) {
        return GlobalConfig.ExpFubenBaseConfig.buyCount + GlobalConfig.ExpFubenBaseConfig.vipBuyCount[vip];
    }

    private onInitIndex(index) {
        let fbExp = UserFb.ins().fbExp;
        let fbId = UserFb.ins().getExpFbId();
        let discount: number = GlobalConfig.MonthCardConfig.expFubenPrecent / 100;
        let addValue: number = Recharge.ins().getIsForeve() ? 1 + discount : 1;
        let exp = Math.floor(GlobalConfig.ExpFubenConfig[fbId].exp * addValue);
        if (index == 0) { //挑战
            this.lbTime.text = `今日可挑战次数：${this.getChangeNum() - fbExp.useTime}`;
            this.lbExp.text = `${exp}`;
            if (this.getChangeNum() > fbExp.useTime) {
                this.btnChallenge.enabled = true;
            } else {
                this.btnChallenge.enabled = false;

                let nextLv = UserVip.ins().lv + 1;
                let nextTime = this.getChangeNum(nextLv);
                while (nextTime != undefined && nextTime <= fbExp.useTime) {
                    nextLv += 1;
                    nextTime = this.getChangeNum(nextLv);
                    if (GlobalConfig.ExpFubenBaseConfig.vipCount[nextLv] == undefined) {
                        break;
                    }
                }
                if (nextTime - fbExp.useTime > 0) {
                    this.lbTime.text = `${UserVip.formatLvStr(nextLv)}可挑战次数+${nextTime - fbExp.useTime}`;
                }
            }
        }
        else if (index == 2) { //扫荡
            this.barGroup.visible = false;
            this.btnSD.visible = true;
            this.bar.value = 0;
            this.lbExp.text = `${exp}`;
            let sdTime = this.getSdNum(UserVip.ins().lv);
            if (fbExp.sdTime >= (sdTime || 0)) {
                let nextLv = UserVip.ins().lv + 1;
                let nextTime = this.getSdNum(nextLv);
                while (nextTime != undefined && nextTime <= sdTime) {
                    nextLv += 1;
                    nextTime = this.getSdNum(nextLv);
                }

                this.lbVip0.visible = false;
                if (nextTime && nextTime > sdTime) {
                    this.lbVip.textFlow = TextFlowMaker.generateTextFlow1(`|C:0xf3311e&T:${UserVip.formatLvStr(nextLv)}|可额外扫荡${nextTime - sdTime}次`);
                    this.lbVip.visible = true;
                    this.btnSD.enabled = false;
                } else if (nextTime == undefined) {
                    this.lbVip.textFlow = TextFlowMaker.generateTextFlow1(`今日扫荡次数已用完`);
                    this.lbVip.visible = true;
                    this.btnSD.enabled = false;
                } else {
                    this.lbVip.visible = false;
                    this.btnSD.enabled = true;
                }

            } else {
                this.lbVip.visible = false;
                this.lbVip0.visible = true;
                this.lbVip0.textFlow = TextFlowMaker.generateTextFlow1(`今日可扫荡次数${sdTime - fbExp.sdTime}次`);
                this.btnSD.enabled = true;
            }
        } else if (index == 1 || index == 3) { //领取奖励
            let exp = GlobalConfig.ExpFubenConfig[fbExp.cid || fbExp.sid].exp * addValue;
            for (let i = 0; i < 3; i++) {
                this['lbExp' + i].textFlow = TextFlowMaker.generateTextFlow1(`经验：${exp * (i + 1)}`);

                let needGold = 0;

                if (index == 1) {
                    needGold = GlobalConfig.ExpFubenBaseConfig.recPrice[i];
                }
                else {
                    needGold = GlobalConfig.ExpFubenBaseConfig.buyPrice[i];
                }

                (this['gold' + i] as PriceIcon).setPrice(needGold);
            }

            if (Setting.ins().getValue(ClientSet.expFirst) == 0) {
                if (!this.eff) {
                    this.eff = new MovieClip();
                    this.eff.scaleX = 1.1;
                    this.eff.scaleY = 1.1;
                    this.eff.touchEnabled = false;
                    this.eff.x = this.btnGet2.x + this.btnGet2.width / 2;
                    this.eff.y = this.btnGet2.y + this.btnGet2.height / 2;
                    this.eff.playFile(RES_DIR_EFF + "chargeff2", -1);
                    this.g2.addChild(this.eff);
                }
            }
            if (Actor.level < 80) {
                this.g1.visible = this.g2.visible = false;
                //this.g0.horizontalCenter = 0;
            } else {
                this.g1.visible = this.g2.visible = true;
                //this.g0.horizontalCenter = -182;
            }
        }
    }

    private onTap(e: egret.TouchEvent) {
        let tar = e.target;
        if (this.checkBtnGet(tar)) {

        } else if (tar == this.btnChallenge) {
            if (UserFb.ins().checkInFB()) return;
            UserFb.ins().sendChallengeExpFb();
        } else if (tar == this.btnSD) {
            if (this.barGroup.visible == false) {
                this.barGroup.visible = true;
                this.btnSD.visible = false;
                this.lbVip.visible = false;
                this.lbVip0.visible = false;
                this.bar.maximum = 100;
                this.bar.value = 0;
                egret.Tween.get(this.bar).to({ value: 100 }, 1500).call(() => {
                    UserFb.ins().sendSaodang();
                });
            }
        }
    }

    private checkBtnGet(tar): boolean {
        let fbExp = UserFb.ins().fbExp;
        let index = 0;
        if (tar == this.btnGet0) {
            index = 1;
        } else if (tar == this.btnGet1) {
            index = 2;
        } else if (tar == this.btnGet2) {
            index = 3;
        }

        if (index > 0) {
            let type = fbExp.cid ? 0 : 1;
            let cost = GlobalConfig.ExpFubenBaseConfig.recPrice[index - 1];//type == 0 ? GlobalConfig.ExpFubenBaseConfig.recPrice[index - 1] : GlobalConfig.ExpFubenBaseConfig.buyPrice[index - 1];
            if (Actor.yb < cost) {
                UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
                return;
            }
            if (index != 3 && Setting.ins().getValue(ClientSet.expFirst) == 0) {
                if (index == 1 && Actor.level < 80) {
                    this.sendGetAward(type, index, tar);
                    DisplayUtils.removeFromParent(this.eff);
                    this.eff = null;
                } else {
                    let str = `是否领取${index}倍奖励，领取后您的等级将会落后一大截，强烈推荐3倍领取`;
                    if (cost != 0) str = `是否花费<font color='#FFB82A'>${cost}元宝</font>领取${index}倍奖励，领取后您的等级将会落后一大截，强烈推荐3倍领取`;
                    let win = WarnWin.show(str, () => {
                        this.sendGetAward(type, index, tar);
                        Setting.ins().setValue(ClientSet.expFirst, 1);
                        DisplayUtils.removeFromParent(this.eff);
                        this.eff = null;
                    }, this);
                    win.setBtnLabel(`领取`);
                }
                return;
            }

            if (cost == 0) {
                this.sendGetAward(type, index, tar);
            } else {
                // let win = WarnWin.show(`确定花费<font color='#FFB82A'>${cost}元宝</font>领取${index}倍奖励吗？`, function () {
                this.sendGetAward(type, index, tar);
                // }, this);
                // win.setBtnLabel(`领取`);
            }

        }

        return index > 0
    }

    private sendGetAward(type, index, tar) {
        let fbExp = UserFb.ins().fbExp;
        let config = GlobalConfig.ExpFubenConfig[fbExp.cid || fbExp.sid];
        if (!config) return;
        let exp = config.exp;
        let flyTime = this.getFlyTime(exp * index);
        let count = Math.floor(flyTime / 15);
        // let count = [30,40,50][index-1] || 30;
        TimerManager.ins().doTimer(15, count, () => {
            UserFb.ins().postExpFly(tar.parent.localToGlobal(tar.x + tar.width / 2, tar.y + tar.height / 2));
            if (index > 1) {
                UserFb.ins().postExpFly(tar.parent.localToGlobal(tar.x + tar.width / 2, tar.y + tar.height / 2));
            }
            if (index > 2) {
                UserFb.ins().postExpFly(tar.parent.localToGlobal(tar.x + tar.width / 2, tar.y + tar.height / 2));
            }
        }, this);
        egret.Tween.get(tar).wait(1100).call(() => {
            UserFb.ins().sendGetAwardMul(type, index);
        });
    }

    private getFlyTime(exp) {
        let addLevel = 0;
        let oldLevel = Actor.level;
        let oldExp = Actor.exp;
        let config = GlobalConfig.ExpConfig[oldLevel];
        if (Assert(config, "cant get ExpConfig by level: " + oldLevel)) return;
        let maxExp = config.exp;
        while (exp > 0 && exp > (maxExp - oldExp)) {
            addLevel += 1;
            oldLevel += 1;
            exp -= (maxExp - oldExp);
            maxExp = config.exp;
            oldExp = 0;
        }
        if (addLevel == 0) {
            return 400;
        }
        return (addLevel + 1) * 400 - 200;
    }
}