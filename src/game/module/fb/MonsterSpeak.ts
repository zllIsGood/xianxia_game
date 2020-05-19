/**
 * Created by hrz on 2017/8/4.
 *
 * 怪物触发场景说话
 */

enum SpeakType {
	appear = 1, //怪物出现时候触发
	hit = 2,  //第一次受到攻击时候触发
	die = 3   //怪物死亡触发
}

class MonsterSpeak extends BaseSystem {
	private speakDic: Map<Map<number>>;

	static ins(): MonsterSpeak {
		return super.ins() as MonsterSpeak;
	}

	public constructor() {
		super();
		this.speakDic = {};

		this.observe(GameLogic.ins().postHpChange, ([target, value]: [CharMonster, number]) => {
			if (target instanceof CharRole) return;

			this.trigger(target.infoModel.configID, value > 0 ? SpeakType.hit : SpeakType.die);
		});
	}

	public clear() {
		this.speakDic = {};
	}

	public trigger(monsterID, action: SpeakType) {
		if (this.speakDic[monsterID] && this.speakDic[monsterID][action]) {
			return;
		}
		if (!GlobalConfig['MonsterSpeakConfig']) return;
		let config = GlobalConfig['MonsterSpeakConfig'][monsterID];
		if (config && config[action]) {
			this.postMonsterSpeak(config[action].speak);

			this.speakDic[monsterID] = this.speakDic[monsterID] || {};
			this.speakDic[monsterID][action] = 1;
		}
	}

	public postMonsterSpeak(tips: string) {
		return tips;
	}

}

namespace GameSystem {
	export let  monsterSpeak = MonsterSpeak.ins.bind(MonsterSpeak);
}