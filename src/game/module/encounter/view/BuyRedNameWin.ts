// TypeScript file
class BuyRedNameWin extends BaseEuiView {
	constructor() {
		super();
		this.skinName = "ZaoYuQueSkin";
		this.horizontalCenter = 0;
		this.verticalCenter = 0;
	}

	private btnBuy: eui.Button;
	private btnClose: eui.Button;
	private btnClose0: eui.Button;
	private pkNow: eui.Label;
	private ybNum: eui.Label;
	private pkValue: eui.Label;

	public open(...param) {
		this.addTouchEvent(this.btnBuy, this.onTap);
		this.addTouchEvent(this.btnClose, this.onTap);
		this.updateText();
	}

	private updateText() {
		this.pkNow.text = `${EncounterModel.redName}`;
		this.ybNum.text = `${Math.ceil((EncounterModel.redName - GlobalConfig.SkirmishBaseConfig.maxPkval + 1) * GlobalConfig.SkirmishBaseConfig.subPkvalCost)}`;
		this.pkValue.text = `${EncounterModel.redName - GlobalConfig.SkirmishBaseConfig.maxPkval + 1}`;
	}

	public close() {
		this.removeTouchEvent(this.btnBuy, this.onTap);
		this.removeTouchEvent(this.btnClose, this.onTap);
	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.btnBuy:
				if (Actor.yb >= Math.floor((EncounterModel.redName - GlobalConfig.SkirmishBaseConfig.maxPkval + 1) * GlobalConfig.SkirmishBaseConfig.subPkvalCost)) {
					Encounter.ins().sendCleanRedName();
					Encounter.ins().buyAndFight = true;
				} else {
					UserTips.ins().showTips("元宝不足");
					ViewManager.ins().close(this);
					break;
				}
		}
		ViewManager.ins().close(BuyRedNameWin);
	}
}
ViewManager.ins().reg(BuyRedNameWin, LayerManager.UI_Popup);