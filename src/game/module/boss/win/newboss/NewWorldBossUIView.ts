/**
 * Created by hrz on 2017/9/13.
 *
 * 新世界boss PVP阶段  PVE阶段1-2
 */

class NewWorldBossUIView extends BaseEuiView {
    //倒计时
    private leftTimeGroup: eui.Group;
    private lastTime: eui.Label;

    //boss血条
    private bossBloodGroup: eui.Group;
    private lvTxt: eui.Label;
    private nameTxt: eui.Label;
    private myTxt: eui.Label;
    private head: eui.Image;
    private grayImg: eui.Image;
    private bloodBar: eui.ProgressBar;
    private grayImgMask: egret.Rectangle;
    private GRAYIMG_WIDTH: number = 0;

    private dropDown: DropDown;

    //攻击与受到攻击
    private attList: eui.Group;
    private attackGroup: eui.Group;
    private list1: eui.List;
    private beAttackGroup: eui.Group;
    private list2: eui.List;

    //鼓舞
    private guwu: eui.Button;
    private guwuNum: eui.Label;
    private typeImg: eui.Image;
    private cost: eui.Label;
    private guwutime: eui.Label;
    private timeGroup: eui.Group;
    private costGroup: eui.Group;
    private countGroup: eui.Group;

    //选择攻击目标
    private attList0: eui.Group;
    private list0: eui.List;

    private tipBtn0: eui.Button;

    private bossConfig: MonstersConfig;

    private leftTime: number = 0;//剩余时间倒计时

    private _curMonsterID: number = 0;

    constructor() {
        super();
        this.skinName = `wpkBossUiSkin`;
    }

    initUI() {
        super.initUI();

        this.bossBloodGroup.visible = false;
        this.leftTimeGroup.visible = false;
        this.dropDown.visible = false;
        this.dropDown.setEnabled(false);
        this.attList.visible = false;
        this.attList0.visible = false;

        this.grayImg.source = "bosshp2";
        this.grayImgMask = new egret.Rectangle(0, 0, this.grayImg.width, this.grayImg.height);
        this.grayImg.mask = this.grayImgMask;
        //this.GRAYIMG_WIDTH = this.grayImg.width;
        //灰色血条最大宽度取boss血条宽度
 		this.GRAYIMG_WIDTH = this.bloodBar.width;
    }

    open() {
        this.observe(UserBoss.ins().postHpChange, this.reflashBlood);
        this.observe(UserBoss.ins().postBossAppear, this.reflashBlood);
        this.observe(UserBoss.ins().postNewBossReliveTime, this.updateReliveTime);
        this.observe(UserBoss.ins().postNewBossOpen, this.updateTime);
        this.observe(UserBoss.ins().postNewBossRank, this.updateRank);
        this.observe(UserBoss.ins().postAddAttrNum, this.updateAttr);

        this.addTouchEvent(this.guwu, this.onTap);
        this.addTouchEvent(this.tipBtn0, this.onTap);

        this.initView();
    }

    private initView() {
        this.updateTime();
        this.updateReliveTime();
        this.updateAttr();

        this.dropDown.currentState = `down`;

        this.bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
        if (!this.bossConfig) {
            return;
        }
        this.updateBaseInfo();
        this.reflashBlood();
    }

    private updateTime() {
        let time = UserBoss.ins().newWorldBossData.startTime;
        let isOpen = UserBoss.ins().newWorldBossData.isOpen;
        if (!isOpen || !time) {
            this.leftTimeGroup.visible = false;
            return;
        }
        let overTime = Math.floor((GameServer.serverTime - time) / 1000);
        if (overTime <= 0 || overTime >= GlobalConfig.NewWorldBossBaseConfig.bossTime) {
            this.leftTimeGroup.visible = false;
            return;
        }
        this.leftTimeGroup.visible = true;
        this.leftTime = GlobalConfig.NewWorldBossBaseConfig.bossTime - overTime;

        if (!TimerManager.ins().isExists(this.setTime, this)) {
            TimerManager.ins().doTimer(1000, 0, this.setTime, this);
        }
        this.setTime();
    }
    private setTime() {
        this.lastTime.text = DateUtils.getFormatBySecond(this.leftTime, DateUtils.TIME_FORMAT_10);
        if (this.leftTime > 0) {
            this.leftTime -= 1;
        }
    }

    private updateReliveTime() {
        if (UserBoss.ins().reliveTime > 0) {
            ViewManager.ins().open(WorldBossBeKillWin);
        } else {
            ViewManager.ins().close(WorldBossBeKillWin);
        }
    }

    private updateBaseInfo() {
        this.bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
        if (!this.bossConfig) {
            return;
        }
        this._curMonsterID = UserBoss.ins().monsterID;

        this.nameTxt.text = this.bossConfig.name;
        this.head.source = `monhead${this.bossConfig.head}_png`;
        this.lvTxt.text = `Lv.${this.bossConfig.level}`;
    }

    private reflashBlood(): void {
        if (this._curMonsterID != UserBoss.ins().monsterID) {
            this.updateBaseInfo();
        }

        this.bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
        if (!this.bossConfig) {
            this.bossBloodGroup.visible = false;
            this.leftTimeGroup.visible = false;
            return;
        }
        let charm: CharMonster = <CharMonster>EntityManager.ins().getEntityByHandle(UserBoss.ins().bossHandler);
        if (!charm || !charm.infoModel || charm.infoModel.getAtt(AttributeType.atHp) <= 0) {
            this.bossBloodGroup.visible = false;
            this.leftTimeGroup.visible = false;
            return;
        }
        let monstermodel: EntityModel = charm ? charm.infoModel : null;
        if (monstermodel) {
            this.bloodBar.maximum = monstermodel.getAtt(AttributeType.atMaxHp);
            this.bloodBar.value = monstermodel.getAtt(AttributeType.atHp);
            this.bossBloodGroup.visible = this.bloodBar.value > 0;
        } else {
            this.bloodBar.maximum = this.bossConfig.hp;
            this.bloodBar.value = this.bossConfig.hp;
            this.bossBloodGroup.visible = this.bloodBar.value > 0;
        }

        if (!this.bossBloodGroup.visible) this.leftTimeGroup.visible = false;

        this.dropDown.visible = true;

        this.updateRank();

        this.curValue = Math.floor(this.bloodBar.value / this.bloodBar.maximum * 100);
        this.tweenBlood();
    }

    private curValue: number = 1;

    private tweenBlood(): void {
        //缓动灰色血条
        let bloodPer = (this.curValue * this.GRAYIMG_WIDTH) / 100;
        //boss血条宽度减少12以上，灰色血条才开始缓动
		let bloodDif = this.GRAYIMG_WIDTH - bloodPer;
		if (bloodDif <= 12) return;
        let self = this;
        egret.Tween.removeTweens(this.grayImgMask);
        if (bloodPer < 3) return;
        let t = egret.Tween.get(this.grayImgMask, {
            onChange: () => {
                if (self.grayImg) self.grayImg.mask = this.grayImgMask;
            }
        }, self);
        t.to({ "width": bloodPer }, 1000).call(function (): void {
            if (bloodPer <= 0) {
                self.grayImgMask.width = this.GRAYIMG_WIDTH;
                egret.Tween.removeTweens(this.grayImgMask);
            }
        }, self);
    }

    private updateRank() {
        let dataArr: NewWorldBossRankData[] = UserBoss.ins().newWorldBossData.rankList ? UserBoss.ins().newWorldBossData.rankList.concat() : [];
        let len: number = dataArr.length;
        if (len) {
            if (len > 10) {
                len = 10;
            }
            let showArr: NewWorldBossRankData[] = dataArr.slice(1, len);
            this.dropDown.setData(new eui.ArrayCollection(showArr));
            this.dropDown.setLabel(`${dataArr[0].roleName}:${CommonUtils.overLength(dataArr[0].value)}`);
        }
        else {
            this.dropDown.setData(new eui.ArrayCollection([]));
            this.dropDown.setLabel('');
        }

        for (let i = 0; i < dataArr.length; i++) {
            if (dataArr[i].id == Actor.actorID) {
                let txt = CommonUtils.overLength(dataArr[i].value);
                this.myTxt.text = `自己：${txt}`;
                break;
            }
        }
    }

    private updateAttr() {
        let count = UserBoss.ins().newWorldBossData.addAttrNum || 0;
        let curConf = GlobalConfig.NewWorldBossAttrConfig[count];
        let nextConf = GlobalConfig.NewWorldBossAttrConfig[count + 1];
        let str = "";
        let curAttr = new AttributeData;
        let nextAttr = new AttributeData;
        if (nextConf) {
            for (let i = 0; i < nextConf.attr.length; i++) {
                if (i > 0) str += `\n`;

                nextAttr.type = nextConf.attr[i].type;
                nextAttr.value = nextConf.attr[i].value;

                curAttr.type = nextAttr.type;
                curAttr.value = 0;

                if (curConf && curConf.attr[i]) {
                    curAttr.value = curConf.attr[i].value;
                }
                str += AttributeData.getAttStrByType(curAttr, 0, ":", false);
                nextAttr.value -= curAttr.value;

                str += AttributeData.getAttStrByType(nextAttr, 0, "+", false, false);
            }

            if (!this.costGroup.parent) {
                this.timeGroup.addChildAt(this.costGroup, 0);
            }
        } else {
            for (let i = 0; i < curConf.attr.length; i++) {
                if (i > 0) str += `\n`;
                str += AttributeData.getAttStrByType(curConf.attr[i], 0, ":", false);
            }

            if (this.costGroup.parent) {
                this.costGroup.parent.removeChild(this.costGroup);
            }
        }
        this.guwuNum.text = str;

        this.guwutime.text = `${count}/${Object.keys(GlobalConfig.NewWorldBossAttrConfig).length}`;

        let conf = nextConf || curConf;
        if (conf.type == 1) {
            this.typeImg.source = `com_currency01`;
        } else if (conf.type == 2) {
            this.typeImg.source = `com_currency02`;
        }
        this.cost.text = conf.count + "";
    }

    private onTap(e: egret.TouchEvent) {
        let tar = e.currentTarget;
        if (tar == this.guwu) {
            if (UserBoss.ins().newWorldBossData.addAttrNum == Object.keys(GlobalConfig.NewWorldBossAttrConfig).length) {
                UserTips.ins().showTips(`鼓舞次数已用完`);
                return;
            }
            let count = UserBoss.ins().newWorldBossData.addAttrNum || 0;
            let nextConf = GlobalConfig.NewWorldBossAttrConfig[count + 1];
            if (nextConf) {
                if (nextConf.type == 1 && Actor.gold < nextConf.count) {
                    UserTips.ins().showTips(`金币不足`);
                    return;
                } else if (nextConf.type == 2 && Actor.yb < nextConf.count) {
                    UserTips.ins().showTips(`元宝不足`);
                    return;
                }
            }
            UserBoss.ins().sendBuyAddAttrNum();
        } else if (tar == this.tipBtn0) {
            ViewManager.ins().open(NewBossJiangliView);
        }
    }
}

ViewManager.ins().reg(NewWorldBossUIView, LayerManager.UI_Main);