/**
 * 追血令数据
 */
class EncounterModel {

	/** 下次刷新时间 */
	static lastTime: number;
	static refreshTimes: number;
	static redName: number = 0;
	public index: number;

	public posIndex: number;

	public lv: number;
	public zsLv: number;

	public name: string;

	public subRole: Role[] = [];

	public type: number;

	public firstData: boolean;

	public hejiLvl:number = 0;

	/** 威望经验 */
	public weiWang:number = 0;

	public fireRing:OtherFireRingData;

	constructor(name?) {
		this.name = name;
	}

	public parser(bytes: GameByteArray): void {
		this.index = bytes.readInt();

		// this.posIndex = bytes.readShort();

		this.lv = bytes.readShort();
		this.zsLv = bytes.readShort();

		this.name = bytes.readString();

		this.subRole = [];
		let count: number = bytes.readShort();
		for (let i = 0; i < count; i++) {
			let role = this.subRole[i] = new Role();
			role.parser(bytes);
			role.name = this.name;
		}

		this.fireRing = this.fireRing || new OtherFireRingData();
		this.fireRing.parser(bytes);

		this.firstData = bytes.readByte() != 0;

		this.hejiLvl = bytes.readInt();
		this.weiWang = bytes.readInt();
	}

	/**
	 * 通过marsterHandle 筛选子角色 移动到指定位置
	 */
	public static moveEncounterByMasterHandle(handle: any, posX: number, posY: number): void {
		let list: any = EntityManager.ins().getMasterList(handle);
		for (let k in list) {
			let entity: CharMonster = list[k] as CharMonster;
			if (entity.parent && entity.infoModel) {
				GameMap.moveEntity(entity, posX, posY);
				entity.AI_STATE = AI_State.Run;
			}
		}
	}

	/**
	 * 计算 marsterHandle 对应假人 的杀怪数量
	 */
	public static countKillNumByMarster(handle: any): number {
		let num: number = 0;
		let list: any = EntityManager.ins().getMasterList(handle);
		for (let k in list) {
			let entity: CharMonster = list[k] as CharMonster;
			if (entity.parent && entity.infoModel) {
				num += entity.infoModel.killNum;
			}
		}
		return num;
	}

	/*
	 * 检查对应marsterHandle 是否还有对应的子角色
	 * */
	public static getLiveNumByMarster(handle: any): number {
		let list: any = EntityManager.ins().getMasterList(handle);
		for (let k in list) {
			let entity: CharMonster = list[k] as CharMonster;
			if (entity.parent && entity.infoModel) {
				return 1;
			}
		}
		return 0;
	}
}