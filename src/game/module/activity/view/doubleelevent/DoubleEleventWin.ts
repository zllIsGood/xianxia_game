/**
 * Created by Administrator on 2017/10/24.
 */
class DoubleEleventWin extends BaseEuiView {

    public roleSelect:BaseComponent;
    public viewStack:eui.ViewStack;
    public DETimeBuySkin:TimeBuyPanel;
    public DEFanliSkin:FanLinPanel;
    public DEDailyGiftSkin:DailyGiftPanel;
    public menuScroller:eui.Scroller;
    public menuList:eui.List;
    public closeBtn: eui.Button;
	public closeBtn0: eui.Button;

    private _selectIndex: number = 0;

    private _panels:any[];

    private BtnArr: ActivityBtnConfig[];//应该显示的活动

	private dataArr: eui.ArrayCollection;

    constructor()
    {
        super();
        this.skinName = "doubleElevenWin";
        this.isTopLevel = true;
        this.DETimeBuySkin.activityIDs = [150, 151, 152, 153];
        this.DEFanliSkin.activityID = 156;
        this.DEDailyGiftSkin.activityID = 130;

        this._panels = [this.DETimeBuySkin, this.DEFanliSkin, this.DEDailyGiftSkin];
    }

    public childrenCreated():void
    {
        super.childrenCreated();
        this.init();
        
    }

    public init() {
        var datas: ActivityBtnConfig[] = [];
        var btnNames:Array<any> = [];
        let data: ActivityBtnConfig
        var ids:Array<number> = [150, 156, 130];
		for (let k in Activity.ins().doubleElevenData) 
        {
			data = Activity.ins().getbtnInfo(k);
            if (btnNames.indexOf(data.icon) == -1)
            {
			    datas.push(data);
                btnNames.push(data.icon);
            }
		}

        btnNames.length = 0;
        btnNames = null;

        var panels:any[] = [];
        datas.sort(this.sort);
        for (var k in datas)
        {
            data = datas[k];
            panels.push(this._panels[ids.indexOf(data.id)]);
        }

        this.BtnArr = datas;
        this.dataArr = new eui.ArrayCollection();
        this.dataArr.source = this.BtnArr;
        this.menuList.itemRenderer = ActivityBtnRenderer;
		this.menuList.dataProvider = this.dataArr;

        this._panels = panels;
        this.viewStack.removeChildren();
        var len:number = panels.length;
        for (var i:number = 0; i < len; i++)
            this.viewStack.addChild(this._panels[i]);

        this._panels[this._selectIndex].open();
        this.menuList.selectedIndex = this._selectIndex;
        this.viewStack.selectedIndex = this._selectIndex;
        Activity.ins().setPalyEffListById(this._panels[this._selectIndex].activityID, true);
        this.viewStack.validateNow();
		this.menuList.validateNow();
    }

    public open(...args:any[]):void
    {
        this.addChangeEvent(this.menuList, this.onClickMenu);
        this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
        this.observe(Activity.ins().postActivityIsGetAwards, this.refushRedPoint);
		this.observe(Recharge.ins().postUpdateRecharge, this.refushRedPoint);
		this.observe(Recharge.ins().postRechargeTotalDay, this.refushRedPoint);
		this.observe(Recharge.ins().postUpdateRechargeEx, this.refushRedPoint);
        this.observe(Actor.ins().postYbChange, this.refushRedPoint);
		this.observe(Actor.ins().postLevelChange, this.refushRedPoint);

        this.refushRedPoint();
    }

    public close():void
    {
       this.removeTouchEvent(this.closeBtn, this.onTap);
       this.removeTouchEvent(this.closeBtn0, this.onTap);
       this.menuList.removeEventListener(egret.Event.CHANGE, this.onClickMenu, this);
       this.removeObserve();
    }

    private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

    private refushRedPoint(): void {
		this.dataArr.replaceAll(this.BtnArr);
		this.menuList.dataProvider = this.dataArr;
	}

    private sort(a: ActivityBtnConfig, b: ActivityBtnConfig): number {
		if (a.sort > b.sort)
			return 1;
		else if (a.sort < b.sort)
			return -1;
		else
			return 0;
	}

    private onClickMenu(e: egret.TouchEvent): void {
        if (this._selectIndex != e.currentTarget.selectedIndex) {
            SoundUtil.ins().playEffect(SoundUtil.WINDOW);
            this._panels[this._selectIndex].close();
        }
        
        this._selectIndex = e.currentTarget.selectedIndex;
        this._panels[this._selectIndex].open();
        this.viewStack.selectedIndex = this._selectIndex;
        Activity.ins().setPalyEffListById(this._panels[this._selectIndex].activityID, true);

    }
}

ViewManager.ins().reg(DoubleEleventWin, LayerManager.UI_Main);