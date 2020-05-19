//副本排名信息
class GwRankInfoData {
	//第几名
	public rank: number;
	//玩家名字
	public nameStr: string;
	//第几层
	public floorNum: number;
	//时间
	public timeNum: number;//秒
	public constructor() {
	}
	public parse(bytes: GameByteArray): void {
		this.rank = bytes.readInt();
		this.nameStr = bytes.readString();
		let num: number = bytes.readInt();
		this.floorNum = Math.floor(num / 10000);
		this.timeNum = 10000 - (num % 10000);
	}
	//时间格式 00：00
	public getgetTimeStr(): string {
		let str: string = "";
		str = DateUtils.getFormatBySecond(this.timeNum, DateUtils.TIME_FORMAT_3);
		return str;
	}
}