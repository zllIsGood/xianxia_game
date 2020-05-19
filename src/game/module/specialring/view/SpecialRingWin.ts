/**
 * name
 */
class SpecialRingWin extends BaseEuiView {
    public colorCanvas0: eui.Image;
    public bgClose: eui.Rect;
    public nameLabel: eui.Label;
    public face: eui.Image;
    public bottomBar: eui.Group;
    public btnUse: eui.Button;
    public roleSelect: RoleSelectPanel;
    public specialAttr: eui.Label;
    public iconMc: MovieClip;
    public mcGroup: eui.Group;

    public powerPanel: PowerPanel;
    public index: number;
    public tips: eui.Image;
    public gainList0: eui.List;

    constructor() {
        super();
        this.skinName = "RingTips";
    }

    public initUI(): void {
        super.initUI();
        this.isTopLevel = true;
        this.iconMc = new MovieClip();
        this.iconMc.x = 170;
        this.iconMc.y = 160;

        this.gainList0.itemRenderer = RingGainItem;
    }

    public open(...param: any[]): void {
        this.index = param[0];
        if (param[1] == null)
            param[1] = 0;
        this.roleSelect.setCurRole(param[1]);
        if (this.iconMc && !this.iconMc.parent) this.mcGroup.addChild(this.iconMc);
        this.addTouchEvent(this.colorCanvas0, this.onTap);
        this.addTouchEvent(this.btnUse, this.onTap);
        this.addTouchEvent(this.bgClose, this.onTap);
        // this.addChangeEvent(this.roleSelect, this.roleChange);
        this.gainList0.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
        this.addSpecialListener();
        this.observe(UserBag.ins().postItemAdd, this.roleChange);//道具添加
        this.observe(UserBag.ins().postItemChange, this.roleChange);//道具变更

        let config: ExRingConfig = GlobalConfig.ExRingConfig[this.index];
        let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[config.costItem];
        this.gainList0.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
        this.roleChange();
    }

    public addSpecialListener(): void {
        this.observe(SpecialRing.ins().postRingUpdate, this.roleChange);
    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.colorCanvas0, this.onTap);
        this.removeTouchEvent(this.btnUse, this.onTap);
        this.removeTouchEvent(this.bgClose, this.onTap);
        // this.roleSelect.removeEventListener(egret.Event.CHANGE, this.roleChange, this);
        this.gainList0.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
        DisplayUtils.removeFromParent(this.iconMc);
        this.removeObserve();
    }

    private onTouchList(e: eui.ItemTapEvent): void {
        let item: Array<any> = e.item;
        if (e.item == null) {
            return;
        }
        let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
        if (openSuccess) {
            GameGuider.guidance(item[1], item[2], true);
        }
    }

    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.colorCanvas0:
            case this.bgClose:
                ViewManager.ins().close(this);
                break;
            case this.btnUse:
                if (this.btnUse.label == "激活") {
                    this.sendUpgrade();
                }
                else {
                    this.openBuyGoods();
                }
                break;
        }
    }

    private showIcon() {
        let effSoure: string = this.index ? `hushen` : `mabi`;
        this.iconMc.playFile(RES_DIR_EFF + effSoure, -1);

    }

    private ringLv: number = 0;

    protected roleChange(isUpgrade: boolean = false): void {
        this.setRedPoint();
        let select: number = this.roleSelect.getCurRole();
        this.ringLv = SubRoles.ins().getSubRoleByIndex(select).getExRingsData(this.index);
        this.showIcon();
        let config: ExRingConfig = GlobalConfig.ExRingConfig[this.index];
        let ringConfig: ExRing0Config = GlobalConfig[`ExRing${this.index}Config`][0];
        let ringNextConfig: ExRing0Config = GlobalConfig[`ExRing${this.index}Config`][1];
        if (this.ringLv == 0) {
            let len: number = CommonUtils.getObjectLength(GlobalConfig[`ExRing${this.index}Config`]);
            let itemCount: number = UserBag.ins().getItemCountById(0, config.costItem);
            let colorStr: string = "";
            if (itemCount >= ringConfig.cost)
                colorStr = ColorUtil.GREEN_COLOR;
            else
                colorStr = ColorUtil.RED_COLOR;
            if (itemCount < ringConfig.cost) {
                this.currentState = "lock";
            } else {
                this.currentState = "active";
            }
            this.validateNow();
            this.tips.source = `com_tag_unactivated`;
        } else {
            this.currentState = "actived";
            this.validateNow();
            this.tips.source = `com_tag_activated`;
        }
        let power: number = 0;
        if (ringNextConfig) {
            let attName: string = "";
            let value: number = 0;
            let i: number = 0;
            let index: number = 0;
            let str: string = "";
            for (let j: number = 0; j < ringNextConfig.attrAward.length; j++) {
                i = ringNextConfig.attrAward[j].type;
                if (i == 15 || i == 13) continue;
                attName = AttributeData.getAttrStrByType(i);
                value = ringNextConfig.attrAward[j].value;
                if (attName.length < 3)
                    attName = AttributeData.inserteBlank(attName, 7);
                this[`attr${index}`].text = `${attName}：`;
                if (i > 1 && i < 9) {
                    if (i == 7 || i == 8) {
                        str = value / 100 + "%";
                    } else {
                        str = value.toString();
                    }
                } else if (i > 12 && i < 15 || i > 15) {
                    if (i == AttributeType.atCritEnhance)
                        str = (value / 100 + 150) + "%";
                    else
                        str = value / 100 + "%";
                }
                this[`value${index}`].text = str;
                index++;
            }
            // if (this.index == 0) {
            power = UserBag.getAttrPower(ringNextConfig.attrAward);
            power += ringNextConfig.power;
            this.powerPanel.setPower(power);
            this.powerPanel.setMcVisible(false);
            // }
            let itemCfg: ItemConfig = GlobalConfig.ItemConfig[config.costItem];
            this.specialAttr.textFlow = TextFlowMaker.generateTextFlow1(itemCfg.desc);
            this.nameLabel.text = `${config.name}`;
        }
        // if (this.index == 1) {
        // 	let power: number = GlobalConfig[`ExRing1Config`][1].power;
        // 	this.powerPanel.setPower(power);
        // 	this.powerPanel.setMcVisible(false);
        // }

    }

    /**
     * 发送升级
     */
    protected sendUpgrade(): void {
        SpecialRing.ins().sendUpGrade(this.index, this.roleSelect.getCurRole());
    }

    /**
     * 打开购买物品框
     */
    protected openBuyGoods(): void {
        UserWarn.ins().setBuyGoodsWarn(GlobalConfig.ExRingConfig[this.index].costItem);
    }

    /**
     * 设置红点提示
     */
    protected setRedPoint(): void {
        let len: number = SubRoles.ins().subRolesLen;
        for (let index: number = 0; index < len; index++) {
            let role: Role = SubRoles.ins().getSubRoleByIndex(index);
            this.roleSelect.showRedPoint(index, UserRole.ins().roleHintCheck(role, this.index));
        }
    }

    /**
     * 获取战斗力接口
     */
    public getPower(): number {
        if(this.currentState == "actived"){
            return this.powerPanel.power;
        }
        return 0;
    }
}

ViewManager.ins().reg(SpecialRingWin, LayerManager.UI_Main);