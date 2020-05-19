/**
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveWin extends BaseEuiView {

	public viewStack: eui.ViewStack;
	public DTLuckyTurntableSkin: DoubleTwelveLottery;
	public DTDailyGiftSkin: DoubleTwelveGift;
	public menuScroller: eui.Scroller;
	public menuList: eui.List;
	public closeBtn: eui.Button;

	private selectIndex: number;
	private panels;

	constructor() {
		super();
		this.skinName = "doubleTwelveWin";
		this.isTopLevel = true;
	}

	public open(...args: any[]): void {
		this.menuList.itemRenderer = ActivityBtnRenderer;
		this.addChangeEvent(this.menuList, this.onClickMenu);
		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.observe(Activity.ins().postChangePage, this.updateView);
		this.observe(Activity.ins().postRewardResult, this.updateView);
		this.observe(Activity.ins().postActivityIsGetAwards, this.updateView);
		this.updateView();
	}

	private updateView(): void {
		let btnIcons = [];
		for (let i in Activity.ins().doubleTwelveData) {
			let data = Activity.ins().getbtnInfo(i);
			let activity = Activity.ins().doubleTwelveData[i];
			if (activity.isOpenActivity()) {
				btnIcons.push(data);
				if (activity.type == 2) {
					this.DTDailyGiftSkin.activityID = activity.id;
				}
				else {
					this.DTLuckyTurntableSkin.activityID = activity.id;
				}
			}
		}
		btnIcons.sort((obj1, obj2) => {
			return Algorithm.sortAscAttr(obj1, obj2, "sort")
		});
		this.menuList.dataProvider = new ArrayCollection(btnIcons);
		this.panels = [this.DTDailyGiftSkin, this.DTLuckyTurntableSkin];
		if (!this.selectIndex) {
			this.selectIndex = 0;
		}
		this.viewStack.selectedIndex = this.selectIndex;
		this.panels[this.selectIndex].open();
	}

	private onClickMenu(e: egret.TouchEvent): void {
		if (this.selectIndex != e.currentTarget.selectedIndex) {
			SoundUtil.ins().playEffect(SoundUtil.WINDOW);
			this.panels[this.selectIndex].close();
		}

		this.selectIndex = e.currentTarget.selectedIndex;
		this.viewStack.selectedIndex = this.selectIndex;
		this.panels[this.selectIndex].open();
		Activity.ins().setPalyEffListById(this.panels[this.selectIndex].activityID, true);

	}
}
ViewManager.ins().reg(DoubleTwelveWin, LayerManager.UI_Main);