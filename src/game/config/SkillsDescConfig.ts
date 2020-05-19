/**
 * Created by Administrator on 2017/6/27.
 */
interface SkillsDescConfig {
	name: string;
	desc: string;
	cd: number;
	effectId: number;
	actionType: string;
	wordEff: string;
	castRange: number;
	minRange: number;
	sound:string;
	/** 对怪物伤害减少比例 */
	herdMonRate: number;
	/** 对玩家伤害减少比例 */
	herdPlayerRate:number;
}