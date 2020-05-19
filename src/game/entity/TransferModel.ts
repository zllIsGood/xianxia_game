/**
 * Created by hrz on 2017/8/10.
 *
 * 传送点 特殊npc
 */

class TransferModel extends NpcModel {
    index:number;
    constructor() {
        super();
        this.type = EntityType.Transfer;
    }

    get avatarFileName():string {
        return RES_DIR_EFF + "movestand";
    }
}