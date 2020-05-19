class Box extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.Box;
		this.regNetMsg(1, this.updateBoxData);
		this.regNetMsg(2, this.getBox);
		this.regNetMsg(3, this.updateTipsList);
		this.regNetMsg(5, this.getBoxNotice);
		this.regNetMsg(6, this.doShowRewardInfo);
		this.arrTips = [];
	}

	public static ins(): Box {
		return super.ins() as Box;
	}

	public arrOpenData: BoxOpenData[] = [];
	public freeInfoList: BoxFreeData[] = [];
	public arrTips: BoxTipsData[];

	public postUpdateData() {

	}

	public postUpdateFreeBox() {

	}

	public getGridInfoById(id: number): BoxOpenData {
		for (let i: number = 0; i < this.arrOpenData.length; i++) {
			if (this.arrOpenData[i].pos == id) {
				return this.arrOpenData[i];
			}
		}
		return null;
	}

	public isHaveFreePos(): boolean {
		let num: number = 0;
		for (let i: number = 0; i < this.arrOpenData.length; i++) {
			if (this.arrOpenData[i].state == 2 && this.arrOpenData[i].getTime() > 0) {
				++num;
			}
		}
		let freeNum: number = UserVip.ins().lv >= GlobalConfig.TreasureBoxBaseConfig.thirdOpenLevel ? 2 : 1;
		return freeNum > num;
	}

	public updateBoxQueue() {

	}

	public canAdd(): boolean {
		for (let i = 1; i < 4; i++) {
			if (this.arrOpenData[i].canUsed && this.arrOpenData[i].itemId == 0)
				return true;
		}
		return false;
	}

	public getAddIndex(): number {
		for (let i = 1; i < 4; i++) {
			if (this.arrOpenData[i].canUsed && this.arrOpenData[i].itemId == 0)
				return i;
		}
		return 0;
	}

	/**
	 * 52-1
	 * 更新宝箱信息
	 */
	public updateBoxData(bytes: GameByteArray) {
		let len = bytes.readShort();
		this.arrOpenData = [];
		for (let i = 0; i < len; i++) {
			let data: BoxOpenData = new BoxOpenData();
			data.updateData(bytes);
			this.arrOpenData.push(data);
		}
		len = bytes.readShort();
		this.freeInfoList = [];
		for (let i = 0; i < len; i++) {
			let data: BoxFreeData = new BoxFreeData();
			data.updateData(bytes);
			this.freeInfoList.push(data);
		}
		TimerManager.ins().removeAll(this);
		// TimerManager.ins().doTimer(60000, 0, () => {
		// 	this.postUpdateData();
		// }, this);
		this.postUpdateData();
	}

	/**
	 * 52-2
	 * 请求打开宝箱
	 */
	public sendOpen(index: number) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 52-2
	 * 获得宝箱
	 */
	public getBox(bytes: GameByteArray) {
		UserTips.ins().showBoxTips(bytes.readShort());
	}

	/**
	 * 52-3
	 * 请求加入队列
	 */
	public sendAddToQueue(id) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	/**
	 * 52-3
	 */
	public updateTipsList(bytes: GameByteArray) {
		let len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			let data = new BoxTipsData();
			data.id = bytes.readShort();
			data.name = bytes.readString();
			this.arrTips.push(data);
		}
		this.postUpdateData();
	}

	/**
	 * 52-4
	 * 领取免费宝箱
	 */
	public sendOpenFreeBox(index: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 52-5
	 * 获取箱子的提示
	 */
	private getBoxNotice(bytes: GameByteArray): void {
		UserTips.ins().showRewardBox(bytes.readShort());
	}

	/**
	 * 52-6
	 * 奖励展示
	 */
	private doShowRewardInfo(bytes: GameByteArray): void {
		let type: number = bytes.readShort();
		let len: number = bytes.readShort();
		let rewardList: RewardData[] = [];
		for (let i: number = 0; i < len; i++) {
			let item: RewardData = new RewardData();
			item.parser(bytes);
			rewardList.push(item);
		}
		ViewManager.ins().open(BoxOpenWin, type, rewardList);
	}
}
namespace GameSystem {
	export let  box = Box.ins.bind(Box);
}