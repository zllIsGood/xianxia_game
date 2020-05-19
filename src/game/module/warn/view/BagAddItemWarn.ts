/**
 * 格子扩张购买框
 */
class BagAddItemWarn extends BaseEuiView {
	public price: PriceIcon;
	public decBtn: eui.Button;
	public addBtn: eui.Button;
	public count: eui.Label;
	public sureBtn: eui.Button;
	public cancelBtn: eui.Button;
	public closeBtn: eui.Button;
	public bgClose: eui.Rect;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "OpenCellSkin";
		this.price.setType(MoneyConst.yuanbao);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.decBtn, this.onTap);
		this.addTouchEvent(this.addBtn, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);
		this.addTouchEvent(this.cancelBtn, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setCount(5);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.decBtn, this.onTap);
		this.removeTouchEvent(this.addBtn, this.onTap);
		this.removeTouchEvent(this.sureBtn, this.onTap);
		this.removeTouchEvent(this.cancelBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
	}

	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.decBtn:
				this.setCount(Number(this.count.text) - 5);
				break;
			case this.addBtn:
				this.setCount(Number(this.count.text) + 5);
				break;
			case this.sureBtn:
				if (Actor.yb >= this.price.getPrice()) {
					// ControllerManager.ins().applyFunc(ControllerConst.Bag, BagFunc.ADD_BAG_GRID, Number(this.count.text) / 5);
					UserBag.ins().sendAddBagGrid(Number(this.count.text) / 5);
				} else {
					UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
					ViewManager.ins().close(this);
					break;
				}
			case this.cancelBtn:
			case this.closeBtn:
				ViewManager.ins().close(BagAddItemWarn);
				break;
			case this.bgClose:
				ViewManager.ins().close(BagAddItemWarn);
				break;
		}
	}

	private setCount(num: number): void {
		let config: BagBaseConfig = GlobalConfig.BagBaseConfig;
		let bagExConfig: BagExpandConfig[] = GlobalConfig.BagExpandConfig;
		let bagExConfigLen: number = CommonUtils.getObjectLength(bagExConfig);
		let row: number = (UserBag.ins().bagNum - config.baseSize) / config.rowSize;
		let canOpenNum: number = (bagExConfigLen - row) * config.rowSize;
		if (num < 5) {
			num = 5;
			UserTips.ins().showTips("|C:0xf3311e&T:已经是最小扩张数|");
		} else if (num > canOpenNum) {
			num = canOpenNum;
			UserTips.ins().showTips("|C:0xf3311e&T:已经是最大扩张数|");
		}
		this.count.text = "" + num;
		let ybNum: number = 0;
		let len: number = num / config.rowSize;
		for (let i: number = 1; i <= len; i++) {
			ybNum += bagExConfig[row + i].cost;
		}
		this.price.setPrice(ybNum);
	}
}

ViewManager.ins().reg(BagAddItemWarn, LayerManager.UI_Popup);
