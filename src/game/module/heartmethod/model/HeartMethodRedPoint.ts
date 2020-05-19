/**
 * 心法红点系统
 */
class HeartMethodRedPoint extends BaseSystem {

	redPoint: boolean;//心法页签红点

	roleTabs: Map<Map<boolean>> = {};//角色<心法id<红点>>

	constructor() {
		super();
		this.roleTabs = {};
		this.redPoint = false;

		this.associated(this.postHeartMethodRedPoint,
			this.postHeartRoleRedPoint,
		);

		this.associated(this.postHeartRoleRedPoint,
			HeartMethod.ins().postHeartInfo,
			HeartMethod.ins().postHeartUpLevel,
			HeartMethod.ins().postOneKeyDecompose,
			UserBag.ins().postItemCountChange,
			UserZs.ins().postZsLv,
			GameLogic.ins().postChildRole
		);


	}

	public postHeartMethodRedPoint() {
		let old = this.redPoint;
		if (!HeartMethod.ins().checkOpen()) {
			this.redPoint = false;
			return old != this.redPoint;
		}
		for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
			if (!this.roleTabs[i])continue;
			//每个角色的所有心法
			for (let k in  this.roleTabs[i]) {
				if (this.roleTabs[i][k]) {
					this.redPoint = true;
					return this.redPoint;
				}
			}
		}
		this.redPoint = false;
		return old != this.redPoint;
	}

	public postHeartRoleRedPoint() {
		if (!HeartMethod.ins().checkOpen()) {
			return;
		}
		for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
			if (!this.roleTabs[i]) {
				this.roleTabs[i] = {};
			}
			let hmMap: Map<HearMethodData> = HeartMethod.ins().HeartMethodInfo[i];
			if (!hmMap)//未激活某个角色所有心法
				hmMap = {};
			for (let k in GlobalConfig.HeartMethodConfig) {
				let hmdata: HearMethodData = hmMap[k];//id==0就是没激活心法 但有可能可激活的时候
				if (!hmdata) {
					if (HeartMethod.ins().heartOpenCondition(GlobalConfig.HeartMethodConfig[k].id)) {
						this.roleTabs[i][GlobalConfig.HeartMethodConfig[k].id] = true;
					} else {
						this.roleTabs[i][GlobalConfig.HeartMethodConfig[k].id] = false;
					}
					continue;
				}
				if (!this.roleTabs[i][hmdata.id])
					this.roleTabs[i][hmdata.id] = false;
				//开始检查某个角色某个心法是否有红点
				if (!hmdata.id) {
					/**未激活状态*/
					this.roleTabs[i][hmdata.id] = true;
				} else {
					this.roleTabs[i][hmdata.id] = false;
					//心法是否达到额外开启条件
					if (!HeartMethod.ins().heartOpenCondition(hmdata.id))
						continue;
					/**激活状态*/
						//条件1:心法可升级时 背包材料满足当前阶的提示数量
					let cost: { itemid: number, count: number } = HeartMethod.ins().calcHeartCost(i, hmdata.id);
					if (cost) {
						let idata: ItemData = UserBag.ins().getBagItemById(cost.itemid);
						let mycount = idata ? idata.count : 0;
						this.roleTabs[i][hmdata.id] = mycount >= GlobalConfig.HeartMethodStageConfig[hmdata.id][hmdata.stage].normalCostTip;
						if (this.roleTabs[i][hmdata.id]) {
							//心法是否达到额外（修炼/进阶）条件
							if (HeartMethod.ins().heartUpCondition(i, hmdata.id))
								continue;
							else
								this.roleTabs[i][hmdata.id] = false;
						}
					}
					//条件2:心法可进阶
					if (hmdata.isUp && !HeartMethod.ins().isHeartMax(i, hmdata.id)) {
						this.roleTabs[i][hmdata.id] = true;
						continue;
					}
					//条件3:心法里边有可穿戴的心法部位 or 有可替换的心法部位 or 身穿的心法可升星
					let hmdconfig: HeartMethodConfig = GlobalConfig.HeartMethodConfig[hmdata.id];
					LIST:
						for (let pos = 0; pos < hmdconfig.posList.length; pos++) {
							// let pId:number = hmdconfig.posList[i];
							//检查身上是否有同部位 没有则直接穿戴
							let slotId: number = HeartMethod.ins().getHeartSlotItemId(i, hmdata.id, pos + 1);
							if (slotId) {
								//身上该部位是否可以升星
								if (HeartMethod.ins().calcHeartSlotCost(slotId)) {
									this.roleTabs[i][hmdata.id] = true;
								} else {//身上该部位是否可以替换
									//部位有穿东西 刷新显示该部位索引处所穿戴控件数据 身上不可能没有这个数据!
									for (let j = 0; j < hmdata.slots.length; j++) {//找到该部位数据
										let hid: number = hmdata.slots[j];
										let sId: number = HeartMethod.ins().calcHeartSlotChange(i, hmdata.id, hid);
										this.roleTabs[i][hmdata.id] = sId ? true : false;
										if (sId)
											break LIST;
									}
								}
							} else {
								//检查背包是否有同心法同部位的可穿
								let configId = HeartMethod.ins().getHeartSlotItemIdWear(i, hmdata.id, pos + 1);
								this.roleTabs[i][hmdata.id] = configId ? true : false;
								if (configId)
									break;
							}
						}
					if (this.roleTabs[i][hmdata.id])
						continue;


					// for( let pos = 0;pos < hmdata.slots.length;pos++ ){
					//     let itemid:number = hmdata.slots[pos];
					// }
				}
			}
		}
	}

	/**检查某个心法的红点情况*/
	public checkHeartRedPoint(roleId: number, heartId: number): boolean {
		if (!this.roleTabs[roleId]) {
			this.roleTabs[roleId] = {};
		}
		return this.roleTabs[roleId][heartId] ? true : false;
	}


}

namespace GameSystem {
	export let heartmethodredpoint = HeartMethodRedPoint.ins.bind(HeartMethodRedPoint);
}