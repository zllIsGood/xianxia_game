class skillConst {
	public static baseSkillIndex: number[] = [11, 21, 31];
}

enum SkillEffNumType {
	Single,
	All,
	NoEff,
	SelfAndTarget,
}
enum castType {
	Friend = 1,
	Other,
	Self,
	SelfHpLess,
}