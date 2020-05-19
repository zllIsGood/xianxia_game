/**
 * 火焰戒指能力预览的ITEM
 * Created by Peach.T on 2017/11/2.
 */
class FireRingAbilityItem extends ItemRenderer {
    public stateLabel: eui.Label;
    public descLabel: eui.Label;
    public skillImg: eui.Image;
    public imgBg: eui.Image;
    public imgIcon: eui.Image;
    public nameTxt: eui.Label;

    public dataChanged(): void {
        let index: number = this.data;
        let cfg: ActorExRingAbilityConfig = GlobalConfig.ActorExRingAbilityConfig[index];
        this.nameTxt.text = cfg.abilityName;
        this.descLabel.textFlow = TextFlowMaker.generateTextFlow(cfg.abilityDesc);
        this.imgIcon.source = cfg.abilityIcon;

        let ringData: SpecialRingData = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
        let stage: number = SpecialRing.ins().getRingStair(ringData.level);
        if (stage >= cfg.ringLv) {
            this.stateLabel.text = "";
        } else {
            this.stateLabel.text = "("+SpecialRing.ins().getUnLockStage(index) + "阶解锁)";
            this.stateLabel.textColor = ColorUtil.RED_COLOR_N;
        }

    }
}
