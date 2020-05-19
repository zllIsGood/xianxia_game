/**
 * 战力提升漂浮
 */
class BoostPowerView extends BaseEuiView {
	private group: eui.Group;

	private img: eui.Image;
	private imgBg: eui.Image;
	private sp: egret.Sprite;
	private _boostPower: number[];
	private lastTime: number;
	private lastPower: number;

	//private curLastValue: number;
	constructor() {
		super();
		this.touchEnabled = this.touchChildren = false;
	}

	public initUI(): void {
		super.initUI();

		this.group = new eui.Group;
		this.group.width = 580;
		this.group.height = 960;
		this.group.horizontalCenter = this.group.verticalCenter = 0;
		this.addChild(this.group);

		// this.horizontalCenter = 100;
		// this.bottom = -100;

		let offSetX = 50;
		let offSetY = 100;

		this.imgBg = new eui.Image;
		this.imgBg.source = "main_fight_under";//RES.getRes("zjm_48");
		this.imgBg.x = 25 + offSetX;
		this.imgBg.y = 400 + offSetY;
		this.group.addChild(this.imgBg);
		this.imgBg.alpha = 1;
		this.imgBg.touchEnabled = false;

		this.img = new eui.Image;
		this.img.source = "main_fight_word";//RES.getRes("zjm_48");
		this.img.x = 100 + offSetX;
		this.img.y = 450 + offSetY;
		this.group.addChild(this.img);
		this.img.alpha = 1;
		this.img.visible = false;
		this.img.touchEnabled = false;

		this.sp = new egret.Sprite();
		this.sp.x = 180 + offSetX;
		this.sp.y = 474 + offSetY;
		this.group.addChild(this.sp);
		this.lastTime = 0;

		// this._boostPower = [];
		this.lastPower = 0;

		this.clearShow();
	}


	private defaultValue: number = 0;
	/**
	 * 战力提升显示
	 * @param value     提升值
	 */
	public showBoostPower(currentValue: number, lastValue: number): void {
		this.defaultValue = lastValue;
		if (this.lastPower == 0) {
			this.lastPower = lastValue;
		}
		TimerManager.ins().doTimer(500, 1, this.delayPowerUp, this);
	}

	private ii: number;

	private clearShow(): void {
		this.sp.removeChildren();
		egret.Tween.removeTweens(this.img);
		this.img.visible = false;
		egret.Tween.removeTweens(this.imgBg);
		this.imgBg.visible = false;
		TimerManager.ins().removeAll(this);
		egret.clearTimeout(this.ii);
		this.ii = 0;

	}

	private delayPowerUp() {
		let lastPower = this.lastPower ? this.lastPower : this.defaultValue;
		let currentPower = Actor.power;
		if (currentPower > lastPower)
			this.showPowerUp(lastPower, currentPower);
	}

	private showPowerUp(lasterPower: number, nowPower: number) {
		this.clearShow();
		this.img.alpha = 1;

		this.imgBg.visible = true;
		this.imgBg.alpha = 1;
		let currentPower: eui.BitmapLabel = BitmapNumber.ins().createNumPic(lasterPower, "8", 5);
		currentPower.y = -17;
		this.sp.addChild(currentPower);
		let numBoostPower = nowPower - lasterPower;
		TimerManager.ins().doTimer(20, 25, () => {
			let num: number = numBoostPower;
			num += Math.round(Math.random() * num);
			let firstNum: string = lasterPower.toString();
			let lastNum: string = "";
			if (num.toString().length == firstNum.length)
				lastNum = num.toString().slice(1);
			else
				lastNum = num + "";
			firstNum = firstNum.charAt(0);
			firstNum += lastNum;
			BitmapNumber.ins().changeNum(currentPower, firstNum, "8", 5);

		}, this, () => {
			BitmapNumber.ins().changeNum(currentPower, Actor.power, "8", 5);
			let numStr: string = "+" + numBoostPower;
			let boostPower: eui.BitmapLabel = BitmapNumber.ins().createNumPic(numStr, "r0", 5);
			BitmapNumber.ins().changeNum(boostPower, numStr, "r0", 5);
			boostPower.x = currentPower.x + currentPower.width + 10;
			boostPower.y = currentPower.y + 30;
			this.sp.addChild(boostPower);
			let moveTime = 200;
			let hideTime = 2000;
			this.lastPower = 0;
			let t: egret.Tween = egret.Tween.get(boostPower);
			t.to({ "y": boostPower.y - 30 }, moveTime).to({ "alpha": 0 }, hideTime).call(() => {
				DisplayUtils.removeFromParent(boostPower);
			}, this);
			let tt: egret.Tween = egret.Tween.get(currentPower);
			tt.wait(moveTime).to({ "alpha": 0 }, hideTime).call(() => {
				DisplayUtils.removeFromParent(currentPower);
			}, this);
			let ttt: egret.Tween = egret.Tween.get(this.img);
			ttt.wait(moveTime).to({ "alpha": 0 }, hideTime).call(() => {
				this.img.visible = false;
			}, this);
			let tttt: egret.Tween = egret.Tween.get(this.imgBg);
			tttt.wait(moveTime).to({ "alpha": 0 }, hideTime).call(() => {
				this.imgBg.visible = false;
			}, this);
		}, this)
	}
}

ViewManager.ins().reg(BoostPowerView, LayerManager.UI_Tips);
