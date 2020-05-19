/**
 * Created by hrz on 2017/8/10.
 */

class MineRobWin extends BaseEuiView {
    private Title:eui.Label;
    private bgClose:eui.Rect;
    private awardList:eui.List;
    private owner:eui.Label;
    private power:eui.Label;
    private gang:eui.Label;//帮会名字
    private workNum:eui.Label;//掠夺剩余次数
    private handleBtn:eui.Button;//掠夺按钮
    private double:eui.Button;//双倍领取

    private enemy:eui.Label;
    private enemyPower:eui.Label;
    private time:eui.Label;
    private robaward:eui.List;
    private myFace0:eui.Image;

    private worker:eui.Image;
    private nameTxt:eui.Label;
    private noRob:eui.Label;

    private reward:eui.Label;
    private minus:eui.Label;
    private cost:eui.Label;
    private recordList:eui.List;

    private _stateIndex:number = 0;
    private _states:string[] = ["plunder","revenge","done"];

    private _data:MineRecord|MineModel;

    constructor(){
        super();
        this.skinName = `HandleSkin`;
    }

    public initUI(){
        super.initUI();

        this.robaward.itemRenderer = ItemBase;
        this.awardList.itemRenderer = ItemBase;
        this.recordList.itemRenderer = MineDoneRecordRender;

        this.addTouchEvent(this.handleBtn, this.onTap);
        this.addTouchEvent(this.double, this.onTap);
    }

    open(...param) {
        
        this.addTouchEvent(this.bgClose, this.onTap);
        this.observe(Mine.ins().postRoleInfo, this.updateInfo);
        this._data = param[0];

        this.update();
    }

    private updateInfo(power:number) {
        if(this._stateIndex == 0){
            this.power.text = `${power}`;
        } else if (this._stateIndex == 1) {
            this.enemyPower.text = `${power}`;
        }
    }

    private update(){
        if (this._data instanceof MineRecord) { //复仇
            this._stateIndex = 1;
            Mine.ins().sendGetRolePower(this._data.fighterActorID);
        } else if (this._data instanceof MineModel) { //掠夺
            this._stateIndex = 0;
            Mine.ins().sendGetRolePower(this._data.actorID);
        } else { //已采矿完成
            this._stateIndex = 2;//Mine.ins().finishedData
        }

        this.currentState = this._states[this._stateIndex];

        let config = GlobalConfig.KuangYuanConfig[this._data.configID];

        if (this._stateIndex == 0) {
            let data = this._data as MineModel;
            this.Title.textColor = config.color;
            this.Title.text = `${config.name}（可掠夺）`;
            this.owner.text = data.name;
            this.power.text = data.power+"";
            this.gang.text = data.guildName || "无";
            let maxRobCount = GlobalConfig.CaiKuangConfig.maxRobCount;
            this.workNum.text = `剩余次数：${maxRobCount-Mine.ins().robCount}/${maxRobCount}`;

            this.awardList.dataProvider = new eui.ArrayCollection(this.getAward(config));
        } else if (this._stateIndex == 1) {
            let data = this._data as MineRecord;
            this.enemy.text = data.fighterName;
            this.enemyPower.text = data.fighterPower+"";
            this.myFace0.source = `head_${data.fighterJob}${data.fighterSex}`;
            this.time.text = DateUtils.getFormatBySecond((data.time/1000)>>0,DateUtils.TIME_FORMAT_2);
            this.robaward.dataProvider = new eui.ArrayCollection(this.getAward(config));
        } else {
            this.getAwardTxt(config);
            let npcConfig = GlobalConfig.NpcBaseConfig[config.npcId];
            this.worker.source = npcConfig.icon;

            this.nameTxt.text = config.name;
            this.nameTxt.textColor = config.color;

            this.cost.text = GlobalConfig.CaiKuangConfig.doubleCost+"";

            if (Mine.ins().finishedData.beRob.length) {
                this.noRob.visible = false;
            } else {
                this.noRob.visible = true;
            }

            this.recordList.dataProvider = new eui.ArrayCollection(Mine.ins().finishedData.beRob);
        }
    }

    private getAward(config:KuangYuanConfig){
        let rewards = config.rewards;
        let awards = [];
        let percent = config.robPrecent;
        for (let i = 0; i < rewards.length; i++) {
            let data = new RewardData();
            data.type = rewards[i].type;
            data.id = rewards[i].id;
            data.count = Math.ceil(rewards[i].count*percent/100);
            awards.push(data);
        }
        return awards;
    }

    private getAwardTxt(config:KuangYuanConfig) {
        let rewards = [].concat(config.rewards);
        if (config.rewardItem) {
            rewards = rewards.concat(config.rewardItem);
        }

        let roberNum = 0;
        for (let obj of Mine.ins().finishedData.beRob) {
            if(obj.win) roberNum += 1;
        }

        let str1 = "";
        let str2 = "";
        for (let i = 0 ; i < rewards.length; i++) {
            if (rewards[i].type == 0) {
                str1 += RewardData.getCurrencyName(rewards[i].id);
            } else {
                let itemConfig = GlobalConfig.ItemConfig[rewards[i].id];
                str1 += itemConfig.name;
            }
            str1 += "x"+rewards[i].count+"\n";

            if (roberNum && i < config.rewards.length) {
                let robCount = Math.ceil(rewards[i].count * config.robPrecent/100) * roberNum;
                str2 += "-"+robCount+"\n";
            }
        }

        this.reward.text = str1;
        this.minus.text = str2;
    }

    private onTap(e:egret.Event) {
        let target = e.currentTarget;
        if (target == this.bgClose) {
            if (this._stateIndex != 2) {
                ViewManager.ins().close(this);
            }
        } else if (target == this.handleBtn) {
            if (this._stateIndex == 1) {
                Mine.ins().sendFightBack((this._data as MineRecord).index);
                MineFight.ins().start({type:1, id:(this._data as MineRecord).configID, index:this._data.index});
            } else if (this._stateIndex == 0) {
                if(!MineRobWin.openCheck(this._data)) {
                    return;
                }
                Mine.ins().sendRob(this._data as MineModel);
            } else {
                Mine.ins().sendGetAward();
            }
            ViewManager.ins().close(this);
            ViewManager.ins().close(MineRecordWin);
        } else if (target == this.double) {
            if(Actor.yb < GlobalConfig.CaiKuangConfig.doubleCost) {
                UserTips.ins().showTips(`元宝不足`,()=>{
                    ViewManager.ins().close(this);
                    UserFb.ins().sendExitFb();
                });
                // ViewManager.ins().close(this);
                return;
            }
            Mine.ins().sendGetAward(true);
            ViewManager.ins().close(this);
            ViewManager.ins().close(MineRecordWin);
            // WarnWin.show(`是否花费${GlobalConfig.CaiKuangConfig.doubleCost}元宝领取双倍奖励？`,()=>{
            //     Mine.ins().sendGetAward(true);
            //     ViewManager.ins().close(this);
            //     ViewManager.ins().close(MineRecordWin);
            // },this);
        }
    }

    close() {

    }

    static openCheck(...param):boolean {
        let info = param[0];
        if (info instanceof MineModel) {
            if (info.actorID == Actor.actorID) { //自己的不可掠夺
                return false;
            }
            if (Mine.ins().robCount >= GlobalConfig.CaiKuangConfig.maxRobCount) {
                UserTips.ins().showCenterTips(`|C:0xff0000&T:今日掠夺次数已用完|`);
                return false;
            }
            if (info.beFightActorID.indexOf(Actor.actorID) >= 0) {
                UserTips.ins().showCenterTips(`|C:0xff0000&T:当前矿工已被自己掠夺过|`);
                return false;
            }
            if(!MineData.ins().getMineByIndex(info.index,info.actorID)){
                UserTips.ins().showCenterTips(`矿工已消失`);
                return false;
            }
            if (info.beFightActorID.length >= GlobalConfig.CaiKuangConfig.maxBeRobCount) {
                UserTips.ins().showCenterTips(`当前矿工已被掠夺完`);
                return false;
            }
            if (info.isBeFight) {
                UserTips.ins().showCenterTips(`当前矿工正在被别人掠夺`);
                return false;
            }
        }
        return true;
    }
}

ViewManager.ins().reg(MineRobWin, LayerManager.UI_Popup);