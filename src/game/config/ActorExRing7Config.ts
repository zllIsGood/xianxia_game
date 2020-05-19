/**
 * 烈焰戒指数据结构
 * Created by Peach.T on 2017/11/1.
 */
class ActorExRing7Config {
	public level: number = 0;
	public costItem: number = 0;
	public cost: number = 0;
	public upPower: number = 0;
	public addPower: number = 0;
	public bjRate: number = 0;
	public bjAddPower: number = 0;
	public attrAward: {type: number,value: number}[] = [];
	public extAttrAward: {type: number,value: number}[] = [];
	public judgeup: number = 0;
	/** 技能名字 **/
	public SpecialRingSkin: string = "";
	public summonerSkillId: number = 0;
	public summonerAttr: {type: number,value: number}[] = [];
	public freeSkillGrid: number;
	public tollSkillGrid: number;
}