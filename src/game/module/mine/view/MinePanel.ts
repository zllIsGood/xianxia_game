/**
 * Created by hrz on 2017/8/8.
 */

class MinePanel extends BaseEuiView {
    private redPoint:eui.Image;
    private workNum:eui.Label;
    private plunderNum:eui.Label;
    private go:eui.Button;
    constructor(){
        super();
        // this.skinName = `WaKuangSkin`;
    }

    open() {
        this.addTouchEvent(this.go, this.onTap);
        this.observe(Mine.ins().postRedPoint, this.updateRedPoint);

        this.update();
    }

    private update() {
        let addCount = Recharge.ins().franchise?GlobalConfig.PrivilegeData.addKuangCount:0;
        let maxCount = GlobalConfig.CaiKuangConfig.maxOpenKuangCount+addCount;
        let curCount = Mine.ins().mineCount;
        this.workNum.text = `挖掘次数：${maxCount-curCount}/${maxCount}`;

        let maxRobCount = GlobalConfig.CaiKuangConfig.maxRobCount;
        let curRobCount = Mine.ins().robCount;
        this.plunderNum.text = `掠夺次数：${maxRobCount-curRobCount}/${maxRobCount}`;

        this.redPoint.visible = Mine.redpointCheck();
    }

    private updateRedPoint(num) {
        this.redPoint.visible = !!num;
    }

    private onTap(e:egret.Event) {
        if(!UserFb.ins().checkInFB()) {
            Mine.ins().sendIntoMine();
        }
    }
}