/**
 * 符文
 */
class Rune extends BaseSystem {
	public static UNGET  = 0;//不可领取
	public static CANGET = 1;//可领取
	public static ISNGET = 2;//已领取
	public static BoxSum = 5;//宝箱数


	public boxs:number[];//箱子领取状态 rune 50-8
	public runeCount:number;//积累次数 rune 50-8
	public hope:number;//当前祝福值
	public constructor() {
		super();
		this.sysId = PackageID.Rune;

		this.regNetMsg(1, this.doInlay);
		this.regNetMsg(2, this.doUpgrade);
		this.regNetMsg(3, this.doOneKeyDecompose);
		this.regNetMsg(5, this.postHuntRuneInfo);
		this.regNetMsg(6, this.postBestListInfo);
		this.regNetMsg(8, this.postRuneBoxGift);

		this.boxs = [];
	}

	public static ins(): Rune {
		return super.ins() as Rune;
	}

	/**
	 * 请求镶嵌
	 * 50-1
	 * @param  {number} role
	 * @param  {number} pos
	 * @param  {number} runeid
	 * @returns void
	 */
	public sendInlay(role: number, pos: number, runeid: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(role);
		bytes.writeShort(pos);
		bytes.writeDouble(runeid);
		this.sendToServer(bytes);
	}

	/**
	 * 处理镶嵌
	 * 49-1
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public doInlay(bytes: GameByteArray): void {
		let isSuccess: boolean = Boolean(bytes.readShort());
		let roleID: number = 0;
		let pos: number = 0;
		let id: number = 0;
		if (isSuccess) {
			roleID = bytes.readShort();
			pos = bytes.readShort();
			id = bytes.readInt();
		}

		this.postInlayResult([isSuccess, roleID, pos, id]);
	}

	public postInlayResult(param: any[]): any[] {
		return param;
	}

	/**
	 * 请求升级
	 * 50-2
	 * @param  {number} role
	 * @param  {number} pos
	 * @returns void
	 */
	public sendUpgrade(role: number, pos: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(role);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 处理升级
	 * 50-2
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public doUpgrade(bytes: GameByteArray): void {
		let isSuccess: boolean = Boolean(bytes.readByte());
		if(isSuccess){
			let roleID: number = bytes.readShort();
			let pos: number = bytes.readShort();
			let id: number = bytes.readInt();

			RuneDataMgr.ins().replaceRune(roleID, pos, id);

			this.postUpgradeResult([isSuccess, roleID, id, pos]);
		}
	}

	public postUpgradeResult(param: any[]): any[] {
		return param;
	}

	/**
	 * 请求一键分解
	 * 50-3
	 * @param  {number[]} uidList
	 * @returns void
	 */
	public sendOneKeyDecompose(uidList: ItemData[]): void {
		let len: number = uidList.length;

		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(len);
		for (let i: number = 0; i < len; i++) {
			bytes.writeInt(uidList[i].configID);
		}
		this.sendToServer(bytes);
	}

	/**
	 * 处理一键分解
	 * 50-3
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public doOneKeyDecompose(bytes: GameByteArray): void {
		let isSuccess: boolean = Boolean(bytes.readByte());
		let normalNum: number = bytes.readInt();

		this.postOneKeyDecomposeResult([isSuccess, normalNum]);
	}

	public postOneKeyDecomposeResult(param: any[]): any[] {
		return param;
	}

	/**
	 * 请求一键分解
	 * 50-4
	 * @param  {number[]} id
	 * @returns void
	 */
	public sendExchangeRune(id: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeUnsignedInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 发送寻宝
	 * 50-5
	 * @param type    探宝类型
	 */
	public sendHuntRune(type) {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	public postHuntRuneInfo(bytes: GameByteArray): void {
		let type = bytes.readUnsignedByte();
		let num = bytes.readUnsignedByte();
		let arr = [];
		for (let i = 0; i < num; i++) {
			arr[i] = [bytes.readInt(), bytes.readUnsignedByte()];
		}

		if (ViewManager.ins().getView(HuntResultWin)) {
			Hunt.ins().postHuntResult(type, arr, 1);
		} else {
			ViewManager.ins().open(HuntResultWin, type, arr, 1);
		}
	}

	public postBestListInfo(bytes: GameByteArray): any[] {
		let num = bytes.readUnsignedByte();
		let arr = [];
		for (let i = 0; i < num; i++) {
			arr[i] = [bytes.readString(), bytes.readInt()];
		}
		arr.reverse();
		return arr;
	}

	/**
	 * 发送探宝次数领奖
	 * 50-7
	 */
	public sendRuneBoxGift(id: number) {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}
	/**
	 * 符文抽奖累计奖励信息
	 * 50-8
	 */
	public RuneRewards:number;
	public postRuneBoxGift(bytes: GameByteArray) {
		this.RuneRewards = bytes.readInt();
		this.runeCount = bytes.readInt();
		this.hope = bytes.readInt();
		let idx:number = 0;
		for( let k in GlobalConfig.FuwenTreasureRewardConfig ){
			let config:FuwenTreasureRewardConfig = GlobalConfig.FuwenTreasureRewardConfig[k];
			this.boxs[idx] = ((this.RuneRewards >> config.id) & 1)?Rune.ISNGET:(this.runeCount >= config.needTime?Rune.CANGET:Rune.UNGET);
			idx++;
		}

	}
	/**是否有可领取宝箱*/
	public getIsGetBox(){
		for( let i= 0;i < Rune.BoxSum;i++ ){
			switch (Rune.ins().boxs[i]){
				case Rune.UNGET:
					break;
				case Rune.CANGET:
					return true;
				case Rune.ISNGET:
					break;
			}
		}
		return false;
	}
}

namespace GameSystem {
	export let  rune = Rune.ins.bind(Rune);
}
