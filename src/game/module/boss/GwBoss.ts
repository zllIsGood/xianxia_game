/**
 * Created by hrz on 2017/11/15.
 */

class GwBoss extends BaseSystem {
    //圣域
    isGwBoss:boolean = false;
    //圣域塔
    isGwTopBoss:boolean = false;

    isBossDie:boolean = false;

    constructor() {
        super();

        this.observe(GameLogic.ins().postEnterMap, ()=>{
            if (GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON || GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON_TOP) {
                this.postEnterGwBoss();
            } else if (this.isGwBoss || this.isGwTopBoss) {
                this.postEscGwBoss();
            }
        });

        this.observe(GameLogic.ins().postCOEntity, this.onCreateEntity);

        this.observe(UserBoss.ins().postRemainTime, this.onDie);
        this.observe(UserBoss.ins().postBossDisappear, this.onBossDisappear);
        this.observe(UserBoss.ins().postHpChange, this.onHpChange);
    }

    public postEnterGwBoss() {
        this.isGwBoss = GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON;
        this.isGwTopBoss = GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON_TOP;
        this.isBossDie = false;
        this.showView(true);
    }

    public postEscGwBoss() {
        this.isGwBoss = false;
        this.isGwTopBoss = false;
        this.isBossDie = false;
        this.showView(false);
        ViewManager.ins().close(BossEndView);
    }

    private showView(show) {
        if(show) {
            ViewManager.ins().open(BossBelongPanel);
            ViewManager.ins().open(BossBloodPanel);
            ViewManager.ins().open(TargetListPanel);
        } else {
            ViewManager.ins().close(BossBelongPanel);
            ViewManager.ins().close(BossBloodPanel);
            ViewManager.ins().close(TargetListPanel);
        }
    }

    private onCreateEntity(model:EntityModel) {
        if(!model) return;
        if (this.isGwBoss || this.isGwTopBoss) {
            if(model.type == EntityType.Monster && model.team == Team.Monster && !model.masterHandle) {
                UserBoss.ins().monsterID = model.configID;
                UserBoss.ins().bossHandler = model.handle;

                ViewManager.ins().open(BossBloodPanel);
            }
        }
    }

    private onDie() {
        if (this.isGwBoss || this.isGwTopBoss) {
            if (this.isRoleDie()) {
                ViewManager.ins().open(WorldBossBeKillWin);
            } else {
                ViewManager.ins().close(WorldBossBeKillWin);
            }
        }
    }

    public isRoleDie():boolean {
        let isDie = false;
        if(this.isGwTopBoss) {
            let role = EntityManager.ins().getNoDieRole();
            if(!role || role.infoModel.getAtt(AttributeType.atHp) <= 0) {
                isDie = true;
            }
        }
        if (UserBoss.ins().reliveTime > 0 || isDie) {
            return true;
        } else {
            return false;
        }
    }

    private onBossDisappear(entity) {
        if (this.isGwBoss || this.isGwTopBoss) {
            this.showView(false);

            if (!entity || !entity.infoModel || entity.infoModel.getAtt(AttributeType.atHp) <= 0) {

                this.isBossDie = true;
                ViewManager.ins().open(BossEndView);
            }
        }
    }

    private onHpChange() {
        if (this.isGwBoss || this.isGwTopBoss) {
            let charm: CharMonster = <CharMonster>EntityManager.ins().getEntityByHandle(UserBoss.ins().bossHandler);
            if (!charm || !charm.infoModel || charm.infoModel.getAtt(AttributeType.atHp) <= 0) {
                this.onBossDisappear(charm)
            }
        }
    }

    public canMove() {
        return !this.isBossDie;
    }

    static ins():GwBoss{
        return super.ins() as GwBoss;
    }
}

namespace GameSystem {
    export let  gwboss = GwBoss.ins.bind(GwBoss);
}