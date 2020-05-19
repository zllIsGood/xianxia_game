class UserZs extends BaseSystem {

	public lv: number;
	public exp: number;
	public exchange:boolean;
	/**
	 * 当天
	 * 0等级转换次数 1普通道具提升次数 2高级道具提升次数
	 *  */
	public upgradeCount: number[];
	public constructor() {
		super();

		this.sysId = PackageID.Zs;
		this.regNetMsg(1, this.postZsData);
		//等级兑换红点在同一次登陆查看只显示一次
		this.exchange = false;
	}

	public static ins(): UserZs {
		return super.ins() as UserZs;
	}

	/**
	 * 处理转生数据
	 * 13-1
	 * @param bytes
	 */
	public postZsData(bytes: GameByteArray): void {
		this.lv = bytes.readInt();
		let oldexp = this.exp;
		this.exp = bytes.readInt();
		this.upgradeCount = [bytes.readShort(), bytes.readShort(), bytes.readShort()];
		if( oldexp )
			Actor.ins().postZsExpChange(this.exp - oldexp);

		this.postZsLv();
	}

	/** 转生等级 */
	public postZsLv():void
	{

	}

	/**
	 * 发送获取修为
	 * 13-1
	 * @param type 1 等级转换 2普通道具提升 3高级道具提升
	 */
	public isSendXW:boolean[] = [];
	public sendGetXiuWei(type: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}
	/**
	 * 发送提升转生等级
	 * 13-2
	 */
	public sendZsUpgrade(): void {
		this.sendBaseProto(2);
	}

	public canUpgrade(): boolean {
		let nextAttConfig: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[this.lv + 1];
		if (!nextAttConfig)
			return false;
		return this.exp >= nextAttConfig.exp;
	}

	public isMaxLv(): boolean {
		return GlobalConfig.ZhuanShengLevelConfig[this.lv + 1] ? false : true;
	}

	public canGet(): number {
		let sum: number = 0;
		if (!this.upgradeCount)
			return sum;

		let config: ZhuanShengConfig = GlobalConfig.ZhuanShengConfig;
		let canCount: number[] = [config.conversionCount, config.normalCount, config.advanceCount];
		let items: number[] = [0, config.normalItem, config.advanceItem];

		for (let i: number = 0; i < canCount.length; i++) {
			if (canCount[i] - this.upgradeCount[i]) {
				if ((!items[i] && Actor.level > 80) || UserBag.ins().getItemCountById(0, items[i]))
					if( i==0 ){
						if( !UserZs.ins().exchange )
							sum = sum | 1 << i;
					}else
						sum = sum | 1 << i;
			}
		}
		return sum;
	}

	public canOpenZSWin(): boolean {
		let lv: number = Actor.level;
		let zs: number = this.lv != null ? this.lv : 0;
		if (zs <= 0 && lv < 80)
			return false;
		else
			return true;
	}
}

namespace GameSystem {
	export let  userZs = UserZs.ins.bind(UserZs);
}
