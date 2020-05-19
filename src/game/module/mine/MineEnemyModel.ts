/**
 * Created by hrz on 2017/8/8.
 */

class MineEnemyModel {
    public lv: number;
    public zsLv: number;

    public name: string;
    public guildName:string;

    public subRole: Role[] = [];

    public hejiLvl:number = 0;
    /** 威望经验 */
    public weiWang:number = 0;

    public fireRing:OtherFireRingData;

    parser(bytes:GameByteArray) {
        this.lv = bytes.readShort();
        this.zsLv = bytes.readShort();
        this.name = bytes.readString();
        // this.guildName = bytes.readString();

        let count: number = bytes.readShort();
        for (let i = 0; i < count; i++) {
            let role = this.subRole[i] = new Role();
            role.parser(bytes);
            role.name = this.name;
        }

        this.fireRing = this.fireRing || new OtherFireRingData();
        this.fireRing.parser(bytes);

        this.hejiLvl = bytes.readInt();
        this.weiWang = bytes.readInt();
        MineFight.ins().createEnemy(this);
    }

    getJobRoles() {
        let roles = [].concat(this.subRole);
        roles.sort((a,b):number=>{
            if (a.job < b.job) {
                return -1;
            }
            return 1;
        })
        return roles;
    }
}