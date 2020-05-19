import ArrayCollection = eui.ArrayCollection;
/**
 * 火焰戒指技能学习
 * Created by Peach.T on 2017/10/30.
 */
class FireRingSkillPanel extends BaseComponent {
    public power: PowerPanel;
    public listBg: eui.Image;
    public nowLv: eui.Group;
    public nowLvDesc: eui.Label;
    public nextLv: eui.Group;
    public nextLvDesc: eui.Label;
    public lvUp: eui.Group;
    public cost: eui.Label;
    public learnList: eui.List;
    public list: eui.List;
    public needItem: ItemBase;
    public opraBtn: eui.Button;
    public nobook: eui.Label;
    public updateGroup: eui.Group;
    public updateRp:eui.Image;

    private skillId: number = 0;//选中的技能书ID
    private lastSelectIndex: number;
    private isEoughItemUpgrade: boolean = false;
    private skillName: string = "";

    protected childrenCreated(): void {
        super.childrenCreated();
        this.init();
    }
    public init() {
        this.list.itemRenderer = FireRingSkillItem;
        this.learnList.itemRenderer = FireRingSkillBookItem;
    }

    public open(): void {
        this.initView();
        this.addCustomEvent();
    }

    private initView(): void {
        this.updateList();
        this.updateView(0);
    }

    private addCustomEvent(): void {
        this.addTouchEvent(this.opraBtn, this.opration);
        this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListChange, this);
        this.learnList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onLearnListChange, this);
        this.observe(SpecialRing.ins().postSkillInfo, this.refreshView);
    }

    private opration(): void {
        let data: RingSkillInfo = SpecialRing.ins().skillInfo[this.lastSelectIndex];
        if (data.skillId == 0) {
            SpecialRing.ins().requestLearnSkill(this.skillId, data.position);
        }
        else {
            if (data.skillLvl == SpecialRing.ins().getSkillMaxLvl(data.skillId)) {
                UserTips.ins().showTips(this.skillName + "已升至顶级");
            } else if (this.isEoughItemUpgrade) {
                SpecialRing.ins().requestUpgradeSkill(data.position);
            } else {
                UserTips.ins().showTips(this.skillName + "数量不足");
            }
        }
    }

    private onListChange(e: eui.ItemTapEvent): void {
        let data: RingSkillInfo = SpecialRing.ins().skillInfo[this.list.selectedIndex];
        if (!data.isOpen) {
            let lvl = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID).level;
            let stage = SpecialRing.ins().getRingStair(lvl);
            if (lvl >= SpecialRing.GRID_OPEN_LEVEL) {
                let data = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];
                if (Actor.yb >= data.skillGridYb) {
                    SpecialRing.ins().requestOpenGrid();
                }
                else {
                    UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
                }
            } else {
                UserTips.ins().showTips(SpecialRing.GRID_OPEN_LEVEL + "阶开启");
            }
        } else {
            this.updateView(e.itemIndex);
        }
    }

    private onLearnListChange(e: eui.ItemTapEvent): void {
        this.selectSkill(this.learnList.selectedIndex);
    }

    private updateList(): void {
        this.list.dataProvider = new ArrayCollection(SpecialRing.ins().skillInfo);
    }

    private refreshView(): void {
        this.updateList();
        this.updateView(this.lastSelectIndex);
    }

    private updateView(index: number): void {
        this.lastSelectIndex = index;
        this.list.selectedIndex = index;
        this.selectList();
        let skill = SpecialRing.ins().skillInfo[index];
        if (skill.skillId) {
            this.currentState = "upgrade";
            this.opraBtn.enabled = true;
            let cfg: ActorExRingBookConfig = SpecialRing.ins().getActorExRingBookConfig(skill.skillId, skill.skillLvl);
            this.skillName = cfg.skillName;
            this.nextLv.visible = true;
            this.opraBtn.visible = true;
            this.nowLvDesc.textFlow = TextFlowMaker.generateTextFlow(cfg.skillDesc);
            if (skill.skillLvl < SpecialRing.ins().getSkillMaxLvl(skill.skillId)) {
                this.nextLv.visible = true;
                let nextcfg: ActorExRingBookConfig = SpecialRing.ins().getActorExRingBookConfig(skill.skillId, skill.skillLvl + 1);
                this.nextLvDesc.textFlow = TextFlowMaker.generateTextFlow(nextcfg.skillDesc);
                this.cost.text = "X" + nextcfg.num;
                this.needItem.data = nextcfg.itemId;
                this.isEoughItemUpgrade = (UserBag.ins().getItemCountById(0, cfg.itemId) >= nextcfg.num);
                if (this.isEoughItemUpgrade) {
                    this.cost.textColor = ColorUtil.GREEN_COLOR_N;
                    this.updateRp.visible = true;
                }
                else {
                    this.cost.textColor = ColorUtil.RED_COLOR_N;
                    this.updateRp.visible = false;
                }
                this.updateGroup.visible = true;
            }
            else {
                this.isEoughItemUpgrade = true;
                this.updateGroup.visible = false;
                this.nextLv.visible = false;
                this.updateRp.visible = false;
            }
        }
        else {
            this.currentState = "study";
            this.learnList.dataProvider = new ArrayCollection(SpecialRing.ins().getStudyBook());
            if (this.learnList.dataProvider.length == 0) {
                this.nowLvDesc.visible = false;
                this.nextLvDesc.visible = false;
                this.opraBtn.enabled = false;
                this.nobook.visible = true;
            }
            else {
                this.nowLvDesc.visible = true;
                this.nextLvDesc.visible = true;
                this.opraBtn.enabled = true;
                this.nobook.visible = false;
                this.selectSkill(SpecialRing.ins().getFirstStudyBookIndex());
            }
        }
        let count = SpecialRing.ins().skillInfo.length;
        let attr = [];
        let cfg;
        let book;
        let addPower: number = 0;//加成的战斗力
        let addPercent;
        for (let i = 0; i < count; i++) {
            cfg = SpecialRing.ins().skillInfo[i];
            if (cfg.skillId > 0) {
                book = SpecialRing.ins().getActorExRingBookConfig(cfg.skillId, cfg.skillLvl);
                if (cfg.skillId <= 4) {
                    if (!attr) {
                        attr = book.attr;
                    }
                    else {
                        attr = AttributeData.AttrAddition(attr, book.attr);
                    }
                } else if (cfg.skillId == 5) {
                    addPercent = book.bookAttrPer;
                } else if (cfg.skillId > 5 && book.addPower) {
                    addPower += book.addPower * 3;
                }
            }
        }
        
        if (addPercent) {
            attr = AttributeData.AttrMultiply(attr, addPercent);
        }
        let p = UserBag.getAttrPower(attr) + addPower;
        p = p * SubRoles.ins().subRolesLen;
        this.power.setPower(p);
    }

    private selectSkill(index: number): void {
        this.learnList.selectedIndex = index;
        let data = this.learnList.dataProvider.getItemAt(index);
        let skillId = SpecialRing.ins().getSkillIdByItemId(data.id);
        let cfg: ActorExRingBookConfig = SpecialRing.ins().getActorExRingBookConfig(skillId, 1);
        this.skillId = skillId;
        this.nowLvDesc.textFlow = TextFlowMaker.generateTextFlow(cfg.skillDesc);

        let nextCfg: ActorExRingBookConfig = SpecialRing.ins().getActorExRingBookConfig(skillId, 2);
        this.nextLvDesc.textFlow = TextFlowMaker.generateTextFlow(nextCfg.skillDesc);
        this.selectLearnList();
    }

    /**
     * 设置左边列表的选中状态
     * @param index
     */
    private selectList(): void {
        let count = this.list.dataProvider.length;
        for (let i = 0; i < count; i++) {
            let item = this.list.getElementAt(i) as FireRingSkillItem;
            if (item) {
                if (i != this.list.selectedIndex) {
                    item.setSelect(false);
                } else {
                    item.setSelect(true);
                }
            }

        }
    }

    /**
     * 设置右边列表的选中状态
     * @param index
     */
    private selectLearnList(): void {
        let count = this.learnList.dataProvider.length;
        for (let i = 0; i < count; i++) {
            let item = this.learnList.getElementAt(i) as ItemBase;
            if (item) {
                if (i != this.learnList.selectedIndex) {
                    item.setSelect(false);
                } else {
                    item.setSelect(true);
                }
            }
        }
        if(this.learnList.selectedItem != undefined && this.learnList.selectedItem.id != undefined){
             this.opraBtn.enabled = SpecialRing.ins().isBookCanStudy(this.learnList.selectedItem.id);
        }
    }
}