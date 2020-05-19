/**追血令 */
class Encounter extends BaseSystem {
	/** 追血令数据 */
	public encounterModel: EncounterModel[] = [];
	public wildModel: any = {};
	//野外boss
	public willBossID: number;
	public isGuiding: boolean = false;
	public wildPersonList: any = {};
	public isFindDrop: boolean = false;
	public buyAndFight: boolean = false;//购买pk值后立刻前往战斗

	public constructor() {
		super();

		this.sysId = PackageID.Encounter;
		this.regNetMsg(1, this.doLastRefreshTime);
		this.regNetMsg(2, this.doEncounterData);
		this.regNetMsg(3, this.doResult);
		this.regNetMsg(4, this.postZaoYuRecord);
		this.regNetMsg(7, this.postDataUpdate);
		//野外boss
		this.regNetMsg(5, this.doUpdateWildBoss);
		this.regNetMsg(6, this.doWildBossResult);
		this.regNetMsg(8, this.doAddWildPlayer);
		this.regNetMsg(9, this.doWildPlayerResult);
		this.regNetMsg(10, this.doRedNameResult);
	}

	public static ins(): Encounter {
		return super.ins() as Encounter;
	}

	/**
	 * 处理追血令最后一次刷新的时间
	 * 5-1
	 * @param bytes
	 */
	private doLastRefreshTime(bytes: GameByteArray): void {
		EncounterModel.lastTime = bytes.readInt();
		let a = bytes.readInt();
		let b = bytes.readInt();
		EncounterModel.refreshTimes = bytes.readInt();
		EncounterModel.redName = bytes.readInt();
		this.postEncounterDataChange();
	}

	public sendRefresh(): void {
		this.sendBaseProto(1);
	}

	public canResult = true;
	public sendFightResult(result: number): void {
		if (EncounterFight.ins().encounterIndex == undefined || !this.canResult)
			return;
		// console.log("遭遇敌人" + (result == 1 ? "成功" : "失败"));
		if (result == 1) {
			UserTips.ins().showTips(`PK值增加${GlobalConfig.SkirmishBaseConfig.onesPkval}点`);
		}
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(EncounterFight.ins().encounterIndex);
		bytes.writeInt(result);
		this.sendToServer(bytes);
		this.canResult = false;
	}

	public postFightResult(result) {
		return result;
	}

	//当前是否追血令
	public isEncounter(): boolean {
		return EncounterFight.ins().encounterIndex != undefined && EncounterFight.ins().encounterIndex >= 0 || this.isFindDrop;
	}

	public isHasRed() {
		let num: number = 0;
		for (let i = 0; i < Encounter.ins().encounterModel.length; i++) {
			if (Encounter.ins().getEncounterModel(i))
				num++;
		}
		if (num > 0 && EncounterModel.redName < GlobalConfig.SkirmishBaseConfig.maxPkval)
			return num;
		return 0;
	}

	/**
	 * 处理追血令数据
	 * 5-2
	 * @param bytes
	 */
	private doEncounterData(bytes: GameByteArray): void {
		let index: number = bytes.readInt();
		bytes.position -= 4;
		this.encounterModel[index] = this.encounterModel[index] || new EncounterModel();
		this.encounterModel[index].parser(bytes);
		//不创建实体了
		// GameLogic.ins().createEntityByModel(this.encounterModel[index]);
		this.postEncounterDataChange();
	}

	/** 追血令数据变更 */
	public postEncounterDataChange(): void {

	}

	private sendGetreward(): void {
		this.sendBaseProto(3);
	}

	/**
	 * 处理战斗结果
	 * 5-3
	 * @param bytes
	 */
	private doResult(bytes: GameByteArray): void {
		// EntityManager.ins().encounterIndex = undefined;


		let index: number = bytes.readInt();
		let result: number = bytes.readInt();
		let reward: RewardData[] = [];
		let types: number[] = [0, 1, 4, 3];
		let len: number = types.length;
		let rewardData: RewardData;
		for (let i = 0; i < len; i++) {
			rewardData = new RewardData();
			rewardData.type = 0;
			rewardData.id = types[i];
			rewardData.count = bytes.readInt();
			if (rewardData.count)
				reward.push(rewardData);
		}
		len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			rewardData = new RewardData();
			rewardData.parser(bytes);
			Encounter.ins().postCreateDrop(DropHelp.tempDropPoint.x, DropHelp.tempDropPoint.y, rewardData);
			reward.push(rewardData);
		}
		this.encounterModel[index - 1] = null;

		let s: string = "获得奖励如下：";
		if (result && len) {
			egret.Tween.get(this).wait(1000).call(function () {
				DropHelp.clearDrop();
				Encounter.ins().isFindDrop = false;
				this.sendGetreward();
				EncounterFight.ins().win();
				// RoleAI.ins().start();
			}, this);
			this.isFindDrop = true;
			// DropHelp.addCompleteFunc(f, this);
			DropHelp.start();
		}
		else if (!result) {
			EncounterFight.ins().lose();
		}
		//console.log("======追血令返回  result = " + result + "  道具数量 = " + len);
		this.postEncounterDataChange();
	}

	public getEncounterLength() {
		let len = 0;
		for (let i = 0; i < Encounter.ins().encounterModel.length; i++) {
			let enModel = Encounter.ins().getEncounterModel(i);
			if (enModel) {
				len += 1;
			}
		}
		return len;
	}

	/**
	 * 获取声望跟排名
	 * 5-7
	 */
	public encounterRank: number = 0;

	public postDataUpdate(bytes: GameByteArray): any {
		let prestige = bytes.readInt();
		let rank = bytes.readShort();
		this.encounterRank = rank;
		return [prestige, rank]
	}

	public sendInquirePrestige(): void {
		this.sendBaseProto(7);
	}

	public postZaoYuRecord(bytes: GameByteArray = null): any {
		if (!bytes) return null;

		let count = bytes.readShort();
		let arr = [];

		for (let i = 0; i < count; i++) {
			let r = [];
			r[0] = bytes.readInt();
			r[1] = bytes.readBoolean();
			r[2] = bytes.readString();
			r[3] = bytes.readInt();
			r[4] = bytes.readInt();
			r[5] = bytes.readInt();
			r[6] = bytes.readInt();
			arr[i] = r;
		}
		return arr;
	}

	public sendInquireRecord(): void {
		this.sendBaseProto(4);
	}

	//-----------------------------------------------------------野外boss
	/**
	 * 处理更新野外boss
	 * 5-5
	 * @param bytes
	 */
	private doUpdateWildBoss(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		this.willBossID = id;
		//清除boss
		if (id == 0) {
			// EntityManager.ins().removeWillBoss();
		}
		else {
			// Encounter.ins().createBoss();
		}
		PlayFun.ins().upDataWillBoss(id);
	}


	public createBoss(): void {
		// let globalConf = GlobalConfig;
		// let id: number = this.willBossID;
		// let willBossConfig = globalConf.FieldBossConfig[id];
		// let model = UserFb.createModel(globalConf.MonstersConfig[willBossConfig.monsterId]);
		// let sceneConf = GlobalConfig.ScenesConfig[GameMap.mapID];
		// model.x = sceneConf.bossX * GameMap.CELL_SIZE;
		// model.y = sceneConf.bossY * GameMap.CELL_SIZE;
		// model.type = EntityType.WillBoss;
		// GameLogic.ins().createEntityByModel(model);
		// debug.log(`场景${GameMap.mapID}的野外boss已经出现在${model.x},${model.y}上`);
	}

	/**
	 * 处理野外boss挑战结果
	 * 5-6
	 * @param bytes
	 */
	private doWildBossResult(bytes: GameByteArray): void {
		let b: boolean = bytes.readBoolean();
		if (b) {
			let count: number = bytes.readShort();
			for (let j = 0; j < count; j++) {
				let award = new RewardData();
				award.parser(bytes);
				Encounter.ins().postCreateDrop(DropHelp.tempDropPoint.x,
					DropHelp.tempDropPoint.y, award);
			}
		}
		let f: Function = function () {
			this.sendGetAward();
			GameLogic.ins().createGuanqiaMonster();
		};
		DropHelp.addCompleteFunc(f, this);
		DropHelp.start();
	}

	public postCreateDrop(...params) {
		//前5个立刻创建，避免道具还没有创建就开始寻找道具而导致的异常问题
		if (DropHelp.getItemCount() < 5) {
			DropHelp.addDrop(params);
			return false;
		}
		return params;
	}

	/**
	 * 上报挑战结果
	 * 5-5
	 * @param result 结果
	 */
	public sendResult(result: boolean): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeBoolean(result);
		this.sendToServer(bytes);
	}

	/**
	 * 发送领取boss奖励
	 * 5-6
	 */
	public sendGetAward(): void {
		this.sendBaseProto(6);
	}

	/** 获取追血令数据 */
	public getEncounterModel(index: number): EncounterModel {
		return this.encounterModel[index];
	}

	/** 清楚追血令数据 */
	public clearEncounterModel(): void {
		this.encounterModel.length = 0;
	}

	/**
	 * 5-8
	 * 减少红名值
	 */
	public sendCleanRedName() {
		this.sendBaseProto(8);
	}

	/**
	 * 5-8
	 * 添加野外玩家
	 *
	 */
	public doAddWildPlayer(bytes: GameByteArray) {
		if (GameMap.fbType != 0) return;
		let data = new WildPlayerData();
		data.index = bytes.readInt();
		let x = bytes.readShort();
		let y = bytes.readShort();
		let lv = bytes.readShort();
		let zsLv = bytes.readShort();
		data.actionType = bytes.readByte();
		data.attackEnable = bytes.readByte() != 0;
		data.killNum = bytes.readInt();
		data.backX = bytes.readShort();
		data.backY = bytes.readShort();
		let name = bytes.readString();
		let len = bytes.readShort();
		let masterHandle;
		for (let i = 0; i < len; i++) {
			let role = new Role;
			role.parser(bytes);
			role.x = x;
			role.y = y;
			role.name = name;
			role.type = EntityType.Role;
			role.killNum = 0;
			GameLogic.ins().createEntityByModel(role, Team.Faker);
			if (i == 0) {
				masterHandle = role.handle;
			}
			role.masterHandle = masterHandle;
		}

		data.fireRing = new OtherFireRingData();
		data.fireRing.parser(bytes);

		this.wildPersonList[masterHandle] = data;
	}

	public canRunAwary(masterHandle): boolean {
		let tar = this.wildPersonList[masterHandle] as WildPlayerData;
		tar.backCount--;
		return tar.backCount == 0;
	}

	/**
	 * 野外玩家离开
	 */
	public RunAwary(masterHandle) {
		let data = this.wildPersonList[masterHandle] as WildPlayerData;
		delete this.wildPersonList[masterHandle];
	}

	/**
	 * 上报假人战斗结果
	 * 5-9
	 * @param acId
	 *  * @param result
	 */
	public sendWildPeopleResult(acId: number, result: number): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeInt(acId);
		bytes.writeInt(result);
		this.sendToServer(bytes);
	}

	private doWildPlayerResult(bytes: GameByteArray): void {
		let index: number = bytes.readInt();
		let result: number = bytes.readInt();
		let reward: RewardData[] = [];
		let rewardData: RewardData;
		let len: number = bytes.readShort();
		for (let i = 0; i < len; i++) {
			rewardData = new RewardData();
			rewardData.parser(bytes);
			Encounter.ins().postCreateDrop(DropHelp.tempDropPoint.x, DropHelp.tempDropPoint.y, rewardData);
			reward.push(rewardData);
		}
		if (result) {
			let f: Function = function () {
				this.sendGetWildPeopleReward();
				GameLogic.ins().createGuanqiaMonster();
			};
			DropHelp.addCompleteFunc(f, this);
			DropHelp.start();
		} else {
			TimerManager.ins().doTimer(800, 1, () => {
				// ViewManager.ins().open(ResultWin, result, reward, "", false);
				ResultManager.ins().create(GameMap.fbType, result, reward, "", false);
				GameLogic.ins().createGuanqiaMonster();
				Encounter.ins().wildPersonList = {};
			}, this);
		}
	}

	/**
	 * 5-10
	 * 追血令假人离开 删除
	 */
	public sendCleanWildPeople(index: number): void {
		let bytes: GameByteArray = this.getBytes(10);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/**
	 * 5-11
	 * 拾取追血令假人掉落
	 */
	public sendGetWildPeopleReward() {
		this.sendBaseProto(11);
	}

	/**
	 * 5-10
	 * 购买红名返回
	 */
	public doRedNameResult(bytes: GameByteArray): void {
		UserTips.ins().showTips(`PK值减少${GlobalConfig.SkirmishBaseConfig.subPkval}点`);
	}

	public checkIsEncounter(index: number, model: EntityModel): boolean {
		let enModel: EncounterModel = this.encounterModel[index];
		if (!enModel)
			return false;
		let list: Role[] = enModel.subRole;
		for (let i: number = 0; i < list.length; i++) {
			let role: Role = list[i];
			if (role && role.handle == model.handle) {
				return true;
			}
		}
		return false;
	}

}
namespace GameSystem {
	export let  encounter = Encounter.ins.bind(Encounter);
}