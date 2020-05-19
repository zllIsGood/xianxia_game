/**
 * 灵戒界面
 */
class RingInfoView extends BaseEuiView {

    private barGroup: eui.Group;
    private skillname: eui.Label;
    private starList: StarList;
    private nextAttrLabel: eui.Label;
    private attrLabel: eui.Label;
    private uplevel: eui.Button;
    public aciveGroup: eui.Group;
    public acivebtn: eui.Button;
    public openDesc: eui.Label;
    private Explain: eui.Label;
    private Explain1: eui.Label;
    private ringname: eui.Label;
    private ringget: eui.Label;
    private useTxt: eui.Label;
    private countTxt: eui.Label;
    private menuList: eui.List;
    private menuListData: eui.ArrayCollection;
    private openLevelDesc: eui.Label;
    private Explain0: eui.Label;
    private star: eui.Group;
    private powerPanel: PowerPanel;
    private upgradebtn: eui.Button;
    private fightBtn: eui.Button;
    private ringMcGroup: eui.Group;
    public attrLabel1: eui.Label;
    private stageImg: LevelImage;
    private baojiMc: MovieClip;
    private iconMc: MovieClip;
    private reliveEff: MovieClip;
    private barbc: ProgressBarEff;
    public attrBg0: eui.Image;
    private closeBtn: eui.Button;

    //-------------灵戒融合状态UI组件---------------------
    public lieyanRing: eui.Group;
    public ringName: eui.Image;

    public questBar: eui.Group;
    public goQuicklyOpen: eui.Button;
    public remix: eui.Button;
    public remixText: eui.Label;
    public progress: eui.ProgressBar;

    public price0: PriceIcon;
    public quicklyOpen: eui.Button;
    //-------------灵戒融合状态UI组件---------------------

    private cruCostId: number = 0;
    private currData: SpecialRingData;
    private specialDatas: any[];
    private isAutoUp: boolean = false;
    private canUpdate: boolean = false;

    /**
     * 火焰戒指ID
     */
    public FIRE_RING_ID: number = 7;

    constructor() {
        super();
        this.skinName = "ring";
        this.setSkinPart("barbc", new ProgressBarEff)
        this.isTopLevel = true;
    }

    public initUI(): void {
        super.initUI();

        // this.barbc.setWidth(400);
        // this.barbc.x = -15;
        // this.barbc.y = 25;
        // this.barGroup.addChild(this.barbc);

        this.starList = new StarList(SpecialRing.perStar);
        this.starList.x = 15;
        this.starList.y = 0;
        this.star.addChild(this.starList);

        this.iconMc = new MovieClip();
        this.iconMc.x = 0;
        this.iconMc.y = 0;
        this.ringMcGroup.addChild(this.iconMc);

        this.reliveEff = new MovieClip();
        this.reliveEff.x = 200;
        this.reliveEff.y = 62;

        this.baojiMc = new MovieClip();
        this.baojiMc.x = 245;
        this.baojiMc.y = 650;

        this.menuList.itemRenderer = SpecialRingItem;
        this.menuList.selectedIndex = 0;
        this.menuListData = new eui.ArrayCollection();
        this.menuList.dataProvider = this.menuListData;

        this.ringget.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.ringget.text}</u></a>`);
        this.upgradebtn.label = "进阶";
        this.uplevel.label = "升星";
        this.countTxt.textColor = ColorUtil.NORMAL_COLOR;
    }

    public open(...param: any[]): void {
        this.addChangeEvent(this.menuList, this.onClickMenu);
        this.addTouchEvent(this.uplevel, this.onTap);
        this.addTouchEvent(this.acivebtn, this.onTap);
        this.addTouchEvent(this.ringget, this.onTap);
        this.addTouchEvent(this.upgradebtn, this.onTap);
        this.addTouchEvent(this.fightBtn, this.onTap);
        this.addTouchEvent(this.goQuicklyOpen, this.onQuickOpen);
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.observe(SpecialRing.ins().postUnLock, this.updateView);
        this.observe(UserTask.ins().postUpdateAchieve, this.updateView);

        this.observe(SpecialRing.ins().postSpicelRingUpdate, this.playEffect);
        this.observe(SpecialRing.ins().postActiveRing, this.showActivityView);
        this.observe(SpecialRing.ins().postActiveRing, this.updateView);
        this.observe(SpecialRing.ins().postSRStairUp, this.updateView);
        this.barbc.reset();
        this.updateView();
        this.setIcon();
    }

    public close(...param: any[]): void {
        this.menuList.removeEventListener(egret.Event.CHANGE, this.onClickMenu, this);
        this.removeTouchEvent(this.uplevel, this.onTap);
        this.removeTouchEvent(this.ringget, this.onTap);
        this.removeTouchEvent(this.acivebtn, this.onTap);
        this.removeTouchEvent(this.upgradebtn, this.onTap);
        this.removeTouchEvent(this.fightBtn, this.onTap);
        this.removeTouchEvent(this.closeBtn, this.onTap);
        DisplayUtils.removeFromParent(this.reliveEff);
        this.removeObserve();
        if (this.isAutoUp) {
            this.stopAutoUp();
        }
    }

    private onQuickOpen(e: egret.TouchEvent): void {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];
        let costMoney = config.useYb;
        if (Actor.yb >= costMoney) {
            SpecialRing.ins().sendActiveRing(SpecialRing.FIRE_RING_ID, 1);
        } else {
            UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
        }
    }

    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.uplevel:
                this.warnShow();
                break;
            case this.acivebtn://debug 火焰戒指激活加这里
                if (this.currData.id == SpecialRing.FIRE_RING_ID) {
                    SpecialRing.ins().requestDeblock(this.currData.id);
                }
                else {
                    SpecialRing.ins().sendActiveRing(this.currData.id);
                }
                break;
            case this.upgradebtn:
                UserTips.ins().showTips("排版优化 屏蔽升级功能");
                break;
            case this.fightBtn:
                if (this.fightBtn.label == "出战") {
                    SpecialRing.ins().sendRingFight(this.currData.id, 1);

                } else if (this.fightBtn.label == "回收") {
                    SpecialRing.ins().sendRingFight(this.currData.id, 0);
                }
                break;
            case this.ringget:
                UserWarn.ins().setBuyGoodsWarn(this.cruCostId);
                break;
            default:
                break;
        }
    }

    private showActivityView(...param: any[]) {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        if (this.currData.id == SpecialRing.FIRE_RING_ID) {
            ViewManager.ins().close(this);
            ViewManager.ins().open(FireRingWin);
        }
        else {
            this.upDateItem(...param);
        }
        Activationtongyong.show(0, config.name, `j${config.icon}_png`, ActivationtongyongShareType.RingAwake);//激活特效界面
    }

    private upDateItem(...param: any[]): void {
        let id: number = 0;
        if (param && param[0]) {
            id = param[0][0];
        }
        let item: SpecialRingData = SpecialRing.ins().getSpecialRingDataById(id);
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        this.menuListData.replaceItemAt(item, config.order - 1);
        this.currData = item;
        this.updateDetail(true);
    }

    private playEffect(...param: any[]): void {
        this.upDateItem(...param);
        let baoji: number = 0;
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        if (param && param[0]) baoji = param[0][1];

        let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level);
        if (baoji > 0) {
            this.baojiMc.playFile(RES_DIR_EFF + "moneytreecrit", 1);
            this.addChild(this.baojiMc);
        }

        let label: eui.Label = new eui.Label;
        label.size = 14;
        label.textColor = 0x35e62d;
        label.width = 450;
        label.textAlign = egret.HorizontalAlign.CENTER;
        label.x = 19;
        label.y = 420;
        label.text = `${config.name}经验增加${attrConfig.addPower}`;
        this.addChild(label);

        let t: egret.Tween = egret.Tween.get(label);
        t.to({ "y": label.y - 45 }, 500).call(() => {
            this.removeChild(label);
        }, this);
    }

    private onClickMenu(e: egret.TouchEvent): void {
        let data = this.specialDatas[e.currentTarget.selectedIndex];
        if (!data) {
            return;
        }
        this.barbc.reset();
        this.currData = data;
        this.updateDetail();
        this.setIcon();
    }

    private setIcon(): void {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        if (!GlobalConfig.DefineEff[config.effid]) {
            egret.log(config.name + "特效ID出错啦");
            return;
        }
        let effSoure: string = GlobalConfig.DefineEff[config.effid].souce;
        this.iconMc.playFile(RES_DIR_EFF + effSoure, -1);
    }

    private updateView() {
        this.updateMenuList();
        this.updateDetail();
    }

    private updateMenuList() {
        this.specialDatas = CommonUtils.copyDataHandler(SpecialRing.ins().ringList);
        this.menuListData.source = this.specialDatas.sort((obj1, obj2) => {
            return Algorithm.sortAscAttr(obj1, obj2, "order")
        });
        if (this.currData) {
            for (let i in this.specialDatas) {
                if (this.currData.id == this.specialDatas[i].id) {
                    this.currData = this.specialDatas[i];
                    break;
                }
            }
        } else {
            this.currData = this.specialDatas[0];
        }
    }

    private updateFuseView() {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];
        this.price0.setPrice(config.useYb);
    }

    private updateDetail(upStar: boolean = false) {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        let isFireRingOpen: boolean = SpecialRing.ins().isFireRingActivate();
        if (isFireRingOpen) {
            this.currentState = "tejie8";
            this.updateFuseView();
            this.currData.id = this.FIRE_RING_ID;
        } else {
            if (this.currData.id == this.FIRE_RING_ID) {//火焰戒指特殊处理，就不走普通戒指的逻辑了
                this.currentState = "disable";
                this.resetUI();
                this.attrBg0.visible = false;
                this.acivebtn.label = "解封";
                let cfg: ActorExRingConfig = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];
                this.ringname.text = `${cfg.name}`;
                this.Explain0.textFlow = TextFlowMaker.generateTextFlow(this.countStrDesc(cfg));
                this.openDesc.text = '第8天激活全部灵戒后解锁';
                if (SpecialRing.ins().isFireRingCanActivate()) {
                    this.acivebtn.visible = true;
                    this.openDesc.visible = false;
                    this.addReliveEff();
                }
                else {
                    this.acivebtn.visible = false;
                    this.openDesc.visible = true;
                    DisplayUtils.removeFromParent(this.reliveEff);
                }
            }
            else {
                this.attrBg0.visible = true;
                this.acivebtn.label = "激活";
                let configLevel: number = this.currData.level == 0 ? 1 : this.currData.level;
                let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, configLevel);
                let level: number = SpecialRing.ins().getRingStair(this.currData.level);
                this.ringname.text = `${config.name}`;
                this.stageImg.setValue(level);
                if (this.currData.level > 0) {
                    if (Actor.level >= config.needLevel && UserZs.ins().lv >= config.needZs) {
                        if (!SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level + 1)) {
                            this.currentState = "final";
                        } else {
                            this.currentState = "open";
                        }
                        this.setOpenInfo(upStar);
                    } else {
                        this.currentState = "wait";
                        this.Explain0.textFlow = TextFlowMaker.generateTextFlow(this.countStrDesc(config));
                        this.openLevelDesc.text = `达到${config.needZs > 0 ? config.needZs + `转` : ``}${config.needLevel > 0 ? config.needLevel + `级` : ``}后灵戒开启飞升`;
                        if (attrConfig.attrAward) {
                            this.setLayoutAttr(attrConfig);
                            let point: number = UserBag.getAttrPower(attrConfig.attrAward);
                            this.powerPanel.setPower(point);
                        } else {
                            this.setLayoutAttr(attrConfig, true);
                            this.powerPanel.setPower(0);
                        }
                    }
                } else {
                    this.currentState = "disable";
                    if (attrConfig.attrAward) {
                        this.setLayoutAttr(attrConfig);
                        let point: number = UserBag.getAttrPower(attrConfig.attrAward);
                        this.powerPanel.setPower(point);
                    } else {
                        this.setLayoutAttr(attrConfig, true);
                        this.powerPanel.setPower(0);
                    }
                    this.Explain0.textFlow = TextFlowMaker.generateTextFlow(this.countStrDesc(config));
                    let flag: boolean = SpecialRing.ins().checkRedPoint(this.currData.id, this.currData.level);
                    if (flag) {
                        this.openDesc.text = "";
                        this.acivebtn.visible = true;
                        this.addReliveEff();
                    } else {
                        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
                        this.acivebtn.visible = false;
                        this.openDesc.text = `第${config.openDay}天或${UserVip.formatLvStr(config.openVip)}开启`;
                        DisplayUtils.removeFromParent(this.reliveEff);
                    }
                    this.canUpdate = false;
                }
                this.skillname.text = attrConfig.SpecialRingSkin;
            }
        }
    }

    private addReliveEff(): void {
        this.reliveEff.playFile(RES_DIR_EFF + "chargeff1", -1);
        if (!this.reliveEff.parent) this.aciveGroup.addChild(this.reliveEff);
    }

    private resetUI(): void {
        this.setLayoutAttr(null, true);
        this.Explain0.text = "";
        this.skillname.text = "";
        this.openDesc.text = "";
    }

    private setLayoutAttr(attrConfig: ExRingAttrConfig, clean?: boolean) {
        for (let i = 0; i < 4; i++) {
            if (!clean) {
                let spl: string = AttributeData.getAttStr(this.getAttrArray(attrConfig.attrAward), 1);
                let attstrs: string[] = spl.split("\n");
                this["attrLabel" + (i + 1)].text = attstrs[i];
            }
            else {
                this["attrLabel" + (i + 1)].text = "";
            }
        }
    }

    private getAttrArray(attr) {
        let noShowType = [11, 12, 23, 24];
        let showAttr = [];
        for (let i = 0; i < attr.length; i++) {
            if (noShowType.indexOf(attr[i].type) < 0) {
                showAttr.push(attr[i]);
            }
        }
        return showAttr;
    }

    private setOpenInfo(upStar: boolean = false): void {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        let configLevel: number = this.currData.level == 0 ? 1 : this.currData.level;
        let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, configLevel);
        this.cruCostId = attrConfig.costItem;
        this.Explain0.textFlow = this.Explain.textFlow = TextFlowMaker.generateTextFlow(this.countStrDesc(config));
        let count: number = UserBag.ins().getItemCountById(0, attrConfig.costItem);
        this.countTxt.text = `需要${GlobalConfig.ItemConfig[attrConfig.costItem].name}:`;
        let colorStr: string = "";
        if (count >= attrConfig.cost)
            colorStr = ColorUtil.GREEN_COLOR;
        else
            colorStr = ColorUtil.RED_COLOR;
        this.useTxt.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${count}</font><font color=${ColorUtil.WHITE_COLOR}>/${attrConfig.cost}</font> `);
        this.canUpdate = (count >= attrConfig.cost);

        let nextAttrConfig: ExRingAttrConfig;
        this.upgradebtn.visible = false;
        if (this.currentState != "final")
            this.uplevel.visible = true;
        var curStar = SpecialRing.ins().getRingStar(this.currData.level);
        if (attrConfig.judgeup > 0) {
            nextAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level + 1);
            if (this.currData.exp >= attrConfig.upPower) {
                this.starList.setStarNum(curStar, Number(upStar));
                this.upgradebtn.visible = true;
                this.uplevel.visible = false;
                if (!SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level + 1)) {
                    this.upgradebtn.label = `已满级`;
                } else {
                    this.upgradebtn.label = `进阶`;
                }
            } else {
                this.starList.setStarNum(curStar, Number(upStar));
            }
        } else {
            nextAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level + 1);
            this.starList.setStarNum(curStar, Number(upStar));
        }
        if (nextAttrConfig) {
            if (nextAttrConfig.attrAward) {
                this.nextAttrLabel.text = AttributeData.getAttStr(this.getAttrArray(nextAttrConfig.attrAward), 1);
            } else {
                this.nextAttrLabel.text = "";
            }
        }
        this.expBarChange();

        if (attrConfig.attrAward) {
            this.setLayoutAttr(attrConfig);
            let point: number = UserBag.getAttrPower(attrConfig.attrAward);
            this.powerPanel.setPower(point);
        } else {
            this.setLayoutAttr(attrConfig, true);
            this.attrLabel.text = "";
            this.powerPanel.setPower(0);
        }
    }

    private warnShow(): void {
        if (!this.canUpdate) {
            let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level);
            UserTips.ins().showTips(`${GlobalConfig.ItemConfig[attrConfig.costItem].name}不足`);
            return;
        }
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.currData.id];
        if (!(Actor.level >= config.needLevel && UserZs.ins().lv >= config.needZs)) {
            UserTips.ins().showTips(`${config.needZs > 0 ? config.needZs + `转` : ``}${config.needLevel > 0 ? config.needLevel + `级` : ``}可飞升`);
        }
        SpecialRing.ins().sendSpicelRingUpdate(this.currData.id);
    }

    private stopAutoUp(): void {
        this.isAutoUp = false;
        TimerManager.ins().remove(this.autoUpStar, this);
    }

    private autoUpStar(): void {
        let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level);
        let count: number = UserBag.ins().getItemCountById(0, attrConfig.costItem);
        if (count) {
            SpecialRing.ins().sendSpicelRingUpdate(this.currData.id);
        }
        else {
            this.isAutoUp = false;
            TimerManager.ins().remove(this.autoUpStar, this);
        }
    }

    private expBarChange(): void {
        let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level);
        let maxExp: number = attrConfig.upPower;
        let curExp = this.currData.exp;
        if (!SpecialRing.ins().getRingConfigById(this.currData.id, this.currData.level + 1)) {
            curExp = maxExp;
        } else {
            curExp = this.currData.exp > maxExp ? maxExp : this.currData.exp;
        }

        if (this.barbc.getMaximum() != maxExp) {
            this.barbc.setData(curExp, maxExp);
        } else {
            this.barbc.setValue(curExp);
        }
    }

    private countStrDesc(config: ActorExRingConfig): string {
        let configLevel: number = this.currData.level == 0 ? 1 : this.currData.level;
        let attrConfig: ExRingAttrConfig = SpecialRing.ins().getRingConfigById(this.currData.id, configLevel);
        let arr = config.explain.split("$");
        let str: string = "";
        if (arr.length > 0) {
            for (let i: number = 0; i < arr.length; i++) {
                if (Number(arr[i])) {
                    let num: number = Number(arr[i]);
                    let tempConfig: any;
                    if (num / 200 >= 1) {
                        tempConfig = attrConfig.extAttrAward;
                    } else {
                        tempConfig = attrConfig.attrAward;
                    }
                    for (let k in tempConfig) {
                        if (tempConfig[k].type == (num % 100)) {
                            if (num > 200) {
                                str += AttributeData.getExtAttStrByType(tempConfig[k], 0, "", false, false);
                            } else {
                                str += AttributeData.getAttStrByType(tempConfig[k], 0, "", false, false);
                            }
                            break;
                        }
                    }
                } else {
                    str += arr[i];
                }
            }
        } else {
            str = config.explain;
        }
        return str;
    }
}

ViewManager.ins().reg(RingInfoView, LayerManager.UI_Main);