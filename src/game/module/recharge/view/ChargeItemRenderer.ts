class ChargeItemRenderer extends BaseItemRender {
	public gain0: eui.Label;
	public gain1: eui.Label;
	public pay: eui.Label;
	public yuanbaoImg: eui.Image;
	private totalPower: eui.BitmapLabel;
	public constructor() {
		super();
		this.skinName = "ChargeItemSkin";

	}

	protected dataChanged(): void {
		//元宝图片
		this.refushInfo();
	}

	private refushInfo(): void {
		this.gain0.text = this.data.itemName;
		this.gain1.text = this.data.desc;
		this.yuanbaoImg.source = this.data.icon;
		let cost: number = this.data.cash;
		this.pay.text = `￥${cost}`;
		if (Recharge.ins().getOrderByIndex(this.itemIndex + 1)) {
			this.totalPower.text = this.data.amount + "";
		} else {
			this.totalPower.text = this.data.award + "";
		}
		this.invalidateState();
	}

	protected getCurrentState(): string {
		let state = "up";
		if (Recharge.ins().getOrderByIndex(this.itemIndex + 1)) {
			if (this.selected) {
				state = "down";
			}
		} else {
			state = "firstUp"
			if (this.selected) {
				state = "fistDown";
			}
		}

		return state;
	}
}