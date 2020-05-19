class LongHunData {
	public level: number = 0;
	public stage: number = 0;
	public exp: number = 0;
	public state: number = 0;
	constructor() {

	}

	parser(bytes: GameByteArray): void {
		this.stage = bytes.readInt();
		this.level = bytes.readInt();
		this.exp = bytes.readInt();
		this.state = bytes.readByte();
	}

	public static getLongHunAllLevel(){
		let sumlevel = 0;
		let len:number = SubRoles.ins().subRolesLen;
		for ( let i = 0;i < len;i++ ){
			let data:LongHunData = SubRoles.ins().getSubRoleByIndex(i).loongSoulData;
			sumlevel += data.level;
		}
		return sumlevel;
	}
}