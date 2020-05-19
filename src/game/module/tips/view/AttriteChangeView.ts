/**
 *
 */
class AttriteChangeView extends BaseView {
	private _sp: egret.Sprite;
	private _bgImg: eui.Image;

	constructor() {
		super();
		this.touchEnabled = this.touchChildren = false;
		this.initView();
	}

	private initView() {
		this._sp = new egret.Sprite();
		this.addChild(this._sp);

		this._bgImg = new eui.Image();
		this._sp.addChild(this._bgImg);
	}

	public setLabelText(type: number, value: number) {

		this._sp.x = 0;
		this._sp.alpha = 1;

		this._bgImg.source = `attr${type}`;


		let powerImg = BitmapNumber.ins().createNumPic(value, "attr", 5);
		powerImg.x = 95;
		powerImg.y = 14;
		this._sp.addChild(powerImg);

		let t1: egret.Tween = egret.Tween.get(this._sp);
		t1.wait(1000).to({ "alpha": 0, "x": -300 }, 500).call(() => {

			BitmapNumber.ins().desstroyNumPic(powerImg);
			powerImg.x = 0;
			powerImg.y = 0;

			DisplayUtils.removeFromParent(this);
		}, this);
	}
}

