/**基本UI，用于策划拼接通用组件 此基类复制逻辑类方法和属性
 * 不能复制get set 方法，有这些方法的类要改写get set方法
 * @see RoleInfoPanel
*/
class BaseComponent extends BaseView {
	public className: string = "@策划@使用此组件必须填写逻辑类名";

	protected static filterKeys: string[] = ["data"];

	protected static copyKeys: string[] = ["open", "close"];

	public constructor() {
		super();
	}

	// /**组件实例完成 className（如果组件没有绑定逻辑类，将会报错）*/
	// protected childrenCreated(): void {
	// 	// if (LocationProperty.isWeChatMode || LocationProperty.isVivoMode) {
	// 		let cls = HYDefine.getDefinitionByName(this.className);
	// 		if (cls != null) {
	// 			let obj = new cls();
	// 			for (let key in obj) {
	// 				if ((this[key] == null || BaseComponent.copyKeys.indexOf(key) != -1) &&
	// 					BaseComponent.filterKeys.indexOf(key) == -1) {
	// 					this[key] = obj[key];
	// 				}
	// 			}
	// 		}
	// 		if (this["init"]) {
	// 			this["init"]();
	// 		}
	// 	// }
	// }

	public open(...param: any[]): void {

	}

	public close(...param: any[]): void {

	}
	public get data(): any {
		return this["_data"];
	}
	//为了适配 render类型
	public set data(value) {
		this["_data"] = value;
		eui.PropertyEvent.dispatchPropertyEvent(this, eui.PropertyEvent.PROPERTY_CHANGE, "data");
		if (this["dataChanged"])
			this["dataChanged"]();
	}
}