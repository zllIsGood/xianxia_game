/**
 * 诛仙分解
 */
class HeirloomDownView extends BaseEuiView {

	public equipList: eui.List;
	public contrain: eui.Group;

	private equipScroller: eui.Scroller;
	private gainList: eui.List;

	private itemList: any[];

	private listData: eui.ArrayCollection;
	private goList: eui.ArrayCollection;

	private bgClose: eui.Rect;

	private curInfo: HeirloomInfo;
	public constructor() {
		super();
		this.skinName = "heirloomDownSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.listData = new eui.ArrayCollection();

		this.equipList.itemRenderer = HeirloomDownItemRenderer;
		this.equipList.dataProvider = this.listData;

		this.gainList.itemRenderer = GainGoodsItem;
		this.goList = new eui.ArrayCollection();
		this.gainList.dataProvider = this.goList;
	}
	public open(...param): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(UserBag.ins().postItemDel, this.updateData);//道具删除
		this.observe(UserBag.ins().postItemCountChange, this.updateData);
		this.observe(UserBag.ins().postUseItemSuccess, this.updateData);//分解成功返回
		this.addTouchEvent(this, this.onTap);
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onGo, this);
		this.curInfo = param[0];


		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this, this.onTap);
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onGo, this);

		this.removeObserve();
	}


	//列表数据
	public getHeirloomSource() {
		//5是品质物品参数表的quality  BAG_DESC_TYPE_HEIR是物品参数表的type
		let itemData: ItemData[] = UserBag.ins().getEquipsByQuality(5, UserBag.BAG_DESC_TYPE_HEIR, UserBag.BAG_TYPE_OTHTER);

		//在已有的激活角色中对部位进行判断是否显示推荐分解
		for (let i = 0; i < itemData.length; i++) {
			itemData[i].isSuggest = true;
			for (let j = 0; j < 3; j++) {
				let role: Role = SubRoles.ins().getSubRoleByIndex(j);
				if (!role) break;
				let config: HeirloomEquipItemConfig[] = GlobalConfig.HeirloomEquipItemConfig;
				let isBreak = false;
				for (let k in config) {
					//找到每个角色的对应部位
					if (config[k].item == itemData[i]._configID) {
						let slot: number = config[k].pos;
						let info: HeirloomInfo = role.heirloom.getInfoBySolt(slot - 1);
						//已经激活 跳过角色继续
						if (info && info.lv > 0) {
							isBreak = false;
						}
						//有一个已开启的角色这个部位未激活 都不显示推荐分解
						else {
							itemData[i].isSuggest = false;
							isBreak = true;
						}
						break;
					}
				}
				if (isBreak) break;
			}
		}


		//检测三个角色是否都开启
		// let isOpenAllRole = true;
		// for( let i=0;i<3;i++ ){
		// 	if( !SubRoles.ins().getSubRoleByIndex(i) ){
		// 		isOpenAllRole = false;
		// 		break;
		// 	}
		// }
		// //角色全部开启后 只要有一个角色未激活该部位 就不显示这个部位的分解
		// if( isOpenAllRole ){
		// 	let itemIds:number[] = [];
		// 	for( let i = 0;i < itemData.length;i++ ){
		// 		itemIds.push(itemData[i]._configID);
		// 	}
		// 	let dtipsId:number[] = [];//需要从itemData列表中去除的道具索引（不显示道具）
		// 	for( let i=0;i < itemIds.length;i++ ){
		// 		let isBreak = false;
		// 		//每个角色
		// 		for( let j=0;j < 3;j++ ){
		// 			let role:Role = SubRoles.ins().getSubRoleByIndex(j);
		// 			let config:HeirloomEquipItemConfig[] = GlobalConfig.HeirloomEquipItemConfig;
		// 			for( let k in config ){
		// 				//找到每个角色的对应部位
		// 				if( config[k].item == itemIds[i] ){
		// 					let info:HeirloomInfo = role.heirloom.getInfoBySolt(config[k].pos-1);
		// 					//部位未合成未激活都[不推荐]
		// 					if( !info.lv ){
		// 						dtipsId.push(itemIds[i]);
		// 						isBreak = true;
		// 						break;
		// 					}
		// 				}
		// 			}
		// 			if( isBreak ) break;//只要有一个角色部位未激活合成就跳出
		// 		}
		// 	}
		// 	//去除不显示的道具
		// 	let itemDataShow:ItemData[] = [];
		// 	for( let k in itemData ){
		// 		//不存在不显示列表就添加显示列表中
		// 		if( dtipsId.indexOf(itemData[k]._configID) == -1 ){
		// 			itemDataShow.push(itemData[k]);
		// 		}
		// 	}
		// 	itemData = itemDataShow;//覆盖过去原列表
		// }

		itemData.sort((n1, n2) => {
			let config1 = GlobalConfig.ItemConfig[n1.configID];
			let config2 = GlobalConfig.ItemConfig[n2.configID];

			if (n1.isSuggest == true && n2.isSuggest == false) {
				return 1;
			}
			if (n1.isSuggest == false && n2.isSuggest == true) {
				return -1;
			}

			if (config1.id < config2.id) {
				return 1;
			}
			if (config1.id > config2.id) {
				return -1;
			}

			return 0;
		});
		return itemData;
	}
	//获取途径
	public getHeirloomGoSource() {
		if (this.itemList) {
			return this.itemList;
		}

		// let item:ItemData = UserBag.ins().getBagGoodsByDescIndex(246);//诛仙宝钻
		let item: ItemData = UserBag.ins().getBagItemById(200141);//诛仙宝钻
		let gainConfig: GainItemConfig;
		if (!item) {
			// return this.itemList;
			if (!this.curInfo)
				return this.itemList;
			if (this.curInfo.expend)
				gainConfig = GlobalConfig.GainItemConfig[this.curInfo.expend.id];
		} else {
			gainConfig = GlobalConfig.GainItemConfig[item._configID];
		}

		if (gainConfig) {
			this.gainList.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
			this.itemList = gainConfig.gainWay;
		} else {
			this.gainList.dataProvider = new eui.ArrayCollection([]);
			this.itemList = [];
		}
		return this.itemList;
	}
	private updateData(): void {
		let source, goList;
		source = this.getHeirloomSource();
		goList = this.getHeirloomGoSource();
		goList = goList ? goList : [];

		this.listData.source = source;
		this.goList.source = goList;
		let dataNum: number = goList.length;
		this.refushPos(dataNum);
	}


	private refushPos(len: number): void {
		this.contrain.height = 60 * len;
		this.equipScroller.height = 310 + 60 * (3 - len);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			default:
				if (e.target instanceof eui.Button) {
					switch (e.target.name) {
						case "breakDown":
							//data是this.listData.source = source的source
							this.onHandler(e.target.parent["data"]);//
							break;
					}
				}
		}
	}

	private onHandler(data) {
		//发送分解碎片(使用道具)
		let itemData: ItemData[] = [data];
		for (let i: number = 0; i < itemData.length; i++) {
			if (itemData[i]) {
				if (UserBag.ins().sendUseItem(itemData[i]._configID, itemData[i].count)) {
					// ViewManager.ins().close(this);
					break;
				}
			}
		}
	}

	private onGo(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			GameGuider.guidance(item[1], item[2]);
			ViewManager.ins().close(this);
		}
	}
}

ViewManager.ins().reg(HeirloomDownView, LayerManager.UI_Popup);