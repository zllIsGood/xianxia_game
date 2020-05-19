/**
 * Created by hrz on 2018/1/22.
 */

class MergeCC extends BaseSystem {
	private _zlMergeEquip: { [lv: number]: { type: number, id: number }[] };

	constructor() {
		super();
	}

	static ins(): MergeCC {
		return super.ins() as MergeCC;
	}

	isOpen() {
		//return ZhanLingModel.ins().ZhanLingOpen();
		return SamsaraModel.ins().isOpen() || ZhanLingModel.ins().ZhanLingOpen();
	}

	redPoint() {
		let b = false;
		if (SamsaraModel.ins().isOpen()) {
			b = SamsaraModel.ins().isCanCompose();
		}
		if (!b && ZhanLingModel.ins().ZhanLingOpen()) {
			b = this.isZlCanMerge();
		}
		// if (!b && Rune.ins().isOpen()) {
		// b = Rune.ins().isRuneCanMerge();
		// }
		// if (!b && ShenshouModel.ins().checkOpen()) {
		// 	b = ShenshouModel.ins().canTypeCompose(5);
		// }
		return b;
	}

	//获取一级按钮
	getMergeMenu() {
		let config = GlobalConfig.MergeTotal;
		let lv = Actor.level;
		let zs = UserZs.ins().lv;
		let arr = [];
		for (let i in config) {
			if (config[i].type == MergeType.SamsareEquip) {
				if (SamsaraModel.ins().isOpen())
					arr.push(config[i]);
			}
			else if (config[i].type == MergeType.ZhanlingEquip) {
				if (ZhanLingModel.ins().ZhanLingOpen())
					arr.push(config[i]);
			}
			else if (config[i].type == MergeType.ShouShen) {
				// 	if (ShenshouModel.ins().checkOpen())
				// 		arr.push(config[i]);
			}
			else if ((config[i].openZs || 0) <= zs && (config[i].openLv || 0) <= lv) {
				// 	arr.push(config[i]);
			}
		}
		arr.sort(this.sortMenu);
		return arr;
	}

	//获取二级按钮
	getMergeSecMenu(id: number) {
		let config = GlobalConfig.MergeConfig[id];
		let lv = Actor.level;
		let zs = UserZs.ins().lv;
		let arr = [];
		for (let i in config) {
			if ((config[i].openZs || 0) <= zs && (config[i].openLv || 0) <= lv) {
				arr.push(config[i]);
			}
		}
		arr.sort(this.sortMenu);
		return arr;
	}

	private sortMenu(a, b): number {
		return Algorithm.sortAsc(a.sort, b.sort);
	}

	getListData(id: number, index: number): { type: number, id: number }[] {
		let config = GlobalConfig.MergeTotal[id];
		let merge = GlobalConfig.MergeConfig[id][index];
		if (config.type == MergeType.SamsareEquip) {
			return SamsaraModel.ins().composeEquipMap[merge.lv][merge.openZs];
		}
		else if (config.type == MergeType.ZhanlingEquip) {
			return this.getZlMergeEquipByLv(merge.lv);
		}
		else if (config.type == MergeType.Rune) {
			// 	return Rune.ins().getRuneMergeEquipByLv(merge.lv);
		}
		else if (config.type == MergeType.ShouShen) {
			// 	return ShenshouModel.ins().getListByQuality(merge.lv);
		}
		return [];
	}

	//是否可以合成 id为MergeTotal中的id
	isCanMergeById(id: number) {
		let _type = GlobalConfig.MergeTotal[id].type;
		let b = false;
		switch (_type) {
			case MergeType.SamsareEquip:
				b = SamsaraModel.ins().isCanTypeCompose(id);
				break;
			case MergeType.ZhanlingEquip:
				b = this.isZlCanMerge();
				break;
			case MergeType.Rune:
				// 	b = Rune.ins().isRuneCanMerge();
				break;
			case MergeType.ShouShen:
				// 	b = ShenshouModel.ins().canTypeCompose(id)
				break;
		}
		return b;
	}

	//是否可以合成  MergeConfig中的id和index
	isCanMergeByIndex(id: number, index: number) {
		let _type = GlobalConfig.MergeTotal[id].type;
		let b = false;
		switch (_type) {
			case MergeType.SamsareEquip:
				b = SamsaraModel.ins().isCanZsLvCompose(GlobalConfig.MergeConfig[id][index].lv, GlobalConfig.MergeConfig[id][index].openZs);
				break;
			case MergeType.ZhanlingEquip:
				b = this.isZlCanMergeByIndex(id, index);
				break;
			case MergeType.Rune:
				// b = Rune.ins().isRuneCanMergeByType(index);
				break;
			case MergeType.ShouShen:
				// b = ShenshouModel.ins().canTypeCompose(id, index);
				break;
		}
		return b;
	}

	//可以合成的目标id
	getCanMergeTargetId(id: number, index: number) {
		let _type = GlobalConfig.MergeTotal[id].type;
		let targetId = 0;
		switch (_type) {
			case MergeType.SamsareEquip:
				let config = GlobalConfig.MergeConfig[id][index];
				targetId = SamsaraModel.ins().getComposeEquipId(config.lv, config.openZs);
				break;
			case MergeType.ZhanlingEquip:
				targetId = this.getZlCanMergeTargetId(id, index);
				break;
			// case MergeType.Rune:
			//     targetId = id;
			//     break;
		}
		return targetId;
	}

	//是否材料足够合成
	isCanMergeTargetId(type, targetId): boolean {
		if (type == MergeType.SamsareEquip) {
			let config = GlobalConfig.ReincarnateEquipCompose[targetId];
			return SamsaraModel.ins().isCanEquipCompose(config.material.id);
		}
		else if (type == MergeType.ZhanlingEquip) {
			return this.isZlEquipIdCanMerge(targetId);
		}
		else if (type == MergeType.Rune) {
			// return Rune.ins().isRuneCanMergeByID(targetId);
		}
		else if (type == MergeType.ShouShen) {
			// let needId = targetId - 1000;
			// return ShenshouModel.ins().canNeedIdCompose(needId);
		}
		return false;
	}

	//-----------------天仙相关合成---------------------

	/**
	 * 获取天仙合成列表
	 * @param lv
	 * @returns {{type: number, id: number}[]}
	 */
	getZlMergeEquipByLv(lv: number) {
		if (!this._zlMergeEquip) {
			this._zlMergeEquip = {};
			let configs = GlobalConfig.ZhanLingEquip;
			for (let id in configs) {
				if (!this._zlMergeEquip[configs[id].level])
					this._zlMergeEquip[configs[id].level] = [];
				this._zlMergeEquip[configs[id].level].push({ type: MergeType.ZhanlingEquip, id: configs[id].id });
			}
		}
		return this._zlMergeEquip[lv + 1];
	}

	//获取当前列表可合成的装备
	getZlCanMergeTargetId(id: number, index: number) {
		let lv = GlobalConfig.MergeConfig[id][index].lv;
		let equips = this.getZlMergeEquipByLv(lv);
		for (let equip of equips) {
			if (this.isZlEquipIdCanMerge(equip.id)) return equip.id;
		}
		return 0;
	}

	//天仙装备是否有可以合成的
	isZlCanMerge() {
		let config = GlobalConfig.ZhanLingEquip;
		for (let i in config) {
			if (this.isZlEquipIdCanMerge(i)) return true;
		}
		return false;
	}

	//是否可以合成
	isZlCanMergeByIndex(id: number, index: number): boolean {
		return !!this.getZlCanMergeTargetId(id, index);
	}

	//装备id是否可以合成
	isZlEquipIdCanMerge(equipId) {
		let config = GlobalConfig.ZhanLingEquip[equipId];
		let mat = config.mat;
		if (mat) {
			let num = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, mat[0].id) + this.getZlHadEquipCount(mat[0].id);
			if (num >= mat[0].count) {
				return true;
			}

			// let b = true;
			// for (let k = 0; k < mat.length; k++) {
			//     if (UserBag.ins().getBagGoodsCountById(UserBag.BAG_TYPE_OTHTER, mat[0].id) < mat[0].count) {
			//         b = false;
			//         break;
			//     }
			// }
			// if (b) return b;
		}
		return false;
	}

	//获取天仙已经装备的装备数量
	getZlHadEquipCount(equipId) {
		let config = GlobalConfig.ZhanLingEquip[equipId];
		if (ZhanLingModel.ins().getZhanLingDataByItem(0, config.pos) == equipId) {
			return 1;
		}
		return 0;
	}
}

enum MergeType {
	SamsareEquip = 1,
	ZhanlingEquip = 2,
	Rune = 3,
	ShouShen = 4,
}

namespace GameSystem {
	export let  mergeCC = MergeCC.ins.bind(MergeCC);
}