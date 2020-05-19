class ImbaSkillReviseConfig {
	public id: number = 0;
	public skill: number = 0;		//技能组
	public imba_id: number = 0;		//神器ID
	public a: number = 0;           //伤害百分比系数
	public b: number = 0;			//伤害固定值系数
	public cd: number = 0;			//cd时间
	public d: number = 0;			//对怪物伤害增加%
	public crit: number = 0;		//增加暴击率
	public affectCount: number = 0;		//增加暴击率
	public selfEff: any = [];		//自身附加效果
	public targetEff: any = [];		//自身附加效果
	public args: any = {};				//参数列表
}