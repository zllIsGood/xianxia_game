class ShopRedPoint extends BaseSystem {
	/** 商店红点 */
	shopRedPoint:boolean = false;
	nfirstLogin:boolean;//每次登陆
	/** 神秘商店红点 */
	blackMarketRedPoint: boolean = false;


	constructor() {
		super();

		this.associated(this.postShopRedPoint,
			this.postBlackMarketRedPoint
		);
		this.associated(this.postBlackMarketRedPoint,
			Shop.ins().postUpdateShopData
		);

	}

	postShopRedPoint():boolean {
		let old = this.shopRedPoint;

		this.shopRedPoint = this.blackMarketRedPoint;

		return this.shopRedPoint != old;
	}
	postBlackMarketRedPoint():boolean{
		let old = this.blackMarketRedPoint;
		this.blackMarketRedPoint = Shop.ins().shopData.refushTime <= 0;
		// let itemData:ItemData = UserBag.ins().getBagGoodsByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.StoreCommonConfig.refreshItem);
		// let num:number = itemData?itemData.count:0;
		// if( num ){
		// 	this.blackMarketRedPoint = true;
		// }else{
		// 	this.blackMarketRedPoint = Shop.ins().shopData.refushTime <= 0;
		// }

		return this.blackMarketRedPoint != old;
	}


}

namespace GameSystem {
	let shopRedPoint = ShopRedPoint.ins.bind(ShopRedPoint);
}