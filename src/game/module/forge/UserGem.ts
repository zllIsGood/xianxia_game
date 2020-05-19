class UserGem extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.Gem;
		this.regNetMsg(2, this.postForgeUpdata);
	}

	public static ins(): UserGem {
		return super.ins() as UserGem;
	}

	public static ROLL_NUM:number = 8;

	public postForgeUpdata(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		let model: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let index:number = model.parseForgeChange(bytes, this.sysId);
		UserForge.ins().postForgeUpdate(this.sysId,index);
	}

	/**
	 * 提升请求
	 * @param roleId 角色
	 * @param pos 部位
	 */
	public sendUpGrade(roleId: number, pos: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleId);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}
}
namespace GameSystem {
	export let  usergem = UserGem.ins.bind(UserGem);
}