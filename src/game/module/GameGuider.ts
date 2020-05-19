/**
 * 游戏引导
 */
class GameGuider {

	private static tempMainRole: CharRole;

	private static taskEffect: TaskEffectView;
	/**
	 * 任务相关引导
	 * @param id  任务id
	 * @param taskType  任务类型  0 每日任务 1成就任务或任务追踪
	 */
	public static taskGuidance(id: number, taskType: number): void {

		let config: DailyConfig | AchievementTaskConfig;
		switch (taskType) {
			case 0:
				config = GlobalConfig.DailyConfig[id];
				break;
			case 1:
				config = UserTask.ins().getAchieveConfById(id);
				Hint.ins().postAchievementBef(config);
				break;

		}

		switch (config.control) {
			case GuideType.OpenWin:
				if (id == 100082 && String(config.controlTarget[0]) == "LimitTaskView") {
					if (UserTask.ins().limitTaskEndTime > 0 
					&& UserTask.ins().limitTaskState != 0 
					&& UserTask.ins().limitTaskEndTime > 0
					&& (UserTask.ins().limitTaskEndTime - Math.floor(GameServer.serverTime / 1000) > 0)
					) {
						GameGuider.guidance(config.controlTarget[0], config.controlTarget[1]);
					} else {
						GameGuider.guidance("RoleWin", 1);
					}
				} else {
					GameGuider.guidance(config.controlTarget[0], config.controlTarget[1]);
				}
				break;
			case GuideType.ChallengeBoss:
				this.challengeBoss();
				if (taskType == 1) {
					let cfg = config as AchievementTaskConfig;
					Hint.ins().postKillBoss(cfg);
				}
				break;

			case GuideType.ArtifactGuide:
				Artifact.ins().setGuide();
				break;

			case GuideType.AtkMonster:
				RoleAI.ins().stop();
				let index = config.controlTarget[0];
				let x = UserFb.ins().rPos[index][0].x * GameMap.CELL_SIZE;
				let y = UserFb.ins().rPos[index][0].y * GameMap.CELL_SIZE;
				this.tempMainRole = EntityManager.ins().getNoDieRole();
				GameMap.moveEntity(this.tempMainRole, x, y);

				TimerManager.ins().doTimer(500, 0, this.guideFun, this);
				break;
			case GuideType.AutoPk:
				UserFb.ins().setAutoPk();
				break;
			case GuideType.KillDeer:
				// UserTips.ins().showTips("正在刷怪中");
				break;
			case GuideType.GuideFb:
				if(Encounter.ins().isEncounter()) {
					UserTips.ins().showTips("|C:0xf3311e&T:正在挑战附近的人|");
					return;
				}
				if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
					ViewManager.ins().open(BagFullTipsWin);
					return;
				}
				UserFb.ins().sendIntoGuideFb(config.controlTarget[1]);
				break;
		}
	}

	private static guideFun(): void {
		if (this.tempMainRole.action == EntityAction.STAND) {
			RoleAI.ins().start();

			TimerManager.ins().remove(this.guideFun, this);
		}
	}

	/**
	 * 引导
	 * @param winName 此处为了兼容旧代码,今后将改为string类型
	 * @param page 打开的页面,默认为-1表示没有参数;
	 */
	public static guidance(...param: any[]): void {//winName: any, page: number = -1
		let tparam: number = param[1] != -1 ? param[1] : null;
		ViewManager.ins().open(param[0], tparam, param[2]);
	}

	public static challengeBoss(func?:any) {
		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
			ViewManager.ins().open(BagFullTipsWin);
			return;
		}
		if ( UserFb.ins().currentEnergy >= UserFb.ins().energy) {
			if( func && typeof( func ) == "function" )
				func();
			UserFb.ins().autoPk();
		} else {
			// UserTips.ins().showTips("|C:0xf3311e&T:能量不足|");
		}
	}

	public static startTaskEffect() {
		if (!this.taskEffect) {
			this.taskEffect = new TaskEffectView();
		}
		this.taskEffect.start();
	}

	public static stopTaskEffect() {
		if (this.taskEffect) {
			this.taskEffect.stop();
		}
	}
}
enum GuideType {
	OpenWin = 1, // 打开界面
	ChallengeBoss = 2, // 点击闯关按钮
	ArtifactGuide = 3, // 神器按钮出现光圈
	AtkMonster = 4, // 寻路到当前关卡指定怪物组第1个坐标
	AutoPk = 5, // 指向闯关按钮
	KillDeer = 6, // 提示正在刷怪
	GuideFb = 7,//进入引导副本
	FindNpc = 8, // 找NPC
	FindTransPoint = 9, // 
	Collection = 10, // 采集
}