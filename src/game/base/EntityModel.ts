/**
 *
 * @author
 *
 */
class EntityModel extends NpcModel {

	public masterHandle: number;
	public handle: number;
	public configID: number;
	public type: EntityType;
	public x: number;
	public y: number;
	/** 战斗力 */
	public power: number;

	/**区服ID */
	protected _servId: number;
	protected _name: string;
	protected _lv: number;
	public _avatar: number;
	public _scale: number;
	public _dirNum: number;
	public wanderrange: number;
	public wandertime: number;

	public effect: number;//脚底光环 id

	public isElite: boolean = false;

	/**
	 * 属性集
	 */
	public attributeData: number[] = [];
	public attributeExData: number[] = [];

	public team: Team;
	public killNum: number = 0;

	public isMy: boolean = false;
	public weaponsId: number = 0;//当前剑灵id
	//是否主动怪
	public isWander: boolean = false;

	/** 烈焰印记等级 */
	public lyMarkLv: number = 0;

	/** 烈焰印记技能 */
	public lyMarkSkills: number[] = [];

	constructor() {
		super();
		this.type = EntityType.Monster;
	}

	public parser(bytes: GameByteArray): void {
		this.parserBase(bytes);
		//采集怪不读下面的属性
		if (this.type != EntityType.CollectionMonst) {
			this.parserAtt(bytes);
			this.parserLyMark(bytes);
		}
	}

	/** 烈焰印记数据 */
	private parserLyMark(bytes: GameByteArray): void {
		this.lyMarkLv = bytes.readShort();
		this.lyMarkSkills = [];
		let len: number = bytes.readByte();
		this.lyMarkSkills.length = len;

		for (let i: number = 0; i < len; i++)
			this.lyMarkSkills[i] = bytes.readShort();
	}
	public parserBase(bytes: GameByteArray): void {
		this.type = bytes.readShort();
		this.handle = bytes.readDouble();
		this.configID = bytes.readInt();
		this.masterHandle = bytes.readDouble();
		this.x = bytes.readInt();
		this.y = bytes.readInt();
		this.isMy = this.checkHandleIsMy(this.masterHandle);
	}

	public checkHandleIsMy(handle) {
		if (handle == Actor.handle) {
			return true;
		}
		let roles = SubRoles.ins().roles;
		for (let role of roles) {
			if (role.handle == handle) {
				return true;
			}
		}
		return false;
	}

	public parserAtt(bytes: GameByteArray, showTip: boolean = false): void {
		let count: number = bytes.readShort();
		if (showTip) {
			let userTips = UserTips.ins();
			for (let i = 0; i < count; i++) {
				let oldValue: number = this.attributeData[i];
				this.attributeData[i] = bytes.readDouble();
				let changeValue: number = this.attributeData[i] - oldValue;
				if (oldValue != this.attributeData[i] && AttributeData.FILTER_BASE_DATA_ID.lastIndexOf(i) == -1) {
					if (changeValue <= 0) continue;
					if (i < 2 || i > 6) {
						let color: string = changeValue > 0 ? "35e62d" : "f3311e";
						let td: AttributeData = new AttributeData(i, changeValue);
						let str1: string = `|C:0x${color}&T:${AttributeData.getAttStrByType(td, 0)}|`;
						if (!GodWeaponCC.ins().gwshowTips)
							userTips.showTips(str1);
						continue;
					}
					userTips.showAttrTips(i, changeValue);
				}
			}
		} else {
			for (let i = 0; i < count; i++) {
				this.attributeData[i] = bytes.readDouble();
			}
		}

	}


	public parserExtAtt(bytes: GameByteArray, showTip: boolean = false): void {
		let count: number = bytes.readShort();
		if (showTip) {
			for (let i = 0; i < count; i++) {
				let oldValue: number = this.attributeExData[i];
				this.attributeExData[i] = bytes.readInt();
				if (oldValue != this.attributeExData[i] && AttributeData.FILTER_EXTDATA_ID.lastIndexOf(i) == -1) {
					let changeValue: number = this.attributeExData[i] - oldValue;
					if (changeValue <= 0) continue;
					let color: string = changeValue > 0 ? "35e62d" : "f3311e";
					let str: string = changeValue > 0 ? "+" : "";
					let td: AttributeData = new AttributeData(i, changeValue);
					let str1: string = `|C:0x${color}&T:${AttributeData.getExtAttStrByType(td, 0)}|`;
					UserTips.ins().showTips(str1);
				}
			}
		} else {
			for (let i = 0; i < count; i++) {
				this.attributeData[i] = bytes.readInt();
			}
		}
	}

	public parserHeirloom() {

	}

	public getAtt(attType: AttributeType): number {
		return this.attributeData[attType] || 0;
	}

	public setAtt(attType: AttributeType, value: number): void {
		this.attributeData[attType] = value;
	}

	public getExAtt(attType: ExAttributeType): number {
		return this.attributeExData[attType] || 0;
	}

	public get avatarFileName(): string {
		return `monster` + this.avatar;
	}

	get weaponFileName(): string {
		return '';
	}

	public get avatar() {
		let len: number = GlobalConfig.ScenesConfig.length;
		//console.log("not found config id: %d", len);		
		
		return this._avatar || GlobalConfig.MonstersConfig[this.configID].avatar;		
	}

	public get name(): string {
		return this._name || GlobalConfig.MonstersConfig[this.configID].name;
	}

	/**获取带服务器ID的名字(不换行，策划需求，跨服场景中，名字默认加服务器ID)*/
	public getNameWithServer(): string {
		return this._servId && KFServerSys.ins().isKF ? this.name + `S${this._servId}` : this.name;
	}

	public getDir(): number {
		let config = GlobalConfig.MonstersConfig[this.configID];
		if (!config) return -1;
		let dir = GlobalConfig.MonstersConfig[this.configID].dir;
		if (isNaN(dir))
			return -1;
		return dir;
	}

	public get dirNum(): number {
		let config = GlobalConfig.MonstersConfig[this.configID];
		if (config) {
			this._dirNum = NaN;
			if (config.dirNum) {
				return config.dirNum;
			}
		}
		if (this._dirNum) {
			return this._dirNum;
		}
		return 2;
	}

	public get avatarScale(): number {
		let s = this._scale || GlobalConfig.MonstersConfig[this.configID].scale;
		if (s) return s / 100;
		return 1;
	}


	public get avatarEffect(): string {
		if (GlobalConfig.MonstersConfig[this.configID] &&
			GlobalConfig.MonstersConfig[this.configID].effect) {
			return GlobalConfig.EffectConfig[GlobalConfig.MonstersConfig[this.configID].effect].fileName;
		}
		return "";
	}

	public get attRange(): number {
		if (GlobalConfig.MonstersConfig[this.configID].attrange) {
			return GlobalConfig.MonstersConfig[this.configID].attrange;
		}
		return 0;
	}

	public get movePara(): any {
		if (GlobalConfig.YouDangConfig[this.wandertime] && this.wanderrange) {
			return [this.wanderrange, GlobalConfig.YouDangConfig[this.wandertime].fileName];
		}
		return null;
	}

	public set name(str: string) {
		this._name = str;
	}

	public get lv(): number {
		return GlobalConfig.MonstersConfig[this.configID].level;
	}

	public set lv(value: number) {
		this._lv = value;
	}

	public setPos(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

}
