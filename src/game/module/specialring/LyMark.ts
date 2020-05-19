/**
 * 烈焰印记
 * Created by wanghengshuai on 2018/1/2.
 */
class LyMark extends BaseSystem {

	private _lyMarkLv: number = 0;

	private _lyMarkExp: number = 0;

	private _skills: number[];

	private _isMax: boolean = false;

	public constructor() {
		super();

		this.sysId = PackageID.LyMark;
		this.regNetMsg(1, this.postMarkData);
		this.regNetMsg(2, this.postUpgrade);
	}

	public static ins(): LyMark {
		return super.ins() as LyMark;
	}

	/** 烈焰印记等级 */
	public get lyMarkLv(): number {
		return this._lyMarkLv;
	}

	/** 印记经验 */
	public get lyMarkExp(): number {
		return this._lyMarkExp;
	}

	/** 技能信息 */
	public get skills(): number[] {
		return this._skills;
	}

	/** 是否达到最大等级 */
	public get isMax(): boolean {
		return this._isMax;
	}

	/** 根据技能ID获得技能等级 */
	public getSkillLvById(id: number): number {
		if (!this._skills || this._skills.length < id)
			return 0;

		return this._skills[id - 1];
	}

	/** 更新印记信息
	 * 71-1
	 */
	public postMarkData(bytes: GameByteArray): void {
		this._lyMarkLv = bytes.readShort();
		this._lyMarkExp = bytes.readInt();

		let len: number = bytes.readByte();
		this._skills = [];
		this._skills.length = len;
		for (let i: number = 0; i < len; i++)
			this._skills[i] = bytes.readShort();

		this._isMax = this._lyMarkLv >= Object.keys(GlobalConfig.FlameStampLevel).length;
	}

	/** 升级暴击返回
	 * 71-2
	 */
	public postUpgrade(bytes: GameByteArray) {
		let crit: number = bytes.readByte();
		return [crit];
	}

	/** 升级
	 * 71-2
	 */
	public sendUpgrade(): void {
		this.sendBaseProto(2);
	}

	/** 升级技能
	 * 71-3
	 */
	public sendUpSkill(skillID: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(skillID);
		this.sendToServer(bytes);
	}

	/** 合成
	 * 71-4
	 */
	public sendCompound(itemID: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(itemID);
		this.sendToServer(bytes);
	}

	public checkOpen(): boolean {
		if (!SpecialRing.ins().isFireRingActivate())
			return false;

		let ring: SpecialRingData = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
		if (!ring || ring.level < GlobalConfig.FlameStamp.openLevel)
			return false;

		return true;
	}

	public checkRed(): boolean {
		if (!this.checkOpen())
			return false;

		if (!this.lyMarkLv)
			return false;

		if (!this.isMax) {
			let cfg: FlameStampLevel = GlobalConfig.FlameStampLevel[this.lyMarkLv];
			if (Assert(cfg, `LyMark lv:${this.lyMarkLv}, exp:${this.lyMarkExp}`)) return false;
			let itemData: ItemData = UserBag.ins().getBagItemById(cfg.costItem);
			let count: number = itemData ? itemData.count : 0;
			let needExp: number = cfg.exp - this._lyMarkExp;
			if (count >= cfg.costCount && count * GlobalConfig.FlameStampMat[cfg.costItem].exp >= needExp)
				return true;
		}

		//技能
		let skillCfg: FlameStampEffect, skillLv: number;
		for (let i: number = 0; i <= 6; i++) {
			if (i == 0)
				continue;

			skillLv = this.getSkillLvById(i + 1);

			let isMax: boolean = skillLv >= (Object.keys(GlobalConfig.FlameStampEffect[i + 1]).length);
			if (isMax)
				continue;

			skillCfg = GlobalConfig.FlameStampEffect[i + 1][skillLv <= 0 ? 1 : skillLv + 1];
			if (skillCfg.costItem) {
				let itemData: ItemData = UserBag.ins().getBagItemById(skillCfg.costItem);
				let count: number = itemData ? itemData.count : 0;
				if (count >= skillCfg.costCount && this.lyMarkLv >= skillCfg.stampLevel)
					return true;
			}

		}

		return this.checkMixRed();
	}

	/** 合成符文石红点 */
	public checkMixRed(): boolean {
		let itemData: ItemData, cfg: FlameStampMat;
		let count: number;
		for (let key in GlobalConfig.FlameStampMat) {
			cfg = GlobalConfig.FlameStampMat[key];
			count = 0;
			if (cfg.costItem) {
				itemData = UserBag.ins().getBagItemById(cfg.costItem);
				count = itemData ? itemData.count : 0;
			}

			if (cfg.costItem && this.lyMarkLv >= cfg.limitLv && count >= cfg.costCount)
				return true;
		}

		return false;
	}

	/** 获得当前使用技能ID */
	public getCurSkillID(): number {
		//技能
		let skillLv: number, effectCfg: FlameStampEffect;
		let skillID: number = 0, realLv: number = 0;
		for (let i: number = 0; i <= 6; i++) {
			realLv = skillLv = this.getSkillLvById(i + 1);
			if (!skillLv)
				skillLv = 1;

			effectCfg = GlobalConfig.FlameStampEffect[i + 1][skillLv];
			if ((i + 1 == 1 || i + 1 == 2) && realLv)
				skillID = effectCfg.skillId;
		}

		return skillID;
	}

	/** 获得当前技能CD */
	public getCurSkillCD(): number {
		let skillID: number = this.getCurSkillID();
		let lv: number = this.getSkillLvById(3);
		let mCd: number = lv ? GlobalConfig.FlameStampEffect[3][lv].reloadTime : 0;
		let skillDes: SkillsDescConfig = GlobalConfig.SkillsDescConfig[GlobalConfig.SkillsConfig[skillID].desc];

		return skillDes.cd - mCd;
	}

}

namespace GameSystem {
	export let lyMark = LyMark.ins.bind(LyMark);
}