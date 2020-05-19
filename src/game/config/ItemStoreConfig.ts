/**
 * 道具商店配置
 */
class ItemStoreConfig {
	index:number;
	id: number;
	itemId: number;
	use: string;
	price: number;
	vipLimit:number[];//vip等级个数限制
	viplv:number;//vip等级开启


	static getStoreByItemID(id: number): ItemStoreConfig {
		let arr: ItemStoreConfig[] = GlobalConfig.ItemStoreConfig;
		for (let i in arr) {
			let element: ItemStoreConfig = arr[i];
			if (element.itemId == id)
				return element;
		}
		return null;
	}
}