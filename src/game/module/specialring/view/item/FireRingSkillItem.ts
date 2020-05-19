import ItemRenderer = eui.ItemRenderer;
/**
 * 火焰戒指技能ITEM
 * Created by Peach.T on 2017/11/1.
 */
class FireRingSkillItem extends ItemRenderer {
    public skillName: eui.Label;
    public skillImg: eui.Image;
    public skillLv: eui.Label;
    public select: eui.Image;
    public price: PriceIcon;
    public redpoint:eui.Image;

    constructor() {
        super();

        TimerManager.ins().doNext(() => {
            let shape: egret.Shape = new egret.Shape();
            shape.graphics.beginFill(0x00ff00);
            shape.graphics.drawRoundRect(0, 0, this.width, this.height, 1, 1);
            shape.graphics.endFill();
            shape.alpha = 0;
            this.addChild(shape);
        }, this);
    }

    public dataChanged(): void {
        if (!this.data || Object.keys(this.data).length <= 0 || this.data["null"] != null) return;
        let data: RingSkillInfo = this.data;
        if (data.isOpen) {
            if (data.skillId) {
                this.currentState = "learn";
                this.validateNow();//改皮肤状态后,调用validateNow()再设置数据,避免被状态的默认数据覆盖
                let cfg = SpecialRing.ins().getActorExRingBookConfig(data.skillId, data.skillLvl);
                this.skillImg.source = cfg.skillIcon;
                this.skillLv.text = `Lv${data.skillLvl}`;
                this.skillName.text = cfg.skillName;
                let num = UserBag.ins().getItemCountById(0, cfg.itemId);
                this.redpoint.visible = (num >= cfg.num);
            }
            else {
                this.currentState = "unlearn";
                this.redpoint.visible = SpecialRing.ins().isCanStudySkill();
            }
        } else {
            this.currentState = "lock";
            let lvl = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID).level;
            let stage = SpecialRing.ins().getRingStair(lvl);
            if (stage < SpecialRing.GRID_OPEN_LEVEL) {
                TimerManager.ins().doNext(() => { this.skillName.text = `${SpecialRing.GRID_OPEN_LEVEL}阶解锁`; }, this);
                this.price.visible = false;
            }
            else {
                this.price.visible = true;
                TimerManager.ins().doNext(() => { this.skillName.text = "未解锁"; }, this);
                let data = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];

                this.price.setPrice(data.skillGridYb);
            }
        }
        this.select.visible = this.selected;
    }

    public setSelect(isSelect: boolean): void {
        this.select.visible = isSelect;
    }
}
