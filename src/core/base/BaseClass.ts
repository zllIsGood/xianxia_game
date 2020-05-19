/**
 * Created by yangsong on 14/12/18.
 * 基类
 */
class BaseClass {
	public constructor() {

	}

	/**
	 * 获取一个单例
	 * @returns {any}
	 */
	public static ins(...args: any[]): any {
		let Class: any = this;
		if (!Class._instance) {
			Class._instance = new Class(...args);

		}
		return Class._instance;
	}

	public static del(): void {
		let Class: any = this;
		if (Class._instance) {
			Class._instance = null;
		}
	}
}