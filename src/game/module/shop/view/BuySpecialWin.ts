/**
 *
 * @author yyl
 *
 */
class BuySpecialWin extends BaseEuiView {
	private add1Btn: eui.Button;
	private add10Btn: eui.Button;
	private sub1Btn: eui.Button;
	private sub10Btn: eui.Button;
	private buyBtn: eui.Button;

	private unitPrice: eui.Label;
	private allPrice: eui.Label;
	private numLabel: eui.Label;
	public num: number;
	private maxNum: number;//最大可购买个数

	private bgClose: eui.Rect;
	private yuanbao0: eui.Image;
	private yuanbao1: eui.Image;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "BuySpecialSkin";
		this.num = 3;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.add1Btn, this.onTap);
		this.addTouchEvent(this.add10Btn, this.onTap);
		this.addTouchEvent(this.sub1Btn, this.onTap);
		this.addTouchEvent(this.sub10Btn, this.onTap);
		this.addTouchEvent(this.buyBtn, this.buy);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addChangeEvent(this.numLabel, this.inputOver);
		this.num = 3;
		this.updateView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.add1Btn, this.onTap);
		this.removeTouchEvent(this.add10Btn, this.onTap);
		this.removeTouchEvent(this.sub1Btn, this.onTap);
		this.removeTouchEvent(this.sub10Btn, this.onTap);
		this.removeTouchEvent(this.buyBtn, this.buy);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.numLabel.removeEventListener(egret.Event.CHANGE, this.inputOver, this);
	}

	private updateView(): void {
		this.numLabel.text = this.num + "";
		this.unitPrice.text = `${GlobalConfig.GuardGodWeaponConf.sSummonCost[0]}`;
		this.allPrice.text = (this.num * parseInt(this.unitPrice.text)) + "";
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sub10Btn:
				this.num -= 10;
				break;
			case this.sub1Btn:
				this.num -= 1;
				break;
			case this.add10Btn:
				this.num += 10;
				break;
			case this.add1Btn:
				this.num += 1;
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}

		if (this.num < 0)
			this.num = 0;
		if (this.num > this.maxNum) {
			this.num = this.maxNum;
		}

		this.numLabel.text = this.num + "";
		this.inputOver();
	}

	private closeCB(e: egret.TouchEvent) {
		ViewManager.ins().close(BuyWin);
	}

	private buy(e: egret.TouchEvent) {
		if (Actor.yb >= parseInt(this.allPrice.text)) {
			UserFb.ins().sendShSweep(parseInt(this.numLabel.text));
			ViewManager.ins().close(this);
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}
	}

	private inputOver(e?: egret.Event) {
		this.num = parseInt(this.numLabel.text);
		if (isNaN(this.num) || this.num < 0)
			this.num = 0;
		if (this.num > 3)
			this.num = 3;
		if (this.num > this.maxNum) {
			this.num = this.maxNum;
		}
		this.numLabel.text = this.num + "";
		this.allPrice.text = (this.num * parseInt(this.unitPrice.text)) + "";
	}

}

ViewManager.ins().reg(BuySpecialWin, LayerManager.UI_Popup);
