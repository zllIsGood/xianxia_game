/**
 * Created by hrz on 2017/8/14.
 */

class MineFight extends BaseClass implements IHejiUse {
    static ins(): MineFight {
        return super.ins() as MineFight;
    }

    constructor() {
        super();
    }

    isFighting: number = 0;//是否在战斗中
    range: number = 4;
    startPos: { x: number, y: number };

    private enemyPoints: number[][];
    private handles: number[];
    private _data: any; //type:0掠夺 1复仇 actorID(type=0)  index(type=1) id:矿id

    private _model: MineEnemyModel;

    start(data: any) {
        if (this.isFighting) {
            return;
        }

        this.isFighting = 1;
        this.handles = [];
        this._data = data;

        let entityList = EntityManager.ins().getAllEntity();
        let role: CharRole = EntityManager.ins().getNoDieRole();
        for (let handle in entityList) {
            let info = entityList[handle].infoModel;
            if (!info) continue;
            if (data.type == 0 && info.type == EntityType.Mine && info.actorID == data.actorID) {

            } else if (entityList[handle] != role) {
                entityList[handle].visible = false;
            }
        }

        this.setShowUI(false);

        UserSkill.ins().setHejiCD(6000);

        this.enemyPoints = this.getEnemyPoint();

        this.startPos = { x: role.x, y: role.y };

        let dir = DirUtil.get8DirBy2Point(this.startPos, {
            x: GameMap.grip2Point(this.enemyPoints[0][0]),
            y: GameMap.grip2Point(this.enemyPoints[0][1])
        });

        for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
            let tar = EntityManager.ins().getJobMainRole(i);
            if (!tar) {
                break;
            }
            if (i == 0) {
                tar.x = this.startPos.x;
                tar.y = this.startPos.y;
            } else {
                let grids = GameMap.getPosRangeRandom(this.startPos.x, this.startPos.y, DirUtil.dirOpposit(dir), i);
                tar.x = GameMap.grip2Point(grids[0]);
                tar.y = GameMap.grip2Point(grids[1]);
            }
            tar.dir = dir;
            tar.visible = true;
            tar.AI_STATE = AI_State.Stand;

            this.playTransferEffect(tar);

            this.handles.push(tar.infoModel.handle);
        }
    }

    stop() {
        if (!this.isFighting) return;
        this.isFighting = 0;
        this._model = null;
        HejiUseMgr.ins().unregister(this);

        TimerManager.ins().removeAll(this);

        let entityList = EntityManager.ins().getAllEntity();
        for (let handle in entityList) {
            if (entityList[handle].infoModel && entityList[handle].infoModel.type != EntityType.Monster)
                entityList[handle].visible = true;
        }

        for (let i = 0; i < this.handles.length; i++) {
            let handle = this.handles[i];
            EntityManager.ins().removeByHandle(handle);
        }

        this.resetRole();

        this.setShowUI(true);

        RoleAI.ins().stop();

        if (GameMap.sceneInMine() && Mine.ins().finishedData) {
            ViewManager.ins().open(MineRobWin, Mine.ins().finishedData);
        }
    }

    public resetRole(): void {

        MineData.ins().resetRole();

        let model: Role = SubRoles.ins().getSubRoleByIndex(0);
        let tar = EntityManager.ins().getEntityByHandle(model.handle) as CharRole;
        tar.x = this.startPos.x;
        tar.y = this.startPos.y;
        tar.AI_STATE = AI_State.Stand;
    }

    fightEnd(win: boolean) {
        if (win) this.fightWin();
        else this.fightFail();
    }

    private fightWin() {
        if (this._data == void 0) return;
        let id = this._data.id;
        if (GlobalConfig.KuangYuanConfig == void 0) return;
        let config = GlobalConfig.KuangYuanConfig[id];
        let awards = this.getAward(config);
        awards = this.getCountAward(awards);
        for (let award of awards) {
            if (award.type != 0) {
                Encounter.ins().postCreateDrop(DropHelp.tempDropPoint.x, DropHelp.tempDropPoint.y, award);
            }
        }

        let entityList = EntityManager.ins().getAllEntity();
        for (let handle in entityList) {
            let info = entityList[handle].infoModel;
            if (!info) continue;
            if (this._data.type == 0 && info.type == EntityType.Mine && info.actorID == this._data.actorID) {
                egret.Tween.get(entityList[handle]).to({ alpha: 0 }, 1000).call(() => {
                    entityList[handle].visible = false;
                    entityList[handle].alpha = 1;
                    egret.Tween.removeTweens(entityList[handle]);
                });
                break;
            }
        }

        let f: Function = () => {
            this.sendToServer(true);
            TimerManager.ins().doTimer(1000, 1, this.stop, this);

            let mylist: CharMonster[] = EntityManager.ins().getEntityByTeam(Team.My);
            for (let char of mylist) {
                char.stopMove();
                if (!(char instanceof CharRole)) {
                    //移除召唤怪
                    EntityManager.ins().removeByHandle(char.infoModel.handle);
                } else {
                    //播放消失特效特效
                    this.playTransferEffect(char);
                }
            }
            SoundUtil.ins().playEffect(SoundUtil.SCENE);
        };
        DropHelp.addCompleteFunc(f, this);
        DropHelp.start();
    }

    private fightFail() {
        this.sendToServer(false);
        Encounter.ins().postFightResult(0);
        TimerManager.ins().doTimer(2000, 1, () => {
            this.stop();
        }, this);
    }

    private sendToServer(win: boolean) {
        if (this._data.type == 0) {
            Mine.ins().sendRobResult(win, this._data.id, this._data.actorID);
        } else {
            Mine.ins().sendFightBackResult(win, this._data.index);
        }
    }

    private setShowUI(b: boolean) {
        if (!GameMap.sceneInMine()) return;

        MineData.ins().showTransfer(b);//屏蔽传送点

        Mine.ins().postMineFightState(b ? 1 : 0);
    }

    public getRoles(): Role[] {
        if (this._model) {
            return this._model.subRole;
        }
        return null;
    }

    public getSkillLvl(): number {
        if (this._model) {
            return this._model.hejiLvl;
        }
        return 0;
    }

    public getIsWeiShe(selfTargetIsMy: boolean): boolean {
        if (!this._model) return false;
        let model = this._model;
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
            name = this._model && this._model.subRole[0].name;
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

    createEnemy(model: MineEnemyModel) {
        this._model = model;
        let roles = model.getJobRoles();
        let mainRole = EntityManager.ins().getNoDieRole();
        HejiUseMgr.ins().register(this);

        for (let i = 0; i < roles.length; i++) {
            let role = roles[i];
            role.masterHandle = role.masterHandle * 10; // 避免真正的玩家进入场景造成masterHandle 混乱
            role.type = EntityType.Role;
            let grids = this.enemyPoints[i] || GameMap.getPosRangeRandom(mainRole.x, mainRole.y, mainRole.dir, this.range + i);
            role.x = GameMap.grip2Point(grids[0]);
            role.y = GameMap.grip2Point(grids[1]);
            role.dir = DirUtil.dirOpposit(mainRole.dir);

            let tar = GameLogic.ins().createEntityByModel(role, Team.WillEntity) as CharRole;
            tar.dir = DirUtil.dirOpposit(mainRole.dir);
            tar.AI_STATE = AI_State.Stand;
            tar.updateNeiGong();
            this.playTransferEffect(tar);

            this.handles.push(role.handle);
        }

        RoleAI.ins().start();
    }

    private createMainRole() {
        let subRole = SubRoles.ins().roles[0];
        subRole.type = EntityType.Role;
        subRole.x = this.startPos.x;
        subRole.y = this.startPos.y;
        let tar = GameLogic.ins().createEntityByModel(subRole, Team.My) as CharRole;
        tar.AI_STATE = AI_State.Stand;
        return tar;
    }

    private playTransferEffect(char) {
        var appearEff = new MovieClip();
        appearEff.playFile(`${RES_DIR_SKILLEFF}skill208`, 1);
        char.addChild(appearEff);
        char.playAction(EntityAction.ATTACK);
    }

    private getAward(config: KuangYuanConfig) {
        let rewards = config.rewards;
        let awards = [];
        let percent = config.robPrecent;
        for (let i = 0; i < rewards.length; i++) {
            let data = new RewardData();
            data.type = rewards[i].type;
            data.id = rewards[i].id;
            data.count = Math.ceil(rewards[i].count * percent / 100);

            if (this._data.type == 1) { //复仇翻倍奖励
                data.count *= 2;
            }
            awards.push(data);
        }
        return awards;
    }

    private getCountAward(awards) {
        let arr = [];
        for (let award of awards) {
            while (award.count > 0) {
                let data = new RewardData();
                data.type = award.type;
                data.id = award.id;
                data.count = award.count > 10 ? 10 : award.count;
                arr.push(data);

                award.count -= 10;
            }
        }
        return arr;
    }

    private getEnemyPoint(): number[][] {
        let role = EntityManager.ins().getNoDieRole();
        let px = GameMap.point2Grip(role.x);
        let py = GameMap.point2Grip(role.y);
        let points: any[][][] = [];
        let maxDir = 0;
        let maxCount = 0;

        let isAdd = Math.random() > 0.5;

        for (let i = 0; i < 8; i++) {
            let dir = isAdd ? i : (7 - i);
            for (let range = this.range; range < this.range + 3; range++) {
                let arr = GameMap.getPosRangeByDir(px, py, dir, range);
                if (arr[2]) {
                    points[dir] = points[dir] || [];
                    points[dir].push(arr);
                }
            }
            if (points[dir] && points[dir].length >= 3) {
                return points[dir];
            }
        }

        for (let i = 0; i < points.length; i++) {
            if (points[i] && points[i].length > maxCount) {
                maxCount = points[i].length;
                maxDir = i;
            }
        }

        return points[maxDir];

    }
}