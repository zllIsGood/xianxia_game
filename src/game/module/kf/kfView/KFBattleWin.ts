/**
 * Created by MPeter on 2018/1/18.
 * 跨服副本-总界面
 */
class KFBattleWin extends BaseEuiView {
	private roleSelect: BaseComponent;
	private viewStack: eui.ViewStack;
	/**跨服总览 */
	private kffieldPanel: KffieldPanel;
	/**跨服掉落播报 */
	private kffieldRecordPanel: KffieldRecordPanel;
	/**跨服竞技场排行 */
	public rankPanel: KfArenaRankPanel;

	private tab: eui.TabBar;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private seeRule: eui.Button;
	private closeBtn: eui.Button;

	private oldIndex: number;

	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `KFFieldWinSkin`;
	}

	public open(...param): void {
		this.oldIndex = this.tab.selectedIndex = this.viewStack.selectedIndex = param[0] ? param[0] : 0;
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.addTouchEvent(this.seeRule, this.onTouch);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.setOpenIndex(this.oldIndex);

		this.observe(KFBattleRedPoint.ins().postRedPoint, this.refRedpoint);
		this.observe(KfArenaRedPoint.ins().postRedPoint, this.refRedpoint);


		this.refRedpoint();
	}

	public close(...param): void {
		if (this.viewStack.getElementAt(this.oldIndex) && this.viewStack.getElementAt(this.oldIndex)['close'])
			this.viewStack.getElementAt(this.oldIndex)['close']();
	}


	private onTabTouch(e: egret.TouchEvent): void {
		let index = this.tab.selectedIndex;
		this.setOpenIndex(index);
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

	private checkIsOpen(index: number): boolean {
		return true;
	}

	private setOpenIndex(selectedIndex: number): void {
		switch (selectedIndex) {
			case 0:
				this.kffieldPanel.open();
				break;
			case 1:
				this.kffieldRecordPanel.open();
				break;
			case 2:
				this.rankPanel.open();
				break;
		}

		if (this.oldIndex != selectedIndex) {
			if (this.viewStack.getElementAt(this.oldIndex)['close'])
				this.viewStack.getElementAt(this.oldIndex)['close']();
			this.oldIndex = selectedIndex;
		} else {
			this.tab.selectedIndex = this.viewStack.selectedIndex = selectedIndex;
		}
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn:
				ViewManager.ins().close(KFBattleWin);
				break;
			case this.seeRule:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[34].text);
				break;
		}
	}

	private refRedpoint(): void {
		this.redPoint0.visible = KFBattleRedPoint.ins().redPoint > 0 || KfArenaRedPoint.ins().redpoint > 0;
		this.redPoint1.visible = false;
	}

	public static openCheck(...param: any[]): boolean {
		return true;

	}

}

ViewManager.ins().reg(KFBattleWin, LayerManager.UI_Main);
