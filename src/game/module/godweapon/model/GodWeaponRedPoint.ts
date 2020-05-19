/**
 * Created by hrz on 2017/11/7.
 */

class GodWeaponRedPoint extends BaseSystem {
    gwTaskRed:boolean = false;
    gwTaskRed1:boolean = false;
    gwTaskRed2:boolean = false;
    gwTaskRed3:boolean = false;

    godWeaponRed:boolean = false;

    //试炼红点
    gwMjRed:boolean = false;

    //神兵红点
    gwSbRed:boolean = false;
    gwSbRed1:boolean = false;
    gwSbRed2:boolean = false;
    gwSbRed3:boolean = false;

    //神兵圣域
    gwBossRp:boolean = false;

    /**
     * 神兵圣物
     * @type {boolean}
     */
    gwItem:boolean = false;

    constructor(){
        super();

        this.associated(this.postGodWeapon,
            this.postGwSb,
            this.postGwMj,
            this.postgGwBossRp,
            this.postGodWeaponItem
        );

        this.associated(this.postGwSb,
            this.postGwTab1,
            this.postGwTab2,
            this.postGwTab3
        );

        this.associated(this.postGwTask,
            GodWeaponCC.ins().postGwTask,
            GodWeaponCC.ins().postUpdateInfo,
            GameLogic.ins().postChildRole
        );

        this.associated(this.postGwMj,
            GodWeaponCC.ins().postFubenInfo,
        );

        this.associated(this.postGwTab1,
            this.postGwTask,
            GodWeaponCC.ins().postUpdateInfo,
            GodWeaponCC.ins().postUpdateExp,
        );

        this.associated(this.postGwTab2,
            this.postGwTask,
            GodWeaponCC.ins().postUpdateInfo,
            GodWeaponCC.ins().postUpdateExp,
        );

        this.associated(this.postGwTab3,
            this.postGwTask,
            GodWeaponCC.ins().postUpdateInfo,
            GodWeaponCC.ins().postUpdateExp,
        );

        this.associated(this.postgGwBossRp,
            UserBoss.ins().postWorldBoss,
            GodWeaponCC.ins().postUpdateInfo,
            UserBoss.ins().postWorldNotice,
            UserBoss.ins().postUpdateWorldPlayList,
            Actor.ins().postYbChange,
            UserBag.ins().postItemDel,
            UserBag.ins().postItemAdd
        );

        this.associated(this.postGodWeaponItem,
            UserBag.ins().postItemAdd,
            UserBag.ins().postItemDel,
            UserBag.ins().postItemCountChange
        );
    }

    postGodWeaponItem() {
        // let old = this.gwItem; //策划要求暂时屏蔽 神兵合成和融合的红点提示
        // this.gwItem = GodweaponItemModel.ins().isCanCompound() || GodweaponItemModel.ins().isCanFuse();
        // return old != this.gwItem;
        return false;
    }

    postGodWeapon(){
        let oldv = this.godWeaponRed;
        this.godWeaponRed = this.gwSbRed || this.gwMjRed || this.gwItem || this.gwBossRp;
        return oldv != this.godWeaponRed;
    }

    postGwSb() {
        let oldv = this.gwSbRed;
        this.gwSbRed = this.gwSbRed1 || this.gwSbRed2 || this.gwSbRed3;
        return oldv != this.gwSbRed;
    }

    postGwTab1() {
        let oldv = this.gwSbRed1;
        if(this.gwTaskRed1) {
            this.gwSbRed1 = true;
        }
        else if(GodWeaponCC.ins().getWeaponData(1)){
            this.gwSbRed1 = GodWeaponCC.ins().maxLvRedPoint() || GodWeaponCC.ins().getWeaponData(1).hasRedPoint || GodWeaponCC.ins().getSwRedPoint(1);
            //是否有经验可升级
            if (!this.gwSbRed1) this.gwSbRed1 = GodWeaponCC.ins().weaponIsActive(1) && GodWeaponCC.ins().maxLvRedPoint();
        }else{
            this.gwSbRed1 = false;
        }
        return oldv != this.gwSbRed1;
    }

    postGwTab2() {
        let oldv = this.gwSbRed2;
        if(this.gwTaskRed2) {
            this.gwSbRed2 = true;
        }
        else if(GodWeaponCC.ins().getWeaponData(2)){
            this.gwSbRed2 = GodWeaponCC.ins().maxLvRedPoint() || GodWeaponCC.ins().getWeaponData(2).hasRedPoint || GodWeaponCC.ins().getSwRedPoint(2);
            //是否有经验可升级
            if (!this.gwSbRed2) this.gwSbRed2 = GodWeaponCC.ins().weaponIsActive(2) && GodWeaponCC.ins().maxLvRedPoint();
        }else{
            this.gwSbRed2 = false;
        }
        return oldv != this.gwSbRed2;
    }

    postGwTab3() {
        let oldv = this.gwSbRed3;
        if(this.gwTaskRed3) {
            this.gwSbRed3 = true;
        }
        else if(GodWeaponCC.ins().getWeaponData(3)){
            this.gwSbRed3 = GodWeaponCC.ins().maxLvRedPoint() || GodWeaponCC.ins().getWeaponData(3).hasRedPoint || GodWeaponCC.ins().getSwRedPoint(3);
            //是否有经验可升级
            if (!this.gwSbRed3) this.gwSbRed3 = GodWeaponCC.ins().weaponIsActive(3) && GodWeaponCC.ins().maxLvRedPoint();
        }else{
            this.gwSbRed3 = false;
        }
        return oldv != this.gwSbRed3;
    }

    //试炼红点
    postGwMj() {
        let oldv = this.gwMjRed;
        this.gwMjRed = GodWeaponCC.ins().mijintHadRedPoint();
        return oldv != this.gwMjRed;
    }

    postGwTask() {
        let oldv = this.gwTaskRed;

        this.gwTaskRed = false;
        if (GodWeaponCC.ins().taskIsOpen()) {
            let gwTask = GodWeaponCC.ins().gwTask;
            if (gwTask.statue == GwTaskData.DONE || gwTask.statue == GwTaskData.FINISH) {
                this.gwTaskRed = true;
            } else if(gwTask.taskIdx == 0 && SubRoles.ins().subRolesLen > GodWeaponCC.ins().weaponDataAry.length) {
                this.gwTaskRed = true;
            }

            //任务有红点
            if(this.gwTaskRed) {
                for (let i = 1; i <= 3; i++) {
                    if(GodWeaponCC.ins().getWeaponData(i)) {
                        this[`gwTaskRed${i}`] = false;
                    } else if((SubRoles.ins().getSubRoleByJob(i) && gwTask.taskIdx == 0) || gwTask.weapon == i) {
                        this[`gwTaskRed${i}`] = true;
                    } else {
                        this[`gwTaskRed${i}`] = false;
                    }
                }
            } else {
                this.gwTaskRed1 = false;
                this.gwTaskRed2 = false;
                this.gwTaskRed3 = false;
            }
        }

        return true;
    }

    postgGwBossRp():boolean {
        let oldv = this.gwBossRp;
        this.gwBossRp = GodWeaponCC.ins().godWeaponIsOpen() && (UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_GODWEAPON) || UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP));
        return oldv != this.gwBossRp;
    }

}

namespace GameSystem {
    export let  godweaponRedPoint = GodWeaponRedPoint.ins.bind(GodWeaponRedPoint);
}