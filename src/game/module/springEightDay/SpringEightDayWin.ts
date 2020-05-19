/**
 * 春节八天乐活动主界面
 * @author ade
*/
class SpringEightDayWin extends BaseEuiView{
	public roleSelect:BaseComponent;
	public title:eui.Image;
	public infoBg:eui.Group;
	public actTime0:eui.Label;
	public actInfo0:eui.Label;
	public bgD:eui.Image;
	public tabD:eui.List;
	public project:eui.Group;
	public bgP:eui.Image;
	public tabP:eui.List;
	public item:eui.Scroller;
	public list:eui.List;
	public rewardBtn:eui.Image;
	public closeBtn:eui.Button;
	public bar:eui.Group;
	public schedule:eui.ProgressBar;

	private _activityID:number;

	private _curDay:number = 0;

	private _tabCollect:ArrayCollection;

	private _btnCollect:ArrayCollection;

	private _listCollect:ArrayCollection;

	private _items:any[];

	private _curDayIndex:number = 0;

	private _curGroupIndex:number = 0;
	
	public constructor() {
		super();
		this.isTopLevel = true;
		this.setActivityID();
		this.setCurSkin();
	}

	private setActivityID():void
	{
		let data = Activity.ins().activityData;
		for (let k in data)
		{
			if(data[k].pageStyle == ActivityPageStyle.SPRINGEIGHTDAY)
			{
				this._activityID = data[k].id;
				break;
			}
		}
	}

	private setCurSkin():void
	{
		let aCon:ActivityConfig = GlobalConfig.ActivityConfig[this._activityID];
		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "SFEightDayWin";

		if (this.actInfo0)
			this.actInfo0.text = aCon.desc;
	}

	public initUI(): void {
		super.initUI();

		this.tabP.itemRenderer = HappySevenDayTabListItemRender;
		this.tabD.itemRenderer = HappySevenDayBtnItemRender;
		this.list.itemRenderer = HappySevenDayItemRender;
	}

	public open(...param: any[]): void 
	{
		this._activityID = param[0];
		this.setCurSkin();	 

		this._curDayIndex = 0;
		this._curGroupIndex = 0;

		this.updateView();
		this.updateTabs();
		this.tabD.selectedIndex = this._curDayIndex;
		this.tabP.selectedIndex = this._curGroupIndex;
		
		this.updateData();
		this.updateTargetAward();
		this.addTouchEvent(this, this.onTouch);
		this.observe(Activity.ins().postActivityIsGetAwards, this.refreshReds);
		this.addChangeEvent(this.tabD, this.onClickBtn);
		this.addChangeEvent(this.tabP, this.onTabBtn);
		TimerManager.ins().doTimer(1000,0,this.setTime,this);
	}

	public close():void
	{
		this._tabCollect = null;
		this._btnCollect = null;
		this._listCollect = null;
	}

	private updateView():void
	{
		let data:ActivityType22Data = Activity.ins().getActivityDataById(this._activityID) as ActivityType22Data;
		this._curDay = data.getCurDay();

		this._items = [];
		let confs:ActivityType22_2Config[] = GlobalConfig.ActivityType22_2Config[this._activityID];
		let conf:ActivityType22_2Config;
		let btnArr:any[] = [];
		let days:any[];
		let day:number;
		let group:number;
		let groups:any[];
		let achieve:{times:number, isGot:boolean};
		for (let k in confs)
		{
			conf = confs[k];
			day = conf.day;
			days = this._items[conf.day - 1];
			if (!days)
			{
				days = [];
				this._items[conf.day - 1] = days;
				btnArr.push({res:conf.dayImg, isOpen:this._curDay >= conf.day, showRed:false, day:conf.day});
			}

			achieve = data.achieveInfo[conf.index - 1];
			if (this._curDay >= conf.day && !achieve.isGot && achieve.times >= conf.dayLimit)
				btnArr[conf.day - 1].showRed = true;

			group = conf.group;
			groups = days[group - 1];
			if (!groups)
			{
				groups = [];
				days[group - 1] = groups;
			}

			groups.push(conf);
		}

		if (!this._btnCollect)
		{
			this._btnCollect = new ArrayCollection();
			this.tabD.dataProvider = this._btnCollect;
		}

		this._btnCollect.source = btnArr;
		this.tabD.validateNow();

		if (!this._tabCollect)
		{
			this._tabCollect = new ArrayCollection();
			this.tabP.dataProvider = this._tabCollect;
		}

	}

	private refreshReds():void
	{
		this.updateView();
		this.updateTabs();
		this.updateData();
		this.updateTargetAward();
	}

	/** 当前选中天和组的奖励信息 */
	private updateData():void
	{
		let items:any[] = this._items[this._curDayIndex][this._curGroupIndex];
		if (!items || !items.length)
			return;
		
		if (!this._listCollect)
		{
			this._listCollect = new ArrayCollection();
			this.list.dataProvider = this._listCollect;
		}

		let len:number = items.length;
		let conf:ActivityType22_2Config;
		let datas:any[] = [];
		let state:number = 0;
		let achieve:{times:number, isGot:boolean};
		let activityData:ActivityType22Data = Activity.ins().getActivityDataById(this._activityID) as ActivityType22Data;
		for (let i:number = 0; i < len; i++)
		{
			conf = items[i];
			achieve = activityData.achieveInfo[conf.index - 1];
			if (achieve.isGot)
				state = 2;
			else if (achieve.times >= conf.dayLimit)
				state = 1;
			else 
				state = 0;

			datas[i] = {activityID:this._activityID, conf:conf, state:state, times:achieve.times};
		}

		datas.sort(this.sort);
		this._listCollect.source = datas;
	}

	private sort(a: any, b: any): number {
        if (a.state == 1 && b.state != 1)
            return -1;
        
        if (a.state == 2 && b.state != 2)
            return 1;

        return Algorithm.sortAsc(a.conf.index,b.conf.index);
	}

	private updateTargetAward():void
	{
		let conf:ActivityType22_1Config = GlobalConfig.ActivityType22_1Config[this._activityID][Object.keys(GlobalConfig.ActivityType22_1Config[this._activityID]).length];
		this.schedule.maximum = conf.score;
		this.schedule.value = (Activity.ins().getActivityDataById(this._activityID) as ActivityType22Data).hiScore;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.rewardBtn:
				ViewManager.ins().open(SDRewardWin, this._activityID);
				break;
		}
	}

	private onClickBtn(e: egret.TouchEvent):void
	{
		if (this._curDayIndex == e.currentTarget.selectedIndex)
			return;

		let btnItem:HappySevenDayBtnItemRender = this.tabD.getChildAt(e.currentTarget.selectedIndex) as HappySevenDayBtnItemRender;
		if (!btnItem.isOpen)
			UserTips.ins().showCenterTips("活动开启第" + btnItem.day + "天开放");
		else
		{
			btnItem = this.tabD.getChildAt(this._curDayIndex) as HappySevenDayBtnItemRender;
			btnItem.selected = false;
			this._curDayIndex = e.currentTarget.selectedIndex;
		}
		
		this.tabD.selectedIndex = this._curDayIndex;
		btnItem = this.tabD.getChildAt(this._curDayIndex) as HappySevenDayBtnItemRender;
		btnItem.selected = true;

		this.updateTabs();
		this.tabP.selectedIndex = this._curGroupIndex = 0;
		this.updateData();
	}

	private onTabBtn(e: egret.TouchEvent):void
	{
		if (this._curGroupIndex == e.currentTarget.selectedIndex)
			return;

		this._curGroupIndex = e.currentTarget.selectedIndex;
		this.tabP.selectedIndex = this._curGroupIndex;
		this.updateData();
	}

	private updateTabs():void
	{
		let days:any[] = this._items[this._curDayIndex];
		let data:ActivityType22Data = Activity.ins().getActivityDataById(this._activityID) as ActivityType22Data;
		let tabs:any[] = [];
		let len:number;
		let achieve:{times:number, isGot:boolean};
		let conf:ActivityType22_2Config;
		for (let k in days)
		{
			tabs.push({gName:days[k][0].gName, showRed:false});
			len = days[k].length;
			for (let i:number = 0; i < len; i++)
			{
				conf = days[k][i];
				achieve = data.achieveInfo[conf.index - 1];
				if (this._curDay >= conf.day && !achieve.isGot && achieve.times >= conf.dayLimit)
				{
					tabs[k].showRed = true;
					break;
				}
			}
		}

		this._tabCollect.source = tabs;
	}

	private setTime(){
        let data: ActivityType9Data = Activity.ins().activityData[this._activityID] as ActivityType9Data;
        this.actTime0.text = data.getRemainTime();
    }
}

ViewManager.ins().reg(SpringEightDayWin, LayerManager.UI_Main);