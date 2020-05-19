class RuneRedPointMgr extends BaseClass {
	public constructor() {
		super();
	}

	/** 重载单例*/
	public static ins(): RuneRedPointMgr {
		return super.ins() as RuneRedPointMgr;
	}

	/**
	 * 检测单个符文升级
	 * @param  {number} item
	 * @returns boolean
	 */
	public checkSingleUpgrade(item: ItemData): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		//品级判断
		let ic: ItemConfig = item.itemConfig;
		if (this.assert(ic, "ItemConfig(" + item.configID + ")")) return false;
		let next: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(item, true);
		if (!next) return false;

		//数量判断
		let rbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(item);
		if (this.assert(rbc, "RuneBaseConfig")) return false;
		let curNum: number = Actor.runeShatter;
		return curNum >= rbc.expend;
	}

	/**
	 * 检测单人升级
	 * @param  {number} roleID
	 * @returns boolean
	 */
	public checkRoleUpgrade(roleID: number): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(roleID);
		if (rdList) {
			for (let v of rdList) {
				if (v && v.itemConfig && v.itemConfig.id > 0 && this.checkSingleUpgrade(v)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * 检测所有的升级
	 * @returns boolean
	 */
	public checkAllUpgrade(): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			if (this.checkRoleUpgrade(i)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 检测单个符文替换
	 * @param  {number} roleID        角色ID
	 * @param  {number} item        符文ID
	 * @returns boolean
	 */
	public checkSingleReplace(roleID: number, item: ItemData): boolean {
		//开启判断
		// if (!this.checkOpen()) return false;
		// //符文道具配置
		// let ic: ItemConfig = item.itemConfig;
		// if (this.assert(ic, "ItemConfig(" + item.configID + ")")) return false;
		// //符文配置
		// let rbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(item);
		// if (this.assert(rbc, "RuneBaseConfig(" + item.configID + ")")) return false;
		// //角色当前符文
		// let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(roleID);
		// //背包符文集合
		// let itemDatas: ItemData[] = UserBag.ins().getBagGoodsByType(6);
		//
		// if (itemDatas) {
		// 	let itemRuneCfg: RuneBaseConfig = null;
		// 	let tempRuneCfg: RuneBaseConfig = null;
		// 	let canReplace: boolean = true;
		// 	for (let v of itemDatas) {
		// 		//每个背包里的符文检测
		// 		if (v && v.itemConfig.quality > ic.quality) {
		// 			itemRuneCfg = RuneConfigMgr.ins().getBaseCfg(v);
		// 			if (rbc.type == itemRuneCfg.type) {
		// 				//同类型
		// 				return true;
		// 			}
		// 			else {
		// 				//不同类型
		// 				canReplace = true;
		// 				//特殊符文检测
		// 				//已有相同类型检测
		// 				if (canReplace) {
		// 					for (let rdv of rdList) {
		// 						if (rdv && rdv.itemConfig && rdv.itemConfig.id > 0) {
		// 							tempRuneCfg = RuneConfigMgr.ins().getBaseCfg(rdv);
		// 							if (tempRuneCfg && tempRuneCfg.type == itemRuneCfg.type) {
		// 								canReplace = false;
		// 								break;
		// 							}
		// 						}
		// 					}
		// 				}
		// 				if (canReplace) {
		// 					return true;
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		//替换不用提醒
		return false;
	}

	/**
	 * 检测单个角色替换
	 * @param  {number} roleID
	 * @returns boolean
	 */
	public checkRoleReplace(roleID: number): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(roleID);
		if (rdList) {
			for (let v of rdList) {
				if (v && v.itemConfig && v.itemConfig.id > 0 && this.checkSingleReplace(roleID, v)) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * 检测全部替换
	 * @returns boolean
	 */
	public checkAllReplace(): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			if (this.checkRoleReplace(i)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 检测单个能否镶嵌
	 * @param  {number} roleID
	 * @param  {number} pos
	 * @returns boolean
	 */
	public checkSingleInlay(roleID: number, pos: number): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let rplc: RuneLockPosConfig = RuneConfigMgr.ins().getLockCfg(pos);
		if (this.assert(rplc, "RuneLockPosConfig(" + pos + ")")) return false;
		let lockLv: number = rplc.lockLv;
		let level: number = SkyLevelModel.ins().cruLevel;
		if (level > lockLv) {
			//已开启
			let rd: ItemData = RuneDataMgr.ins().getRune(roleID, pos);
			if (rd && rd.configID <= 0) {
				//未镶嵌
				let itemDatas: ItemData[] = UserBag.ins().getItemBySort(1);
				let runeType: number = 0;
				let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(roleID);
				let canInlay: boolean = true;

				//符文道具镶嵌检测
				for (let v of itemDatas) {
					if (v) {
						runeType = ItemConfig.getSubType(v.itemConfig);
						if (runeType > 0 && rdList) {
							canInlay = true;
							//现有符文类型冲突检测
							if (canInlay) {
								for (let rdv of rdList) {
									if (rdv && rdv.itemConfig && rdv.itemConfig.id > 0) {
										if (runeType == ItemConfig.getSubType(rdv.itemConfig)) {
											canInlay = false;
											break;
										}
									}
								}
							}
							if (canInlay) {
								return true;
							}
						}
					}
				}
			}
		}

		return false;
	}

	/**
	 * 检测单个角色镶嵌
	 * @param  {any} roleID
	 * @returns boolean
	 */
	public checkRoleInlay(roleID: number): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		for (let i: number = 0; i < RuneConfigMgr.ins().getOtherCfg().maxEquip; i++) {
			if (this.checkSingleInlay(roleID, i)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 检测全部镶嵌
	 * @returns boolean
	 */
	public checkAllInlay(): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			if (this.checkRoleInlay(i)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 检测单个角色的所有情况
	 * @param  {number} roleID
	 * @returns boolean
	 */
	public checkRoleAllSituation(roleID: number): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let canShow: boolean = this.checkRoleInlay(roleID);
		if (!canShow) canShow = this.checkRoleUpgrade(roleID);
		if (!canShow) canShow = this.checkRoleReplace(roleID);

		return canShow;
	}

	/**
	 * 检测所有情况
	 * @returns boolean
	 */
	public checkAllSituation(exchange: boolean = true): boolean {
		//开启判断
		if (!this.checkOpen()) return false;
		let canShow: boolean = this.checkAllInlay();
		if (!canShow) canShow = this.checkAllUpgrade();
		if (!canShow) canShow = this.checkAllReplace();
		if (exchange)
			if (!canShow) canShow = this.checkCanExchange();
		return canShow;
	}

	//是否可兑换符文
	public checkCanExchange(): boolean {
		let data: RuneConverConfig[] = RuneConfigMgr.ins().getExchangeDataList();
		for (let i: number = 0; i < data.length; i++) {
			let cfg: RuneConverConfig = data[i];
			if (Actor.runeExchange >= cfg.conversion)
				return true;
		}
		return false;
	}

	/**
	 * 检测开启
	 * @returns boolean
	 */
	private checkOpen(): boolean {
		return Actor.level >= RuneConfigMgr.ins().getOtherCfg().zsLevel;
	}

	/**
	 * 断言
	 * @param  {any} value
	 * @param  {string} msg
	 * @returns boolean
	 */
	private assert(value: any, msg: string): boolean {
		return Assert(value, "[" + egret.getQualifiedClassName(RuneRedPointMgr) + "] " + msg + "is null");
	}
}