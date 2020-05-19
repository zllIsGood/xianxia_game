/**
 * Created by yangsong on 15-1-12.
 * 通用工具类
 */
class CommonUtils extends BaseClass {

	/**
	 * 给字体添加描边
	 * @param lable      文字
	 * @param color      表示文本的描边颜色
	 * @param width      描边宽度。
	 */
	public static addLableStrokeColor(lable: eui.Label, color: any, width: any): void {
		lable.strokeColor = color;
		lable.stroke = width;
	}

	/**
	 * 获取一个对象的长度
	 * @param list
	 */
	public static getObjectLength(list: Object): number {
		let num: number = 0;
		for (let i in list) {
			num++;
		}
		return num;
	}

	/**
	 * 根据属性值 获取一个对象
	 * @param list
	 * @param attrName
	 * @param attrValue
	 * @returns {any}
	 */
	public static getObjectByAttr(list: Object, attrName: string, attrValue: any): any {
		for (let i in list) {
			if (list[i][attrName] == attrValue) {
				return list[i];
			}
		}
		return null;
	}

	/**
	 * 根据联合ID获取对象
	 * @param list
	 * @param attrValue
	 * @param attrValue1
	 * @returns {any}
	 */
	public static getObjectByUnionAttr(list: Object, attrValue: any, attrValue1: any): any {
		for (let i in list) {
			if (i == attrValue.toString()) {
				for (let j in list[i]) {
					if (j == attrValue1.toString()) {
						return list[i][j];
					}
				}
			}
		}
		return null;
	}

	/**
	 * 深度复制
	 * @param _data
	 */
	public static copyDataHandler(obj: any): any {
		let newObj;
		if (obj instanceof Array) {
			newObj = [];
		}
		else if (obj instanceof Object) {
			newObj = {};
		}
		else {
			return obj;
		}
		let keys = Object.keys(obj);
		for (let i: number = 0, len = keys.length; i < len; i++) {
			let key = keys[i];
			newObj[key] = this.copyDataHandler(obj[key]);
		}
		return newObj;
	}

	/**
	 * 锁屏
	 */
	public static lock(): void {
		let stage = StageUtils.ins().getStage();
		stage.touchEnabled = stage.touchChildren = false;
	}

	/**
	 * 解屏
	 */
	public static unlock(): void {
		let stage = StageUtils.ins().getStage();
		stage.touchEnabled = stage.touchChildren = true;
	}

	/**
	 * 万字的显示
	 * @param label
	 * @param num
	 */
	public static labelIsOverLenght(label, num) {
		label.text = this.overLength(num);
	}

	public static overLength(num: number) {
		let str = null;
		if (num < 100000) {
			str = Math.floor(num) + "";
		}
		else if (num > 100000000) {
			num = (num / 100000000);
			num = Math.floor(num * 10) / 10;
			str = num + "亿";
		}
		else {
			num = (num / 10000);
			num = Math.floor(num * 10) / 10;
			str = num + "万";
		}
		return str;
	}

	public static overLengthChange(num: number) {
		let str = null;
		if (num < 10000) {
			str = Math.floor(num) + "";
		}
		else if (num > 100000000) {
			num = (num / 100000000);
			num = Math.floor(num * 10) / 10;
			str = num + "亿";
		}
		else {
			num = (num / 10000);
			num = Math.floor(num * 10) / 10;
			str = num + "万";
		}
		return str;
	}

	/**
	 * 对象转换为数组
	 * @param  {any} obj
	 * @returns any
	 */
	public static object2Array(obj: any): any[] {
		if (!(obj instanceof Object)) return obj;
		let reArr: any[] = [];
		for (let k in obj) {
			if (!obj.hasOwnProperty(k)) continue;
			reArr.push(obj[k]);
		}
		return reArr;
	}

	/**转换有效数据数组，不改变原数组*/
	public static objectToArray(obj: any): any {
		if (obj instanceof Object) {
			obj = this.copyDataHandler(obj);
			let newArr = [];
			let keys = Object.keys(obj);
			for (let i: number = 0, len = keys.length; i < len; i++) {
				let key = keys[i];
				if (obj[key]) newArr.push(obj[key]);
			}
			return newArr;
		}
		else {
			return obj;
		}
	}
}
