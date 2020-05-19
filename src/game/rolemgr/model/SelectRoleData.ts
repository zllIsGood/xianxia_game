class SelectRoleData {
	public id: number;
	public name: string;
	public level: number;
	public zsLevel: number;
	public vipLevel: number;
	public power: number;
	public roleClass: number;
	public sex: number;

	public constructor(bytes: GameByteArray) {
		this.id = bytes.readInt();
		this.name = bytes.readString();
		this.roleClass = bytes.readInt();
		this.zsLevel = bytes.readInt();
		this.level = bytes.readInt();
		this.power = bytes.readDouble();
		this.vipLevel = bytes.readInt();
		this.sex = bytes.readInt();
		this.sex = this.roleClass == JobConst.ZhanShi ? 0 : 1;
	}
}