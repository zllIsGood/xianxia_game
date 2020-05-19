/**
 * 排行榜数据
 */
class Rank extends BaseSystem {

	/**排行榜数据 */
	public rankModel: RankModel[] = [];

	//当前排行榜的类型
	public curType: number;

	public constructor() {
		super();

		this.sysId = PackageID.Ranking;
		this.regNetMsg(1, this.postRankingData);
		this.regNetMsg(2, this.postPraiseData);
		this.regNetMsg(3, this.postPraiseResult);
		this.regNetMsg(4, this.postAllPraiseData);
	}

	public static ins(): Rank {
		return super.ins() as Rank;
	}

	protected initLogin() {
		this.sendGetAllPraiseData();
	}

	/**
	 * 请求排行榜数据
	 * 18-1
	 * @param type 排行榜类型
	 */
	public sendGetRankingData(type: number = 0) {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	/**
	 * 请求排行榜数据结果
	 * 18-1
	 */
	public postRankingData(bytes: GameByteArray) {
		let rankModel = this.getRankModel(bytes.readShort());
		rankModel.parser(bytes);
		return rankModel;
	}

	/**
	 * 请求膜拜数据
	 * 18-2
	 */
	public sendGetPraiseData(type: number = 0) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	/**
	 * 接受膜拜结果
	 * 18-2
	 */
	public postPraiseData(bytes: GameByteArray) {
		let rankModel: RankModel = Rank.ins().getRankModel(bytes.readShort());
		rankModel.praise.praiseTime = bytes.readShort();
		rankModel.praise.parser(bytes);

		return rankModel.type;
	}

	/**
	 * 请求所有膜拜数据
	 * 18-4
	 * @returns void
	 */
	public sendGetAllPraiseData() {
		this.sendBaseProto(4);
	}

	/**
	 * 接受所有膜拜数据
	 * 18-4
	 * @param  {GameByteArray} bytes
	 */
	public postAllPraiseData(bytes: GameByteArray) {
		let n: number = bytes.readShort();
		for (let i: number = 0; i < n; i++) {
			let rankModel: RankModel = Rank.ins().getRankModel(bytes.readShort());
			rankModel.praise.praiseTime = bytes.readShort();
		}
	}

	/**
	 * 请求膜拜
	 * 18-3
	 */
	public sendPraise(type: number) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	/**
	 * 膜拜结果
	 * 18-3
	 */
	public postPraiseResult(bytes: GameByteArray) {
		let rankModel: RankModel = Rank.ins().getRankModel(bytes.readShort());
		rankModel.praise.praiseTime = bytes.readShort();
		return [rankModel.type, rankModel.praise.getLastMobaiNum()];
	}

	/**
	 * 获取指定类型的排行榜数据模型
	 * 如果不存在则会创建该类型
	 */
	public getRankModel(type: number): RankModel {
		if (!(type in this.rankModel)) {
			let dataClass: any;
			if (type == RankDataType.TYPE_SKIRMISH)
				dataClass = RankDataSkirmish;
			else if (type == RankDataType.TYPE_LADDER)
				dataClass = RankDataLadder;
			else if (type == RankDataType.TYPE_BAOSHI)//铸造榜
				dataClass = RankDataZhuZao;
			else if (type == RankDataType.TYPE_LONGHUN)//龙印榜
				dataClass = RankDataLongHun;
			else if (type == RankDataType.TYPE_WING)//翅膀榜
				dataClass = RankDataWing;
			else if (type == RankDataType.TYPE_BOOK)//图鉴总战力榜
				dataClass = RankDataBook;
			else if (type == RankDataType.TYPE_ZS)//转生榜
				dataClass = RankDataZhuan;
			else if (type == RankDataType.TYPE_SCORE)//装备总评分榜
				dataClass = RankDataScore;
			else if (type == RankDataType.TYPE_WEIWANG) //威望排行榜
				dataClass = RankDataWeiWang;
			else if (type == RankDataType.TYPE_HUANSHOU_POWER) //幻兽
				dataClass = RankDataHuanShou;
			else if (type == RankDataType.TYPE_MEIREN)//美人
				dataClass = RankDataMeiRen;
			else if (type == RankDataType.TYPE_FLYSWORD_POWER) //飞剑
				dataClass = RankDataFlySword;
			else if (type == RankDataType.TYPE_EXRING_POWER) //灵戒战力
				dataClass = RankDataExRing;
			else if (type == RankDataType.TYPE_HEART_POWER)//心法榜
				dataClass = RankDataHeart;
			else
				dataClass = RankDataBase;
			this.rankModel[type] = new RankModel(type, dataClass);
		}
		return this.rankModel[type];
	}

	/**
	 * 能否膜拜（通过类型）
	 * @param  {number} type    排行榜类型
	 * @returns boolean
	 */
	public canPraiseByType(type: number): boolean {
		return false	//暂时屏蔽膜拜
		// return this.rankModel[type] ? this.rankModel[type].praise.praiseTime < 1 : false;
	}

	/**
	 * 能否膜拜（在所有排行榜里）
	 * @returns boolean
	 */
	private rankTypeList: number[] = [];

	public canPraiseInAll(): boolean {
		if (this.rankTypeList.length <= 0) {
			this.rankTypeList = [RankDataType.TYPE_POWER,
			RankDataType.TYPE_SKIRMISH,
			RankDataType.TYPE_LEVEL,
			RankDataType.TYPE_LILIAN,
			RankDataType.TYPE_XUNZHANG];
		}
		for (let value of this.rankModel) {
			if (value && this.rankTypeList.lastIndexOf(value.type) > -1) {
				if (value.praise && value.praise.praiseTime < 1) {
					return true;
				}
			}
		}
		return false;
	}
}

class RankModel {
	/** 类型 */
	public type: number;

	/** 膜拜数据 */
	public praise: PraiseData;

	//配置添加了限制上榜条件后,服务端发的排名不再是最终上榜排名
	/** 主角排名 */
	public selfPos: number;

	/** 排行榜数据 */
	private _dataList: any[];

	/** 数据类型（基于RankDataBase） */
	private _dataClass: any;

	/** 排行榜数据 */
	public getDataList(index: number = -1): any {
		return index == -1 ? this._dataList : this._dataList[index];
	}


	public constructor(type: number, dataClass: any) {
		this.type = type;
		this._dataClass = dataClass;
		this._dataList = [];
		this.praise = new PraiseData;
	}

	public parser(bytes: GameByteArray): void {
		let items: string[] = RankDataType.ITEMS[this.type];
		let n: number = bytes.readShort();
		this._dataList.length = n;
		for (let i: number = 0; i < n; ++i) {
			if (!(i in this._dataList))
				this._dataList[i] = new this._dataClass;
			this._dataList[i].parser(bytes, items);
		}
		this.selfPos = bytes.readShort();
	}
}

namespace GameSystem {
	export let rank = Rank.ins.bind(Rank);
}