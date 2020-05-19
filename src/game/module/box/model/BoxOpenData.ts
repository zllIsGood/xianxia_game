/**
 * Created by Administrator on 2017/3/13.
 */
class BoxOpenData {
	public pos: number;
	public state: number;
	public time: string;
	public itemId: number;
	private updateTime: number;
	private remindTime: number;
	public openTips: string;
	public canUsed: boolean;

	constructor() {
		this.itemId = 0;
		this.canUsed = true;
	}

	public updateData(bytes: GameByteArray) {
		this.pos = bytes.readShort();
		this.itemId = bytes.readShort();
		this.state = bytes.readShort();
		this.remindTime = bytes.readInt();
		this.updateTime = egret.getTimer();
	}

	public getTime(): number {
		return Math.floor((this.remindTime * 1000 + this.updateTime - egret.getTimer()) / 1000);
	}

	public getDetailData(): BoxItemData[] {
		let arrDesc = GlobalConfig.TreasureBoxConfig[this.itemId].desc;
		let arrRewards = GlobalConfig.TreasureBoxConfig[this.itemId].rewards;
		let data: BoxItemData[] = [];
		for (let i = 0; i < arrDesc.length; i++) {
			let item = new BoxItemData;
			item.desc = arrDesc[i];
			item.reward = arrRewards[i];
			data.push(item);
		}
		return data;
	}
}

class BoxFreeData {

	public pos: number;
	public updateTime: number;
	public remindTime: number;
	//1 ===倒计中   2---未开始倒计时
	public statu: number = 1;

	public updateData(bytes: GameByteArray) {
		this.pos = bytes.readShort();
		this.remindTime = bytes.readInt();
		this.updateTime = egret.getTimer();
	}

	public getTime(): number {
		return Math.max(Math.floor((this.remindTime * 1000 + this.updateTime - egret.getTimer()) / 1000), 0);
	}
}
