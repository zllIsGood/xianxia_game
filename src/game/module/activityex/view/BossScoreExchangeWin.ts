class BossScoreExchangeWin extends BaseEuiView {

    private activityID: number;
    private exchangelist: eui.List;
    private equiplist: eui.List;
    private currentSelect: number = 0;
    private suipian: eui.Label;
    // private suipian1: eui.Label;
    private dataArr: eui.ArrayCollection;
    private listData: Map<ActivityType7Config[]>;//页签内容数据
    private menuData: {id: number,index: number}[];//页签数据
    // public static FIRE_RING_SCORE: number = 202;//策划要求拿活动202判定显示火焰戒指积分兑换皮肤
    private bgClose: eui.Rect;
    private closeBtn:eui.Button;
    public initUI(): void {
        super.initUI();
        this.isTopLevel = true;
        this.skinName = "hefuBossjifenSkin";
        
        
        this.equiplist.itemRenderer = BossScoreExchangeBtn;
        this.dataArr = new eui.ArrayCollection;
        this.listData = {};
        this.menuData = [];
    }

    public open(...param: any[]): void {
        this.activityID = param[0];
        this.initMenu();
        let cfg:ActivityType7Config = GlobalConfig.ActivityType7Config[this.activityID][1];
        if (cfg && cfg.showType == ActivityType7Data.TYPE_RING) {
            this.currentState = "lyring";
            this.exchangelist.itemRenderer = RingBossScoreExchangeItem;
             
        } else {
            this.currentState = "hefu";
            this.equiplist.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
            this.exchangelist.itemRenderer = BossScoreExchangeItem;
        }
        // this.exchangelist.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
        // this.observe(UserBag.ins().postItemChange, this.onListChange);//道具变更
        // this.observe(UserBag.ins().postItemAdd, this.onListChange);//道具添加
        // this.observe(UserBag.ins().postItemDel, this.onListChange);//道具删除
        this.observe(Activity.ins().postRewardResult,this.onListChange);
        this.observe(Activity.ins().postChangePage, this.ChangePageCallBack);
        this.addTouchEvent(this.bgClose, this.onClick);
        this.addTouchEvent(this.closeBtn, this.onClick);
        if (cfg && cfg.showType != ActivityType7Data.TYPE_RING) this.equiplist.selectedIndex = this.currentSelect;
        // TimerManager.ins().doNext(()=>{ this.refushInfo();}, this);
        this.refushInfo();
    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.bgClose, this.onClick);
        this.removeTouchEvent(this.closeBtn, this.onClick);
        this.equiplist.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
        // this.exchangelist.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
        this.removeObserve();
    }
    private onClick(e: egret.TouchEvent){
        switch (e.currentTarget){
            case this.closeBtn:
            case this.bgClose:
                ViewManager.ins().close(this);
                break;
        }
    }
    private onListChange(): void {
        Activity.ins().sendChangePage(this.activityID);//重新请求7号消息获取积分数据

    }
    private ChangePageCallBack(){
        this.refushInfo();
    }

    private initMenu(): void {
        let config: ActivityType7Config[] = GlobalConfig.ActivityType7Config[this.activityID];
        let index: number = -1;//页签索引

        let curTitle = 0;//页签具体数据
        for (let k in config) {
            if (curTitle != config[k].title) {//下一个页签内容
                curTitle = config[k].title;
                index++;
                if (!this.menuData)
                    this.menuData = [];
                this.menuData.push({id: config[k].Id, index: config[k].index});
            }
            if (!this.listData[index])
                this.listData[index] = [];
            this.listData[index].push(config[k]);
        }
    }

    private refushInfo(): void {
        let data:ActivityType7Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType7Data;
        this.suipian.text = `${data.bossScore}`;
        this.dataArr.replaceAll(this.listData[this.currentSelect].concat());
        this.exchangelist.dataProvider = this.dataArr;
        this.exchangelist.scrollV = 0;
        this.exchangelist.validateNow();
        let cfg:ActivityType7Config = GlobalConfig.ActivityType7Config[this.activityID][1];
        if (cfg && cfg.showType != ActivityType7Data.TYPE_RING) this.equiplist.dataProvider = new eui.ArrayCollection(this.menuData);
    }

    private onListTap(e: eui.ItemTapEvent): void {
        if (e && e.itemRenderer && e.item) {
            if (this.listData[this.currentSelect][e.itemIndex]) {

            }
        }
    }

    //选择兑换列表数据
    private onTap(e: eui.ItemTapEvent): void {
        if (e && e.itemRenderer && e.item) {
            this.currentSelect = e.itemIndex;
            this.refushInfo();
        }
    }
}

ViewManager.ins().reg(BossScoreExchangeWin, LayerManager.UI_Popup);
