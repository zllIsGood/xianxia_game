/**
 * 天梯数据
 */
class Ladder extends BaseSystem {

	/**是否开启 */
	public isOpen: boolean;
	/**当前天梯级别 */
	public level: number;
	/**当前天梯id */
	public nowId: number;
	/**挑战次数 */
	public challgeNum: number;
	/**挑战次数cd */
	public challgeCd: number;
	/**当前净胜 */
	public winNum: number;
	/**是否连胜 */
	public lianWin: boolean;
	/**上周是否参加了天梯 */
	public playUpTime: boolean;
	/**是否可以领取奖励 */
	public isCanReward: boolean = false;
	/**上周天梯级别 */
	public upLevel: number = 0;
	/**上周天梯id */
	public upId: number = 0;
	/**上周净胜 */
	public upWin: number = 0;
	/**已购买次数 */
	public todayBuyTime: number = 0;

	public upWeekRank: number = 0;

	/**排行榜信息 */
	public upRankList: any[] = [];

	public upweekLength: number;
	public configList: TianTiDanConfig[];

	private _actorInfo: any[] = [];

	public constructor() {
		super();
		this.sysId = PackageID.Ladder;

		this.regNetMsg(1, this.doLadderInfo);
		this.regNetMsg(2, this.doGetPlayer);
		this.regNetMsg(3, this.doPlayResule);
		this.regNetMsg(5, this.postRankInfoList);
		this.regNetMsg(6, this.doChallageNum);
	}

	public static ins(): Ladder {
		return super.ins() as Ladder;
	}

	/**根据索引获取数据 */
	public getActorInfo(index: number = -1): any {
		return index == -1 ? this._actorInfo : this._actorInfo[index];
	}

	//服务器数据下发处理
	//============================================================================================
	/**请求匹配玩家 34-2*/
	public sendGetSomeOne(): void {
		this.sendBaseProto(2);
	}

	/**开始挑战 34-3*/
	public sendStarPlay(id: number, type: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(type);
		bytes.writeInt(id);
		this.sendToServer(bytes);
		this._actorInfo = [];
	}

	/**领取上周奖励 34-4*/
	public sendGetWeekReward(): void {
		this.sendBaseProto(4);
	}

	/**获取排行榜数据 34-5*/
	public sendGetRankInfo(): void {
		this.sendBaseProto(5);
	}

	/**购买次数 34-6*/
	public sendBuyChallgeTime(): void {
		this.sendBaseProto(6);
	}

	/**天梯相关信息 34-1 */
	private doLadderInfo(bytes: GameByteArray): void {
		this.docodeInfo(bytes);
	}

	/**派发天梯相关信息 */
	public postTadderChange(): void {

	}

	/**获取到天梯天战对象 34-2*/
	private doGetPlayer(bytes: GameByteArray): void {
		let type: number = bytes.readInt();
		let id: number = bytes.readInt();
		this._actorInfo.length = 0;
		this._actorInfo.push(type, id);
		if (id > 0) {
			this._actorInfo.push(bytes.readString());
			this._actorInfo.push(bytes.readByte());
			this._actorInfo.push(bytes.readByte());
			this._actorInfo.push(bytes.readInt());
			this._actorInfo.push(bytes.readInt());
		}
	}

	/**天梯挑战结果 34-3*/
	private doPlayResule(bytes: GameByteArray): void {
		this.doPlayResult(bytes);
	}

	/**获取排行榜列表 34-5*/
	postRankInfoList(bytes: GameByteArray): RankModel {
		// let curr = bytes.readInt();

		let rankModel: RankModel = Rank.ins().getRankModel(RankDataType.TYPE_LADDER);
		let n: number = bytes.readShort();
		rankModel.getDataList().length = n;
		let arr = rankModel.getDataList();
		let i: number = 0;
		for (i = 0; i < n; ++i) {
			this.setRankData(arr, i, bytes);
		}
		let rankInfo: RankDataLadder = this.getMyRankInfo(arr);
		rankModel.selfPos = rankInfo ? rankInfo.pos : 0;

		this.upRankList = [];
		this.upweekLength = 0;
		n = bytes.readShort();
		for (i = 0; i < n; ++i) {
			this.setRankData(this.upRankList, i, bytes, true);
		}
		this.fillingList();

		return rankModel;
	}

	/**
	 * 设置排行数据
	 */
	private setRankData(list: any[], index: number, bytes: GameByteArray, setRank: boolean = false): void {
		if (!(index in list))
			list[index] = new RankDataLadder;
		list[index].parser(bytes, null);
		//排名
		list[index].pos = index + 1;
		if (setRank && list[index].id == Actor.actorID) {
			this.upWeekRank = list[index].pos;
		}
	}

	/**获取已购买次数 34-6*/
	private doChallageNum(bytes: GameByteArray): void {
		this.todayBuyTime = bytes.readInt();
	}


	//业务数据处理
	//============================================================================================
	/** 天梯数据 34-1*/
	public docodeInfo(bytes: GameByteArray): void {
		this.isOpen = bytes.readBoolean();
		this.level = bytes.readInt();
		this.nowId = bytes.readInt();
		this.challgeNum = bytes.readInt();
		let time = bytes.readInt();
		this.challgeCd = time * 1000 + egret.getTimer();
		this.winNum = bytes.readInt();
		this.lianWin = bytes.readBoolean();
		this.playUpTime = bytes.readBoolean();
		if (this.playUpTime) {
			this.isCanReward = bytes.readBoolean();
			this.upLevel = bytes.readInt();
			this.upId = bytes.readInt();
			this.upWin = bytes.readInt();
		}
		Ladder.ins().postTadderChange();
	}

	/**挑战结果 34-3*/
	public doPlayResult(bytes: GameByteArray): void {
		let isWin: boolean = bytes.readBoolean();
		let num: number = bytes.readShort();

		let list: RewardData[] = [];
		let item: RewardData;
		for (let i: number = 0; i < num; i++) {
			item = new RewardData();
			item.parser(bytes);
			list.push(item);
		}

		let upLevel: number = bytes.readInt();
		let upId: number = bytes.readInt();
		let upStar: number = bytes.readInt();

		TimerManager.ins().doTimer(1000, 1, () => {
			ViewManager.ins().open(LadderResultWin, isWin, list.reverse(), upLevel, upId, upStar);
		}, this);
	}


	public fillingList(): void {
		if (this.upweekLength == 0) {
			this.upweekLength = this.checkObjListLength();
		}
		let len: number = this.upweekLength - this.upRankList.length;
		if (len > 0) {
			for (let i: number = 1; i < len; i++) {
				this.upRankList.push(null);
			}
		}
		if (!this.configList) {
			this.configList = this.cloneConfigDataList(GlobalConfig.TianTiDanConfig);
			this.configList.reverse();
		}
	}

	public getUpRankList(): RankDataLadder[] {
		let list: RankDataLadder[] = [];
		for (let index in this.upRankList) {
			if (this.upRankList[index]) {
				list.push(this.upRankList[index]);
			}
		}
		return list;
	}

	public checkObjListLength(): number {
		for (let i: number = 1; i < 200; i++) {
			if (!GlobalConfig.TianTiRankAwardConfig[i + ""]) {
				return i;
			}
		}
		return 0;
	}

	public getMyRankInfo(itemList: RankDataLadder[]): RankDataLadder {
		for (let i: number = 0; i < itemList.length; i++) {
			if (itemList[i].id == Actor.actorID) {
				return itemList[i];
			}
		}
		return null;
	}

	public getLevelDuanWeiLength(level: number): number {
		let len: number = 0;
		let list: any[] = GlobalConfig.TianTiDanConfig;
		for (let id in list[level + ""]) {
			if (list[level + ""][id]) {
				len++;
			}
		}
		return len;
	}

	public getDuanWeiDesc(): string {
		let str: string = "";
		let config: any = this.getLevelConfig();
		if (config) {
			str = config.showLevel + this.getZhongwenNumber(config.showDan) + "段";
		}
		return str;
	}

	/**
	 * 获取结算配置
	 *
	 */
	public getLevelConfig(level: number = -1, ids: number = -1): TianTiDanConfig {
		if (level == -1) {
			level = this.level;
		}
		if (ids == -1) {
			ids = this.nowId;
		}
		let list: TianTiDanConfig[][] = GlobalConfig.TianTiDanConfig;
		for (let id in list[level + ""]) {
			if (list[level + ""][id].id == ids) {
				return list[level + ""][id];
			}
		}
		return null;
	}

	public creatRewardData(data: any): RewardData {
		let item: RewardData;
		item = new RewardData();
		item.count = data.count;
		item.type = data.type;
		item.id = data.id;
		return item;
	}

	public getZhongwenNumber(i: number): string {
		let str: string = "";
		switch (i) {
			case 1:
				str = "一";
				break;
			case 2:
				str = "二";
				break;
			case 3:
				str = "三";
				break;
			case 4:
				str = "四";
				break;
			case 5:
				str = "五";
				break;
			case 6:
				str = "六";
				break;
			case 7:
				str = "七";
				break;
			case 8:
				str = "八";
				break;
			case 9:
				str = "九";
				break;
			case 10:
				str = "十";
				break;
		}
		return str;
	}

	/**
	 * 复制一个配置数组
	 * @param list
	 */
	cloneConfigDataList(list: any[]): TianTiDanConfig[] {
		let returnList: TianTiDanConfig[] = [];
		let item: TianTiDanConfig;
		for (let i in list) {
			for (let j in list[i]) {
				item = new TianTiDanConfig();
				item.level = parseInt(i);
				item.id = list[i][j].id;
				item.showStar = list[i][j].showStar;
				item.showDan = list[i][j].showDan;
				item.showLevel = list[i][j].showLevel;
				item.winAward = list[i][j].winAward;
				item.danAward = list[i][j].danAward;
				if (this.checkIshaveOne(returnList, item)) {
					returnList.push(item);
				}
			}
		}
		return returnList;
	}

	public checkRedShow(): number {
		if ((this.challgeNum > 0 && this.isOpen)) {
			return 1;
		}
		return 0;
	}

	private checkIshaveOne(list: TianTiDanConfig[], item: TianTiDanConfig): boolean {
		let len: number = list.length;
		for (let i: number = 0; i < len; i++) {
			if (list[i].level == item.level) {
				return false;
			}
		}
		return true;
	}

	public getStatuByLevel(level: number): number {
		let str: number;
		switch (level) {
			case 1:
				str = 3;
				break;
			case 2:
				str = 4;
				break;
			case 3:
				str = 5;
				break;
			case 4:
				str = 0;
				break;

		}
		return str;
	}

}

namespace GameSystem {
	export let  ladder = Ladder.ins.bind(Ladder);
}