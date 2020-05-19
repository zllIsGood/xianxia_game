class FlySwordSkillData {
	public id: number;
	public level: number;
	public state: FlySwordSkillType;

	public constructor() {
	}

	public getData(): SkillData {
		return new SkillData(this.id);
	}
}

enum FlySwordSkillType {
	/** 未开启 */
	NotOpen,
	/** 准备开启 */
	ReadyOpen,
	/** 开启 */
	Open
}