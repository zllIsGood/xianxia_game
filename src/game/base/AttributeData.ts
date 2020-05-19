/**
 *
 * @author
 *
 */
class AttributeData {
	public type: number;
	public value: number;
	public rate: number;

	public static FILTER_EXTDATA_ID = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 35, 37, 38, 39];

	public static FILTER_BASE_DATA_ID = [18, 20];

	public constructor(type: number = 0, value: number = 0) {
		this.type = type;
		this.value = value;
	}

	static readonly translate = {
		'hp': AttributeType.atMaxHp,
		'atk': AttributeType.atAttack,
		'def': AttributeType.atDef,
		'res': AttributeType.atRes,
		'crit': AttributeType.atCrit,
		'tough': AttributeType.atTough
	};

	//百分比关联基础属性
	static exRelate = {
		'2': AttributeType.atHpEx,
		'4': AttributeType.atAtkEx,
		'5': AttributeType.atDefEx,
		'6': AttributeType.atResEx
	}

	/**
	 * 两组属性数组的值相加（用于翅膀 经脉 强化等等）
	 * 两组属性数组的长度必须相等、对应位置的类型必须相同
	 * @param attr1
	 * @param attr2
	 */
	static AttrAddition(attr1: AttributeData[], attr2: AttributeData[]): AttributeData[] {
		// let attr: AttributeData[] = [];
		// for (let i: number = 0; i < attr1.length; i++) {
		// 	let attrData: AttributeData = new AttributeData();
		// 	attrData.type = attr1[i].type != 0 ? attr1[i].type : attr2[i].type;
		// 	attrData.value = attr1[i].value + (attr2[i] ? attr2[i].value : 0);
		// 	attr.push(attrData);
		// }
		// return attr;

		if (!attr1 || attr1.length <= 0)
			return attr2 ? attr2.concat() : null;

		if (!attr2 || attr2.length <= 0)
			return attr1 ? attr1.concat() : null;

		let attr: AttributeData[] = attr1.concat(attr2);
		//合并相同属性
		let newObj: AttributeData[] = [];
		let len = attr.length;
		let obj: Object = new Object();
		for (let i: number = 0; i < len; i++) {
			if (obj[attr[i].type] == undefined)
				obj[attr[i].type] = 0;

			obj[attr[i].type] += attr[i].value;
		}

		for (let key in obj)
			newObj.push(new AttributeData((+key), (+obj[key])));

		return newObj;
	}

	/**将list2的属性加到list1中 */
	public static addToList(totalAttrs: AttributeData[], addAttrs: AttributeData[], percent: number = 1) {
		for (let propertyInfo2 of addAttrs) {
			let propertyInfo1 = this.getPropertyInfoFromList(totalAttrs, propertyInfo2.type);
			if (!propertyInfo1) {
				propertyInfo1 = new AttributeData();
				propertyInfo1.type = propertyInfo2.type;
				propertyInfo1.value = 0;
				totalAttrs.push(propertyInfo1);
			}
			propertyInfo1.value += Math.floor(propertyInfo2.value * percent);
		}
	}

	/**获取list中指定类型的属性 */
	public static getPropertyInfoFromList(list: AttributeData[], type: number): AttributeData {
		for (let propertyInfo of list) {
			if (propertyInfo.type == type) {
				return propertyInfo;
			}
		}
		return null;
	}

	/**
	 * 将单个attr添加到attrs里面
	*/
	public static addAttrsByAttr(attrs: AttributeData[], attr: AttributeData, percent: number = 1) {
		let propertyInfo2 = attr
		let propertyInfo1 = this.getPropertyInfoFromList(attrs, propertyInfo2.type);
		if (!propertyInfo1) {
			propertyInfo1 = new AttributeData();
			propertyInfo1.type = propertyInfo2.type;
			propertyInfo1.value = 0;
			attrs.push(propertyInfo1);
		}
		propertyInfo1.value += Math.floor(propertyInfo2.value * percent);
	}

	/**
	 * 属性按比例加成
	 * @param attr1 当前属性
	 * @param attr2 万分比加成
	 * @returns {AttributeData[]}
	 * @constructor
	 */
	static AttrMultiply(attr1: AttributeData[], attr2: AttributeData[]): AttributeData[] {
		let attr: AttributeData[] = [];
		for (let i: number = 0; i < attr1.length; i++) {
			let attrData: AttributeData = new AttributeData();
			attrData.type = attr1[i].type != 0 ? attr1[i].type : attr2[i].type;
			attrData.value = attr1[i].value * (1 + attr2[i].value / 10000);
			attr.push(attrData);
		}
		return attr;
	}

	/**
	 * 属性列表转换（用于解析配置表后的属性列表obgject转换AttributeData[])
	 * @param attrObj
	 */
	static transformAttr(attrObj: Object): AttributeData[] {
		let attrList: AttributeData[] = [];
		for (let key in attrObj) {
			let attr: AttributeData = new AttributeData;
			attr.type = attrObj[key].type;
			attr.value = attrObj[key].value;
			attrList.push(attr);
		}

		for (let i: number = 0; i < attrList.length - 1; i++) {
			for (let j: number = 0; j < attrList.length - i - 1; j++) {
				if (attrList[j] < attrList[j + 1]) {
					let temp: AttributeData = attrList[j + 1];
					attrList[j + 1] = attrList[j];
					attrList[j] = temp;
				}
			}
		}
		return attrList;
	}


	/**
	 * 这个函数即将被getAttStr1 替换.
	 * 通过属性对象数组获取字符串
	 * @param att       属性对象(支持AttributeData[] | AttributeData | config )
	 * @param intervals  属性名与属性值间隔多宽(默认4格)
	 * @param newline   属性与属性上下间隔几行(默认1行)
	 * @param sign      符号 默认 +
	 * @param isInserte  是否插入空格 默认false
	 * @param isShowAttName    是否显示属性名字（例如false： +1000)
	 * @param info:HeirloomInfo 诛仙额外属性加成
	 */
	static getAttStr(att: any, intervals: number = 4, newline: number = 1, sign: string = "+", isInserte: boolean = false, isShowAttName: boolean = true, info?: HeirloomInfo, endSign?: string): string {
		let str: string = "";
		let space: number = 0;
		if (att instanceof AttributeData)
			return this.getAttStrByType(att, intervals, sign, isInserte, isShowAttName);
		else if (att instanceof Array) {
			let atts: AttributeData[] = att;
			let len: number = atts.length - 1;
			for (let i: number = 0; i < atts.length; i++) {
				if (atts[i].type == 0) continue;
				//特殊属性不显示
				if (atts[i].type == AttributeType.atHpEx ||
					atts[i].type == AttributeType.atAtkEx ||
					atts[i].type == AttributeType.atDamageReduction ||
					atts[i].type == AttributeType.atDefEx ||
					atts[i].type == AttributeType.atResEx) {
					space = -1;
					continue;
				}
				str += this.getAttStrByType(atts[i], intervals, sign, isInserte, isShowAttName);
				if (info && info.attr_add) {
					str += "+" + Math.floor(atts[i].value * (info.attr_add / 100));
				}
				if (endSign) str += endSign;
				if (i < len + space) {
					for (let j: number = 0; j < newline; j++)
						str += "\n";
				}
			}
		} else {
			let objAtts: AttributeData[] = [];
			for (let k in this.translate) {
				if (isNaN(att[k]))
					continue;

				let a: AttributeData = new AttributeData;
				a.type = parseInt(this.translate[k]);
				a.value = att[k] >> 0;
				objAtts.push(a);
			}

			return this.getAttStr(objAtts, intervals, newline, sign, isInserte);
		}
		if (space < 0) {
			let index: number = str.lastIndexOf("\n");
			str = str.substring(0, index);
		}
		return str;
	}

	/**
	 * 这个所有属性都会显示，不排除特殊属性
	 * 通过属性对象数组获取字符串
	 * @param att       属性对象(支持AttributeData[] | AttributeData | config )
	 * @param intervals  属性名与属性值间隔多宽(默认4格)
	 * @param newline   属性与属性上下间隔几行(默认1行)
	 * @param sign      符号 默认 +
	 * @param isInserte  是否插入空格 默认false
	 * @param isShowAttName    是否显示属性名字（例如false： +1000)
	 * @param info:HeirloomInfo 诛仙额外属性加成
	 */
	static getAttStr2(att: any, intervals: number = 4, newline: number = 1, sign: string = "+", isInserte: boolean = false, isShowAttName: boolean = true, info?: HeirloomInfo, endSign?: string): string {
		let str: string = "";
		let space: number = 0;
		if (att instanceof AttributeData)
			return this.getAttStrByType(att, intervals, sign, isInserte, isShowAttName);
		else if (att instanceof Array) {
			let atts: AttributeData[] = att;
			let len: number = atts.length - 1;
			for (let i: number = 0; i < atts.length; i++) {
				if (atts[i].type == 0) continue;
				str += this.getAttStrByType(atts[i], intervals, sign, isInserte, isShowAttName);
				if (info && info.attr_add) {
					str += "+" + Math.floor(atts[i].value * (info.attr_add / 100));
				}
				if (endSign) str += endSign;
				if (i < len + space) {
					for (let j: number = 0; j < newline; j++)
						str += "\n";
				}
			}
		} else {
			let objAtts: AttributeData[] = [];
			for (let k in this.translate) {
				if (isNaN(att[k]))
					continue;

				let a: AttributeData = new AttributeData;
				a.type = parseInt(this.translate[k]);
				a.value = att[k] >> 0;
				objAtts.push(a);
			}

			return this.getAttStr(objAtts, intervals, newline, sign, isInserte);
		}
		if (space < 0) {
			let index: number = str.lastIndexOf("\n");
			str = str.substring(0, index);
		}
		return str;
	}

	/**
	 * 通过属性对象数组获取字符串
	 * @param att       属性对象(支持AttributeData[] | AttributeData | config )
	 * @param format  属性名与属性值间隔多宽(默认4格)
	 */
	static getAttStr1(att: AttributeData[], format: AttributeFormat): string {
		let str: string = "";
		for (let i: number = 0; i < att.length; i++) {
			str += this.getAttStrByType1(att[i], format);
			if (i < att.length - 1) {
				str += StringUtils.repeatStr("\n", format.emptyLine + 1);
			}
		}
		return str;
	}


	/**
	 * 通过属性对象获取字符串（例如：攻击 +1000)
	 * @param att   属性对象
	 * @param format  间隔多宽(默认4格)
	 */
	private static getAttStrByType1(att: AttributeData, format: AttributeFormat): string {
		let typeName: string = AttributeData.getAttrStrByType(att.type);
		let type: number = att.type;
		let sign: string = format.sign;
		let valueStr: string = "";
		if (att.rate != undefined) {
			valueStr = ((att.rate / 100) >> 0) + "%";
		}
		else {
			if (type == AttributeType.atCrit)//暴击率
				valueStr = (att.value / 100) + "%";
			else if (type >= AttributeType.atHpEx)//百分比的
				if (type == AttributeType.atStunTime)//时间
					valueStr = (att.value / 1000) + "秒";
				else if (type == AttributeType.atAtkEx)
					valueStr = (att.value / 100) + "%";
				else if (type == AttributeType.atCritHurt)
					valueStr = (att.value >> 0) + "";
				else
					valueStr = ((att.value / 100) >> 0) + "%";
			else
				valueStr = att.value.toString();
		}
		let str: string = StringUtils.addColor(typeName + format.sign, format.wordColor);
		if (format.isShowAttName)
			str = StringUtils.complementByChar(str, format.intervals);
		let result: string = str + StringUtils.addColor(valueStr, format.attrColor);
		return result;
	}

	/**
	 * 这个函数即将被getAttStrByType1替换
	 * 通过属性对象获取字符串（例如：攻击 +1000)
	 * @param att   属性对象
	 * @param interval  间隔多宽(默认4格)
	 * @param sign  符号 默认 +
	 * @param isInserte  是否插入空格 默认false
	 * @param isShowAttName    是显示属性名字（例如false： +1000)
	 */
	public static getAttStrByType(att: AttributeData, interval: number = 4, sign: string = "+", isInserte: boolean = true, isShowAttName: boolean = true): string {
		let str: string = "";
		if (isShowAttName) {
			if (isInserte) {
				str = StringUtils.complementByChar(AttributeData.getAttrStrByType(att.type), interval * 8);
			} else {
				str = AttributeData.getAttrStrByType(att.type);
			}
		}

		switch (att.type) {
			case -1:
				str += '+' + att.value + "%";
				break;
			case AttributeType.atCrit:
				str += sign + (att.value / 100) + "%";
				break;
			case AttributeType.atZhuiMingPro:
				str += sign + (att.value / 100) + "%";
				break;
			case AttributeType.atStunTime:
				str += sign + (att.value / 1000) + "秒";
				break;
			case AttributeType.atJob1HpEx:
			case AttributeType.atJob2HpEx:
			case AttributeType.atJob3HpEx:
			// str += sign + (att.value / 100) + "%";
			// break;
			case AttributeType.atHp:
			case AttributeType.atMp:
			case AttributeType.atMaxHp:
			case AttributeType.atMaxMp:
			case AttributeType.atAttack:
			case AttributeType.atDef:
			case AttributeType.atRes:
			case AttributeType.atTough:
			case AttributeType.atMoveSpeed:
			case AttributeType.atAttackSpeed:
			case AttributeType.maxNeiGong:
			case AttributeType.atNeiGongRestore:
			case AttributeType.atJob1AtkEx:
			case AttributeType.atJob2AtkEx:
			case AttributeType.atJob3AtkEx:
			case AttributeType.atJob1DefEx:
			case AttributeType.atJob2DefEx:
			case AttributeType.atJob3DefEx:
			case AttributeType.atJob1ResEx:
			case AttributeType.atJob2ResEx:
			case AttributeType.atJob3ResEx:
			case AttributeType.atHuiXinDamage:
			case AttributeType.atDeadLyHurt:
			case AttributeType.atDeadLyHurtResist:
			case AttributeType.atCritHurtResist:
			case AttributeType.atCritHurt:
			case AttributeType.atHearthDamege:
			case AttributeType.atZhuiMingVal:
			case AttributeType.atPenetrDefense:
			case AttributeType.atHolyDamage:
			case AttributeType.atHolyReduce:
				str += sign + att.value;
				break;
			default:
				str += sign + ((att.value / 100).toFixed(1)) + "%";
		}

		if (att.type == AttributeType.atYuPeiDeterDam)
			str = `|C:0xFF0000&T:${str}|`;

		return str;
	}

	/**
	 * 通过属性对象获取扩展属性字符串
	 * @param att   属性对象
	 * @param interval  间隔多宽(默认4格)
	 * @param sign  符号 默认 +
	 * @param isInserte  是否插入空格 默认false
	 * @param isShowAttName    是显示属性名字（例如false： +1000)
	 */
	public static getExtAttStrByType(att: AttributeData, interval: number = 4, sign: string = "+", isInserte: boolean = false, isShowAttName: boolean = true): string {
		let str: string = "";
		if (isShowAttName) str = StringUtils.complementByChar(AttributeData.getExtAttrStrByType(att.type), interval * 8);
		if (att.type == ExAttributeType.eatGodBlessRate || att.type == ExAttributeType.eatGodBlessProbability || att.type == ExAttributeType.eatAttackAddHpProbability || att.type == ExAttributeType.eatDeathCurseProbability
			|| att.type == ExAttributeType.eatAddWarriorDamageInc || att.type == ExAttributeType.eatAddMageDamageInc || att.type == ExAttributeType.eatAddTaoistDamageInc
			|| att.type == ExAttributeType.eatAddToTaoistDamageInc || att.type == ExAttributeType.eatSubWarriorDamageInc || att.type == ExAttributeType.eatSubMageDamageInc
			|| att.type == ExAttributeType.eatSubTaoistDamageInc || att.type == ExAttributeType.eatTogetherHitFree || att.type == ExAttributeType.eatMiss
			|| att.type == ExAttributeType.eatTogetherHitMonDamageInc || att.type == ExAttributeType.eatTogetherHitRoleDamageInc
			|| att.type == ExAttributeType.eatAddToWarriorDamageInc || att.type == ExAttributeType.eatAddToMageDamageInc || att.type == ExAttributeType.eatAddToMageDamageInc
			|| att.type == ExAttributeType.eatDeathCurseDamageIncrease
		)
			str += sign + (att.value / 100) + "%";
		else if (att.type == ExAttributeType.eatDeathCurseTime) {
			str += sign + (att.value / 1000) + "秒";
		}
		else if (att.type == ExAttributeType.eatIgnoreReflect) {
			str += "";
		}
		else
			str += sign + att.value;
		return str;
	}

	/**
	 * 字符串插入空格
	 * @param str  要更改的字符串
	 * @param blankNum 插入空格数
	 * @param location 插入位置 0左边 1 中间  2 右边（默认中间）
	 */
	static inserteBlank(str: string, blankNum: number, location: number = 1): string {
		let strLen: number = str.length;
		let blank: string = "";
		while (blankNum--) {
			blank += " ";
		}
		let nStr: string = "";
		switch (location) {
			case 0:
				nStr = blank + str;
				break;
			case 1:
				nStr = str.slice(0, strLen / 2) + blank + str.slice(strLen / 2);
				break;
			case 2:
				nStr = str + blank;
				break;
		}
		return nStr;
	}

	/**
	 * 通过物品来获取装备属性
	 * @param data
	 */
	static getAttrInfoByItemData(data: ItemData): string {
		let config = GlobalConfig.EquipConfig[data.configID];
		let attrStr: string = "";
		let type: number = 0;
		for (let k in this.translate) {
			if (config[k] <= 0)
				continue;
			for (let i: number = 0; i < data.att.length; i++) {
				type = data.att[i].type;
				if (this.translate[k] == type) {
					attrStr += AttributeData.getAttrStrByType(type) + ": ";
					attrStr += config[k] + ' +' + data.att[i].value + "\n";
				}
			}
		}
		return attrStr;
	}

	/**
	 * 通过属性类型获取属性中文名字
	 * @param type
	 */
	static getAttrStrByType(type: number): string {
		let str: string = "";
		switch (type) {
			case AttributeType.atHp:
				str = `当前生命`;
				break;
			case AttributeType.atMp:
				str = `当前魔法`;
				break;
			case AttributeType.atMaxHp:
				str = `生命`;
				break;
			case AttributeType.atMaxMp:
				str = `魔法`;
				break;
			case AttributeType.atAttack:
				str = `攻击`;
				break;
			case AttributeType.atDef:
				str = `物防`;
				break;
			case AttributeType.atRes:
				str = `魔防`;
				break;
			case AttributeType.atCrit:
				str = `暴击`;
				break;
			case AttributeType.atTough:
				str = `抗暴`;
				break;
			case AttributeType.atMoveSpeed:
				str = `移速`;
				break;
			case AttributeType.atAttackSpeed:
				str = `攻速`;
				break;
			case AttributeType.atHpEx:
				str = `生命加成`;
				break;
			case AttributeType.atAtkEx:
				str = `攻击加成`;
				break;
			case AttributeType.atStunPower:
				str = `晕眩几率`;
				break;
			case AttributeType.atStunRes:
				str = `晕眩抵抗`;
				break;
			case AttributeType.atStunTime:
				str = `晕眩时间`;
				break;
			case AttributeType.atDamageReduction:
				str = `伤害减免`;
				break;
			case AttributeType.atCritHurt:
				str = `暴击伤害`;
				break;
			case AttributeType.atCritEnhance:
				str = `暴击伤害加强`;
				break;
			case AttributeType.atRoleDamageEnhance:
				str = `[全怒]对所有职业伤害增加`;
				break;
			case AttributeType.atRoleDamageReduction:
				str = `[全制]受到所有职业伤害减少`;
				break;
			case AttributeType.atDefEx:
				str = `物理防御百分比`
				break;
			case AttributeType.atResEx:
				str = `魔法防御百分比`
				break;
			case AttributeType.atJob1HpEx:
				str = `战士生命`;
				break;
			case AttributeType.atJob2HpEx:
				str = `法师生命`;
				break;
			case AttributeType.atJob3HpEx:
				str = `术士生命`;
				break;
			case AttributeType.atNeiGongRestore:
				str = `间隔3秒恢复内功值`;
				break;
			case AttributeType.cruNeiGong:
				str = `当前内功值`;
				break;
			//当前内功最大值
			case AttributeType.maxNeiGong:
				str = `内功值`;
				break;
			//内功吸收伤害百分比
			case AttributeType.neigongAbsorbHurt: //27
				str = `伤害吸收`;
				break;
			//战士物攻
			case AttributeType.atJob1AtkEx:
				str = `战士攻击`;
				break;
			//法师物攻
			case AttributeType.atJob2AtkEx:
				str = `法师攻击`;
				break;
			//术士物攻
			case AttributeType.atJob3AtkEx:
				str = `术士攻击`;
				break;
			//战士防御
			case AttributeType.atJob1DefEx:
				str = `战士防御`;
				break;
			//法师防御
			case AttributeType.atJob2DefEx:
				str = `法师防御`;
				break;
			//术士防御
			case AttributeType.atJob3DefEx:
				str = `术士防御`;
				break;
			//战士魔防
			case AttributeType.atJob1ResEx:
				str = `战士魔防`;
				break;
			//法师魔防
			case AttributeType.atJob2ResEx:
				str = `法师魔防`;
				break;
			//术士魔防
			case AttributeType.atJob3ResEx:
				str = `术士魔防`;
				break;
			//玉佩威慑
			case AttributeType.atYuPeiDeterDam:
				str = `威慑`;
				break;
			case AttributeType.atCritEnhanceResist:
				str = `暴击伤害减免`;
				break;
			case AttributeType.atHuiXinDamage:
				str = `暴击强度`;
				break;
			case AttributeType.atNeiGongEx:
				str = `内功加成`;
				break;
			case AttributeType.atDeadLyPro:
				str = `致命一击率`;
				break;
			case AttributeType.atDeadLyMaster:
				str = `致命一击伤害`;
				break;
			case AttributeType.atDeadLyResist:
				str = `致命一击韧性`;
				break;
			case AttributeType.atBladeMailPer:
				str = `反伤`;
				break;
			case AttributeType.atDefPen:
				str = `物防穿透`;
				break;
			case AttributeType.atResPen:
				str = `魔防穿透`;
				break;
			case AttributeType.atDeadLyHurt:
				str = `致命一击伤害`;
				break;
			case AttributeType.atDeadLyHurtResist:
				str = `致命一击减免`;
				break;
			case AttributeType.atCritHurtResist:
				str = `暴击伤害减免`;
				break;
			case AttributeType.atHearthDamege:
				str = `夺命追伤`;
				break;
			//无影伤害
			case AttributeType.atZhuiMingVal:
				str = `无影伤害`;
				break;
			case AttributeType.atPenetrDefense:
				str = `穿透抵抗`;
				break;
			case AttributeType.atHolyDamage:
				str = `神圣伤害`;
				break;
			case AttributeType.atHolyReduce:
				str = `神圣减免`;
				break;
			default: str = `基础属性`
		}
		return str;
	}

	/**
	 * 通过属性类型获取扩展属性中文名字
	 * @param type
	 */
	static getExtAttrStrByType(type: number): string {
		let str: string = ``;
		switch (type) {
			case ExAttributeType.eatReflectProbability:
				str = `反伤概率`;
				break;
			case ExAttributeType.eatReflectRate:
				str = `反伤比率`;
				break;
			case ExAttributeType.eatIgnoreReflect:
				str = `攻击无视反伤效果，增加自身2%攻击力`;
				break;
			case ExAttributeType.eatGodBlessProbability:
				str = `神佑触发 概率`;
				break;
			case ExAttributeType.eatGodBlessRate:
				str = `神佑复活万分比`;
				break;
			case ExAttributeType.eatDeathCurseProbability:
				str = `死咒触发概率`;
				break;
			case ExAttributeType.eatDeathCurseDamageIncrease:
				str = `死咒增加伤害`;
				break;
			case ExAttributeType.eatDeathCurseTime:
				str = `死咒效果展示时间`;
				break;
			case ExAttributeType.eatAllCrit:
				str = `暴击率`;
				break;
			case ExAttributeType.eatAllCritTime:
				str = `AllCrit暴击触发后，持续的时间, 单位:秒`;
				break;
			case ExAttributeType.eatBeHitTimesDodge:
				str = `受到X次攻击时必定闪避`;
				break;
			case ExAttributeType.eatAttackTimesCrit:
				str = `攻击X次必定产生暴击（暴击）`;
				break;
			case ExAttributeType.eatAttackAddHpProbability:
				str = `治疗戒指,攻击时候补血的概率`;
				break;
			case ExAttributeType.eatAttackAddHpValue:
				str = `治疗戒指,攻击的时候补血数`;
				break;

			case ExAttributeType.eatAddToWarriorDamageInc:
				str = `[怒战]对战士伤害增加`;
				break;
			case ExAttributeType.eatAddToMageDamageInc:
				str = `[怒法]对法师伤害增加`;
				break;
			case ExAttributeType.eatAddToTaoistDamageInc:
				str = `[怒术]对术士伤害增加`;
				break;
			case ExAttributeType.eatSubWarriorDamageInc:
				str = `[制战]受到战士伤害减少`;
				break;
			case ExAttributeType.eatSubMageDamageInc:
				str = `[制法]受到法师伤害减少`;
				break;
			case ExAttributeType.eatSubTaoistDamageInc:
				str = `[制术]受到术士伤害减少`;
				break;
			case ExAttributeType.eatTogetherHitFree:
				str = `必杀受到的伤害减少`;
				break;
			case ExAttributeType.eatTogetherHitMonDamageInc:
				str = `必杀技能对怪物伤害`;
				break;
			case ExAttributeType.eatTogetherHitRoleDamageInc:
				str = `必杀技能对玩家伤害`;
				break;
			case ExAttributeType.eatTogetherHitCdSub:
				str = `怒气恢复速度`;
				break;
			case ExAttributeType.eatAdditionalHarm:
				str = `伤害增加固定值`;
				break;
			case ExAttributeType.eatReductionHarm:
				str = `伤害减免固定值`;
				break;
			case ExAttributeType.eatMiss:
				str = `闪避`;
				break;
			case ExAttributeType.eatBaseSkillExArg:
				str = `基础及能额外系数加成`;
				break;
			case ExAttributeType.eatMultipleCrit:
				str = `多重暴击几率`;
				break;
			case ExAttributeType.eatMultipleCritCoeff:
				str = `幸运一击的伤害加深`;
				break;
			case ExAttributeType.atMultipleCritHurt:
				str = `幸运一击的固定伤害加深`;
				break;
			case ExAttributeType.eatAddWarriorDamageInc:
				str = `战士伤害`;
				break;
			case ExAttributeType.eatAddMageDamageInc:
				str = `法师伤害`;
				break;
			case ExAttributeType.eatAddTaoistDamageInc:
				str = `术士伤害`;
				break;
			case ExAttributeType.eatMultipleCritTime:
				str = `幸运一击的冷却时间`;
				break;
			case ExAttributeType.eatAttackAddHpTime:
				str = `治疗戒指,攻击的时候补血的冷却时间`;
				break;
			case ExAttributeType.eatHit:
				str = `命中`;
				break;
			default:
		}
		return str;
	}


	static getExAttrNameByAttrbute(att: AttributeData, showValue: boolean = false, sign: string = "：", valueColor: number = undefined): string {
		let str: string = AttributeData.getExtAttrStrByType(att.type);
		let value: string = "";
		if (showValue) {
			switch (att.type) {
				case ExAttributeType.eatAddWarriorDamageInc:
				case ExAttributeType.eatAddMageDamageInc:
				case ExAttributeType.eatAddTaoistDamageInc:
				case ExAttributeType.eatSubWarriorDamageInc:
				case ExAttributeType.eatSubMageDamageInc:
				case ExAttributeType.eatSubTaoistDamageInc:
				case ExAttributeType.eatTogetherHitFree:
				case ExAttributeType.eatTogetherHitMonDamageInc:
				case ExAttributeType.eatTogetherHitRoleDamageInc:
				case ExAttributeType.eatAllCrit:
				case ExAttributeType.eatHit:
				case ExAttributeType.eatMiss:
					value = att.value / 100 + "%";
					break;
				default:
					value += att.value;
			}
		}

		if (valueColor != undefined) {
			str = `${str}${sign}|C:${valueColor}&T:${value}|`;
		} else {
			str += sign + value;
		}
		return str;
	}

	/**
	 * 通过属性类型获取扩展属性中文名字
	 * @param type
	 */
	static getEEquipAttrStrByType(type: number): string {
		let str: string = ``;
		switch (type) {
			case EquipAddAttrType.EquipSlotType_Weapon:
				str = `武器基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Helmet:
				str = `头盔基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Coat:
				str = `衣服基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Necklace:
				str = `项链基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Accessory1:
				str = `手镯基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Accessory2:
				str = `腰带基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Ring1:
				str = `戒指基础属性`;
				break;
			case EquipAddAttrType.EquipSlotType_Ring2:
				str = `鞋子基础属性`;
				break;
		}
		return str;
	}


	static getAttrStrAdd(attrbute: AttributeData[], viplv: number): AttributeData[] {
		let attr: AttributeData[] = [];
		if (UserVip.ins().lv >= viplv) {
			let num: number = GlobalConfig.VipConfig[viplv].attrAddition["percent"];
			num = num ? num : 0;
			attrbute.forEach(element => {
				let attrdata: AttributeData = new AttributeData();
				attrdata.type = element.type;
				attrdata.value = (element.value * (100 + num) / 100) >> 0;
				attr.push(attrdata);
			});
		} else
			attr = attrbute;
		return attr;
	}

	static getAttrStarAdd(attrbute: AttributeData[], count: number): AttributeData[] {
		let attr: AttributeData[] = [];
		attrbute.forEach(element => {
			let attrdata: AttributeData = new AttributeData();
			attrdata.type = element.type;
			attrdata.value = (element.value * count) >> 0;
			attr.push(attrdata);
		});
		return attr;
	}

	static getAttrNameByAttrbute(att: AttributeData, showValue: boolean = false, sign: string = "：", isInserte: boolean = false, valueColor: number = undefined): string {
		let str: string = AttributeData.getAttrStrByType(att.type);
		if (isInserte) str = AttributeData.inserteBlank(str, 7);
		let value: string = "";
		if (showValue) {
			switch (att.type) {
				case AttributeType.atCrit:
				case AttributeType.atTough:
					value = att.value / 100 + "%";
					break;
				default:
					value = att.value + "";
			}
		}
		if (valueColor != undefined) {
			str = `${str}${sign}|C:${valueColor}&T:${value}|`;
		} else {
			str += sign + value;
		}
		return str;
	}
	/**给传入的属性数组加入百分比加成 返回新的属性数字*/
	public static getPercentAttr(arrAttr: AttributeData[], percent: number): AttributeData[] {
		let newarrAttr: AttributeData[] = [];
		for (let i = 0; i < arrAttr.length; i++) {
			let attrData: AttributeData = new AttributeData();
			attrData.type = arrAttr[i].type;
			if (arrAttr[i].value != undefined)
				attrData.value = (arrAttr[i].value * (1 + percent) >> 0);
			if (arrAttr[i].rate != undefined)
				attrData.rate = arrAttr[i].rate * (1 + percent);
			newarrAttr.push(attrData);
		}
		return newarrAttr;
	}
	/**
	 * 获取战斗力
	 */
	public static getPowerBy(arrAttr: AttributeData[]): number {
		if (!arrAttr)
			return 0;
		let power: number = 0;
		// for (let i = 0; i < arrAttr.length; i++) {
		// 	let attrData = arrAttr[i];
		// 	power += App.Config.AttrPowerConfig[attrData.type].power * attrData.value / 100;
		// }
		return power;
	}

	public static sortAttribute(a: AttributeData, b: AttributeData): number {
		return Algorithm.sortAsc(a.type, b.type);
	}

	public static copyAttrbute(attr: AttributeData): AttributeData {
		let att: AttributeData = new AttributeData();
		att.type = attr.type;
		att.value = attr.value;
		return att;
	}

	public static addAttrToList(list: any, ele: AttributeData) {
		if (!list[ele.type]) {
			let newAttr = new AttributeData;
			newAttr.type = ele.type;
			newAttr.value = 0;
			list[ele.type] = newAttr;
		}
		let listItem = list[ele.type] as AttributeData;
		listItem.value += ele.value;
	}

	/**
	 * 根据基础属性和万分比属性转换出比例属性
	 * @param  {AttributeData[]} attrs1
	 * @param  {AttributeRateData[]} attrs2
	 * @returns AttributeData
	 */
	public static rateTurnAttr(attrs1: AttributeData[], attrs2: AttributeData[]): AttributeData[] {
		let attrs: AttributeData[] = [];
		for (let key in attrs1) {
			let attr = attrs1[key];
			attrs.push(new AttributeData(attr.type, attr.value));
		}

		for (let key in attrs) {
			let attr = attrs[key];
			for (let key1 in attrs2) {
				let rateAttr = attrs2[key1];
				if (rateAttr.type == attr.type) {
					attr.value = Math.floor(attr.value * (rateAttr.rate / 10000));
				}
			}
		}
		return attrs;
	}

	/** 自定义属性计算 */
	public static getCustomAttrValue(attr: { type: number, value: number }[], type: number) {
		let customAttrValue = 0;
		for (let i = 0; i < attr.length; i++) {
			if (attr[i].type == type) {
				if (type == AttributeType.atHuiXinDamage) {
					customAttrValue = attr[i].value / 100;
				}
			}
		}
		return customAttrValue;
	}

	/**
	 * 两组属性数组的值相加（用于几乎所有属性等等）
	 * @param attr1
	 * @param attr2
	 */
	static AttrChangeAddition(attr1: AttributeData[], attr2: AttributeData[]): AttributeData[] {
		let attr: AttributeData[] = [];
		for (let i: number = 0; i < attr1.length; i++) {
			let isAdd: boolean = false;
			for (let j = 0; j < attr2.length; j++) {
				if (attr1[i].type == attr2[j].type) {
					let attrData: AttributeData = new AttributeData();
					attrData.type = attr1[i].type;
					attrData.value = attr1[i].value + attr2[j].value;
					attr.push(attrData);
					isAdd = true;
				}
			}
			if (!isAdd)
				attr.push(attr1[i]);
		}
		for (let i = 0; i < attr2.length; i++) {
			let isAdd: boolean = false;
			for (let j = 0; j < attr.length; j++) {
				if (attr2[i].type == attr[j].type) {
					isAdd = true;
				}
			}
			if (!isAdd)
				attr.push(attr2[i]);
		}
		return attr;
	}

	/**通过属性类型，自定义属性名
	 * @param attType     属性类型
	 * @param customStr  自定义字符（加在属性名后面）
	 * @parm sign 符号
	 * */
	static getCustomAttName(attType: number, customStr: string, sign: string = ``, intervals: number = 1): string {
		return StringUtils.complementByChar(AttributeData.getAttrStrByType(attType) + customStr + sign, intervals * 8);
	}

	/**
	 * 属性过虑（按filter组属性类型 重组）
	 * @param attr1 目标组
	 * @param filter 过虑组
	 */
	static getAttrFilter(attr1: AttributeData[], filter: AttributeData[]): AttributeData[] {
		let attr: AttributeData[] = [];
		for (let i: number = 0; i < attr1.length; i++) {
			let isAdd: boolean = false;
			for (let j = 0; j < filter.length; j++) {
				if (attr1[i].type == filter[j].type) {
					let attrData: AttributeData = new AttributeData();
					attrData.type = attr1[i].type;
					attrData.value = attr1[i].value;
					attr.push(attrData);
					isAdd = true;
				}
			}

		}
		return attr;
	}
}
