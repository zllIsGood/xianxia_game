/**
 *
 * @author
 *
 */
class Actor extends BaseSystem {

	public static ins(): Actor {
		return super.ins() as Actor;
	}

	/**转生等级 */
	public static zhuanShengLv: number = 80;

	public static handle: number;
	/** 个人id */
	public static actorID: number;
	/** 名字 */
	// public static name: string;


	public clear(): void {
		this._level = 0;
		this._exp = 0;
		this._power = 0;
		this._gold = 0;
		this._yb = 0;
		this._soul = 0;
		this._feats = 0;
		this._togeatter1 = 0;
		this._togeatter2 = 0;
		this._weiWang = 0;
		this._myName = '';
	}
	/** 等级 */
	private _level: number;
	/** 经验 */
	private _exp: number;
	/** 战斗力 */
	private _power: number = 0;
	/** 金钱 */
	private _gold: number = 0;
	/** 元宝 */
	private _yb: number = 0;
	/** 魂值 */
	private _soul: number;
	/**功勋值 */
	private _feats: number = 0;
	/**符文精华 */
	public static runeShatter: number = 0;
	/**符文兑换的数值 */
	public static runeExchange: number = 0;
	/**必杀装备碎片 低级 高级 */
	private _togeatter1: number = -1;
	private _togeatter2: number = -1;

	/** 威望 */
	private _weiWang: number = 0;

	/** 名字 */
	public _myName: string;

	public constructor() {
		super();

		this.sysId = PackageID.Default;
		this.regNetMsg(1, this.postInit);
		this.regNetMsg(7, this.postExp);
	}

	/**
	 * 处理经验变化
	 * 0-7
	 * @param bytes
	 */
	postExp(bytes: GameByteArray): number {
		let lastLV = this._level;
		this._level = bytes.readInt();
		this._exp = bytes.readInt();
		let exp = bytes.readInt();

		if (lastLV < this._level) {

			this.postLevelChange();
			ReportData.getIns().roleUp();

			let char: CharRole = EntityManager.ins().getNoDieRole();
			if (!char) return;
			let mc: MovieClip = new MovieClip;
			mc.playFile(RES_DIR_EFF + "levelUpEffect", 1);
			char.addChild(mc);
		}

		return exp;
	}

	postInit(bytes: GameByteArray): void {
		Actor.handle = bytes.readDouble();
		Actor.actorID = bytes.readInt();
		GameServer.serverID = bytes.readInt();
		//一般使用readString接口读取
		//这里需要靠长度读取，有疑问看协议编辑器
		this.postNameChange(bytes.readUTFBytes(33));
		this._level = bytes.readInt();
		this._exp = bytes.readInt();
		bytes.readDouble(); //战斗力不准，不读不派发了;
		// this.postPowerChange(bytes.readDouble());

		this.postGoldChange(bytes.readNumber());
		this.postYbChange(bytes.readNumber());

		UserVip.ins().lv = bytes.readInt();
		this.postSoulChange(bytes.readNumber());
		UserBag.ins().bagNum = bytes.readInt();
		this.postFeatsChange(bytes.readNumber());
		Actor.runeShatter = bytes.readNumber();
		Actor.runeExchange = bytes.readNumber();

		this.postUpdateTogeatter(bytes.readNumber(), 1);
		this.postUpdateTogeatter(bytes.readNumber(), 2);
		this.postWeiWang(bytes.readInt());


		SubRoles.ins().resetRolesModel();
		SysSetting.ins().init();

		ReportData.getIns().enterGame();
	}

	public postNameChange(value: string) {
		if (this._myName != value) {
			this._myName = value;
		}
	}

	public postGoldChange(value: number) {
		if (this._gold != value) {
			if (this._gold > 0) {
				let addGold: number = value - this._gold;
				if (addGold > 0) {
					let str = `|C:0xffd93f&T:金币  +${addGold}|`;
					UserTips.ins().showTips(str);
				}
			}
			this._gold = value;
		}
	}

	public postYbChange(value: number) {
		if (this._yb != value) {
			if (this._yb > 0) {
				let addYB: number = value - this._yb;
				if (addYB > 0) {
					let str = `|C:0xffd93f&T:元宝  +${addYB}|`;
					UserTips.ins().showTips(str);
				}
			}
			this._yb = value;
		}
	}

	public postFeatsChange(value: number) {
		if (this._feats != value) {
			if (this._feats > 0) {
				let u64: number = value - this._feats;
				let addFeats: number = parseInt(u64.toString());
				if (addFeats > 0) {
					let str = `|C:0xffd93f&T:获得${addFeats}功勋|`;
					UserTips.ins().showTips(str);
				}
			}
			this._feats = value;
		}
	}

	public postZsExpChange(value: number) {
		let str = `|C:0x00ff00&T:修为+${value}|`;
		UserTips.ins().showTips(str);
	}

	public postUpdateTogeatter(value: number, type: number): { value: number, type: number } {
		let oldValue = 0;
		if (type == 1) {
			oldValue = this._togeatter1;
		} else {
			oldValue = this._togeatter2;
		}
		if (oldValue != value) {
			if (oldValue != -1) {
				let addValue = value - oldValue;
				if (addValue > 0) {
					let name = type == 1 ? RewardData.getCurrencyName(MoneyConst.punch1) : RewardData.getCurrencyName(MoneyConst.punch2);
					let str = `|C:0xffd93f&T:获得${addValue}${name}|`;
					UserTips.ins().showTips(str);
				}
			}
			oldValue = value;
		}
		if (type == 1) {
			this._togeatter1 = oldValue;
		} else {
			this._togeatter2 = oldValue;
		}

		return { value: value, type: type };
	}

	public postLevelChange() {

	}

	public postSoulChange(value: number) {
		if (this._soul > 0) {
			let addSoul: number = value - this._soul;
			if (addSoul > 0) {
				let str: string = `获得|C:0xd242fb&T:聚灵石 x ${addSoul}|`;
				UserTips.ins().showTips(str);
			}
		}
		this._soul = value;
	}


	public postPowerChange(value: number) {
		if (this._power != value) {
			if (this._power < value && this._power > 0) {
				UserTips.ins().showBoostPower(value, this._power);
			}
			this._power = value;
		}
	}

	/** 威望值改变 */
	public postWeiWang(value: number): void {
		if (this._weiWang > 0 && value - this._weiWang > 0)
			UserTips.ins().showTips(`|C:0xff00ff&T:获得${value - this._weiWang}${RewardData.getCurrencyName(MoneyConst.weiWang)}|`);

		this._weiWang = value;
	}

	public static _instance: Actor;

	/**是否可以转生 */
	public static canZhuanSheng(): boolean {
		return this._instance ? this._instance._level >= this.zhuanShengLv : false;
	}

	public static get level(): number {
		return this._instance ? this._instance._level : 0;
	}

	public static get exp(): number {
		return this._instance ? this._instance._exp : 0;
	}

	public static get power(): number {
		return this._instance ? this._instance._power : 0;
	}

	public static get myName(): string {
		return this._instance ? this._instance._myName : "";
	}

	public static get gold(): number {
		return this._instance ? this._instance._gold : 0;
	}

	public static get yb(): number {
		return this._instance ? this._instance._yb : 0;
	}

	public static get soul(): number {
		return this._instance ? this._instance._soul : 0;
	}

	public static get feats(): number {
		return this._instance ? this._instance._feats : 0;
	}

	public static get togeatter1(): number {
		return this.ins()._togeatter1 < 0 ? 0 : this.ins()._togeatter1;
	}

	public static get togeatter2(): number {
		return this.ins()._togeatter2 < 0 ? 0 : this.ins()._togeatter2;
	}

	public static get samsaraLv(): number {
		let data = SamsaraModel.ins().samsaraInfo;
		return data ? data.lv : 0;
	}

	/** 获得威望值 */
	public static get weiWang(): number {
		return this._instance ? this._instance._weiWang : 0;
	}

	public static get totalLevel() {
		return UserZs.ins().lv * 1000 + this.level;
	}

	public static getLevelStr(value: number): string {
		let lv: number = value % 1000;
		let zs: number = value / 1000 >> 0;
		return zs > 0 ? `${zs}转` : `${lv}级`;
	}
}

namespace GameSystem {
	export let  actor = Actor.ins.bind(Actor);
}

