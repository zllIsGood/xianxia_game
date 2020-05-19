/**天仙天赋 (每个天仙天赋的等级数据)*/
class ZhanLingTalent {
	public id:number;//天赋编号
	public level:number;//等级
	public costCount:number;//开启消耗数量(消耗的是ZhanLingBase表的mat材料)
	public effId:number;//外显效果
	public rate:number;//外显效果触发万分比
	public passive:{type:number,id:number}[];//被动技能 type 0 所有角色 type 1 战士 type 2 法师 type 3 道士   id为buffID
	public expower:number;//额外战力(皮肤编号非0的用)
	public talentDesc:{name:string,desc:string,icon?:string};//天仙天赋描述
	public attrs:AttributeData[];
	public showWords:string;//技能飘字，buff效果的调用
}