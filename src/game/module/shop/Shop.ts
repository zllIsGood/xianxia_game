class Shop extends BaseSystem {
	/**商店数据 */
	public shopData: ShopData;
	public medalData: FeatsStoreData;
	public constructor() {
		super();

		this.shopData = new ShopData();
		this.sysId = PackageID.Shop;
		this.regNetMsg(1, this.postUpdateShopData);
		this.regNetMsg(2, this.postBuyResult);
		this.regNetMsg(3, this.postBuyCount);
		this.regNetMsg(4, this.refreshGoodsSuccess);
		this.regNetMsg(5, this.postRefreshIntegrationSucc);
		this.regNetMsg(6, this.updateMedalMessage);
		this.regNetMsg(7, this.postUpdateBuyMedal);
	}

	public static ins(): Shop {
		return super.ins() as Shop;
	}

	/**
	 * 发送购买物品
	 * 16-2
	 * @param shopType	商店类型
	 * @param arr		 物品数组id,num
	 */
	public shopBuyArr: any[];
	public sendBuy(shopType, arr: any[]) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(shopType);
		bytes.writeInt(arr.length);
		this.shopBuyArr = [];
		for (let i = 0; i < arr.length; i++) {
			bytes.writeInt(arr[i][0]);
			bytes.writeInt(arr[i][1]);
			//金砖直接使用
			let isc: ItemStoreConfig = GlobalConfig.ItemStoreConfig[arr[i][0]];
			if (isc && isc.itemId == ItemConst.GOLD_BRICK) {
				let tmp: { id: number, count: number } = { id: ItemConst.GOLD_BRICK, count: arr[i][1] };
				this.shopBuyArr.push(tmp);
			}
		}
		this.sendToServer(bytes);
	}

	/**
	 * 发送刷新商店
	 * 16-3
	 */
	public sendRefreshShop() {
		let bytes: GameByteArray = this.getBytes(3);

		this.sendToServer(bytes);
	}

	/**
	 * 更新装备商店数据
	 * 16-1
	 */
	public postUpdateShopData(bytes: GameByteArray) {
		Shop.ins().shopData.parser(bytes);
	}

	/**
	 * 购买商品结果
	 * 16-2
	 */
	public postBuyResult(bytes: GameByteArray): number {
		let result = bytes.readInt();

		return result;
	}

	/**
	 * 已购买商品数量
	 * 16-3
	 */
	public postBuyCount(bytes: GameByteArray) {
		Shop.ins().shopData.parserBuyCount(bytes);
	}

	public refreshGoodsSuccess(bytes: GameByteArray): void {
		this.postRefreshGoodsSuccess(true);
	}

	public postRefreshGoodsSuccess(bo: boolean): boolean {
		return bo;
	}

	/*积分商店回包*/
	public postRefreshIntegrationSucc(bytes: GameByteArray) {
		let result = bytes.readBoolean();
		let num = bytes.readInt();

		return [result, Shop.ins().shopData.point];
	}

	/**
	* 购买积分商店
	* 16-5
	*/
	public sendIntegrationShop(index: number) {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/**
     * 请求功勋商店列表
     * 16-6
     */
	public sendMedalMessage(): void {
		let bytes: GameByteArray = this.getBytes(6);
		this.sendToServer(bytes);

	}
    /**
     * 获取功勋商店列表信息
     * 16-6
     */
	public updateMedalMessage(bytes: GameByteArray) {
		let len: number = bytes.readInt();
		this.medalData = new FeatsStoreData(len, bytes);
		Shop.ins().postRefresMedalMessage();
		// return medalData;

	}

	public postRefresMedalMessage() {

	}
    /**
     * 功勋商店发起购买
     * 16-7
     */
	public sendBuyMedal(id: number, num: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeInt(id);
		bytes.writeInt(num);
		this.sendToServer(bytes);
	}
	/**
	* 功勋商店购买结果
	* 16-7
	*/
	public postUpdateBuyMedal(bytes: GameByteArray) {
		let _index = bytes.readInt();
		let _exchangeCount = bytes.readInt();
		return [_index, _exchangeCount];
	}

	static openBuyGoldWin(showTips: boolean = true): boolean {
		let shopMgr = Shop.ins();
		let goodsId = shopMgr.shopData.getGoodsIdByItemId(200164);
		if (shopMgr.shopData.checkBuyGoodsId(goodsId, showTips)) {
			ViewManager.ins().open(BuyWin, goodsId);
			return true;
		}
		return false;
	}


}

/**
 * 商店数据
 * @author hepeiye
 *
 */
class ShopData {
	public shopEquipData: ShopEquipData[];
	public hadBuyCount: ShopHadBuyData[];
	public times: number;
	public point: number;
	private _refushTime: number;

	public set refushTime(value: number) {
		this._refushTime = value;
		let tms = TimerManager.ins();
		tms.removeAll(this);
		if (value > 0) {
			tms.doTimer(1000, value, this.enterTime, this);
		}
	}

	public get refushTime(): number {
		return this._refushTime;
	}

	constructor() {
		this.shopEquipData = [];
		this.hadBuyCount = [];
	}

	public parser(bytes: GameByteArray): void {
		this.shopEquipData.length = 0;
		this.refushTime = bytes.readInt();
		this.point = bytes.readInt();
		this.times = bytes.readInt();
		let num = bytes.readInt();

		for (let i = 0; i < num; i++) {
			let s = new ShopEquipData;
			s.parser(bytes);
			this.shopEquipData.push(s);
		}
	}

	/**
	 * 已购买道具数量
	 * @param bytes
	 */
	public parserBuyCount(bytes: GameByteArray): void {
		let count = bytes.readShort();
		this.hadBuyCount.length = 0;
		for (let i = 0; i < count; i++) {
			let data = new ShopHadBuyData();
			data.parser(bytes);
			this.hadBuyCount.push(data);
		}
	}

	private enterTime(): void {
		if (this._refushTime <= 0)
			this._refushTime = 0
		else
			this._refushTime--;
	}

	/**
	 * 获取已经购买数量
	 * @param itemId
	 * @returns ShopHadBuyData
	 */
	public getHadBuyCountItem(itemId: number): ShopHadBuyData {
		for (let item of this.hadBuyCount) {
			if (item.itemId == itemId) {
				return item;
			}
		}
		return null;
	}
	/**
	 * 获取已经购买数量
	 * @param itemId
	 * @returns number
	 */
	public getHadBuyCount(itemId: number): number {
		let item = this.getHadBuyCountItem(itemId);
		if (item) return item.count;
		return 0;
	}

	/**
	* 获取黑市数据长度
	*/
	public getShopEquipDataLength(): number {
		let result: number = 0;

		if (this.shopEquipData != null) {
			result = this.shopEquipData.length;
		}

		return result;
	}

	/**
	* 获取黑市数据（通过索引）
	* @param index
	*/
	public getShopEquipDataByIndex(index: number): ShopEquipData {
		let result: ShopEquipData = null;

		if (this.shopEquipData != null) {
			if (index >= 0 && index < this.shopEquipData.length) {
				result = this.shopEquipData[index];
			}
		}

		return result;
	}

	/**
	 * 获取黑市数据（通过索引）
	 * @param index
	 */
	public getShopEquipDataById(id: number) {
		for (let item of this.shopEquipData) {
			if (item.id == id) {
				return item;
			}
		}
		return null;
	}

	public checkBuyGoodsId(goodsId, showTips: boolean = true) {
		let shopItem = GlobalConfig.ItemStoreConfig[goodsId];
		let userVip = UserVip.ins();
		if (shopItem) {
			if (shopItem.viplv && userVip.lv < shopItem.viplv) {
				if (showTips) UserTips.ins().showTips(`${UserVip.formatLvStr(shopItem.viplv)}可购买`);
				return false;
			}
			if (shopItem.vipLimit) {
				let total = shopItem.vipLimit[userVip.lv];
				let buyCount = this.getHadBuyCount(shopItem.itemId);
				if (buyCount >= total) {
					if (showTips) UserTips.ins().showTips(`今日购买次数已用完`);
					return false;
				}
			}
		}
		return true;
	}

	public getGoodsIdByItemId(itemId): number {
		for (let goodsId in GlobalConfig.ItemStoreConfig) {
			if (GlobalConfig.ItemStoreConfig[goodsId].itemId == itemId) {
				return parseInt(goodsId);
			}
		}
		return 0;
	}


}

/**
 * 黑市
 * @author hepeiye
 *
 */
class ShopEquipData {

	/** id */
	public id: number;
	/** 货币类型 1金币2元宝 */
	public costType: number;
	/** 货币数量 */
	public costNum: number;
	/** 对应的ItemData */
	public item: ItemData;
	/** 折扣类型 0：原价；1：8折；2：5折 */
	public discountType: number;

	/** 折扣类型 0：原价；1：8折；2：5折 */
	static discountDic: { [type: number]: { discount: number, res: string } } = {
		0: {
			discount: 1,
			res: ""
		},
		1: {
			discount: 0.8,
			res: "shop_12"
		},
		2: {
			discount: 0.5,
			res: "shop_11"
		}
	}

	public parser(bytes: GameByteArray): void {
		this.id = bytes.readInt();
		this.costType = bytes.readInt();
		this.costNum = bytes.readInt();
		this.discountType = bytes.readInt();

		this.item = new ItemData;
		this.item.parser(bytes);
	}
}

/**
 * 已购买道具个数
 */
class ShopHadBuyData {
	public itemId: number;
	public count: number;
	public parser(bytes: GameByteArray) {
		this.itemId = bytes.readInt();
		this.count = bytes.readInt();
	}
}

namespace GameSystem {
	export let  shop = Shop.ins.bind(Shop);
}
