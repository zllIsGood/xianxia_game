/**
 * Created by hrz on 2017/8/8.
 */

class MineData extends BaseClass {
    static ins():MineData {
        return super.ins() as MineData;
    }

    index:number; //当前采矿场景索引
    isExitUp:boolean;//是否存在上一场景
    isExitDown:boolean;//是否存在下一场景

    mines:MineModel[];

    myMine:MineModel;

    isShowTransfer:boolean = true;//是否显示传送入口

    constructor() {
        super();
        this.mines = [];
    }

    parser(bytes:GameByteArray) {
        this.index = bytes.readShort();
        this.isExitUp = !!bytes.readShort();
        this.isExitDown = !!bytes.readShort();

        let len = bytes.readShort();

        this.removeAll();

        for (let i = 0; i < len; i++) {
            this.mines[i] = ObjectPool.pop("MineModel");
            this.mines[i].parser(bytes);

            this.checkIsMyMine(this.mines[i]);
            this.updateMineConfig(this.mines[i]);
        }

        this.resetRole();
        this.createTransfer();
        this.createEntity();

        this.showAwardWin();
    }

    private showAwardWin(){
        if (Mine.ins().finishedData) {
            ViewManager.ins().open(MineRobWin, Mine.ins().finishedData);
        }
    }

    resetRole() {
        EntityManager.ins().resetRole();
        let len = SubRoles.ins().subRolesLen;
        for (let i = 1; i < len; i++) {
            let data = SubRoles.ins().roles[i];
            let role = EntityManager.ins().getEntityByHandle(data.handle);
            if(role) role.visible = false;
        }
    }

    createTransfer() {
        if(!this.isShowTransfer) return;

        let transPos = GlobalConfig.CaiKuangConfig.transPos;
        if (this.isExitUp) {
            let transfer = EntityManager.ins().getTransferById(0) as CharTransfer;
            if (transfer) {
                transfer.infoModel.index = this.index-1;
                transfer.updateModel();
            } else {
                this.addTransfer(0,this.index-1);
            }
        } else {
            EntityManager.ins().removeTransferById(0);
        }

        if (this.isExitDown) {
            let transfer = EntityManager.ins().getTransferById(1) as CharTransfer;
            if (transfer) {
                transfer.infoModel.index = this.index+1;
                transfer.updateModel();
            } else {
                this.addTransfer(1,this.index+1);
            }
        } else {
            EntityManager.ins().removeTransferById(1);
        }
    }

    showTransfer(b) {
        this.isShowTransfer = b;
        if (b) this.createTransfer();
        else {
            EntityManager.ins().removeTransferById(0);
            EntityManager.ins().removeTransferById(1);
        }
    }

    private addTransfer(configID, index) {
        let transPos = GlobalConfig.CaiKuangConfig.transPos;
        let model:TransferModel = new TransferModel();
        model.configID = configID;
        model.index = index;
        let pos = transPos[model.configID];
        model.x = pos.x * GameMap.CELL_SIZE + (GameMap.CELL_SIZE>>1);
        model.y = pos.y * GameMap.CELL_SIZE + (GameMap.CELL_SIZE>>1);
        EntityManager.ins().createEntity(model);
    }

    createEntity() {
        for (let mine of this.mines) {
            GameLogic.ins().createEntityByModel(mine);
        }

        if (!TimerManager.ins().isExists(this.updateTime,this)) {
            TimerManager.ins().doTimer(1000,0,this.updateTime,this);
        }
    }

    private updateTime(){
        for (let mine of this.mines) {
            let char:CharMiner = EntityManager.ins().getMineByIndex(mine.index);
            if(char) char.updateTime();
        }
    }

    getMineByIndex(index:number,actorID?:number):MineModel {
        for (let mine of this.mines) {
            if (mine.index == index) {
                if (!actorID ||actorID == mine.actorID) {
                    return mine;
                }
                return null;
            }
        }
    }

    add(mine:MineModel) {
        this.remove(mine.index);

        MineData.ins().mines.push(mine);
        this.checkIsMyMine(mine);
        this.updateMineConfig(mine);
        GameLogic.ins().createEntityByModel(mine);
    }

    private updateMineConfig(mine:MineModel) {
        let kuangPos = GlobalConfig.CaiKuangConfig.kuangPos;
        let pos = kuangPos[mine.index-1];
        mine.x = pos.x * GameMap.CELL_SIZE + (GameMap.CELL_SIZE>>1);
        mine.y = pos.y * GameMap.CELL_SIZE + (GameMap.CELL_SIZE>>1);
        mine.dir = pos.d;
    }

    private checkIsMyMine(mine:MineModel):boolean {
        if (mine.actorID == Actor.actorID) {
            this.myMine = mine.clone(this.myMine) as MineModel;
            Mine.ins().mineStartTime = this.myMine.startTime;
            Mine.ins().mineEndTime = this.myMine.endTime;
            return true;
        }
        return false;
    }

    getIsCanAtk(mine:MineModel):boolean {
        if(mine.actorID == Actor.actorID) {
            return false;
        }
        if(!MineData.ins().getMineByIndex(mine.index, mine.actorID)){
            return false;
        }
        if (mine.isBeFight) {
            return false;
        }
        if (mine.beFightActorID.length >= GlobalConfig.CaiKuangConfig.maxBeRobCount) {
            return false;
        }
        if (mine.beFightActorID.indexOf(Actor.actorID) >= 0) {
            return false;
        }
        if (Mine.ins().robCount >= GlobalConfig.CaiKuangConfig.maxRobCount) {
            return false;
        }
        return true;
    }

    remove(index) {
        for (let i in this.mines) {
            let mine = this.mines[i];
            if (mine.index == index) {
                this.mines.splice(parseInt(i), 1);
                EntityManager.ins().removeMineByIndex(index);
                break;
            }
        }
    }

    removeAll(){
        while (this.mines.length) {
            let mine = this.mines.pop();
            EntityManager.ins().removeMineByIndex(mine.index);
        }

        TimerManager.ins().removeAll(this);
    }
}

