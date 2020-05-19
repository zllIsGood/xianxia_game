/**
 * 剑灵
 */
class Weapons extends BaseSystem {

	public constructor() {
		super();
		this.sysId = PackageID.Weapons;
        //
		this.regNetMsg(0, this.postWeaponsInfo);
		this.regNetMsg(1, this.postWeaponsUpLevel);
		this.regNetMsg(2, this.postWeaponsAct);
		this.regNetMsg(3, this.postWeaponsUse);
		this.regNetMsg(4, this.postWeaponsFlexibleAct);
		this.regNetMsg(5, this.postWeaponsFlexibleCount);
	}

	public static ins(): Weapons {
		return super.ins() as Weapons;
	}
	/** 剑灵分页红点 **/
	public checkRedPoint(roleId:number):boolean{
		//检测当前是否开启
		if(!OpenSystem.ins().checkSysOpen(SystemType.WEAPONS)){
			return false;
		}

		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		//套装检测
		for( let k in GlobalConfig.WeaponSoulConfig ) {
			let wsconfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[k];
			if( role.weapons.getRedPointBySuit(wsconfig.id) )
				return true;
		}

		//已拥有的角色中 每个角色拥有的兵魂是否其中一个未激活兵魂之灵
		let fb = ForgeRedPoint.ins().getFlexibleRedPoint(roleId);
		if (fb)
			return true;

		let item: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WeaponSoulBaseConfig.itemid);
		if (item && role.weapons.flexibleCount - 1 < GlobalConfig.WeaponSoulBaseConfig.maxItemNum)
			return true;


		return false;
	}

	/**
	 * 判断某个角色某个兵魂是否激活了兵魂之灵
	 * @param roleId
	 * @param id 兵魂id
	 * @return boolean
	 * */
	public checkIsUseFlexible(roleId: number, id: number): boolean {
		// for( let i = 0; i < SubRoles.ins().subRolesLen;i++ ){
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		if (role.weapons.getFlexibleData().indexOf(id) != -1) {
			return true;
		}
		// }
		return false;
	}

	//客户端请求服务器处理
	//============================================================================================
	/**
	 * 请求激活\升级\突破部位
	 * 角色id
	 * 部位id
	 * 56-1
	 * */
	public sendWeaponsUpLevel(roleId: number, slot: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeByte(roleId);
		bytes.writeByte(slot);
		this.sendToServer(bytes);
	}
	/**
	 * 请求激活剑灵
	 * 角色id
	 * 剑灵id
	 * 56-2
	 * */
	public sendWeaponsAct(roleId: number, weaponId: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(roleId);
		bytes.writeByte(weaponId);
		this.sendToServer(bytes);
	}
	/**
	 * 请求使用剑灵
	 * 角色id
	 * 剑灵ID,发0取消使用剑灵
	 * 56-3
	 * */
	public sendWeaponsUse(roleId: number, weaponId: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(roleId);
		bytes.writeByte(weaponId);
		this.sendToServer(bytes);
	}

	/**
	 * 请求激活兵魂之灵兵魂
	 * 角色id
	 * 操作类型 1:激活 2:取消
	 * 兵魂ID
	 * 56-4
	 * */
	public sendWeaponsFlexibleAct(roleId: number, control: number, weaponId: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(roleId);
		bytes.writeByte(control);
		bytes.writeShort(weaponId);
		this.sendToServer(bytes);
	}

	/**
	 * 请求激活兵魂之灵
	 * 角色id
	 * 56-5
	 * */
	public sendWeaponsFlexibleCount(roleId: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeByte(roleId);
		this.sendToServer(bytes);
	}
	//服务器数据下发处理
	//============================================================================================
	/**
	 * 下发剑灵
	 * 角色id
	 * 部位数据长度
	 * 部位数据
	 * 剑灵激活数据长度
	 * 剑灵激活数据
	 * 56-0
	 * */
	public postWeaponsInfo(bytes: GameByteArray):void{
		let roleId:number = bytes.readUnsignedByte();
		let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
		role.weapons.parser(bytes);
	}
	/**
	 * 返回激活升级突破部位信息
	 * 角色id
	 * 部位配置id
	 * 等级
	 * 56-1
	 * */
	public postWeaponsUpLevel(bytes: GameByteArray):void{
		let roleId:number = bytes.readUnsignedByte();
		let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
		role.weapons.parserInfoOnly(bytes);
	}
	/**
	 * 返回激活剑灵信息
	 * 角色id
	 * 剑灵配置ID
	 * 56-2
	 * */
	public postWeaponsAct(bytes: GameByteArray):void{
		let roleId:number = bytes.readUnsignedByte();
		let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
		role.weapons.parserSoulInfoOnly(bytes,roleId);
	}
	/**
	 * 返回剑灵使用信息
	 * 角色id
	 * 剑灵配置ID
	 * 56-3
	 * */
	public postWeaponsUse(bytes: GameByteArray):void{
		let roleId:number = bytes.readUnsignedByte();
		let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
		role.weapons.weaponsId = bytes.readShort();//当前使用的剑灵

		let mainRole: CharRole = EntityManager.ins().getEntityByHandle(role.handle);
		if(mainRole) mainRole.updateModel();
		//同步剑灵相关
	}

	/**
	 * 返回激活兵魂之灵兵魂
	 * 角色id
	 * 兵魂ID
	 * 56-4
	 * */
	public postWeaponsFlexibleAct(bytes: GameByteArray) {
		let roleId: number = bytes.readUnsignedByte();
		let control: number = bytes.readUnsignedByte();
		let id: number = bytes.readShort();//兵魂ID
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let weapons: number[] = role.weapons.getFlexibleData();
		if (control == WeaponFlex.act) {
			if (weapons.indexOf(id) == -1)
				weapons.push(id);
		} else {
			for (let i = 0; i < weapons.length; i++) {
				if (weapons[i] == id) {
					weapons.splice(i, 1);
					break;
				}
			}
		}
	}

	/**
	 * 下发兵魂之灵基础信息
	 * 使用兵魂之灵个数
	 * 56-5
	 * */
	public postWeaponsFlexibleCount(bytes: GameByteArray) {
		let roleId = bytes.readByte();
		let flexibleCount = bytes.readShort();
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		if (role) {
			//有使用次数+1 为了方便激活兵魂之灵的对比运算 因为这是额外次数 兵魂第一件激活和取消次数不算在内
			role.weapons.flexibleCount = flexibleCount ? (flexibleCount + 1) : 0;
		}
	}

	// /**name 56-x*/
	// public send(): void {
	// 	this.sendBaseProto(x);
	// }

	
}

//兵魂之灵操作
enum WeaponFlex {
	act = 0,
	cancel = 1
}

namespace GameSystem {
	export let  weapons = Weapons.ins.bind(Weapons);
}