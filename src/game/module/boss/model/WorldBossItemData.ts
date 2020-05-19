class WorldBossItemData {
	/** BOSSid */
	id: number = 0;
	/** 名字 */
	roleName: string = "";
	/** 伤害 */
	guildName: string = "";
	/** 复活时间 */
	relieveTime: number = 0;
	/** boss状态 */
	bossState: number = 0;

	/** 血量百分比 */
	public hp: number = 0;
	/** 挑战中的人数 */
	public people: number = 0;
	/** 是否挑战中 */
	public challengeing: number = 0;

	parser(bytes: GameByteArray) {
		this.id = bytes.readInt();
		this.roleName = bytes.readString();
		this.guildName = bytes.readString();
		let rTime: number = bytes.readInt();
		this.relieveTime = rTime * 1000 + egret.getTimer();
		this.bossState = bytes.readShort();
		this.hp = bytes.readByte();
		this.people = bytes.readShort();
		this.challengeing = bytes.readByte();
	}

	/** 是否死亡 */
	get isDie(): boolean {
		return (this.relieveTime - egret.getTimer()) / 1000 > 0;
	}

	get canInto():boolean {
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.id];
		let zsLevel = config.zsLevel;
		if(typeof zsLevel == "number") {
			if (zsLevel > 0) {
				return UserZs.ins().lv >= zsLevel;
			}
			else {
				return Actor.level >= zsLevel;
			}
		} else {
			let arr = zsLevel as number[];
			if(arr.length > 1) {
				return (UserZs.ins().lv >= arr[0] && UserZs.ins().lv <= arr[1]);
			} else {
				console.log(`WorldBossConfig配置错误！ ${arr}`);
			}
		}
	}

	/** 是否能挑战 */
	get canChallenge(): boolean {
		return !this.isDie && this.canInto;
	}
}