/**
 * Created by hrz on 2017/10/25.
 */
interface GWSkillReviseConfig {
    targetEff: number[];
	gwIndex: number;
    skill: number;
	desc: string;
    d: number;
    a: number;
    b: number;
    selfEff: number[];
    args: {vals:number[],type:number}[];
    critDamage: number;
	affectCount: number;
    crit: number;
    cd: number;
}