/**
 * 组队副本战斗界面
 * @author wanghengshuai
 *
 */
class TeamFbFightWin extends BaseEuiView {

    public teamFbMember: eui.Group;
    public member1: TeamFbMemberItemRender;
    public member2: TeamFbMemberItemRender;
    public teamFbTarget: eui.Group;
    public target1: TeamFbTargetItemRender;
    public target2: TeamFbTargetItemRender;
    public boss: TeamFbTargetItemRender;
    public target3: TeamFbTargetItemRender;
    public target4: TeamFbTargetItemRender;
    public teamFbTime: eui.Group;
    public leftTimeTxt: eui.Label;
    public teamFbName: eui.Image;
    public gonglveTxt: eui.Label;

    private _leftTime: number;

    private _roomID: number;

    public constructor() {
        super();
        this.skinName = "teamFbFightSkin";
    }

    public childrenCreated(): void {
        super.childrenCreated();
        this.teamFbMember.touchEnabled = false;
        this.teamFbMember.touchChildren = false;
        this.gonglveTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.gonglveTxt.text}`);
    }

    public open(...args: any[]): void {
        this.addTouchEvent(this, this.onTouch);
        this.observe(UserFb.ins().postFbTime, this.setTime);

        TimerManager.ins().removeAll(this);
        TimerManager.ins().doTimer(1000, 0, this.update, this);

        this.setTime([UserFb.ins().curFbID, UserFb.ins().curFbLeftTime]);
        this.updateFbName();

        this.update();
    }

    public close(): void {

    }

    private updateFbName(): void {
        let cfg: TeamFuBenConfig;
        for (let key in GlobalConfig.TeamFuBenConfig) {
            cfg = GlobalConfig.TeamFuBenConfig[key];
            if (cfg.fbid == GameMap.fubenID) {
                this.teamFbName.source = cfg.nameImg;
                this._roomID = cfg.id;
                break;
            }
        }
    }

    private setTime(args: any[]): void {
        //[fbID, leftTime]
        TimerManager.ins().remove(this.updateLeftTime, this);
        if (GameMap.fbType == UserFb.FB_TEAM) {
            this._leftTime = args[1];
            this.updateLeftTime();
            TimerManager.ins().doTimer(1000, 0, this.updateLeftTime, this);
        }
    }

    private updateLeftTime(): void {
        this.leftTimeTxt.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 4);
        if (this._leftTime <= 0) {
            TimerManager.ins().remove(this.updateLeftTime, this);
            return;
        }

        this._leftTime--;
    }

    private onTouch(e: egret.TouchEvent): void {
        console.log(e.target)
        switch (e.target) {
            case this.target1:
            case this.target2:
            case this.target3:
            case this.target4:
            case this.boss:
                // console.log(e.target);
                if (e.target.data && e.target.data.infoModel) {
                    SysSetting.ins().setValue("mapClickTx", 0);
                    SysSetting.ins().setValue("mapClickTy", 0);
                    GameLogic.ins().postChangeAttrPoint(e.target.data.infoModel.handle);
                }
                break;
            case this.gonglveTxt:
                ViewManager.ins().open(TeamFbGuideWin, this._roomID);
                break;
        }
    }

    private update(): void {
        let char: CharRole;
        let roleList = EntityManager.ins().getAllEntity();
        let roleModel: Role;
        let infoModel: EntityModel;
        let teamMembers: number[] = [];
        let teamRoles: CharRole[][] = [];
        let monsters: CharMonster[] = [];
        let boss: CharMonster;
        for (let i in roleList) {
            char = roleList[i];
            infoModel = char.infoModel;
            if (!infoModel) continue;

            if (infoModel.type == EntityType.Role) {
                roleModel = infoModel as Role;
                if (roleModel.masterHandle != Actor.handle) {
                    let index = teamMembers.indexOf(roleModel.masterHandle);
                    if (index == -1) {
                        teamMembers.push(roleModel.masterHandle);
                        teamRoles[teamRoles.length] = [char];
                    } else {
                        teamRoles[index].push(char);
                    }
                }
            }
            else if (infoModel.type == EntityType.Monster && infoModel.getAtt(AttributeType.atHp) > 0) {
                let monsterConfig: MonstersConfig = GlobalConfig.MonstersConfig[infoModel.configID];
                if (!monsterConfig)
                    continue;
                if (monsterConfig.type == 4 || monsterConfig.type == 3)//烈焰戒指 道士召唤怪
                    continue;

                let isBoss: boolean = monsterConfig.type == 1;
                if (!isBoss && !infoModel.masterHandle && monsters.length < 4)
                    monsters.push(char);

                if (isBoss) //boss
                    boss = char;
            }

        }

        this.teamFbMember.visible = teamRoles.length > 0;
        let tLen: number = teamRoles.length;
        let item: TeamFbMemberItemRender;
        for (let i: number = 0; i < 2; i++) {
            item = this["member" + (i + 1)];
            if (i + 1 <= tLen) {
                item.visible = true;
                item.data = teamRoles[i];
            }
            else
                item.visible = false;
        }

        let monster: TeamFbTargetItemRender;
        let len: number = monsters.length;
        for (let i: number = 1; i < 5; i++) {
            monster = this["target" + i];
            if (i <= len) {
                this.teamFbTarget.addChild(monster);
                monster.data = monsters[i - 1];
            }
            else
                DisplayUtils.removeFromParent(monster);
        }

        if (boss) {
            this.boss.data = boss;
            this.teamFbTarget.addChildAt(this.boss, Math.ceil(this.teamFbTarget.numChildren / 2));
        }
        else
            DisplayUtils.removeFromParent(this.boss);

    }
}

ViewManager.ins().reg(TeamFbFightWin, LayerManager.UI_Main);