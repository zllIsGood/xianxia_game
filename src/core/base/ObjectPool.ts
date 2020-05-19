/**
 * Created by yangsong on 2014/11/22.
 * 对象池类
 */
class ObjectPool {
	private static _content: any = {};
	private _objs: Array<any>;

	/**
	 * 构造函数
	 */
	public constructor() {
		this._objs = new Array<any>();
	}

	/**
	 * 放回一个对象
	 * @param obj
	 */
	public pushObj(obj: any): void {
		this._objs.push(obj);
	}

	/**
	 * 取出一个对象
	 * @returns {*}
	 */
	public popObj(): any {
		if (this._objs.length > 0) {
			return this._objs.pop();
		} else {
			return null;
		}
	}

	/**
	 * 清除所有缓存对象
	 */
	public clear(): void {
		while (this._objs.length > 0) {
			this._objs.pop();
		}
	}

	/**
	 * 取出一个对象
	 * @param classZ Class
	 * @return Object
	 *
	 */
	public static pop(refKey: string, ...args: any[]): any {
		if (!ObjectPool._content[refKey]) {
			ObjectPool._content[refKey] = [];
		}

		let list: Array<any> = ObjectPool._content[refKey];
		if (list.length) {
			let i: any = list.pop();
			//if (refKey == "CharMonster") {
			//	debug.log("取一个CharMonster:" + i.hashCode);
			//}
			return i;
		} else {
			let classZ: any = HYDefine.getDefinitionByName(refKey);
			let argsLen: number = args.length;
			let obj: any;

			obj = new classZ(...args);

			obj.ObjectPoolKey = refKey;
			return obj;
		}
	}

	/**
	 * 取出一个对象
	 * @param refKey Class
	 * @param extraKey 标识值
	 * @returns {any}
	 */
	public static popWithExtraKey(refKey: string, extraKey: any): any {
		if (!ObjectPool._content[refKey]) {
			ObjectPool._content[refKey] = [];
		}

		let obj: any;
		let list: Array<any> = ObjectPool._content[refKey];
		if (list.length) {
			for (let i = 0; i < list.length; i++) {
				if (list[i].extraKey == extraKey) {
					obj = list[i];
					list.splice(i, 1);
					break;
				}
			}
		}
		if (!obj) {
			let classZ: any = HYDefine.getDefinitionByName(refKey);
			obj = new classZ(extraKey);
			obj.extraKey = extraKey;
			obj.ObjectPoolKey = refKey;
		}
		return obj;
	}

	/**
	 * 放入一个对象
	 * @param obj
	 *
	 */
	public static push(obj: any): boolean {
		if (obj == null) {
			return false;
		}

		let refKey: any = obj.ObjectPoolKey;
		//保证只有pop出来的对象可以放进来，或者是已经清除的无法放入
		if (!ObjectPool._content[refKey] || ObjectPool._content[refKey].indexOf(obj) > -1) {
			return false;
		}

		ObjectPool._content[refKey].push(obj);
		//if (refKey == "CharMonster") {
		//	debug.log("放一个CharMonster" + obj.hashCode);
		//}
		return true;
	}

	/**
	 * 清除所有对象
	 */
	public static clear(): void {
		ObjectPool._content = {};
	}

	/**
	 * 清除某一类对象
	 * @param classZ Class
	 * @param clearFuncName 清除对象需要执行的函数
	 */
	public static clearClass(refKey: string, clearFuncName: string = null): void {
		let list: Array<any> = ObjectPool._content[refKey];
		while (list && list.length) {
			let obj: any = list.pop();
			if (clearFuncName) {
				obj[clearFuncName]();
			}
			obj = null;
		}
		ObjectPool._content[refKey] = null;
		delete ObjectPool._content[refKey];
	}

	/**
	 * 缓存中对象统一执行一个函数
	 * @param classZ Class
	 * @param dealFuncName 要执行的函数名称
	 */
	public static dealFunc(refKey: string, dealFuncName: string): void {
		let list: Array<any> = ObjectPool._content[refKey];
		if (list == null) {
			return;
		}

		let i: number = 0;
		let len: number = list.length;
		for (i; i < len; i++) {
			list[i][dealFuncName]();
		}
	}
}