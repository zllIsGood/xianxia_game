/**
 * Created by hrz on 2017/7/7.
 */

class EncounterFight extends BaseClass implements IHejiUse {

    public encounterIndex: number;

    public rolePositions: { [handle: number]: { x: number, y: number, dir: number } };

    private aiList: any = {};//将原来的ai全部放到这里

    private encounterList: any = {};

    //追血令实体玩家攻击对象
    public willEntityFightTeam: Team = Team.Monster;

    private zyRolePos: number[];//遭遇人刷点

    static ins(): EncounterFight {
        return super.ins() as EncounterFight;
    }

    public start(index: number) {
        if (Encounter.ins().isEncounter() || EntityManager.ins().getTeamCount(Team.WillBoss) > 0) {
            UserTips.ins().showTips("|C:0xf3311e&T:正在挑战附近的人|");
            return;
        }
        if (UserFb.ins().checkInFB()) return;
        Encounter.ins().canResult = true;
        this.encounterIndex = index;

        this.rolePositions = {};

        this.removeAllEncounter();

        RoleAI.ins().stop();

        DropHelp.clearDrop();

        UserSkill.ins().setHejiCD(6000);

        HejiUseMgr.ins().register(this);
        this.addCheckResult();

        let mylist: CharMonster[] = EntityManager.ins().getEntityByTeam(Team.My);
        for (let char of mylist) {
            char.stopMove();
            char.playAction(EntityAction.STAND);
            if ((char instanceof CharRole)) {
                this.rolePositions[char.infoModel.handle] = { x: char.x, y: char.y, dir: char.dir };

                //播放消失特效特效
                var appearEff = new MovieClip();
                appearEff.playFile(`${RES_DIR_SKILLEFF}skill208`, 1);
                char.addChild(appearEff);
                char.playAction(EntityAction.ATTACK);
            } else {
                EntityManager.ins().removeByHandle(char.infoModel.handle);
            }
        }

        // EntityManager.ins().resetRole();
        // for (let handle in this.rolePositions) {
        //     let char = EntityManager.ins().getEntityByHandle(handle);
        //     let pos = this.rolePositions[handle];
        //     char.x = pos.x;
        //     char.y = pos.y;
        //     char.dir = pos.dir
        // }

        TimerManager.ins().doTimer(800, 1, () => {
            DropHelp.clearDrop();
            this.addRole();
            (<NoticeView>ViewManager.ins().open(NoticeView)).showZhuixueling();
        }, this);

        this.clearOldAI();

        this.createEncounterAndMonster();

        SoundUtil.ins().playEffect(SoundUtil.SCENE);

    }

    //添加检查是否胜利 粗暴解决很小几率出现杀死地方卡住问题
    private addCheckResult() {
        TimerManager.ins().doTimer(1000, 0, this.checkResult, this);
    }

    private checkResult() {
        if (!Encounter.ins().isFindDrop) {
            if (EntityManager.ins().getTeamCount(Team.My,true) == 0 || EntityManager.ins().getTeamCount(Team.WillEntity,true) == 0) {
                if (EntityManager.ins().getTeamCount(Team.WillEntity) == 0) {
                    this.sendFightResult(1);
                } else {
                    this.sendFightResult(0);
                }
            }
        }
    }

    public sendFightResult(result: number) {
        if (result) {
            Encounter.ins().sendFightResult(result);
        } else {
            TimerManager.ins().doTimer(2000, 1, () => {
                Encounter.ins().sendFightResult(result);
            }, this);
        }
        Encounter.ins().postFightResult(result);
        TimerManager.ins().remove(this.checkResult, this);
    }

    public win() {
        let mylist: CharMonster[] = EntityManager.ins().getEntityByTeam(Team.My);
        for (let char of mylist) {
            char.stopMove();
            if (!(char instanceof CharRole)) {
                //移除召唤怪
                EntityManager.ins().removeByHandle(char.infoModel.handle);
            } else {
                //播放消失特效特效
                var appearEff = new MovieClip();
                appearEff.playFile(`${RES_DIR_SKILLEFF}skill208`, 1);
                char.addChild(appearEff);
                char.playAction(EntityAction.ATTACK);
            }
        }
        SoundUtil.ins().playEffect(SoundUtil.SCENE);
        TimerManager.ins().doTimer(800, 1, () => {
            let mylist: CharMonster[] = EntityManager.ins().getEntityByTeam(Team.My);
            for (let char of mylist) {
                EntityManager.ins().removeByHandle(char.infoModel.handle);
            }

            this.stop();
            this.fightEnd();

            if (GameMap.sceneInMain()) {
                this.resetPos();
                RoleAI.ins().start();
            }else{
                console.log("encounter fight win,but GameMap not in main")
            }
        }, this);
    }

    public lose() {
        SoundUtil.ins().playEffect(SoundUtil.SCENE);
        this.stop();
        this.fightEnd();
    }

    public fightEnd() {
        //打完自动打开追血令
        if (EncounterModel.redName < GlobalConfig.SkirmishBaseConfig.maxPkval && Encounter.ins().getEncounterLength())
            ViewManager.ins().open(LadderWin);
    }

    public stop() {
        if (this.encounterIndex == undefined) return;
        HejiUseMgr.ins().unregister(this);

        TimerManager.ins().removeAll(this);

        EntityManager.ins().resetRole();

        this.encounterIndex = undefined;
        this.willEntityFightTeam = Team.Monster;
        this.removeAllEncounter();
        for (let handle in this.aiList) {
            let char = EntityManager.ins().getEntityByHandle(handle);
            if (char && char.AI_STATE != AI_State.Die) {
                RoleAI.ins().add(char);
            }
        }
        this.aiList = {};
    }

    public resetPos() {
        let mylist = EntityManager.ins().getEntityByTeam(Team.My);
        for (let i in mylist) {
            let char = mylist[i];
            let pos = this.rolePositions[char.infoModel.handle];
            if (pos) {
                char.x = pos.x;
                char.y = pos.y;
            }

            var appearEff = new MovieClip();
            appearEff.playFile(`${RES_DIR_SKILLEFF}skill208`, 1);
            char.addChild(appearEff);
        }
        this.rolePositions = {};
    }

    public removeAllEncounter() {
        for (let handle in this.encounterList) {
            EntityManager.ins().removeByHandle(handle);
            delete this.encounterList[handle];
        }
    }

    private addRole() {

        let mylist: CharMonster[] = EntityManager.ins().getEntityByTeam(Team.My);
        for (let char of mylist) {
            EntityManager.ins().removeByHandle(char.infoModel.handle);
        }

        EntityManager.ins().resetRole();

        let master = EntityManager.ins().getNoDieRole();
        let rolePos = this.getRolePos();
        master.x = rolePos[0] * GameMap.CELL_SIZE;
        master.y = rolePos[1] * GameMap.CELL_SIZE;

        let list = EntityManager.ins().screeningTargetByPos(master);
        if (list[0]) {
            master.dir = DirUtil.get8DirBy2Point(master, list[0]);
        } else {
            let encounterModel = Encounter.ins().encounterModel[this.encounterIndex];
            if (encounterModel) {
                let len: number = encounterModel.subRole.length;
                Assert(false, `追血令找不到敌人，实际追血令数据人数：${len}`);
            }
        }

        let otherPos = EntityManager.ins().getMyOtherRolePos();
        mylist = EntityManager.ins().getEntityByTeam(Team.My);

        for (let i in mylist) {
            mylist[i].playAction(EntityAction.STAND);

            RoleAI.ins().add(mylist[i]);
            if (mylist[i] != master) {
                let handle = mylist[i].infoModel.handle;
                mylist[i].dir = master.dir;
                mylist[i].x = Math.floor(otherPos[handle].x);
                mylist[i].y = Math.floor(otherPos[handle].y);
            }

            var appearEff = new MovieClip();
            appearEff.playFile(`${RES_DIR_SKILLEFF}skill208`, 1);
            mylist[i].addChild(appearEff);
        }
    }

    public getRoles(): Role[] {
        let encounterModel = Encounter.ins().encounterModel[this.encounterIndex];
        return encounterModel && encounterModel.subRole;
    }

    public getSkillLvl(): number {
        let encounterModel = Encounter.ins().encounterModel[this.encounterIndex];
        return encounterModel && encounterModel.hejiLvl || 0;
    }

    public getIsWeiShe(selfTargetIsMy: boolean): boolean {
        let model = Encounter.ins().encounterModel[this.encounterIndex];
        if (!model) return false;
        if (selfTargetIsMy) {
            return Actor.weiWang > model.weiWang;
        } else {
            return Actor.weiWang < model.weiWang;
        }
    }

    public getWeiSheHurt(selfTargetIsMy: boolean): number {
        if (!this.getIsWeiShe(selfTargetIsMy)) return 0;
        let rankList = Rank.ins().getRankModel(RankDataType.TYPE_WEIWANG);
        let name = '';
        if (selfTargetIsMy) {
            name = Actor.myName;
        } else {
            let model = Encounter.ins().encounterModel[this.encounterIndex];
            name = model.subRole[0].name;
        }

        let rank = 0;
        if (rankList) {
            for (let i = 0; i < 3; i++) {
                let data = rankList.getDataList(i);
                if (data && data.player == name) {
                    rank = data.pos;
                    break;
                }
            }
        }

        return GlobalConfig.PrestigeBase.rankDeterDam[rank - 1] || GlobalConfig.PrestigeBase.normalDeterDam;
    }

    //获取主角坐标
    private getRolePos() {
        let range = GlobalConfig.SkirmishBaseConfig.range;

        return GameMap.getPosRange(this.zyRolePos[0], this.zyRolePos[1], range);
    }

    public clearOldAI() {
        this.aiList = RoleAI.ins().getAIList();
        RoleAI.ins().clearAIList();
    }

    public createEncounterAndMonster() {
        let zyPos = UserFb.ins().zyPos;
        let index: number = Math.floor(Math.random() * zyPos.length);
        let zyData = zyPos[index];
        //创建怪物
        let zyRolePos = zyData[0];
        this.zyRolePos = zyRolePos;
        let monsterId = UserFb.ins().waveMonsterId[0];
        let monsterPos = zyData[1];

        for (let i = 0; i < monsterPos.length; i++) {
            let entityModel: EntityModel = UserFb.ins().createMonster(monsterId); 0
            entityModel.x = monsterPos[i][0] * GameMap.CELL_SIZE;
            entityModel.y = monsterPos[i][1] * GameMap.CELL_SIZE;
            let monster = GameLogic.ins().createEntityByModel<CharMonster>(entityModel);
            monster.AI_STATE = AI_State.Patrol;

            this.encounterList[monster.infoModel.handle] = monster;
        }

        let encounterModel = Encounter.ins().encounterModel[this.encounterIndex];

        let len: number = encounterModel.subRole.length;
        for (let i: number = 0; i < len; i++) {
            let role: Role = encounterModel.subRole[i];
            if (role) {
                role.setAtt(AttributeType.atHp, role.getAtt(AttributeType.atMaxHp));
                role.setAtt(AttributeType.atMp, role.getAtt(AttributeType.atMaxMp));

                role.type = EntityType.Role;
                role.x = zyRolePos[0] * GameMap.CELL_SIZE + Math.floor(i * 40 * Math.random());
                role.y = zyRolePos[1] * GameMap.CELL_SIZE + Math.floor(i * 40 * Math.random());
                let tar = GameLogic.ins().createEntityByModel(role, Team.WillEntity) as CharRole;
                tar.AI_STATE = AI_State.Stand;
                tar.updateNeiGong();

                this.encounterList[role.handle] = tar;
            }
        }

        RoleAI.ins().start();

    }
}

namespace GameSystem {
    export let encounterFight = EncounterFight.ins.bind(EncounterFight);
}