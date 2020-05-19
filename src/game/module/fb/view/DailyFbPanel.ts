/**
 * Created by hrz on 2018/3/29.
 */

class DailyFbPanel extends BaseView {
	private viewStack: eui.ViewStack;
	private fbExpPanel: FbExpPanel;
	private guardWeaponPanel: GuardWeaponPanel;
	// private demonCirclePanel: DemonCircleFbWin;
	private tab: eui.TabBar;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;

	private redPointGroup: eui.Group;

	private lastSelect: number = -1;

	constructor() {
		super();
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		this.tab.itemRenderer = ExpFbItemRender;
		this.tab.dataProvider =	new eui.ArrayCollection(["tab_dailyfb_0_png","tab_dailyfb_1_png"]);
	}

	open(...param) {
		this.tab.validateNow();
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.checkIsOpen);


		this.observe(DailyFbRedPoint.ins().postExp, this.updateRedPoint);
		this.observe(DailyFbRedPoint.ins().postGuardWeapon, this.updateRedPoint);
		// this.observe(DailyFbRedPoint.ins().postDemonCircle, this.updateRedPoint);

		//守护神剑
		if (GuardWeaponModel.ins().getCanSee()) {
			if (!this.guardWeaponPanel.parent) {
				this.viewStack.addChildAt(this.guardWeaponPanel, 1);
				// this.redPointGroup.addChildAt(this.redPoint1, 1);
			}
		}
		 else {
			if (this.guardWeaponPanel.parent) {
				this.viewStack.removeChild(this.guardWeaponPanel);
				// this.redPointGroup.removeChild(this.redPoint1);
			}
		}

		// //恶魔法阵
		// if (DemonCir.ins().getCanSee()) {
		// 	if (!this.demonCirclePanel.parent) {
		// 		this.viewStack.addChildAt(this.demonCirclePanel, 1);
		// 		this.redPointGroup.addChildAt(this.redPoint2, 1);
		// 	}
		// } else {
		// 	if (this.demonCirclePanel.parent) {
		// 		this.viewStack.removeChild(this.demonCirclePanel);
		// 		this.redPointGroup.removeChild(this.redPoint2);
		// 	}
		// }

		this.setOpenIndex(param[0] || 0);
		this.updateRedPoint();
	}

	private onTabTouch(e: egret.Event) {
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private setOpenIndex(index: number) {
		if (this.lastSelect > -1) {
			let view = this.viewStack.getChildAt(this.lastSelect);
			view['close'] && view['close']();
		}
		this.lastSelect = index;
		this.tab.selectedIndex = this.lastSelect;
		this.viewStack.selectedIndex = this.lastSelect;
		this.viewStack.getChildAt(this.lastSelect)['open']();
	}

	private checkIsOpen(e: egret.Event) {
		if (!DailyFbPanel.checkIndexOpen(this.tab.selectedIndex)) {
			e.preventDefault();
			return;
		}
	}

	static checkIndexOpen(index: number) {
		if (index == 0) {
			if (Actor.level < GlobalConfig.ExpFubenBaseConfig.openLv) {
				UserTips.ins().showTips(`${GlobalConfig.ExpFubenBaseConfig.openLv}级开启`);
				return false;
			}
		}
		else if (index == 1) {
			if (!GuardWeaponModel.ins().isOpen()) {
				UserTips.ins().showTips(GuardWeaponModel.ins().getDesc());
				return false;
			}
		}
		//  else if (index == 2) {
		// 	let zs = GlobalConfig.DemonCirConf.openzhuanshenglv;
		// 	if (UserZs.ins().lv < zs) {
		// 		UserTips.ins().showTips(`开服${GlobalConfig.DemonCirConf.openserverday}天并达到${zs}转开启`);
		// 		return false;
		// 	}
		// }
		return true;
	}

	private updateRedPoint(): void {
		this.redPoint0.visible = DailyFbRedPoint.ins().expRed;
		this.redPoint1.visible = DailyFbRedPoint.ins().guardRed;
		// this.redPoint2.visible = DailyFbRedPoint.ins().demonRed;
	}

	close() {

	}
}