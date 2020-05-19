/**
 * Created by wangzhong on 2016/7/20.
 */
class BossIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserFb.ins().postGqIdChange,
			UserBoss.ins().postWorldBoss,
			UserTask.ins().postUpdteTaskTrace,
			UserBoss.ins().postWorldNotice,
			ZsBoss.ins().postBossOpen,
			ZsBoss.ins().postBossList,
			UserBoss.ins().postBossData
		];
	}

	public static OpenTaskIndex = 41;

	checkShowIcon(): boolean {

		return UserBoss.ins().checkBossIconShow();
	}

	checkShowRedPoint(): number {
		if (UserFb.isCanChallenge()
		|| UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_QMBOSS) 
		|| UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_WORLDBOSS)
		|| UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_HOMEBOSS)
		|| UserBoss.ins().checkWorldBossRedPoint(UserBoss.BOSS_SUBTYPE_SHENYU)
		|| PlayFun.ins().newBossRelive)
			return 1;

		return 0;
	}


	tapExecute(): void {
		ViewManager.ins().open(BossWin);
		UserBoss.ins().postBossData(false);
	}
}