class GodWeaponData {
	//神兵id
	public weaponId: number;
	//当前经验
	public curExp: number;
	//当前等级
	public curLv: number;
	//剩余技能点数
	public skillPoint: number;
	//已点亮的技能个数
	public openCount: number;
	public openSkillAry:GwSkillData[];
	//已镶嵌的圣物个数
	public inlayCount: number;
	public config: GodWeaponLevelConfig;
	// public inlayAry:GwItem[];

	public constructor(bytes: GameByteArray) {
		this.parse(bytes);
		// this.inlayAry = [];
	}
	//解析
	public parse(bytes: GameByteArray): void {
		this.weaponId = bytes.readInt();
		this.curLv = bytes.readInt();
		this.curExp = bytes.readInt();
		this.skillPoint = bytes.readInt();
		this.openCount = bytes.readInt();

		//重置点数后清楚技能等级
		if (this.openCount <= 0 && this.openSkillAry && this.openSkillAry.length > 0)
		{
			let len:number = this.openSkillAry.length;
			for (let i:number = 0; i < len; i++)
				this.openSkillAry[i].skillLv = 0;
		}

		this.openSkillAry = [];
		
		let data: GwSkillData;
		let skillId: number;
		for (let i: number = 0; i < this.openCount; i++) {
			skillId = bytes.readInt();
			data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, skillId);
			data.addLv = 0;
			data.skillLv = bytes.readInt();
			this.openSkillAry.push(data);
		}

		//重置addlv等级
		for (let key in GodWeaponCC.ins().allSkillData2[this.weaponId]) {
			if (GodWeaponCC.ins().allSkillData2[this.weaponId][key].skillLv == 0) {
				GodWeaponCC.ins().allSkillData2[this.weaponId][key].addLv = 0;
			}
		}
		this.inlayCount = bytes.readInt();
		let item: GwItem;
		let pos: number;
		for (let i: number = 0; i < this.inlayCount; i++) {
			pos = bytes.readInt();
			item = GodWeaponCC.ins().getGodItemData(this.weaponId, pos);
			item.itemId = bytes.readInt();
			//处理圣物加多少等级
			for (let j: number = 0; j < item.config.skill.length; j++) {
				let dataTemp: GwSkillData = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, item.config.skill[j]);
				dataTemp.addLv += 1;
			}
		}
		this.config = GlobalConfig.GodWeaponLevelConfig[this.curLv];
	}
	//是否显示红点
	public get hasRedPoint(): boolean {
		if (this.skillPoint > 0) {
			return true;
		}
		return false;
	}
	//得到当前等级神兵的加成属性 {value:number,type:number}[]
	public get addAttr(): { value: number, type: number }[] {
		return this.config[`attr${this.weaponId}`] == null ? [] : this.config[`attr${this.weaponId}`];
	}

	/**
	 * 重置可以获得技能点数
	 * 
	*/
	public getResetPoint():number
	{
		let len:number = this.openSkillAry ? this.openSkillAry.length : 0;
		let count:number = 0;
		for (let i:number = 0; i < len; i++)
			count += this.openSkillAry[i].skillLv;

		return count;
	}

	/** 获得神兵名字 */
	public getWeaponName():string
	{
		switch(this.weaponId)
		{
			case 1:
				return  `雷霆怒斩`;
			case 2:
				return  `羲和神杖`;
			case 3:
				return  `伏魔之灵`;
		}

		return "";
	}
}

class GwSkillData {
	//神兵id
	public weaponId: number;
	//技能idx
	public skillId: number;
	//技能等级（不包括圣物的加成）
	private _skillLv: number = 0;
	public config: GodWeaponLineConfig;//神兵技能配置
	// public isOpen:boolean;//是否开启
	//圣物加的等级
	public addLv: number = 0;
	private _addStr: string;
	private _openTip: string;//开启前置条件提示文本
	public constructor(id?: number, lv?: number) {
		this.skillId = id;
		this.skillLv = lv;
	}
	public set skillLv(value: number) {
		this._skillLv = value;
	}
	public get skillLv(): number {
		return this._skillLv;
	}
	public lvLabel(b: boolean = false): string {
		let cur: number = this._skillLv + this.addLv;
		let max: number
		if (!this.isOpen) {
			max = this._skillLv != 0 ? this.config.upLevel + this.addLv : this.addLv;
		} else {
			max = this.config.upLevel + this.addLv;
		}
		if (b) {
			return `${cur}`;
		} else {
			return `${cur}/${max}`;
		}
	}
	//得到技能战力
	public get skillPower(): number {
		let power: number = this.config.exPower || 0;
		let cur: number = this._skillLv + this.addLv;
		return power * cur;
	}
	public addAttrValyeType(lvN: number): string {
		let str: string = "";
		if (this.config.attr) {
			for (let i: number = 0; i < this.config.attr.length; i++) {
				if (str.length > 0) {
					str += "\n";
				}
				str += AttributeData.getAttrStrByType(this.config.attr[i].type) + "提升" + `<font color="#35E62D">${this.config.attr[i].value * lvN}</font>`;
			}
		}
		return str;
	}
	public addExAttrstr(lvN: number): string {
		let str: string = "";
		if (this.config.exattr) {
			let des: string = "";
			let addDes: string = "";
			for (let i: number = 0; i < this.config.exattr.length; i++) {
				if (str.length > 0) {
					str += "\n";
				}
				des = GodWeaponCC.ins().exattrDesObj[this.config.exattr[i].type];
				switch (this.config.exattr[i].type) {
					case 43:
					case 48:
						addDes = `<font color="#35E62D">${this.config.exattr[i].value * lvN / 100}</font>`;
						break;
					case 44:
					case 45:
					case 46:
						addDes = `<font color="#35E62D">${(1 + this.config.exattr[i].value * lvN / 100)}</font>`;
						break;
					case 47:
						// let tempSkill:SkillData = new SkillData(100400 + this.config.exattr[i].value * lvN);
						let effectConfig: EffectsConfig = GlobalConfig.EffectsConfig[100400 + this.config.exattr[i].value * lvN];
						if (effectConfig && effectConfig.args) {
							addDes = `<font color="#35E62D">${effectConfig.args.a * 100}</font>`;
						}
						break;
				}
				des = des.replace("%s%", addDes);
				str += des;
			}
		}
		return str;
	}
	//得到等级对应的技能的描述文本
	public addatrStr(value: number): string {
		this._addStr = "";
		let lvN: number = value + this.addLv;
		// if(value > this.config.upLevel){
		// 	this._addStr = "已满级";
		// 	return 
		// }
		// let lvN:number = value + this.addLv == 0?1:(value + this.addLv);
		// if(this.config.attr){
		// 	for(let i:number = 0;i < this.config.attr.length;i ++){
		// 		if(this._addStr.length > 0){
		// 			this._addStr += "\n";
		// 		}
		// 		this._addStr += AttributeData.getAttrStrByType(this.config.attr[i].type) + "提升" + `<font color="#35E62D">${this.config.attr[i].value * lvN}</font>`;
		// 	}
		// }
		this._addStr += this.addAttrValyeType(lvN);
		this._addStr += this.addExAttrstr(lvN);
		let skillId: number;
		let data: SkillData;
		//得到技能des
		if (this.config.newskill) {
			skillId = this.config.newskill * 1000 + lvN;
			data = new SkillData(skillId);
			if (this._addStr.length > 0) {
				this._addStr += "\n";
			}
			this._addStr += this.getSkillDataDes(data);
		}
		//得到技能des
		if (this.config.passiveskill) {
			skillId = this.config.passiveskill * 1000 + lvN;
			data = new SkillData(skillId);
			if (this._addStr.length > 0) {
				this._addStr += "\n";
			}
			this._addStr += this.getSkillDataDes(data);
		}
		//得到技能des
		// if(this.config.skill){
		// 	let config:GWSkillReviseConfig;
		// 	// let lvN:number = this._skillLv + this.addLv == 0?1:(this._skillLv + this.addLv);
		// 	let index:number = this.skillId * 1000 + lvN;
		// 	for(let key in GlobalConfig.GWSkillReviseConfig){
		// 		config = GlobalConfig.GWSkillReviseConfig[key];
		// 		if(config.skill == this.config.skill && config.gwIndex == index){
		// 			this._addStr += config.desc;
		// 		}
		// 	}
		// }
		this._addStr += this.specialSkill(lvN);
		return this._addStr;
	}
	private getSkillDataDes(data: SkillData): string {
		let levelConfig = data.config || GlobalConfig.SkillsConfig[data.lv1ConfigID];
		if (Assert(levelConfig, `技能id:${data.configID}找不到配置`)) {
			return ``;
		}
		let config = GlobalConfig.SkillsDescConfig[levelConfig.desc];
		let str = config ? config.desc : ``;
		if (!str.length || !levelConfig.desc_ex) return str;
		let len = levelConfig.desc_ex.length;
		for (let i = 0; i < len; i++) {
			str = str.replace("%s%", `<font color="#35E62D">${levelConfig.desc_ex[i]}</font>`);
		}
		return str;
	}
	public specialSkill(value: number): string {
		let lvN: number = value + this.addLv;
		let str: string = "";
		if (this.config.skill) {
			let config: GWSkillReviseConfig;
			let index: number = this.skillId * 1000 + lvN;
			for (let key in GlobalConfig.GWSkillReviseConfig) {
				config = GlobalConfig.GWSkillReviseConfig[key];
				if (config.skill == this.config.skill && config.gwIndex == index) {
					str = config.desc;
					break;
				}
			}
		}
		return str;
	}
	// //得到原有属性des
	// private getGWSkillReviseconfig():string{
	// 	let config:GWSkillReviseConfig;
	// 	let lvN:number = this._skillLv + this.addLv == 0?1:(this._skillLv + this.addLv);
	// 	let index:number = this.skillId * 1000 + lvN;
	// 	for(let key in GlobalConfig.GWSkillReviseConfig){
	// 		config = GlobalConfig.GWSkillReviseConfig[key];
	// 		if(config.skill == this.config.skill && config.gwIndex == index){
	// 			return config.desc;
	// 		}
	// 	}
	// 	return "";
	// }
	//是否开启（关于前置条件）
	public get isOpen(): boolean {
		let b: boolean = true;
		if (this.config.condition) {
			for (let key in this.config.condition) {
				let data: GwSkillData
				if (parseInt(key) == 0) {
					data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, parseInt(key) + 1);
				} else {
					data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, parseInt(key));
				}
				if (data.skillLv < this.config.condition[key]) {
					b = false;
					break;
				}
			}
			return b;
		} else {
			return b;
		}
	}
	//开启提示
	public get openTip(): string {
		if (!this._openTip) {
			this._openTip = "";
			if (this.skillId == GodWeaponCC.ins().maxSkillIdAry[this.weaponId - 1]) {
				this._openTip = "所有技能满级后解锁";
			} else {
				for (let key in this.config.condition) {
					let data: GwSkillData
					if (parseInt(key) == 0) {
						data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, parseInt(key) + 1);
					} else {
						data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, parseInt(key));
					}
					if (this._openTip.length > 0) {
						this._openTip += "\n";
					}
					this._openTip += data.config.skillName + `达到${this.config.condition[key]}解锁`;
				}
			}
		}
		return this._openTip;
	}
}
//圣物
class GwItem {
	public weaponId: number;
	public pos: number;
	private _itemId: number;
	public config: GodweaponItemConfig;
	public itemConfig: ItemConfig;
	private _addStr: string;
	private _skillName: string;
	public isCur: boolean = false;
	private _skillPower:number;
	private _power:number//圣物评分
	public constructor() {
	}
	public set itemId(value: number) {
		this._itemId = value;
		this.config = GlobalConfig.GodweaponItemConfig[this.itemId];
		this.itemConfig = GlobalConfig.ItemConfig[this.itemId];
	}
	public get itemId(): number {
		return this._itemId;
	}
	//开启等级
	public get openLv(): number {
		return GlobalConfig.GodWeaponBaseConfig.openLevel[this.pos - 1];
	}
	//是否开启
	public get isOpen(): boolean {
		let weaponData = GodWeaponCC.ins().getWeaponData(this.weaponId);
		if (weaponData && weaponData.curLv < this.openLv) {
			return false;
		}
		return true;
	}
	//圣物附加的属性文本
	public get addatrStr(): string {
		if (this._addStr == null) {
			this._addStr = "";
			for (let i: number = 0; i < this.config.attr.length; i++) {
				if (this._addStr.length > 0) {
					this._addStr += "\n";
				}
				this._addStr += AttributeData.getAttrStrByType(this.config.attr[i].type) + " +" + this.config.attr[i].value;
			}
		}
		return this._addStr;
	}
	//添加的技能名字
	public get skillName(): string {
		if (this._skillName == null) {
			this._skillName = "";
			for (let i: number = 0; i < this.config.skill.length; i++) {
				if (this._skillName.length > 0) {
					this._skillName += "、";
				}
				this._skillName += GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, this.config.skill[i]).config.skillName;
			}
		}
		return this._skillName;
	}
	//圣物添加的技能战力
	private get skillPower():number{
		if(!this._skillPower){
			this._skillPower = 0;
			let data:GwSkillData;
			for (let i: number = 0; i < this.config.skill.length; i++) {
				data = GodWeaponCC.ins().getWeaponSkillidData(this.weaponId, this.config.skill[i]);
				if(data.config.exPower){
					this._skillPower += data.config.exPower;
				}
				if (data.config.attr) {
					let dataList:AttributeData[] = [];
					for (let j: number = 0; j < data.config.attr.length; j++) {
						dataList.push(new AttributeData(data.config.attr[j].type, data.config.attr[j].value));
					}
					this._skillPower += UserBag.getAttrPower(dataList);
				}
			}
		}
		return this._skillPower;
	}
	//圣物的战力（圣物添加的技能战力 + 属性相加的战力）
	public get power():number{
		if(!this._power){
			this._power = 0;
			this._power += this.skillPower;
			let data:AttributeData[] = [];
			for (let i: number = 0; i < this.config.attr.length; i++) {
				data.push(new AttributeData(this.config.attr[i].type, this.config.attr[i].value));
			}
			this._power += UserBag.getAttrPower(data);
		}
		return this._power;
	}
	// public get power():number{
	// 	let data:ItemData = new ItemData();
	// 	data.att = [];
	// 	data.itemConfig = this.itemConfig;
	// 	for (let i = 0; i < this.config.attr.length; i++) {
	// 		let att: AttributeData = new AttributeData(this.config.attr[i].type,this.config.attr[i].value);
	// 		data.att.push(att);
	// 	}
	// 	return ItemConfig.calculateBagItemScore(data);
	// }
}