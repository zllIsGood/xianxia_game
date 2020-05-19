/**
 * ItemConfig
 */
class ItemConfig {

	/* 物品id(10开头的是装备) */
	public id: number;

	descIndex: number;
	/**
	 * 图标
	 */
	public icon: number;
	/**
	 * 限制等级
	 */
	public level: number;
	/**
	 * 限制转生等级
	 */
	public zsLevel: number;
	/**
	 * 物品名称
	 */
	public name: string;
	/**
	 * 物品描述
	 */
	public desc: string;
	/**
	 * 物品使用类型
	 */
	public useType: number;

	public useCond: number;

	public needyuanbao: number;
	/**
	 * 寻宝仓库类型 0装备 1符文 2诛仙 DepotType.Equip, DepotType.Rune, DepotType.Heirloom
	 * @type {number}
	 */
	public bagType: number = 0;

	/**
	 * 1：物品不合并
	 */
	public split: number;


	/** 计算普通装备的评分 */
	static calculateBagItemScore(item: ItemData): number {
		let transfrom = [
			'',
			'',
			'hp',  //2
			'',
			'atk',  //4
			'def',  //5
			'res',  //6
		];
		let equipConfig: EquipConfig = GlobalConfig.EquipConfig[item.itemConfig.id];
		let powerConfig: AttrPowerConfig[] = GlobalConfig.AttrPowerConfig;
		let allPower = 0;

		let attr: AttributeData[] = item.att;
		let value: number = 0;
		if (attr) {
			for (let k in powerConfig) {
				value = 0;
				if (equipConfig[k] <= 0)
					continue;
				for (let index = 0; index < attr.length; index++) {
					if (attr[index].type == AttributeData.translate[transfrom[k]]) {
						value = equipConfig[transfrom[powerConfig[k].type]] + attr[index].value;
						break;
					}
				}
				allPower += (value == undefined ? 0 : value) * powerConfig[k].power;
			}
		} else {
			for (let j in equipConfig) {
				if (transfrom.lastIndexOf(j) == -1) continue;
				value = equipConfig[j];
				if (value == undefined || value == 0) continue;
				let type = Role.getAttrTypeByName(j);
				allPower += (value == undefined ? 0 : value) * powerConfig[type].power;
			}
		}

		let expower: number = 0;
		if (equipConfig.baseAttr) {
			expower += UserBag.getAttrPower([equipConfig.baseAttr]);
		}
		if (equipConfig.exPower) {
			expower += equipConfig.exPower;
		}

		return Math.floor(allPower / 100) + Math.floor(expower);
	}

	static itemPoints: { [key: number]: number } = {};
	/** 计算神装&传奇装的评分 */
	static pointCalNumber(item: ItemConfig): number {

		let itemId = item.id;
		if (ItemConfig.itemPoints[itemId] != undefined) {
			return ItemConfig.itemPoints[itemId];
		}

		let transfrom = [
			'',
			'',
			'hp',  //2
			'',
			'atk',  //4
			'def',  //5
			'res',  //6
		];

		let equipConfig: EquipConfig = GlobalConfig.EquipConfig[itemId];
		let powerConfig: AttrPowerConfig[] = GlobalConfig.AttrPowerConfig;
		let allPower = 0;
		for (let k in powerConfig) {
			let conf = powerConfig[k];
			let value = equipConfig[transfrom[conf.type]];
			if (value) {
				allPower += (value + Math.floor(value * ItemBase.additionRange / 100)) * conf.power;
			}
			// let additionRange = equipConfig.additionRange?equipConfig.additionRange:15;
		}
		ItemConfig.itemPoints[itemId] = Math.floor(allPower / 100);
		return ItemConfig.itemPoints[itemId];
	}

	static getBaseAttrData(item: ItemConfig) {
		let equipConfig: EquipConfig = GlobalConfig.EquipConfig[item.id];

		let transfrom = {
			'hp': 2,
			'atk': 4,
			'def': 5,
			'res': 6
		}
		let otherBaseType: number[] = [AttributeType.atHolyDamege];

		let baseAttr: AttributeData[] = [];


		for (let i in transfrom) {
			if (equipConfig[i]) {
				baseAttr.push(new AttributeData(transfrom[i], equipConfig[i]));
			}
		}
		if (equipConfig.baseAttr) {
			if (otherBaseType.indexOf(equipConfig.baseAttr.type) >= 0)
				baseAttr.push(new AttributeData(equipConfig.baseAttr.type, equipConfig.baseAttr.value));
		}
		if (equipConfig.baseAttr1) {
			if (otherBaseType.indexOf(equipConfig.baseAttr1.type) >= 0)
				baseAttr.push(new AttributeData(equipConfig.baseAttr1.type, equipConfig.baseAttr1.value));
		}
		return baseAttr;
	}

	public get quality(): number {
		return ItemConfig.getQuality(this);
	}

	static getQuality(config: ItemConfig): number {
		if (!config)
			return 0;
		if (GlobalConfig.ItemDescConfig[config.descIndex])
			return GlobalConfig.ItemDescConfig[config.descIndex].quality;
		return 0;
	}

	static getQualityBg(quality: number): string {
		return `common1_Quality_00${quality}`;
	}

	static getQualityColor(config: ItemConfig): number {
		return ItemBase.QUALITY_COLOR[this.getQuality(config)];
	}

	static getType(config: ItemConfig): number {
		if (!config)
			return 0;
		if (GlobalConfig.ItemDescConfig[config.descIndex])
			return GlobalConfig.ItemDescConfig[config.descIndex].type;
		return 0;
	}

	static getSubType(config: ItemConfig): number {
		if (!config)
			return 0;
		if (GlobalConfig.ItemDescConfig[config.descIndex])
			return GlobalConfig.ItemDescConfig[config.descIndex].subType;
		return 0;
	}

	static getJob(config: ItemConfig): number {
		if (!config)
			return 0;
		if (GlobalConfig.ItemDescConfig[config.descIndex])
			return GlobalConfig.ItemDescConfig[config.descIndex].job;
		return 0;
	}

	//关联属性战力计算公式
	static relatePower(attr: AttributeData, role: EntityModel) {
		let totalPower = 0;
		let powerConfig: AttrPowerConfig[] = GlobalConfig.AttrPowerConfig;
		let config = powerConfig[attr.type];
		if (config && config.relate_type) {
			let value = role.getAtt(config.relate_type);
			let ex_type = AttributeData.exRelate[config.relate_type];
			if (ex_type) {
				let ex_value = role.getAtt(ex_type);
				if (ex_value) {
					value = Math.floor(value / (1 + ex_value / 10000));
				}
			}
			// let config2 = powerConfig[config.relate_type];
			totalPower += Math.floor(attr.value * value * config.relate_power / 100);
		}
		return totalPower;
	}

	/**是否为装备 */
	static isEquip(config: ItemConfig): boolean {
		let type = this.getType(config);
		switch (type) {
			case ItemType.TYPE_0:
			case ItemType.TYPE_4:
			case ItemType.TYPE_11:
				return true;
		}
		return false;
	}
}