/**
 * Created by yangsong on 2014/11/24.
 * 显示对象工具类
 */
class DisplayUtils {

	private static openShake: boolean = true;

	public static setShakeOn($on: boolean) {
		this.openShake = $on;
	}

	/**
	 * 创建一个Bitmap
	 * @param resName resource.json中配置的name
	 * @returns {egret.Bitmap}
	 */
	public static createBitmap(resName: string): egret.Bitmap {
		let result: egret.Bitmap = new egret.Bitmap();
		let texture: egret.Texture = RES.getRes(resName);
		result.texture = texture;
		return result;
	}

	/**
	 * 创建一张Gui的图片
	 * @param resName
	 * @returns {egret.Bitmap}
	 */
	public static createEuiImage(resName: string): eui.Image {
		let result: eui.Image = new eui.Image();
		let texture: egret.Texture = RES.getRes(resName);
		result.source = texture;
		return result;
	}

	/**
	 * 从父级移除child
	 * @param child
	 */
	public static removeFromParent(child: egret.DisplayObject) {
		if (!child || child.parent == null)
			return;

		child.parent.removeChild(child);
	}

	private static shakingList = {};

	/**
	 * 震动指定的显示对象
	 * @param target 震动的对象
	 * @param range 震动幅度 单位像素
	 * @param duration 一组震动（四方向）持续的时间
	 * @param times 震动的次数 （4方向为一次）
	 * @param condition 条件 传入判断的方法 执行返回false则不执行震动
	 */
	public static shakeIt(target: egret.DisplayObject,
		range: number,
		duration: number,
		times: number = 1,
		condition: Function = () => {
			return true
		}) {
		if (!this.openShake || !target || times < 1 || !condition()) return;
		let shakeSet = [
			{ anchorOffsetX: 0, anchorOffsetY: -range },
			{ anchorOffsetX: 0, anchorOffsetY: +range },
			{ anchorOffsetX: 0, anchorOffsetY: 0 },
		];
		egret.Tween.removeTweens(target);
		let delay: number = duration / shakeSet.length;
		egret.Tween.get(target).to(
			shakeSet[0], delay
		).to(
			shakeSet[1], delay
			).to(
			shakeSet[2], delay
			).call(() => {
				DisplayUtils.shakeIt(target, range, duration, --times);
			}, this
			);
	}

	public static shakeItHeji(target: egret.DisplayObject,
		range: number,
		duration: number,
		times: number = 1,
		condition: Function = () => {
			return true
		}): void {
		if (!this.openShake || !target || times < 1 || !condition()) return;
		let shakeSet = [
			{ anchorOffsetX: +range * 0.1, anchorOffsetY: +range },
			{ anchorOffsetX: -range * 0.1, anchorOffsetY: -range },
			{ anchorOffsetX: +range * 0.1, anchorOffsetY: +range },
			{ anchorOffsetX: -range * 0.1, anchorOffsetY: -range },
			{ anchorOffsetX: (+range >> 1) * 0.1, anchorOffsetY: +range >> 1 },
			{ anchorOffsetX: (-range >> 1) * 0.1, anchorOffsetY: -range >> 1 },
			{ anchorOffsetX: (+range >> 2) * 0.1, anchorOffsetY: +range >> 2 },
			{ anchorOffsetX: 0, anchorOffsetY: 0 },
		];
		egret.Tween.removeTweens(target);
		let delay: number = duration / shakeSet.length;
		egret.Tween.get(target).to(
			shakeSet[0], delay
		).to(
			shakeSet[1], delay
			).to(
			shakeSet[2], delay
			).to(
			shakeSet[3], delay
			).to(
			shakeSet[4], delay
			).to(
			shakeSet[5], delay
			).to(
			shakeSet[6], delay
			).to(
			shakeSet[7], delay
			).call(() => {
				DisplayUtils.shakeIt(target, range, duration, --times);
			}, this
			);

	}

	static shakeItEntity(target: egret.DisplayObject,
		range: number,
		duration: number,
		times: number = 1,
		condition: Function = () => {
			return true
		}) {
		if (!this.openShake || !target || times < 1 || !condition()) return;

		let shakeSet = [
			{ anchorOffsetX: 0, anchorOffsetY: -range },
			{ anchorOffsetX: -range, anchorOffsetY: 0 },
			{ anchorOffsetX: range, anchorOffsetY: 0 },
			{ anchorOffsetX: 0, anchorOffsetY: range },
			{ anchorOffsetX: 0, anchorOffsetY: 0 },
		];
		egret.Tween.removeTweens(target);
		let delay: number = duration / 5;
		egret.Tween.get(target).to(
			shakeSet[0], delay
		).to(
			shakeSet[1], delay
			).to(
			shakeSet[2], delay
			).to(
			shakeSet[3], delay
			).to(
			shakeSet[4], delay
			).call(() => {
				this.shakeIt(target, range, duration, --times);
			}, this
			);
	}

	/**画扇形 */
	public static drawCir(shape: egret.Shape, radius: number, angle: number, anticlockwise?: boolean, startAngle?: number): egret.Shape {
		if (shape == null) {
			shape = new egret.Shape();
		}

		function changeGraphics(): void {
			shape.graphics.clear();

			shape.graphics.beginFill(0x00ffff, 1);
			shape.graphics.moveTo(0, 0);
			shape.graphics.lineTo(radius, 0);
			shape.graphics.drawArc(0, 0, radius, startAngle * Math.PI / 180, angle * Math.PI / 180, anticlockwise);
			shape.graphics.lineTo(0, 0);
			shape.graphics.endFill();
		}

		changeGraphics();

		return shape;
	}

	/**画矩形 */
	public static drawrect(shape: egret.Shape, width: number, height: number, anticlockwise?: boolean): egret.Shape {
		if (shape == null) {
			shape = new egret.Shape();
		}

		function changeGraphics(): void {
			shape.graphics.clear();
			shape.graphics.beginFill(0x00ffff, 1);
			shape.graphics.drawRect(0, 0, width, height);
			shape.graphics.endFill();
		}

		changeGraphics();
		return shape;
	}

	/**
	 * 根据特效名返回特效路径
	 * @param effectName
	 * @returns {string}
	 */
	public static getEffectPath(effectName: string): string {
		return RES_DIR_EFF + effectName;
	}

	/**
	 * 根据职业获取更改的外观
	 * @param  {string} fileName
	 * @param  {number} job
	 * @returns string
	 */
	public static getAppearanceByJob(fileName: string, job: number): string {
		let source: string = fileName;
		if (source && source.indexOf("[job]") > -1)
			source = source.replace("[job]", job + "");
		return source;
	}

	/**
	 * 根据性别获取更改的外观
	 * @param  {string} fileName
	 * @param  {number} sex
	 * @returns string
	 */
	public static getAppearanceBySex(fileName: string, sex: number): string {
		return `${fileName}_${sex}_c_png`;
	}

	/**
	 * 根据职业与性别更改的外观
	 * @param  {string} fileName
	 * @param  {number} job
	 * @param  {number} sex
	 * @returns string
	 */
	public static getAppearanceByJobSex(fileName: string, job: number, sex: number): string {
		return this.getAppearanceBySex(this.getAppearanceByJob(fileName, job), sex);
	}

	/**
	 * 闪动一个对象
	 * @params  {any} obj 需要闪动的对象
	 * @params  {boolean} isFlash 是否闪动
	 * @params  {number} t 闪动间隔
	 * @returns void
	 */
	public static flashingObj(obj: egret.DisplayObject, isFlash: boolean, t: number = 300): void {
		let flash: Function = function (): void {
			if (isFlash) {
				obj.visible = true;
				let a = obj.alpha == 1 ? 0 : 1;
				egret.Tween.removeTweens(obj);
				egret.Tween.get(obj).to({ alpha: a }, t).call(flash);
			} else {
				egret.Tween.removeTweens(obj);
				obj.alpha = 1;
				obj.visible = false;
			}
		}
		obj.once(egret.Event.REMOVED_FROM_STAGE, () => { egret.Tween.removeTweens(obj); }, this)
		flash();
	}

	/**上下律动 */
	public static upDownGroove(target: egret.DisplayObject, anchorOffsetY1: number, anchorOffsetY2: number) {
		egret.Tween.removeTweens(target);
		let t: egret.Tween = egret.Tween.get(target);
		t.to(
			{ "anchorOffsetY": anchorOffsetY1 }, 1500).to(
			{ "anchorOffsetY": anchorOffsetY2 }, 1500).call(
			this.upDownGroove, this, [target, anchorOffsetY1, anchorOffsetY2]
			);
	}

	/**
	 * 闪动一个对象一次
	 * @params  {any} obj 需要闪动的对象
	 * @params  {number} t 闪动间隔
	 * @returns void
	 */
	public static flashingOnceObj(obj: egret.DisplayObject, isVisible: boolean, t: number = 300): void {
		obj.visible = isVisible;
		let flash: Function = function (): void {
			let bBheck: boolean = isVisible ? obj.visible : (!obj.visible);
			if (bBheck) {
				obj.visible = !isVisible;
				obj.alpha = isVisible ? 1 : 0;
				let a: number = isVisible ? 0 : 1;
				let b: number = isVisible ? 1 : 0;
				egret.Tween.removeTweens(obj);
				egret.Tween.get(obj).to({ alpha: a }, t).to({ alpha : b }, t).call(flash);
			} else {
				egret.Tween.removeTweens(obj);
				obj.alpha = isVisible ? 1 : 0;
				obj.visible = isVisible;
			}
		}
		obj.once(egret.Event.REMOVED_FROM_STAGE, () => { egret.Tween.removeTweens(obj); }, this)
		flash();
	}

	/**
	 * [upDownSineInOut 上下浮动]
	 * @param {egret.DisplayObject} target [浮动对象]
	 * @param {number}              offset [浮动距离]
	 * ps:主意对象不能被设置y轴上的约束，否则无法进行tween动画
	 */
	public static upDownSineInOut(target: egret.DisplayObject,offset: number): void{
		egret.Tween.removeTweens(target);
		target.addEventListener(egret.Event.RESIZE,function () {
            target.anchorOffsetX = target.width/2;
            target.anchorOffsetY = target.height/2;
        },this);
        egret.Tween.get(target,{loop:true}).to({y:target.y+offset},2500,egret.Ease.sineInOut).to({y:target.y},2500,egret.Ease.sineInOut);
	}

	  /**滚动条滚动至底部 */
	public static scrollerToBottom(scroller: eui.Scroller): void {
		scroller.viewport.validateNow();
		if (scroller.viewport.contentHeight > scroller.height) {
			scroller.viewport.scrollV = scroller.viewport.contentHeight - scroller.height;
		}
	}

	public static alphaTween(target: egret.DisplayObject, time: number, start: number = 0, end: number = 1) {
		target.alpha = start;
		egret.Tween.get(target).to({alpha:end},time);
	}
}
