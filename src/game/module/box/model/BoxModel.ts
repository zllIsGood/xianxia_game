/**
 * Created by Administrator on 2017/5/3.
 */
class BoxModel extends BaseClass {
	public static ins(): BoxModel {
		return super.ins() as BoxModel;
	}

	private gridCfgList: TreasureBoxGridConfig[] = [];

	public getGridCfgList(): TreasureBoxGridConfig[] {
		if (this.gridCfgList.length > 0) {
			return this.gridCfgList;
		}
		let list: TreasureBoxGridConfig[] = GlobalConfig.TreasureBoxGridConfig;
		for (let str in list) {
			this.gridCfgList.push(list[str]);
		}
		return this.gridCfgList;
	}

	public countBoxTimeCost(time: number, type: number): number {
		let cost: number = GlobalConfig.TreasureBoxBaseConfig.moneyCoefficient;
		let num: number = Math.ceil(time / 60) * cost;
		let boxCoefficient: number = 1;
		let boxCfg: TreasureBoxConfig = GlobalConfig.TreasureBoxConfig[type];
		if (boxCfg)
			boxCoefficient = boxCfg.quality;
		num = Math.ceil(boxCoefficient * num);
		return num;
	}

	public getOtherBoxIsTimeDown(index: number): boolean {
		let other: number = index == 0 ? 1 : 0;
		let data: BoxFreeData = Box.ins().freeInfoList[other];
		return data.getTime() <= 0;
	}

	public getDownTimeIndex(): number {
		let data1: BoxFreeData = Box.ins().freeInfoList[0];
		let data2: BoxFreeData = Box.ins().freeInfoList[1];
		let time1: number = data1.getTime();
		let time2: number = data2.getTime();
		if (time2 > 0 && time1 > 0) {
			if (time1 > time2) {
				return data2.pos;
			}
			return data1.pos;
		} else if (time2 > 0 && time1 <= 0) {
			return data2.pos;
		} else if (time2 <= 0 && time1 > 0) {
			return data1.pos;
		} else {
			return 0;
		}
	}

	public checkRedPointShow(): boolean {
		if (Actor.level < GlobalConfig.TreasureBoxBaseConfig.openLevel) {
			return false;
		}
		let box: Box = Box.ins();
		let data1: BoxFreeData = box.freeInfoList[0];
		let data2: BoxFreeData = box.freeInfoList[1];
		if(!data1||!data2)return false;
		if (data1.getTime() <= 0 || data2.getTime() <= 0) {
			return true;
		}
		let openList: BoxOpenData[] = box.arrOpenData;
		let havePos: boolean = box.isHaveFreePos();
		for (let i: number = 0; i < openList.length; i++) {
			let data: BoxOpenData = openList[i];
			if (data.itemId > 0 && data.state == 1 && havePos) {
				return true;
			}
		}
		return false;
	}

	//是否有可领取
	public checkCanTake(){
		let box: Box = Box.ins();
		let data1: BoxFreeData = box.freeInfoList[0];
		let data2: BoxFreeData = box.freeInfoList[1];
		if(!data1 || !data2)return false;
		if (data1.getTime() <= 0 || data2.getTime() <= 0) {
			return true;
		}
		let openList: BoxOpenData[] = box.arrOpenData;
		for (let item of openList) {
			if (item.itemId > 0 && item.state == 2 &&  item.getTime() <= 0) {
				return true;
			}
		}
		return false;
	}

	public getMinBoxTime(){
		let list = Box.ins().freeInfoList;
		let time = Number.MAX_VALUE;
		for (let box of list) {
			if (box && box.getTime() < time) {
				time = box.getTime();
			}
		}
		let openList: BoxOpenData[] = Box.ins().arrOpenData;
		for (let item of openList) {
			if (item.itemId > 0 && item.state == 2 && item.getTime() < time) {
				time = item.getTime();
			}
		}

		return time;
	}
}
