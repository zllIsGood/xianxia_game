class TaskAlertWin extends BaseEuiView {
	public taskName: eui.Label;
	public taskInfo: eui.Label;
	public taskAwards: eui.Label;
	public timeText: eui.Label;

	public gotoBtn: eui.Button;
	public arrowGroup: eui.Group;

	public rewardList: eui.List;

	private CLOSE_TIME: number = 40;
	private timeCount: number = 0;
	constructor() {
		super();
		this.skinName = "TaskSkin";
	}

	public initUI(): void {
		super.initUI();
		this.rewardList.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.gotoBtn, this.onClick);
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().removeAll(this);
		this.removeTouchEvent(this.gotoBtn, this.onClick);
		egret.Tween.removeTweens(this.arrowGroup);
	}

	private setView(): void {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data) {
			let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			if (config) {
				this.rewardList.dataProvider = new eui.ArrayCollection(config.awardList);
				if (config.type == 79) {
					this.taskInfo.textFlow = TextFlowMaker.generateTextFlow(config.longdesc);
				} else {
					this.taskInfo.textFlow = TextFlowMaker.generateTextFlow(config.longdesc);
				}
			}

			this.taskName.textFlow = TextFlowMaker.generateTextFlow(config.name + "|C:0xf3311e&T: (" + data.value + "/" + config.target + ")|");
			switch (data.state) {
				case 0:
					this.gotoBtn.label = "前  往";
					break;
				case 1:
					this.gotoBtn.label = "领  取";
					break;
			}
		}

		let t: egret.Tween = egret.Tween.get(this.arrowGroup, { "loop": true });
		t.to({ y: this.arrowGroup.y - 10 }, 400).to({ y: this.arrowGroup.y + 10 }, 400);
		TimerManager.ins().remove(this.onTimeCount, this);
		this.timeCount = this.CLOSE_TIME;
		TimerManager.ins().doTimer(1000, this.timeCount, this.onTimeCount, this);
		this.timeText.text = `${this.timeCount}秒后自动提交`;
	}

	private onTimeCount(): void {
		this.timeCount--;
		this.timeText.text = `${this.timeCount}秒后自动提交`;
		if (this.timeCount == 0) {
			TimerManager.ins().remove(this.onTimeCount, this);
			this.doTask();
		}
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.gotoBtn:
				this.doTask();
				break;
		}
	}

	private doTask(): void {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data.state == 0) {
			GameGuider.taskGuidance(data.id, 1);
			GuideUtils.ins().updateByClick();
		} else {
			UserTask.ins().sendGetAchieve(data.achievementId);
			UserTask.ins().postParabolicItem();
			Hint.ins().postAchievementAft(data);
			if (!UserTask.ins().getAchieveConfById(data.id + 1)) {
				UserTips.ins().showTips("已完成所有任务!");
			}
		}
		ViewManager.ins().close(TaskAlertWin);
	}
}
ViewManager.ins().reg(TaskAlertWin, LayerManager.Game_Main);