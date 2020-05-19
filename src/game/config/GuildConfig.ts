class GuildConfig {
	/** 开启等级 */
	openLevel: number;
	/** 不同仙盟等级人数的上限 */
	maxMember: number[];
	/** 练功房等级对应的普通技能的等级上限 */
	commonSkillLevels: number[];
	/** 练功房等级对应的修炼技能的等级上限 */
	practiceSkillLevels: number[];
	/**建筑物说明 */
	buildingTips: string[];
	/**普通技能名 */
	commonSkillNames: string[];
	/**修炼技能名 */
	practiceSkillNames: string[];
	/**普通技能描述 */
	skillDesc:string[];
	/**建筑名 */
	buildingNames:string[];
	/**弹劾消耗的元宝数 */
	impeachCost:number;
	/**盟主多久没上线可以弹劾(秒) */
	impeachTime:number;
	/**不同仙盟等级各个职位的人数上限 这里顺序是从盟主到精英*/
	posCounts:number[][];

	//神树消耗道具
	bonfireItem:number;
	//神树帮贡奖励
	bonfireReward:RewardData[];
	//每次增加神树值
	bonfireValue:number;
	//神树红点提示限制
	bonfirecaution:number;
	//超限制时单词消耗神树数量
	bonfirecount:number;
}
