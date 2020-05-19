/**
 * 天梯（王者争霸）- 窗口
 */
class LadderWin extends BaseEuiView {

	public tab: eui.TabBar;
	public viewStack: eui.ViewStack;

	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	public redPoint4: eui.Image;

	public zaoyu: EncounterInfoWin;
	public ladder: LadderInfoPanel;
	public wakuang: MinePanel;
	private playWayPanel: PlayWayPanel;
	public redGroup: eui.Group;

	public title: eui.Image;


	private help: eui.Button;
	private closeBtn: eui.Button;

	constructor() {
		super();
		this.skinName = "ladderwinskin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.help, this.onTap);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.addChangeEvent(this.tab, this.selectIndexChange);
		this.addChangingEvent(this.tab, this.checkIsBack);
		this.addTouchEvent(this.closeBtn, this.onTap);

		this.observe(Mine.ins().postRedPoint, this.updateMineRedPoint);

		//玩法红点
		this.observe(PlayWayRedPoint.ins().postRedPoint, this.refushredPoint);


		let index: number = param[0] ? param[0] : 0;
		this.tab.selectedIndex = index;
		this.viewStack.selectedIndex = index;
		this.selectIndexChange();
		this.refushredPoint();
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.Event.CHANGING, this.onTabTouching, this.tab);
	}

	/**tab选中改变 */
	private selectIndexChange(e: egret.Event = null): void {
		switch (this.tab.selectedIndex) {
			case 0:
				this.zaoyu.open();
				break;
			case 1:
				this.ladder.open();
				break;
			case 2:
				this.wakuang.open();
				break;
			case 3:
				this.playWayPanel.open();
				break;
		}

		// this.title.source = `biaoti_jingji${this.tab.selectedIndex}`;
		this.help.visible = (this.tab.selectedIndex != 3);
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

	/**页签开启判定*/
	private checkIsOpen(index: number): boolean {
		return true;
	}

	/**更新红点提示 */
	private refushredPoint(): void {
		this.redPoint1.visible = !!Encounter.ins().isHasRed();
		this.redPoint2.visible = Ladder.ins().isCanReward || Ladder.ins().isOpen ? Ladder.ins().challgeNum > 0 : false;
		this.redPoint3.visible = Mine.redpointCheck();
		this.redPoint4.visible = PlayWayRedPoint.ins().redPoint;
	}

	private updateMineRedPoint(num) {
		this.redPoint3.visible = !!num;
	}

	/**触摸事件 */
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.help:
				//帮助按钮（？）
				if (this.tab.selectedIndex == 0) {
					ViewManager.ins().open(ZsBossRuleSpeak, 10);
				} else if (this.tab.selectedIndex == 1) {
					ViewManager.ins().open(ZsBossRuleSpeak, 4);
				} else if (this.tab.selectedIndex == 2) {
					ViewManager.ins().open(ZsBossRuleSpeak, 14);
				}
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private checkIsBack(e: egret.Event): void {
		let tab = e.target;
		if (!LadderWin.openCheck([tab.selectedIndex])) {
			e.$cancelable = true;
			e.preventDefault();
		} else {
			ViewManager.ins().close(LimitTaskView);
		}
	}

	public static openCheck(...param: any[]): boolean {
		let index: number = param[0] ? param[0] : 0;
		if (index == 0) {
			let v = GlobalConfig.SkirmishBaseConfig.openLevel;
			let b = UserFb.ins().guanqiaID >= v;
			if (!b) UserTips.ins().showTips(`通关到第${v}关开启遭遇战`);
			return b;
		}
		if (index == 1) {
			let v = GlobalConfig.TianTiConstConfig.openLevel;
			let b = Actor.level >= v;
			if (!b) UserTips.ins().showTips(`${v}级开启`);
			return b;
		} else if (index == 2) {
			return Mine.openCheck(true);
		} else if (index == 3) {
			return true;
		}
	}
}

ViewManager.ins().reg(LadderWin, LayerManager.UI_Main);