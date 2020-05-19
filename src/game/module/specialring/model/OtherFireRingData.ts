/**
 * Created by hrz on 2017/11/8.
 *
 * 其他烈焰戒指数据 （追血令 矿洞战 野外玩家）
 */

class OtherFireRingData {
    lv:number;
    skillBooks:RingSkillInfo[];
    abilityItems:number[];

    parser(bytes:GameByteArray){
        this.lv = bytes.readInt();
        this.skillBooks = [];
        this.abilityItems = [];

        if (this.lv > 0) {
            let bookCount = bytes.readShort();
            for (let i = 0; i < bookCount; i++) {
                let skillInfo:RingSkillInfo = new RingSkillInfo();
                skillInfo.position = bytes.readShort();
                skillInfo.skillId = bytes.readShort();
                skillInfo.skillLvl = bytes.readShort();
                this.skillBooks.push(skillInfo);
            }

            let itemCount = bytes.readShort();
            for (let i = 0; i < itemCount; i++) {
                this.abilityItems.push(bytes.readShort());
            }
        }
    }
}