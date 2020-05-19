/**
 *  场景掉落物
 * @author
 */
class CharItem extends egret.DisplayObjectContainer {

	/** 名字显示 */
	// protected _nameTxt: eui.Label;
	/** 物品图片 */
	protected _itemImg: eui.Image;

	protected _roatImg: eui.Image;

	public constructor() {
		super();

		this.touchEnabled = false;
		this.touchChildren = false;

		// this._nameTxt = new eui.Label;
		// // this._nameTxt.fontFamily = "黑体";
		// this._nameTxt.stroke = 1;
		// this._nameTxt.strokeColor = 0x000000;
		// this._nameTxt.size = 14;
		// this._nameTxt.y = -25;
		this._itemImg = new eui.Image;
		this._itemImg.x = (-56 * 0.6) >> 1;
		this._itemImg.y = (-56 * 0.6) >> 1;
		this._itemImg.scaleX = this._itemImg.scaleY = 0.6;

		this.addChild(this._itemImg);


		this._roatImg = new eui.Image("point3");
		this._roatImg.anchorOffsetX = 5;
		this._roatImg.anchorOffsetY = 5;
		this._roatImg.alpha = 0;
		this.addChild(this._roatImg);
		// this.addChild(this._nameTxt);

		//	let s: egret.Shape = new egret.Shape();
		//	s.graphics.beginFill(0xf3311e);
		//	s.graphics.drawCircle(0,0,2);
		//	s.graphics.endFill();
		//	this.addChild(s);

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
			this.removeRoatEffect();
		}, this);
	}

	public setData(item: RewardData): void {
		// 1道具物品
		if (item.type) {
			// this._nameTxt.text = GlobalConfig.ItemConfig[item.id].name;
			// this._nameTxt.textColor = ItemBase.QUALITY_COLOR[GlobalConfig.ItemConfig[item.id].quality];
			this._itemImg.source = GlobalConfig.ItemConfig[item.id].icon + "_png";
		}
		// 0货币奖励
		else {
			if (item.id == MoneyConst.gold) {
				this._itemImg.source = "icgoods117_png";
			}
			else if (item.id == MoneyConst.yuanbao) {
				this._itemImg.source = "icgoods121_png";
			}
			else if (item.id == MoneyConst.soul) {
				this._itemImg.source = "200136_png";
			}
			else if (item.id == MoneyConst.rune) {
				this._itemImg.source = "500007_png";
			}
		}
		// this._nameTxt.x = -this._nameTxt.textWidth >> 1;
	}

	public addRoatEffect() {
		this.removeRoatEffect();
		let t: egret.Tween = egret.Tween.get(this._roatImg, {loop: true});
		t.to({alpha: 1}, 200).to({rotation: 90}, 1000).to({alpha: 0}, 200).wait(300);
	}

	public removeRoatEffect() {
		this._roatImg.alpha = 0;
		this._roatImg.rotation = 0;
		egret.Tween.removeTweens(this._roatImg);
	}

}
