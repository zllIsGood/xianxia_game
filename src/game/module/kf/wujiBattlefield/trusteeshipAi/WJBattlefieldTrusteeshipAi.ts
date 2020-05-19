/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场-托管AI
 */
class WJBattlefieldTrusteeshipAi extends BaseClass {
	/**ai检测间隔时间 单位:毫秒 ms*/
	private AI_INTERVAL: number = 1000;

	/**ai状态 */
	public state: TrusteeshipAiState;

	public constructor() {
		super();

	}

	public static ins(): WJBattlefieldTrusteeshipAi {
		return super.ins() as WJBattlefieldTrusteeshipAi;
	}

	/**开启托管AI */
	public startAi(): void {
		//当前场景必须是在无极副本中
		if (!WJBattlefieldSys.ins().isWJBattle) return;


		//移动完成
		MessageCenter.addListener(MapView.moveComplete, this.moveEnd, this);
		//需要侦听彩旗结束后的处理
		//do...

		//需要侦听复活后
		TimerManager.ins().doTimer(this.AI_INTERVAL, 0, this.runLogic, this);

		this.state = TrusteeshipAiState.Normal;
	}

	/**关闭托管AI */
	public closeAi(): void {
		MessageCenter.ins().removeAll(this);
		TimerManager.ins().remove(this.runLogic, this);

		//原地停止任何操作
		let mainRole = EntityManager.ins().getNoDieRole();
		mainRole.stopMove();
		mainRole.playAction(EntityAction.STAND);
	}

	/**运行AI逻辑 */
	private runLogic(): void {
		//是否在复活中..
		//do...

		//只有在站立状态，才处理托管逻辑
		let mainRole: CharRole = EntityManager.ins().getNoDieRole();
		if (mainRole.AI_STATE != AI_State.Stand) return;


		switch (this.state) {
			case TrusteeshipAiState.Normal:
				//检查三个旗子的状态
				let flagData = this.findCanCollectFlag();
				if (flagData) {
					if (this.checkCanCollectByDis(flagData)) {
						this.state = TrusteeshipAiState.Collect;
						//处理采集
						for (let i: number = 0; i < 3; i++) {
							let flagInfos = WJBattlefieldSys.ins().flagInfos[i + 1]
							//自己的旗子,则跳过
							if (flagInfos && flagInfos == WJBattlefieldSys.ins().myCampId) continue;
							let nearFlagHandle: number = this.findNearFlag();
							if (nearFlagHandle) {
								GameLogic.ins().postChangeAttrPoint(nearFlagHandle);
							}

							break;
						}


					}
					else {
						//前往采旗子
						//do...
						GameMap.moveTo(flagData.x, flagData.y);
					}

				}
				else {
					//随机找出一个乙方占领的旗子，寻路前往待命
					let flagDt = this.findCampFlag();
					GameMap.moveTo(flagDt.x, flagDt.y);
				}

				break;
			case TrusteeshipAiState.Collect:
				//采旗中..

				break;
			case TrusteeshipAiState.Attack:
				//检查附近是否敌人
				let enemy = this.checkNearbyEnemy();
				if (enemy && enemy.infoModel) {
					//处理攻击敌方玩家
					GameLogic.ins().postChangeAttrPoint(enemy.infoModel.handle);
				}
				else {
					//进入常规状态（自动采集判断）
					this.state = TrusteeshipAiState.Normal;
				}

				break;
		}


	}

	/**移动结束 */
	private moveEnd(e: CharMonster): void {
		if (e.team != Team.My)
			return;
		//有可采集的旗子	
		let flagData = this.findCanCollectFlag();
		if (flagData) {
			//正在采旗子...
			this.state = TrusteeshipAiState.Collect;
			//do...
		}
		else {//没有可采集的旗子，进入待命状态
			this.state = TrusteeshipAiState.Attack;
		}
	}


	//////////////////////////////////////////////////工具///////////////////////////////////////////////////////
	/**查找可采集,且最近的旗子 */
	private findCanCollectFlag(): any {
		let list: any[] = [];
		let count: number = 3;//最大旗子数
		let mainRole: CharRole = EntityManager.ins().getNoDieRole();
		for (let i: number = 0; i < count; i++) {
			//可采集
			if (true) {
				let flagData: any = {};
				//计算当前主角跟旗子的距离
				flagData.distance = MathUtils.getDistance(mainRole.x, mainRole.y, flagData.x, flagData.y);
				list.push(flagData);

			}
		}


		let compareFn = (a: any, b: any) => {
			if (a.distance > b.distance) return 1;
			else if (a.distance < b.distance) return -1;
			else return 0;
		}
		list.sort(compareFn);
		//选择最近的旗子
		if (list.length) return list[0];
		return null;
	}

	/**随机查找自己的旗子 */
	private findCampFlag(): any {
		let list: any[] = [];
		let count: number = 3;//最大旗子数
		let mainRole: CharRole = EntityManager.ins().getNoDieRole();
		for (let i: number = 0; i < count; i++) {
			//自己的旗子
			if (true) {
				let flagData: any = {};
				list.push(flagData);
			}
		}
		if (list.length) return list[MathUtils.limit(0, list.length - 1)];
		return null;
	}

	/**查找最近可采集的旗子 */
	private findNearFlag(): number {
		let disList: number[] = [];
		let mainRole = EntityManager.ins().getNoDieRole();
		if (!mainRole) return 0;
		for (let index of WJBattlefieldSys.ins().flagHandle) {
			let handle = WJBattlefieldSys.ins().flagHandle[index];
			let entity = EntityManager.ins().getEntityByHandle(handle);
			if (entity && entity.infoModel) {
				//自己的旗子，则跳过
				if (WJBattlefieldSys.ins().flagInfos[index] && WJBattlefieldSys.ins().flagInfos[index] == WJBattlefieldSys.ins().myCampId)
					continue;

				let dis: number = MathUtils.getDistance(entity.x, entity.y, mainRole.x, mainRole.y)
				disList[WJBattlefieldSys.ins().flagHandle.indexOf(handle)] = dis;
			}
		}
		//排序距离
		disList.sort(Algorithm.sortAsc);
		if (disList[1]) return WJBattlefieldSys.ins().flagHandle[disList[1]];
		return 0;
	}

	/**检查附近是否有敌人，返回敌人对象 */
	private checkNearbyEnemy(): CharMonster {
		let mainRole: CharRole = EntityManager.ins().getNoDieRole();
		let range: number = 6;//可攻击的格子范围
		let list = EntityManager.ins().screeningTargetByPos(mainRole, false, 4, range);
		for (let n: number = list.length - 1; n > -1; n--) {
			//自己的队伍，则删除
			if (list[n] && list[n].infoModel && (<Role>list[n].infoModel).camp == WJBattlefieldSys.ins().myCampId) {
				list.splice(n, 1);
			}
		}
		if (list.length) return list[MathUtils.limit(0, list.length - 1)];
		return null;
	}

	/**检查是否可采集通过主角更旗子的距离 */
	private checkCanCollectByDis(flagData: any): boolean {
		let mainRole: CharRole = EntityManager.ins().getNoDieRole();
		let distance: number = MathUtils.getDistance(mainRole.x, mainRole.y, flagData.x, flagData.y);
		return distance <= 50;
	}

}

/**托管AI状态 */
enum TrusteeshipAiState {
	/**常规的状态 */
	Normal,
	/**采集状态*/
	Collect,
	/**攻击状态*/
	Attack

}
