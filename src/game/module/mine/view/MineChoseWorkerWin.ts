/**
 * Created by hrz on 2017/8/10.
 */

class MineChoseWorkerWin extends BaseEuiView {
    private record:eui.List;
    private advance:eui.Button;
    private start:eui.Button;
    private yuanbaoNum:eui.Label;
    private countTxt:eui.Label;
    private expBar0:eui.ProgressBar;
    private roleSelect:RoleSelectPanel;

    private _lastMineId:number;
    private _cost:number = 0;
    private checkBox:eui.CheckBox;
    private num1:eui.Label;
    private needlabel:eui.Label;
    constructor(){
        super();
        this.skinName = `ChoseWorkerSin`;
        this.isTopLevel = true;

        // this.setSkinPart("roleSelect", new RoleSelectPanel());
    }

    public initUI(){
        super.initUI();
        this.record.itemRenderer = MineChoseWorkerRender;
    }

    open() {
        this.observe(Mine.ins().postRefresh, this.update);
        this.addTouchEvent(this.advance,this.onTap);
        this.addTouchEvent(this.start,this.onTap);

        this.initList();
        this.update();
    }

    private onTap(e:egret.Event) {
        let target = e.currentTarget;
        if (target == this.advance) {
            if(!this.openCheck()){
                return;
            }
            if(this.isMaxLevel()) {
                UserTips.ins().showCenterTips(`已满级`);
                return;
            }
            let refurbish = this.checkBox.selected?1:2;

            if( this.checkBox.selected ){
                let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.CaiKuangConfig.needItem.id);//道具
                if (!itemData || itemData.count < GlobalConfig.CaiKuangConfig.needItem.count) {
                    UserTips.ins().showTips(`|C:0xff0000&T:道具不足`);
                    return;
                }
            }else{
                if (Actor.yb < this._cost) {
                    UserTips.ins().showTips(`元宝不足`);
                    return;
                }
            }
            Mine.ins().sendRefresh(refurbish);
        } else if (target == this.start) {
            if(!this.openCheck()){
                return;
            }

            if(!this.isMaxLevel()){
                WarnWin.show(`当前不是最高品质，是否确认挖矿？`,()=>{

                    Mine.ins().sendStart();
                    this.checkBox.selected = false;
                    ViewManager.ins().close(this);
                },this);
                return;
            }
            Mine.ins().sendStart();
            ViewManager.ins().close(this);
        }
    }

    private initList(){
        let configs = GlobalConfig.KuangYuanConfig;
        let arr = [];
        for (let id in configs) {
            arr.push(configs[id]);
        }
        this.record.dataProvider = new eui.ArrayCollection(arr);
        this._lastMineId = Mine.ins().mineId;
    }

    private update() {
        let refreshCost = GlobalConfig.CaiKuangConfig.refreshCost;
        let len = refreshCost.length;
        let freshCount = Mine.ins().mineFreshCount;
        let cost = len <= freshCount ? refreshCost[len-1] : refreshCost[freshCount];
        this._cost = cost;
        this.yuanbaoNum.text = `${cost}`;
        let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.CaiKuangConfig.needItem.id);//道具
        let color:number = 0x00ff00;
        if( !itemData || itemData.count < GlobalConfig.CaiKuangConfig.needItem.count ){
            color = 0xff0000;
        }
        let count = itemData?(itemData.count+""):"0";
        this.num1.textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:${count}`);
        this.needlabel.text = "/" + GlobalConfig.CaiKuangConfig.needItem.count;
        let addCount = Recharge.ins().franchise?GlobalConfig.PrivilegeData.addKuangCount:0;
        let max = GlobalConfig.CaiKuangConfig.maxOpenKuangCount + addCount;
        let cur = Mine.ins().mineCount;
        if(cur >= max) {
            this.countTxt.textFlow = TextFlowMaker.generateTextFlow1(`今日采矿次数：|C:0xff0000&T:${max-cur}/${max}|`);
        } else {
            this.countTxt.textFlow = TextFlowMaker.generateTextFlow1(`今日采矿次数：|C:0x00ff00&T:${max-cur}/${max}|`);
        }
        // this.countTxt.text = `今日采矿次数：${max-cur}/${max}`;

        if (Mine.ins().mineId) {
            let config = GlobalConfig.KuangYuanConfig[Mine.ins().mineId];
            this.expBar0.maximum = config.maxTimes;
            this.expBar0.value = Math.ceil(config.maxTimes / config.baseTime * Mine.ins().mineQuaCount);
        } else {
            this.expBar0.maximum = 10;
            this.expBar0.value = 0;
        }

        if (this.isMaxLevel()) {
            this.expBar0.maximum = 10;
            this.expBar0.value = 0;
        }

        if (this._lastMineId != Mine.ins().mineId) {
            (this.record.dataProvider as eui.ArrayCollection).refresh();
            this._lastMineId = Mine.ins().mineId;
        }
    }

    private isMaxLevel() {
        let next = Mine.ins().mineId + 1;
        if (!GlobalConfig.KuangYuanConfig[next]) {
            return true;
        }
        return false;
    }

    private openCheck(){
        let addCount = Recharge.ins().franchise?GlobalConfig.PrivilegeData.addKuangCount:0;
        if(Mine.ins().mineCount >= GlobalConfig.CaiKuangConfig.maxOpenKuangCount+addCount) {
            UserTips.ins().showCenterTips(`|C:0xff0000&T:今日挖掘次数已满|`);
            return false;
        }
        if (Mine.ins().mineStartTime) {
            UserTips.ins().showCenterTips(`|C:0xff0000&T:正在挖掘中，请耐心等候|`);
            return false;
        }
        return true;
    }

    close(){

    }

    static openCheck(){
        if (!Mine.ins().mineId) {
            Mine.ins().sendRefresh();
        }
        if (MineData.ins().mines.length >= GlobalConfig.CaiKuangConfig.maxKuangCount) {
            UserTips.ins().showCenterTips(`|C:0xff0000&T:当前矿洞已满，请前往别的矿洞|`);
            return false;
        }
        return true;
    }
}

ViewManager.ins().reg(MineChoseWorkerWin, LayerManager.UI_Main);