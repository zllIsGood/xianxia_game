/**
 * Created by hrz on 2017/8/10.
 */

class MineRecordRender extends BaseItemRender {
    private time:eui.Label;
    private des:eui.Label;
    private revenge:eui.Label;//我要复仇

    constructor(){
        super();
        this.skinName = `PlunderRecordItemSkin`;

        this.revenge.textFlow = [{text:`我要复仇`,style:{underline:true}}];
    }

    dataChanged(){
        super.dataChanged();

        let data = this.data as MineRecord;

        let config = GlobalConfig.KuangYuanConfig[data.configID];
        let color = config.color;//ItemBase.QUALITY_COLOR[config.level];

        this.time.text = DateUtils.getFormatBySecond((data.time/1000)>>0, DateUtils.TIME_FORMAT_2);

        this.revenge.visible = false;
        this.revenge.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

        if (data.type == MineRecord.TYPE_BEROB) {
            if (data.fighterIsWin) {
                this.des.textFlow = TextFlowMaker.generateTextFlow1(`|C:0x18a5eb&T:${data.fighterName}|掠夺了我的|C:${color}&T:${config.name}|`);

                this.revenge.visible = true;
                if(data.isBeatHim){
                    this.revenge.textFlow = [{text:`已复仇`}];
                    this.revenge.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
                } else {
                    this.revenge.textFlow = [{text:`我要复仇`,style:{underline:true}}];
                    this.revenge.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
                }
            } else {
                this.des.textFlow = TextFlowMaker.generateTextFlow1(`|C:0x18a5eb&T:${data.fighterName}|掠夺我的|C:${color}&T:${config.name}|失败`);
            }
        } else {
            if (data.robIsWin) {
                this.des.textFlow = TextFlowMaker.generateTextFlow1(`我成功掠夺了|C:0x18a5eb&T:${data.robMasterName}|的|C:${color}&T:${config.name}|`);
            } else {
                this.des.textFlow = TextFlowMaker.generateTextFlow1(`我掠夺|C:0x18a5eb&T:${data.robMasterName}|的|C:${color}&T:${config.name}|失败`);
            }
        }
    }

    private onTap() {
        ViewManager.ins().open(MineRobWin, this.data);
    }
}