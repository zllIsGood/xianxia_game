/**
 * Created by hrz on 2017/8/8.
 */

/**
 * 采矿记录数据
 */
class MineRecord {

    static TYPE_BEROB:number = 1;//被掠夺
    static TYPE_ROB:number = 2; //主动掠夺

    index:number;//记录索引
    type:number;//记录类型(1被掠夺记录, 2掠夺记录)
    time:number;//记录时间

    configID:number;

    //类型1
    fighterActorID:number;//攻击者actorid
    fighterName:string;//攻击者名字
    fighterIsWin:number;//攻击者是否胜利
    isBeatHim:number;//是否复仇过
    fighterJob:number;//攻击者职业
    fighterSex:number;//攻击者性别
    fighterPower:number;//攻击者战力

    //类型2
    robActorID:number;//掠夺的actorid
    robMasterName:string;//掠夺的名字
    robIsWin:number;//攻击者是否胜利

    parser(bytes:GameByteArray) {
        this.index = bytes.readShort();
        this.type = bytes.readByte();
        this.time = DateUtils.formatMiniDateTime(bytes.readInt());

        if (this.type == MineRecord.TYPE_BEROB) { //被掠夺
            this.configID = bytes.readByte();
            this.fighterActorID = bytes.readInt();
            this.fighterName = bytes.readString();
            this.fighterIsWin = bytes.readByte();
            this.isBeatHim = bytes.readByte();
            this.fighterJob = bytes.readByte();
            this.fighterSex = bytes.readByte();
            this.fighterSex = this.fighterJob == JobConst.ZhanShi ? 0 : 1;
            this.fighterPower = bytes.readInt();
        } else {
            this.configID = bytes.readByte();
            this.robActorID = bytes.readInt();
            this.robMasterName = bytes.readString();
            this.robIsWin = bytes.readByte();
        }
    }
}