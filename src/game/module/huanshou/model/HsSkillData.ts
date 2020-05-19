class HsSkillData {
	public pos: number;
	/**技能书id */
	public skillId: number = 0;
	public skillLv: number = 0;
	//public isOpen: boolean = false;
	public openRank: number = 0;
	public constructor() {
	}

	public updateSkill(bytes: GameByteArray): void {
		//this.pos = bytes.readInt();
		this.skillId = bytes.readInt();
		this.skillLv = bytes.readInt();
	}

	public get isOpen(): boolean {
		return UserHuanShou.ins().rank >= this.openRank;
	}
}