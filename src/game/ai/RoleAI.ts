/**
 * Created by Administrator on 2016/8/28.
 */
class RoleAI extends BaseClass {
    static PUBLIC_CD: number = 640;
    /** AI循环时间 */
    static AI_UPDATE_TIME: number = 30;

    private inited: boolean;

    private aiList: Map<CharMonster> = {};
    /** 技能cd */
    private skillCD: Map<Map<number>>;
    private curSkill: Map<SkillData>;
    private curTarget: Map<CharMonster>;
    private passive: any = {};

    //保存上次使用技能类型
    private skillCastType: Map<number>;
    private skillTargetType: Map<number>;
    //报存上次攻击的敌方目标
    private lastTarget: Map<number>;//{[handle:number] : handle}

    private teamAction: Map<boolean>;

    private atkTarget: {};

    //冰魂技能 低于50%血的只飘一次气泡
    private hashHpObj: Map<number>;

    //主角攻击的怪的handel
    private mainAttrHandel: number;

    /** 属性触发的效果 cd  非技能*/
    private attrCD: Map<Map<number>>;
    private attrValue: Map<Map<number>>;

    private isStartAtk: boolean;

    private zhanlingTime: number = 0;
    private zhanlingdelayTime: number = 0;

    private static roleHangup: boolean = true;

    // public isFindDrop: boolean = false;
    public static SEND_TASK_TYPE: number = 68;

    public static ins(...args: any[]): RoleAI {
        return super.ins(args) as RoleAI;
    }

    public init(): void {
        this.stop();
        this.skillCD = {};
        this.attrCD = {};
        this.attrValue = {};
        this.inited = true;
    }

    /** 开启AI */
    public start() {

        this.isStartAtk = false;
        GameLogic.ins().postHookStateChange(GameLogic.HOOK_STATE_FIND_ENMENY);

        this.teamAction = {};

        if (this.starting)
            return;

        if (!this.inited)
            this.init();

        this.addAITimer();
    }

    //调试用
    public togglePause(): void {
        // if (this.starting) {
        //     this.stopAITimer();
        //     UserTips.ins().showTips("暂停挂机!");
        // }
        // else {
        //     this.addAITimer();
        //     UserTips.ins().showTips("继续挂机!");
        // }
    }

    /** 关闭AI */
    public stop() {
        if (this.inited) {
            this.stopAITimer();
        }
        // this.aiList = {};
        this.skillCD = {};
        for (let handle in this.curSkill) {
            if (this.curSkill[handle]) ObjectPool.push(this.curSkill[handle]);
        }
        this.curSkill = {};
        this.curTarget = {};
        this.lastTarget = {};
        this.skillCastType = {};
        this.skillTargetType = {};
        this.hashHpObj = {};
        this.atkTarget = {};
        this.passive = {};
        // TimerManager.ins().removeAll(this); //不能移除所有，否则小概率出现已死亡的怪物不会死
        // debug.log('ai清空了');
    }

    public clearTarget(target) {
        if (target && target.infoModel) {
            let handle = target.infoModel.handle;
            delete this.skillCD[handle];
            let skill = this.curSkill[handle];
            if (skill) {
                ObjectPool.push(skill);
            }
            delete this.curSkill[handle];
            delete this.curTarget[handle];
            delete this.lastTarget[handle];
            delete this.skillCastType[handle];
            delete this.skillTargetType[handle];
            delete this.atkTarget[handle];
            delete this.passive[handle];

            for (let key in this.curTarget) {
                if (this.curTarget[key] == target) {
                    delete this.curTarget[key];
                }
            }
            for (let key in this.lastTarget) {
                if (key + "" == handle + "") {
                    delete this.lastTarget[key];
                }
            }
        }
    }

    public clearAIList(): void {
        this.aiList = {};
    }

    public clear() {
        this.stop();
        this.clearAIList();
        // this.isFindDrop = false;
        TimerManager.ins().removeAll(this);
    }

    public destruct(): void {
        this.skillCD = {};
        this.stop();
    }

    public get starting(): boolean {
        return TimerManager.ins().isExists(this.startAI, this);
    }

    public add(char): void {
        this.aiList[char.infoModel.handle] = char;
    }

    public remove(char): void {
        delete this.aiList[char.infoModel.handle];
    }

    public getAIList() {
        return this.aiList;
    }

    /** 开始AI */
    private startAI() {
        // console.log("startAI");
        let list: any = this.aiList;
        let jobNames: string[] = ["0", "战士", "法师", "术士"];
        let master: CharRole = EntityManager.ins().getNoDieRole();
        let poxIndex: number = 0;
        for (let i in list) {

            let selfTarget: CharMonster = list[i];
            let isRole: boolean = selfTarget instanceof CharRole;
            if (isRole && !RoleAI.roleHangup) continue;

            if (selfTarget.action == EntityAction.FLY) continue;

            let target: CharMonster;
            let handle: any = selfTarget.infoModel.handle;
            let jobName: string = isRole ? jobNames[(selfTarget.infoModel as Role).job] : "";

            // if (jobName != "")
            //     this.trace(jobName + "---" + handle + ",状态" + AI_State[selfTarget.AI_STATE]);

            //buff伤害

            let selfBuffList: any = selfTarget.buffList;

            for (let groupID in selfBuffList) {
                //自己已经死亡
                if (this.checkTargetDead(selfTarget))
                    break;
                let buff: EntityBuff = selfBuffList[groupID];
                let t: number = egret.getTimer();
                if (buff.effConfig.type == SkillEffType.AddBlood ||
                    buff.effConfig.type == SkillEffType.AdditionalDamage) {

                    let isExecute: boolean = t - buff.addTime > buff.step * buff.effConfig.interval;
                    if (isExecute) {
                        buff.step++;
                        let d: boolean = this.hramedDie(selfTarget, buff.value);
                        if (d)
                            selfTarget.AI_STATE = AI_State.Die;
                        this.showHram(d, DamageTypes.HIT, selfTarget, buff.source, buff.value, true, false, "buff伤害" + buff.effConfig.id);
                        if (buff.step >= buff.count)
                            selfTarget.removeBuff(buff);
                    }
                }

                if (buff.effConfig.type != SkillEffType.Summon && t >= buff.endTime) {
                    selfTarget.removeBuff(buff);
                }
            }
            //自己已经死亡
            if (this.checkTargetDead(selfTarget))
                continue;
            //如果是处于硬直状态 || 晕眩
            if (selfTarget.isHardStraight || selfTarget.hasBuff(51001) || selfTarget.hasBuff(70001)) {
                selfTarget.stopMove();
                this.curTarget[selfTarget.infoModel.handle] = null;
                continue;
            }

            //使用必杀技能
            let userSkill = UserSkill.ins();
            let entityMgs = EntityManager.ins();
            let hejiMgs = HejiUseMgr.ins();
            if (selfTarget.infoModel.team == Team.My && userSkill.hejiLevel > 0 && userSkill.hejiEnable && (selfTarget.infoModel instanceof Role)) {
                if (master && selfTarget.infoModel.handle == master.infoModel.handle) {
                    target = this.curTarget[handle];
                    let skill = userSkill.getHejiSkillId();
                    if (userSkill.fieldUse && skill.id != 0 && target && target.team != Team.My && target.AI_STATE != AI_State.Die) {
                        let tempArr = entityMgs.screeningTargetByPos(selfTarget, false, skill.affectCount, skill.castRange);
                        if (tempArr.length) {
                            this.useSkill(selfTarget, target, skill);
                            userSkill.fieldUse = false;
                            let config: EffectsConfig = GlobalConfig.EffectsConfig[skill.selfEff[0]] ? GlobalConfig.EffectsConfig[skill.selfEff[0]] : null;
                            if (config) {
                                let len = SubRoles.ins().subRolesLen;
                                for (let i: number = 0; i < len; i++) {
                                    let roleData: CharRole = entityMgs.getMainRole(i);
                                    if (roleData) {
                                        let buff: EntityBuff = ObjectPool.pop('EntityBuff');
                                        buff.effConfig = config;
                                        buff.addTime = egret.getTimer();
                                        buff.endTime = buff.addTime + config.duration;
                                        buff.count = (config.duration / config.interval) >> 0;
                                        buff.step = 0;
                                        buff.source = roleData;
                                        roleData.addBuff(buff);

                                        roleData.stopMove();
                                        if (roleData != master) {
                                            roleData.playAction(EntityAction.STAND);
                                        }
                                        roleData.AI_STATE = AI_State.Stand;
                                    }
                                }
                            }
                            continue;
                        }
                    }
                }
            } else if (selfTarget.infoModel.team == Team.WillEntity && hejiMgs.canUse()) {
                target = this.curTarget[handle];
                let enemyMaster = hejiMgs.getMaster();
                if (target && target.team == Team.My && enemyMaster == selfTarget) {
                    let skill = hejiMgs.getSkillData();
                    if (skill && target.AI_STATE != AI_State.Die) {
                        let tempArr = entityMgs.screeningTargetByPos(selfTarget, false, skill.affectCount, skill.castRange);
                        if (tempArr.length) {
                            this.useSkill(selfTarget, target, skill);
                            hejiMgs.useSuccess();
                            let config: EffectsConfig = GlobalConfig.EffectsConfig[skill.selfEff[0]] ? GlobalConfig.EffectsConfig[skill.selfEff[0]] : null;
                            if (config) {
                                let roles = hejiMgs.getRoles();
                                let len = roles.length;
                                for (let i: number = 0; i < len; i++) {
                                    let roleData: CharRole = entityMgs.getEntityByHandle(roles[i].handle);
                                    if (roleData) {
                                        let buff: EntityBuff = ObjectPool.pop('EntityBuff');
                                        buff.effConfig = config;
                                        buff.addTime = egret.getTimer();
                                        buff.endTime = buff.addTime + config.duration;
                                        buff.count = (config.duration / config.interval) >> 0;
                                        buff.step = 0;
                                        buff.source = roleData;
                                        roleData.addBuff(buff);

                                        roleData.stopMove();
                                        if (roleData != enemyMaster) {
                                            roleData.playAction(EntityAction.STAND);
                                        }
                                        roleData.AI_STATE = AI_State.Stand;
                                    }
                                }
                            }
                            continue;
                        }
                    }
                }
            }
            //是否在公共cd中
            if (isRole) {
                if (selfTarget.publicCD && egret.getTimer() - selfTarget.publicCD <= RoleAI.PUBLIC_CD)
                    continue;
            } else {
                // let monSkillCd: SkillData;
                // if (selfTarget.team == Team.My) {
                //     monSkillCd = new SkillData(80001);
                // } else {
                //     monSkillCd = new SkillData(50000);
                // }
                if (selfTarget.publicCD && egret.getTimer() - selfTarget.publicCD <= RoleAI.PUBLIC_CD) //技能后摇
                    continue;
                // if (selfTarget.publicCD && egret.getTimer() - selfTarget.publicCD <= selfTarget.infoModel.getAtt(AttributeType.atAttackSpeed))
                //     continue;
            }

            // if (RoleAI.ins().isFindDrop && selfTarget.team == Team.My) {
            //     if (master && selfTarget.infoModel.handle == master.infoModel.handle) {
            //         continue;
            //     }
            // }

            let userFb = UserFb.ins();
            switch (selfTarget.AI_STATE) {
                case AI_State.Stand:
                    //选择技能

                    this.screeningSkill(handle);

                    let isNoUseSkill = false; //没有可使用的技能
                    let isFollowMaster = false; //是否跟随主人
                    
                    if (!this.curSkill[handle]) {
                        if (selfTarget.infoModel.type == EntityType.HuanShouMonster) {
                            let index = EntityManager.ins().getNoDieRoleIndex();
                            if (index == -1) {
                                //主角全死
                                //删除幻兽
                                //EntityManager.ins().removeByHandle(selfTarget.infoModel.handle);
                                continue;
                            }
                            let role = EntityManager.ins().getMainRole(index);
                            if (role) {
                                let p = DirUtil.getGridByDir(role.dir + (index == 1 ? 1 : -1));
                                //无目标时跟随主角
                                GameMap.moveEntity(selfTarget, role.x + p.x, role.y + p.y);
                            }
                        }
                        if (selfTarget.team != Team.My) {
                            continue;
                        }
                        else {
                            isNoUseSkill = true;
                        }
                    }

                    if (!this.curSkill[handle] && selfTarget.publicCD && egret.getTimer() - selfTarget.publicCD > RoleAI.PUBLIC_CD) {
                        isNoUseSkill = true;
                    }

                    //是否可选怪
                    if (!isNoUseSkill && this.checkCanScreeningTarget(selfTarget, this.curSkill[handle], this.curTarget[handle])) {
                        if (selfTarget.team == Team.WillEntity) {
                            this.screeningTarget(selfTarget, 9);//野外玩家寻怪范围
                        } else {
                            this.screeningTarget(selfTarget);
                        }
                    }

                    if (selfTarget.team == Team.My && selfTarget != master && master) {
                        if (MathUtils.getDistance(selfTarget.x, selfTarget.y, master.x, master.y) > 250) {
                            let masterTarget = this.curTarget[master.infoModel.handle];
                            if (masterTarget && masterTarget.AI_STATE != AI_State.Die) {
                                if (this.curSkill[handle] && this.curSkill[handle].targetType == TargetType.Enemy && masterTarget.team != Team.My) {
                                    this.curTarget[handle] = masterTarget;
                                } else {
                                    isFollowMaster = true;
                                }
                            } else {
                                isFollowMaster = true;
                            }
                        }
                    }
                    
                    if (isNoUseSkill && isFollowMaster) {
                        if (selfTarget.team == Team.My && selfTarget != master && master) {
                            //跟随主人身后一到两个范围
                            let selfMaster = master;
                            if (selfTarget.infoModel.masterHandle) {
                                let ms = entityMgs.getEntityByHandle(selfTarget.infoModel.masterHandle);
                                if (ms) {
                                    selfMaster = ms;
                                }
                            }
                            let count = entityMgs.getTeamCount(Team.My);
                            let dirs = [1, -1];
                            if (count == 2) {
                                dirs = [0];
                            }
                            let p = DirUtil.getGridByDir(selfMaster.dir + dirs[poxIndex] != null ? dirs[poxIndex] : 0);
                            poxIndex += 1;

                            GameMap.moveEntity(selfTarget, selfMaster.x + p.x, selfMaster.y + p.y);
                        }
                        continue;
                    }

                    if (!this.curTarget[handle]) {
                        if (selfTarget.team == Team.My && EntityManager.ins().getEntityByTeam(Team.Monster).length + EntityManager.ins().getEntityByTeam(Team.WillEntity).length == 0) {
                            GameLogic.ins().createGuanqiaMonster(false);
                        }
                        continue
                    }

                    if (this.tryUseSkill(selfTarget)) {
                        selfTarget.stopMove();
                        selfTarget.AI_STATE = AI_State.Atk;
                    }
                    else {
                        selfTarget.AI_STATE = AI_State.Stand;
                        if (selfTarget.team == Team.My ||
                            selfTarget.team == Team.WillEntity ||
                            selfTarget.team == Team.Faker ||
                            // this.teamAction[selfTarget.team] ||
                            this.atkTarget[handle]) {
                            // //开始追踪目标，此处会改变self的状态-->RUN
                            // if (selfTarget.team == Team.Monster) {
                            //     //把目标点随机不同的点
                            //     let point = this.getTargetMonsterPoint(selfTarget,this.curTarget[handle]);
                            //     GameMap.moveEntity(selfTarget, point.x, point.y);
                            // } else {
                            //     GameMap.moveEntity(selfTarget, this.curTarget[handle].x, this.curTarget[handle].y);
                            // }
                            GameMap.moveEntity(selfTarget, this.curTarget[handle].x, this.curTarget[handle].y);
                            selfTarget.AI_STATE = AI_State.Run;
                        }
                    }
                    break;

                case AI_State.Run:
                    target = this.curTarget[handle];
                    if (selfTarget.team == Team.My) userFb.canChallengGuanQia = true;
                    if (!target || this.checkTargetDead(target)) {
                        selfTarget.stopMove();
                        selfTarget.playAction(EntityAction.STAND);
                        selfTarget.AI_STATE = AI_State.Stand;
                        delete this.curTarget[handle];
                        this.trace(`${jobName}:目标阵亡，重新选择目标`);
                        continue;
                    }
                    else {
                        if (selfTarget.team == Team.Faker) {
                            let encounter = Encounter.ins();
                            //假人打完足够的怪 走到目的地 删除
                            let wildData: WildPlayerData = encounter.wildPersonList[selfTarget.infoModel.masterHandle];
                            if (!wildData) continue;
                            //闯关的假人 杀到足够数量的怪返回终点 移除
                            let killNum: number = EncounterModel.countKillNumByMarster(selfTarget.infoModel.masterHandle);
                            let juli: number = MathUtils.getDistance(selfTarget.x, selfTarget.y, wildData.backX, wildData.backY);
                            if (wildData && wildData.actionType == 1 && killNum >= wildData.killNum) {
                                if (juli < 10) {
                                    entityMgs.removeByHandle(selfTarget.infoModel.masterHandle);
                                    encounter.RunAwary(selfTarget.infoModel.masterHandle);
                                    encounter.sendCleanWildPeople(wildData.index);
                                } else {
                                    GameMap.moveEntity(selfTarget, wildData.backX, wildData.backY);
                                }
                                continue;
                            }
                        }
                        if (this.tryUseSkill(selfTarget)) {
                            selfTarget.stopMove();
                            selfTarget.AI_STATE = AI_State.Atk;
                        }
                        //走到目的地了，但是怪物不在攻击距离
                        // if (selfTarget.action == EntityAction.STAND) {
                        //     selfTarget.AI_STATE = AI_State.Stand;
                        // }
                    }
                    break;

                case AI_State.Atk:
                    if (!this.isStartAtk)
                        GameLogic.ins().postHookStateChange(GameLogic.HOOK_STATE_HOOK);
                    this.isStartAtk = true;

                    target = this.curTarget[handle];

                    if (!target || this.checkTargetDead(target)) {
                        selfTarget.AI_STATE = AI_State.Stand;
                        delete this.curTarget[handle];
                        continue;
                    }

                    // if (target.getRealHp() <= 0) {
                    //     egret.error("error: target is Die!!");
                    // }

                    // if (target instanceof CharMonster)
                    //     console.log(`${target.infoModel.handle} ---- ${target.AI_STATE} ${target.AI_STATE == AI_State.Die}`);

                    this.teamAction[target.team] = true;
                    this.atkTarget[target.infoModel.handle] = true;
                    if (selfTarget.atking)
                        continue;

                    let skill = this.curSkill[handle];
                    if (!skill) continue;
                    //保存最后一次使用技能的时间
                    this.skillCD[handle][skill.id] = egret.getTimer();

                    this.skillCastType[handle] = skill.castType;
                    this.skillTargetType[handle] = skill.targetType;

                    selfTarget.atking = true;
                    if (selfTarget.team == Team.My) userFb.canChallengGuanQia = false;
                    //记录最后一次公共cd时间
                    selfTarget.publicCD = egret.getTimer();

                    GameLogic.skyBallCheck(selfTarget);
                    //使用攻击技能
                    this.useSkill(selfTarget, target, skill);
                    //清空当前技能
                    delete this.curSkill[handle];
                    break;
                case AI_State.Patrol:
                    let configID = selfTarget.infoModel.configID;
                    let config = userFb.guanqiaMonster[configID];
                    if (selfTarget.infoModel.isWander && config.attrange) {
                        this.screeningTarget(selfTarget, config.attrange);
                        if (this.curTarget[selfTarget.infoModel.handle]) {
                            selfTarget.AI_STATE = AI_State.Stand;
                        } else {
                            selfTarget.startPatrol();
                        }
                    } else {
                        selfTarget.startPatrol();
                    }
                    break;
            }
        }
    }

    private checkShowZhanling() {
        this.zhanlingTime = egret.getTimer();
        if (!GameMap.sceneInMain()) return;
        let skinId = ZhanLingModel.ins().ZhanLingSkinId;
        if (ZhanLingModel.ins().getZhanLingDataById(0)) {
            let role = EntityManager.ins().getNoDieRole();
            if (role) {
                let lv = ZhanLingModel.ins().getZhanLingDataById(0).level;
                role.showZhanling(skinId, lv);

                //副本外，客户端战斗中，出现天仙时，需要走下出天仙的特殊技能逻辑
                // if (GameMap.fubenID == 0) {
                ExSkillAiLogic.ins().checkWarSpiritBubbleTrigger();
                // }

            }
        }
    }

    private checkCanScreeningTarget(selfTarget: CharMonster, skill: SkillData, curTarget: CharMonster): boolean {
        if (skill == null)
            return false;
        //目前不存在或已死亡
        if (!curTarget || !curTarget.parent || this.checkTargetDead(curTarget)) {
            return true;
        }
        let handle = selfTarget.infoModel.handle;
        //上次没有使用技能
        if (this.skillCastType[handle] == undefined && this.skillTargetType[handle] == undefined) {
            return true;
        }
        //上次使用技能和本次技能类型不一样
        if (this.skillCastType[handle] != skill.castType || this.skillTargetType[handle] != skill.targetType) {
            return true;
        }
        return false;
    }

    private getTargetMonsterPoint(selfTarget: CharMonster, target: CharMonster): { x: number, y: number } {
        if (selfTarget.x == target.x) {
            return { x: target.x, y: target.y };
        }
        let k = (target.y - selfTarget.y) / (target.x - selfTarget.x);
        let x = target.x;
        let y = target.y;
        let fixMax = 60;
        let fixMin = 20;
        if (Math.abs(k) <= 1) {
            if (k < 0) {
                y += Math.floor(fixMax * Math.random());
            } else {
                y -= Math.floor(fixMax * Math.random());
            }
            x += Math.floor(fixMin * Math.random());
        } else {
            if (k < 0) {
                x += Math.floor(fixMax * Math.random());
            } else {
                x -= Math.floor(fixMax * Math.random());
            }
            y += Math.floor(fixMin * Math.random());
        }

        return { x: x, y: y };
    }

    /**
     * 使用技能
     */
    public useSkill(selfTarget: CharMonster, target: CharMonster, skill: SkillData) {
        AttrSkills.triggerHuanshouAtkBuff(selfTarget);

        let skillEff: EffectsConfig = skill.tarEff ? GlobalConfig.EffectsConfig[skill.tarEff[0]] : null;

        let selfSkillEff: EffectsConfig = skill.selfEff ? GlobalConfig.EffectsConfig[skill.selfEff[0]] : null;

        let pTarget: CharMonster = skill.castType == castType.Self ? selfTarget : target;
        let tempArr: CharMonster[];

        let critAdd: number = 0;
        let ImbaData: ImbaSkillReviseConfig;
        let gwSkillConfig: GWSkillReviseConfig;
        let gwSkills;
        let isYlBullet: boolean = false;//是否烈焰戒指子弹

        let selfInfo = selfTarget.infoModel as EntityModel;


        if (selfTarget.team == Team.My) {
            ImbaData = Artifact.ins().getReviseBySkill(skill.id);
            if (ImbaData) {
                critAdd = ImbaData.crit;
            }

            gwSkills = GodWeaponCC.ins().getReviseBySkill(skill.id)
            if (gwSkills) {
                gwSkillConfig = gwSkills[0];
            }
            if (gwSkillConfig) {
                critAdd = gwSkillConfig.crit;
            }
        }

        let affectCount = skill.affectCount;
        if (ImbaData && ImbaData.affectCount) {
            affectCount += ImbaData.affectCount;
        }
        if (gwSkillConfig && gwSkillConfig.affectCount) {
            affectCount += gwSkillConfig.affectCount;
        }

        let entityMgs = EntityManager.ins();
        //己方血最少
        if (skill.castType == castType.SelfHpLess) {
            tempArr = entityMgs.screeningTargetByPos(selfTarget, true);
            for (let m: number = 0; m < tempArr.length; m++) {
                if (tempArr[m].isCanAddBlood) {
                    tempArr[0] = tempArr[m];
                    break;
                }
            }
        }
        else {
            //施法目标是友方，但是作用目标是敌方的
            if (skill.castType != castType.Other && skill.targetType == TargetType.Enemy) {
                tempArr = entityMgs.screeningTargetByPos(pTarget, false, affectCount, skill.affectRange);
            } else {
                tempArr = affectCount > 1 ? entityMgs.screeningTargetByPos(pTarget, pTarget.team == target.team, affectCount, skill.affectRange) : [target];
            }

            if (tempArr.length == 0) {
                tempArr = [target];
            }
        }

		let hasCrit: boolean = false;//是否有暴击
        if (skill.preId && GlobalConfig.FlameStamp.skillId.indexOf(skill.preId) >= 0) {
            isYlBullet = true;
        }

        let len = tempArr.length = Math.min(tempArr.length, affectCount);
        let hitTargetInfo: {
            isDie: boolean,
            damageType: number,
            ttarget: CharMonster,
            hramValue: number,
        }[][] = [];

        for (let j: number = 0; j < len; j++) {
            let ttarget: CharMonster = tempArr[j];
            let tarInfo = ttarget.infoModel as EntityModel;
            let isSiZhou: boolean = false;
            let isMainTar: boolean = j == 0;//是否主目标
            if (ttarget.team != selfTarget.team) {
                this.atkTarget[ttarget.infoModel.handle] = true;
                let effBuff: EntityBuff;

                //晕眩
                if (GameLogic.triggerAttr(selfTarget, AttributeType.atStunPower) || skill.id == 90005) {
                    effBuff = ObjectPool.pop('EntityBuff');
                    effBuff.effConfig = GlobalConfig.EffectsConfig[51001];
                    effBuff.value = selfTarget.infoModel.getAtt(AttributeType.atStunTime);
                    effBuff.addTime = egret.getTimer();
                    effBuff.endTime = effBuff.addTime + effBuff.value;
                    ttarget.addBuff(effBuff);
                    // ttarget.playAction(EntityAction.HIT);
                    ttarget.stopMove();
                    ttarget.AI_STATE = AI_State.Stand;
                }
                //死咒 //神力
                if (GameLogic.triggerExAttr(selfTarget, ExAttributeType.eatDeathCurseProbability)) {
                    effBuff = ObjectPool.pop('EntityBuff');
                    effBuff.effConfig = GlobalConfig.EffectsConfig[52001];
                    effBuff.addTime = egret.getTimer();
                    effBuff.endTime = effBuff.effConfig.args.d ? selfTarget.infoModel.attributeExData[ExAttributeType.eatDeathCurseTime] : effBuff.effConfig.duration;
                    ttarget.addBuff(effBuff);
                    selfTarget.addPaoPao(3);
                    isSiZhou = true;
                }

                if (GameLogic.triggerExAttr(selfTarget, ExAttributeType.eatAttackAddHpProbability)) {
                    //TODO:回血后续修改
                    // let recoveHp: number = selfTarget.infoModel.attributeExData[ExAttributeType.eatAttackAddHpValue];
                    // let curHp = selfTarget.infoModel.getAtt(AttributeType.atHp) + recoveHp;
                    // let maxHp: number = selfTarget.infoModel.getAtt(AttributeType.atMaxHp);
                    //
                    // curHp = curHp > maxHp ? maxHp : curHp;
                    // selfTarget.infoModel.setAtt(AttributeType.atHp, curHp);
                    // if (ttarget instanceof CharRole) {
                    //     console.log(1,ttarget.infoModel.handle,'回血：',recoveHp,"剩余血量：",curHp);
                    // }
                    // this.showHram(false,DamageTypes.HIT, selfTarget, selfTarget, -recoveHp);
                    // selfTarget.addPaoPao(5);
                }
            }

            let isCrit: boolean = false;
            let isLucky: boolean = false;
            let isMultipleCrit: boolean = false;//疾风斩
            let isMiss: boolean = false;//是否闪避
            let isWeishe: boolean = false;//是否威慑
            let hramValue: number = 0;
            let isZhiMing: boolean = false;//是否致命一击
            let islianji = false;
            let isHearth: any;//心法3效果
            let isZhuiMing: boolean = false;//是否追命

            //不是必杀就计算是否闪避
            if (skill.calcType != 3) {
                isMiss = GameLogic.triggerMiss(selfTarget, ttarget);
            }

            if (isMiss) {
                hramValue = 0;
                // selfTarget.addPaoPao(4);
            } else {

                // isLucky = GameLogic.triggerExAttr(selfTarget, ExAttributeType.eatMultipleCrit);

                //计算基础伤害
                hramValue = this.damageBaseCalculation(selfTarget, ttarget, skill);

                //非合击伤害
				if (skill.calcType != 3) {
                    isMultipleCrit = GameLogic.triggerExAttr(selfTarget, ExAttributeType.eatMultipleCrit);
                    if (isMultipleCrit) {
                        hramValue = hramValue * (selfTarget.infoModel.getExAtt(ExAttributeType.eatMultipleCritCoeff) / 10000);
                        hramValue += selfTarget.infoModel.getExAtt(ExAttributeType.atMultipleCritHurt);
                        selfTarget.addPaoPao(21);
                    }

            
                    isCrit = GameLogic.triggerCrit(selfTarget, target, critAdd);
                    let useSkyBall = selfTarget.hasBuff(SkillConst.EFF_SKY_BALL)
                    if (useSkyBall) {
						selfTarget.addPaoPao(6);
						isCrit = true;
					}

                    let addDamage: number = 0;//附加伤害
                    let addPer: number = 1;//伤害增加比例

                    let isHuanShouCrit = AttrSkills.triggerHuanShouCrit(selfTarget);//幻兽暴击
                    islianji = AttrSkills.triggerHuanshouLianJi(selfTarget);
                    let hsEnhance = AttrSkills.triggeratHSDamageEnhance(selfTarget, hramValue);
                    hramValue += hsEnhance;
                    if (islianji) {
                        let ratio = 2;
                        hramValue = hramValue * ratio;
                    }

                    if (useSkyBall) {
                        selfTarget.addPaoPao(6);
                        isCrit = true;
                        
                    }
                    if (isCrit) {
                        hasCrit = true;

                        let critDamage = selfTarget.infoModel.getAtt(AttributeType.atCritEnhance);
                        if (gwSkillConfig && gwSkillConfig.critDamage) {//神兵增加暴击伤害%
                            critDamage += gwSkillConfig.critDamage;
                        }

                        //玉佩技能 目标生命低于百分比时候，暴击伤害增加
						let critHp = selfInfo.getExAtt(ExAttributeType.eatCritHpLt);
						if (tarInfo.getAtt(AttributeType.atHp) / tarInfo.getAtt(AttributeType.atMaxHp) <= critHp / 10000) {
							critDamage += selfInfo.getExAtt(ExAttributeType.eatCritHpLtAddDamage);
						}
                        hramValue = hramValue * (critDamage) / 10000;
                        hramValue += selfTarget.infoModel.getAtt(AttributeType.atCritHurt);
                    }

                    let exAttr = {};//计算buff的概率
                    exAttr[AttributeType.atDeadLyPro] = GameLogic.calculateRealAttribute(selfTarget, AttributeType.atDeadLyPro, selfTarget);
                    isZhiMing = GameLogic.triggerAttr(selfTarget, AttributeType.atDeadLyPro, exAttr) || isHuanShouCrit;
                    if (isZhiMing) {
                        addPer += 0.5 + (selfInfo.getAtt(AttributeType.atDeadLyMaster) - tarInfo.getAtt(AttributeType.atDeadLyResist)) / 10000;
                    }

                    //心法固定伤害 心法伤害率
					isHearth = this.tryTriggerHeart(selfTarget);//GameLogic.triggerAttr2(selfTarget, AttributeType.atHearthCount);
					if (isHearth) {
						addPer += selfInfo.getAtt(AttributeType.atHearthHurt) / 10000;
						addDamage += selfInfo.getAtt(AttributeType.atHearthDamege);
                    }
                    
                    hramValue = hramValue * addPer + addDamage;
                
                if (isSiZhou)
                    hramValue = hramValue * (1 + selfTarget.infoModel.attributeExData[ExAttributeType.eatDeathCurseDamageIncrease] / 10000);
                //群攻，对非主面包伤害降低
                if (!isMainTar && skill.targetType == TargetType.Enemy) {
                    if (ttarget.infoModel.type == EntityType.Role) {
                        hramValue = hramValue * (skill.herdPlayerRate / 100);
                    } else {
                        hramValue = hramValue * (skill.herdMonRate / 100);
                    }
                }

                //只有我方作用与敌方才显示威慑飘字
                let mineFight = MineFight.ins();
                if (selfTarget.isMy && selfTarget.infoModel.type == EntityType.Role && target.infoModel.type == EntityType.Role) {
                    if (Encounter.ins().isEncounter()) {
                        if (EncounterFight.ins().getIsWeiShe(selfTarget.isMy))
                            isWeishe = true;
                    } else if (mineFight.isFighting) {
                        if (mineFight.getIsWeiShe(selfTarget.isMy))
                            isWeishe = true;
                    }
                }


                isZhuiMing = GameLogic.triggerAttr(selfTarget, AttributeType.atZhuiMingPro);
				if (isZhuiMing) {
					hramValue += selfInfo.getAtt(AttributeType.atZhuiMingVal);
				}

                //总伤害扣去敌方buff
                hramValue = this.damageBuff(selfTarget, target, hramValue);
                }

                hramValue = hramValue >> 0;
                
                //不会对己方造成伤害
                if (selfTarget.team == ttarget.team && hramValue > 0) {
                    hramValue = 0;
                }
            }


            if (!(ttarget instanceof CharRole)) {
                if (ttarget.AI_STATE == AI_State.Patrol) {
                    ttarget.stopMove();
                    ttarget.playAction(EntityAction.STAND);
                    ttarget.AI_STATE = AI_State.Stand;
                }
            }

            //本次攻击是否死亡
            let isDie: boolean = this.hramedDie(ttarget, hramValue);
            // if (selfTarget.team != Team.My && selfTarget instanceof CharRole) {
            //     console.log(1,'skillId:',skill.id);
            // }
            if (isDie)
                ttarget.AI_STATE = AI_State.Die;
            let damageType: number = 1;
            if (selfTarget.infoModel.type == EntityType.Role && Math.floor(skill.id / 10000) == 7) {
                damageType = DamageTypes.Heji;
            } else if (isMiss) {
                damageType = DamageTypes.Dodge;
            } else if (isLucky) {
                damageType = DamageTypes.Lucky;
            } else if (isCrit) {
                damageType = DamageTypes.CRIT;
            } 
            
            if (isZhiMing) damageType |= DamageTypes.ZhiMing;

            if (BloodView.TYPE > 0) damageType = BloodView.TYPE;

            if (isWeishe)
                damageType |= DamageTypes.Deter;

            if (selfTarget.team != ttarget.team && skill.calcType == 5) {
                let h5 = (hramValue / 5) >> 0;
                let h1 = (h5 * MathUtils.limit(0, 0.05)) >> 0;
                let h2 = (h5 * MathUtils.limit(0, 0.05)) >> 0;
                let hits = [h5 - h1, h5 + h1, h5 - h2, h5 + h2, hramValue - 4 * h5];
                let hitInfo = [];
                for (let i = 0; i < hits.length; i++) {
                    hitInfo.push({
                        isDie: isDie,
                        damageType: DamageTypes.Fujia,
                        ttarget: ttarget,
                        hramValue: hits[i]
                    })
                }
                hitTargetInfo.push(hitInfo);

            } else {
               
                
                hitTargetInfo.push([{
                    isDie: isDie,
                    damageType: damageType,
                    ttarget: ttarget,
                    hramValue: hramValue
                }]);

                //剑灵技能3
                if (selfTarget.team != ttarget.team && GameLogic.triggerAttr(selfTarget, AttributeType.atAttPerDamPan)) {
                    isDie = this.hramedDie(ttarget, (hramValue >> 1));
                    selfTarget.addPaoPao(20);
                    let targetInfo = hitTargetInfo[hitTargetInfo.length - 1];
                    targetInfo.push({
                        isDie: isDie,
                        damageType: DamageTypes.Fujia,
                        ttarget: ttarget,
                        hramValue: hramValue >> 1
                    });
                }
            }

            ttarget.myKill = ttarget.myKill || selfTarget.isMy;
            if (selfTarget.isMy || selfTarget.team == Team.WillEntity) {
                ttarget.showBlood(true);
                ttarget.showName(true);
            }
            if (ttarget.isMy) {
                selfTarget.showBlood(true);
                selfTarget.showName(true);
            }
        }

        let fbType = GameMap.fbType;
		let fbId = GameMap.fubenID;
        let hitTime: number = 0;//受击次数        
		GameLogic.ins().playSkillEff(skill, selfTarget, tempArr, (probability: number) => {
            	//切换场景后不处理上次的伤害
			if (GameMap.fbType != fbType || fbId != GameMap.fubenID) return;

			let pType: DamageTypes = 0;
            for (let i in tempArr) {
                let ttarget = tempArr[i];
                let tarHandle = ttarget.infoModel.handle;
                let targetIsDie = hitTargetInfo[i][hitTargetInfo[i].length - 1].isDie;

                if (pTarget == ttarget) {
					pType = hitTargetInfo[i][0].damageType;
				}

				let hramValue = 0;
                for (let j = 0; j < hitTargetInfo[i].length; j++) {
                    let targetInfo = hitTargetInfo[i][j];
                    hramValue += targetInfo.hramValue;
                    this.showHram(targetInfo.isDie,
                        targetInfo.damageType,
                        ttarget,
                        selfTarget,
                        targetInfo.hramValue,
                        true,
                        false,
                        skill.name);
                }

                let encounterMgs = EncounterFight.ins();
                if (selfTarget.team == Team.My && ttarget.team == Team.WillEntity && encounterMgs.willEntityFightTeam != Team.My) {
                    encounterMgs.willEntityFightTeam = Team.My;
                    //将当前追血令实体对象攻击目标清空
                    let willList = EntityManager.ins().getEntityByTeam(Team.WillEntity);
                    for (let char of willList) {
                        this.curTarget[char.infoModel.handle] = null;
                        this.lastTarget[char.infoModel.handle] = null;
                    }
                }

                //击中目标后，如果目标没死则添加技能效果附加
                if (!targetIsDie) {
                    let tarEff: number[] = skill.tarEff;
                    if (pTarget != ttarget && ttarget.infoModel.type == EntityType.Role) {
                        tarEff = skill.otarEff || tarEff;
                    }

                    for (let k = 0; tarEff && k < tarEff.length; k++) {
                        let args = this.getArgs(tarEff[k], ImbaData, gwSkillConfig);
                        let buff: EntityBuff = EntityBuff.createBuff(tarEff[k], selfTarget, args);
                        ttarget.addBuff(buff);
                    }

                    //给敌方添加冰魂技能效果
                    if (ImbaData) {
                        this.addTargetReviseSkillEffect(ttarget, selfTarget, ImbaData);
                    }

                    //给敌方添加神兵技能效果
                    if (gwSkillConfig) {
                        this.addTargetReviseSkillEffect(ttarget, selfTarget, gwSkillConfig);
                    }

                    if (gwSkills && gwSkills[1]) {
                        this.addTargetReviseSkillEffect(ttarget, selfTarget, gwSkills[1]);
                    }

                    //被攻击触发翅膀技能
                    if (ttarget instanceof CharRole) {
                        this.tryUseWingSkill(ttarget, skill, true);
                    }
                    
                    //被攻击使用被动技能
                    this.tryUsePassiveSkill(selfTarget, ttarget, true, hitTargetInfo[i][0].damageType);

                    //是否触发冰魂技能
                    this.tryUseWeaponSkill(ttarget, skill, true);
                }
                
            }

            //技能效果附加
            if (selfSkillEff) {
                for (let k = 0; skill.selfEff && k < skill.selfEff.length; k++) {
                    let args = this.getArgs(skill.selfEff[k], ImbaData, gwSkillConfig);
                    let buff: EntityBuff = EntityBuff.createBuff(skill.selfEff[k], selfTarget, args);
                    selfTarget.addBuff(buff);
                }
            }

            if (ImbaData) {
                this.addSelfReviseSkillEffect(selfTarget, ImbaData);
            }

            if (gwSkillConfig) {
                this.addSelfReviseSkillEffect(selfTarget, gwSkillConfig);
            }

            if (gwSkills && gwSkills[1]) {
                this.addSelfReviseSkillEffect(selfTarget, gwSkills[1]);
            }

            //当前攻击对象是否可以检查翅膀技能
            if (selfTarget instanceof CharRole) {
                this.tryUseWingSkill(selfTarget, skill, false);
            }

            //攻击附带使用被动技能
           	this.tryUsePassiveSkill(selfTarget, pTarget, false, pType);


            //诛仙神装
            this.tryTriggerHeirloomSkill(selfTarget, tempArr, hitTargetInfo);

            if (isYlBullet) {
                this.tryUseYlPassiveSkill(selfTarget, pTarget, skill);
            }

            //宠物使用被动技能
            if (skill.configID == 80002) {
                this.petTryUsePassiveSkill(selfTarget, false);
            }

            //关联技能
            if (skill.otherSkills) {
                let skills = skill.otherSkills.concat();
                let skillData = new SkillData(skills[hitTime]);
                skillData.preId = skill.configID;
                this.useSkill(selfTarget, target, skillData);
                // let skillIndex = 0;
                // let useOtherSkill = ()=>{
                //     if(target.parent && target.infoModel.getAtt(AttributeType.atHp) > 0) {
                //         let skillData = new SkillData(skills[skillIndex]);
                //         skillData.preId = skill.configID;
                //         this.useSkill(selfTarget, target, skillData);
                //     } else {
                //         TimerManager.ins().remove(useOtherSkill, this);
                //     }
                //     skillIndex += 1;
                // }
                // TimerManager.ins().doTimer(100, skills.length, useOtherSkill, this);
                hitTime += 1;
                return;
            }

        });

        if (!SoundUtil.WINDOW_OPEN && skill.sound && selfTarget.team == Team.My && selfTarget.infoModel["index"] == 0) {
            SoundUtil.ins().playEffect(skill.sound);
        }

        selfTarget.AI_STATE = AI_State.Stand;
        selfTarget.atking = false;

        //秘籍追魂 暴击后下一击伤害提示百分比
		if (hasCrit && selfInfo.getExAtt(ExAttributeType.eatMiJiZHDamPer)) {
			this.checkTriggerAttr(selfTarget, 1, ExAttributeType.eatMiJiZHTime, 1);
		}

        //冲撞表现
        this.repel(selfTarget, target, skill);
    }

    private repel(selfTarget: CharMonster, target: CharMonster, skill: SkillData): void {
        //击退
        if (skill && skill.repelDistance) {
            target.stopMove();
            target.playAction(EntityAction.STAND);
            let h: any = target.infoModel.handle;
            //被冲时，丢弃原来的攻击目标
            delete this.curTarget[h];

            this.trace(`${selfTarget.infoModel.name}的${JobConst[(selfTarget.infoModel as Role).job]}使用技能${skill.id}对${target.infoModel.name}造成位移`);
            let jd: number = MathUtils.getAngle(MathUtils.getRadian2(selfTarget.x, selfTarget.y, target.x, target.y));
            let p = MathUtils.getDirMove(jd, skill.repelDistance);
            p.x = target.x + p.x;
            p.y = target.y + p.y;
            let data: any = BresenhamLine.isAbleToThrough(
                GameMap.point2Grip(target.x),
                GameMap.point2Grip(target.y),
                GameMap.point2Grip(p.x),
                GameMap.point2Grip(p.y));
            if (data[0] == 0) {
                if (data[1] > 3) {
                    debug.error(`通过格子超过3个，检查是否有异常${data[2]},${data[3]}`, p);
                }
                if (GameMap.point2Grip(target.x) == data[2] && GameMap.point2Grip(target.y) == data[3]) {
                    p.x = target.x;
                    p.y = target.y;
                } else {
                    p.x = GameMap.grip2Point(data[2]);//data[2] * GameMap.CELL_SIZE;
                    p.y = GameMap.grip2Point(data[3]);//data[3] * GameMap.CELL_SIZE;
                }
            }
            p.x = Math.max(Math.min(p.x, GameMap.MAX_WIDTH), 0);
            p.y = Math.max(Math.min(p.y, GameMap.MAX_HEIGHT), 0);
            let xbX: number = p.x - target.x;
            let xbY: number = p.y - target.y;

            let time: number = Math.sqrt(xbX * xbX + xbY * xbY) / (selfTarget.moveSpeed / 1000);

            let holdTime: number = GlobalConfig.EffectsConfig[skill.tarEff[0]].duration;
            target.addHardStraight(holdTime);

            if (time > 0) {
                let t: egret.Tween = egret.Tween.get(target.moveTweenObj);
                t.to({
                    "x": p.x,
                    "y": p.y
                }, time);
            }


            if (skill.teleport == 1) {
                if (skill && skill.actionType != "") selfTarget.playAction(skill.actionType);
                selfTarget.stopMove();

                if (time > 0) {
                    let t = egret.Tween.get(selfTarget.moveTweenObj);
                    t.to({
                        "x": selfTarget.x - (target.x - p.x),
                        "y": selfTarget.y - (target.y - p.y)
                    }, time).call(() => {
                        selfTarget.resetStand();
                    });
                    selfTarget.addHardStraight(time);
                }
            }
        }
    }

    /**
     * 给自身添加附加效果 兵魂系统 神兵系统
     * @param selfTarget
     * @param ImbaData
     */
    private addSelfReviseSkillEffect(selfTarget: CharMonster, ImbaData: ImbaSkillReviseConfig | GWSkillReviseConfig) {
        if (ImbaData.selfEff) {
            for (let k in ImbaData.selfEff) {
                let id = ImbaData.selfEff[k];
                let config: EffectsConfig = GlobalConfig.EffectsConfig[id];
                if (config) {
                    let args = this.getArgs(id, ImbaData as any, null);
                    let buff: EntityBuff = EntityBuff.createBuff(id, selfTarget, args);
                    selfTarget.addBuff(buff);
                }
            }
        }
    }

    /**
     * 给目标添加附加效果 兵魂系统 神兵系统
     * @param target
     * @param source
     * @param ImbaData
     */
    private addTargetReviseSkillEffect(target: CharMonster, source: CharMonster, ImbaData: ImbaSkillReviseConfig | GWSkillReviseConfig) {
        if (ImbaData.targetEff) {
            for (let k in ImbaData.targetEff) {
                let id = ImbaData.targetEff[k];
                let config: EffectsConfig = GlobalConfig.EffectsConfig[id];
                if (config) {
                    let args = this.getArgs(id, ImbaData as any, null);
                    let buff: EntityBuff = EntityBuff.createBuff(id, source, args);
                    target.addBuff(buff);
                }
            }
        }
    }

    //被攻击时候尝试使用被动技能
    private tryUsePassiveSkill(selfTarget:CharMonster, target: CharMonster, isBeEffect: boolean = false,_type: number = 0) {
        let selfTar = isBeEffect ? target : selfTarget;
		let pTarget = isBeEffect ? selfTarget : target;
        if (selfTar instanceof CharRole) {
            let canUseSkill = this.getCanUseSkillList(selfTar, false);
            if (!canUseSkill || canUseSkill.length == 0) return;
            let skills = [];
            for (let skill of canUseSkill) {
                let passive = skill.config.passive;
                //生命低于万分比触发
				if (passive.p1) {
					if (selfTar.infoModel.getAtt(AttributeType.atHp) / selfTar.infoModel.getAtt(AttributeType.atMaxHp) > passive.p1 / 10000) {
						continue;
					}
				}
     			switch (passive.cond) {
					case 0:
						if (!isBeEffect) {
							if (GameLogic.triggerValue(passive.rate)) {
								skills.push(skill);
							}
						}
						break;
					case 1:
						if (isBeEffect) {
							if (GameLogic.triggerValue(passive.rate)) {
								skills.push(skill);
							}
						}
						break;
					case 2:
						if (!isBeEffect && (_type & DamageTypes.CRIT) == DamageTypes.CRIT) {
							if (GameLogic.triggerValue(passive.rate)) {
								skills.push(skill);
							}
						}
						break;
					case 3:
						if (isBeEffect && (_type & DamageTypes.CRIT) == DamageTypes.CRIT) {
							if (GameLogic.triggerValue(passive.rate)) {
								skills.push(skill);
							}
						}
						break;
				}
            }

            if (!skills.length) return;

            for (let skillData of skills) {
                let tar: CharMonster;
                if (skillData.targetType != TargetType.Enemy) {
                    tar = selfTar;
                } else {
                   if (pTarget && pTarget.infoModel.getAtt(AttributeType.atHp) > 0) {
						tar = pTarget;
					} else {
						let monsters = EntityManager.ins().screeningTargetByPos(selfTar, false, 0, skillData.affectRange);
						tar = monsters[0];
					}
                }
                
                if (tar) {
                    let handle = selfTar.infoModel.handle;
                    this.skillCD[handle] = this.skillCD[handle] || {};
                    this.skillCD[handle][skillData.id] = egret.getTimer();
                    this.useSkill(selfTar, tar, skillData);
                }
            }

        }
    }

    /** 尝试使用天仙技能被动技能 */
    public tryUseWarSpiritSkill(selfTarget, skillId, isBeEffect): void {
        let skillData = ObjectPool.pop('SkillData');
        skillData.configID = skillId;
        // if (GameLogic.triggerValue(skillData.rate)) {
        let tar: CharMonster;
        if (skillData.targetType != TargetType.Enemy) {
            tar = selfTarget;
        } else {
            let monsters = EntityManager.ins().screeningTargetByPos(selfTarget, false, 0, skillData.affectRange, this.aiList);
            tar = monsters[0];
        }
        if (tar) {
            let handle = selfTarget.infoModel.handle;
            this.skillCD[handle] = this.skillCD[handle] || {};
            this.skillCD[handle][skillData.id] = egret.getTimer();
            this.useSkill(selfTarget, tar, skillData);
        }
        // }
    }

    /** 尝试使用翅膀技能被动技能 */
    private tryUseWingSkill(selfTarget, skill, isBeEffect) {
        let wingSkills = this.checkWingEffect(selfTarget, skill, isBeEffect);
        if (wingSkills.length) {
            for (let skillId of wingSkills) {
                let skillData = ObjectPool.pop('SkillData');
                skillData.configID = skillId;
                let tar: CharMonster;
                if (skillData.targetType != TargetType.Enemy) {
                    tar = selfTarget;
                } else {
                    let monsters = EntityManager.ins().screeningTargetByPos(selfTarget, false, 0, skillData.affectRange);
                    tar = monsters[0];
                }
                if (tar) {
                    let handle = selfTarget.infoModel.handle;
                    this.skillCD[handle] = this.skillCD[handle] || {};
                    this.skillCD[handle][skillData.id] = egret.getTimer();
                    this.useSkill(selfTarget, tar, skillData);
                }
            }
        }
    }

    private checkWingEffect(selfTarget: CharRole, skill: SkillData, isBeEffect: boolean = false): number[] {
        let wingSkill = (selfTarget.infoModel as Role).wingSkillData;

        let triggerSkills = [];

        //被动技能不出发被动技能
        if (skill.isPassive) {
            return triggerSkills;
        }

        let skillCD = this.skillCD[selfTarget.infoModel.handle];

        for (let skillId of wingSkill) {
            let skillConfig = ObjectPool.pop('SkillData');
            skillConfig.configID = skillId;
            if (skillCD && skillCD[skillConfig.id] && (egret.getTimer() - skillCD[skillConfig.id] < skillConfig.cd)) {
                continue;
            }
            if (skillConfig.config.passive.cond == 0 && !isBeEffect) {
                if (GameLogic.triggerValue(skillConfig.config.passive.rate)) {
                    triggerSkills.push(skillId);
                }
            } else if (skillConfig.config.passive.cond == 1 && isBeEffect) {
                if (GameLogic.triggerValue(skillConfig.config.passive.rate)) {
                    triggerSkills.push(skillId);
                }
            }
        }

        return triggerSkills;
    }


        //烈焰技能附加buff
    private tryUseYlPassiveSkill(selfTarget: CharMonster, target: CharMonster, skill: SkillData) {
        let info = selfTarget.infoModel;
        if (info.lyMarkLv && info.lyMarkSkills) {
            for (let i = 0; i < info.lyMarkSkills.length; i++) {
                let lv = info.lyMarkSkills[i] || 0;
                if (lv) {
                    let config = GlobalConfig.FlameStampEffect[i + 1][lv];
                    if (config.effId) {
                        let effConfig = GlobalConfig.EffectsConfig[config.effId];
                        if (effConfig.probabilityBuff) {
                            if (GameLogic.triggerValue(effConfig.probabilityBuff)) {
                                let buff = EntityBuff.createBuff(config.effId, selfTarget);
                                target.addBuff(buff);
                            }
                        }
                    }

                    if (config.selfEffId) {
                        let effConfig = GlobalConfig.EffectsConfig[config.selfEffId];
                        if (effConfig.probabilityBuff) {
                            if (GameLogic.triggerValue(effConfig.probabilityBuff)) {
                                let buff = EntityBuff.createBuff(config.selfEffId, selfTarget);
                                selfTarget.addBuff(buff);
                            }
                        }
                    }
                }
            }
        }
    }




    //诛仙神装技能
    private tryTriggerHeirloomSkill(selfTarget, tempArr, hitTargetInfo: {
        isDie: boolean,
        damageType: number,
        ttarget: CharMonster,
        hramValue: number,
    }[][]) {
        let buff80004: EntityBuff = null;//诅咒buff
        let _bfCurse = 80004;//诅咒id 组

        let shixueId = 6666601;//嗜血id，乱起，设置cd用
        let isTriggerShiXue: number = -1;//是否触发嗜血 1触发 其他不触发
        let shixueValue = 0;

        let selfHandle = selfTarget.infoModel.handle;

        for (let i in tempArr) {
            let ttarget = tempArr[i];
            let tarHandle = ttarget.infoModel.handle;

            if (selfTarget.team != ttarget.team) {
                //是否触发嗜血
                if (isTriggerShiXue == -1) {
                    isTriggerShiXue = 0;
                    if (!this.skillCD[selfHandle] || !this.skillCD[selfHandle][shixueId] || (egret.getTimer() - this.skillCD[selfHandle][shixueId] >= 5000)) {
                        if (GameLogic.triggerAttr(selfTarget, AttributeType.atVamirePro)) {
                            isTriggerShiXue = 1;
                            this.skillCD[selfHandle] = this.skillCD[selfHandle] || {};
                            this.skillCD[selfHandle][shixueId] = egret.getTimer();
                        }
                    }
                }

                //判断对方是否触发诅咒
                if (ttarget instanceof CharRole && !selfTarget.hasBuff(_bfCurse) && !buff80004) {//当前角色木有诅咒
                    if (!this.skillCD[tarHandle] || !this.skillCD[tarHandle][_bfCurse] || (egret.getTimer() - this.skillCD[tarHandle][_bfCurse] >= 5000)) {
                        if (GameLogic.triggerAttr(ttarget, AttributeType.atCursePro)) {

                            let lv = (ttarget.infoModel as Role).heirloom.getInfoBySolt(2).lv;
                            let buffId = [80004, 80005, 80006, 80007][lv - 1];
                            buff80004 = ObjectPool.pop('EntityBuff');
                            buff80004.effConfig = GlobalConfig.EffectsConfig[buffId];
                            buff80004.value = buff80004.effConfig.args.a;
                            buff80004.addTime = egret.getTimer();
                            buff80004.endTime = buff80004.addTime + buff80004.effConfig.duration;
                            selfTarget.addBuff(buff80004);

                            ttarget.addPaoPao(13);

                            this.skillCD[tarHandle] = this.skillCD[tarHandle] || {};
                            this.skillCD[tarHandle][_bfCurse] = egret.getTimer();
                        }
                    }
                }
            }
        }

        //显示嗜血
        if (isTriggerShiXue == 1) {
            selfTarget.addPaoPao(14);
            for (let info of hitTargetInfo) {
                if (shixueValue == 0) {
                    shixueValue = Math.floor(selfTarget.infoModel.getAtt(AttributeType.atVamirePen) / 10000 * info[0].hramValue);
                }
            }
            this.hramedDie(selfTarget, -shixueValue);
            this.showHram(false, 1, selfTarget, selfTarget, -shixueValue);
        }
    }

    //是否触发冰魂技能
    private tryUseWeaponSkill(target: CharMonster, skill: SkillData, isBeHit: boolean) {
        if (this.checkTargetDead(target)) return;
        if (target.getRealHp() <= 0) return;

        if (isBeHit) {
            let isAddHpPro = GameLogic.triggerAttr(target, AttributeType.atBeAttAddHpPro);
            if (isAddHpPro) {
                target.addPaoPao(16);
                let addHp = target.infoModel.getAtt(AttributeType.atBeAttAddHpVal);
                this.hramedDie(target, -addHp);
                this.showHram(false, 1, target, target, -addHp);
            }

            if (target.infoModel.getAtt(AttributeType.atHpLtAddBuff) && (target.infoModel.getAtt(AttributeType.atHp) / target.infoModel.getAtt(AttributeType.atMaxHp)) < (target.infoModel.getAtt(AttributeType.atHpLtAddBuff) / 10000)) {

                let skillCD = this.skillCD[target.infoModel.handle];
                let effConfig = GlobalConfig.EffectsConfig[target.infoModel.getExAtt(ExAttributeType.eatHpLtAddBuffId)];
                if (skillCD && skillCD[ExAttributeType.eatHpLtAddBuffId] && egret.getTimer() - skillCD[ExAttributeType.eatHpLtAddBuffId] < target.infoModel.getExAtt(ExAttributeType.eatHpLtAddBuffCd)) {
                    return;
                }

                target.addPaoPao(18);

                let buff = ObjectPool.pop('EntityBuff');
                buff.effConfig = effConfig;
                buff.value = buff.effConfig.args.a;
                buff.addTime = egret.getTimer();
                buff.endTime = buff.addTime + buff.effConfig.duration;
                target.addBuff(buff);

                this.skillCD[target.infoModel.handle] = this.skillCD[target.infoModel.handle] || {};
                this.skillCD[target.infoModel.handle][ExAttributeType.eatHpLtAddBuffId] = egret.getTimer();
            }
        }
    }

    /**
     * 宠物使用被动技能
     * @param selfTarget
     * @param isBeEffect
     */
    private petTryUsePassiveSkill(selfTarget, isBeEffect: boolean = true) {
        let masterHandle = selfTarget.infoModel.masterHandle;
        let role = EntityManager.ins().getEntityByHandle(masterHandle);
        if (role && role.infoModel && role.infoModel.getExAtt(ExAttributeType.eatPetSkillLevel)) {
            let skillId = 36000 + role.infoModel.getExAtt(ExAttributeType.eatPetSkillLevel);

            let canUseSkill = [new SkillData(skillId)];
            let skills = [];
            for (let skill of canUseSkill) {
                if (skill.config.passive.cond == 0 && !isBeEffect) {
                    if (GameLogic.triggerValue(skill.config.passive.rate)) {
                        skills.push(skill);
                    }
                } else if (skill.config.passive.cond == 1 && isBeEffect) {
                    if (GameLogic.triggerValue(skill.config.passive.rate)) {
                        skills.push(skill);
                    }
                }
            }

            if (!skills.length) return;

            for (let skillData of skills) {
                let tar: CharMonster;
                if (skillData.targetType != TargetType.Enemy) {
                    tar = selfTarget;
                } else {
                    let monsters = EntityManager.ins().screeningTargetByPos(selfTarget, false, 0, skillData.affectRange);
                    tar = monsters[0];
                }
                if (tar) {
                    let handle = selfTarget.infoModel.handle;
                    this.skillCD[handle] = this.skillCD[handle] || {};
                    this.skillCD[handle][skillData.id] = egret.getTimer();
                    this.useSkill(selfTarget, tar, skillData);
                }
            }

        }
    }

    /**
     * 伤害后是否死亡
     * @returns {boolean}
     */
    private hramedDie(t: CharMonster, v: number): boolean {
        let value: number = t.infoModel.getAtt(AttributeType.atHp) - v;
        if (v < 0) {
            let maxValue: number = t.infoModel.getAtt(AttributeType.atMaxHp);
            value = value > maxValue ? maxValue : value;
        }
        // if (t.team != Team.My && t instanceof CharRole) {
        //     console.log(1,t.infoModel.handle,"扣血：",v,"剩余血量：",value,)
        // }
        t.infoModel.setAtt(AttributeType.atHp, value);

        if (t.infoModel.getAtt(AttributeType.atHp) <= 0) {
            return true;
        }
        return false;
    }

    /**
     * 伤害表现
     */
    public showHram(isDie: boolean, damageType: number, target: CharMonster | CharRole, sourceTarget: CharMonster | CharRole, hramValue: number, isDir: boolean = true, isFs: boolean = false, logStr: string = ""): void {
        if (!target || !target.infoModel) return;
        this.trace(target.infoModel.handle + " -- 受到" + (isFs ? "反伤伤害" : "普通伤害") + hramValue + ", 当前剩余血量:" + target.getHP() + "    --" + logStr);
        this.trace(target.infoModel.name + "---剩余血量 " + target.getHP());
        //显示对象血条扣血
        target.hram(hramValue);
        target.doHitAction();
        let userTask = UserTask.ins();
        //飘血
        GameLogic.ins().postEntityHpChange(target, isDir ? sourceTarget : null, damageType, hramValue);
        //死亡
        if (isDie) {
            target.removeAllFilters();
            target.stopMove();
            // this.trace("移除定时器 --- " + tHandle);
            // TimerManager.ins().removeAll(tHandle);
            if (target.myKill && !(target instanceof CharRole)) {
                let data: AchievementData = userTask.taskTrace;
                if (data) {
                    let config: AchievementTaskConfig = userTask.getAchieveConfById(data.id);
                    if (config && config.type == RoleAI.SEND_TASK_TYPE)
                        UserFb.ins().sendKillMonster(target.infoModel.configID);
                }
            }
            //复活
            if (!target.hasBuff(52001) &&
                GameLogic.triggerExAttr(target, ExAttributeType.eatGodBlessProbability)) {
                target.AI_STATE = AI_State.Stand;
                target.removeAllBuff();
                let r: number = target.infoModel.getAtt(AttributeType.atMaxHp) * target.infoModel.attributeExData[ExAttributeType.eatGodBlessRate] / 10000;
                target.infoModel.setAtt(AttributeType.atHp, r);
                target.hram(-r);
                this.trace("复活后剩余血量" + target.getHP());
                target.addPaoPao(7);
            }
            else {
                this.trace(target.infoModel.handle + " -- 死亡，等待删除形象");

                if (sourceTarget && sourceTarget.team == Team.My) {
                    this.checkPlayDieSound(target);
                }

                let userFb = UserFb.ins();
                let entityMgs = EntityManager.ins();
                let encounter = Encounter.ins();
                let gameLogic = GameLogic.ins();

                this.trace(target.infoModel.handle + " -- 删除");
                //TimerManager.ins().removeAll(tHandle);

                if (target.team == Team.My && UserHuanShou.ins().huanShouHandle) {
                    let index = EntityManager.ins().getNoDieRoleIndex();
                    if (index == -1) {
                        //主角全死
                        //删除幻兽
                        entityMgs.removeByHandle(UserHuanShou.ins().huanShouHandle);

                    }
                }

                // entityMgs.removeByHandle(target.infoModel.handle, false, (target.myKill && target.infoModel.type == EntityType.Monster));

                //移除角色 检查是否还有其他同角色，没有则移除所有（包括烈焰戒指召唤怪）
                if (target.infoModel.type == EntityType.Role) {
                    let enti = entityMgs.getEntityBymasterhHandle(target.infoModel.masterHandle);
                    if (!enti) {
                        let list = entityMgs.getMasterList(target.infoModel.masterHandle);
                        if (list && list.length) {
                            for (let en of list) {
                                entityMgs.removeByHandle(en.infoModel.handle);
                            }
                        }
                    }
                }

                delete this.hashHpObj[target.hashCode];

                egret.setTimeout(() => {
                    entityMgs.removeByHandle(target.infoModel.handle, true, (target.myKill && target.infoModel.type == EntityType.Monster))
                    this.trace(target.infoModel.handle + " -- 死亡动画完成，移除实体");

                    DisplayUtils.removeFromParent(target);
                    this.checkAIend(sourceTarget, target)
                    if (target.team == Team.Monster) {
                        let count: number = entityMgs.getTeamCount(Team.Monster);
                        if (count <= userFb.rCount) {
                            gameLogic.createGuanqiaMonster(false);
                        }
                    }
                }, this, 1500);

                target.onDead(() => {
                    target.deadDelay();
                    this.clearTarget(target);
                    target.dieTweenObj.factor = 0;
                    let dis = GameMap.CELL_SIZE * 3;
                    let p: { x: number, y: number }[] = [];
                    let dir = DirUtil.get8DirBy2Point(sourceTarget, target);
                    p[0] = { x: target.x, y: target.y };
                    // p[2] = MathUtils.getDirMove(dir * 72, dis, p[0].x, p[0].y);
                    if (sourceTarget) {
                        dir = DirUtil.get8DirBy2Point(sourceTarget, target);
                        let angle: number = Math.atan2(target.y - sourceTarget.y, target.x - sourceTarget.x);
                        p[2] = MathUtils.getPByDistance(sourceTarget, target, dis);
                        target.dir = DirUtil.get8DirBy2Point(target, sourceTarget);
                    }
                    else {
                        dir = target.dir;
                        p[2] = DirUtil.getGridByDir(dir, 3, target);
                    }
                    p[1] = { x: Math.min(p[0].x + (p[2].x - p[0].x) * 3 / 5), y: Math.min(p[2].y, p[0].y - dis / 2) }
                    let t = egret.Tween.get(target.dieTweenObj, {
                        onChange: (arg) => {
                            //死亡击飞
                            let value = target.dieTweenObj.factor;
                            target.x = Math.pow(1 - value, 2) * p[0].x + 2 * value * (1 - value) * p[1].x + Math.pow(value, 2) * p[2].x;
                            target.y = Math.pow(1 - value, 2) * p[0].y + 2 * value * (1 - value) * p[1].y + Math.pow(value, 2) * p[2].y;
                        }, onChangeObj: this
                    });
                    t.to({ factor: 1 }, 500).to({ alpha: 0 }, 1000)
                });


                // }, this);

                if (target.team == Team.Monster) {
                    let count: number = entityMgs.getTeamCount(Team.Monster);
                    if (count <= userFb.rCount) {
                        gameLogic.createGuanqiaMonster(false);
                    }

                    if (sourceTarget.team == Team.My) {
                        let master: CharRole = entityMgs.getNoDieRole();
                        let isElite = target.infoModel.configID == userFb.eliteMonsterId;
                        if (master && (isElite || sourceTarget.infoModel.handle == master.infoModel.handle) && GameMap.fubenID == 0) {
                            //计算掉落
                            let x_Grid: number = Math.floor(target.x / GameMap.CELL_SIZE);
                            let y_Grid: number = Math.floor(target.y / GameMap.CELL_SIZE);


                            let itemData: WaveDropData[];
                            if (!isElite) {
                                itemData = userFb.getRewardsPop();
                                userFb.rewards = [];
                            } else {
                                itemData = userFb.eliteRewards.shift();
                            }

                            if (itemData && itemData.length > 0) {
                                for (let j = 0; j < itemData.length && j < 8; j++) { //最多显示掉落8个
                                    encounter.postCreateDrop(x_Grid, y_Grid, itemData[j].drops[0]);
                                }
                                let callback = function () {
                                    userFb.sendGetReward(isElite);
                                }
                                DropHelp.addCompleteFunc(callback, this);
                                DropHelp.start();
                            }

                            if (userFb.exp > 0 && (!itemData || itemData.length == 0)) {
                                userFb.sendGetReward(isElite);
                                userFb.exp = 0;
                            }
                        }

                        //怪物杀死完后站立动作
                        let nextList = entityMgs.screeningTargetByPos(sourceTarget);
                        if (!nextList || nextList.length == 0) {
                            let mylist = entityMgs.getEntityByTeam(Team.My);
                            for (let char of mylist) {
                                char.playAction(EntityAction.STAND);
                            }
                        }
                    }

                    for (let handle in this.curTarget) {
                        if (this.curTarget[handle] == target) {
                            let char: CharRole = entityMgs.getEntityByHandle(handle);
                            if (char && char.infoModel) {
                                ++char.infoModel.killNum;
                            }
                            break;
                        }
                    }

                    if (sourceTarget.team == Team.Faker) {
                        let wildData: WildPlayerData = encounter.wildPersonList[sourceTarget.infoModel.masterHandle];
                        //闯关的假人 杀到足够数量的怪返回终点 移除
                        let killNum: number = EncounterModel.countKillNumByMarster(sourceTarget.infoModel.masterHandle);
                        if (wildData && wildData.actionType == 1 && killNum >= wildData.killNum) {
                            GameMap.moveEntity(sourceTarget, wildData.backX, wildData.backY);
                        }
                    }
                }
            }
        }
        else {
            if (target.AI_STATE != AI_State.Die && isFs && hramValue > 0) {
                ////没抗反伤技能

            }
        }
    }

    //心法3效果
	private tryTriggerHeart(ttarget: CharMonster) {
		let ttInfo = ttarget.infoModel;
		if (!ttInfo.getAtt(AttributeType.atHearthCount)) return;
		let job = (ttInfo as Role).job;
		let timer = 1000;
		switch (job) {
			case JobConst.ZhanShi:
				timer *= 15;
				break;
			case JobConst.FaShi:
				timer *= 17;
				break;
			case JobConst.DaoShi:
				timer *= 19;
				break;
		}
		this.checkTriggerAttr(ttarget, 0, AttributeType.atHearthCount, 1, timer);
		let isTrigger = this.getIsTriggerAttr(ttarget, 0, AttributeType.atHearthCount);
		if (isTrigger) {
			BubbleFactory.ins().playBubbleEffect(23);
		}
		return isTrigger;
    }

    private getIsTriggerAttr(selfTarget: CharMonster, type: number, attrType: ExAttributeType | AttributeType, def: number = 0) {
		let selfInfo = selfTarget.infoModel;
		let attrValue = this.attrValue[selfInfo.handle];
		if (attrValue) {
			let key = type + "_" + attrType;
			let last = attrValue[key];
			attrValue[key] = def;
			return last;
		}
		return 0;
	}
    
    /**
	 *
	 * @param selfTarget
	 * @param type  0为AttributeType  1为ExAttributeType
	 * @param attrType 属性cd
	 * @param per 触发概率
	 * @param exValue
	 */
	private checkTriggerAttr(selfTarget: CharMonster, type: number, attrType: ExAttributeType | AttributeType, per: number = 1, exValue: number = 0) {
		if (Math.random() < per) {
			let selfInfo = selfTarget.infoModel;
			let handle = selfInfo.handle;
			let obj = this.attrCD[handle] = this.attrCD[handle] || {};
			let key = type + "_" + attrType;
			let value = exValue ? exValue : (type == 0 ? selfInfo.getAtt(attrType as AttributeType) : selfInfo.getExAtt(attrType as ExAttributeType));

			let lastTime = obj[key] || 0;
			let curTimer = egret.getTimer();
			if (lastTime && curTimer - lastTime < value) {
				//cd中
				return;
			}
			obj[key] = curTimer;

			let attrValue = this.attrValue[handle] = this.attrValue[handle] || {};
			attrValue[key] = 1;
		}
	}

    /**
     * 检查是否结束战斗
     * @param st    击杀者队伍
     * @param t     被击杀者队伍
     */
    private checkAIend(st: CharMonster, t: CharMonster): void {
        let entityMgs = EntityManager.ins();
        let encounter = Encounter.ins();
        let count: number = entityMgs.getTeamCount(t.team, t.infoModel.type == EntityType.Role);
        if (!count) {
            switch (st.team) {
                case Team.My:
                    //胜利
                    switch (t.team) {
                        case Team.Monster:
                            this.trace('开始捡东西');
                            break;
                        case Team.WillBoss:
                            encounter.sendResult(true);
                            this.trace("遭遇boss成功");
                            break;
                        case Team.WillEntity:
                            //处理同归于尽的先后问题
                            this.trace("遭遇敌人成功");
                            if (entityMgs.getTeamCount(Team.My)) {
                                if (GameMap.sceneInMine()) {
                                    MineFight.ins().fightEnd(true);
                                } else {
                                    EncounterFight.ins().sendFightResult(1);
                                }
                            } else {
                                return;
                            }
                            break;
                        case Team.Faker:
                            //杀死假人
                            let wildData: WildPlayerData = encounter.wildPersonList[t.infoModel.masterHandle];
                            if (wildData) encounter.sendWildPeopleResult(wildData.index, 1);
                            break;
                    }
                    if (encounter.isGuiding) {
                        encounter.isGuiding = false;
                        encounter.postEncounterDataChange();
                    }
                    entityMgs.resetRole();
                    break;

                //失败
                case Team.WillBoss:
                    encounter.sendResult(false);
                    this.trace("遭遇boss失败");
                    break;

                case Team.WillEntity:
                    //处理同归于尽的先后问题
                    this.trace("遭遇敌人失败");
                    if (entityMgs.getTeamCount(Team.WillEntity)) {
                        if (GameMap.sceneInMine()) {
                            MineFight.ins().fightEnd(false);
                        } else {
                            EncounterFight.ins().sendFightResult(0);
                        }
                    } else {
                        return;
                    }
                    break;
                case Team.Faker:
                    if (t.team != Team.My) return;
                    //被假人杀死
                    let wildData: WildPlayerData = encounter.wildPersonList[st.infoModel.masterHandle];
                    if (wildData)
                        encounter.sendWildPeopleResult(wildData.index, 0);
                    break;
                case Team.Monster:
                    entityMgs.resetRole();
                    break;

            }
            this.getPickAI();
        }
    }

    //怪物死亡音效
    public checkPlayDieSound(monster: CharMonster) {
        let configID = monster.infoModel ? monster.infoModel.configID : 0;
        let config: MonstersConfig;
        if (!SoundUtil.WINDOW_OPEN && configID) {
            let soundUtil = SoundUtil.ins();
            config = UserFb.ins().guanqiaMonster[configID];
            if (config) {
                if (config.sound) {
                    soundUtil.playEffect(config.sound);
                }
            } else {
                config = GlobalConfig.MonstersConfig[configID];
                if (config) {
                    if (config.sound) {
                        soundUtil.playEffect(config.sound);
                    }
                }
            }
        }
    }

    public getPickAI(): void {
        if (this.inited && !Encounter.ins().isEncounter()) {
            this.stopAITimer();
        }
    }

    private stopAITimer() {
        TimerManager.ins().remove(this.startAI, this);
        TimerManager.ins().remove(this.startZhanLing, this);
    }

    private addAITimer() {
        let tms = TimerManager.ins();
        if (!tms.isExists(this.startAI, this)) {
            tms.doTimer(RoleAI.AI_UPDATE_TIME, 0, this.startAI, this);
            this.addZhanLingTimer();
        }
    }

    private addZhanLingTimer() {
        this.zhanlingTime = egret.getTimer();
        this.zhanlingdelayTime = egret.getTimer();
        if (!TimerManager.ins().isExists(this.startZhanLing, this))
            TimerManager.ins().doTimer(1000, 0, this.startZhanLing, this);
    }

    private getArgs(id: number, imbaData?: ImbaSkillReviseConfig, gwSKill?: GWSkillReviseConfig) {
        let skillEff: EffectsConfig = GlobalConfig.EffectsConfig[id];
        let addA = 0, addC = 0, addTime = 0;

        if (imbaData) {
            if (imbaData.args) {
                for (let arg of imbaData.args) {
                    if (arg.type == 8 && arg.vals[0] == skillEff.group) {
                        addA += arg.vals[2] || 0;
                        addC += arg.vals[4] || 0;
                        addTime += arg.vals[1] || 0;
                    }

                    if (arg.type == 6) {
                        addA += arg.vals[0] || 0;
                    }
                }
            }
        }

        if (gwSKill) {
            if (gwSKill.args) {
                for (let arg of gwSKill.args) {
                    if (arg.type == 8 && arg.vals[0] == skillEff.group) {
                        addA += arg.vals[2] || 0;
                        addC += arg.vals[4] || 0;
                        addTime += arg.vals[1] || 0;
                    }

                    if (arg.type == 6) {
                        addA += arg.vals[0] || 0;
                    }
                }
            }
        }

        return { a: addA, b: 0, c: addC, time: addTime };
    }

    public skillEffValue(selfTarget: CharMonster, skillEff: EffectsConfig, args?: { a: number, b: number, c: number }): number {
        let effValue: number = 0;
        let addA: number = 0;
        let addC: number = 0;

        if (args) {
            addA = args.a || 0;
            addC = args.c || 0;
        }

        if (skillEff) {
            if (skillEff.args) {
                switch (skillEff.type) {
                    //中毒
                    case SkillEffType.AdditionalDamage:
                        effValue = selfTarget.infoModel.getAtt(skillEff.args.b) * (skillEff.args.a + addA) + (skillEff.args.c || 0) + addC;
                        break;
                    //加血所以是负数
                    case SkillEffType.AddBlood:
                        effValue = selfTarget.infoModel.getAtt(skillEff.args.b) * (skillEff.args.a + addA) + (skillEff.args.c || 0) + addC;
                        effValue = -effValue;
                        break;
                    //附加属性
                    case SkillEffType.AdditionalAttributes:
                    case SkillEffType.HostAddAttributes:
                        effValue = selfTarget.infoModel.getAtt(skillEff.args.b) * (skillEff.args.a + addA) + (skillEff.args.c || 0) + addC;
                        break;
                    //附加状态
                    case SkillEffType.AdditionalState:
                        if (skillEff.args.i == 2) {//护盾
                            effValue = selfTarget.infoModel.getAtt(skillEff.args.b) * (skillEff.args.a + addA) + (skillEff.args.c || 0) + addC;
                        } else {
                            let value: number = !skillEff.args.c ? 1 + addC : (skillEff.args.c || 0) + addC;
                            effValue = selfTarget.infoModel.getAtt(skillEff.args.b) * value;
                        }
                        break;
                }
            }
            effValue = effValue >> 0;
        }
        return effValue;
    }

    private checkTeamDistan(selfTarget: CharMonster, master: CharMonster, range: number = 5): boolean {
        //计算距离
        let xb: number = MathUtils.getDistance(selfTarget.x, selfTarget.y, master.x, master.y);
        return xb < range * GameMap.CELL_SIZE;
    }

    private tryUseSkill(selfTarget: CharMonster): boolean {
        let hCode: any = selfTarget.infoModel.handle;
        let skill = this.curSkill[hCode];
        let target: CharMonster = this.curTarget[hCode];
        if (!skill || target == void 0) {
            return false;
        }
        //计算距离
        let xb: number = MathUtils.getDistance(selfTarget.x, selfTarget.y, target.x, target.y);

        //距离在技能范围内，攻击目标
        return xb < skill.castRange * GameMap.CELL_SIZE;
    }


    private screeningSkill(hCode): void {
        let selfTarget: CharMonster = this.aiList[hCode];
        let isRole: boolean = selfTarget instanceof CharRole;
        this.skillCD[hCode] = this.skillCD[hCode] || {};
        this.passive[hCode] = [];

        if (selfTarget.team == Team.My) {
            if (!isRole) {
                let specialRing = SpecialRing.ins();
                if (this.curSkill[hCode] == null) {

                    if (specialRing.isFireRing(selfTarget.infoModel.handle)) {
                        let skillId = specialRing.getRingSkill();
                        if (skillId) {
                            this.curSkill[hCode] = ObjectPool.pop('SkillData');
                            this.curSkill[hCode].configID = skillId;
                        }
                        else {
                            return;
                        }
                    }
                    else if (selfTarget.infoModel.type == EntityType.HuanShouMonster && selfTarget.infoModel.masterHandle && SubRoles.ins().getIsMyPlayer(selfTarget.infoModel.masterHandle)) {
                        let skills = UserHuanShou.ins().activeSkillList;
                        let len: number = skills.length;
                        if (len == 0) return;
                        let canUseSkill: SkillData[] = [];
                        for (let i = 0; i < len; i++) {
                            //获取技能配置
                            let skill: SkillData = new SkillData(skills[i]);
                            //是否还在上次cd中
                            if (egret.getTimer() - this.skillCD[hCode][skill.id] < skill.cd)
                                continue;
                            //放入被动技能
                            if (skill.config.passive) {
                                this.passive[hCode].push(skill);
                                continue;
                            }
                            canUseSkill.push(skill);
                        }
                        this.curSkill[hCode] = canUseSkill[0];
                    }
                    else {
                        this.curSkill[hCode] = ObjectPool.pop('SkillData');
                        this.curSkill[hCode].configID = 80001;//怪物通用技能

                        //神兵 术士召唤白虎技能
                        let gwSkills = GodWeaponCC.ins().getReviseBySkill(35000);
                        if (gwSkills && gwSkills.length) {
                            this.curSkill[hCode].configID = 80002;//白虎技能
                        }
                    }
                }
                let mSkill = this.curSkill[hCode];
                if (!mSkill || egret.getTimer() - this.skillCD[hCode][mSkill.id] < mSkill.cd) {
                    this.curSkill[hCode] = null;
                }
                //烈焰戒指怪物也需要添加技能
                if (!specialRing.isFireRing(selfTarget.infoModel.handle))
                    return;
            } else {
                let master: CharRole = EntityManager.ins().getNoDieRole();
                if (master && selfTarget.infoModel && selfTarget.infoModel.isMy && !this.checkTeamDistan(selfTarget, master, 10)) {
                    this.curSkill[hCode] = null;
                    return;
                }
            }
        } else {
            if (!isRole) {
                if (this.curSkill[hCode] == null) {
                    this.curSkill[hCode] = ObjectPool.pop('SkillData');
                    this.curSkill[hCode].configID = 50000;//怪物通用技能
                }
                let mSkill = this.curSkill[hCode];
                if (egret.getTimer() - this.skillCD[hCode][mSkill.id] < mSkill.cd) {
                    this.curSkill[hCode] = null;
                }
                return;
            }
        }

        if (this.curSkill[hCode]) {
            return;
        }

        let canUseSkill = this.getCanUseSkillList(selfTarget);
        if (!canUseSkill) return;

        let skillEff: EffectsConfig;
        let skillIndex: number = 0;
        let skill = canUseSkill[skillIndex];
        skillEff = (skill && skill.tarEff) ? GlobalConfig.EffectsConfig[skill.tarEff[0]] : null;
        //如果是召唤技能
        if (skillEff && skillEff.type == SkillEffType.Summon) {
            //如果已经使用技能了，再取一个技能
            if (selfTarget.hasBuff(skillEff.group))
                skill = canUseSkill[++skillIndex];
        }

        skillEff = (skill && skill.tarEff) ? GlobalConfig.EffectsConfig[skill.tarEff[0]] : null;

        let encounter = Encounter.ins();
        let entityMgs = EntityManager.ins();
        //如果是加血技能
        if (skillEff && skillEff.type == SkillEffType.AddBlood) {
            //如果没有加血对象，再取一个技能
            if (!entityMgs.checkCanAddBlood(selfTarget.team))
                skill = canUseSkill[++skillIndex];
        }

        //抗拒火环
        if (skill && skill.id == 25000) {
            //追血令不放群攻 没有可攻击的对象，获取下一个技能
            let tar = this.curTarget[selfTarget.infoModel.handle];
            if (!tar || this.checkTargetDead(tar)) tar = selfTarget;
            if (
                // encounter.isEncounter() || 
                // MineFight.ins().isFighting || 
                !entityMgs.checkCount(tar, skill.affectRange, 2, tar.team != selfTarget.team))
                skill = canUseSkill[++skillIndex];
        }
        //半月弯刀
        if (skill && skill.id == 13000) {
            //追血令不放群攻 没有可攻击的对象，获取下一个技能
            if (encounter.isEncounter() || MineFight.ins().isFighting || !entityMgs.checkCount(selfTarget, skill.affectRange, 2))
                skill = canUseSkill[++skillIndex];
        }


        this.curSkill[hCode] = skill;
    }

    //获取释放技能列表
    private getCanUseSkillList(selfTarget: CharMonster, isActive: boolean = true) {
        let skills: SkillData[] = [];
        if (selfTarget instanceof CharRole && selfTarget.infoModel) {
            //获取子角色当前等级的技能id
            skills = (<Role>selfTarget.infoModel).skillsData.concat();

            if (selfTarget.team == Team.My) {
                let gwSkills = GodWeaponCC.ins().getJobGWNewSkill((<Role>selfTarget.infoModel).job);
                if (gwSkills) {
                    skills = skills.concat(gwSkills);
                }
                //玉佩被动技能
				let roleId = (<Role>selfTarget.infoModel).index;
				let jadeData = JadeNew.ins().getJadeDataByID(roleId);
                
				if (jadeData)
					skills = skills.concat(jadeData.getSkillList());

                    for(let i =0;i<skills.length;i++){

                     }
            }else{
            //玉佩被动技能
				let jadeData = (<Role>selfTarget.infoModel).jadeData;
				if (jadeData)
					skills = skills.concat(jadeData.getSkillList());
             }
             skills = skills.concat(ExtremeEquipModel.ins().getZhiZunSkills(selfTarget.infoModel as Role));
             
             
            skills = skills.concat(ExtremeEquipModel.ins().getZhiZunSkills(selfTarget.infoModel as Role));
        } else {
            //怪物技能
            if (selfTarget.team == Team.My) {
                if (SpecialRing.ins().isFireRing(selfTarget.infoModel.handle)) {
                    let skillId = SpecialRing.ins().getRingSkill();
                    if (skillId) {

                        let skillData = ObjectPool.pop('SkillData');
                        skillData.configID = skillId;
                        skills.push(skillData);
                    }

                    skillId = LyMark.ins().getCurSkillID(); //烈焰印记
                    if (skillId) {
                        
                        let skillData: SkillData = ObjectPool.pop('SkillData');
                        skillData.specialCD = LyMark.ins().getCurSkillCD();
                        skillData.configID = skillId;
                        skills.push(skillData);
                    }
                }
            }
        }

        
        if (!skills || skills.length == 0) return;
        let hCode: any = selfTarget.infoModel.handle;

        this.skillCD[hCode] = this.skillCD[hCode] || {};

        let len: number = skills.length;
        if (len == 0) return;
        let canUseSkill: SkillData[] = [];
        for (let i = 0; i < len; i++) {
            if (!skills[i].canUse) continue;
            if (isActive == skills[i].isPassive) continue;

            let reduceCD: number = 0;
            //神器影响技能CD
            if (selfTarget.team == Team.My) {
                let imbaData: ImbaSkillReviseConfig = Artifact.ins().getReviseBySkill(skills[i].id)
                if (imbaData && imbaData.cd) {
                    reduceCD += imbaData.cd;
                }
                let gwSkills = GodWeaponCC.ins().getReviseBySkill(skills[i].id);
                let gwSkill: GWSkillReviseConfig;
                if (gwSkills) {
                    gwSkill = gwSkills[0];
                }
                if (gwSkill && gwSkill.cd) {
                    reduceCD += gwSkill.cd;
                }
            }
            //是否还在上次cd中
            if (egret.getTimer() - this.skillCD[hCode][skills[i].id] < (skills[i].cd - reduceCD))
                continue;
            //因为新增了突进技能，所以需要单独判断一下
            if (skills[i].index == 8 && skills[i].minRange) {
                this.screeningTarget(selfTarget);
                let target: CharMonster = this.curTarget[hCode];
                if (target == null) continue;
                //计算距离
                let xb: number = MathUtils.getDistance(selfTarget.x, selfTarget.y, target.x, target.y);

                if (xb < skills[i].minRange * GameMap.CELL_SIZE) {
                    continue;
                }
            }
            //添加到可使用列表中
            canUseSkill.push(skills[i]);
        }
        //排序优先级
        canUseSkill.sort(this.sortFunc);
      
        return canUseSkill;
    }

    //计算基础伤害
    private damageBaseCalculation(selfTarget: CharMonster, target: CharMonster, skill: SkillData): number {
        let attrValue: number = 0;
        let tempValue: number = 0;
        let damage: number = 0;
        let buff: EntityBuff;
        //攻击方职业
        let sJob: number = JobConst.None;
        //防守方职业
        let tJob: number = JobConst.None;
        let selfIsActor: boolean = false;
        let targetIsActor: boolean = false;

        let selfInfo = selfTarget.infoModel;

        let attArga: number = 0;
        let attArgb: number = 0;
        let attArgc: number = 0;
        let toMonAdd: number = 0;
        let addValue: number = 0;
        if (selfTarget.team == Team.My) {
            let imbaData: ImbaSkillReviseConfig = Artifact.ins().getReviseBySkill(skill.id)
            if (imbaData) {
                attArga = imbaData.a || 0;
                attArgb = imbaData.b || 0;
                toMonAdd = imbaData.d || 0;

                if (imbaData.selfEff) {
                    for (let k in imbaData.selfEff) {
                        buff = selfTarget.buffList[imbaData.selfEff[k]];
                        if (buff && buff.effConfig.type == 3) {
                            addValue += buff.value;
                        }
                    }
                }
            }

            let gwSkills = GodWeaponCC.ins().getReviseBySkill(skill.id);
            let gwSkill: GWSkillReviseConfig;
            if (gwSkills) {
                gwSkill = gwSkills[0];
            }
            if (gwSkill) {
                attArga += gwSkill.a || 0;
                attArgb += gwSkill.b || 0;
                toMonAdd += gwSkill.d || 0;

                if (gwSkill.selfEff) {
                    for (let k in gwSkill.selfEff) {
                        buff = selfTarget.buffList[gwSkill.selfEff[k]];
                        if (buff && buff.effConfig.type == 3) {
                            addValue += buff.value;
                        }
                    }
                }
            }

        }


        //烈焰技能等级
        if (skill.preId && GlobalConfig.FlameStamp.skillId.indexOf(skill.preId) >= 0) {
            let lv = selfInfo.lyMarkLv || 0;
            if (lv) {
                let config = GlobalConfig.FlameStampLevel[lv];
                if (config) {
                    attArga += config.bulletDamage.a;
                    attArgb += config.bulletDamage.b;
                }
            }

            let lySkills = selfInfo.lyMarkSkills || [];
            lv = lySkills[7 - 1] || 0;
            if (lv) {
                let config = GlobalConfig.FlameStampEffect[7][lv];
                if (config.bulletDamage) {
                    attArga += config.bulletDamage.a || 0;
                    attArgb += config.bulletDamage.b || 0;
                }
            }
        }

        //skill.calcType  0、没有伤害1、正常伤害（可触发晕眩） 2、加血    3、必杀伤害    4、固定伤害
        if (skill.calcType == 3) {
            if (selfTarget instanceof CharRole) {
                selfIsActor = true;
                tJob = (selfTarget.infoModel as Role).job;
            } else {
                selfIsActor = false;
            }

            if (target instanceof CharRole) {
                targetIsActor = true;
                tJob = (target.infoModel as Role).job;
            } else {
                targetIsActor = false;
            }

            //攻击技能
            if (skill.args) {
                if (selfIsActor && sJob) {
                    if (sJob == JobConst.ZhanShi) {
                        attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atDef);
                    } else {
                        attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atRes);
                    }
                } else {
                    attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atDef);
                }
                tempValue = attrValue * (1 - selfTarget.infoModel.getAtt(AttributeType.atPenetrate) / 10000);

                let attack: number = 0;
                let subRoles = SubRoles.ins();
                if (selfTarget.team == Team.My) {
                    let len = subRoles.subRolesLen;
                    for (let i: number = 0; i < len; i++) {
                        let roleData: Role = subRoles.getSubRoleByIndex(i);
                        if (roleData) attack += roleData.getAtt(AttributeType.atAttack);
                    }
                } else if (selfTarget.team == Team.WillEntity) {
                    let roles = HejiUseMgr.ins().getRoles();
                    let len = roles.length;
                    for (let i: number = 0; i < len; i++) {
                        let roleData: Role = roles[i];
                        if (roleData) attack += roleData.getAtt(AttributeType.atAttack);
                    }
                }


                let argb: number = !skill.args.b ? 0 + attArgb : skill.args.b + attArgb;
                damage = attack * (skill.args.a + attArga) - tempValue + argb + attArgc;
                damage = Math.max(damage, 0.05 * attack);

                if (target instanceof CharRole) {
                    damage = Math.floor(damage * (1.0 + selfTarget.infoModel.getExAtt(ExAttributeType.eatTogetherHitRoleDamageInc) / 10000.0));
                } else {
                    damage = Math.floor(damage * (1.0 + selfTarget.infoModel.getExAtt(ExAttributeType.eatTogetherHitMonDamageInc + toMonAdd) / 10000.0));
                }

                //2.（1-守方对必杀伤害减免比例）
                damage = Math.floor(damage * (1.0 - selfTarget.infoModel.getExAtt(ExAttributeType.eatTogetherHitFree) / 10000.0));//对必杀的伤害减免%

                //伤害加深百分比
                let damageAddRate = GameLogic.calculateRealAttribute(selfTarget, AttributeType.atRoleDamageEnhance, selfTarget);
                //伤害加少百分比
                damageAddRate -= GameLogic.calculateRealAttribute(target, AttributeType.atRoleDamageReduction, selfTarget);
                //伤害减免百分比
                damageAddRate -= GameLogic.calculateRealAttribute(target, AttributeType.atDamageReduction, selfTarget);
                //3.(1-守方对玩家/怪物伤害减免）
                damage = Math.floor(damage * (1.0 + damageAddRate / 10000.0));
                
                // damage = Math.floor(damage * (1.0 - selfTarget.infoModel.getAtt(AttributeType.atRoleDamageReduction) / 10000.0));
                // //4.(1-守方伤害减免比率）
                // damage = Math.floor(damage * (1.0 - selfTarget.infoModel.getAtt(AttributeType.atDamageReduction) / 10000.0));
            }
        } else {
            if (skill.targetType == TargetType.Enemy) {
                if (selfTarget instanceof CharRole) {
                    selfIsActor = true;
                    tJob = (selfTarget.infoModel as Role).job;
                } else {
                    selfIsActor = false;
                }

                if (target instanceof CharRole) {
                    targetIsActor = true;
                    tJob = (target.infoModel as Role).job;
                } else {
                    targetIsActor = false;
                }

                //攻击技能
                if (skill.args) {
                    if (selfTarget.infoModel.type == EntityType.HuanShouMonster) {
                        //把幻兽系统属性加入给幻兽
                        let attrs = UserHuanShou.ins().getHuanShouAttrs();
                        let len = attrs.length;
                        for (let i = 0; i < len; i++) {
                            selfTarget.infoModel.setAtt(attrs[i].type, attrs[i].value);
                        }
                    }
                    if (selfIsActor && sJob) {
                        if (sJob == JobConst.ZhanShi) {
                            attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atDef);
                        } else {
                            attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atRes);
                        }
                    } else {
                        attrValue = GameLogic.calculateRealAttribute(target, AttributeType.atDef);
                    }

                    tempValue = attrValue * (1 - selfTarget.infoModel.getAtt(AttributeType.atPenetrate) / 10000);

                    let exArg = 0;
                    let skillBaseId = Math.floor(skill.id / 1000) % 100;
                    for (let i = 0; i < skillConst.baseSkillIndex.length; i++) {
                        if (skillBaseId == skillConst.baseSkillIndex[i])
                            exArg = selfTarget.infoModel.attributeExData[ExAttributeType.eatBaseSkillExArg];
                    }
                    let attack: number = 0;
                    let tempAttack = selfTarget.infoModel.getAtt(AttributeType.atAttack) + addValue;
                    attack = tempAttack;
                    //翅膀技能，增加攻击力
                    buff = selfTarget.buffList[60001];
                    if (buff) {
                        let skillEff: EffectsConfig = buff.effConfig;
                        let dxValue: number = 10000 + buff.value;
                        tempAttack = Math.floor(tempAttack * dxValue / 10000);
                    }
                    //诅咒，降低攻击力
                    buff = selfTarget.buffList[80004];
                    if (buff) {
                        tempAttack = Math.floor(tempAttack - tempAttack * buff.value);
                    }

                    //宠物技能释放 判断有没有角色死亡加成攻击力
                    if (skill.configID == 80002) {
                        let add = this.gePetSkillAdd(selfTarget);
                        tempAttack = Math.floor(tempAttack * (10000 + add) / 10000);
                    }

                    //冰魂技能 星耀
                    let isAddDamPro = GameLogic.triggerAttr(selfTarget, AttributeType.atAttAddDamPro);
                    let addDamProVal = 0;
                    if (isAddDamPro) {
                        addDamProVal = selfTarget.infoModel.getAtt(AttributeType.atAttAddDamVal);
                        selfTarget.addPaoPao(15);
                    }

                    //冰魂技能 蛊毒冰魂 对晕眩的敌人额外伤害
                    let addDamPen = 0;
                    if (target.hasBuff(51001) && selfTarget.infoModel.getAtt(AttributeType.atAttMbAddDamPen)) {
                        addDamPen = selfTarget.infoModel.getAtt(AttributeType.atAttMbAddDamPen);
                        selfTarget.addPaoPao(17);
                    }

                    //冰魂技能 战神冰魂
                    let hpAddDamPen = 0;
                    if (selfTarget.infoModel.getAtt(AttributeType.atAttHpLtPenAddDam) && (target.infoModel.getAtt(AttributeType.atHp) / target.infoModel.getAtt(AttributeType.atMaxHp) < selfTarget.infoModel.getAtt(AttributeType.atAttHpLtPenAddDam) / 10000)) {
                        hpAddDamPen = selfTarget.infoModel.getAtt(AttributeType.atAttHpLtAddDamPen);
                        //只飘一次气泡
                        if (!this.hashHpObj[target.hashCode]) {
                            selfTarget.addPaoPao(19);
                            this.hashHpObj[target.hashCode] = 1;
                        }
                    }

                    let weishe = 0;
                    if (selfTarget.infoModel.type == EntityType.Role && target.infoModel.type == EntityType.Role) {
                        let mineFight = MineFight.ins();
                        if (Encounter.ins().isEncounter()) {
                            weishe = EncounterFight.ins().getWeiSheHurt(selfTarget.isMy);
                        } else if (mineFight.isFighting) {
                            weishe = mineFight.getWeiSheHurt(selfTarget.isMy);
                        }
                    }

                    let argb: number = !skill.args.b ? 0 + attArgb : skill.args.b + attArgb;

                    //根据敌方最高血量算伤害
                    if (targetIsActor && skill.args.c) {
                        attArgc += skill.args.c * target.infoModel.getAtt(AttributeType.atHp);
                    }

                    damage = tempAttack * (skill.args.a + exArg + attArga) - tempValue + argb + attArgc + addDamProVal;
                    damage = Math.floor(damage * (1.0 + ((toMonAdd + addDamPen + hpAddDamPen + weishe) / 10000.0)));
                    damage = Math.max(damage, 0.05 * attack);

                    //伤害加深百分比
                    let damageAddRate = GameLogic.calculateRealAttribute(selfTarget, AttributeType.atRoleDamageEnhance, selfTarget);

                    //伤害加少百分比
                    damageAddRate -= GameLogic.calculateRealAttribute(target, AttributeType.atRoleDamageReduction, selfTarget);
                    //伤害减免百分比
                    damageAddRate -= GameLogic.calculateRealAttribute(target, AttributeType.atDamageReduction, selfTarget);
                    //3.(1-守方对玩家/怪物伤害减免）
                    damage = Math.floor(damage * (1.0 + damageAddRate / 10000.0));
                    damage = Math.max(damage, 0.05 * attack);
                }
            }
        }
        let ranNumber: number = (105 - Math.random() * 10) / 100;
        damage = Math.floor(damage * ranNumber);
        //策划需求 禅道单子 25491 【战斗公式修正】增加一个修正系数
        damage = Math.floor(damage * 0.8);
        return damage;
    }

    private gePetSkillAdd(selfTarget: CharMonster) {
        let masterHandle = selfTarget.infoModel.masterHandle;
        let entityMgs = EntityManager.ins();
        let master: CharRole = entityMgs.getEntityByHandle(masterHandle);
        if (master && master.infoModel && master.infoModel.getExAtt(ExAttributeType.eatPetAttackInc)) {
            let add = master.infoModel.getExAtt(ExAttributeType.eatPetAttackInc);
            let dieCount: number = 0;//死亡人数
            let teamCount: number = entityMgs.getTeamCount(selfTarget.team);
            if (selfTarget.team == Team.My) {
                dieCount = SubRoles.ins().subRolesLen + 1 - teamCount;
            } else if (selfTarget.team == Team.WillEntity) {
                let mineFight = MineFight.ins();
                if (Encounter.ins().isEncounter()) {
                    dieCount = EncounterFight.ins().getRoles().length + 1 - teamCount;
                } else if (mineFight.isFighting) {
                    dieCount = mineFight.getRoles().length + 1 - teamCount;
                }
            }
            return add * dieCount;
        }
        return 0;
    }

    //伤害减去其他buff
    private damageBuff(selfTarget: CharMonster, target: CharMonster, damage: number) {
        //挂机的怪物 和  遭遇boss 打人不掉血  神兽打人有伤害
        if (selfTarget instanceof CharMonster) {
            if (selfTarget.team == Team.Monster || selfTarget.team == Team.WillBoss) {
                //神兽的攻击掉血
                if (selfTarget.infoModel.name != "神兽") {
                    damage = 0;
                }
            }
        }
        //魔法盾buff，抵消伤害
        let buff = target.buffList[19001];
        if (buff) {
            let skillEff: EffectsConfig = buff.effConfig;
            let dxValue: number = Math.floor(damage * skillEff.args.a);//抵消的伤害
            buff.value -= dxValue;//扣抵伤值
            if (buff.value <= 0) {
                target.removeBuff(buff);
            }
            damage = damage - dxValue + (buff.value < 0 ? -buff.value : 0);//实际伤害
            // target.addPaoPao(2);
        }

        //魔法盾buff，抵消伤害
        buff = target.buffList[60002];
        if (buff) {
            let skillEff: EffectsConfig = buff.effConfig;
            let dxValue: number = Math.floor(damage * (skillEff.args.c / 10000));//抵消的伤害
            damage = damage - dxValue;
        }

        //翅膀技能，闪避
        buff = target.buffList[60004];
        if (buff) {
            damage = 0;
        }


        if (target instanceof CharRole && target.infoModel && (target.infoModel as Role).exRingsData && (target.infoModel as Role).exRingsData[1] == 1) {
            let mp: number = target.infoModel.getAtt(AttributeType.atMp);
            if (mp > 0) {
                let oldMp = mp - damage;
                target.infoModel.setAtt(AttributeType.atMp, oldMp > 0 ? oldMp : 0);

                damage = damage - mp >= 0 ? damage - mp : 0;
                // target.addPaoPao(2);
                // target.addEffect(2);
            }
        }


        //固定伤害
        buff = target.buffList[80001];
        if (buff && damage > 0) {
            damage -= buff.value;
            damage = damage > 0 ? damage : 0;
        }
        return damage;
    }

    private sortFunc(a: SkillData, b: SkillData): number {
        let job = a.job;
        let conf = GlobalConfig.SkillsSorderConfig[job];
        if (!conf) return 0;

        let arr = GlobalConfig.SkillsSorderConfig[job].skillorder;
        let ap = arr.length;//默认优先级最低
        let bp = arr.length;//默认优先级最低
        for (let i in arr) {
            if (arr[i] == a.id)
                ap = +i;
            if (arr[i] == b.id)
                bp = +i;
        }
        if (ap > bp)
            return 1;
        if (ap < bp)
            return -1;
        return 0;
    }

    private screeningTarget(selfTarget: CharMonster, range: number = Number.MAX_VALUE, isSameTeam: boolean = false): void {

        let hCode: any = selfTarget.infoModel.handle;

        let skill = this.curSkill[hCode];

        let targetType: number = 0;
        if (skill) targetType = skill.targetType;
        if (!isSameTeam) {
            isSameTeam = targetType == TargetType.Friendly;
        }

        let entityMgs = EntityManager.ins();
        if (!isSameTeam) {
            if (this.lastTarget[hCode]) {
                let monster: CharMonster = entityMgs.getEntityByHandle(this.lastTarget[hCode]);
                if (monster && monster.parent && (monster.AI_STATE != AI_State.Die || monster.getHP() > 0)) {
                    this.curTarget[hCode] = monster;
                    return;
                } else {
                    this.lastTarget[hCode] = null;
                }
            }
        }

        let tempArr: CharMonster[] = entityMgs.screeningTargetByPos(selfTarget, isSameTeam, 0, range);

        switch (selfTarget.team) {
            case Team.My:
                let charMonster: CharMonster = this.checkMySubInList(tempArr, false, Team.Faker);
                this.curTarget[hCode] = charMonster; //tempArr ? tempArr[0] : null;
                break;
            case Team.Faker:
                let monster: CharMonster = this.checkMySubInList(tempArr);
                this.curTarget[hCode] = monster;
                break;
            default:
                this.curTarget[hCode] = tempArr ? tempArr[0] : null;
        }

        if (!isSameTeam && this.curTarget[hCode]) {
            this.lastTarget[hCode] = this.curTarget[hCode].infoModel.handle;
        }
    }

    private checkMySubInList(list: CharMonster[], isSameTeam: boolean = false, team: number = Team.My): CharMonster {
        for (let i = 0; i < list.length; i++) {
            if (isSameTeam) {
                if (list[i].team == team)
                    return list[i];
            } else {
                if (list[i].team != team)
                    return list[i];
            }
        }
        return null;
    }

    public checkTargetDead(target: CharMonster): boolean {
        return target.AI_STATE == AI_State.Die && target.getHP() <= 0;
    }

    private isLog: boolean = false;

    private trace(str: string): void {
        if (this.isLog)
            console.warn(str);
    }

    private startZhanLing() {
        if (this.zhanlingdelayTime && egret.getTimer() - this.zhanlingdelayTime > GlobalConfig.ZhanLingConfig.delayTime) {
            this.zhanlingdelayTime = 0;
            this.checkShowZhanling();
        }
        if (egret.getTimer() - this.zhanlingTime > 10000) {
            this.checkShowZhanling();
        }
    }

    static set isRoleHangup(isHangup: boolean) {
        this.roleHangup = isHangup;
    }
    static get isRolehangup(){
        return this.roleHangup;
    }
}

enum Team {
    My,
    Monster,
    WillEntity,
    WillBoss,
    NotAtk,
    Faker,
    NotAI
}

enum TargetType {
    Friendly = 1,
    Enemy,
    My,
}

enum AI_State {
    Stand,
    Run,
    Atk,
    Die,
    Patrol,
}