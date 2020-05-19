/**
 * Created by hrz on 2017/8/10.
 */

class MineChoseWorkerRender extends BaseItemRender {
    private nameTxt:eui.Label;
    private label:eui.Label;
    private reward:eui.List;
    private arrow:eui.Image;
    private selectedImg:eui.Image;
    private worker:eui.Image;
    private noRobBg:eui.Image;

    constructor(){
        super();
        this.skinName = `ChoseWorkerItemSkin`;

        this.reward.itemRenderer = ItemBase;
    }

    dataChanged(){
        super.dataChanged();
        let data = this.data as KuangYuanConfig;
        this.nameTxt.text = data.name;
        this.nameTxt.textColor = data.color;//ItemBase.QUALITY_COLOR[data.level];

        let awards = [].concat(data.rewards);
        if (data.rewardItem && data.rewardItem.length) {
            awards = awards.concat(data.rewardItem);

            this.label.visible = true;
            this.noRobBg.visible = true;
        } else {
            this.label.visible = false;
            this.noRobBg.visible = false;
        }

        this.reward.dataProvider = new eui.ArrayCollection(awards);

        let npcConfig = GlobalConfig.NpcBaseConfig[data.npcId];
        this.worker.source = npcConfig.icon;

        if (data.id == (Mine.ins().mineId || 1)) {//若没有，默认选中第一个
            this.arrow.visible = true;
            this.selectedImg.visible = true;
        } else {
            this.arrow.visible = false;
            this.selectedImg.visible = false;
        }
    }
}