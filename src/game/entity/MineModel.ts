/**
 * Created by hrz on 2017/8/8.
 *
 * 旷工
 */

class MineModel extends NpcModel {
    index:number;//矿位置
    actorID:number;//当前所属
    name:string;//所属名字
    power:number;//所属战力
    guildName:string;//所属门派名字
    configID:number;//矿id
    startTime:number;//开采时间
    endTime:number;//开采结束时间
    isBeFight:boolean;//是否被攻击中
    beFightActorID:number[];//被攻击玩家id

    constructor(){
        super();
        this.type = EntityType.Mine;
    }

    get npcConfig():NpcBaseConfig {
        let conf = GlobalConfig.KuangYuanConfig[this.configID];
        return GlobalConfig.NpcBaseConfig[conf.npcId];
    }

    parser(bytes:GameByteArray) {
        this.index = bytes.readByte();
        this.actorID = bytes.readInt();
        this.name = bytes.readString();
        this.power = bytes.readInt();
        this.guildName = bytes.readString();
        this.configID = bytes.readUnsignedByte();
        this.startTime = DateUtils.formatMiniDateTime(bytes.readInt());
        this.endTime = DateUtils.formatMiniDateTime(bytes.readInt());
        this.isBeFight = bytes.readBoolean();

        let len = bytes.readByte();
        this.beFightActorID = [];
        for (let i = 0; i < len; i++) {
            this.beFightActorID[i] = bytes.readInt();
        }
    }
}