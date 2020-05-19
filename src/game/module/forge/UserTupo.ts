class UserTupo extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.Tupo;
		this.regNetMsg(2, this.postForgeUpdata);
	}

	public static ins(): UserTupo {
		return super.ins() as UserTupo;
	}

	public postForgeUpdata(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		let model: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		model.parseForgeChange(bytes, this.sysId);
		UserForge.ins().postForgeUpdate(this.sysId);
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
	export let  usertupo = UserTupo.ins.bind(UserTupo);
}