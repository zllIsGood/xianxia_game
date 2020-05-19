/**
 * Created by hrz on 2017/10/12.
 */

class OSATarget3BigRewardItemRender extends BaseComponent {
    private reward:ItemBase;
    private days:eui.Label;
    private state:eui.Image;
    private select:eui.Image;
    private EquipEffect:MovieClip;

    constructor() {
        super();
        // this.skinName = `OSASeriesBigRewardItem`;
    }

    setData(actId, index) {
        this.reward.touchEnabled = false;

        let config = GlobalConfig.ActivityType3Config[actId][index];
        let act = Activity.ins().getActivityDataById(actId) as ActivityType3Data;
        this.days.text = `累充${act.dabiao[index-1]}/${config.day}天`;
        this.reward.data = config.rewards[0];
        this.reward.isShowName(false);

        // if(act.dabiao[index-1]>=config.day && ((act.recrod>>index) & 1) == 0){
        //     this.showEquipEffect(true);
        // } else {
        //     this.showEquipEffect(false);
        // }

        if(((act.recrod>>index) & 1) == 1){
            this.state.visible = true;
        } else {
            this.state.visible = false;
        }
    }

    private showEquipEffect(b): void {
        if (!b) {
            if (this.EquipEffect) DisplayUtils.removeFromParent(this.EquipEffect);
        } else {
            this.EquipEffect = this.EquipEffect || new MovieClip();
            this.EquipEffect.touchEnabled = false;
            this.EquipEffect.x = 45;
            this.EquipEffect.y = 48;
            this.EquipEffect.scaleX = 1.6;
            this.EquipEffect.scaleY = 1.6;
            if (!this.EquipEffect.parent) this.addChild(this.EquipEffect);
            this.EquipEffect.playFile(RES_DIR_EFF + "quaeff4", -1);
        }
    }

    setSelected(b:boolean) {
        this.select.visible = b;
    }
}