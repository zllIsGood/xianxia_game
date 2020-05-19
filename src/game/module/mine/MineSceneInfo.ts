/**
 * Created by hrz on 2017/8/8.
 *
 * 场景信息更新
 */

enum MineSceneUpdate {
    fighting = 1,
    finished = 2,
    addNew = 3,
    scene = 4,
    updateMine = 5,
    userInfo = 6
}

class MineSceneInfo {
    index:number;//矿索引
    type:number;//场景信息更新类型

    //类型1 状态 0正常 1被攻击
    state:number;
    //类型2 采完了

    //类型3 新增矿
    mine:MineModel;
    //类型4.场景入口变化
    sceneIndex:number;
    isExitUp:boolean;
    isExitDown:boolean;
    //类型5.场景矿工新加被攻击者id
    actorId:number;
    //类型6.玩家信息更新



    parser(bytes:GameByteArray) {
        this.index = bytes.readShort();
        this.type = bytes.readShort();
        if (this.type == MineSceneUpdate.fighting){
            this.state = bytes.readByte();
        }
        else if (this.type == MineSceneUpdate.addNew) {
            this.mine = ObjectPool.pop("MineModel");
            this.mine.parser(bytes);
        } else if (this.type == MineSceneUpdate.scene) {
            this.sceneIndex = bytes.readShort();
            this.isExitUp = !!bytes.readShort();
            this.isExitDown = !!bytes.readShort();
        } else if (this.type == MineSceneUpdate.updateMine) {
            this.actorId = bytes.readInt();
        } else if (this.type == MineSceneUpdate.userInfo) {
            this.mine = MineData.ins().getMineByIndex(this.index);
            if(this.mine) this.mine.parser(bytes);
        }
    }

    handler() {
        if (this.type == MineSceneUpdate.fighting) {
            let mine = MineData.ins().getMineByIndex(this.index);
            if(mine){
                mine.isBeFight = this.state == 1;
                let char:CharMiner = EntityManager.ins().getMineByIndex(this.index);
                if(char) char.updateTitleState();
            }
        } else if (this.type == MineSceneUpdate.finished) {
            MineData.ins().remove(this.index);
        } else if (this.type == MineSceneUpdate.addNew) {
            MineData.ins().add(this.mine);
        } else if (this.type == MineSceneUpdate.scene) {
            MineData.ins().isExitUp = this.isExitUp;
            MineData.ins().isExitDown = this.isExitDown;
            MineData.ins().index = this.sceneIndex;
            MineData.ins().createTransfer();
        } else if (this.type == MineSceneUpdate.updateMine) {
            let mine = MineData.ins().getMineByIndex(this.index);
            if(mine){
                mine.beFightActorID.push(this.actorId);
                let char:CharMiner = EntityManager.ins().getMineByIndex(this.index);
                if (char) char.updateTitleState();
            }
        } else if (this.type == MineSceneUpdate.userInfo) {
            let char = EntityManager.ins().getMineByIndex(this.index) as CharMiner;
            if (char) char.updateModel();
        }
    }

    destroy () {
        this.mine = null;
        ObjectPool.push(this);
    }
}