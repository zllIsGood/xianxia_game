/**
 * Created by hrz on 2017/8/10.
 */

class MineDoneRecordRender extends BaseItemRender {
    private des0:eui.Label;
    constructor(){
        super();
        this.skinName = `DoneRecordItemSkin`;
    }

    dataChanged(){
        super.dataChanged();

        let robName = this.data.name;
        let win = this.data.win;
        let config = GlobalConfig.KuangYuanConfig[Mine.ins().finishedData.configID];
        let color = config.color;//ItemBase.QUALITY_COLOR[config.level];
        if(win) {
            this.des0.textFlow = TextFlowMaker.generateTextFlow1(`${robName}掠夺了我的|C:${color}&T:${config.name}|`);
        } else {
            this.des0.textFlow = TextFlowMaker.generateTextFlow1(`${robName}掠夺我的|C:${color}&T:${config.name}|失败`);
        }
    }
}