/**
 * 组队副本结算
 * @author wanghengshuai
 *
 */
class TeamFbResultWin extends BaseEuiView {

    public bg: eui.Image;
    public defeat: eui.Group;
    public lostTxt: eui.Label;
    public openRole: eui.Image;
    public openRole1: eui.Button;
    public closeBtn11: eui.Button;
    public list0: eui.List;
    public win: eui.Group;
    public listItem: eui.List;
    public listChallenger: eui.List;
    public listAssistant: eui.List;
    public title: eui.Image;
    public effGroup: eui.Group;
    public closeBtn: eui.Button;
    public challengeBtn: eui.Button;
    public assResultTxt: eui.Label;


    private _configID: number;

    private _result: number = 0;

    private _list: TeamFuBenRoleVo[];

    private _exitTime: number;

    private _hasCaptain: boolean;

    public constructor() {
        super();
        this.skinName = "teamFbResultSkin";
        this.isTopLevel = true;
    }

    public childrenCreated(): void {
        super.childrenCreated();
        this.listItem.itemRenderer = ItemBase;

        this.listChallenger.itemRenderer = ChallengerHeadItemRender;
        this.listAssistant.itemRenderer = AssistantHeadItemRender;
        this.list0.itemRenderer = DefeatItem;
    }

    public open(...args: any[]): void {
        this._configID = args[0];
        this._result = args[1];
        this._list = args[2];

        this.addTouchEvent(this, this.onTouch);
        this.update();
    }

    public close(): void {

    }

    private update(): void {
        this.listItem.dataProvider = new ArrayCollection(GlobalConfig.TeamFuBenConfig[this._configID].rewardShow);
        this.title.source = this._result ? "result_json.win_02" : "result_json.lost_02";
        this.bg.source = this._result ? "win_jpg" : "lost_jpg";
        this.win.visible = this._result > 0;
        this.defeat.visible = this._result == 0;
        this._hasCaptain = false;

        let helpList: TeamFuBenRoleVo[] = [];
        let vo: TeamFuBenRoleVo;
        let isHelp: boolean;
        let isCaptain: boolean;
        for (let i: number = 0; i < this._list.length; i++) {
            if (this._list[i].position == 2) {
                vo = this._list.splice(i, 1)[0];
                helpList.push(vo);
                if (vo.roleID == Actor.actorID)
                    isHelp = true;

                i--;
            }
            else if (this._list[i].position == 1) {
                if (this._list[i].roleID == Actor.actorID)
                    isCaptain = true;

                this._hasCaptain = true;
            }
        }

        this.assResultTxt.visible = isHelp;
        if (this._result == 0)
            this.updateDefeatList();

        this.listChallenger.dataProvider = new ArrayCollection(this._list);

        let len: number = helpList.length;
        let newList: { vo: TeamFuBenRoleVo, id: number }[] = [];
        for (let i: number = 0; i < len; i++)
            newList.push({vo: helpList[i], id: this._configID});

        this.listAssistant.dataProvider = new ArrayCollection(newList);

        this.closeBtn.visible = isCaptain && this._result == 1;
        if (this._result == 0 || this._configID >= Object.keys(GlobalConfig.TeamFuBenConfig).length) {
            this.closeBtn.horizontalCenter = 0;
            this.challengeBtn.visible = false;
        }
        else {
            this.closeBtn.horizontalCenter = -80;
            this.challengeBtn.visible = this.closeBtn.visible;
        }

        this._exitTime = 5;
        TimerManager.ins().doTimer(1000, 0, this.repeate, this);
        this.repeate();
    }

    private updateDefeatList(): void {
        let gainWay: number[] = [];	//道具途径
        for (let i in GlobalConfig.DeathGuideConfig) {
            let cfg: DeathGuideConfig = GlobalConfig.DeathGuideConfig[i];
            if (UserZs.ins().lv <= cfg.zslv || Actor.level <= cfg.lv) {
                for (let j in cfg.gainWay) {
                    //死亡引导
                    if (cfg.gainWay[j][0] == 16) {
                        let pic_img: string = DieGuide.ins().getOpenRoles();
                        if (pic_img) {
                            let desConfig: DeathgainWayConfig = GlobalConfig.DeathgainWayConfig[cfg.gainWay[j][0]];
                            desConfig.itemId = pic_img;//修改配置表 因为只显示当前登陆一次 往后不作修改
                            gainWay.push(cfg.gainWay[j][0]);
                        }
                        continue;
                    }
                    gainWay.push(cfg.gainWay[j][0]);
                }
                break;
            }
        }

        this.list0.dataProvider = new ArrayCollection(gainWay);

    }

    private onTouch(e: egret.TouchEvent): void {
        switch (e.target) {
            case this.closeBtn:
                this.exitFb();
                break;
            case this.closeBtn11:
                this.exitFb();
                break;
            case this.challengeBtn:
                this.exitFb(1);
                break;
            case this.openRole:
            case this.openRole1:
                ViewManager.ins().close(this);
                ViewManager.ins().open(NewRoleWin);
                break;
        }
    }

    private repeate(): void {

        if (this._result == 0){
            this.closeBtn11.label = "退出(" + this._exitTime + "s)";
        } else {
            this.closeBtn.label = "退出(" + this._exitTime + "s)";
            this.assResultTxt.text = "等待队长操作（" + this._exitTime + "s）";
        }

        if (this._exitTime <= 0) {
            TimerManager.ins().removeAll(this);
            this.exitFb();
            return;
        }

        this._exitTime--;
    }

    private exitFb(type: number = 0): void {
        if (this._result == 0 || this._configID >= Object.keys(GlobalConfig.TeamFuBenConfig).length)
            UserFb.ins().sendExitFb();
        else {
            if (this._hasCaptain)
                UserFb.ins().sendExitTFFb(type);
            else
                UserFb.ins().sendExitFb();
        }

        ViewManager.ins().close(this);
    }
}

ViewManager.ins().reg(TeamFbResultWin, LayerManager.UI_Popup);