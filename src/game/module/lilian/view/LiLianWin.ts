/**
 * 历练（天阶修改为成就和徽章）2016.11.18
 */
class LiLianWin extends BaseEuiView {
	private static SHENQI = 1;
	private static JUEWEI = 0;
	private static XUNZHANG = 2;
	private static BOOK = 3;
	//private static JADE     = 4;
	private static WEIWANG = 4;

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private viewStack: eui.ViewStack;
	private tab: eui.TabBar;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;//成就红点
	private redPoint2: eui.Image;//神器
	private redPoint3: eui.Image;//图鉴
	//private redPoint4: eui.Image;//玉佩
	private redPoint4: eui.Image;//威望

	private liLianPanel: NewLilianWin;	 //历练神功页
	// private nobilityPanel: NobilityPanel; //历练天阶页
	private xunzhangPanel: XunzhangPanel; //徽章
	private artifactWin: NewArtifactWin;	 //历练神器页
	private bookPanel: BookWin;//图鉴
	//private yupei:JadePanel; //玉佩
	private WeiWang: WeiWangPanel; //威望
	private _ext: any;
	private help: eui.Button;
	constructor() {
		super();
		this.skinName = "LiLianWinSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		
		let index: number = LiLianWin.JUEWEI;
		if (!LiLian.ins().checkJueWeiOpen()) {
			index = LiLianWin.SHENQI;
		}
		this.viewStack.selectedIndex = index;
		this.tab.dataProvider = this.viewStack;
		// this.tab.validateNow();
	}

	public static openCheck(...param: any[]): boolean {
		let selectedIndex = param[0] == undefined ? LiLianWin.SHENQI : param[0];
		switch (selectedIndex) {
			//神器
			case LiLianWin.SHENQI:
				break;
			//天阶
			case LiLianWin.JUEWEI:
				// id = GlobalConfig.TrainBaseConfig.actImbaId;
				if (!LiLian.ins().checkJueWeiOpen()) {
					UserTips.ins().showTips(`激活神器 鱼龙变 后开启`);
					return false;
				}
				break;
			//徽章
			case LiLianWin.XUNZHANG:
				if (!LiLian.ins().checkXunZhangOpen()) {
					UserTips.ins().showTips(`激活神器 九幽角 后开启`);
					return false;
				}
				break;
			//图鉴
			case LiLianWin.BOOK:
				if (!LiLian.ins().checkBookOpen()) {
					UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.BOOK));
					return false;
				}
				break;
			//玉佩
			/**case LiLianWin.JADE:
				if (Actor.level < GlobalConfig.YuPeiBasicConfig.openLv) {
					UserTips.ins().showTips("玉佩角色等级达到" + GlobalConfig.YuPeiBasicConfig.openLv + "级开启");
					return false;
				}
				break;*/
			//威望
			case LiLianWin.WEIWANG:
				if (!WeiWangCC.ins().isOpen) {
					UserTips.ins().showTips(`开服第${GlobalConfig.PrestigeBase.openDay}天${GlobalConfig.PrestigeBase.openLevel}级开启`);
					return false;
				}
				break;
		}
		return true;
	}

	public open(...param: any[]): void {

		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTapTouching);
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.addTouchEvent(this.closeBtn0, this.onTouch);
		this.addTouchEvent(this.help, this.onTouch);
		this.observe(LiLian.ins().postLilianData, this.setRedPoint);
		this.observe(LiLian.ins().postNobilityData, this.setRedPoint);
		this.observe(UserTask.ins().postTaskChangeData, this.setRedPoint);
		this.observe(Artifact.ins().postNewArtifactUpdate, this.setRedPoint);
		this.observe(Artifact.ins().postNewArtifactInit, this.setRedPoint);
		this.observe(BookRedPoint.ins().postRedPoint, this.setRedPoint);
		this.observe(BookRedPoint.ins().postLvlUp, this.setRedPoint);
		this.observe(Box.ins().postUpdateData, this.setRedPoint);
		this.observe(Box.ins().postUpdateFreeBox, this.setRedPoint);
		this.observe(LiLian.ins().postJadeLv, this.setRedPoint);
		this.observe(UserBag.ins().postItemAdd, this.setRedPoint);
		this.observe(UserBag.ins().postItemChange, this.setRedPoint);

		let index: number = LiLianWin.JUEWEI;
		if (!LiLian.ins().checkJueWeiOpen()) {
			index = LiLianWin.SHENQI;
		}
		if (param[0]) {
			index = param[0];
		}
		this._ext = param[1];
		this.help.visible = false;
		// else {
		// 	if (Actor.level < GlobalConfig.TrainBaseConfig.openLevel) {
		// 		index = 2;
		// 	} else {
		// 		index = 0;
		// 	}
		// }

		this.setOpenTabIndex(index);
	}

	public close(...param: any[]): void {
		this.removeObserve();
		this.removeTouchEvent(this.closeBtn, this.onTouch);
		this.removeTouchEvent(this.closeBtn0, this.onTouch);
		if (this.liLianPanel) this.liLianPanel.close();
		if (this.artifactWin) this.artifactWin.close();
		if (this.xunzhangPanel) this.xunzhangPanel.close();
		let uiview2: UIView2 = ViewManager.ins().getView(UIView2) as UIView2;
		if (uiview2)
			uiview2.closeNav(UIView2.NAV_LILIAN);
	}

	private setOpenTabIndex(index: number): void {
		this.tab.selectedIndex = this.viewStack.selectedIndex = index;
		this.setOpenIndex(index);
		this.setRedPoint();
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
				// ViewManager.ins().open(ZsBossRuleSpeak, 11);
				break;
		}
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		// if (e.currentTarget.selectedIndex == this.viewStack.selectedIndex)
		// 	return;
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private oldIndex: number = LiLianWin.JUEWEI;
	private setOpenIndex(selectedIndex: number): void {
		// let id: number = 0;
		// this.help.visible = false;
		let viewGroup = this["viewui"+selectedIndex];
		let viewPanel;
		let firstOpen = false;
		switch (selectedIndex) {
			//神器
			case LiLianWin.SHENQI:
				if (!this.artifactWin) {
					this.artifactWin = new NewArtifactWin();
					viewGroup.addChild(this.artifactWin);
					firstOpen = true;
				}
				viewPanel = this.artifactWin;
				this.artifactWin.open();
				break;
			//天阶
			case LiLianWin.JUEWEI:
				// id = GlobalConfig.TrainBaseConfig.actImbaId;
				if (LiLian.ins().checkJueWeiOpen()) {
					if (!this.liLianPanel) {
						this.liLianPanel = new NewLilianWin();
						viewGroup.addChild(this.liLianPanel);
						firstOpen = true;
					}
					viewPanel = this.liLianPanel;
					this.liLianPanel.open();
				} else {
					UserTips.ins().showTips(`激活神器 鱼龙变 后开启`)
					this.tab.selectedIndex = this.oldIndex;
				}
				break;
			//徽章
			case LiLianWin.XUNZHANG:
				if (LiLian.ins().checkXunZhangOpen()) {
					if (!this.xunzhangPanel) {
						this.xunzhangPanel = new XunzhangPanel();
						viewGroup.addChild(this.xunzhangPanel);
						firstOpen = true;
					}
					viewPanel = this.xunzhangPanel;
					this.xunzhangPanel.open();
				} else {
					UserTips.ins().showTips(`激活神器 九幽角 后开启`)
					this.tab.selectedIndex = this.oldIndex;
				}
				break;
			//图鉴
			case LiLianWin.BOOK:
				if (LiLian.ins().checkBookOpen()) {
					if (!this.bookPanel) {
						this.bookPanel = new BookWin();
						viewGroup.addChild(this.bookPanel);
						firstOpen = true;
					}
					viewPanel = this.bookPanel;
					if (this._ext) {
						this.bookPanel.open(this._ext);
						this._ext = null;
					} else {
						this.bookPanel.open();
					}
					// this.help.visible = true;
				} else {
					UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.BOOK));
					this.tab.selectedIndex = this.oldIndex;
				}

				break;
			//玉佩
			/**case LiLianWin.JADE:
				if (Actor.level >= GlobalConfig.YuPeiBasicConfig.openLv)
					this.yupei.open();
				else
				{
					UserTips.ins().showTips("玉佩角色等级达到" + GlobalConfig.YuPeiBasicConfig.openLv + "级开启")
					this.tab.selectedIndex = this.oldIndex;
				}
				break;*/
			//威望
			case LiLianWin.WEIWANG:
				if (WeiWangCC.ins().isOpen) {
					if (!this.WeiWang) {
						this.WeiWang = new WeiWangPanel();
						viewGroup.addChild(this.WeiWang);
						firstOpen = true;
					}
					viewPanel = this.WeiWang;
					this.WeiWang.open();
				}
				else {
					UserTips.ins().showTips(`开服第${GlobalConfig.PrestigeBase.openDay}天${GlobalConfig.PrestigeBase.openLevel}级开启`);
					this.tab.selectedIndex = this.oldIndex;
				}
				break;

		}
		if (firstOpen) {
			viewPanel.visible = false;
			egret.setTimeout(()=>{
				viewPanel.width = viewGroup.width;
				viewPanel.height = viewGroup.height;
				viewPanel.visible = true;
			},this,200);
		}
		this.oldIndex = this.tab.selectedIndex;
	}

	private setRedPoint(): void {
		//神器
		let lilian = LiLian.ins();
		this.redPoint0.visible = Artifact.ins().showRedPoint();
		//天阶
		this.redPoint1.visible = lilian.getLilianShenGongStast() || lilian.isGetTrainDayAwardAll();
		//徽章
		let isMaxLevel: boolean = LiLian.ins().getNobilityIsMaxLevel();
		this.redPoint2.visible = lilian.checkXunZhangOpen() && lilian.getNobilityIsUpGrade() && !isMaxLevel;
		this.redPoint3.visible = BookRedPoint.ins().redpoint || BookRedPoint.ins().canLvlUp;
		//this.redPoint4.visible = lilian.checkJadeRed();
		this.redPoint4.visible = false;
	}

	private onTapTouching(e: egret.Event) {
		if (!LiLianWin.openCheck(e.currentTarget.selectedIndex)) {
			e.preventDefault();
			return;
		}
		ViewManager.ins().close(LimitTaskView);
	}
}
ViewManager.ins().reg(LiLianWin, LayerManager.UI_Main);
