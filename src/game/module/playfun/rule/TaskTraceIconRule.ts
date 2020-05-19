/**
 * Created by Administrator on 2016/7/21.
 */
class TaskTraceIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserTask.ins().postUpdteTaskTrace,
			Actor.ins().postLevelChange
		];
	}

	private currentEff: string = "";
	// private lastTaskType:number;
	// private lastTaskId:number;

	checkShowIcon(): boolean {
		let b = UserTask.ins().getTaskState() && !UserFb.ins().pkGqboss;
		// if (b && this.lastTaskType == 79) {
		// 	let data: AchievementData = UserTask.ins().taskTrace;
		// 	if (data.state == 1 || data.id != this.lastTaskId) {
		// 		this.lastTaskType = -1;
		// 		this.lastTaskId = -1;
		// 	} else {
		// 		b = false;
		// 	}
		// }
		return b;
	}

	getEffName(redPointNum: number): string {
		let eff: string;
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data) {
			switch (data.state) {
				case 0:
					eff = "achieveCom";
					this.effX = 130;
					this.effY = 25;
					break;
				case 1:
					eff = "GWOpenEff";
					this.effX = 140;
					this.effY = 25;
					break;
			}
		}
		if (this.currentEff != eff) {
			let playPunView: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
			if (playPunView.ruleEff[this.tar.hashCode]) {
				DisplayUtils.removeFromParent(playPunView.ruleEff[this.tar.hashCode]);
				playPunView.ruleEff[this.tar.hashCode] = null;
			}
		}
		this.currentEff = eff;
		return eff;
	}

	tapExecute(): void {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data.state == 0) {
			GameGuider.taskGuidance(data.id, 1);
			GuideUtils.ins().updateByClick();

			// let config = UserTask.ins().getAchieveConfById(data.id);
			// if (config.control == GuideType.ChallengeBoss && UserFb.ins().pkGqboss) {
			// 	this.lastTaskType = config.type;
			// 	this.lastTaskId = data.id;
			// }

		} else {
			UserTask.ins().sendGetAchieve(data.achievementId);
			UserTask.ins().postParabolicItem();
			Hint.ins().postAchievementAft(data);
			if (!UserTask.ins().getAchieveConfById(data.id + 1)) {
				UserTips.ins().showTips("已完成所有任务!");
			}
			// let view:PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
			// view.hejiRule.updatekStep(true);


		}
		this.update();
	}
}