class UserTask extends BaseSystem {

	/**活跃度 */
	public vitality: number = 0;
	/**每日任务 */
	public task: TaskData[] = [];
	/**活跃度奖励 */
	public vitalityAwards: VitalityData[] = [];
	/**成就任务 */
	public achiEvement: AchievementData[] = [];
	/**任务追踪 */
	public taskTrace: AchievementData = new AchievementData();

	/**唤醒任务数据 */
	public awakeData: any = {};
	/** 唤醒任务类型定义 */
	public static AWAKE_TASK_TYPE = { 
		WING:1,
		HUANSHOU:2,
		FLYSWORD:3,
		ZHANLING:4,
		RING:5,
	}; 

	public constructor() {
		super();

		this.sysId = PackageID.Task;
		this.regNetMsg(1, this.doTaskData); 	//日常数据同步
		this.regNetMsg(2, this.doTaskChangeData); 	//日常任务变量同步
		this.regNetMsg(3, this.doVitality); 	// 活跃度同步
		this.regNetMsg(4, this.doVitalityAwards); 	//活跃度奖励返回
		this.regNetMsg(5, this.doAchieveData); 	//成就任务数据同步
		this.regNetMsg(7, this.doJoinAchieveData); 	//接取成就任务
		this.regNetMsg(8, this.doAchieveChangeData); 	// 成就任务变量同步

		this.regNetMsg(9, this.doLimitDataChange); 	//下发限时任务初始化信息
		this.regNetMsg(10, this.doUpdateLimitData); 	//更新限时任务单项信息

		this.regNetMsg(12,this.post9012Event); //下发唤醒任务数据
		this.regNetMsg(13,this.post9013Event); //更新唤醒任务状态

		this.achiEvement = [];
	}

	public static ins(): UserTask {
		return super.ins() as UserTask;
	}

	/**
	 * 领取日常任务
	 * @param id
	 */
	public sendGetTask(id: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 领取活跃度奖励
	 * @param id
	 */
	public sendGetVitalityAwards(id: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 领取成就任务
	 * @param id
	 */
	public sendGetAchieve(id: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 任务数据同步
	 * @param bytes
	 */
	private doTaskData(bytes: GameByteArray): void {
		this.task = [];
		this.vitalityAwards = [];
		let count: number = bytes.readInt();
		for (let i = 0; i < count; i++) {
			let data: TaskData = new TaskData;
			data.id = bytes.readInt();
			data.value = bytes.readInt();
			data.state = bytes.readInt();
			this.task.push(data);
		}
		this.vitality = bytes.readInt();
		let awardsCount: number = bytes.readInt();
		for (let i = 0; i < awardsCount; i++) {
			let awardsData: VitalityData = new VitalityData;
			awardsData.id = bytes.readInt();
			awardsData.state = bytes.readInt();
			this.vitalityAwards.push(awardsData);
		}
		this.sortTask();
	}

	/**
	 * 更改任务数据
	 * @param bytes
	 */
	private doTaskChangeData(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let userTask = UserTask.ins();
		let data: TaskData = userTask.getTaskDataById(id);
		if (ErrorLog.Assert(data, "UserTask  doTaskChangeData id  = " + id)) {
			return;
		}
		data.value = bytes.readInt();
		data.state = bytes.readInt();
		userTask.sortTask();
		userTask.postTaskChangeData();
	}

	public postTaskChangeData() {

	}

	private doVitality(bytes: GameByteArray): void {
		this.vitality = bytes.readInt();
	}

	/**
	 * 更新活跃度奖励
	 * @param bytes
	 */
	private doVitalityAwards(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let data: VitalityData = this.getVitalityAwardsById(id);
		data.state = bytes.readInt();
		UserTask.ins().postTaskChangeData();
	}

	/**
	 * 成就数据同步
	 * @param bytes
	 */
	private doAchieveData(bytes: GameByteArray): void {
		this.achiEvement.length = 0;
		let count: number = bytes.readInt();
		for (let i: number = 0; i < count; i++) {
			let data: AchievementData = new AchievementData;
			data.achievementId = bytes.readInt();
			data.id = bytes.readInt();
			data.state = bytes.readInt();
			data.value = bytes.readInt();
			// debug.log(`初始任务成就数据(成就ID:${data.achievementId}, 任务ID:${data.id}, 任务状态:${data.state}, 任务当前变量${data.value})`);
			let cfg = this.getAchieveConfById(data.id);
			if (cfg == null) {
				debug.warn("无法获得成就配置:" + data.id + "，请检查配置");
			} else {
				data.achievementType = cfg.achievementType;
			}

			if (data.achievementId == 1000) {
				this.taskTrace = data;
				if (GameMap.fbType == UserFb.FB_TYPE_STORY && this.taskTrace.id != 100001) {
					this.checkTrace();
				}
				// if (this.taskTrace.id == 100003 && this.taskTrace.state == 0) {
				//Guider.ins().show(1, 1)
				// }
				UserTask.ins().postUpdteTaskTrace();
			} else {
				this.achiEvement.push(data);
			}

		}
		this.sortAchiEvement();
		this.postUpdateAchieve();
	}

	public onTask: boolean = false;
	/**检查成就任务 某些任务需要自己去行动*/
	@callLater
	public checkTrace(data: AchievementData = this.taskTrace) {
		let Tmgr = TimerManager.ins();
		!this.onTask && Tmgr.remove(this.checkNpcDis, this);
		if (data == void 0) return;
		let cfg = this.getAchieveConfById(data.id);
		if (cfg.control == GuideType.FindNpc && data.state == 0 && !this.onTask) {
			this.onTask = true;
			let [npcId] = cfg.controlTarget;
			let npc = EntityManager.ins().getNPCById(npcId);
			if (npc == void 0) return;
			npc.showTaskMc();
			Tmgr.doTimer(640, 1, () => {
				this.moveToNpc(npcId, -0.5, 0.5);
			}, this);
		} else if (cfg.control == GuideType.Collection && data.state == 0 && !this.onTask) { //采集
			this.onTask = true;
			let [npcId] = cfg.controlTarget;
			Tmgr.doTimer(640, 1, () => {
				this.moveToNpc(npcId)
			}, this);
		}

		if (cfg.control == GuideType.FindTransPoint && data.state == 0 && !this.onTask) {
			this.onTask = true;
			let [npcId] = cfg.controlTarget;
			Tmgr.doTimer(640, 1, () => {
				this.moveToNpc(npcId)
			}, this);
		} else if (data.state 
				&& (cfg.control == GuideType.KillDeer 
					|| cfg.control == GuideType.FindNpc 
					|| cfg.control == GuideType.Collection 
					|| cfg.control == GuideType.FindTransPoint)) {
			this.sendGetAchieve(data.achievementId);
			Hint.ins().postAchievementAft(data);
		}
	}

	public moveToNpc(npcId: number, rangeX: number = 0, rangeY: number = 0) {
		let npc = EntityManager.ins().getNPCById(npcId);
		if (npc == void 0) return;

		let role = EntityManager.ins().getNoDieRole();
		if (role == void 0) return;


		//点击npc 走到距离npc前一段距离
		let x = npc.x + rangeX * GameMap.CELL_SIZE;
		let y = npc.y + rangeY * GameMap.CELL_SIZE;

		GameMap.moveTo(x, y, false);
		let Tmgr = TimerManager.ins();
		Tmgr.doTimer(300, 0, this.checkNpcDis, this);
	}

	public checkNpcDis() {
		let data = this.taskTrace;
		if (data == void 0) return;
		let cfg = this.getAchieveConfById(data.id);
		if (cfg == void 0 || cfg.controlTarget == void 0) return;

		let em = EntityManager.ins();
		let [npcId] = cfg.controlTarget;
		let npc = em.getNPCById(npcId);
		if (npc == void 0) return;

		let role = em.getNoDieRole();
		if (role == void 0) return;

		let dis = MathUtils.getDistance(role.x, role.y, npc.x, npc.y);
		if (dis > GameMap.CELL_SIZE * 2) {
			if (role.action != EntityAction.RUN) {
				GameMap.moveTo(npc.x, npc.y, false);
			}
			return;
		}

		if (cfg.control == GuideType.FindNpc && data.state == 0) {
			ViewManager.ins().open(StoryQuestWin, data);
		} else if (cfg.control == GuideType.FindTransPoint && data.state == 0) {
			this.sendVisitNpc(npcId);
			UserFb.ins().sendGuideChangeMap();
		} else if (cfg.control == GuideType.Collection && data.state == 0) { // 采集
			debug.log(`采集${npcId}`);
			let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
			view.showCollectBar(cfg.controlTarget[1],cfg.controlTarget[2],function () {
				debug.log('采集完成');
				this.sendVisitNpc(npcId);
			},this);
		}

		let Tmgr = TimerManager.ins();
		Tmgr.remove(this.checkNpcDis, this);

		this.onTask = false;
	}

	public getTaskData(achievementId: number, taskId: number): AchievementData {
		let count: number = this.achiEvement.length;
		let data: AchievementData;
		for (let i: number = 0; i < count; i++) {
			let temp: AchievementData = this.achiEvement[i];
			if (temp.achievementId == achievementId && temp.id == taskId) {
				data = temp;
				break;
			}
		}
		return data;
	}

	public getTaskTarget(taskId: number): number {
		let target: number = 0;
		let cfg = this.getAchieveConfById(taskId);
		if (cfg) {
			target = cfg.target;
		}
		return target;
	}

	public postUpdateAchieve(): void {

	}

	public postUpdteTaskTrace(): void {

	}

	public postUpdteLimitTaskData(taskData?): any {
		return taskData;
	}

	public postLimitTaskEnd(): void {

	}

	private doJoinAchieveData(bytes: GameByteArray): void {
		this.changeAchieve(bytes);
	}

	private doAchieveChangeData(bytes: GameByteArray): void {
		this.changeAchieve(bytes);
	}

	public limitTaskList: LimitTaskData[] = [];
	public limitTaskDic: { [key: number]: LimitTaskData } = {};
	public limitTaskState: number = 0;

	public limitTaskCount: number = 0;

	public limitTaskEndTime: number = -1;
	public currTaskListsId: number = -1;

	private doLimitDataChange(bytes: GameByteArray): void {
		let state: number = bytes.readByte();
		this.limitTaskState = state;
		this.limitTaskCount = 0;
		if (state == 0) {
			this.currTaskListsId = bytes.readInt();
			this.initLimitTaskData(this.currTaskListsId);
		} else if (state == 1) {
			this.currTaskListsId = bytes.readInt();
			this.initLimitTaskData(this.currTaskListsId);
			this.limitTaskEndTime = bytes.readInt();

			let config = GlobalConfig.LimitTimeConfig[this.currTaskListsId];
			if (this.currTaskListsId == 1 && config.time == this.limitTaskEndTime) {
				//第一次触发
				ViewManager.ins().open(LimitStartTipsView);
			}

			this.limitTaskEndTime += Math.floor(GameServer.serverTime / 1000);
			let len: number = bytes.readShort();
			for (let i: number = 0; i < len; i++) {
				let id: number = bytes.readInt();
				let lt = this.limitTaskDic[id];
				if (Assert(lt, `UserTask doLimitDataChange cant Get task dic by id: ${id}`)) continue;
				lt.parser(bytes);
				if (lt.state == 2) this.limitTaskCount++;
			}
		}

		UserTask.ins().postUpdteLimitTaskData();
	}

	private initLimitTaskData(id: number): void {
		this.limitTaskList = [];
		this.limitTaskDic = {};
		let config = GlobalConfig.LimitTimeConfig[id];
		for (let k in config.taskIds) {
			let baseData = GlobalConfig.LimitTimeTaskConfig[config.taskIds[k]];
			if (Assert(baseData, `UserTask initLimitTaskData cant get LimitTimeTaskConfig by id: ${id}`)) continue;
			let item: LimitTaskData = new LimitTaskData();

			item.setBaseData(baseData);
			this.limitTaskList.push(item);
			this.limitTaskDic[item.id] = item;
		}
	}

	private doUpdateLimitData(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let item: LimitTaskData = this.limitTaskDic[id];
		if (!item) {
			debug.log("限时任务未初始化：" + id);
			return;
		}
		item.parser(bytes);
		if (item.state == 2) this.limitTaskCount++;
		UserTask.ins().postUpdteLimitTaskData(item);
		// let progress: number = bytes.readInt();
		// let state: number = bytes.readByte();
	}

	/**
	 * 请求限时任务数据
	 * @param bytes
	 */
	public sendGetLimitTask(): void {
		this.sendBaseProto(5);
	}

	/**
	 * 请求领取限时任务奖励
	 * @param bytes
	 */
	public sendGetLimitTaskReward(id: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}


	private lastState: number = -1;

	/**
	 * 更新成就数据
	 * @param bytes
	 */
	public changeAchieve(bytes: GameByteArray): void {
		let achievementId: number = bytes.readInt();
		let data: AchievementData;
		if (achievementId == 1000) {
			data = this.taskTrace;
		}

		else
			data = this.getAchieveDataById(achievementId);
		if (ErrorLog.Assert(data, "UserTask  data is null  achievementId = " + achievementId)) {
			return;
		}
		data.id = bytes.readInt();
		data.state = bytes.readInt();
		data.value = bytes.readInt();
		// data.achievementType = this.getAchieveConfById(data.id).achievementType;
		// debug.log(`任务成就数据更新(成就ID:${data.achievementId}, 任务ID:${data.id}, 任务状态:${data.state}, 任务当前变量${data.value})`);
		if (data.achievementId == 1000) {
			UserTask.ins().postUpdteTaskTrace();
			// let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			// if (config && config.longdesc != "" && this.lastState != data.state) {
			// ViewManager.ins().closeLastTopView();
			// 	ViewManager.ins().open(TaskAlertWin);
			// 	this.lastState = data.state;
			// }
		} else {
			this.sortAchiEvement();
			UserTask.ins().postTaskChangeData();
		}

		if (achievementId == 1000) {
			this.checkTrace();
		}

		// 完成指定任务后激活神器
		if (data.id == 100010 && data.state == 2) {
			UserSkill.ins().sendGrewUpHejiSkill();
		}

		// 检测新手特殊引导
		if (data.state == 2) {
			this.checkTaskSpecialGuide(data.id);
		}
	}

	/**通过成就类型获取成就数据 */
	public getChengjiuDataByType(type: number): AchievementData[] {
		if (this.achiEvement == undefined) {
			Log.trace("通过成就类型获取成就数据  achiEvement = null");
			return;
		}
		let reArr: AchievementData[] = [];
		for (let i: number = 0; i < this.achiEvement.length; i++) {
			if (this.achiEvement[i].achievementType == type)
				reArr.push(this.achiEvement[i]);
		}
		return this.sortAchievementAcByType(reArr);
	}

	/**整理指定的成就数据集*/
	public sortAchievementAcByType(reArr: AchievementData[]): AchievementData[] {
		if (reArr) {
			reArr.sort(function (a: AchievementData, b: AchievementData) {
				if (a.state == 2) return 1;
				if (b.state == 2) return -1;
				return b.state - a.state
			});
		}
		return reArr;
	}

	/**
	 * 通过成就id获取成就数据
	 * @param id
	 */
	public getAchieveDataById(id: number): AchievementData {
		if (this.achiEvement == undefined) {
			Log.trace("通过成就类型获取成就数据  achiEvement = null");
			return;
		}
		for (let i: number = 0; i < this.achiEvement.length; i++) {
			if (this.achiEvement[i].achievementId == id)
				return this.achiEvement[i]
		}
		return null;
	}

	/**
	 * 通过任务id获取成就数据
	 * @param id
	 */
	public getAchieveByTaskId(id: number): AchievementData {
		for (let i: number = 0; i < this.achiEvement.length; i++) {
			if (this.achiEvement[i].id == id)
				return this.achiEvement[i]
		}
		return null;
	}

	/**
	 * 通过奖励id获取奖励数据
	 * @param id
	 */
	public getVitalityAwardsById(id: number): VitalityData {
		for (let i: number = 0; i < this.vitalityAwards.length; i++) {
			if (this.vitalityAwards[i].id == id)
				return this.vitalityAwards[i]
		}
		return null;
	}

	/**
	 * 通过任务id获取任务数据
	 * @param id
	 */
	public getTaskDataById(id: number): TaskData {
		if (!this.task)
			return null;
		for (let i: number = 0; i < this.task.length; i++) {
			if (this.task[i].id == id)
				return this.task[i]
		}
		return null;
	}

	/**
	 * 通过任务id获取成就配置
	 * @param id
	 */
	public getAchieveConfById(id: number): AchievementTaskConfig {
		let list: AchievementTaskConfig[] = GlobalConfig.AchievementTaskConfig;
		let i: any;
		for (i in list) {
			let config: AchievementTaskConfig = list[i];
			if (config.taskId == id)
				return config;
		}
		return null;
	}

	/**
	 * 通过任务id获取奖励配置
	 * @param id
	 */
	public getAwardsConfigById(id: number): DailyAwardConfig {
		let list: DailyAwardConfig[] = GlobalConfig.DailyAwardConfig;
		let i: any;
		for (i in list) {
			let config: DailyAwardConfig = list[i];
			if (config.id == id)
				return config;
		}
		return null;
	}

	public getTaskStast(): void {
		if (this.task) {
			let i: number;
			let userTask = UserTask.ins();
			for (i = 0; i < this.task.length; i++) {
				if (this.task[i].state == 1) {
					userTask.postUpdataTaskPoint(true);
					return;
				}
			}
			for (i = 0; i < this.vitalityAwards.length; i++) {
				let config: DailyAwardConfig = this.getAwardsConfigById(this.vitalityAwards[i].id);
				if (this.vitality >= config.valueLimit && this.vitalityAwards[i].state == 0) {
					userTask.postUpdataTaskPoint(true);
					return;
				}
			}
			for (i = 0; i < this.achiEvement.length; i++) {
				if (this.achiEvement[i].state == 1) {
					userTask.postUpdataTaskPoint(true);
					return;
				}
			}
			userTask.postUpdataTaskPoint(false);
			return;
		}
	}

	public postUpdataTaskPoint(bo?: boolean) {
		return bo;
	}

	private sortTask(): void {
		if (this.task.length > 2) {
			this.task.sort(this.sort);
			let state1Task: TaskData[] = [];
			for (let i: number = 0; i < this.task.length; i++) {
				if (this.task[i].state != 0) {
					state1Task.push(this.task[i]);
					this.task.splice(i, 1);
					i--;
				}
			}
			if (state1Task.length > 0)
				this.task = this.task.concat(state1Task);
		}
	}

	private sort(a: TaskData, b: TaskData): number {
		let s1: number = a.id;
		let s2: number = b.id;
		if (s1 < s2)
			return -1;
		else if (s1 > s2)
			return 1;
		else
			return 0;
	}

	private sortAchiEvement(): void {
		for (let i: number = 0; i < this.achiEvement.length; i++) {
			let data: AchievementData = this.achiEvement[i];
			if (data.state == 1) {
				this.achiEvement.splice(i, 1);
				this.achiEvement.unshift(data);
			} else if (data.state == 2) {
				this.achiEvement.splice(i, 1);
				this.achiEvement.push(data);
			}
		}
	}

	/**是否开启了成就功能 */
	public getIsOpenChengjiu(): boolean {
		return Actor.level >= 7;
	}

	/**是否有成就奖励可领取 */
	public isAchieveReward(): boolean {
		if (!this.getIsOpenChengjiu()) return false;

		let maxTypeDatas: number[] = LiLian.ins().chengjiuMaxData();
		for (let type of maxTypeDatas) {
			let datas: AchievementData[] = this.getChengjiuDataByType(type);
			if (datas == undefined) {
				Log.trace("是否有成就奖励可领取 datas = null");
				return;
			}
			for (let d of datas) {
				if (d.state == 1) return true;
			}
		}

		return false;
	}

	/**根据指定类型是否有成就奖励可领取 */
	public isAchieveRewardBytype(type: number): boolean {
		let datas: AchievementData[] = this.getChengjiuDataByType(type);
		for (let d of datas) {
			if (d.state == 1) return true;
		}
		return false;
	}

	/**
	 * 获取主线人物状态
	 * return false:已做完        true：未做完
	 */
	public getTaskState(): boolean {
		let userTaks = UserTask.ins();
		let data: AchievementData = userTaks.taskTrace;
		if (data) {
			let config: AchievementTaskConfig = userTaks.getAchieveConfById(data.id);
			let nextConfig: AchievementTaskConfig = userTaks.getAchieveConfById(data.id + 1);
			if (!nextConfig && data.state == 2)
				return false;
			else
				return true;
		}
		return false;
	}


	public getLimitTaskRed(): number {
		let userTask = UserTask.ins();
		for (let i: number = 0; i < userTask.limitTaskList.length; i++) {
			if (userTask.limitTaskList[i].state == 1) {
				return 1;
			}
			// //第一二阶段任务如果没完成要一直有红点
			// let timeId:number = UserTask.ins().getLimitTimeId(UserTask.ins().limitTaskList[i].id);
			// if( timeId && (timeId == 1 || timeId == 2) ){
			// 	if( UserTask.ins().limitTaskList[i].state == 2 ){
			// 		continue;
			// 	}
			// 	return 1;
			// }else{
			// 	if (UserTask.ins().limitTaskList[i].state == 1) {
			// 		return 1;
			// 	}
			// }
		}
		return 0;
	}

	public postParabolicItem(): void {

	}

	/**通过限时任务id返回第几阶段*/
	public getLimitTimeId(id: number) {
		for (let k in GlobalConfig.LimitTimeConfig) {
			let cfg: LimitTimeConfig = GlobalConfig.LimitTimeConfig[k];
			if (cfg.taskIds.indexOf(id) != -1) {
				return cfg.id;
			}
		}
		return 0;
	}

	/**
	 * 请求领取限时任务奖励
	 * @param bytes
	 * 9-11
	 */
	public sendVisitNpc(id: number): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/*
		下发唤醒任务数据
		9-12
		int 当前任务组id
		short 子任务数量
		array 子任务数据
		{
			int            子任务id
			unsigned char  子任务状态(0进行中，1可领奖，2已领奖)
			int            子任务变量
		}
	 */
	public post9012Event(bytes: GameByteArray): void {
		this.awakeData = {};
		this.awakeData.awakeTaskId = bytes.readInt();
		this.awakeData.taskCount = bytes.readShort();
		this.awakeData.taskGroupId = this.awakeData.awakeTaskId;
		let config = GlobalConfig.FunOpenTaskConfig;
		for (let i in config) {
			if (this.awakeData.awakeTaskId == config[i].id){
				this.awakeData.taskGroupId = config[i].openType;
			}
		}
		this.awakeData.taskData = {};
		for (let i=1; i<=this.awakeData.taskCount; i++){
			let data: any = {};
			data.id = bytes.readInt();
			data.state = bytes.readByte();
			data.curCount = bytes.readInt();
			this.awakeData.taskData[i] = data;
		}
		// console.log(this.awakeData);

		// 完成所有任务后解锁戒指
		if (this.isAwakeDone() && !SpecialRing.ins().isFireRingActivate()){
			SpecialRing.ins().requestDeblock(7)
		}

	}

	/*
		更新唤醒任务状态
		9-13
		int 当前任务组id
		struct 子任务数据
		{
			int            子任务id
			unsigned char  子任务状态(0进行中，1可领奖，2已领奖)
			int            子任务变量
		}
	*/
	public post9013Event(bytes: GameByteArray): void {
		let taskGroupId: number = bytes.readInt();
		let data: any = {};
		data.id = bytes.readInt();
		data.state = bytes.readByte();
		data.curCount = bytes.readInt();
		for (let key in this.awakeData.taskData){
			if (this.awakeData.taskData[key].id == data.id){
				this.awakeData.taskData[key] = data;
				break;
			}
		}
		// console.log(this.awakeData);
	}

	/**
	 	领取唤醒任务奖励
	 	9-14
	 	int 子任务id
	 */
	public c9014(taskId: number): void{
		let bytes: GameByteArray = this.getBytes(14);
		bytes.writeInt(taskId);
		this.sendToServer(bytes);
	}

	/**
	 *  请求下次唤醒任务
	 *  9-15
	 */
	public c9015(): void{
		this.sendBaseProto(15);
	}

	/**
	 * [requestNextAwakeTask 根据任务类型请求下一个唤醒任务]
	 * @param {number} taskType [激活处的任务类型，例如激活翅膀后需要请求下一个任务，taskType就是1,对应唤醒翅膀的任务类型]
	 */
	public requestNextAwakeTask(taskType: number): void{
		if (taskType == this.awakeData.taskGroupId) {
			this.c9015();
		}
	}

	/**
	 * [isCanAwake 获取某个类型的唤醒任务是否可唤醒]
	 * @param  {number}  type [唤醒任务类型]
	 * @return {boolean}      [true/false]
	 */
	public isCanAwake(type: number): boolean{
		let config = GlobalConfig.FunOpenTaskConfig;
		let awakeTaskId: number = 0;
		for (let i in config) {
			if (type == config[i].openType){
				awakeTaskId = config[i].id;
			}
		}
		let isAwake: boolean = this.awakeData.awakeTaskId >= awakeTaskId;
		if (this.awakeData.taskGroupId == type){ 
			for (let i in this.awakeData.taskData) {
				if (this.awakeData.taskData[i].state!=2){
					isAwake = false;
					break;
				}
			}
		}
		return isAwake
	}

	/**
	 * [isTaskAwaked 获取某个类型的唤醒任务是否已经唤醒]
	 * @param  {number}  type [唤醒任务类型]
	 * @return {boolean}      [true/false]
	 */
	public isTaskAwaked(type: number): boolean{
		let config = GlobalConfig.FunOpenTaskConfig;
		let awakeTaskId: number = this.awakeData.awakeTaskId;
		for (let i in config) {
			if (type == config[i].openType){
				awakeTaskId = config[i].id;
			}
		}
		return this.awakeData.awakeTaskId > awakeTaskId;
	}

	/**
	 * [isAwakeDone 唤醒任务是否全部完成]
	 * @return {boolean} [true/false]
	 */
	public isAwakeDone(): boolean{
		if (!this.awakeData.awakeTaskId) return false;
		return this.awakeData.awakeTaskId > Object.keys(GlobalConfig.FunOpenTaskConfig).length;
	}

	/**
	 * [getAwakeTypeConf 获取唤醒任务类型配置]
	 * @param  {number} type [唤醒任务类型]
	 * @return {any}         [FunOpenTaskTypeConfig]
	 */
	public getAwakeTypeConf(type: number): any{
		let config = GlobalConfig.FunOpenTaskTypeConfig;
		for (let i in config) {
			if (type == config[i].openType){
				return config[i];
			}
		}
		return null;
	}

	/**
	 * [getAwakeTypeConfById 根据唤醒任务组id获取任务类型配置]
	 * @param  {number} taskId [唤醒任务组id]
	 * @return {any}           [FunOpenTaskTypeConfig]
	 */
	public getAwakeTypeConfById(taskId: number): any{
		let type: number = taskId;
		let typeConfig = GlobalConfig.FunOpenTaskConfig;
		for (let i in typeConfig) {
			if (taskId == typeConfig[i].id){
				type = typeConfig[i].openType;
			}
		}
		let config = GlobalConfig.FunOpenTaskTypeConfig;
		for (let i in config) {
			if (type == config[i].openType){
				return config[i];
			}
		}
		return null;
	}

	/**
	 * [checkTaskSpecialGuide 检测任务触发特殊引导]
	 * @param {number} taskId [任务ID]
	 */
	public checkTaskSpecialGuide(taskId: number): void{
		let conf: SpecialGuideConfig[] = GlobalConfig.SpecialGuideConfig;
		for (let i in conf) {
			if (conf[i].taskId == taskId){
				ViewManager.ins().open(SpecialTaskGuide,conf[i]);
			}
		}
	}

	/**
	 * [checkAwakeRedPoint 唤醒红点按钮]
	 */
	public checkAwakeRedPoint(): [number,number,number] {
		let awakeData = this.awakeData;
		if (!awakeData.taskData) {
			return [0,0,0];
		}
		let len: number = Object.keys(awakeData.taskData).length;
		let count: number = 0;
		let index: number = 0;
		for (let i in awakeData.taskData) {
			if (awakeData.taskData[i].state==1){
				count = 1;
			}
			if (awakeData.taskData[i].state==2){
				index++;
				if (index == len){
					count = 1;
				}
			}
		}
		return [count,index,len];
	}
}

namespace GameSystem {
	export let  userTask = UserTask.ins.bind(UserTask);
}
