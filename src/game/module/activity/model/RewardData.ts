/**
 *  奖励数据
 * @author
 */
class RewardData {

	static CURRENCY_NAME: any = {
		"0": "经验",
		"1": "金币",
		"2": "元宝",
		"3": "声望",
		"4": "聚灵石",
		"5": "公会贡献",
		"6": "公会资金",
		"7": "功勋",
		"8": "成就",
		"9": "符文精华",
		"10": "符文碎片",
		"11": "低级符文碎片",
		"12": "高级符文碎片",
		"13": "神兵经验",
		"14": "威望",
		"15": "筹码",
		"16": "兽神精魄",
		"99": "元宝"
	};
	static CURRENCY_RES: any = {
		"1": "ZSgold",
		"2": "ZScoin",
		"3": "ZSshengwang",
		"4": "ZSlingpo",
		"0": "result_json.ZSexp",
		"5": "ZSguildgx",
		"6": "ZSguildfund",
		"8": "ZSchengjiu",
		"99": "ZScoin",
		"7": "ZShonor",
		"9": "500007_png",
		"10": "500008_png",
		"11": "hejisuipian",
		"12": "hejisuipian1",
		"13": "ZSexp",
		"14": "ZSprestige",
		"15": "ZSchip",
		"16": "SSExp",
	};

	/**
	 * 奖励类型
	 * 0 货币奖励
	 * 1 道具装备奖励
	 */
	public type: number;
	/**
	 * id
	 * (货币类型的时候表示   1金币 2元宝)
	 * (道具装备的时候表示   道具id)
	 */
	public id: number;
	/**
	 * 数量
	 */
	public count: number;

	public job: number;
	/** 是否亮红点 0 无 1 可领取 2已领取*/
	public isRedPoint: number = 0;

	public parser(bytes: GameByteArray) {
		this.type = bytes.readInt();
		this.id = bytes.readInt();
		this.count = bytes.readInt();
	}

	/**倍数标签*/
	public tag: number;

	static getCurrencyName(v: number): string {
		return RewardData.CURRENCY_NAME[v];
	}

	static getCurrencyRes(v: number): string {
		return RewardData.CURRENCY_RES[v];
	}
}
enum RewardDataCurrency {
	/** 经验 */
	Exp = 0,
		/** 金币 */
	Glod = 1,
		/** 元宝 */
	Yb = 2,
		/** 声望 */
	Shengwang = 3,
		/** 精炼石 */
	Lingpo = 4,
		/**公会贡献 */
	GuildContribute = 5,
		/**公会资金 */
	GuildGold = 6,
		/**功勋 */
	Feats = 7,
		/** 充值额度+元宝 */
	Recharge = 99,
}
