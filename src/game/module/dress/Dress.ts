//时装类型
enum DressType {
	ROLE = 1,
	ARM = 2,
	WING = 3,
}
class Dress extends BaseSystem {
	public timeInfo: DressTimeInfo[] = [];//拥有的装扮数据
	public posInfo: DressPosInfo[] = [];//穿戴的装扮信息

	public constructor() {
		super();
		this.sysId = PackageID.Dress;
		this.regNetMsg(1, this.doDressInfo);//装扮返回信息
		this.regNetMsg(2, this.doDressActivationRes);//激活装扮返回信息
		this.regNetMsg(3, this.doDressUserRes);//使用装扮返回信息
		this.regNetMsg(4, this.doUnDressUserRes);//脱装扮返回信息
		this.regNetMsg(5, this.doDressTimeEnd);//装扮失效
	}

	/**
	 * 请求装扮信息
	 * 44-1
	 */
	public sendDressInfoReq(): void {
		this.sendBaseProto(1);
	}

	private doDressInfo(bytes: GameByteArray): void {
		this.parser(bytes);
		Dress.ins().postDressInfo();
	}

	/**
	 * 请求激活装扮
	 * 44-2
	 */
	public sendDressActivationReq(dressid: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(dressid);
		this.sendToServer(bytes);
	}

	private doDressActivationRes(bytes: GameByteArray): void {
		this.parserAct(bytes);
		Dress.ins().postJiHuo();
		UserTips.ins().showTips("|C:0xffffff&T:激活装扮形象成功|");
	}

	/**
	 * 请求穿戴
	 * 44-3
	 */
	public sendDressUserReq(roid: number, dressid: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(roid);
		bytes.writeInt(dressid);
		this.sendToServer(bytes);
	}

	private doDressUserRes(bytes: GameByteArray): void {
		this.parserDress(bytes);
		Dress.ins().postDressInfo();
		UserTips.ins().showTips("|C:0xffffff&T:幻化形象成功|");
	}

	/**
	 * 请求脱下
	 * 44-4
	 */
	public sendUnDressUserReq(roid: number, dressid: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(roid);
		bytes.writeInt(dressid);
		this.sendToServer(bytes);
	}

	private doUnDressUserRes(bytes: GameByteArray): void {
		this.parserDress(bytes);
		Dress.ins().postDressInfo();
		UserTips.ins().showTips("|C:0xffffff&T:取消幻化形象成功|");
	}

	private doDressTimeEnd(bytes: GameByteArray): void {
		this.parserDel(bytes);
		Dress.ins().postDressInfo();
	}

	//玩家装扮信息
	parser(bytes: GameByteArray): void {
		let num: number = bytes.readInt();
		this.timeInfo = [];
		for (let i: number = 0; i < num; i++) {
			let time: DressTimeInfo = new DressTimeInfo();
			time.dressId = bytes.readInt();
			time.invalidtime = bytes.readInt();
			this.timeInfo.push(time);
		}
		num = bytes.readByte();
		this.posInfo = [];
		for (let i = 0; i < num; i++) {
			let pos: DressPosInfo = new DressPosInfo();
			for (let k: number = 0; k < 4; k++) {
				pos.posAry[k] = bytes.readInt();
			}
			this.posInfo.push(pos);
		}
	}

	//激活装扮信息
	parserAct(bytes: GameByteArray): void {
		let info: DressTimeInfo = new DressTimeInfo();
		info.dressId = bytes.readInt();
		info.invalidtime = bytes.readInt();
		this.timeInfo.push(info);
	}

	//装扮更改返回
	public parserDress(bytes: GameByteArray): void {
		let index = bytes.readByte();
		let posinfo: DressPosInfo = this.posInfo[index];
		let pos: number = bytes.readByte();
		let item: number = bytes.readInt();
		if (posinfo) {
			posinfo.posAry[pos - 1] = item;
		}

		let role = SubRoles.ins().getSubRoleByIndex(index);
		role.zhuangbei[pos - 1] = item;
		if (pos == 1 || pos == 2)
			UserEquip.ins().postEquipChange();
		else
			Dress.ins().postChangeWing();

		let mainRole = EntityManager.ins().getEntityByHandle(role.handle);
		//换装备的时候可能子角色 已死亡
		if (mainRole)
			mainRole.updateModel();
	}

	//装扮时间到了
	public parserDel(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		for (let i: number = 0; i < this.timeInfo.length; i++) {
			let time: DressTimeInfo = this.timeInfo[i];
			if (time.dressId == id) {
				this.timeInfo.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.posInfo.length; i++) {
			let pos: DressPosInfo = this.posInfo[i];
			for (let k: number = 0; k < 4; k++) {
				if (pos.posAry[k] == id) {
					pos.posAry.splice(k, 1);
					let role = SubRoles.ins().getSubRoleByIndex(i);
					role.zhuangbei[k] = 0;
					if (k == 0 || k == 1)
						UserEquip.ins().postEquipChange();
					else
						Dress.ins().postChangeWing();
					let mainRole = EntityManager.ins().getEntityByHandle(role.handle);
					//换装备的时候可能子角色 已死亡
					if (mainRole)
						mainRole.updateModel();
					break;
				}
			}
		}
	}

	public getModelPosId(curRole: number): DressPosInfo {
		return this.posInfo[curRole];
	}

	//是否显示红点
	public redPoint(): boolean {
		return this.careerRedPoint();
	}

	//各个职业是否有可以激活的时装
	public careerRedPoint(): boolean {
		for (let i: number = 0; i < SubRoles.ins().subRolesLen; i++) {
			let career: number = SubRoles.ins().getSubRoleByIndex(i).job;
			let zhuangban: ZhuangBanId[] = this.getinfoByCareer(career);
			for (let element of zhuangban) {
				let id: number = element.cost["itemId"];
				let num: number = element.cost["num"];
				if (UserBag.ins().getItemCountById(0, id) >= num)
					if (element.pos == 3 && Actor.level <= 16)
						return false;
					else
						return true;
			}
		}
		return false;
	}

	// 某个职业是否有可以激活的时装
	public curRoleRedPoint(roleId: number): boolean {
		return this.roleRedPoint()[roleId];
	}

	public roleRedPoint(): boolean[] {
		let boolList: boolean[] = [false, false, false];
		let length: number = SubRoles.ins().subRolesLen
		for (let i: number = 0; i < length; i++) {
			let career: number = SubRoles.ins().getSubRoleByIndex(i).job;
			let zhuangban: ZhuangBanId[] = this.getinfoByCareer(career);
			for (let element of zhuangban) {
				let id: number = element.cost["itemId"];
				let num: number = element.cost["num"];
				if (UserBag.ins().getItemCountById(0, id) >= num) {
					if (element.pos == 3 && Actor.level <= 16)
						boolList[i] = false;
					else
						boolList[i] = true;
				}
			}
		}
		return boolList;
	}

	/**
	 * 获得是否可激活时装
	 * @job 职业
	 * @pos 时装类型
	 */
	public canDress(job: number, pos: DressType): boolean {
		if (pos == DressType.WING && Actor.level <= 16)
			return false;

		let userbag = UserBag.ins();
		let arrZB = this.getinfoByCareer(job);
		for (let k in arrZB) {
			if (arrZB[k].pos == pos) {
				let id: number = arrZB[k].cost["itemId"];
				let num: Number = arrZB[k].cost["num"];
				if (userbag.getItemCountById(0, id) >= num) {
					return true;
				}
			}
		}
		return false;
	}

	//部位有可以激活的时装
	public postRedPoint(career: number): boolean[] {
		let ret: boolean[] = [false, false, false];
		let zhuangban = this.getinfoByCareer(career);
		let userbag = UserBag.ins();
		zhuangban.forEach(element => {
			let id: number = element.cost["itemId"];
			let num: number = element.cost["num"];
			if (userbag.getItemCountById(0, id) >= num) {
				ret[element.pos - 1] = !(element.pos == 3 && Actor.level <= 16);
			}
		});
		return ret;
	}

	// private getinfoByCareer(career: number): ZhuangBanId[] {
	// 	let zhuangban: ZhuangBanId[] = [];
	// 	let confList = GlobalConfig.ZhuangBanId;
	// 	for (let conf of confList) {
	// 		if (conf.roletype == career) {
	// 			let flag: boolean = false;
	// 			for (let time of this.timeInfo) {
	// 				if (time.dressId == conf.id) {
	// 					flag = true;
	// 					break;
	// 				}
	// 			}
	// 			if (!flag) zhuangban.push(conf);
	// 		}

	// 	}
	// 	return zhuangban;
	// }

	private getinfoByCareer(career: number): ZhuangBanId[] {
		let zhuangban: ZhuangBanId[] = [];
		if (!this.timeInfo) return zhuangban;
		let ZBConfig = GlobalConfig.ZhuangBanId
		for (let k in ZBConfig) {
			if (ZBConfig[k].roletype == career) {
				let isjihuo: boolean = false;
				let length: number = this.timeInfo.length
				for (let i: number = 0; i < length; i++) {
					if (this.timeInfo[i].dressId == ZBConfig[k].id)
						isjihuo = true;
				}
				if (isjihuo == false)
					zhuangban.push(ZBConfig[k]);
			}
		}
		return zhuangban;
	}

	///////////////////////////////////////////////////派发消息/////////////////////////////////////////////////////
	/*派发时装变更信息*/
	public postDressInfo(): void {
	}

	/*派发时装激活*/
	public postJiHuo(): void {
	}

	/*派发翅膀改变*/
	public postChangeWing(): void {
	}

}
namespace GameSystem {
	export let  dress = Dress.ins.bind(Dress);
}