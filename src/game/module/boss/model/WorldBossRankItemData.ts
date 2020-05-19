class WorldBossRankItemData {

	/** 玩家id */
	id: number;
	/** 名字 */
	roleName: string;
	/** 伤害 */
	value: number;

	rank: number;

	parser(bytes: GameByteArray) {
		this.id = bytes.readInt();
		this.roleName = bytes.readString();
		this.value = bytes.readDouble();
	}

	parser1(bytes: GameByteArray) {
		this.roleName = bytes.readString();
		this.value = bytes.readInt();
	}

	get name(): string {

		let str: string = `${this.roleName}:${CommonUtils.overLength(this.value)}`;
		// let len: number = StringUtils.strByteLen(str);
		// str = StringUtils.complementByChar(``, 27 - len) + str;
		return str;
	}
}