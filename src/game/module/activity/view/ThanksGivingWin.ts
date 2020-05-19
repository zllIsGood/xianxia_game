/**
 *
 * @author 感恩节活动入口
 *
 */
class ThanksGivingWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;

	public menuScroller: eui.Scroller;
	public menuList: eui.List;
	public rightBtn: eui.Button;
	public leftBtn: eui.Button;
	public rightEff: MovieClip;
	public leftEff: MovieClip;//
	private leftRed: eui.Image;
	private rightRed: eui.Image;

	public activityPanelList: any[] = [];
	private _datas: ActivityBtnConfig[];
	private BtnArr: ActivityBtnConfig[];//应该显示的活动
	private dataArr: eui.ArrayCollection;

	private selectIndex: number;

	public roleSelect: RoleSelectPanel;
	private title:eui.Image;
	constructor() {
		super();
		this.skinName = "ActivityWinSkin";
		this.isTopLevel = true;
		this.selectIndex = 0;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}

	public destoryView(): void {
		super.destoryView();
		this.roleSelect.destructor();
	}

	public initUI(): void {
		super.initUI();

		this.menuList.itemRenderer = ActivityBtnRenderer;

	}

	private checkIndexByActivityId(actId: number): number {
		for (let i = 0; i < this.activityPanelList.length; i++) {
			if (this.activityPanelList[i].activityID == actId) {
				return i;
			}
		}
		return 0;
	}

	public static openCheck(...param: any[]): boolean {
		for (let k in Activity.ins().activityData) {
			if( Activity.ins().activityData[k].pageStyle != ActivityPageStyle.THANKS )
				continue

			if (Activity.ins().getActivityDataById(+k).isOpenActivity()) {
				return true;
			}
		}
		UserTips.ins().showTips(`|C:0xff0000&T:很遗憾,感恩节活动已经结束了`);
		return false;
	}
	private actId:number;
	public open(...param: any[]): void {

		this.actId = param[0];

		this.updateView();

		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addChangeEvent(this.menuList, this.onClickMenu);
		this.addTouchEvent(this.leftBtn, this.onTouchBtn);
		this.addTouchEvent(this.rightBtn, this.onTouchBtn);
		this.observe(Activity.ins().postActivityPanel, this.updatePanel);//所有活动刷新
		this.observe(Activity.ins().postActivityIsGetAwards, this.refushRedPoint);
		this.observe(Recharge.ins().postUpdateRecharge, this.refushRedPoint);
		this.observe(Recharge.ins().postRechargeTotalDay, this.refushRedPoint);
		this.observe(Recharge.ins().postUpdateRechargeEx, this.refushRedPoint);
		this.observe(Activity.ins().postChangePage, this.ChangePageCallBack);//单份活动刷新

		this.addChangeEvent(this.menuScroller, this.onChange);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.closeBtn0, this.onClick);
		this.menuList.removeEventListener(egret.Event.CHANGE, this.onClickMenu, this);
		this.removeTouchEvent(this.leftBtn, this.onTouchBtn);
		this.removeTouchEvent(this.rightBtn, this.onTouchBtn);
		this.menuScroller.removeEventListener(egret.Event.CHANGE, this.onChange, this);

		this.removeObserve();
		TimerManager.ins().removeAll(this);

		for (let i: number = 0; i < this.activityPanelList.length; i++) {
			this.activityPanelList[i].close();
		}
	}

	private refushRedPoint(): void {
		this.dataArr.replaceAll(this.BtnArr);
		this.menuList.dataProvider = this.dataArr;
	}

	private updateView() {
		let index: number = 0;
		let i = 0;
		for (i = 0; i < this.viewStack.numElements; i++) {
			ObjectPool.push(this.viewStack.getElementAt(i));
		}
		this.viewStack.removeChildren();
		this.activityPanelList = [];
		this._datas = [];
		i = 0;
		for (let k in Activity.ins().activityData) {
			if( Activity.ins().activityData[k].pageStyle != ActivityPageStyle.THANKS ){
				continue;//此界面不处理非感恩节活动外的活动
			}
			if (Activity.ins().getActivityDataById(+k).isOpenActivity()) {
				let data: ActivityBtnConfig = Activity.ins().getbtnInfo(k)
				if (!ErrorLog.Assert(data, "ThanksGivingWin  data   " + k))
					this._datas.push(data);
			}
		}

		this._datas.sort(this.sort);
		this.BtnArr = [];
		for (let k in this._datas) {
			let id: number = this._datas[k].id;
			let act: ActivityBaseData = Activity.ins().getActivityDataById(+id);
			if (act && act.id == id) {
				let hide: boolean = act.getHide();
				if (!hide) {
					let panel: ActivityPanel = ActivityPanel.create(id,act.activityType);
					if (!panel)
						continue;
					panel.top = 0;
					panel.left = 0;
					panel.bottom = 0;
					panel.right = 0;
					this.activityPanelList[i] = panel;
					this.viewStack.addChild(this.activityPanelList[i]);
					this.BtnArr.push(this._datas[k]);
					if (this.actId && this.actId == id) {
						index = i;
					}
					i++;
				}
			}

		}


		this.dataArr = new eui.ArrayCollection(this.BtnArr);
		this.menuList.dataProvider = this.dataArr;
		this.onChange();

		TimerManager.ins().doTimer(1000, 0, this.timerFunc, this);
		if (this.viewStack.numElements > 0) {
			// if( index )//道具获取方式指定跳转
			// 	index = this.checkIndexByActivityId(index);
			this.setOpenIndex(index);
		}
		this.viewStack.validateNow();
		this.menuList.validateNow();

		if (index >= 5) {
			let scrollH = 92 * index;
			if (scrollH > this.menuList.contentWidth - this.menuScroller.width) {
				scrollH = this.menuList.contentWidth - this.menuScroller.width;
			}
			this.menuList.scrollH = scrollH;
		}

		// this.title.source = `biaoti_ganen`;

	}

	private timerFunc(): void {
		for (let k in Activity.ins().activityData) {
			if (DateUtils.formatMiniDateTime(Activity.ins().getActivityDataById(+k).startTime) == GameServer.serverTime ||
				DateUtils.formatMiniDateTime(Activity.ins().getActivityDataById(+k).endTime) == GameServer.serverTime) {

				TimerManager.ins().removeAll(this);
				this.updateView();
			}
		}
	}

	private updatePanel(activityID: number) {
		for (let k in this.activityPanelList) {
			if (this.activityPanelList[k].activityID == activityID) {
				this.activityPanelList[k].updateData();
				break;
			}
		}
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}

	private setOpenIndex(selectedIndex: number): void {
		this.activityPanelList[selectedIndex].open();
		this.viewStack.selectedIndex = selectedIndex;
		this.menuList.selectedIndex = selectedIndex;
		Activity.ins().setPalyEffListById(this.activityPanelList[selectedIndex].activityID, true);
		this.refushRedPoint();
	}

	private onClickMenu(e: egret.TouchEvent): void {
		this.actId = 0;//不再指定打开某个活动
		if (this.selectIndex != e.currentTarget.selectedIndex) {
			SoundUtil.ins().playEffect(SoundUtil.WINDOW);
			if (this.activityPanelList[this.selectIndex])
				this.activityPanelList[this.selectIndex].close();
		}
		this.selectIndex = e.currentTarget.selectedIndex;
		if (this.activityPanelList[this.selectIndex].activityID > 10000)
			this.setOpenIndex(this.selectIndex);
		else {
			let config = GlobalConfig.ActivityConfig[this.activityPanelList[this.selectIndex].activityID];
			if (config) {
				if (config.activityType == 3) {
					this.setOpenIndex(this.selectIndex);
				} else {
					Activity.ins().sendChangePage(this.activityPanelList[this.selectIndex].activityID);
				}
			}
		}
	}

	private ChangePageCallBack() {
		if( this.actId )
			this.selectIndex = this.checkIndexByActivityId(this.actId);
		this.setOpenIndex(this.selectIndex);
	}

	private onChange(): void {
		if (this.menuList.scrollH < 46) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = true;
		} else if (this.menuList.scrollH >= this.menuList.contentWidth - this.menuList.width - 46) {
			this.leftBtn.visible = true;
			this.rightBtn.visible = false;
		} else {
			this.leftBtn.visible = true;
			this.rightBtn.visible = true;
		}
		if (this.viewStack.numElements <= 5) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = false;
		}

		this.leftRed.visible = this.leftBtn.visible;
		this.rightRed.visible = this.rightBtn.visible;

	}

	private onTouchBtn(e: egret.TouchEvent): void {
		let num: number = 92 * 5;
		let scrollH: number = 0;
		switch (e.target) {
			case this.leftBtn:
				scrollH = this.menuList.scrollH - num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH < 0) {
					scrollH = 0;
				}
				this.menuList.scrollH = scrollH;
				break;
			case this.rightBtn:
				scrollH = this.menuList.scrollH + num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH > this.menuList.contentWidth - this.menuScroller.width) {
					scrollH = this.menuList.contentWidth - this.menuScroller.width;
				}
				this.menuList.scrollH = scrollH;
				break;
		}
		this.onChange();
	}

	private sort(a: ActivityBtnConfig, b: ActivityBtnConfig): number {
		if (a.sort > b.sort)
			return 1;
		else if (a.sort < b.sort)
			return -1;
		else
			return 0;
	}
}

ViewManager.ins().reg(ThanksGivingWin, LayerManager.UI_Main);