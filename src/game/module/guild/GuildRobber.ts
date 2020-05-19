/**
 * 仙盟强盗数据
 */
class GuildRobber extends BaseSystem {

	public robberNum: number = 0;//强盗波数
	public robberTotal: number = 0;//强盗总数
	public robberDealNum: number = 0;//强盗被击杀数
	private _robberList: RobberStartInfo[] = [];//强盗状态列表

	public robberChanllge: number = 0;//已经挑战的次数

	public isUpdateRobber: boolean = false;//是否请求了仙盟强盗更新

	public constructor() {
		super();

		this.sysId = PackageID.GuildRobber;
		this.regNetMsg(1, this.doGuildRobberInfo);
		this.regNetMsg(2, this.doGuildRobberStarts);
		this.regNetMsg(3, this.doGuildRobberSX);
		this.regNetMsg(4, this.doGuildRobberChangller);
	}

	public static ins(): GuildRobber {
		return super.ins() as GuildRobber;
	}

	/**强盗状态列表 RobberStartInfo*/
	public getRobberList(index: number = -1): any {
		return index == -1 ? this._robberList : this._robberList[index];
	}

	/** 仙盟强盗信息 */
	private doGuildRobberInfo(bytes: GameByteArray): void {
		this.robberNum = bytes.readByte();
		if (this.robberNum > 0) {
			this.robberTotal = bytes.readByte();
			this.robberDealNum = bytes.readByte();
			this._robberList = [];
			for (let i: number = 0; i < this.robberTotal; i++) {
				let info: RobberStartInfo = new RobberStartInfo();
				info.robberStart = bytes.readByte();
				info.robberType = bytes.readByte();
				this._robberList.push(info);
			}
		}
		this.postGuildRobberInfo();
	}

	public postGuildRobberInfo() {

	}

	/** 仙盟强盗状态改变 */
	private doGuildRobberStarts(bytes: GameByteArray): void {
		let index: number = bytes.readByte();
		if (this._robberList.length > 0) {
			let info: RobberStartInfo = this._robberList[index - 1];
			info.robberStart = bytes.readByte();
		}
		this.robberDealNum = bytes.readByte();
		this.postGuildRobberInfo();
	}

	/** 仙盟强盗刷新 */
	private doGuildRobberSX(bytes: GameByteArray): void {
		this.robberNum = bytes.readByte();
		if (ViewManager.ins().getView(GuildMap)) {
			this.sendRobberInfo();
		}
		else
			this.isUpdateRobber = true;
	}

	/** 仙盟强盗挑战次数 */
	private doGuildRobberChangller(bytes: GameByteArray): void {
		this.robberChanllge = bytes.readByte();
	}

	/** 请求强盗信息*/
	public sendRobberInfo(): void {
		this.sendBaseProto(1);
	}

	/** 请求强盗挑战*/
	public sendRobberChanger(num: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(num);
		this.sendToServer(bytes);
	}

	/**是否有按钮可点 */
	public hasbtn(): boolean {
		return this.robberTotal > 0 &&
			(this.robberTotal > this.robberDealNum)
			// && (GlobalConfig.robberfbconfig.challengeMax - this.robberChanllge > 0);
	}
}

namespace GameSystem {
	export let  guildrobber = GuildRobber.ins.bind(GuildRobber);
}