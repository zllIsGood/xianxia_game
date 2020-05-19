/**
 * Created by MPeter on 2018/3/2.
 * 魔界入侵
 */
class DevildomSys extends BaseSystem {
	/**击杀状态*/
	public killedState: boolean[];
	private refTime: number[] = [];

	public dropRecordDataList: KFDropRecordData[] = [];
	/**当前所进入的副本ID*/
	public historyId: number;
	/**进入cd时间*/
	public enterCD: number;

	/**是否为魔界战场*/
	public lastDevildom: boolean;


	public hudun: number;
	public hudunMax: number;

	public constructor() {
		super();
		this.sysId = PackageID.Devildom;

		this.regNetMsg(1, this.postBossInfo);
		this.regNetMsg(2, this.postAscriptionChange);
		this.regNetMsg(3, this.postRevive);
		this.regNetMsg(7, this.doResult);
		this.regNetMsg(8, this.postInfo);
		this.regNetMsg(9, this.postHudun);

		this.observe(GameLogic.ins().postEnterMap, () => {
			//进入魔界入侵场景
			if (this.isDevildomBattle) {
				this.postEnterFb();
			}
			else if (this.lastDevildom) {
				this.postQuiKFb();
			}
		});

		//boss出现
		this.observe(UserBoss.ins().postBossAppear, () => {
			if (this.isDevildomBattle)
				ViewManager.ins().open(BossBelongPanel);
		});
	}

	public get isDevildomBattle(): boolean {
		return GameMap.fbType == UserFb.FB_TYPE_DEVILDOM_BOSS;
	}

	/**
	 * boss基本信息
	 * 71-1
	 * */
	public postBossInfo(bytes: GameByteArray): void {
		let count: number = bytes.readShort();
		this.killedState = [];
		let refTime: number[] = [];
		for (let i: number = 0; i < count; i++) {
			let id = bytes.readShort();
			let time = bytes.readInt();
			let isKill = bytes.readBoolean();
			this.killedState[id] = isKill;
			refTime[id] = time;
		}
		//当前在线，判断刷新时间，重置当前记录ID
		if (this.historyId && this.refTime[this.historyId] && refTime[this.historyId] != this.refTime[this.historyId]) {
			this.historyId = 0;
		}

		this.refTime = refTime.concat();
	}

	/**
	 * 魔界入侵归属者变更通知
	 * 71-2
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
	 * 复活
	 * 71-3
	 */
	public postRevive(bytes: GameByteArray): void {
		let cd: number = bytes.readInt();
		let killHandel: number = bytes.readDouble();

		if (cd > 0) ViewManager.ins().open(DevildomReliveWin, cd, killHandel);
		else {
			ViewManager.ins().close(DevildomReliveWin);
			//因为跨服场景中，服务器不会扣除元宝，要回本服后才计算扣除，所以需要做个假的扣除
			if (KFServerSys.ins().isKF) {
				let yb = Actor.yb - GlobalConfig.CrossBossBase.rebornCost;
				Actor.ins().postYbChange(yb);
			}
		}
	}


	/**
	 * 结算
	 * 71-7
	 */
	private doResult(bytes: GameByteArray): void {
		let name = bytes.readString();
		let handel = bytes.readDouble();
		let isBelong = bytes.readBoolean();
		//获得奖励
		let len: number = bytes.readShort();
		let listReward: RewardData[] = [];
		for (let i: number = 0; i < len; i++) {
			let awardData: RewardData = new RewardData();
			awardData.type = bytes.readInt();
			awardData.id = bytes.readInt();
			awardData.count = bytes.readInt();
			listReward.push(awardData);
		}

		//拍卖奖励
		len = bytes.readShort();
		let saleListReward: RewardData[] = [];
		for (let i: number = 0; i < len; i++) {
			let saleId = bytes.readInt();//拍卖id
			saleListReward.push(GlobalConfig.AuctionItem[saleId].item);
		}

		ViewManager.ins().open(DevildomResultWin, handel, name, isBelong, saleListReward, listReward);
	}

	/**
	 * 基本信息
	 * 71-8
	 */
	public postInfo(bytes: GameByteArray): void {
		this.historyId = bytes.readShort();
		let cd: number = bytes.readShort();
		this.enterCD = cd * 1000 + egret.getTimer();
	}

	/**
	 * 魔界入侵护盾
	 * 71-9
	 */
	public postHudun(bytes: GameByteArray): void {
		if (bytes) {
			this.hudun = bytes.readShort();
			this.hudunMax = bytes.readShort();
		}

		if (this.hudun > 0) {
			this.hudun--;
			TimerManager.ins().doTimer(1000, 1, this.postHudun, this);
		}

	}


	////////////////////////////////////////////////////////
	/**
	 * 购买CD
	 * 71-3
	 */
	public sendClearReliveCD(): void {
		this.sendBaseProto(3);
	}

	/**
	 * 取消归属者
	 * 71-4
	 */
	public sendCleanBelong(): void {
		this.sendBaseProto(4);
	}

	/**
	 * 进入副本
	 * 71-5
	 */
	public sendEnter(fbid: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(fbid);
		this.sendToServer(bytes);
	}


	/**进入副本 */
	postEnterFb(): void {
		this.lastDevildom = true;

		// ViewManager.ins().open(BossBloodPanel);
	}

	postQuiKFb(): void {
		this.lastDevildom = false;
		ViewManager.ins().close(BossBelongPanel);
	}

	isOpen(): boolean {
		return GameServer.isOpenLF && GameServer.serverOpenDay + 1 >= GlobalConfig.DevilBossBase.openDay && this.isHfTerm();
	}

	/**是否合服开启条件*/
	isHfTerm(): boolean {
		let hfTime = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime) + GlobalConfig.DevilBossBase.hefuTimeLimit * DateUtils.MS_PER_DAY;
		return GameServer.serverTime - hfTime > 0;
	}
}
namespace GameSystem {
	export let  devildomSys = DevildomSys.ins.bind(DevildomSys);
}
