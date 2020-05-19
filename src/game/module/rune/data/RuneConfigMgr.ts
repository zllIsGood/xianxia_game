/**
 * 符文配表管理者
 */
class RuneConfigMgr extends BaseClass {
	public constructor() {
		super();
	}

	/** 重载单例*/
	public static ins(): RuneConfigMgr {
		return super.ins() as RuneConfigMgr
	}

	/**
	 * 获取符文基础配置
	 * @param  {number} item
	 * @param  {number} next
	 * @returns RuneBaseConfig
	 */
	public getBaseCfg(item: ItemData, next: boolean = false): RuneBaseConfig {
		let runeBaseConfigs: RuneBaseConfig[] = GlobalConfig.RuneBaseConfig;
		if (Assert(runeBaseConfigs, "RuneBaseConfigs is null")) return null;
		let id: number = next ? item.configID + 1 : item.configID;
		return runeBaseConfigs[id];
	}

	/**
	 * 获取符文基础配置
	 * @param  {number} item
	 * @returns RuneBaseConfig
	 */
	public getBaseCfgByItemConfig(item: ItemConfig): RuneBaseConfig {
		let runeBaseConfigs: RuneBaseConfig[] = GlobalConfig.RuneBaseConfig;
		if (Assert(runeBaseConfigs, "RuneBaseConfigs is null")) return null;
		return runeBaseConfigs[item.id];
	}

	/**
	 * 获取符文兑换碎片(金色符文)
	 * @param {number} item
	 * @return RuneConverConfig
	 */
	public getConverCfgByItemConfig(item: ItemData): RuneConverConfig {
		let runeConverConfigs: RuneConverConfig[] = GlobalConfig.RuneConverConfig;
		if (Assert(runeConverConfigs, "RuneConverConfigs is null")) return null;
		return runeConverConfigs[item.configID];
	}

	/**
	 * 获取符文位置解锁配置
	 * @param  {number} pos
	 * @returns RuneLockPosConfig
	 */
	public getLockCfg(pos: number): RuneLockPosConfig {
		let runeLockPosConfigs: RuneLockPosConfig[] = GlobalConfig.RuneLockPosConfig;
		if (Assert(runeLockPosConfigs, "RuneLockPosConfigs is null")) return null;
		return runeLockPosConfigs[pos];
	}

	/**
	 * 获取符文名字配置
	 * @param  {number} type
	 * @returns RuneNameConfig
	 */
	public getNameCfg(type: number): RuneNameConfig {
		let runeNameConfigs: RuneNameConfig[] = GlobalConfig.RuneNameConfig;
		if (Assert(runeNameConfigs, "RuneNameConfigs is null")) return null;
		return runeNameConfigs[type];
	}

	/**
	 * 获取符文其他配置
	 * @returns RuneOtherConfig
	 */
	public getOtherCfg(): RuneOtherConfig {
		let runeOtherConfig: RuneOtherConfig = GlobalConfig.RuneOtherConfig;
		if (Assert(runeOtherConfig, "RuneOtherConfig is null")) return null;
		return runeOtherConfig;
	}

	/**获取符文 属性的名字 */
	public getcfgAttrData(cfg: RuneBaseConfig,isName:boolean = true): string {
		if (!cfg)
			return "";
		let str: string = ``;
		str += this.getAttrNamesByList(cfg.attr, 0,isName);
		str += this.getAttrNamesByList(cfg.equipAttr, 1,isName);
		str += this.getAttrNamesByList(cfg.exAttr, 2,isName);
		str += this.getAttrNamesByList(cfg.specialAttr, 3,isName);
		return str;
	}
	/**获取符文属性名组 一行一个 */
	public getAttrNamesByList(attr: AttributeData[], type: number,isName:boolean):string{
		let str: string = "";
		if (!attr || attr.length <= 0)
			return "";
		switch (type) {
			//普通属性
			case 0:
				for (let index in attr) {
					if (attr[index]) {
						// if (attr[index].type == 6) {
						// 	str += `物防、魔防 \n`;
						// } else {
							if( isName )
								str += `${AttributeData.getAttrStrByType(attr[index].type)}\n`;
							else
								str += `+${attr[index].value}\n`;
						// }
					}
				}
				break;
			//加成装备基础属性
			case 1:
				for (let index in attr) {
					if (attr[index]) {
						if( isName )
							str += `${AttributeData.getEEquipAttrStrByType(attr[index].type)}\n`;
						else
							str += `+${attr[index].value}%\n`;
					}
				}
				break;
			//扩展属性
			case 2:
				for (let index in attr) {
					if (attr[index]) {
						if( isName )
							str += `${AttributeData.getExtAttrStrByType(attr[index].type)}\n`;
						else
							str += `+${attr[index].value}\n`;
					}
				}
				break;
			//金币经验加成
			case 3:
				for (let index in attr) {
					if (attr[index]) {
						//1 -- 金币   2 -- 经验
						if( isName )
							str += `${attr[index].type == 1 ? `金币` : `经验`}\n`;
						else
							str += `+${attr[index].value}%\n`;
					}
				}
				break;
		}
		return str;

	}


	//获取符文 属性的描述
	public getcfgAttrDesc(cfg: RuneBaseConfig, specialType: boolean = false): string {
		if (!cfg)
			return "";
		let str: string = ``;
		str += this.getAttrDescByList(cfg.attr, 0, specialType);
		str += this.getAttrDescByList(cfg.equipAttr, 1, specialType);
		str += this.getAttrDescByList(cfg.exAttr, 2, specialType);
		str += this.getAttrDescByList(cfg.specialAttr, 3, specialType);
		if (str.lastIndexOf('\n') == (str.length - 1)) {
			str = str.substring(0,str.length-1);//删掉最后的\n
		}
		return str;
	}

	public getAttrDescByList(attr: AttributeData[], type: number, specialType: boolean = false): string {
		let str: string = "";
		if (!attr || attr.length <= 0)
			return "";
		switch (type) {
			//普通属性
			case 0:
				for (let index in attr) {
					if (attr[index]) {
						if (specialType) {
							if (attr[index].type == 5) {

							} else if (attr[index].type == 6) {
								str += `物防、魔防 +${attr[index].value}\n`;
							} else {
								str += `${AttributeData.getAttrNameByAttrbute(attr[index], true, " + ")}\n`;
							}
						} else {
							str += `${AttributeData.getAttrNameByAttrbute(attr[index], true, " + ")}\n`;
						}
					}
				}
				break;
			//加成装备基础属性
			case 1:
				for (let index in attr) {
					if (attr[index]) {
						str += `${AttributeData.getEEquipAttrStrByType(attr[index].type)}  +${attr[index].value}%\n`;
					}
				}
				break;
			//扩展属性
			case 2:
				for (let index in attr) {
					if (attr[index]) {
						str += `${AttributeData.getExAttrNameByAttrbute(attr[index], true, " + ")}\n`;
					}
				}
				break;
			//金币经验加成
			case 3:
				for (let index in attr) {
					if (attr[index]) {
						//1 -- 金币   2 -- 经验
						str += `${attr[index].type == 1 ? `金币` : `经验`}  +${attr[index].value}%\n`;
					}
				}
				break;
		}
		return str;
	}


	public getAttrByList(attr: AttributeData[], type: number, specialType: boolean = false): string {
		let str: string = "";
		if (!attr || attr.length <= 0)
			return "";
		switch (type) {
			//普通属性
			case 0:
				for (let index in attr) {
					if (attr[index]) {
						str += `${AttributeData.getAttrNameByAttrbute(attr[index], true, "：", false, 0xF8B141)}\n`;
					}
				}
				break;
			//加成装备基础属性
			case 1:
				for (let index in attr) {
					if (attr[index]) {
						str += `${AttributeData.getEEquipAttrStrByType(attr[index].type)}：|C:${0xF8B141}&T:${attr[index].value}%\n`;
					}
				}
				break;
			//扩展属性
			case 2:
				for (let index in attr) {
					if (attr[index]) {
						str += `${AttributeData.getExAttrNameByAttrbute(attr[index], true, "：",0xF8B141)}\n`;
					}
				}
				break;
			//金币经验加成
			case 3:
				for (let index in attr) {
					if (attr[index]) {
						//1 -- 金币   2 -- 经验
						str += `${attr[index].type == 1 ? `金币` : `经验`}：|C:${0xF8B141}&T:${attr[index].value}%\n`;
					}
				}
				break;
		}
		return str;
	}

	private exchangeList: RuneConverConfig[] = [];

	public getExchangeDataList(): RuneConverConfig[] {
		if (this.exchangeList.length > 0)
			return this.exchangeList;
		let cfg: any = GlobalConfig.RuneConverConfig;
		for (let key in cfg) {
			this.exchangeList.push(cfg[key]);
		}
		this.exchangeList.sort(this.sortExchange);
		return this.exchangeList;
	}

	private sortExchange(a:RuneConverConfig,b:RuneConverConfig) {
		if (a.checkpoint < b.checkpoint) {
			return -1;
		} else if (a.checkpoint > b.checkpoint) {
			return 1;
		}
		return a.id - b.id;
	}
}