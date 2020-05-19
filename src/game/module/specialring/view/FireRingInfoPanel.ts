/**
 * 火焰戒指信息
 * Created by Peach.T on 2017/10/30.
 */
class FireRingInfoPanel extends BaseComponent {

    public power: PowerPanel;
    public nameImg: eui.Image;
    // public img: eui.Image;
    public stairImg: LevelImage;
    public checkBtn: eui.Button;
    public info: eui.Label;
    public costTitle: eui.Label;
    public costCount: eui.Label;
    public costImg: eui.Image;
    public lvupBtn: eui.Button;
    public showBtn: eui.Button;
    public attr: eui.Group;
    public arrow: eui.Image;
    public nowAttr: eui.Label;
    public nextAttr: eui.Label;
    public nextAbility: eui.Group;
    public frame: eui.Image;
    public abilityImg: eui.Image;
    public abilitySchedule: eui.Image;
    private starList: StarList;
    public starGroup: eui.Group;
    public ultraBtn: eui.Button;
    private effRing: eui.Group;

    private _ringEff: MovieClip;

    private powerAttr;
    private isItemEnough: boolean = false;
    private lastStar: number;

    public open(): void {
        if (!this._ringEff)
            this._ringEff = new MovieClip();
        this._ringEff.playFile(RES_DIR_EFF + "tejie06", -1);
        this._ringEff.x = this.effRing.width/2;
        this._ringEff.y = this.effRing.height/2;
        this.effRing.addChild(this._ringEff);

        this.addCustomEvent();
        this.initView();
    }

    private addCustomEvent(): void {
        this.addTouchEvent(this.showBtn, this.showDetail);
        this.addTouchEvent(this.lvupBtn, this.upStar);
        this.addTouchEvent(this.checkBtn, this.showAbility);
        this.addTouchEvent(this.ultraBtn, this.showUltra);
        this.observe(SpecialRing.ins().postSpicelRingUpdate, this.initView);
        this.observe(SpecialRing.ins().postSRStairUp, this.initView);
    }

    private showUltra(): void {
        ViewManager.ins().open(RingUpgradeWin);
    }

    private showAbility(): void {
        ViewManager.ins().open(FireRingAbilityView);
    }

    private upStar(): void {
        if (this.starList.starNum == 10) {
            SpecialRing.ins().sendRingLevelUp(SpecialRing.FIRE_RING_ID);
        } else {
            if (!this.isItemEnough) {
                UserTips.ins().showTips("灵戒碎片不足");
            } else {
                SpecialRing.ins().sendSpicelRingUpdate(SpecialRing.FIRE_RING_ID);
            }
        }
    }

    private showDetail(): void {
        ViewManager.ins().open(RingDetailPanel);
    }

    private initView(): void {
        let data = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
        let stage = SpecialRing.ins().getRingStair(data.level);
        let star = SpecialRing.ins().getRingStar(data.level);
        let isUpgrade: number = 0;
        if (this.lastStar == undefined) {
             isUpgrade = 0;
        }
        else {
            if (this.lastStar < star) {
                isUpgrade = 1;
            } else {
                isUpgrade = 0;
            }
        }
         this.lastStar = star;
        let cfg: ActorExRing7Config = SpecialRing.ins().getRingConfigById(SpecialRing.FIRE_RING_ID, data.level);
        let itemCfg: ItemConfig = GlobalConfig.ItemConfig[cfg.costItem];
        let nextCfg: ActorExRing7Config = SpecialRing.ins().getRingConfigById(SpecialRing.FIRE_RING_ID, data.level + 1);
        this.stairImg.setValue(stage);
        this.costImg.source = itemCfg.icon + '_png';
        let itemCount: number = UserBag.ins().getItemCountById(0, cfg.costItem);
        let colorStr: string = "";
        let cost = cfg.cost;
        if (star == 10) {
            itemCount = 0;
            cost = 0;
            this.costImg.visible = false;
            this.costCount.visible = false;
            this.costTitle.visible = false;
            this.lvupBtn.label = "升  阶";
        } else {
            this.costImg.visible = true;
            this.costCount.visible = true;
            this.costTitle.visible = true;
            this.lvupBtn.label = "升  星";
        }
        if (itemCount >= cost) {
            colorStr = ColorUtil.GREEN_COLOR;
            this.isItemEnough = true;
        }
        else {
            colorStr = ColorUtil.RED_COLOR;
            this.isItemEnough = false;
        }
        this.costCount.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${itemCount}</font><font color=${ColorUtil.WHITE_COLOR}>/${cost}</font> `);
        this.nowAttr.text = AttributeData.getAttStr(cfg.attrAward, 0, 1, "：");
        if(nextCfg) {
            this.nextAttr.text = AttributeData.getAttStr(nextCfg.attrAward, 0, 1, "：");  
        } else {
            this.nextAttr.text = "已满级";  
        }        

        this.powerAttr = this.getRingTotalAttribute();
        let p = UserBag.getAttrPower(this.powerAttr);
        p = p * SubRoles.ins().subRolesLen;
        this.power.setPower(p);

        if (!this.starList) {
            this.starList = new StarList(10);
            this.starList.x = 15;
            this.starGroup.addChild(this.starList);
        }
        this.starList.setStarNum(star, isUpgrade);
        this.info.text = this.getNextStageAbility(stage);

        if (SpecialRing.ins().getAbilityID()) {
            this.ultraBtn.icon = "ability_0N_png";
            this.nameImg.source = "ring_title2_png";
        }
        else {
            this.ultraBtn.icon = "ability_0L_png";
            this.nameImg.source = "ring_title_png";
        }
    }

    private getRingTotalAttribute(): AttributeData[] {
        let attr;
        for (let i = 2; i <= 7; i++) { //迭代所有灵戒属性
            let lvl = 1;
            if (i == SpecialRing.FIRE_RING_ID) {
                lvl = SpecialRing.ins().getSpecialRingDataById(7).level;
            }
            let cfg = SpecialRing.ins().getRingConfigById(i, lvl);
            if (cfg){
                if (i == SpecialRing.FIRE_RING_ID) {
                    let addAttr = CommonUtils.copyDataHandler(cfg.attrAward);
                    //计算烈焰戒指基础特性概率
                    let abilityId = SpecialRing.ins().getAbilityID();
                    if (abilityId) {
                        let exRingCfg = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID][abilityId][SpecialRing.ins().abilityIds[abilityId]];
                        addAttr.forEach(function (dp, index) {
                            dp.value *= 1 + exRingCfg.attrPer / 10000;
                            dp.value = Math.round(dp.value)//四舍五入取整
                        })
                    }
                    attr = AttributeData.AttrAddition(attr, addAttr);
                }
                else {
                    attr = AttributeData.AttrAddition(attr, cfg.attrAward);
                }
            }
        }


        //唤醒任务的属性加到灵戒系统
        let taskCount: number = Object.keys(GlobalConfig.FunOpenTaskConfig).length;
        for (let i = 1; i <= taskCount; ++i) {
            if (i < UserTask.ins().awakeData.awakeTaskId){
                let config = UserTask.ins().getAwakeTypeConfById(i);
                if (config){
                    if (!attr){
                        attr = config.attr;
                    }else{
                        attr = AttributeData.AttrChangeAddition(attr,config.attr);
                    }
                }
            }
        }

        return attr;
    }

    private getNextStageAbility(stage: number): string {
        let nextstage = stage + 1;
        if (nextstage < 2) nextstage = 2;
        let count = 0;
        for (let i in GlobalConfig.ActorExRing7Config) {
            if (GlobalConfig.ActorExRing7Config[i] instanceof ActorExRing7Config) {
                count++;
            }
        }
        let cfg = GlobalConfig.ActorExRing7Config[count];
        let maxStage = SpecialRing.ins().getRingStair(cfg.level);
        while (nextstage < maxStage) {
            let skillName = SpecialRing.ins().getNextStageSkillName(nextstage);
            if (skillName) {
                return nextstage + "阶解锁" + SpecialRing.ins().getNextStageSkillName(nextstage);
            } else {
                nextstage++;
            }
        }
        return "";
    }
}