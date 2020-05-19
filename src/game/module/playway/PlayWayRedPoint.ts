/**
 * Created by hrz on 2018/3/30.
 */

class PlayWayRedPoint extends BaseSystem {
	battleRed: boolean = false;
	millionRed: boolean = false;
	paodianRed: boolean = false;

	redPoint: boolean = false;

	constructor() {
		super();

		this.associated(this.postRedPoint,
			this.postBattleRed,
			this.postMillonRed,
			this.postPaodianRed
		);

		this.associated(this.postBattleRed,
			BattleCC.ins().postOpenInfo,
			Actor.ins().postLevelChange
		);

		this.associated(this.postPaodianRed,
			PaoDianCC.ins().postOpenInfo,
			Actor.ins().postLevelChange
		);

		this.associated(this.postMillonRed,
			Millionaire.ins().postMillionaireInfo,
			Millionaire.ins().postTurnDice,
			Millionaire.ins().postRoundReward,
			Millionaire.ins().postMillionaireUpdate,
		);
	}

	static ins(): PlayWayRedPoint {
		return super.ins() as PlayWayRedPoint;
	}

	postRedPoint() {
		let old = this.redPoint;
		this.redPoint = this.battleRed || this.millionRed || this.paodianRed;
		return old != this.redPoint;
	}

	postBattleRed() {
		let old = this.battleRed;
		this.battleRed = BattleCC.ins().checkRedPoint();
		return old != this.battleRed;
	}

	postMillonRed() {
		let old = this.millionRed;
		this.millionRed = Millionaire.ins().getRedPoint();
		return old != this.millionRed;
	}

	postPaodianRed() {
		let old = this.paodianRed;
		this.paodianRed = PaoDianCC.ins().checkRedPoint();
		return old != this.paodianRed;
	}

}

namespace GameSystem {
	export let  playwayredpoint = PlayWayRedPoint.ins.bind(PlayWayRedPoint);
}