/**
 * Created by hrz on 2017/8/8.
 *
 * 旷工
 */

class CharMiner extends CharNpc {
    constructor(){
        super();
        this.npcHead.currentState = this.npcHead.states[1];
    }

    set infoModel(model:MineModel) {
        this._infoModel = model as MineModel;
    }

    get infoModel():MineModel {
        return this._infoModel as MineModel;
    }

    updateModel(){
        super.updateModel();

        let config = GlobalConfig.KuangYuanConfig[this.infoModel.configID];
        this.npcHead.nameTxt.text = this.infoModel.name+"的矿工";
        this.npcHead.nameTxt.textColor = config.color;//ItemBase.QUALITY_COLOR[config.level];

        this.updateTime();
        this.updateTitleState();
    }

    updateTime(){
        let config = GlobalConfig.KuangYuanConfig[this.infoModel.configID];
        let totalTime = config.needTime;
        // let addTime = 0;
        // if( Recharge.ins().franchise )
        //     addTime = GlobalConfig.PrivilegeData.reduceKuangTime;
        // totalTime -= addTime;

        let sec = Math.floor((totalTime*1000 + this.infoModel.startTime - GameServer.serverTime)/1000);
        //let sec = Math.floor((this.infoModel.endTime - GameServer.serverTime)/1000);
        if (sec > 0) {
            this.npcHead.timeTxt.text = DateUtils.getFormatBySecond(sec, DateUtils.TIME_FORMAT_3);
        } else {
            MineData.ins().remove(this.infoModel.index);
        }

        this.playAction(EntityAction.ATTACK,()=>{
            // let eff:MovieClip = ObjectPool.pop("MovieClip");
            // eff.scaleX = this._dir > 4 ? -1 : 1;
            // eff.playFile(RES_DIR_EFF+"wakuang_"+(this.getResDir()),1,()=>{eff.destroy();});
            // this._bodyContainer.addChild(eff);
        });
    }

    updateTitleState() {
        this.npcHead.updateState(this.infoModel);
    }

    destruct(){
        super.destroy();
        ObjectPool.push(this);
    }
}