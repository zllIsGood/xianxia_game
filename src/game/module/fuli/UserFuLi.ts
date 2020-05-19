/** 摇钱树 管理类*/
class UserFuLi extends BaseSystem {

	/**金币炼制 */
	// public moneyTreeModel: MoneyTreeModel = new MoneyTreeModel();
	public constructor() {
		super();

		this.sysId = PackageID.moneyTree;
		this.regNetMsg(1, this.doMoneyTreeInfo);//摇钱树数据变化
		this.regNetMsg(2, this.doPalyBack);//摇一摇回包
		this.regNetMsg(3, this.doGetRewardBack);//领取宝箱返回
	}

	public static ins(): UserFuLi {
		return super.ins() as UserFuLi;
	}

	/** 摇一摇*/
	public sendPlayYaoYao(): void {
		this.sendBaseProto(2);
	}

	/** 领取宝箱奖励*/
	public sendGetCaseReward(id: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**摇钱树数据变化 */
	private doMoneyTreeInfo(bytes: GameByteArray): void {
		this.playNum = bytes.readUnsignedShort();
		this.boxOn = bytes.readUnsignedShort();
		this.addCoefficient = bytes.readUnsignedShort();
		this.exp = bytes.readUnsignedShort();
		this.boxInfo = bytes.readInt();
		this.postMoneyInfoChange();
	}

	/** 派发摇钱树数据变化*/
	public postMoneyInfoChange(param: any = null): any {
		return param;
	}

	/**摇一摇回包 */
	private doPalyBack(bytes: GameByteArray): void {
		this.playNum = bytes.readUnsignedShort();
		this.boxOn = bytes.readUnsignedShort();
		this.addCoefficient = bytes.readUnsignedShort();
		this.exp = bytes.readUnsignedShort();
		this.baoji = bytes.readUnsignedShort();
		this.postMoneyInfoChange([false, this.baoji]);
	}

		/** 派发摇钱树数据变化*/
	// public postMoneyBaojiChange(param: any = null): any {
	// 	return param;
	// }

	/**领取宝箱返回 */
	private doGetRewardBack(bytes: GameByteArray): void {
		this.boxInfo = bytes.readInt();
		this.postMoneyInfoChange();
	}

	//------------------------------------------------------摇钱树相关--------------------------------
	/**当天使用次数 */
	public playNum: number = 0;
	/**宝箱进度 */
	public boxOn: number = 0;
	/**增幅等级 */
	public addCoefficient: number = 1;
	/**经验值 */
	public exp: number = 0;
	/**宝箱领取信息 */
	public boxInfo: number = 0;
	/**暴击 */
	public baoji: number = 0;
	public isOpenNotice: boolean;

	public isOpen: boolean[] = [];


	public getOrderByIndex(index: number = 0): number {
		let num: number = (this.boxInfo >> index) & 1;
		return num;
	}

	/**0--表示当前等级系数    1---下级系数 */
	public getNowCoefficientinfo(index: number = 0): any {
		let config: any = GlobalConfig.CashCowAmplitudeConfig;
		for (let k in config) {
			if (config[k].level == (this.addCoefficient + index)) {
				return config[k];
			}
		}
		return null;
	}

	public get maxNum(): number {
		return this.checkCashCowBasicLenght(10);
	}

	public get cruMaxNum(): number {
		return this.checkCashCowBasicLenght();
	}

	public getIndexCost(): any {
		let config: any = GlobalConfig.CashCowBasicConfig;
		for (let k in config) {
			if (config[k].time == (this.boxOn + 1)) {
				return config[k];
			}
		}
		return null;
	}

	public getBoxInfoByIndex(index: number): any {
		let config: any = GlobalConfig.CashCowBoxConfig;
		for (let k in config) {
			if (config[k].index == index) {
				return config[k];
			}
		}
		return null;
	}

	private checkCashCowBasicLenght(lv: number = 0): number {
		if (lv == 0) {
			lv = UserVip.ins().lv
		}
		let config: any = GlobalConfig.CashCowLimitConfig;
		for (let k in config) {
			if (config[k].vip == lv) {
				return config[k].maxTime;
			}
		}
		return 0;
	}

	public checkBoxIsCanget(index: number): boolean {
		let data: any = this.getBoxInfoByIndex(index);
		if (data.time <= this.playNum) {
			if (this.getOrderByIndex(index - 1) <= 0) {
				return true;
			}
		}
		return false;
	}
}

namespace GameSystem {
	export let  userfuli = UserFuLi.ins.bind(UserFuLi);
}