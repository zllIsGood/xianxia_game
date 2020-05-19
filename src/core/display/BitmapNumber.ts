/**
 * 素材需要提前加载好
 * 素材命名规则：类型_数值（有类型是因为一般会同时有几种数字图片，比如大小号或不同颜色）
 * 点号素材命名：类型_dot
 * 创建BitmapNumber使用createNumPic返回DisplayObjectContainer
 * 创建好的BitmapNumber数值需要变化是调用changeNum
 * 回收使用desstroyNumPic
 *
 * Created by Saco on 2014/8/1.
 * 
 * 此工具本来是应对egret 2.1.x版本前没有 bitmaplabel所创造和使用的
 * 目前的游戏引擎eui库已经支持位图字体，所以改写成使用eui.bitmapLabel实现,本工具还保有对象池管理等作用
 * 支持异步加载
 * 对比之前的做法创造多个位图对象，性能有提升
 * changed by AlexLam on 2018/1/3
 */
class BitmapNumber extends BaseClass {
	private _labelPool: eui.BitmapLabel[];

	public constructor() {
		super();
		this._labelPool = [];
	}


	public static ins(): BitmapNumber {
		return super.ins() as BitmapNumber;
	}
	/*
	 * 创建一个艺术字
	 * */
	public createNumPic(num: number | string, type: string, offset: number = 0, offsetY: number = 0): eui.BitmapLabel {
		return this.createNumPicWithFullName(num, `num_${type}`, offset, offsetY);
	}

	/*
	 * 创建一个艺术字 num完整
	 * */
	public createNumPicWithFullName(num: number | string, type: string, offset: number = 0, offsetY: number = 0): eui.BitmapLabel {
		let numStr: string = num.toString();

		let tempBm: eui.BitmapLabel = this.getLabel();
		tempBm.font = `${type}_fnt`;
		tempBm.letterSpacing = offset - 9;
		tempBm.lineSpacing = offsetY;
		tempBm.text = numStr;
		return tempBm;
	}

	//销毁
	public desstroyNumPic(target: eui.BitmapLabel): void {
		this.recycleBM(target);
	}

	/*
	 * 改变
	 * */
	public changeNum(target: eui.BitmapLabel, num: number | string, type: string, offset: number = 0, offsetY: number = 0): void {
		let numStr: string = num.toString();

		target.text = numStr;
		target.font = `num_${type}_fnt`;
		target.letterSpacing = offset - 9;
		target.lineSpacing = offsetY;
	}

	//回收
	private recycleBM(target: eui.BitmapLabel): void {
		if (target) {
			DisplayUtils.removeFromParent(target);
			target.scaleX = target.scaleY = target.alpha = 1;
			target.x = target.y = target.letterSpacing = target.lineSpacing
				= target.anchorOffsetX = target.anchorOffsetY = 0;
			target.text = "";
			target.font = null;
			this._labelPool.push(target);
		}
	}

	private getLabel(): eui.BitmapLabel {
		if (this._labelPool.length)
			return this._labelPool.shift();
		return new eui.BitmapLabel();
	}
}
