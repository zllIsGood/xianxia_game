/**龙印护盾 */
class LongHun extends BaseSystem {
	/**龙印 */
	public static TYPE_LONG_HUN: number = 2;
	/**护盾 */
	public static TYPE_HU_DUN: number = 3;
	/**血玉 */
	public static TYPE_XUE_YU: number = 4;

	public constructor() {
		super();

		this.sysId = PackageID.LoongSoul;
		this.regNetMsg(1, this.postDateUpdate);
		this.regNetMsg(2, this.postStageUpgrade);
		this.regNetMsg(3, this.postStageActive);
	}

	public static ins(): LongHun {
		return super.ins() as LongHun;
	}

	public sendUpGrade(roleID: number, type: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(roleID);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}


	public postDateUpdate(bytes: GameByteArray): number {
		let roleIndex: number = bytes.readShort();
		let type: number = bytes.readShort();
		let model: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		let lv: number = bytes.readInt();
		let exp: number = bytes.readInt();
		let lvChange: number = 0;
		switch (type + 1) {
			case LongHun.TYPE_LONG_HUN:
				lvChange = model.loongSoulData.level == lv ? 0 : 1;
				model.loongSoulData.level = lv;
				model.loongSoulData.exp = exp;
				break;
			case LongHun.TYPE_HU_DUN:
				model.shieldData.level = lv;
				model.shieldData.exp = exp;
				break;
			case LongHun.TYPE_XUE_YU:
				model.xueyuData.level = lv;
				model.xueyuData.exp = exp;
				break;
		}
		return lvChange;
	}

	public sendStageUpgrade(roleID: number, type: number) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleID);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	public postStageUpgrade(bytes: GameByteArray): void {
		let roleIndex: number = bytes.readShort();
		let type: number = bytes.readShort();
		let stage: number = bytes.readInt();
		let model: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		switch (type + 1) {
			case LongHun.TYPE_LONG_HUN:
				model.loongSoulData.stage = stage;
				break;
			case LongHun.TYPE_HU_DUN:
				model.shieldData.stage = stage;
				break;
			case LongHun.TYPE_XUE_YU:
				model.xueyuData.stage = stage;
				break;
		}
	}


	public sendStageActive(roleID: number, type: number) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(roleID);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	public postStageActive(bytes: GameByteArray): void {
		let roleIndex: number = bytes.readShort();
		let type: number = bytes.readShort();
		let state: number = bytes.readByte();
		let model: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		switch (type + 1) {
			case LongHun.TYPE_LONG_HUN:
				model.loongSoulData.state = state;
				break;
			case LongHun.TYPE_HU_DUN:
				model.shieldData.state = state;
				break;
			case LongHun.TYPE_XUE_YU:
				model.xueyuData.state = state;
				break;
		}
		//激活特效界面(龙印只有一个 策划说有多个才在表添加描述字段)
		Activationtongyong.show(0, "龙印", `jlonghun_01_png`);
	}


	/**
	 * 能否显示红点（通过类型）<策划新规则>
	 * @param  {number} roleID
	 * @param  {number} type
	 * @returns boolean
	 */
	public canShowRedPointByType(roleID: number, type: number): boolean {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleID);
		if (!role) return false;

		let costExp: number = 0;
		let currExp: number = 0;
		let config: LoongSoulConfig | ShieldConfig  = null;
		let nextConfig: LoongSoulConfig | ShieldConfig  = null;
		let stageConfig: LoongSoulStageConfig | ShieldStageConfig | XueyuStageConfig = null;
		switch (type) {
			case LongHun.TYPE_LONG_HUN:
				if (role.loongSoulData.state == 0) {
					let level: number = GlobalConfig.LoongSoulBaseConfig.openlv;
					if (Actor.level < level) {
						return false;
					}
					return true;
				}
				config = GlobalConfig.LoongSoulConfig[role.loongSoulData.level];
				nextConfig = GlobalConfig.LoongSoulConfig[role.loongSoulData.level + 1];
				stageConfig = GlobalConfig.LoongSoulStageConfig[role.loongSoulData.stage];
				currExp = role.loongSoulData.exp;
				break;
			case LongHun.TYPE_HU_DUN:
				config = GlobalConfig.ShieldConfig[role.shieldData.level];
				nextConfig = GlobalConfig.ShieldConfig[role.shieldData.level + 1];
				stageConfig = GlobalConfig.ShieldStageConfig[role.shieldData.stage];
				currExp = role.shieldData.exp;
				break;
		}

		//无下级配置，已满级，无须红点提示
		if (!nextConfig) return false;

		// costExp = Math.ceil(Math.max(config.exp - currExp, 0) / stageConfig.normalBaseExp);

		if (this.assert(config && stageConfig, "config or stageConfig is null")) return false;
		let itemNum: number = UserBag.ins().getItemCountById(0, config.itemId);
		if (stageConfig.normalCostTip == undefined) {
			return false;
		}
		return itemNum >= stageConfig.normalCostTip;
		// return itemNum >= costExp;
	}

	/**
	 * 能否显示红点（在角色里）<策划新规则>
	 * @param  {number} roleID
	 * @returns boolean
	 */
	public canShowRedPointInRole(roleID: number): boolean {
		let arr: number[] = [LongHun.TYPE_LONG_HUN];
		for (let value of arr) {
			if (this.canShowRedPointByType(roleID, value)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 能否显示红点（在全部里）<策划新规则>
	 * @returns boolean
	 */
	public canShowRedPointInAll(): boolean {
		for (let i: number = 0; i < 3; i++) {
			if (this.canShowRedPointInRole(i)) {
				return true;
			}
		}
		//心法
		if( HeartMethodRedPoint.ins().redPoint )
			return true;
		//魂骨
		// if( HunguRedPoint.ins().redPoint )
		// 	return true;
		return false;
	}

	/**
	 * 能否提升（通过类型）
	 * @param  {number} roleID
	 * @param  {number} type
	 * @returns boolean
	 */
	public canUpgradeByType(roleID: number, type: number): boolean {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleID);
		if (role) {
			let config: LoongSoulConfig | ShieldConfig  = null;
			let stageConfig: LoongSoulStageConfig | ShieldStageConfig | XueyuStageConfig = null;
			switch (type) {
				case LongHun.TYPE_LONG_HUN:
					config = GlobalConfig.LoongSoulConfig[role.loongSoulData.level];
					stageConfig = GlobalConfig.LoongSoulStageConfig[role.loongSoulData.stage];
					break;
				case LongHun.TYPE_HU_DUN:
					config = GlobalConfig.ShieldConfig[role.shieldData.level];
					stageConfig = GlobalConfig.ShieldStageConfig[role.shieldData.stage];
					break;
			}
			let itemNum: number = UserBag.ins().getItemCountById(0, config.itemId);
			// return itemNum >= stageConfig.normalCost; 
			return itemNum > 0;
		}

		return false;
	}

	/**
	 * 能否提升（在全部里检测）
	 * @returns boolean
	 */
	public canUpgradeinAll(): boolean {
		let arr: number[] = [LongHun.TYPE_LONG_HUN, LongHun.TYPE_HU_DUN, LongHun.TYPE_XUE_YU];
		for (let i: number = 0; i < 3; i++) {
			for (let value of arr) {
				if (this.canUpgradeByType(i, value) == true) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * 是否可以提升龙印护盾
	 */
	public canGradeupLoongSoul(type: number): boolean[] {
		let boolList: boolean[] = [false, false, false];
		let roleLen: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < roleLen; i++) {
			boolList[i] = this.canShowRedPointInRole(i);
		}
		return boolList;
	}

	/**
	 * 断言
	 * @param  {any} value
	 * @param  {string} msg
	 * @returns boolean
	 */
	private assert(value: any, msg: string): boolean {
		return Assert(value, "[" + egret.getQualifiedClassName(this) + "] " + msg);
	}
}
namespace GameSystem {
	export let  longhun = LongHun.ins.bind(LongHun);
}