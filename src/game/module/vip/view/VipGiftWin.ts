/**
 * Created by hrz on 2017/9/4.
 */
class VipGiftWin extends BaseEuiView {
    public VipPanelList: any[] = [];
    private viewStack:eui.ViewStack;
    private curIndex:number;//N次合服
    private tab:eui.TabBar;
    private redPointGroup:eui.Group;
    private closeBtn:eui.Button;
    private hfcount:number[];
    constructor(){
        super();
        this.skinName = `VipGiftMainSkin`;
        this.isTopLevel = true;
    }

    protected childrenCreated(){
        super.childrenCreated();

    }

    open(...param: any[]):void {
        this.addChangeEvent(this.tab, this.onTabTouch);
        this.addChangingEvent(this.tab, this.onTabTouching);
        this.addTouchEvent(this.closeBtn, this.onTouch);
        this.observe(UserVip.ins().postVipGiftBuy, this.updateRedPoint);
        this.curIndex = param[0]?param[0]:0;
        this.checkIndex();
        this.create();
        this.updateView();
    }
    private checkIndex(){
        let page = UserVip.ins().getVipPage();
        if( UserVip.ins().checkVipSuccess(page[this.curIndex]) ){
            for( let i = 0;i < page.length;i++ ){
                if( this.curIndex == i )continue;
                let hfcount = page[i];
                if( UserVip.ins().checkVipSuccess(hfcount) )continue;
                this.curIndex = i;
                break;
            }
        }

    }
    private updateView(){
        
        this.VipPanelList[this.curIndex].open(this.curIndex);
        
        this.tab.selectedIndex = this.viewStack.selectedIndex = this.curIndex;
        this.updateRedPoint();
        //检测已买完的标签页
        let maxVipPage = UserVip.ins().getVipPage();
        for( let i = 0; i < maxVipPage.length;i++ ){
            let hfcount = maxVipPage[i];
            let b = UserVip.ins().checkVipSuccess(hfcount);
            if( b ){
                DisplayUtils.removeFromParent(this.VipPanelList[i]);
                DisplayUtils.removeFromParent(this[`redPoint${i}`]);
            }
        }

    }
    private updateRedPoint(){
        let maxVipPage = UserVip.ins().getVipPage();
        for( let i = 0; i < maxVipPage.length;i++ ){
            let hfcount = maxVipPage[i];
            this[`redPoint${i}`].visible = false;
            for( let k in GlobalConfig.VipGiftConfig ){
                let hfTimes = GlobalConfig.VipGiftConfig[k].hfTimes?GlobalConfig.VipGiftConfig[k].hfTimes:0;
                if( hfcount != hfTimes )continue;
                this[`redPoint${i}`].visible = UserVip.ins().getVipGiftRedPoint(GlobalConfig.VipGiftConfig[k].id);
                if( this[`redPoint${i}`].visible )break;
            }
            // let b = UserVip.ins().checkVipSuccess(hfcount);
            // if( b ){
            //     DisplayUtils.removeFromParent(this.VipPanelList[i]);
            //     DisplayUtils.removeFromParent(this[`redPoint${i}`]);
            // }
        }
    }
    private onTabTouching(e: egret.TouchEvent) {
        if (!this.checkIsOpen(e.currentTarget.selectedIndex)) {
            e.preventDefault();
            return;
        }
    }
    private onTouch(e:egret.TouchEvent){
        ViewManager.ins().close(this);
    }
    /**
     * 点击标签页按钮
     */
    private onTabTouch(e: egret.TouchEvent): void {
        this.setOpenIndex(e.currentTarget.selectedIndex);

    }
    private setOpenIndex(selectedIndex: number): void {
        this.VipPanelList[selectedIndex].open(this.hfcount[selectedIndex]);
    }

    private checkIsOpen(index: number) {
        if( index > GameServer._hefuCount ){
            UserTips.ins().showTips(`本服未到${index}次合服`);
            return false;
        }
        return true;
    }


    close() {
        for( let i = 0;i < this.VipPanelList.length;i++ ){
            this.VipPanelList[i].close();
        }
    }

    create(){
        this.viewStack.removeChildren();
        this.redPointGroup.removeChildren();
        this.hfcount = UserVip.ins().getVipPage();
        for( let i = 0; i < this.hfcount.length;i++ ){
            let panel = new VipGiftPanel(this.hfcount[i]);
            if (!panel)continue;
            panel.top = 0;
            panel.left = 0;
            panel.bottom = 0;
            panel.right = 0;
            let config:VipGiftConfig = UserVip.ins().getVipIndex(this.hfcount[i]);
            if( config )
                panel.name = config.pageName?config.pageName:"";
            this.VipPanelList[i] = panel;
            this.viewStack.addChild(this.VipPanelList[i]);
            this.redPointGroup.addChild(this[`redPoint${i}`]);
            this[`redPoint${i}`].visible = false;
        }
        this.tab.dataProvider = this.viewStack;
    }
    /**
     * 获取vip界面
     * @param 合服次数
     * */
    private getVipPanel(index: number) {
        for (let i = 0; i < this.VipPanelList.length; i++) {
            if (this.VipPanelList[i].curIndex == index) {
                return this.VipPanelList[i];
            }
        }
        return null;
    }

}

ViewManager.ins().reg(VipGiftWin, LayerManager.UI_Main);