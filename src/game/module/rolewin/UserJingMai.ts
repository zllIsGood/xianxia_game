class UserJingMai extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.JingMai;
		this.regNetMsg(1, this.doUpData);
		this.regNetMsg(4, this.doBigUpLevel);
	}

	public static ins(): UserJingMai {
		return super.ins() as UserJingMai;
	}

	public sendBoost(roleId: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(roleId);
		this.sendToServer(bytes);
	}

	public sendUpgrade(roleId: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleId);
		this.sendToServer(bytes);
	}

	private doUpData(bytes: GameByteArray): void {
		let index:number = bytes.readShort();
		SubRoles.ins().getSubRoleByIndex(index).jingMaiData.parser(bytes);
		this.postUpdate();
	}

	public postUpdate(): void {

	}

	public sendBigUpLevel(role: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(role);
		this.sendToServer(bytes);
	}

	public doBigUpLevel(bytes: GameByteArray): void {
		let result: number = bytes.readInt();
		let str: string;
		if (!result) {
			let type: number = bytes.readInt();
			if (!type)
				str = "使用成功，经脉等阶+1";
		}
		else {
			str = "道具不足够";
		}
		if (str)
			UserTips.ins().showTips(str);
	}

	/** 
	 * 是否可以提升经脉
	 */
	public canGradeupJingMai(): boolean[] {
		let boolList: boolean[] = [false, false, false];
		
		let config: JingMaiLevelConfig;
		let costNum: number = 0;
		let itemNum: number = 0;
		let len:number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			config = GlobalConfig.JingMaiLevelConfig[role.jingMaiData.level];
			costNum = config.count;
			if (costNum) {
				//直升丹
				let num: number = UserBag.ins().getItemCountById(0, 200103);
				if(num){
					boolList[i] = true;
					break;
				}
				itemNum = UserBag.ins().getItemCountById(0, config.itemId);
				boolList[i] = (itemNum >= costNum);
			} else {
				boolList[i] = false;
			}
		}
		return boolList;
	}
}

namespace GameSystem {
	export let  userJingMai = UserJingMai.ins.bind(UserJingMai);
}