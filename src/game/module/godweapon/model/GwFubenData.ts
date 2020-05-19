//副本信息
class GwFubenData {
	//已挑战次数
	public hadChallengeNum: number;
	//vip已购买次数
	public vipBuyNum: number;
	//已通过多少层
	private _hadPass: number;
	//当前层评分 1到4 1是最高评分s
	public curPoint: number;
	public listData: GwfubenFloorData[];
	private _maxGird: number;
	//购买次数数据
	public hadBuyData: number[][];
	public constructor() {
	}
	public parse(bytes: GameByteArray): void {
		this.hadBuyData = [];
		this.hadChallengeNum = bytes.readInt();
		this.vipBuyNum = bytes.readInt();
		this.hadPass = bytes.readInt();
		this.curPoint = bytes.readInt();

		//购买次数
		let count: number = bytes.readInt();
		for (let i: number = 0; i < count; i++) {
			let tempA: number[] = [];
			tempA.push(bytes.readInt());//类型
			tempA.push(bytes.readInt());//次数
			this.hadBuyData[i] = tempA;
		}
		this.getList();
	}
	public set hadPass(value: number) {
		this._hadPass = value;
	}
	public get hadPass(): number {
		return this._hadPass;
	}
	private getList(): void {
		let maxNum: number = this.getMaxGird();
		let endNum: number
		if (this.curPoint == 1) {//s评分才是下一层
			endNum = Math.min(this._hadPass + 1, maxNum);
		} else {
			endNum = this._hadPass;
		}
		this.listData = [];
		let data: GwfubenFloorData;
		for (let i: number = endNum; i > 0; i--) {
			data = new GwfubenFloorData();
			data.gridNum = i;
			if (data.gridNum > this._hadPass) {
				data.curPoint = 0;
			} else if (data.gridNum == this._hadPass) {
				data.curPoint = this.curPoint;
			} else {
				data.curPoint = 1;
			}
			this.listData.push(data);
		}
	}
	//最大层
	public getMaxGird(): number {
		if (!this._maxGird) {
			this._maxGird = 0;
			for (let key in GlobalConfig.GodWeaponFubenConfig) {
				this._maxGird++;
			}
		}
		return this._maxGird;
	}
	//获取类型
	public buyTypeData(type: number): number[] {
		for (let i: number = 0; i < this.hadBuyData.length; i++) {
			if (this.hadBuyData[i][0] == type) {
				return this.hadBuyData[i];
			}
		}
		return [type, 0];
	}
	//已购买了多少次
	public get getBuyCount(): number {
		let num: number = 0;
		for (let i: number = 0; i < this.hadBuyData.length; i++) {
			num += this.hadBuyData[i][1];
		}
		return num;
	}
}
//层结构
class GwfubenFloorData {
	//层
	private _gridNum: number;
	//0到4
	public curPoint: number;
	public config: GodWeaponFubenConfig;
	constructor() {
	}
	//层
	public set gridNum(value: number) {
		this._gridNum = value;
		this.config = GlobalConfig.GodWeaponFubenConfig[value];
	}
	public get gridNum(): number {
		return this._gridNum;
	}
}