/**
 * 组队副本房间
 * @author wanghengshuai
 *
 */
class TeamFbRoomWin extends BaseEuiView {

    public roleGroup: eui.Group;
    public member1: TeamFbRoleItemRender;
    public member2: TeamFbRoleItemRender;
    public leader: TeamFbRoleItemRender;
    public itemList: eui.List;
    public infoText: eui.Label;
    public fbName: eui.Label;
    public passTxt: eui.Label;
    public challengeBtn: eui.Button;
    public closeBtn0: eui.Button;

    /** 获得当前boss状态 0 不可挑战，1 可以挑战，2 已挑战 */
    private _state: number = 0;

    private _collect: ArrayCollection;

    private _config: TeamFuBenConfig;

    private _room: number = 0;

    public constructor() {
        super();
        this.skinName = "teamFbRoomSkin";
        this.isTopLevel = true;
    }

    public childrenCreated(): void {
        super.childrenCreated();
        this.itemList.itemRenderer = ItemBase;
    }

    public open(...args: any[]): void {
        this._state = args[0];
        this._config = GlobalConfig.TeamFuBenConfig[args[1]];
        this._room = args[2];
        this.observe(UserFb.ins().postFTRoomChange, this.onRoomInfoChange);
        this.observe(UserFb.ins().postCreateTFRoomSuccess, this.createSuccess);
        this.addTouchEvent(this, this.onTouch);
        this.update();
        this.onRoomInfoChange();

        //打开聊天界面
        ViewManager.ins().open(ChatMainUI);
    }

    public close(): void {
        //关闭聊天界面
        ViewManager.ins().close(ChatMainUI);
    }

    private createSuccess(): void {
        this._room = UserFb.ins().tfRoomID;
        this.onRoomInfoChange();
    }

    private update(): void {
        //奖励
        if (!this._collect) {
            this._collect = new ArrayCollection();
            this.itemList.dataProvider = this._collect;
        }

        this._collect.source = this._config.rewardShow;

        this.fbName.text = this._config.name;

        this.passTxt.visible = false;
        this.infoText.visible = false;
        this.roleGroup.visible = true;
        this.challengeBtn.visible = false;
        this.leader.visible = this.member1.visible = this.member2.visible = false;
        if (this._state == 0) //不能挑战
        {
            this.roleGroup.visible = false;
            this.infoText.visible = true;
            this.infoText.textFlow = TextFlowMaker.generateTextFlow(`通关${GlobalConfig.TeamFuBenConfig[this._config.id - 1].name}后可开启挑战`);
        }
        else if (this._state == 2) //已挑战
        {
            this.passTxt.visible = true;
            this.member1.visible = this.member2.visible = false;
            let vo: TeamFuBenRoleVo = new TeamFuBenRoleVo();
            let role: Role = SubRoles.ins().getSubRoleByIndex(0);
            vo.roleID = Actor.actorID;
            vo.position = 1;
            vo.roleName = Actor.myName;
            vo.job = role.job;
            vo.sex = role.sex;
            vo.cloth = role.getEquipByIndex(2).item.configID;
            vo.weapon = role.getEquipByIndex(0).item.configID;
            vo.wingLv = role.wingsData.lv;
            vo.wingState = role.wingsData.openStatus;
            vo.pos1 = role.zhuangbei[0];
            vo.pos2 = role.zhuangbei[1];
            vo.pos3 = role.zhuangbei[2];
            vo.zs = UserZs.ins().lv;
            vo.lv = role.lv;

            this.leader.data = {vo: vo, configID: this._config.id};
            this.leader.visible = true;
        }
        else //可以挑战
        {
            this.challengeBtn.visible = true;
            if (this._room <= 0)
                UserFb.ins().sendCreateTFRoom();
        }
    }

    private onRoomInfoChange(): void {
        if (!this._room)
            return;
        
        let len: number = UserFb.ins().tfMembers ? UserFb.ins().tfMembers.length : 0;
        let vo: TeamFuBenRoleVo, role: TeamFbRoleItemRender;
        let arr: TeamFbRoleItemRender[] = [this.member1, this.member2];
        for (let i: number = 0; i < len; i++) {
            if (UserFb.ins().tfMembers[i].position == 1)
                this.leader.data = {vo: UserFb.ins().tfMembers[i], configID: this._config.id};
            else {
                role = arr.shift();
                role.data = {vo: UserFb.ins().tfMembers[i], configID: this._config.id}

            }
        }

        len = arr.length;
        for (let i: number = 0; i < len; i++)
            arr[i].data = {vo: null, configID: this._config.id};

        arr.length = 0;
        arr = null;

        this.member1.visible = this.member1.data != null;
        this.member2.visible = this.member2.data != null;
        this.leader.visible = this.leader.data != null;
    }

    private onTouch(e: egret.TouchEvent): void {
        switch (e.target) {
            case this.challengeBtn:
                //每周日22点后不能再挑战
                let date: Date = new Date(GameServer.serverTime);
                if (date.getDay() == GlobalConfig.TeamFuBenBaseConfig.closeTime[0] && date.getHours() >= GlobalConfig.TeamFuBenBaseConfig.closeTime[1]) {
                    UserTips.ins().showTips(`每周${DateUtils.WEEK_CN[GlobalConfig.TeamFuBenBaseConfig.closeTime[0]]}${GlobalConfig.TeamFuBenBaseConfig.closeTime[1]}点后不能挑战`);
                    ViewManager.ins().close(this);
                    return;
                }
                if (!KfArenaSys.ins().checkIsMatching()) {
                    return;
                }
                if (!UserFb.ins().isTFCaptain) {
                    UserTips.ins().showTips(`队长才能开启进入副本`);
                    return;
                }

                UserFb.ins().sendBeginTF();
                ViewManager.ins().close(TeamFbRoomWin);
                break;
            case this.closeBtn0:
                if (this._state == 1) {
                    WarnWin.show(`是否退出房间`, () => {
                        UserFb.ins().sendExitTFRoom();
                        ViewManager.ins().close(TeamFbRoomWin);
                    }, this);
                }
                else
                    ViewManager.ins().close(this);

                break;
        }
    }
}

ViewManager.ins().reg(TeamFbRoomWin, LayerManager.UI_Popup);