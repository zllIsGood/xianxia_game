/**
 * Created by hrz on 2017/8/9.
 */

class MineNpcHead extends BaseComponent {
    contentGroup:eui.Group;
    nameTxt:eui.Label;
    timeTxt:eui.Label;
    titleImg:eui.Image;
    icon:eui.Image;
    workerState:eui.Image;
    stateGroup:eui.Group;
    states:string[] = [`none`,`mine`];
    private eff:MovieClip;
    private titleGroup:eui.Group;

    constructor(){
        super();
        this.skinName = `MineNpcHeadSkin`;
        this.contentGroup.touchEnabled = false;
        this.touchEnabled = false;
    }

    updateModel(info:NpcModel){
        let config = info.npcConfig;
        if (config && config.title) {
            this.titleGroup.visible = true;
        } else {
            this.titleGroup.visible = false;
        }
        this.titleImg.source = config ? config.title : "";
        this.icon.source = config ? config.headIcon : "";
    }

    //挖矿
    updateState(info:MineModel){
        if(info.isBeFight) {
            this.setState(1);
        } else if (MineData.ins().getIsCanAtk(info)) {
            this.setState(2);
        } else {
            this.setState(0);
        }
    }

    private setState(state:number) {
        if(state == 1) {
            this.workerState.source = "";
        } else if (state == 2) {
            this.workerState.source = "jingji_json.kuanggong_title";
        } else {
            this.workerState.source = "";
        }
        this.setEff(state);
    }

    private setEff(state) {
        if(state == 1) {
            let eff = this.getEff();
            eff.playFile(RES_DIR_EFF+"fighting", -1);
            eff.x = this.stateGroup.width>>1;
            eff.y = -20;
            this.stateGroup.addChild(eff);
        } else {
            if(this.eff){
                DisplayUtils.removeFromParent(this.eff);
                this.eff.dispose();
            }
        }
    }

    private getEff() {
        if(!this.eff) {
            this.eff = new MovieClip();
        }
        return this.eff;
    }
}