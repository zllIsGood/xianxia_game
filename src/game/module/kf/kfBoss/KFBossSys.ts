/**
 * Created by MPeter on 2018/1/17.
 * 跨服副本-跨服boss
 */
class KFBossSys extends BaseSystem {
	/**剩余采旗次数 */
	public flagTimes: number;
	/**归属者次数 */
	public bossTimes: number;
	/**进入CD时间 */
	public enterCD: number;
	/**刷新剩余时间组 */
	public fbInfo: KFBossInfoData[] = [];

	/**旗帜handle */
	public flagHandle: number;
	/**当前旗帜CD */
	public flagCD: number;
	/**跨服boss战场 */
	public lastKFBoss: boolean = false;

	public dropRecordDataList: KFDropRecordData[] = [];
	public dropBestRecordDataList: KFDropRecordData[] = [];

	public constructor() {
		super();

		this.sysId = PackageID.KFBoss;
		this.regNetMsg(1, this.postBossInfo);
		this.regNetMsg(2, this.postAscriptionChange);
		this.regNetMsg(3, this.postRevive);
		this.regNetMsg(5, this.postBossRevive);
		this.regNetMsg(7, this.postRefFlag);
		this.regNetMsg(8, this.postCollectFlag);
		this.regNetMsg(9, this.postInfo);
		this.regNetMsg(10, this.doResult);
		this.regNetMsg(11, this.postDropList);
		this.regNetMsg(12, this.postBroadcastResult);
		this.regNetMsg(13, this.postEffigyInfo);


		//boss出现
		this.observe(UserBoss.ins().postBossAppear, () => {
			if (this.isKFBossBattle)
				ViewManager.ins().open(BossBelongPanel);
		});
		//boss消失
		this.observe(UserBoss.ins().postBossDisappear, () => {
			if (this.isKFBossBattle)
				ViewManager.ins().close(BossBelongPanel);
		});
		this.observe(GameLogic.ins().postEnterMap, () => {
			//进入跨服boss场景
			if (this.isKFBossBattle) {
				this.postEnterKFBossFb();
			}
			else if (this.lastKFBoss) {
				this.postQuiKFBossFb();
			}
		});
	}

	public get isKFBossBattle(): boolean {
		return GameMap.fbType == UserFb.FB_TYPE_KF_BOSS;
	}

	/**
	 * 本服boss信息
	 * 70-1
	 */
	public postBossInfo(bytes: GameByteArray): void {
		let count: number = bytes.readShort();
		this.fbInfo = [];
		for (let i: number = 0; i < count; i++) {
			let info = new KFBossInfoData(bytes);
			this.fbInfo[info.dpId] = info;
		}
	}

	/**
	 * 跨服归属者变更通知
	 * 70-2
	 */
	public postAscriptionChange(bytes: GameByteArray): void {
		let oldHandle: number = bytes.readDouble();
		let nowHandle: number = bytes.readDouble();

		let oldName = "";
		if (oldHandle > 0) {
			let oldChar: CharRole[] = EntityManager.ins().getMasterList(oldHandle);
			if (oldChar && oldChar[0] && oldChar[0].infoModel) {
				oldName = oldChar[0].infoModel.name;
			}
		}


		UserBoss.ins().postBelongChange(nowHandle, oldHandle, oldName);
	}

	/**
	 * 跨服复活
	 * 70-3
	 */
	public postRevive(bytes: GameByteArray): void {
		let cd: number = bytes.readInt();
		let killHandel: number = bytes.readDouble();

		if (cd > 0) ViewManager.ins().open(KFBossReliveWin, cd, killHandel);
		else {
			ViewManager.ins().close(KFBossReliveWin);
			//因为跨服场景中，服务器不会扣除元宝，要回本服后才计算扣除，所以需要做个假的扣除
			if (KFServerSys.ins().isKF) {
				let yb = Actor.yb - GlobalConfig.CrossBossBase.rebornCost;
				Actor.ins().postYbChange(yb);
			}
		}


	}

	/**
	 * boss/旗帜 刷新复活通知
	 * 70-5
	 */
	public postBossRevive(bytes: GameByteArray): void {
		let type: number = bytes.readShort();//1旗帜， 2 boss
		let id: number = bytes.readShort();


		if (this.fbInfo[id]) {
			if (type == 1) this.fbInfo[id].flagRefTimer = egret.getTimer();
			else if (type == 2) this.fbInfo[id].bossRefTimer = egret.getTimer();
		}

	}

	/**
	 * 刷新旗子
	 * 70-7
	 */
	public postRefFlag(bytes: GameByteArray): void {
		this.flagHandle = bytes.readDouble();
		this.flagCD = bytes.readInt() * 1000 + egret.getTimer();//采集CD时间

		//因为当前的旗子会被清空，所以需要模拟拿一组数字做旗子handle，确保旗帜头像能一直在列表上
		//苍月道不显示旗帜
		if (GameMap.fubenID != GlobalConfig.CrossBossConfig[8].fbid)
			this.flagHandle = 100010100101;
		else this.flagHandle = 0;
	}

	/**
	 * 采集旗子
	 * 70-8
	 */
	public postCollectFlag(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();//采旗者handel
		let lefttimer: number = bytes.readInt();//彩旗剩余时间
		if (handle && handle == Actor.handle && lefttimer) {
			ViewManager.ins().open(CollectWin, handle, lefttimer);
			GameLogic.ins().currAttackHandle = 0;
		}
		else ViewManager.ins().close(CollectWin);
	}

	/**
	 * 基础玩家信息
	 * 70-9
	 */
	public postInfo(bytes: GameByteArray): void {
		this.flagTimes = bytes.readShort();
		this.bossTimes = bytes.readShort();
		let cd: number = bytes.readShort();
		this.enterCD = cd * 1000 + egret.getTimer();
	}

	/**
	 * 结算
	 * 70-10
	 */
	private doResult(bytes: GameByteArray): void {
		let type: number = bytes.readShort();
		let awards: RewardData[] = [];
		let count: number = bytes.readShort();
		//是否是旗子奖励
		let isFlag: boolean = type == 1;
		for (let i: number = 0; i < count; i++) {
			let awardData: RewardData = new RewardData();
			awardData.type = bytes.readInt();
			awardData.count = bytes.readInt();
			awardData.id = bytes.readInt();
			awards.push(awardData);

			if (awardData.type == 0 && awardData.id != 1 && awardData.id != 2 && awardData.id != MoneyConst.rune) {
				//掉落除了元宝和金币 战纹精华，其他都不出现
			}
			else if (!isFlag) {
				DropHelp.addDrop([DropHelp.tempDropPoint.x != 0 ? DropHelp.tempDropPoint.x : Math.floor(EntityManager.ins().getNoDieRole().x / GameMap.CELL_SIZE),
					DropHelp.tempDropPoint.y != 0 ? DropHelp.tempDropPoint.y : Math.floor(EntityManager.ins().getNoDieRole().y / GameMap.CELL_SIZE),
					awardData])
			}
		}

		if (isFlag) {
			ResultManager.ins().create(GameMap.fbType, awards, isFlag);
		}
		else {
			let f: Function = function () {
				ResultManager.ins().create(GameMap.fbType, awards, isFlag);
			}
			DropHelp.start();
			DropHelp.addCompleteFunc(f, this);
		}

	}

	/**
	 * 掉落列表
	 * 70-11
	 */
	public postDropList(bytes: GameByteArray): void {
		this.dropRecordDataList = [];
		this.dropBestRecordDataList = [];
		//普通掉落
		let len: number = bytes.readShort();
		for (let i: number = 0; i < len; i++) {
			this.dropRecordDataList.push(new KFDropRecordData(bytes));
		}
		//极品掉落
		len = bytes.readShort();
		for (let i: number = 0; i < len; i++) {
			let data = new KFDropRecordData(bytes);
			data.isBest = true;
			this.dropBestRecordDataList.push(data);
		}
	}


	/**
	 *  广播结果
	 * 70-12
	 */
	public postBroadcastResult(bytes: GameByteArray): string {
		let servId: number = bytes.readInt();
		let nick: string = bytes.readString();
		let handle: number = bytes.readDouble();

		let actor: CharRole = EntityManager.ins().getEntityByHandle(handle);
		if (!actor || actor.action == EntityAction.DIE || actor == EntityManager.ins().getNoDieRole()) {
			return `S${servId}${nick}`;
		}


		let awards: RewardData[] = [];
		let count: number = bytes.readShort();

		for (let i: number = 0; i < count; i++) {
			let awardData: RewardData = new RewardData();
			awardData.type = bytes.readInt();
			awardData.id = bytes.readInt();
			awardData.count = bytes.readInt();

			awards.push(awardData);

			if (awardData.type == 0 && awardData.id != 1 && awardData.id != 2 && awardData.id != MoneyConst.rune) {
				//掉落除了元宝和金币 战纹精华，其他都不出现
			}
			else {
				DropHelp.addDrop([DropHelp.tempDropPoint.x != 0 ? DropHelp.tempDropPoint.x : Math.floor(actor.x / GameMap.CELL_SIZE),
					DropHelp.tempDropPoint.y != 0 ? DropHelp.tempDropPoint.y : Math.floor(actor.y / GameMap.CELL_SIZE),
					awardData])
			}
		}


		let f: Function = function () {

		}
		DropHelp.start();
		DropHelp.addCompleteFunc(f, this);

		return `S${servId}${nick}`;
	}

	/**
	 * 下发雕像信息
	 * 70-13
	 * */
	postEffigyInfo(bytes: GameByteArray): void {
		let actorId: number = bytes.readInt();
		let job: number = bytes.readByte();
		let sex: number = bytes.readByte();
		let name: string = bytes.readString()
		let guildName: string = bytes.readString();
		guildName = guildName ? guildName + "\n" : "";

		if (GameMap.fbType != UserFb.FB_TYPE_KF_BOSS)return;
		this.creatEffigy(`{${guildName}${name}`, job, sex);
	}

	/**创建雕像*/
	private creatEffigy(playName, job, sex): void {
		let scene = ViewManager.ins().getView(GameSceneView) as GameSceneView;
		let sv: StatueView;
		let p: XY = this.getStatuePos();
		if (!p) return;
		sv = new StatueView(KFServerSys.ins().isKFServ ? "chenghao1qiang" : "chenghao2qiang", playName || `虚位以待`, `statue_${job}_${sex}`);

		sv.x = p.x;
		sv.y = p.y;
		scene.map.addEntity(sv);
	}

	/**获取雕像坐标*/
	private getStatuePos(): XY {
		for (let key in GlobalConfig.CrossBossConfig) {
			if (GlobalConfig.CrossBossConfig[key].fbid == GameMap.fubenID) {
				return GlobalConfig.CrossBossConfig[key].statuePos;
			}
		}
	}

	/**进入跨服boss副本 */
	postEnterKFBossFb(): void {
		this.lastKFBoss = true;

		//如果有boss血条，则刷新
		if (ViewManager.ins().isShow(BossBloodPanel))
			ViewManager.ins().open(BossBloodPanel);

		ViewManager.ins().close(KFBossShowWin);

		ViewManager.ins().open(KFBossSceneWin);

		// this.creatEffigy("冠军", 1, 0);
	}

	/**退出跨服boss副本 */
	postQuiKFBossFb(): void {
		ViewManager.ins().close(BossBelongPanel);
		this.lastKFBoss = false;
		this.flagHandle = 0;
		ViewManager.ins().close(KFBossReliveWin);
		ViewManager.ins().close(KFBossSceneWin);
	}


	/////////////////////////发送协议//////////////////////
	/**
	 * 请求boss列表消息
	 * 70-1
	 */
	public sendBossInfo(): void {
		this.sendBaseProto(1);
	}

	/**
	 * 购买CD
	 * 70-3
	 */
	public sendClearReliveCD(): void {
		this.sendBaseProto(3);


	}

	/**
	 * 取消归属者
	 * 70-4
	 */
	public sendCleanBelong(): void {
		this.sendBaseProto(4);
	}

	/**
	 * 进入副本
	 * 70-6
	 */
	public sendEnter(fbid: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(fbid);
		this.sendToServer(bytes);
	}

	/**
	 * 采旗子
	 * 70-8
	 */
	public sendCollectFlag(): void {
		this.sendBaseProto(8);
	}

	/**
	 * 获取掉落列表
	 * 70-11
	 */
	public sendDropList(): void {
		this.sendBaseProto(11);
	}

	//////////////////////////////////////////////////////
	public static ins(): KFBossSys {
		return super.ins() as KFBossSys;
	}

	public isOpen(): boolean {
		if (!GlobalConfig.CrossBossBase.limitZsLv) GlobalConfig.CrossBossBase.limitZsLv = 5;//没配，默认拿5转
		// GlobalConfig.CrossBossBase.limitZsLv = 0; // 测试用的
		return GlobalConfig.CrossBossBase.openDay <= GameServer.serverOpenDay + 1 && UserZs.ins().lv >= GlobalConfig.CrossBossBase.limitZsLv;
	}

	public getBossShowAward(rewardShow: { [day: number]: RewardData[] }) {
		let day = GameServer.serverOpenDay + 1;
		let awards = [];
		for (let i in rewardShow) {
			if (day >= +i) {
				//awards = rewardShow[i].concat();
				awards = awards.concat(rewardShow[i]);
			}
		}
		return awards;
	}

}
namespace GameSystem {
	export let  kfBossSys = KFBossSys.ins.bind(KFBossSys);
}