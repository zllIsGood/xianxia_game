/**
 * 背包管理器(已改为新结构)
 */
class UserBag extends BaseSystem {

	private _useItemFunc: Object;
	/**背包物品类型-其他物品*/
	public static BAG_TYPE_OTHTER: number = 0;
	/**背包物品类型-装备 */
	public static BAG_TYPE_EQUIP: number = 1;
	/**寻宝相关 */
	public static BAG_TYPE_TREASUREHUNT: number = 2;

	public static BAG_ENOUGH: number = 20;
	public static BAG_ENOUGH100: number = 100;
	public static BAG_ENOUGH200: number = 200;
	/**物品参数表的诛仙type*/
	public static BAG_DESC_TYPE_HEIR: number = 11;

	public bagNum: number = 0;

	/** 背包数据 <BR>
	 * 0其他装备，1装备，2寻宝相关。参考UserBag枚举定义
	 * */
	public bagModel: ItemData[][] = [];

	/** 背包是否有可以使用的道具 0:没有    1：有 */
	public isExitUsedItem: number = 0;
	public isChange: number = 0;

	private isAddDelay: boolean;
	private addHasType2: boolean;

	private isDeleteDelay: boolean;
	private deleteHasType2: boolean;

	/**神装合成红点显示*/
	public OrangeEquipRedPoint: boolean[] = [];
	// static fitleEquip:number[] = [200158,200159,200160,200161,200162,200163,201003,201004,201005];//不需要显示的装备

	static fitleEquip: number[] = [];

	public itemCount: { 0: { [id: number]: number }, 1: { [id: number]: number } } = { 0: {}, 1: {} };

	public itemQuickUseList: {id:number, type:number, count:number}[];
	private itemQuickConfig: ItemQuickUseConfig[];

	public static ins(): UserBag {
		return super.ins() as UserBag;
	}
	
	public constructor() {
		super();
		this.sysId = PackageID.Bag;
		this.regNetMsg(1, this.doBagData);
		this.regNetMsg(2, this.doBagValumnAdd);
		this.regNetMsg(3, this.doDeleteItem);
		this.regNetMsg(4, this.doAddItem);
		this.regNetMsg(5, this.doUpDataItem);
		this.regNetMsg(6, this.doUserItemBack);
		this.regNetMsg(7, this.postMergeItemBack);
		this.regNetMsg(8, this.doUseGiftResult);
		this.observe(Recharge.ins().postGetMonthDay, this.doBagVolChange);
		this.observe(Recharge.ins().postFranchiseInfo, this.doBagVolChange);
		this._useItemFunc = {};
		this.itemQuickUseList = [];
		this.itemQuickConfig = GlobalConfig.ItemQuickUseConfig;

		this.registerUseItemFunc(ItemConst.RENAME, this.useRenameItem);

		for (let i = 0; i < 8; i++) {
			this.OrangeEquipRedPoint[i] = false;
		}
		for (let k in GlobalConfig.SpecialEquipsConfig) {
			if (GlobalConfig.SpecialEquipsConfig[k].style == FitleStyle.hc)
				UserBag.fitleEquip.push(GlobalConfig.SpecialEquipsConfig[k].id);
		}

	}


	public sendAddBagGrid(num: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(num);
		this.sendToServer(bytes);
	}

	/**
	 * 使用道具
	 */
	public sendUseItem(id: number, count: number): boolean {
		if (this._useItemFunc[id] != null) {
			this._useItemFunc[id](id, count);
			return true;
		}
		//没有注册的回调方法，就直接发送给后端
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(id);
		bytes.writeInt(count);
		this.sendToServer(bytes);
		return false;
	}

	private sendUserGoods(id: number, count: number): void {

	}


	private addItemCount(type, item: ItemData) {
		let id = item.configID;
		if (item.count == 0) {
			this.delItemCount(type, id);
			return;
		}

		this.itemCount[type][id] = this.itemCount[type][id] || 0;
		if (type == 1) {
			this.itemCount[type][id] += 1;
		} else {
			this.itemCount[type][id] = item.count;
		}
	}

	private delItemCount(type, delId: number) {
		if (type == 1) {
			if (this.itemCount[type][delId]) {
				this.itemCount[type][delId] -= 1;

				if (this.itemCount[type][delId] == 0)
					delete this.itemCount[type][delId];
			}
		} else {
			delete this.itemCount[type][delId];
		}
	}

	/**
	 * 处理背包数据初始化
	 * 3-1
	 * @param bytes
	 */
	public doBagData(bytes: GameByteArray): void {
		let code: number = bytes.readByte();
		//背包类型 0是其他物品 1是装备
		let type: number = bytes.readByte();
		//0是清空数据，其他视为追加数据
		if (code == 0) {
			this.bagModel[type] = [];
			this.itemCount[type] = {};
		}

		let len: number = bytes.readInt();
		let itemModel: ItemData;
		for (let i = 0; i < len; i++) {
			itemModel = new ItemData();
			itemModel.parser(bytes);
			this.bagModel[type].push(itemModel);
			if (type == 0) {
				if (this.isQuickUseItem(itemModel.configID)) {
					this.addItemQuickUse({
						id:itemModel.configID,
						type:1,
						count:itemModel.count
					});
				}
			}
			
			if (type == 0 || type == 1) {
				this.addItemCount(type, itemModel);
			}
		}
		UserBag.ins().postItemAdd();
		if (type == 1) {
			this.doBagVolChange();
		}
		if (type == 2) {
			UserBag.ins().postHuntStore();
		}
		this.getIsExitUsedItem();
		UserBag.ins().postItemCanUse();
	}
	/**
	 * 背包容量提示
	 */
	private doBagVolChange(): void {
		this.postBagVolChange();
	}
	public postBagVolChange() {
		//道具数量变更
		// let b: boolean = this.ronglianCheck();
		let b: boolean = false;
		// let b: boolean = (this.getBagItemNum() / this.bagNum >= 0.8 && UserBag.ins().getBagSortQualityEquips(3, 0, 0, UserBag.ins().normalEquipSmeltFilter).length>0);
		this.isChange = b ? 1 : 0;
		// let count: number = b ? 2 : 0
		let count: number = 0
		UserBag.ins().postItemCountChange();
		if (!b) {
			b = this.getSurplusCount() < this.getMaxBagRoom() * 0.05;
			count = b ? 1 : 0;
		}
		UserBag.ins().postBagWillFull(count);
	}

	/**
	 * 熔炼检查，熔炼红点显示：道具占总格子0.8并且有可熔炼的装备
	 * @returns boolean
	 */
	public ronglianCheck(): boolean {
		//道具数量变更
		let total = this.bagNum;
		if (GlobalConfig
			&& GlobalConfig.VipGridConfig
			&& GlobalConfig.VipGridConfig[UserVip.ins().lv]) {
			total += GlobalConfig.VipGridConfig[UserVip.ins().lv].grid + Recharge.ins().getAddBagGrid() + Recharge.ins().getAddBagFranchiseGrid();
		}
		let ins: UserBag = UserBag.ins();
		let isFind: boolean = false;
		// if (this.getBagItemNum() / total >= 0.8 || this.getWingZhuEquip().length >= 10) {
		let b: boolean = UserFb.ins().guanqiaID > 50 ? this.getBagItemNum() / total >= 0.8 : this.getBagItemNum() >= 50;
		if (b) {
			let list: ItemData[] = ins.getOutEquips();
			for (let data of list) {
				if (data && data.itemConfig) {
					isFind = true;
					break;
				}
			}
		}
		return isFind;
	}


	/** 使用物品的返回
	 * 0, -- 使用成功
	 * 1, -- 背包满了
	 * 3, -- 不能被使用
	 * 4, -- 级别不足
	 * 5, -- 数量不足够
	 */
	private promptList: string[] = ["", "背包满了", "", "不能被使用", "级别不足", "数量不足够"]

	private doUserItemBack(bytes: GameByteArray): void {
		let index: number = bytes.readByte();
		if (index > 0) {
			UserTips.ins().showTips(this.promptList[index]);
		} else if (index == 0) {
			UserBag.ins().postUseItemSuccess();
		}
	}

	/**
	 * 处理添加背包格子数
	 * 3-2
	 * @param bytes
	 */
	private doBagValumnAdd(bytes: GameByteArray): void {
		this.bagNum = bytes.readInt();
		UserBag.ins().postBagVolAdd();
	}

	/**
	 * 处理删除背包数据
	 * 3-3
	 * @param bytes
	 */
	private doDeleteItem(bytes: GameByteArray): void {
		//背包类型 0是其他物品 1是装备
		let type: number = bytes.readByte();
		let handle = bytes.readDouble();
		let delId: number = 0;
		for (let i = this.bagModel[type].length - 1; i >= 0; i--) {
			if (this.bagModel[type][i].handle == (handle)) {
				delId = this.bagModel[type][i].configID;
				UserBag.ins().isExitUsedItem = this.bagModel[type][i].getCanbeUsed() ? 1 : 0;
				this.bagModel[type].splice(i, 1);
				break;
			}
		}

		if (type == 0 || type == 1) {
			this.delItemCount(type, delId);
		}
		if (type == 2) {
			this.deleteHasType2 = true;
		}

		if (!this.isDeleteDelay) {
			this.isDeleteDelay = true;
			TimerManager.ins().doTimer(50, 1, this.deleteDelay, this);
		}
		// UserBag.postHasItemCanUse(this.getIsExitUsedItem());
	}


	/**
	 * 处理添加背包数据
	 * 3-4
	 * @param bytes
	 */
	private doAddItem(bytes: GameByteArray): void {
		//背包类型 0是其他物品 1是装备
		let type: number = bytes.readByte();
		let itemModel: ItemData = new ItemData();
		itemModel.parser(bytes);
		this.bagModel[type].push(itemModel);
		
		if (type == 0 || type == 1) {
			this.addItemCount(type, itemModel);
		}

		UserBag.ins().isExitUsedItem = itemModel.getCanbeUsed() ? 1 : 0;

		let showTip: number = bytes.readByte();
		if (showTip) {
			let quality: number = ItemConfig.getQuality(itemModel.itemConfig);
			if (quality >= 4 && type == 1) {
				UserTips.ins().showGoodEquipTips(itemModel);
			}
			else {
				if (type != 2) {
					let str: string = "获得|C:" + ItemConfig.getQualityColor(itemModel.itemConfig) + "&T:" + itemModel.itemConfig.name + " x " + itemModel.count + "|";
					UserTips.ins().showTips(str);
				}
			}
		}
		if (type == 2) {
			this.addHasType2 = true;
		}

		if (!this.isAddDelay) {
			this.isAddDelay = true;
			TimerManager.ins().doTimer(50, 1, this.addDelay, this);
		}
		//新手穿戴提示
		if (type == 1)
			NewEquip.ins().addItem(itemModel);

		if (type == 0) {
			if (this.isQuickUseItem(itemModel.configID)) {
				this.addItemQuickUse({
					id:itemModel.configID,
					type:1,
					count:itemModel.count
				});
			}
		}
	}

	// 是否可快捷使用的物品
	private isQuickUseItem(itemId: number): boolean {
		let quickConfig: ItemQuickUseConfig;
		let isQuickUse: boolean = false;
		for (let i in this.itemQuickConfig) {
			quickConfig = this.itemQuickConfig[i];
			if (quickConfig.id == itemId) {
				isQuickUse = true;
				isQuickUse = quickConfig.level ? quickConfig.level<=Actor.level : isQuickUse;
				isQuickUse = quickConfig.zsLevel ? quickConfig.zsLevel<=UserZs.ins().lv : isQuickUse;
				break;
			}
		}
		return isQuickUse;
	}

	// 添加物品快捷使用
	// data:{id:200001,type:1,count:10}
	private addItemQuickUse(data: any): void {
		for (let i = 0; i < this.itemQuickUseList.length; i++) {
			if (this.itemQuickUseList[i].id == data.id) {
				this.itemQuickUseList.splice(i,1);
				break;
			}
		}
		this.itemQuickUseList.push(data);
		let view = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (view) {
			view.showQuickUse();
		}
	}

	//添加延迟一帧处理
	private addDelay() {
		this.isAddDelay = false;
		UserBag.ins().postItemAdd();
		UserBag.ins().postItemCanUse();
		this.doBagVolChange();

		if (this.addHasType2) {
			this.addHasType2 = false;
			UserBag.ins().postHuntStore();
		}
	}

	//删除延迟一帧处理
	private deleteDelay() {
		this.isDeleteDelay = false;
		UserBag.ins().postItemDel();
		UserBag.ins().postItemCanUse();
		this.doBagVolChange();

		if (this.deleteHasType2) {
			this.deleteHasType2 = false;
			UserBag.ins().postHuntStore();
		}
	}

	/**
	 * 处理物品更新
	 * 3-5
	 * @param bytes
	 */
	public element:ItemData
	private doUpDataItem(bytes: GameByteArray): void {
		//背包类型 0是其他物品 1是装备
		let type: number = bytes.readByte();
		let handle = bytes.readDouble();
		let addNum: number = 0;
		for (let i = 0; i < this.bagModel[type].length; i++) {
			this.element = this.bagModel[type][i];
			if (this.element.handle == (handle)) {
				let num: number = bytes.readInt();
				addNum = num - this.element.count;
				this.element.count = num;
				
				if (type == 0 || type == 1) {
					this.addItemCount(type, this.element);
				}
				//				element.parser(bytes);
				UserBag.ins().isExitUsedItem = this.element.getCanbeUsed() ? 1 : 0;
				UserBag.ins().postItemCanUse();
				break;
			}
		}

		let showTip: number = bytes.readByte();
		if (showTip) {
			if (addNum > 0) {
				if (type != 2) {
					let quality: number = ItemConfig.getQualityColor(this.element.itemConfig);
					let str: string = "获得|C:" + quality + "&T:" + this.element.itemConfig.name + " x " + addNum + "|";
					UserTips.ins().showTips(str);
					UserBag.ins().postItemAdd();
				}
			}
		}

		this.doBagVolChange();

		if (type == 0 && addNum > 0) {
			if (this.isQuickUseItem(this.element.configID)) {
				this.addItemQuickUse({
					id:this.element.configID,
					type:1,
					count:this.element.count
				});
			}
		}

		UserBag.ins().postItemChange();
		// UserBag.postHasItemCanUse(this.getIsExitUsedItem());
	}

	/**
	 * 3-7 合成道具
	 * @param id
	 * @param count
	 */
	public sendMergeItem(id, count) {
		let bytes = this.getBytes(7);
		bytes.writeInt(id);
		bytes.writeInt(count);
		this.sendToServer(bytes);
	}

	/**
	 * 3-7 物品合成返回
	 * @param bytes
	 */
	public postMergeItemBack(bytes: GameByteArray) {
		let id = bytes.readInt(); //消耗物品id
		let count = bytes.readInt(); //消耗物品数量
		let len = bytes.readInt(); //合成物品数量

		let items: RewardData[] = [];
		for (let i = 0; i < len; i++) {
			items[i] = new RewardData();
			items[i].parser(bytes);
		}

		return items;
	}


	/**
	 * 发送取出宝物
	 * 3-4
	 * @param uuid    探宝类型
	 */
	public sendGetGoodsByStore(uuid: number) {
		//去除单件装备 && 背包空间不足的情况下 (只有装备才有容量概念uuid==0是装备寻宝获取)
		if (uuid == DepotType.Equip && this.getSurplusCount() < 1) {
			let strTips: string = GlobalConfig.ServerTips[2].tips;
			UserTips.ins().showTips(strTips);
			return;
		}
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeDouble(uuid);
		this.sendToServer(bytes);
	}

	///////////////////////////////////////////////////派发消息/////////////////////////////////////////////////////
	/*派发道具变更*/
	public postItemChange(): void {
	}

	/**
	 * 注册使用道具的回调方法
	 * 用于一些道具特殊处理的情况
	 */
	public registerUseItemFunc(itemID: number, useFunc: Function): void {
		this._useItemFunc[itemID] = useFunc;
	}

	/*派发删除道具*/
	public postItemDel(): void {
	}

	/**派发道具增加消息*/
	public postItemAdd(): void {

	}

	/** 派发道具数量变更消息*/
	public postItemCountChange(): number {
		return UserBag.ins().isChange;
	}

	/**派发背包数量快不足的提示*/
	public postBagWillFull(willFull: number): number {
		return willFull;
	}

	/**派发更新寻宝仓库*/
	public postHuntStore(): void {
	}

	/**派发是否有可用道具提示*/
	public postItemCanUse(): number {
		return UserBag.ins().isExitUsedItem;
	}

	/**派发使用道具成功 */
	public postUseItemSuccess(): void {
	}

	/**背包增加格子数*/
	public postBagVolAdd(): void {
	}

	///////////////////////////////////////////////////////////////各种查询方法///////////////////////////////////////////////////////////////
	/**
	 * 通过id获取背包物品
	 * @param id 类型
	 */
	public getBagItemById(id: number, Bag_Type: number = UserBag.BAG_TYPE_OTHTER): ItemData {
		let itemData: ItemData[] = this.bagModel[Bag_Type];
		if (!itemData)
			return null;

		for (let data of itemData) {
			if (data.itemConfig.id == id)
				return data;
		}
		return null;
	}

	/**
	 * 通过过滤列表获取背包数据
	 * @param id
	 * @param filterAry
	 * @param Bag_Type
	 * @returns {any}
	 */
	public getFilterBagItemById(id: number, filterAry: number[], Bag_Type: number = UserBag.BAG_TYPE_OTHTER): ItemData {
		let itemData: ItemData[] = this.bagModel[Bag_Type];
		for (let data of itemData) {
			if (data.itemConfig.id == id && filterAry.indexOf(data.handle) < 0)
				return data;
		}
		return null;
	}

	/**根据道具类型和id获取道具*/
	public getItemByTypeAndId(type: number, id: number): ItemData {
		let itemData: ItemData[] = this.bagModel[type];
		for (let data of itemData) {
			if (data.itemConfig.id == id)
				return data;
		}
		return null;
	}

	/**
	 * 获取背包了某种类型的装备
	 * @param type 类型
	 */
	public getEquipByType(type: number) {
		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_EQUIP];
		let itemData1: ItemData[] = [];
		for (let a in itemData) {
			if (ItemConfig.getType(itemData[a].itemConfig) == type) {
				itemData1.push(itemData[a]);
			}
		}
		return itemData1;
	}

	/**
	 * 身上是否有使用道具物品
	 * @param type 类型
	 * @param id
	 */
	public getItemCountByType(type: number, ids?: number[]): boolean {
		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_OTHTER];
		if (itemData) {
			for (let i: number = 0; i < itemData.length; i++) {
				if (ItemConfig.getType(itemData[i].itemConfig) == 8) {
					if (itemData[i].itemConfig.bagType == DepotType.Rune) {//交给getRuneBagGoodsCountByType接口判断
						continue;
					}
					if (ids) {
						if (ids.indexOf(itemData[i].itemConfig.id) != -1)
							return true;
					}
					if (itemData[i].itemConfig.id == ItemConst.EXP_ITEM) {
						if (Actor.level < 65) continue;
					} else if (itemData[i].itemConfig.id == ItemConst.FRESHEXP_ITEM) {
						//经验宝瓶红点有玩家等级限制
						if (Actor.level < itemData[i].itemConfig.level) continue;
					}
					if (itemData[i].itemConfig.id == ItemConst.LEVELUP_ITEM) {
						if (this.getRmbItemIsBuy(ItemConst.LEVELUP_ITEM))
							return true;
						continue;
						// let rch: RechargeData = Recharge.ins().getRechargeData(0);
						// if (!rch.num) continue;
					}
					if (itemData[i].itemConfig.id == ItemConst.WEIWANG_ITEM) //威望令牌不显示红点
						continue;

					return true;
				} else if (ItemConfig.getType(itemData[i].itemConfig) == 12) {
					let b: boolean = Actor.level >= itemData[i].itemConfig.level && Guild.ins().guildID != 0 ? true : false;
					if (b)
						return true;
				} else if (ItemConfig.getType(itemData[i].itemConfig) == 17) {
					return true;
				} else {

					//可合成
					let composeConf = GlobalConfig.ItemComposeConfig[itemData[i].configID];
					if (composeConf && composeConf.srcCount <= itemData[i].count) {
						return true;
					}
				}
			}
		}
		return false;
	}
	/**
	 * 背包符文是否有使用道具物品
	 * @param type 类型
	 * @param id
	 */
	public getRuneCountByType(type: number): boolean {
		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_OTHTER];
		if (itemData) {
			for (let i: number = 0; i < itemData.length; i++) {
				if (ItemConfig.getType(itemData[i].itemConfig) == 8) {
					if (itemData[i].itemConfig.bagType) {
						if (itemData[i].itemConfig.level && itemData[i].itemConfig.level > Actor.level) {
							continue;
						}
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * 通过id获取背包物品的数量
	 * @param type 类型
	 * @param id
	 */
	public getItemCountById(type: number, id: number): number {
		let itemData: ItemData[] = this.bagModel[type];
		if (itemData) {
			let count = 0;
			for (let i: number = 0; i < itemData.length; i++) {
				if (itemData[i].itemConfig && itemData[i].itemConfig.id == id)
					count += itemData[i].count;
			}
			return count;
		}
		return 0;
	}

	/**
	 * 通过索引获取背包物品
	 * @param type 0是其他物品 1是装备
	 * @param index
	 */
	public getItemByIndex(type: number, index: number): ItemData {
		return this.bagModel[type][index];
	}

	/**
	 * 获取背包道具数量
	 * @param type    0是其他物品 1是装备 2是符文/戒指等(具体看表或者问策划)
	 */
	public getBagItemNum(type: number = 1): number {
		let itemData: ItemData[] = this.bagModel[type];
		return itemData ? itemData.length : 0;
	}

	/**
	 * 获取背包了某种Id的装备
	 * @param id 类型
	 */
	public getBagEquipById(id: number) {
		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_EQUIP];
		let count: number = 0;
		for (let a in itemData) {
			if (itemData[a].itemConfig.id == id) {
				++count;
			}
		}
		return count;
	}

	/**
	 * 获取背包剩余空间
	 * 只有装备背包才有空间概念
	 */
	public getSurplusCount(): number {
		return this.bagNum - this.getBagItemNum() + GlobalConfig.VipGridConfig[UserVip.ins().lv].grid + Recharge.ins().getAddBagGrid() + Recharge.ins().getAddBagFranchiseGrid();
	}
	/**
	 * 获取背包总空间
	 */
	public getMaxBagRoom(): number {
		return this.bagNum + GlobalConfig.VipGridConfig[UserVip.ins().lv].grid + Recharge.ins().getAddBagGrid() + Recharge.ins().getAddBagFranchiseGrid();
	}

	/** 评分从大到小 */
	public sort1(a: ItemData, b: ItemData): number {
		let s1: number = a.point;//ItemConfig.calculateBagItemScore(a);
		let s2: number = b.point;//ItemConfig.calculateBagItemScore(b);
		if (s1 > s2)
			return -1;
		else if (s1 < s2)
			return 1;
		else
			return 0;
	}

	/** 评分从小到大 */
	public sort2(a: ItemData, b: ItemData): number {
		let s1: number = a.point;//ItemConfig.calculateBagItemScore(a);
		let s2: number = b.point;//ItemConfig.calculateBagItemScore(b);
		if (s1 < s2)
			return -1;
		else if (s1 > s2)
			return 1;
		else
			return 0;
	}

	public getHejiEquipsByType(pos: number): ItemData[] {
		let itemData: ItemData[] = this.bagModel[1];
		let list: ItemData[] = [];
		for (let i: number = 0; i < itemData.length; i++) {
			let item: ItemData = itemData[i];
			let type = ItemConfig.getType(item.itemConfig);
			let subType = ItemConfig.getSubType(item.itemConfig);
			if (type != 5)
				continue;
			if (subType == pos) {
				list.push(item);
			}
		}
		list.sort(this.sort3);
		return list;
	}

	public sort3(a: ItemData, b: ItemData): number {
		//评分从大到小
		let s1: number = a.point;//ItemConfig.calculateBagItemScore(a);
		let s2: number = b.point;//ItemConfig.calculateBagItemScore(b);
		if (s1 > s2)
			return -1;
		else if (s1 < s2)
			return 1;
		//id从大到小
		if (a.configID > b.configID)
			return -1;
		else if (a.configID < b.configID)
			return 1;
		else
			return 0;
	}

	/**
	 * 获取背包排序过的装备 0:评分从小到大 1：评分从大到小
	 * @param isSort
	 */
	public getBagSortEquips(isSort: number = 0): ItemData[] {
		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_EQUIP];
		if (isSort)
			itemData.sort(this.sort1);
		else
			itemData.sort(this.sort2);
		return itemData;
	}

	/**
	 * 获取背包排列过的某种品质的装备 默认全部品质 可以多种品质 可以单一品质
	 * @param quality  品质
	 * @param sole   是否单一品质   0：返回多种  1：返回单一
	 * @param sort 0:评分从小到大 1：评分从大到小
	 * @param filter 过滤方法
	 */
	public getBagSortQualityEquips(quality: number = 5, sole: number = 0, sort: number = 0, filter: Function = null): ItemData[] {
		let list: ItemData[] = this.bagModel[UserBag.BAG_TYPE_EQUIP];
		let returnList: ItemData[] = [];
		if (!list) return returnList;

		for (let i: number = 0; i < list.length; i++) {
			let q = ItemConfig.getQuality(list[i].itemConfig);
			if (quality != 5 && (q > quality || (sole && q < quality)))
				continue;
			if (filter != null && !filter(list[i]))
				continue;
			returnList[returnList.length] = list[i];
		}

		return returnList;
	}

	public getLegendOutEquips() {
		let list: ItemData[] = UserBag.ins().getEquipsByQuality(5);
		let returnList: ItemData[] = [];
		let nowEquips: any[] = [];
		let roleList: any[] = [];
		//穿在身上的装备
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (!roleList[role.job]) {
				roleList[role.job] = [];
			}
			let equipLen: number = role.getEquipLen();
			for (let ii: number = 0; ii < equipLen; ii++) {
				let goods: EquipsData = role.getEquipByIndex(ii);
				if (!goods.item.itemConfig) {
					continue;
				}
				this.addOneEquipToListEx(nowEquips, goods, i);
			}
		}
		let outEquip: ItemData;
		for (let i: number = 0; i < list.length; i++) {
			let item: ItemData = list[i];
			//部位
			let subType: number = ItemConfig.getSubType(item.itemConfig);
			if (subType != 0 && subType != 2)
				continue;
			let isWear: boolean = false;//对应部位是否有穿装备
			for (let j = 0; j < nowEquips.length; j++) {
				let pos: number = ItemConfig.getSubType(item.itemConfig);
				if (pos == subType) {
					isWear = true;
					break;
				}
			}
			if (!isWear)
				continue;

			// let job: number = ItemConfig.getJob(item.itemConfig);
			// if (!nowEquips[job]) {
			// 	returnList.push(item);
			// } else {
			//传奇装备不分职业
			// if (!roleList[job]) {
			// 	returnList.push(item);
			// 	continue;
			// }
			outEquip = this.checkEquipsIsGood(nowEquips, this.cloneItemDataInfo(item));
			if (outEquip) {
				//只筛选品质等于5的装备 熔炼
				if (!UserEquip.ins().checkEquipsIsWear(outEquip) && ItemConfig.getQuality(outEquip.itemConfig) == 5) {
					returnList.push(outEquip);
				}
			}
			// }
		} 3
		return returnList;
	}
	/**
	 * 神装分解提示
	 * @return 是否提示分解
	 * */
	public getLegendHasResolve(): boolean {
		let list: ItemData[] = UserBag.ins().getEquipsByQuality(4);
		let returnList: ItemData[] = [];
		let nowEquips: any[] = [];

		let roleList: any[] = [];
		//穿在身上的装备
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			// if (!roleList[role.job]) {
			// 	roleList[role.job] = [];
			// }
			let equipLen: number = role.getEquipLen();
			for (let ii: number = 0; ii < equipLen; ii++) {
				let goods: EquipsData = role.getEquipByIndex(ii);
				if (!goods.item.itemConfig) {
					continue;
				}
				this.addOneEquipToListRed(nowEquips, goods, i);
			}
		}
		let outEquip: ItemData;
		for (let i: number = 0; i < list.length; i++) {
			let item: ItemData = list[i];
			let job: number = ItemConfig.getJob(item.itemConfig);
			// if (!roleList[job]) {
			// 	return true;
			// }
			outEquip = this.checkEquipsIsGoodRed(nowEquips, this.cloneItemDataInfo(item));
			//返回空提示分解
			if (!outEquip) {
				return true;
				// //比较差的装备是否穿身上 否则是背包的 提示分解
				// if (!UserEquip.ins().checkEquipsIsWear(outEquip)) {//ItemConfig.getQuality(outEquip.itemConfig) == 4
				// 	return true;
				// }
			}
			// }
		}
		return false;
	}

	/**
	 * 可熔炼的非普通装备筛选方法
	 * 翅膀装备、玄玉等
	 */
	public otherEquipSmeltFilter(item: ItemData): boolean {
		let type = ItemConfig.getType(item.itemConfig);
		let subType = ItemConfig.getSubType(item.itemConfig);
		if (item.itemConfig && type == 4)
			return true;
		if (type == 0) {
			for (let key in ForgeConst.CAN_FORGE_EQUIP) {
				if (ForgeConst.EQUIP_POS_TO_SUB[ForgeConst.CAN_FORGE_EQUIP[key]] == subType)
					return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * 可熔炼的普通装备筛选方法
	 */
	public normalEquipSmeltFilter(item: ItemData): boolean {
		return ItemConfig.getType(item.itemConfig) == 0;
	}

	/**
	 * 获取背包内用于熔炼的必杀装备（用于熔炼）
	 */
	public getHejiOutEquips(): ItemData[] {
		// let list: ItemData[] = this.getHejiEquips();
		let returnList: ItemData[] = [];

		//筛选轮回装备  先筛选普通装备
		if (returnList.length < 9) {
			this.checkEquipsTodestroy(returnList);
		}
		this.creatListLength(returnList);
		return returnList;
	}

	/**
	 * 获取背包内用于熔炼的装备（用于熔炼）
	 */
	public getOutEquips(): ItemData[] {
		let list: ItemData[] = this.getBagSortQualityEquips(5, 0, 1, this.normalEquipSmeltFilter);//取得背包内所有的装备
		let returnList: ItemData[] = [];
		let nowEquips: any[] = [];
		// let lv: number = Actor.level;
		// let zsLv: number = UserZs.ins().lv;

		//穿在身上的装备
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			let equipLen: number = role.getEquipLen();
			// this.makeEquipsList(nowEquips, onEquips, i + 1);
			for (let ii: number = 0; ii < equipLen; ii++) {
				let goods: EquipsData = role.getEquipByIndex(ii);
				if (!goods.item.itemConfig) {
					continue;
				}
				this.addOneEquipToList(nowEquips, goods, ii + 1);
			}

		}

		let outEquip: ItemData;
		for (let i: number = 0; i < list.length; i++) {
			let item: ItemData = list[i];
			outEquip = this.checkEquipsIsGood(nowEquips, this.cloneItemDataInfo(item));
			if (outEquip) {
				//只筛选品质小于4的装备 熔炼
				if (!UserEquip.ins().checkEquipsIsWear(outEquip) && ItemConfig.getQuality(outEquip.itemConfig) < 4) {
					if (ItemConfig.getSubType(outEquip.itemConfig) != ForgeConst.EQUIP_POS_TO_SUB[EquipPos.DZI]) {
						returnList.push(outEquip);
					}
				}
			}
			//每次只需要拿九个物品
			if (returnList.length >= 9) {
				break;
			}
		}
		//筛选轮回装备  先筛选普通装备
		if (returnList.length < 9) {
			this.getGuanyinEquip(returnList);
		}
		this.upLevelEquips = [];
		this.creatListLength(returnList);
		return returnList;
	}

	//填充返回的列表
	private creatListLength(list: ItemData[]): void {
		if (list.length < 9) {
			for (let i: number = 0; i < 9; i++) {
				if (list[i] == undefined) {
					list[i] = null;
				}
			}
		}
	}

	private upLevelEquips: any[];

	//筛选超过自身等级限制 但是保留的装备
	public checkUpLevelEquips(item: ItemData): ItemData {
		let job: number = ItemConfig.getJob(item.itemConfig);
		let subType: number = ItemConfig.getSubType(item.itemConfig);
		let zsLv: number = item.itemConfig.zsLevel;
		let level: number = item.itemConfig.level;

		let quality: number = ItemConfig.getQuality(item.itemConfig);
		if (quality == 5)
			return null;

		if (!this.upLevelEquips) {
			this.upLevelEquips = [];
		}
		if (!this.upLevelEquips[job]) {
			this.upLevelEquips[job] = [];
		}
		if (!this.upLevelEquips[job][subType]) {
			this.upLevelEquips[job][subType] = [];
		}
		if (!this.upLevelEquips[job][subType][zsLv]) {
			this.upLevelEquips[job][subType][zsLv] = [];
		}
		let onItem: ItemData;
		// if (subType == 4 || subType == 5) {
		// 	//装备子类型为 4 或者 5的同时需要保留两件 特殊处理
		// 	if (!this.upLevelEquips[job][subType][zsLv][level]) {
		// 		this.upLevelEquips[job][subType][zsLv][level] = [];
		// 		this.upLevelEquips[job][subType][zsLv][level][0] = item;
		// 	} else {
		// 		onItem = this.upLevelEquips[job][subType][zsLv][level][0];
		// 		if (onItem) {
		// 			onItem = this.upLevelEquips[job][subType][zsLv][level][1];
		// 			if (onItem) {
		// 				let best: ItemData;
		// 				// best = this.checkEquipGetBest(onItem, item);
		// 				onItem = this.upLevelEquips[job][subType][zsLv][level][0];
		// 				best = this.checkEquipGetBest(onItem, item);
		// 				if (best == onItem) {
		// 					this.upLevelEquips[job][subType][zsLv][level][0] = item;
		// 				}
		// 				return best;
		// 			} else {
		// 				this.upLevelEquips[job][subType][zsLv][level][1] = item;
		// 			}
		// 		}
		// 	}
		// } else {
		onItem = this.upLevelEquips[job][subType][zsLv][level];
		if (onItem) {
			let best: ItemData = this.checkEquipGetBest(onItem, item);
			if (best == onItem) {
				this.upLevelEquips[job][subType][zsLv][level] = item;
			}
			return best;
		} else {
			this.upLevelEquips[job][subType][zsLv][level] = item;
		}
		// }
		return null;
	}

	//筛选超过自身等级限制 但是评分低的装备
	private checkUplevelBest(item: ItemData, list: any[]): ItemData {
		let job: number = ItemConfig.getJob(item.itemConfig);
		let subType: number = ItemConfig.getSubType(item.itemConfig);
		let item1: ItemData;
		let item2: ItemData;
		let bestOne: ItemData = null;
		if (!list[job]) {
			list[job] = [];
		}
		// if (subType == 4 || subType == 5) {
		// 	//装备子类型为 4 或者 5的同时需要保留两件 特殊处理
		// 	if (!list[job][subType]) {
		// 		list[job][subType] = [];
		// 	}
		// 	if (!list[job][subType][0]) {
		// 		list[job][subType][0] = null;
		// 	}
		// 	if (!list[job][subType][1]) {
		// 		list[job][subType][1] = null;
		// 	}
		// 	item1 = list[job][subType][0];
		// 	item2 = list[job][subType][1];
		// 	if (item1) {
		// 		bestOne = this.checkEquipGetBest(item1, item);
		// 	}
		// 	if (item2) {
		// 		bestOne = this.checkEquipGetBest(item2, bestOne);
		// 	}

		// } else {
		if (!list[job][subType]) {
			list[job][subType] = null
		}
		item1 = list[job][subType];
		if (item1) {
			bestOne = this.checkEquipGetBest(item1, item);
		}
		// }
		return bestOne;
	}
	/**
	 * 身上装备和背包所有神装对比
	 * @param 所有角色身上所有部位的装备 list[job][subType]
	 * @param 背包的每一个装备
	 * @return 返回空提示分解
	 * */
	public checkEquipsIsGoodRed(list: any[], item: ItemData): ItemData {
		let lv: number = Actor.level;
		let zsLv: number = UserZs.ins().lv;
		let job: number = ItemConfig.getJob(item.itemConfig);
		let subType: number = ItemConfig.getSubType(item.itemConfig);

		let len: number = SubRoles.ins().subRolesLen;
		for (let roleId: number = 0; roleId < len; roleId++) {
			if (!list[roleId]) {
				list[roleId] = [];
			}
			//背包装备限制判断
			let itemZsLevel = item.itemConfig.zsLevel ? item.itemConfig.zsLevel : 0;
			let itemLevel = item.itemConfig.level ? item.itemConfig.level : 0;
			//达到穿戴要求则进行判定  未达到穿戴要求则不管(判定完循环后允许拿去分解)
			if (zsLv >= itemZsLevel && lv >= itemLevel) {
				//某个角色能穿 但那个角色身上没装备
				if (!list[roleId][subType]) {
					return item;//留着给这个角色穿 不提示分解
				}

				//角色身上和背包比较出好的那个
				let best: ItemData = this.checkEquipGetBestEx(list[roleId][subType], item);

				//好的那个如果不是身上的则返回背包的这个装备 否则继续
				if (!UserEquip.ins().checkEquipsIsWear(best)) {
					return best;
				}
			}
		}
		//全部遍历完代表这个背包装备比目前所有角色身上的评分都要差 或者 某些角色身上评分比这个装备好而某些角色未达到穿戴要求

		return null;
	}
	/**
	 * 筛选可熔炼的装备
	 * @param 所有角色身上所有部位的装备 list[job][subType]
	 * @param 背包的每一个装备
	 * */
	public checkEquipsIsGood(list: any[], item: ItemData): ItemData {
		let lv: number = Actor.level;
		let zsLv: number = UserZs.ins().lv;
		let job: number = ItemConfig.getJob(item.itemConfig);
		let subType: number = ItemConfig.getSubType(item.itemConfig);

		//超出等级限制
		if (item.itemConfig.level > lv || item.itemConfig.zsLevel > zsLv) {
			let best: ItemData = this.checkUplevelBest(item, list);
			if (best && !UserEquip.ins().checkEquipsIsWear(best)) {
				return best;
			}
			return this.checkUpLevelEquips(item);
		}

		if (!list[job] || !list[job][subType]) {
			this.addOneEquipToList(list, item);
			return null;
		}
		let oldItem: ItemData;
		let clearItem1: ItemData;
		let clearItem: ItemData;
		// if (subType == 4 || subType == 5) {
		// 	//装备子类型为 4 或者 5的同时需要保留两件 特殊处理
		// 	if (!list[job][subType][1]) {
		// 		list[job][subType][1] = item;
		// 		return null;
		// 	} else {
		// 		oldItem = list[job][subType][0];
		// 		clearItem1 = this.checkEquipGetBest(oldItem, item);
		// 		if (oldItem == clearItem1) {
		// 			list[job][subType][0] = item;
		// 		}
		// 		oldItem = list[job][subType][1];
		// 		clearItem = this.checkEquipGetBest(oldItem, clearItem1);
		// 		if (oldItem == clearItem) {
		// 			list[job][subType][1] = clearItem1;
		// 		}
		// 	}
		// } else {
		oldItem = list[job][subType];
		clearItem = this.checkEquipGetBest(oldItem, item);
		if (oldItem == clearItem) {
			list[job][subType] = item;
		}
		// }
		return clearItem;
	}
	//对比两个装备
	public checkEquipGetBestEx(oldItem: ItemData, newItem: ItemData): ItemData {
		if (oldItem && newItem) {
			if (oldItem.point >= newItem.point) {
				return oldItem;
			} else {
				return newItem;
			}
		}
		return null;
	}
	//对比两个装备
	public checkEquipGetBest(oldItem: ItemData, newItem: ItemData): ItemData {
		if (oldItem != null && newItem != null && oldItem.point >= newItem.point) {
			return newItem;
		}
		return oldItem;
	}
	//填充保留装备的列表(传奇装备)
	public addOneEquipToListEx(list: any[], item: EquipsData | ItemData, rolejob: number = 0): void {
		let goods: ItemData;
		if (item instanceof EquipsData) {
			goods = this.cloneItemDataInfo(item.item);
		} else {
			goods = this.cloneItemDataInfo(item as ItemData);
		}
		let job: number = ItemConfig.getJob(goods.itemConfig);
		let subType: number = ItemConfig.getSubType(goods.itemConfig);
		if (!job) job = rolejob;

		if (!list[job]) {
			list[job] = [];
		}

		list[job][subType] = goods;
	}
	/**
	 * 填充保留装备的列表(神装)
	 * @param 存储所有角色身上所有部位的装备 list[job][subType]
	 * @param 每一个部位
	 * @param 角色索引
	 * */
	public addOneEquipToListRed(list: any[], item: EquipsData | ItemData, roleId: number): void {
		let goods: ItemData;
		if (item instanceof EquipsData) {
			goods = this.cloneItemDataInfo(item.item);
		} else {
			goods = this.cloneItemDataInfo(item as ItemData);
		}
		// let job: number = ItemConfig.getJob(goods.itemConfig);
		let subType: number = ItemConfig.getSubType(goods.itemConfig);
		// if (!job) job = rolejob;

		if (!list[roleId]) {
			list[roleId] = [];
		}

		list[roleId][subType] = goods;
	}

	//填充保留装备的列表
	public addOneEquipToList(list: any[], item: EquipsData | ItemData, index: number = 0): void {
		let goods: ItemData;
		if (item instanceof EquipsData) {
			goods = this.cloneItemDataInfo(item.item);
		} else {
			goods = this.cloneItemDataInfo(item as ItemData);
		}
		let job: number = ItemConfig.getJob(goods.itemConfig);
		if (job == 0) job = index;

		let subType: number = ItemConfig.getSubType(goods.itemConfig);
		if (!list[job]) {
			list[job] = [];
		}
		// if (subType == 4 || subType == 5) {
		// 	//装备子类型为 4 或者 5的同时需要保留两件 特殊处理
		// 	if (list[job][subType]) {
		// 		list[job][subType][1] = goods;
		// 	} else {
		// 		list[job][subType] = [];
		// 		list[job][subType][0] = goods;
		// 	}
		// } else {
		list[job][subType] = goods;
		// }
	}

	/**
	 * 复制一个道具数组
	 * @param list
	 */
	public cloneItemDataList(list: ItemData[]): ItemData[] {
		let returnList: ItemData[] = [];
		for (let i: number = 0; i < list.length; i++) {
			let item: ItemData = new ItemData();
			item.handle = list[i].handle;
			item.configID = list[i].configID;
			item.att = list[i].att;
			item.itemConfig = list[i].itemConfig;
			item.count = list[i].count;
			returnList.push(item);
		}
		return returnList;
	}

	/**
	 * 复制一个道具数组
	 * @param data
	 */
	public cloneItemDataInfo(data: ItemData): ItemData {
		let item: ItemData = new ItemData();
		item.handle = data.handle;
		item.configID = data.configID;
		item.att = data.att;
		item.itemConfig = data.itemConfig;
		item.count = data.count;
		return item;
	}

	/**
	 * 获取背包物品排序
	 * type  0  普通物品背包     1符文背包
	 */
	public getItemBySort(type: number) {
		let goodsList: ItemData[] = this.getGoodsListByType(type, UserBag.BAG_TYPE_OTHTER);
		goodsList.sort((n1, n2) => {
			if (n1.configID > n2.configID) {
				return 1;
			}
			if (n1.configID < n2.configID) {
				return -1;
			}

			return 0;
		});
		return goodsList;
	}

	/**
	 * 获取背包了某种类型的物品
	 * @param type 类型
	 */
	public getItemByType(type: number) {

		let itemData: ItemData[] = this.bagModel[UserBag.BAG_TYPE_OTHTER];
		let itemData1: ItemData[] = [];

		for (let a in itemData) {
			if (ItemConfig.getType(itemData[a].itemConfig) == type) {
				itemData1.push(itemData[a]);
			}
		}
		return itemData1;

	}

	/**
	 * 根据descIndex类型获取背包指定物品
	 * @param descIndex 类型
	 */
	public getItemByDescIndex(descIndex: number, Bag_Type: number = UserBag.BAG_TYPE_OTHTER): ItemData {
		let itemData: ItemData[] = this.bagModel[Bag_Type];
		let itemData1: ItemData;

		for (let a in itemData) {
			if (itemData[a].itemConfig.descIndex == descIndex) {
				itemData1 = itemData[a];
				break;
			}
		}
		return itemData1;
	}

	/**
	 * 获取背包了某种类型的物品
	 * @param quality 品质
	 * @param type 类型
	 */
	public getEquipsByQuality(quality: number, type: number = 0, Bag_Type: number = UserBag.BAG_TYPE_EQUIP) {
		let itemData: ItemData[] = this.bagModel[Bag_Type];
		let itemData1: ItemData[] = [];
		for (let a in itemData) {
			let item: ItemData = itemData[a];
			if (item &&
				ItemConfig.getType(item.itemConfig) == type &&
				ItemConfig.getQuality(item.itemConfig) == quality) {
				itemData1.push(itemData[a]);
			}
		}
		return itemData1;
	}

	/**
	 * 通过handle获取背包物品
	 * @param type 类型
	 * @param handle
	 */
	public getItemByHandle(type: number, handle: number): ItemData {
		let itemData: ItemData[] = this.bagModel[type];
		for (let i: number = 0; i < itemData.length; i++) {
			if (itemData[i].handle == (handle))
				return itemData[i];
		}
		return null;
	}

	//type 1-符文仓库的物品  0--普通寻宝的物品
	public getHuntGoods(type: number) {
		return this.getGoodsListByType(type);
	}

	/**
	 * type 1-符文仓库的物品  0--普通寻宝的物品 2--诛仙仓库
	 * bagType  背包物品类型
	 */
	public getGoodsListByType(type: number, bagType: number = UserBag.BAG_TYPE_TREASUREHUNT): ItemData[] {
		let list: ItemData[] = this.bagModel[bagType];
		let backList: ItemData[] = [];
		if (list) {
			for (let i: number = 0; i < list.length; i++) {
				let itemConfig = list[i].itemConfig;
				// let it = ItemConfig.getType(list[i].itemConfig);
				if (itemConfig.bagType == type) {
					if (itemConfig.split)
						this.splitItemData(backList, list[i])
					else
						backList.push(list[i]);
				}
			}
		}
		return backList;
	}

	private splitItemData(list: ItemData[], itemData: ItemData) {
		let count = itemData.count;
		if (count > 1) {
			while (count > 0) {
				let newItem = itemData.copy();
				newItem.count = 1;
				list.push(newItem);

				count -= 1;
			}
		} else {
			list.push(itemData);
		}
	}

	/** TODO hepeiye
	 * 获取寻宝仓库排序
	 */
	public getHuntGoodsBySort(type: number): ItemData[] {
		let goodsList: ItemData[] = [];
		if (this.bagModel[UserBag.BAG_TYPE_TREASUREHUNT]) {
			goodsList = this.getGoodsListByType(type);
			goodsList.sort((n1, n2) => {
				let n1t = ItemConfig.getType(n1.itemConfig);
				let n2t = ItemConfig.getType(n2.itemConfig);
				if (n1t < n2t) {
					return 1;
				} else if (n1t > n2t) {
					return -1;
				}

				if (n1t) {
					if (n1.configID >= n2.configID) {
						return 1;
					} else if (n1.configID < n2.configID) {
						return -1;
					}
				} else {
					if (n1.point >= n2.point) {
						return -1;
					} else if (n1.point < n2.point) {
						return 1;
					}
				}
				return 0;
			});
		}
		return goodsList;
	}


	//可熔炼的翅膀和玄玉装备
	public getGuanyinEquip(list: ItemData[]): ItemData[] {
		let items: ItemData[] = this.getBagSortQualityEquips(5, 0, 0, this.otherEquipSmeltFilter);
		let lastId: number = 0;
		let len: number = SubRoles.ins().subRolesLen;
		if (len < 3) {
			lastId = 0;
		} else {
			for (let i: number = 0; i < len; i++) {
				let mo: Role = SubRoles.ins().getSubRoleByIndex(i);
				let equip: EquipsData = mo.getEquipByIndex(EquipPos.DZI);
				if ((equip && equip.item && equip.item.configID < lastId) || lastId == 0) lastId = equip.item.configID;
			}
		}

		if (items.length > 0) {
			for (let k in items) {
				let item = this.updateGuanyinEquip(items[k], lastId);
				if (item != null)
					list.push(item);
				if (list.length >= 9) break;
			}
		}
		return list;
	}

	//对比下装备
	private updateGuanyinEquip(data: ItemData, lastId: number = 0): ItemData {
		//和身上的玄玉装备比较评分
		let index: number = 0;
		let len: number = SubRoles.ins().subRolesLen;
		if (ItemConfig.getSubType(data.itemConfig) == ForgeConst.EQUIP_POS_TO_SUB[EquipPos.DZI]) {
			// let score: number = ItemConfig.calculateBagItemScore(data);
			let score: number = data.point;
			for (let i: number = 0; i < len; i++) {
				let mo: Role = SubRoles.ins().getSubRoleByIndex(i);
				let equip: EquipsData = mo.getEquipByIndex(EquipPos.DZI);
				let config: ItemConfig = equip.item.itemConfig;
				if (!config || (config && score > equip.item.point)) {
					return null;
				}
				//
				// if (config && config.id <= lastId && score <= equip.item.point) {
				// 	return data;
				// }
			}
			return data;//背包装备比所有角色身上的都差才行

		}
		return null;
	}

	public getGuanyinLevel(itemConfig): string {
		let str = TextFlowMaker.numberToChinese(itemConfig.id - ItemConst.GUANYIN_ITEM + 1);
		return `${str}阶`;
	}


	/**
	 * 获取是否有可用道具
	 */
	public getIsExitUsedItem(): boolean {
		let arr: ItemData[] = this.bagModel[UserBag.BAG_TYPE_OTHTER];
		if (!arr) return false;
		for (let i: number = 0; i < arr.length; i++) {
			if (arr[i].getCanbeUsed()) {
				UserBag.ins().isExitUsedItem = 1;
				return true;
			}
		}
		UserBag.ins().isExitUsedItem = 0;
		return false;
	}

	/** 计算所有角色身上的装备评分总和 **/
	public getEquipsScoreByBodys() {
		let len: number = SubRoles.ins().subRolesLen;
		let point: number = 0;
		for (let i = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role && role.equipsData) {
				let eqdata: EquipsData[] = role.equipsData;
				for (let j = 0; j < EquipPos.MAX; j++) {
					if (eqdata[j] && eqdata[j].item &&
						eqdata[j].item.itemConfig && eqdata[j].item.itemConfig.id) {
						point += eqdata[j].item.point;
					}

				}
			}
		}
		return point;
	}
	/**计算装备评分 是否比身上的装备评分高 */
	public calculationScore(item: ItemData): number {
		let equipsData: ItemData;
		let mPoint: number = 0;
		let len: number = SubRoles.ins().subRolesLen;
		for (let ii: number = 0; ii < len; ii++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(ii);
			if (role.job == ItemConfig.getJob(item.itemConfig)) {
				let equipLen: number = role.getEquipLen();
				for (let n: number = 0; n < equipLen; n++) {
					equipsData = role.getEquipByIndex(n).item;
					if (equipsData && equipsData.itemConfig && ItemConfig.getSubType(equipsData.itemConfig) == ItemConfig.getSubType(item.itemConfig)) {
						if (mPoint == 0) {
							mPoint = equipsData.point;
						} else {
							mPoint = Math.min(equipsData.point, mPoint);
						}
					}
				}
			}
		}
		return item.point - mPoint;
	}


	//------------------------------------------------特殊道具回调函数------------------------------------------------
	private useRenameItem(id: number, count: number): void {
		ViewManager.ins().open(RenameWin);
	}


	/**
	 * 换算属性组的战斗力
	 * @param attr
	 */
	static getAttrPower(attr: AttributeData[], role:Role = null): number {
		let powerConfig: AttrPowerConfig[] = GlobalConfig.AttrPowerConfig;
		let allPower = 0;
		if (!attr) return allPower;

		let exPower: number = 0;

		for (let i: number = 0; i < attr.length; i++) {
			let atype = attr[i].type;
			let value = attr[i].value;
			if (atype == AttributeType.atHpEx ||
				atype == AttributeType.atAtkEx ||
				atype == AttributeType.atDamageReduction
			) {
				continue;
			}
			if (!powerConfig[atype] || !value) continue;
			allPower += value * powerConfig[atype].power;
			if (atype == AttributeType.atHuiXinDamage && role) //会心战力
				exPower += ItemConfig.relatePower(attr[i], role);
		}
		return Math.floor(allPower / 100) +Math.floor(exPower);
	}

	private equipPowerDic: number[][] = [];

	public setEquipPowerDic(job: number, pos: number, power: number = 0): void {
		if (!this.equipPowerDic[job]) this.equipPowerDic[job] = [];
		if (!this.equipPowerDic[job][pos]) this.equipPowerDic[job][pos] = 0;
		this.equipPowerDic[job][pos] = power;
	}

	public getEquipPowerDic(job: number, pos: number): number {
		if (this.equipPowerDic[job] && this.equipPowerDic[job][pos]) {
			return this.equipPowerDic[job][pos];
		}
		return 0;
	}

	public getLowEquipIndex(equips: ItemData[], type: number): number {
		let index: number = -1;
		let tPower: number = Number.MAX_VALUE;

		let len: number = equips.length;
		for (let i: number = 0; i < len; i++) {
			if (ForgeConst.EQUIP_POS_TO_SUB[i] != type)
				continue;

			let item: ItemData = equips[i];

			if (item.handle == 0) {
				return i;
			}
			let itemPower: number = item.point;
			if (itemPower < tPower) {
				index = i;
				tPower = itemPower;
			}
		}
		return index;
	}

	public getHejiEquips(): ItemData[] {
		let itemData: ItemData[] = this.bagModel[1];
		let list: ItemData[] = [];
		for (let i: number = 0; i < itemData.length; i++) {
			let item: ItemData = itemData[i];
			if (ItemConfig.getType(item.itemConfig) == 5)
				list.push(item);
		}
		return list;
	}

	private wearList: any[] = [];

	private checkIsWear(item: ItemData): boolean {
		if (!item) {
			return false;
		}
		for (let k: number = 0; k < 8; k++) {
			let wear: ItemData = UserSkill.ins().equipListData[k];
			if (wear && wear.handle == item.handle) {
				return false;
			}
		}
		return true;
	}

	private makeHejiWearList(item: ItemData): void {
		let pos: number = ItemConfig.getSubType(item.itemConfig);
		// if (!this.wearList[job]) {
		// 	this.wearList[job] = [];
		// }
		this.wearList[pos] = item;
	}

	//选择评分低的装备熔炼
	public checkEquipsTodestroy(returnList: ItemData[]): void {
		if (!UserSkill.ins().equipListData) return;
		//穿在身上的装备
		for (let k: number = 0; k < 8; k++) {
			let wear: ItemData = UserSkill.ins().equipListData[k];
			if (wear && wear.configID != 0) {
				this.makeHejiWearList(wear);
			}
		}
		// let saveList: ItemData[] = [];
		let itemList: ItemData[] = this.getHejiEquips();
		let len: number = itemList.length;
		let item: ItemData;
		let wear: ItemData;
		for (let i: number = 0; i < len; i++) {
			item = itemList[i];
			//5转直接可分解
			if (item.itemConfig.zsLevel == 5) {
				returnList.push(item);
				continue;
			}
			// let job: number = item.itemConfig.job;
			let pos: number = ItemConfig.getSubType(item.itemConfig);
			wear = this.wearList[pos];
			if (!wear || wear.configID == 0) continue;
			let point1: number = 0;
			let point2: number = 0;
			point1 = item.point;
			point2 = wear.point;
			// point1 = GameGlobal.getAttrPower(item.att);
			// point2 = GameGlobal.getAttrPower(wear.att);
			if (point2 >= point1) {
				returnList.push(item);
			} else {
				let level: number = 0;
				//  = GameGlobal.lunhuiModel.level;
				if (item.itemConfig.level <= level) {
					//替换新的装备
					this.wearList[pos] = item;
					//检查这个装备是否穿在身上
					if (this.checkIsWear(wear)) {
						returnList.push(wear);
					}
				}
			}
			//每次只需要拿九个物品
			if (returnList.length >= 9) {
				break;
			}
		}
	}

	public getEquipByPos(index: number, pos: number): ItemData[] {
		let list: ItemData[] = this.bagModel[UserBag.BAG_TYPE_EQUIP];
		let role: Role = SubRoles.ins().getSubRoleByIndex(index);
		let goods: EquipsData = role.getEquipByIndex(pos);
		let subType: number = 0;
		if (goods && goods.item.itemConfig) {
			subType = ItemConfig.getSubType(goods.item.itemConfig);
		} else {
			subType = pos;
		}
		let returnList: ItemData[] = [];
		let tempList: ItemData[] = [];
		let level: number = Actor.level;
		let zsLevel: number = UserZs.ins().lv;
		for (let i: number = 0; i < list.length; i++) {
			let job = ItemConfig.getJob(list[i].itemConfig);
			let subType1 = ItemConfig.getSubType(list[i].itemConfig);
			if ((job == role.job || job == 0) && subType1 == subType) {
				//印记装备过滤掉
				if (Math.floor(list[i].itemConfig.id / 10000) == 91)
					continue;
				if (goods && list[i].handle == goods.item.handle) {
					continue;
				}
				if (zsLevel < list[i].itemConfig.zsLevel || level < list[i].itemConfig.level) {
					tempList.push(list[i]);
				} else {
					returnList.push(list[i]);
				}
			}
		}
		returnList = returnList.sort(this.sortFun);
		tempList.sort(this.sortFun)
		returnList = returnList.concat(tempList);
		// return returnList;
		return returnList;
	}

	/**
	 * 排序方法
	 */
	// private sortFunc(a: ItemData, b: ItemData): number {
	// 	let s1: number = a.itemConfig.zsLevel * 10000 + a.itemConfig.level;
	// 	let s2: number = b.itemConfig.zsLevel * 10000 + b.itemConfig.level;
	// 	return Algorithm.sortAsc(s1, s2);
	// }

	private sortFun(aItem: ItemData, bItem: ItemData): number {
		let att1 = UserBag.ins().getEquipAttrs(aItem);
		let itemPoint1: number = UserBag.getAttrPower(att1);
		let att2 = UserBag.ins().getEquipAttrs(bItem);
		let itemPoint2: number = UserBag.getAttrPower(att2);
		if (itemPoint1 < itemPoint2)
			return 1;
		if (itemPoint1 > itemPoint2)
			return -1;
		return 0;
	}

	public getEquipAttrs(data: ItemData): AttributeData[] {
		let config = GlobalConfig.EquipConfig[data.configID];
		let totalAttr: AttributeData[] = [];
		for (let k in Role.translate) {
			if (config[k] <= 0)
				continue;
			let attr = data.att;
			for (let index = 0; index < attr.length; index++) {
				if (attr[index].type == Role.getAttrTypeByName(k)) {
					// randAttrList.push('+' + attr[index].value);
					let attrs: AttributeData = new AttributeData;
					attrs.type = attr[index].type;
					attrs.value = config[k] + attr[index].value;
					totalAttr.push(attrs);
					break;
				}
			}
		}
		return totalAttr;
	}
	//神装检查可合成时候 显示红点状况
	public checkEqRedPoint(index: number, role: Role, islook?: boolean): boolean {
		let equipData: EquipsData = role.getEquipByIndex(index);
		let nextConfig: ItemConfig;
		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) < 4)
			nextConfig = null;
		else
			nextConfig = GlobalConfig.ItemConfig[equipData.item.configID + 1];
		let needNum: number = 0;
		let costID: number = 0;

		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) == 4 && equipData.item.itemConfig.zsLevel >= 12)
			return null;

		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) == 5)
			return null;

		if (nextConfig != null && (nextConfig.level > Actor.level || nextConfig.zsLevel > UserZs.ins().lv))
			return null;

		if (nextConfig != undefined && equipData.item.handle != 0 && ItemConfig.getQuality(equipData.item.itemConfig) == 4 && equipData.item.itemConfig.level != 1 && UserBag.fitleEquip.indexOf(equipData.item.configID) == -1) {


		} else {
			let configId: number = UserEquip.ins().getEquipConfigIDByPosAndQualityByGod(role, index, 4, role.job);
			let mixConfig = GlobalConfig.LegendComposeConfig[configId];
			if (mixConfig) {
				needNum = mixConfig.count;
				costID = mixConfig.itemId;
				let curNum = UserBag.ins().getItemCountById(0, costID);
				if (curNum >= needNum && !UserBag.ins().OrangeEquipRedPoint[index]) {
					if (islook)//本来是可合成 但未合成的情况下  当次登陆只显示一次  后来说去掉 为了以后又要开启 这里暂时处理成false
						UserBag.ins().OrangeEquipRedPoint[index] = false;
					return true;
				} else {
					return false;
				}

			}
		}

		return null;

	}

	/**
	 * 3-8
	 * 可选礼包使用结果
	*/
	private doUseGiftResult(bytes: GameByteArray): void {
		//0成功
		//非0失败
		var result: number = bytes.readUnsignedByte();
		if (result == 0)
			this.postGiftResult();
	}

	public postGiftResult(): void {

	}

	/**
	 * 3- 8
	 * 使用可选礼包
	 * param itemId 礼包ID
	 * param count 礼包数量
	 * param index 选中物品索引
	*/
	public sendChoosableGift(itemId: number, count: number, index: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(itemId);
		bytes.writeInt(count);
		bytes.writeInt(index + 1);
		this.sendToServer(bytes);
	}

	/**
	 * 获取指定rmb物品是否足够元宝可买
	 * */
	public getRmbItemIsBuy(id: number): boolean {
		let config: ItemConfig = GlobalConfig.ItemConfig[id];
		if (config && config.needyuanbao && Actor.yb >= config.needyuanbao) {
			return true;
		}

		return false;
	}

	/**
	 * 通过id获取背包物品的数量
	 * @param type 类型
	 * @param id
	 */
	public getBagGoodsCountById(type: number, id: number): number {
		if (type == 0 || type == 1) {
			return this.getBagItemCount(type, id);
		}

		let itemData: ItemData[] = this.bagModel[type];
		if (itemData) {
			for (let data of itemData) {
				if (data.itemConfig && data.itemConfig.id == id)
					return data.count;
			}
		}
		return 0;
	}

	public getBagItemCount(type, id) {
		return this.itemCount[type][id] || 0;
	}

	/**根据道具类型和id获取道具*/
	public getBagGoodsByTypeAndId(type: number, id: number): ItemData {
		let itemData: ItemData[] = this.bagModel[type];
		for (let data of itemData) {
			if (data.itemConfig.id == id)
				return data;
		}
		return null;
	}

}
namespace GameSystem {
	export let userbag = UserBag.ins.bind(UserBag);
}