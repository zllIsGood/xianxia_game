class UserMiji extends BaseSystem {
	public static ZsLv: number = 1;
	public static BAGOPEN: number = 5;//背包打开的标志
	//格子数
	public grid: number;
	//秘术技能id
	public miji: MijiData[][];

	public constructor() {
		super();

		this.sysId = PackageID.Miji;
		this.regNetMsg(1, this.postMijiData);
		this.regNetMsg(2, this.postMijiUpDate);
		this.regNetMsg(3, this.postMijiChange);
		this.regNetMsg(6, this.postMijiLockInfo);
	}

	public static ins(): UserMiji {
		return super.ins() as UserMiji;
	}

	/**
	 * 处理秘术数据
	 * 35-1
	 * @param bytes
	 */
	public postMijiData(bytes: GameByteArray): void {
		this.grid = bytes.readShort();
		let count: number = SubRoles.ins().subRolesLen;
		this.miji = [];
		for (let i = 0; i < count; i++) {
			this.miji[i] = [];
			for (let j = 0; j < this.grid; j++) {
				let mijiData = new MijiData();
				mijiData.id = bytes.readInt();
				mijiData.isLocked = bytes.readInt();
				this.miji[i][j] = mijiData;
			}
		}
	}

	/**
	 * 发送学习秘术
	 * 35-2
	 * @param jid 角色id
	 * @param mid 秘术id
	 */
	public sendMijiLearn(roleID: number, skillID: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleID);
		bytes.writeInt(skillID);
		this.sendToServer(bytes);
	}

	/**
	 * 更新秘术数据
	 * 35-2
	 * @param bytes
	 */
	public postMijiUpDate(bytes: GameByteArray): number[] {
		let roleID: number = bytes.readShort();
		let index: number = bytes.readShort() - 1;
		let id: number = bytes.readInt();
		let isSuss: number = bytes.readByte();
		let oldID: number = this.miji[roleID][index].id;
		this.miji[roleID][index].id = id;
		return [index, id, oldID, isSuss];
	}

	/**
	 * 发送秘术置换
	 * 35-3
	 * @param mid 秘术id
	 */
	public sendMijiChange(id1: number, id2: number, id3: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(id1);
		bytes.writeInt(id2);
		bytes.writeInt(id3);
		this.sendToServer(bytes);
	}

	/**
	 * 发送秘术需求
	 * 35-4
	 * @param mid 秘术id
	 */
	public sendMijiwancheng(roleID: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleID);
		this.sendToServer(bytes);
	}

	/**
	 * 发送秘籍加锁
	 * 35-5
	 * @param roleID 角色id
	 * @param mijiID 秘籍id
	 */
	public sendMijiAddLock(roleID: number, mijiID: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(roleID);
		bytes.writeInt(mijiID);
		this.sendToServer(bytes);
	}

	/**
	 * 发送秘籍解锁
	 * 35-6
	 * @param roleID 角色id
	 * @param mijiID 秘籍id
	 */
	public sendMijiDelLock(roleID: number, mijiID: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(roleID);
		bytes.writeInt(mijiID);
		this.sendToServer(bytes);
	}

	/**
	* 获取技能链表（某个角色）
	* @param roleID    角色ID
	*/
	private getSkillListOfRole(roleID: number): MijiData[] {
		return (this.miji && this.miji[roleID]) ? this.miji[roleID] : null;
	}
	/**
	* 获取秘术数据
	* @param roleID    角色ID
	* @param skillID   技能ID
	*/
	public getMijiData(roleID: number, skillID: number): number {
		let list = this.getSkillListOfRole(roleID);
		return (list && list[skillID]) ? list[skillID].id : null;
	}

	/**
	* 是否有指定的技能（某个角色）
	* @param roleID        角色ID
	* @param skillID       技能ID
	*/
	public hasSpecificSkillOfRole(roleID: number, skillID: number): boolean {
		let skillList: MijiData[] = this.getSkillListOfRole(roleID);
		if (skillList != null) {
			for (let skill of skillList) {
				if (skill.id == skillID) {
					return true;
				}
			}
		}

		return false;
		}

	/**
	* 是否有新技能（某个角色）
	* @param roleID
	*/
	public hasNewSkillOfRole(roleID: number): boolean {
		let result: boolean = false;

		let skillList: MijiData[] = this.getSkillListOfRole(roleID);
		if (skillList != null) {
			skillList.every(obj => {
				if (obj.id > 0) {
					result = true;
					return false;
				}
				return true;
			});
		}

		return result;
	}

	public postMijiChange(bytes: GameByteArray): number {
		let itemID: number = bytes.readInt();
		return itemID;
	}

	/** 加解锁结果
	 * 35-6
	 */
	public postMijiLockInfo(bytes: GameByteArray): void {
		let arr = this.miji[bytes.readInt()];
		let mijiid = bytes.readInt();
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id == mijiid) {
				let dd = bytes.readInt();
				arr[i].isLocked = dd;//bytes.readInt();
				break;
			}
		}
	}

	public getPowerByRole(index: number): number {
		let power: number = 0;
		let mijiArr: MijiData[] = this.miji[index];
		for (let i: number = 0; i < mijiArr.length; i++) {
			if (mijiArr[i].id)
				power += GlobalConfig.MiJiSkillConfig[mijiArr[i].id].power;
		}
		return power;
	}
	//秘术选择
	public postSelectedMiji(itemNumber: number, name: string): any[] {
		return [itemNumber, name];
	}

	//背包使用秘籍
	public postBagUseMiji(itemId) {
		return itemId;
	}

	public hasEquipMiji(itemId, index: number = 0): boolean {
		let numList: MijiData[] = this.miji[index];
		if (!numList) return false;
		for (let j = 0; j < numList.length; j++) {
			if (numList[j] && numList[j].id != 0) {
				let cfg: MiJiSkillConfig = GlobalConfig.MiJiSkillConfig[numList[j].id];
				if (cfg.item == itemId) {//身上已经穿戴中
					return true;
				}
			}
		}
		return false;
	}

	//秘术是否有可镶嵌
	public isMjiSum() {
		/**
		 * 新红点判定
		 * 开启秘术后 拥有秘术 未镶嵌过
		 * 镶嵌过一次就再也不显示红点
		 * */
		if (UserZs.ins().lv < UserMiji.ZsLv)
			return false;
		if (!this.miji) return false;
		let arr: ItemData[] = UserBag.ins().getItemByType(2);
		let have: boolean = arr.length > 0 ? true : false;
		if (!have)//未拥有
			return false;
		//是否镶嵌过
		let setting = Setting.ins();
		let mijiRedPoint: number = setting.getValue(ClientSet.mijiRedPoint);
		if (mijiRedPoint)
			return false;

		//防止老号出现已经穿戴的情况
		let len = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let numList: MijiData[] = this.miji[i];
			for (let j = 0; j < numList.length; j++) {
				if (numList[j].id) {
					let cfg: MiJiSkillConfig = GlobalConfig.MiJiSkillConfig[numList[j].id];
					for (let k = 0; k < arr.length; k++) {
						if (cfg.item == arr[k]._configID) {//身上已经穿戴中
							Setting.ins().setValue(ClientSet.mijiRedPoint, 1);
							return false;
						}
					}
				}
			}
		}
		return true;


		/**旧红点判定*/
		// if(!this.miji)return false;
		// let arr: ItemData[] = UserBag.ins().getBagGoodsByType(2);
		// let have:boolean = arr.length>0?true:false;
		// if( !have )
		// 	return false;
		// let len = SubRoles.ins().subRolesLen;
		// for( let i=0;i<len;i++ ){
		// 	let numList:number[] = this.miji[i];
		// 	for( let j=0;j<numList.length;j++ ){
		// 		if( numList[j] == 0 )
		// 			return true;//有空位就返回可镶嵌
		// 	}
		// }
		//
		// return false;
	}
}

namespace GameSystem {
	export let  userMiji = UserMiji.ins.bind(UserMiji);
}