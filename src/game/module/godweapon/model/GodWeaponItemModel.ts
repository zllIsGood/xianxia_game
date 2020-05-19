/**
 * 圣物合成 融合数据模型
 * Created by Peach.T on 2017/11/17.
 */
class GodweaponItemModel extends BaseClass {

	/**
	 * 圣物品质MAP 数据结构key : 品质， value: 物品ID列表
	 * @type {{}}
	 */
	public qualityItemMap = {};

	/**
	 * 圣物职业MAP 数据结构key : 职业， value: 物品ID列表
	 * @type {{}}
	 */
	public jobItemMap = {};

	public static ins(): GodweaponItemModel {
		return super.ins() as GodweaponItemModel;
	}

	public init(): void {
		for (let i in GlobalConfig.GodweaponItemConfig) {
			let cfg = GlobalConfig.GodweaponItemConfig[i];
			let item = GlobalConfig.ItemConfig[cfg.id];
			let quality = ItemConfig.getQuality(item);
			if (quality < 4) {
				let ary: number[] = this.qualityItemMap[quality];
				if (ary == undefined) {
					ary = [];
				}
				ary.push(cfg.id);
				this.qualityItemMap[quality] = ary;
			} else if (quality == 4) {
				if (!cfg.skill || cfg.skill.length <= 1) {
					let job = ItemConfig.getJob(item);
					let dataAry: number[] = this.jobItemMap[job];
					if (dataAry == undefined) {
						dataAry = [];
					}
					dataAry.push(cfg.id);
					this.jobItemMap[job] = dataAry;
				}
			}
		}
	}

	/**
	 *获取背包是否有物品能合成
	 */
	public isCanCompound(): boolean {
		let canCompound = false;
		for (let i in this.qualityItemMap) {
			if (parseInt(i) < 4) {//品质低于4的才能合成
				canCompound = this.checkNum(this.qualityItemMap[i]);
				if (canCompound)return canCompound;
			}
		}
		return canCompound;
	}

	/**
	 * 背包里同一品质物品数量达到3个就可以合成
	 * @param itemList 背包里有的同一品质的物品列表
	 * @returns {boolean}
	 */
	public checkNum(itemList: number[]): boolean {
		let count = itemList.length;
		let itemCount = 0;
		for (let i = 0; i < count; i++) {
			itemCount += UserBag.ins().getItemCountById(0, itemList[i]);
		}
		return itemCount >= 3;
	}

	/**
	 * 获取可以合成物品列表
	 */
	public getCompoundItemList(): any {
		let list = {};
		let canCompound = false;
		for (let i in this.qualityItemMap) {
			canCompound = this.checkNum(this.qualityItemMap[i]);
			if (canCompound) {//当前品质可以合成 则
				list[i] = this.getItemList(this.qualityItemMap[i]);
			}
		}
		return list;
	}

	/**
	 * 筛选同品质的圣物列表
	 * @param data
	 */
	public filterCompoundItemList(data: GodweaponItemData, list: GodweaponItemData[]): GodweaponItemData[] {
		let result: GodweaponItemData[] = [];
		for (let i in list) {
			let cfg: GodweaponItemData = new GodweaponItemData(list[i].id, list[i].count, list[i].quality);
			if (cfg.quality == data.quality) {
				if (cfg.id == data.id) {
					if (cfg.count > 1) {
						cfg.count--;
						result.push(cfg);
					}
				}
				else {
					result.push(cfg);
				}
			}
		}
		return result;
	}

	public toList(list: any): any[] {
		let ary: any[] = [];
		for (let i in list) {
			ary = ary.concat(list[i]);
		}
		return ary;
	}

	/**
	 * 获取玩家拥有某个品质组的ID列表
	 * @param itemList 某个品质组的物品列表
	 * @returns {Array}
	 */
	public getItemList(itemList: number[]): GodweaponItemData[] {
		let count = itemList.length;
		let ary = [];
		for (let i = 0; i < count; i++) {
			let itemId = itemList[i];
			let itemCount = UserBag.ins().getItemCountById(0, itemId);
			let quality = ItemConfig.getQuality(GlobalConfig.ItemConfig[itemId]);
			if (itemCount > 0) {
				ary.push(new GodweaponItemData(itemId, itemCount, quality));
			}
		}
		return ary;
	}

	/**
	 *获取背包是否有物品能融合
	 */
	public isCanFuse(): boolean {
		let canFuse = false;
		// for (let i in this.jobItemMap) {   注意策划要求暂时屏蔽神兵圣物融合功能，暂时屏蔽三行代码  peach.T 2017.11.29
		// 	canFuse = this.checkFuseNum(this.jobItemMap[i]);
		// 	if (canFuse)return canFuse;
		// }
		return canFuse;
	}

	/**
	 * 背包里同一职业物品数量达到2个就可以融合
	 * @param itemList 背包里有的同一职业的物品列表
	 * @returns {boolean}
	 */
	public checkFuseNum(itemList: number[]): boolean {
		let count = 0;
		let itemCount = 0;
		for (let i = 0; i < itemList.length; i++) {
			itemCount = UserBag.ins().getItemCountById(0, itemList[i]);
			if (itemCount > 0) {
				count++;
				if (count > 1) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * 根据选中物品 筛选可以合成的物品列表
	 * @param itemList
	 * @param selectItemId
	 */
	public getFuseItemList(): any {
		let list = {};
		let canFuse = false;
		for (let i in this.jobItemMap) {
			canFuse = this.checkFuseNum(this.jobItemMap[i]);
			if (canFuse) {//当前品质可以合成 则
				list[i] = this.getJobFuseItemList(this.jobItemMap[i]);
			}
		}
		return list;
	}

	/**
	 * 获取玩家拥有某个角色组的ID列表
	 * @param itemList 某个品质组的物品列表
	 * @returns {Array}
	 */
	public getJobFuseItemList(itemList: number[]): GodweaponItem[] {
		let count = itemList.length;
		let ary = [];
		for (let i = 0; i < count; i++) {
			let id = itemList[i];
			let quality = ItemConfig.getQuality(GlobalConfig.ItemConfig[id]);
			let itemCount = UserBag.ins().getItemCountById(0, itemList[i]);
			if (itemCount > 0) {
				ary.push(new GodweaponItemData(id, itemCount, quality));
			}
		}
		return ary;
	}


	/**
	 * 筛选同职业的圣物列表
	 * @param data
	 */
	public filterFuseItemList(data: GodweaponItemData, list: GodweaponItemData[]): GodweaponItemData[] {
		let result: GodweaponItemData[] = [];
		let targetJob = ItemConfig.getJob(GlobalConfig.ItemConfig[data.id]);
		for (let i in list) {
			let cfg: GodweaponItemData = new GodweaponItemData(list[i].id, list[i].count, list[i].quality);
			let job = ItemConfig.getJob(GlobalConfig.ItemConfig[cfg.id]);
			if (targetJob == job && data.id != cfg.id) {
				result.push(cfg);
			}
		}
		return result;
	}

	/**
	 * 融合公式
	 * @param itemId1  主圣物ID
	 * @param itemId2  副圣物ID
	 * @returns {number} 融合后的圣物ID
	 */
	public getFuseTargetItem(itemId1: number, itemId2: number): number {
		let job = ItemConfig.getJob(GlobalConfig.ItemConfig[itemId1]);
		let itemId = 400000 + job * 10000 + Math.max(itemId1, itemId2) - Math.min(itemId1, itemId2) + 100 * (Math.min(itemId1, itemId2) % 20)
		return itemId;
	}

}