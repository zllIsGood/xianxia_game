/**
 * Created by hrz on 2017/7/11.
 */

class FilterUtil {

	//注意：
	//使用滤镜后，关闭窗口记得需要清除滤镜，否则会内存泄漏


	static get grayFilter() {
		return new egret.ColorMatrixFilter([0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0]);
	}

	static get grayFilter1() {
		return new egret.ColorMatrixFilter([0.3086, 0.5, 0.0820, 0, 0, 0.3086, 0.5, 0.0820, 0, 0, 0.3086, 0.5, 0.0820, 0, 0, 0, 0, 0, 1, 0]);
	}

	//灰色滤镜
	static get ARRAY_GRAY_FILTER() {
		return [FilterUtil.grayFilter1];
	}

	static get greenFilter() {
		return new egret.ColorMatrixFilter([1, 0, 0, 0, 0, 0, 1, 0, 0, 100, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]);
	}

	static get greenFilter1() {
		return new egret.ColorMatrixFilter([0.1, 0, 0, 0, 0, 0, 0.80078125, 0, 0, 20, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0]);//19921875
	}

	static get purpleFilter() {
		return new egret.ColorMatrixFilter([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
	}

	static get ARRAY_GREEN_FILTER() {
		return [FilterUtil.purpleFilter];
	}


	static get blurFilter() {
		return new egret.BlurFilter(10, 10, egret.BitmapFilterQuality.MEDIUM);
	}

	//模糊滤镜
	static get ARRAY_BLUR_FILTER() {
		return [FilterUtil.blurFilter];
	}
}