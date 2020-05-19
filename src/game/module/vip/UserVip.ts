/**VIP管理类*/
class UserVip extends BaseSystem {

	public lv: number;	  //等级
	public exp: number;	 //经验
	/** 领取状态 （按位表示 0000101表示1级和3级的已领取）*/
	public state: number;
	public weekState: number = 0;  //0不可领取，1可以领取
	// public vipGiftState: number = 0; /** 领取状态 （按位表示 0000101表示1级和3级的已领取）*/
	public vipGiftState: { id: number, state: number }[] = [];
	public superVip: number[]; //超级会员数据
	public superVipData: { enabled: boolean, data: { qq: number } };//超级会员数据 enabled释放激活会员 data超级会员平台数据
	public constructor() {
		super();

		this.sysId = PackageID.Vip;
		this.regNetMsg(1, this.postUpdateVipData);
		this.regNetMsg(2, this.postUpdataExp);
		this.regNetMsg(3, this.postUpdateVipAwards);
		this.regNetMsg(4, this.postUpdateWeekAwards);
		this.regNetMsg(5, this.postVipGiftBuy);
		this.regNetMsg(6, this.postSuperVipInfo);
	}

	public static ins(): UserVip {
		return super.ins() as UserVip;
	}

	protected initLogin() {
		//从php平台获取超级会员信息  是否开启
		let superVipData: { enabled: boolean, data: { qq: number } } = window['getVipInfo']();
		if (superVipData) {
			this.superVipData = superVipData;
			this.postSuperVipData(this.superVipData);
		}
	}

	public postSuperVipData(data) {
		return data;
	}

	/**豪华vip 至尊vip */
	public get LvStr(): string {
		return UserVip.formatLvStr(this.lv);
	}

	/**豪华vip 至尊vip */
	public static formatLvStr(lv: number): string {
		// let t = lv > 3 ? "至尊" : "豪华"
		// let l = lv > 3 ? lv - 3 : lv;
		// return t + "VIP" + l;
		return "VIP" + lv;
	}

	/**豪华vip 至尊vip */
	public static formatBmpLv(lv: number): string {
		// let t = lv > 3 ? "至" : "豪"
		// let l = lv > 3 ? lv - 3 : lv;
		// return t + "v" + l;
		return "v" + lv;
	}

	/**
 	* 领取VIP奖励
	 * @param lv
	 */
	public sendGetAwards(lv: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeInt(lv);
		this.sendToServer(bytes);
	}

	/**
 	* 领取VIP周奖励
	 *
	 * @param lv
	 */
	public sendGetWeekAwards(): void {
		this.sendBaseProto(4);
	}

	/**
	 * 领取VIP礼包奖励
	 * 19-5
	 * @param id
	 */
	public sendGetVipGift(id): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeByte(id);
		this.sendToServer(bytes);
	}

	/**
	 * 19-6 获取超级vip数据
	 */
	public sendGetSuperVipInfo() {
		this.sendBaseProto(6);
	}

	/**更新VIP数据 */
	public postUpdateVipData(bytes: GameByteArray): void {
		this.lv = bytes.readShort();
		this.exp = bytes.readInt();
		this.state = bytes.readInt();
		this.weekState = bytes.readShort();
		// this.vipGiftState = bytes.readUnsignedInt();
		let len = bytes.readShort();
		this.vipGiftState = [];
		for (let i = 0; i < len; i++) {
			let id = bytes.readUnsignedInt();
			let state = bytes.readByte();
			let vipGift: { id: number, state: number } = {id: id, state: state};
			this.vipGiftState.push(vipGift);
		}
	}

	/**更新经验 */
	public postUpdataExp(bytes: GameByteArray): void {
		let lv: number = bytes.readShort();
		this.exp = bytes.readInt();
		this.weekState = bytes.readShort();
		if (lv > this.lv) {
			this.lv = lv;
		}
	}

	/**更新领取奖励状态 */
	public postUpdateVipAwards(bytes: GameByteArray): void {
		this.state = bytes.readInt();
	}

	/**更新领取奖励状态 */
	public postUpdateWeekAwards(bytes: GameByteArray): void {
		let boo = bytes.readBoolean();
		if (boo) {
			this.weekState = 0;
		}
	}

	/**
	 * vip礼包购买
	 * 19-5
	 */
	public postVipGiftBuy(bytes: GameByteArray) {
		// this.vipGiftState = bytes.readInt();
		let len = bytes.readShort();
		for (let j = 0; j < len; j++) {
			let id = bytes.readUnsignedInt();
			let state = bytes.readByte();
			for (let i = 0; i < this.vipGiftState.length; i++) {
				if (id == this.vipGiftState[i].id) {
					this.vipGiftState[i].state = state;
				}
			}
		}
	}

	/**
	 * 19-6 超级会员信息
	 * @param bytes
	 */
	public postSuperVipInfo(bytes: GameByteArray) {
		this.superVip = this.superVip || [];
		let len = 2;
		for (let i = 0; i < len; i++) {
			this.superVip[i] = Math.floor(bytes.readInt() / 100);//元宝转化RMB
		}
	}

	//是否是超级会员
	public getSuperVipState(): boolean {
		if (this.superVip) {
			for (let id in GlobalConfig.SuperVipConfig) {
				let config = GlobalConfig.SuperVipConfig[id];
				let i = +id - 1;
				if (config.money <= (this.superVip[i] || 0)) {
					return true;
				}
			}
		}
		return false;
	}

	/**获取奖励状态 */
	public getVipState(): boolean {
		let bool: boolean = false;
		for (let i: number = 0; i < this.lv; i++) {
			if (this.state != undefined && ((this.state >> i) & 1) == 0) {
				bool = true;
				return bool;
			}
		}
		// if (this.weekState) return true;
		return bool;
	}

	//是否可以显示VIP奖励领取
	public getVipGiftCanBuy(id) {
		let config = GlobalConfig.VipGiftConfig[id];
		if (config.cond) {
			for (let i of config.cond) {
				// if (((this.vipGiftState >> (+i)) & 1) == 0) {
				// 	return false;
				// }
				if ((this.vipGiftState[(+i) - 1].state & 1) == 0) {
					return false;
				}
			}
		}
		return true;
	}

	public getVipGiftIsBuy(id) {
		// return ((this.vipGiftState >> id) & 1) == 1;
		return (this.vipGiftState[id - 1].state & 1) == 1;
	}

	public getVipGiftRedPoint(id) {
		let config = GlobalConfig.VipGiftConfig[id];
		if (this.lv >= config.vipLv) {
			return this.getVipGiftCanBuy(id) && !this.getVipGiftIsBuy(id) && config.needYb <= Actor.yb;
		}
		return false;
	}

	//统计有几个合服VIP配置
	public getVipPage() {
		let maxVipPage = [];
		for (let k in GlobalConfig.VipGiftConfig) {
			let hfTimes = GlobalConfig.VipGiftConfig[k].hfTimes;
			hfTimes = hfTimes ? hfTimes : 0;
			if (GameServer._hefuCount >= hfTimes && maxVipPage.indexOf(hfTimes) == -1) {
				maxVipPage.push(hfTimes);//合服次数
			}

		}
		return maxVipPage;
	}

	public getVipIndex(pageIndex: number) {
		for (let k in GlobalConfig.VipGiftConfig) {
			let hfTimes = GlobalConfig.VipGiftConfig[k].hfTimes;
			hfTimes = hfTimes ? hfTimes : 0;
			if (hfTimes == pageIndex)
				return GlobalConfig.VipGiftConfig[k]
		}
		return null
	}

	/**
	 * 检测是否买完了
	 * */
	public checkVipSuccess(hfcount: number) {
		let b = true;
		for (let k in GlobalConfig.VipGiftConfig) {
			let hfTimes = GlobalConfig.VipGiftConfig[k].hfTimes;
			hfTimes = hfTimes ? hfTimes : 0;
			if (hfTimes == hfcount) {
				let id = GlobalConfig.VipGiftConfig[k].id;
				if (!this.getVipGiftIsBuy(id)) {
					b = false;
					break;
				}
			}
		}
		return b;
	}

}

namespace GameSystem {
	export let  userVip = UserVip.ins.bind(UserVip);
}
