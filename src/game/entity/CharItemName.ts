/**
 * Created by hrz on 2017/6/27.
 */

class CharItemName extends egret.DisplayObjectContainer {

	/** 名字显示 */
	protected _nameTxt: eui.Label;

	constructor() {
		super();

		this.touchEnabled = false;
		this.touchChildren = false;

		this._nameTxt = new eui.Label;
		// this._nameTxt.fontFamily = "黑体";
		this._nameTxt.stroke = 1;
		this._nameTxt.strokeColor = 0x000000;
		this._nameTxt.size = 14;
		this._nameTxt.y = -25;
		this._nameTxt.width = 120;
		this._nameTxt.x = -60;
		this._nameTxt.textAlign = egret.HorizontalAlign.CENTER;
		this.addChild(this._nameTxt);
	}

	public setData(item: RewardData): void {
		// 1道具物品
		if (item.type) {
			if (item.id == 500007) { //符文精华
				this._nameTxt.text = "" + item.count;
			} else {
				let itemName = GlobalConfig.ItemConfig[item.id].name;
				if (item.count > 1) {
					this._nameTxt.text = item.count+itemName;
				} else {
					this._nameTxt.text = itemName;
				}
			}
			this._nameTxt.textColor = ItemConfig.getQualityColor(GlobalConfig.ItemConfig[item.id]);
		}
		// 0货币奖励
		else {
			// this.config = null;
			if (item.id == MoneyConst.gold) {
				this._nameTxt.text = "" + item.count;
				this._nameTxt.textColor = ItemBase.QUALITY_COLOR[0];
			}
			else if (item.id == MoneyConst.yuanbao) {
				this._nameTxt.text = `${item.count}元宝`;
				this._nameTxt.textColor = ItemBase.QUALITY_COLOR[5];
			} else if (item.id == MoneyConst.soul) {
				this._nameTxt.text = `${item.count}聚灵石`;
				this._nameTxt.textColor = ItemBase.QUALITY_COLOR[2];
			} else if (item.id == MoneyConst.rune) {
				this._nameTxt.text = `${item.count}精华`;
				this._nameTxt.textColor = ItemBase.QUALITY_COLOR[1];
			}
		}
		// this._nameTxt.x = -this._nameTxt.textWidth >> 1;
	}
}