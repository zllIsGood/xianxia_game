/**
 * Created by Peach.T on 2017/12/26.
 */
class GuardCopyInfo {
	wave: number;
	score: number;
	callBossNum: number;
	monsterNum: number;
	minMonsterWave: number;
	minMonsteNums: number;

	constructor() {
		this.wave = 0;
		this.score = 0;
		this.callBossNum = 0;
		this.monsterNum = 0;
		this.minMonsterWave = 0;
		this.minMonsteNums = 0;
	}

	parser(wave: number, score: number, callBossNum: number, monsterNum: number, minMonsterWave: number, minMonsteNums: number) {
		this.wave = wave;
		this.score = score;
		this.callBossNum = callBossNum;
		this.monsterNum = monsterNum;
		this.minMonsterWave = minMonsterWave;
		this.minMonsteNums = minMonsteNums;
	}
}
