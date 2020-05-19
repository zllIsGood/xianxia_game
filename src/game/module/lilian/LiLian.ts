/**
 * 历练数据
 */
class LiLian extends BaseSystem {

	public liLianLv: number;			   //历练神功等级
	public liLianExp: number;			  //历练神功经验
	public lilianReward: number = 0;		   //历练当前奖励等级  没收到服务器信息默认为0

	// public nobilityIsOpen: boolean = false;	   //徽章是否开启
	public nobilityIsUpGrade: number = 0;	//天阶是否可以升级 0-不可以  1-可以
	public nobilityLv: number = 0;			//徽章等级
	public xunzhangJF: number = 0;    //徽章当前成就积分

	public liLianExpDay:number = 0;//今日所获得的历练值(每日重置)
	public liLianExpDayReward:number = 0;//今日所获得的历练值奖励标记位(每日重置)
	/** 玉佩等级 */
	public jadeLv:number = 0;

	public constructor() {
		super();

		this.sysId = PackageID.Train;
		this.regNetMsg(1, this.postLilianData);
		this.regNetMsg(5, this.postNobilityData);
		this.regNetMsg(3, this.postTrainsDayAward);
		this.regNetMsg(10, this.postJadeLv);
	}

	public static ins(): LiLian {
		return super.ins() as LiLian;
	}

	//服务器数据下发处理
	//============================================================================================
	/**
	 * 发送历练神功升级
	 */
	public sendLilianUpgrade(): void {
		this.sendBaseProto(1);
	}

	/**
	 * 发送历练天阶升级
	 */
	public sendNobilityUpgrade(): void {
		this.sendBaseProto(6);
	}

	/**
	 * 发送历练天阶阶段升级
	 */
	public sendNobilityStageUpgrade(): void {
		this.sendBaseProto(7);
	}

	/**
	 * 发送历练领取等级奖励
	 */
	public sendGetLilianReward(): void {
		this.sendBaseProto(2);
	}

	/**
	 * 发送天阶激活
	 */
	// public sendJueWeiAct(): void {
	// 	this.sendBaseProto(3);
	// }

	/**
	 * 发送徽章激活
	 */
	// public sendXunZhangAct(): void {
	// 	this.sendBaseProto(8);
	// }

	//业务数据处理
	//============================================================================================
	/**
	 * 天阶 NewLilianWin->startActivation
	 */
	public isShow: boolean = false;//是否显示天阶特效界面
	// public isAct: number = -1;

	public postLilianData(bytes: GameByteArray): any {
		let lv: number = bytes.readInt();
		this.liLianExp = bytes.readInt();
		this.lilianReward = bytes.readInt();
		this.liLianExpDay = bytes.readInt();
		this.liLianExpDayReward = bytes.readInt();

		let flag: boolean = false;
		if (lv > this.liLianLv || this.checkShowRedPoint2()) flag = true;
		this.liLianLv = lv;
		UserTask.ins().postUpdataTaskPoint();
		if (flag) {
			this.upDateRole();
		}
		if( !this.getTraining )
			return { flag: true };
		else
			return { flag: false };
	}

	private upDateRole(): void {
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let entity = EntityManager.ins().getMainRole(i);
			if (entity) {
				let model: Role = SubRoles.ins().getSubRoleByIndex(i);
				model.lilianLv = this.liLianLv;
				entity.setCharName(model.guildAndName);
				entity.setLilian(model.lilianUrl);
			}
		}
	}

	/**
	 * 徽章 XunzhangPanel->update
	 * */
	// public xunzhangAct = -1;
	public isXZShow: boolean = false;//是否显示徽章特效界面
	public postNobilityData(bytes: GameByteArray): any {
		this.isXZShow = false;
		let level: number = bytes.readInt();
		let lvChange: boolean = this.nobilityLv != level;
		this.nobilityLv = level;
		return { refush: lvChange };
	}

	/***
	 * 领取每日历练奖励返回
	 * 23-3
	 */
	public getTraining:boolean;
	public postTrainsDayAward(bytes: GameByteArray):any{
		let b = bytes.readBoolean();
		this.getTraining = false;
		return b;
	}

	/**
	 * 发送请求领取每日奖励
	 * 23-3
	 * @param index
	 */
	public sendTrainsDayAward( index:number ){
		let bytes:GameByteArray = this.getBytes(3);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/** 设置成就积分 */
	public setXunzhangJF(value: number) {
		if (this.xunzhangJF != value) {
			if (this.xunzhangJF > 0) {
				let u64: number = value - this.xunzhangJF;
				let addFeats: number = parseInt(u64.toString());
				if (addFeats > 0) {
					let str = "|C:0xffd93f&T:获得" + addFeats + "成就积分|";
					UserTips.ins().showTips(str);
				}
			}
			this.xunzhangJF = value;
		}
	}

	/**
	 * 获取历练状态（玩法面板用）
	 */
	public getLiLianStast(): boolean {
		if (this.getLilianShenGongStast()) {
			return true;
		}
		if (this.getNobilityIsUpGrade() && !this.getNobilityIsMaxLevel) {
			return this.getNobilityIsUpGrade();
		}
		if (Artifact.ins().showRedPoint()) {
			return true;
		}
		if (UserTask.ins().isAchieveReward()) {
			return true;
		}
		//功勋
		if (this.checkJueWeiOpen() && this.getNobilityIsUpGrade() && !this.getNobilityIsMaxLevel()) {
			return true;
		}
		//玉佩
		if (this.checkJadeRed())
			return true;
			
		return this.checkShowRedPoint2();
	}

	public checkJueWeiOpen(): boolean {
		let id = GlobalConfig.TrainBaseConfig.actImbaId;
		if (Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id))) {
			return Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id)).open;
		}
		return false;
	}


	public checkXunZhangOpen(): boolean {
		let id = GlobalConfig.KnighthoodBasicConfig.actImbaId;
		if (Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id))) {
			return Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id)).open;
		}
		return false;
	}
	public checkBookOpen():boolean{
		return OpenSystem.ins().checkSysOpen(SystemType.BOOK);
	}
	// public static checkShowRedPoint(): number {
	// 	let boolList = Artifact.ins().canRankArtifacts();
	// 	let isRed: number = 0;
	// 	for (let k in boolList) {
	// 		if (boolList[k]) {
	// 			isRed = 1;
	// 			break;
	// 		}
	// 	}
	// 	return isRed;
	// }

	/**历练是否有奖励可领取 */
	public checkShowRedPoint2(): boolean {
		if (this.lilianReward <= 0) {
			return false;
		}
		let data = GlobalConfig.GuanYinAwardConfig[this.lilianReward];
		return this.liLianLv >= data.level;
	}

	public getLilianActiveState(): boolean {
		let id = GlobalConfig.TrainBaseConfig.actImbaId;
		if (Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id))) {
			return Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id)).open;
		}
		return false;
	}

	/**
	 * 获取历练神功状态
	 */
	public getLilianShenGongStast(): boolean {
		if (!this.getLilianActiveState())
			return false;
		let config = GlobalConfig.TrainLevelConfig[this.liLianLv + 1];
		if (config && this.liLianExp >= config.exp) {
			return true;
		}
		return this.checkShowRedPoint2();
	}

	/**
	 * 获取历练神功状态
	 */
	public getLilianBtnState(): boolean {
		if (!this.getLilianActiveState())
			return false;
		let config = GlobalConfig.TrainLevelConfig[this.liLianLv + 1];
		if (config && this.liLianExp >= config.exp) {
			return true;
		}
		return false;
	}

	/**是否可以升级徽章 */
	public getNobilityIsUpGrade(): boolean {
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[this.nobilityLv];
		for (let i: number = 0; i < config.achievementIds.length; i++) {
			let taskid: number = config.achievementIds[i].taskId;
			if (taskid > 0) {
				let data: AchievementData = UserTask.ins().getAchieveByTaskId(taskid);
				if (data) {
					let cfg: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
					if (cfg.target > data.value) {
						return false;
					}
				} else {
					return false;
				}
			}
		}
		return true;
	}

	/**徽章等级是否满级 */
	public getNobilityIsMaxLevel(): boolean {
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[this.nobilityLv + 1];
		return config ? false : true;
	}

	private _achievementTaskAllConfig: AchievementTaskConfig[];

	/**根据所有成就数据 */
	private getAllChengjiuData(): AchievementTaskConfig[] {
		if (this._achievementTaskAllConfig)
			return this._achievementTaskAllConfig;

		this._achievementTaskAllConfig = [];
		let configs = GlobalConfig.AchievementTaskConfig;
		for (let key in GlobalConfig.AchievementTaskConfig) {
			if (configs[key].achievementType > 0) {//成就大类
				this._achievementTaskAllConfig.push(configs[key]);
			}
		}
		this._achievementTaskAllConfig.sort(LiLian.sort);
		return this._achievementTaskAllConfig;
	}

	private static sort(a: AchievementTaskConfig, b: AchievementTaskConfig): number {
		if (a.achievementType > b.achievementType)
			return 1;
		else if (a.achievementType < b.achievementType)
			return -1;
		else
			return 0;
	}

	/**根据类型获取成就数据 */
	public getChengjiuData(type: number): AchievementTaskConfig[] {
		let configArr = this.getAllChengjiuData();
		let reArr: AchievementTaskConfig[] = [];
		for (let config of configArr) {
			if (config.achievementType == type) {
				reArr.push(config);
			}
		}
		return reArr;
	}

	private _chengjiuMaxData: number[];

	/**获取成就项目总类型数据 */
	public chengjiuMaxData(): number[] {
		if (this._chengjiuMaxData)
			return this._chengjiuMaxData;

		this._chengjiuMaxData = [];
		let configArr = this.getAllChengjiuData();
		let tmpType: number = -1;
		for (let config of configArr) {
			if (tmpType != config.achievementType) {
				tmpType = config.achievementType;
				this._chengjiuMaxData.push(tmpType);
			}
		}
		return this._chengjiuMaxData;
	}

	/**
	 * 天阶战斗力
	 */
	public getPower(): number {
		return GlobalConfig.TrainLevelConfig[this.liLianLv].power;
	}

	// public getName():string{
	// 	return GlobalConfig.TrainLevelConfig[this.liLianLv].name;
	// }

	private skillCfgList: TrainLevelAwardConfig[] = [];

	public getCruLevelSkillCfg(isNext: boolean = false): TrainLevelAwardConfig {
		let list: TrainLevelAwardConfig[] = GlobalConfig.TrainLevelAwardConfig;
		if (this.skillCfgList.length <= 0) {
			for (let cfg in list) {
				this.skillCfgList.push(list[cfg]);
			}
		}
		let crucfg: TrainLevelAwardConfig = null;
		for (let cfg of this.skillCfgList) {
			if (cfg.level > this.liLianLv) {
				crucfg = cfg;
				break;
			}
		}
		if (isNext) {
			return crucfg;
		}
		let id: number = crucfg ? crucfg.id - 1 : 0;
		return list[id];
	}

	public postGetLilianReward(sourceList: string[]): string[] {
		return sourceList;
	}
	/**
	 * 获取历练开服天数对应的配置数据
	 * @param 开服天数: GameServer.serverOpenDay+1
	 * */
	public getTrainDayAwardConfigs(openDay:number):TrainDayAwardConfig[]{
		let keys:string[] = Object.keys(GlobalConfig.TrainDayAwardConfig);
		keys.sort(this.setSortTrainAwards);
		for( let i = 0;i < keys.length;i++ ){//从高到低遍历
			if( openDay >= Number(keys[i]) )
				return GlobalConfig.TrainDayAwardConfig[keys[i]];
		}
		return null;
	}

	/** 升级玉佩 */
	public jadeUpgrade():void
	{
		this.sendBaseProto(10);
	}

	private setSortTrainAwards(a:string,b:string){
		if( Number(a) > Number(b) )
			return -1;
		else
			return 1;
	}

	/**
	 * 获取每日历练某个奖励是否可领取
	 */
	public isGetTrainDayAward(id:number):boolean{
		let config:TrainDayAwardConfig[] = this.getTrainDayAwardConfigs(GameServer.serverOpenDay+1);
		if( !config || !config[id])
			return false;
		if( this.liLianExpDayReward >> id & 1 ){
			//已领取

		}else{
			//未领取
			if( this.liLianExpDay >= config[id].score ){
				//可领取
				return true;

			}else{
				//不可领取
			}
		}

		return false;
	}
	/**
	 * 每日历练奖励可领取状况
	 * */
	public isGetTrainDayAwardAll():boolean{
		if (!this.getLilianActiveState())
			return false;
		let config:TrainDayAwardConfig[] = this.getTrainDayAwardConfigs(GameServer.serverOpenDay+1);
		if( !config )
			return false;
		for( let k in config ){
			if( this.liLianExpDayReward >> +k & 1 ){
				//已领取

			}else{
				//未领取
				if( this.liLianExpDay >= config[+k].score ){
					//可领取
					return true;

				}else{
					//不可领取
				}
			}
		}
		return false;
	}


	/** 玉佩等级 */
	public postJadeLv(bytes:GameByteArray):void
	{
		this.jadeLv = bytes.readInt();
	}

	/** 玉佩是否达到最大等级 */
	public isJadeMax():boolean
	{
		return this.jadeLv >= Object.keys(GlobalConfig.YuPeiConfig).length - 1;
	}

	/** 玉佩红点 */
	public checkJadeRed():boolean
	{
		//屏蔽玉佩
		return false;
		if (Actor.level < GlobalConfig.YuPeiBasicConfig.openLv)
			return false;
		
		if (this.isJadeMax())
			return false;
		
		let cfg:YuPeiConfig = GlobalConfig.YuPeiConfig[this.jadeLv];
		if (cfg.item_id == undefined || cfg.item_id <= 0)
			return true;

		let itemData: ItemData = UserBag.ins().getBagItemById(cfg.item_id);
		if (itemData && itemData.count >= cfg.count)
			return true;

		return false;
	}

}

namespace GameSystem {
	export let  lilian = LiLian.ins.bind(LiLian);
}