/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场系统
 */
class WJBattlefieldSys extends BaseSystem {
	private _prepStartTime: number;
	private _startTime: number;
	private _endTime: number;

	/**活动是否开启 */
	public isOpen: boolean;

	/**我的阵营ID */
	public myCampId: number;
	/**A阵营得分 */
	public campAScores: number = 0;
	/**B阵营得分 */
	public campBScores: number = 0;
	/**结算数据组-我们队伍的 */
	public resultMyInfoData: WJBattleData[];
	/**结算数据组-敌方队伍的 */
	public resultEnemyInfoData: WJBattleData[];
	/**旗子信息标记组 */
	public flagInfos: number[] = [];
	/**旗子handle */
	public flagHandle: number[];

	/**活动剩余次数 */
	public overCounts: number = 0;

	/**匹配过程时间 */
	public matchingTime: number = 0;
	/**是否在无极战场中 */
	public isWJBattle: boolean = false;

	/**我的战绩数据 */
	public myData: WJBattleData;

	/**是否主动退出 */
	private isActiveQuit: boolean = false;
	public constructor() {
		super();

		this.sysId = PackageID.WJBattle;
		this.regNetMsg(0, this.postStateInfo);
		this.regNetMsg(1, this.postMatchData);
		this.regNetMsg(2, this.doCancelMatch);

		this.regNetMsg(3, this.postEnterFbInfo);
		this.regNetMsg(4, this.doBattleResult);
		this.regNetMsg(5, this.postRefCampScores);
		this.regNetMsg(6, this.postRefCampFlag);
		this.regNetMsg(7, this.postFirstKiller);
		this.regNetMsg(8, this.postInfo);
		this.regNetMsg(9, this.postChatInfo);
		this.regNetMsg(10, this.doViewDataInfo);
		this.regNetMsg(11, this.postRemain);
		this.regNetMsg(12, this.postMyData);

		this.observe(GameLogic.ins().postEnterMap, () => {
			if (this.isWJBattle && GameMap.fubenID != 52000)
				this.quitWJBattle();
		});
	}
	public static ins(): WJBattlefieldSys {
		return super.ins() as WJBattlefieldSys;
	}

	/**
	 * 更新状态信息 
	 * 65-0
	 */
	public postStateInfo(bytes: GameByteArray): void {
		//活动是否正式开始 0否 1是
		this.isOpen = bytes.readByte() > 0 ? true : false;
		//预告开始时间戳
		this._prepStartTime = bytes.readInt();
		//活动正式开始时间戳(正式开始前预告阶段为0,结束后为上次开启时间)
		this._startTime = bytes.readInt();
		//活动正式结束时间戳(正式开始前预告阶段为0, 结束后为上次结束时间)
		this._endTime = bytes.readInt();

	}

	/**
	 * 匹配数据
	 * 65-1
	 */
	public postMatchData(bytes: GameByteArray): void {
		//  bytes.readInt();

		ViewManager.ins().open(WJBattlefieldMatchPanel);
	}

	/**
	 * 取消匹配
	 * 65-2
	 *
	 * */
	public doCancelMatch(bytes: GameByteArray): void {
		ViewManager.ins().close(WJBattlefieldMatchPanel);
		WJBattlefieldSys.ins().matchingTime = 0;
	}

	/**
	 * 进入副本信息
	 * 65-3
	 */
	public postEnterFbInfo(bytes: GameByteArray): void {
		let startTimeStamp: number = bytes.readInt();
		this.myCampId = bytes.readInt();
		this.campAScores = bytes.readInt();
		this.campBScores = bytes.readInt();
		//获取旗子handle
		this.flagHandle = [];
		let num: number = bytes.readByte();
		for (let i: number = 0; i < num; i++) {
            this.flagHandle[bytes.readByte()] = bytes.readDouble();
		}

		//进入副本标记当前是否在副本状态
		this.isWJBattle = true;
		//重置匹配时间
		WJBattlefieldSys.ins().matchingTime = 0;


		//进入副本则关闭窗口
		ViewManager.ins().close(WJBattlefieldWin);
		ViewManager.ins().open(WJBattlefieldMainUI);
		ViewManager.ins().open(WJBattlefieldStartCountdownPanel);

		// ViewManager.ins().open(TargetListPanel);

		//连接完毕，中断连接
		KFServerSys.ins().linkingKFState(false);
	}

    /**
	 * 推送战场结果
	 * 65-4
	 */
	private doBattleResult(bytes: GameByteArray): void {
		let AScores: number = bytes.readInt();
		let BScores: number = bytes.readInt();

		this.resultMyInfoData = [];
		this.resultEnemyInfoData = [];
		let num: number = bytes.readByte();
		for (let i = 0; i < num; i++) {
			let data: WJBattleData = new WJBattleData();
			data.readResultData(bytes);
			data.isResult = true;
			if (data.camp == this.myCampId) {
				this.resultMyInfoData.push(data);
			}
			else {
				this.resultEnemyInfoData.push(data);
			}

		}

		//弹出结果界面
		ViewManager.ins().open(WJBattlefieldResultWin, AScores, BScores, this.resultMyInfoData, this.resultEnemyInfoData);
        
	}

	/**
	 * 推送更新阵营积分变化
	 * 65-5
	 */
	public postRefCampScores(bytes: GameByteArray): void {
		this.campAScores = bytes.readInt();
		this.campBScores = bytes.readInt();

	}
    /**
	 * 推送更新阵营旗子变化
	 * 65-6
	 */
	public postRefCampFlag(bytes: GameByteArray): void {
		let n: number = bytes.readByte();

		this.flagInfos[n] = bytes.readInt();

	}

	/**
	 * 推送副本有人获得一血
	 * 65-7
	 */
	public postFirstKiller(bytes: GameByteArray): void {

	}

    /**
	 * 推送个人基本信息 
	 * 65-8
	 */
	public postInfo(bytes: GameByteArray): void {
		this.overCounts = bytes.readInt();
		//是否还有战场(0,否,1是,有战场可随时直接进入战场)
		let isBattle = bytes.readByte();
		//不是主动退出才提示
		if (isBattle && !this.isActiveQuit) {
			WarnWin.show("您有正在进行的玩法，是否立刻返回？", () => {
				//直接进入战场
				this.sendEnter();
			}, this, null, null, "sure");
		}
		this.isActiveQuit = false;
	}

    /**
	 * 推送战场内聊天消息 
	 * 65-9
	 */
	public postChatInfo(bytes: GameByteArray): string {
		let servId: number = bytes.readInt();
		let playerName: string = bytes.readString();
		let msg: string = bytes.readString();

		let content: string = `s${servId}.${playerName}:${msg}`;
		return content;
	}

	/**
	 * 推送查看所有数据信息 
	 * 65-10
	 */
	private doViewDataInfo(bytes: GameByteArray): void {
		let num: number = bytes.readByte();
		let myList: WJBattleData[] = [];
		let enemyList: WJBattleData[] = [];
		for (let i: number = 0; i < num; i++) {
			let data = new WJBattleData();
			data.readViewData(bytes);
			data.isResult = false;
			if (data.camp == this.myCampId) {
				myList.push(data);
			}
			else {
				enemyList.push(data);
			}
		}
		ViewManager.ins().open(WJBattlefieldDataWin, myList, enemyList);
	}

	/**
	 * 推送被杀复活
	 * 65-11
	 */
	public postRemain(bytes: GameByteArray): void {
		let cd: number = bytes.readShort();
		ViewManager.ins().open(ReliveWin, cd, `敌方`);
	}

	/**
	 * 更新我的数据
	 * 65-12
	 */
	public postMyData(bytes: GameByteArray): WJBattleData {
		this.myData = new WJBattleData;
		this.myData.readMyData(bytes);
		return this.myData;
	}


	//////////////////////////////请求协议//////////////////////////////
    /**请求匹配
	 * down 是否向下匹配
	 * 65-1
	 */
	sendMatch(isDown: boolean): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(isDown ? 1 : 0);
		this.sendToServer(bytes);
	}
	/**
	 * 请求进入战场
	 * 65-3
	*/
	sendEnter(): void {
		this.sendBaseProto(3);
	}

    /**
	 * 取消匹配
	 * 65-2
	*/
	sendCancelMatch(): void {
		this.sendBaseProto(2);
	}

	/**
     * 请求聊天
	 * 65-9
	 */
	sendChatInfo(msg: string): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeString(msg);
		this.sendToServer(bytes);
	}


	/**
     * 查看数据
	 * 65-10
	 */
	sendViewDataInfo(): void {
		this.sendBaseProto(10);
	}

	////////////////////////////工具方法////////////////////////////////
	/**退出无极战场 */
	private quitWJBattle(): void {
		this.isWJBattle = false;
		this.myCampId = 0;
		this.campAScores = 0;
		this.campBScores = 0;

		ViewManager.ins().close(WJBattlefieldMainUI);
		ViewManager.ins().close(WJBattlefieldResultWin);

		this.isActiveQuit = true;
	}

	///////////////////////////空的派发方法//////////////////////////////////
	static postSwitchServer(): void {
		ViewManager.ins().close(WJBattlefieldMatchPanel);
	}


	/////////////////////////////各个时间戳/////////////////////////////
	/**获取预备开始时间戳(毫秒)*/
	getPrepStartTimeStamp(): number {
		return this._prepStartTime - egret.getTimer();
	}
	/**获取正式开始时间(秒)*/
	getStartTime(): number {
		return Math.floor((DateUtils.formatMiniDateTime(this._startTime) - GameServer.serverTime) / 1000);
	}
	/**获取正式结束时间(秒)*/
	getEndTime(): number {
		return Math.floor((DateUtils.formatMiniDateTime(this._endTime) - GameServer.serverTime) / 1000);
	}
	/**获取正在匹配的时间 (秒)*/
	getMatchingTime(): number {
		if (this.matchingTime == 0) return 0;
		return this.matchingTime + egret.getTimer() / 1000 >> 0;
	}
}

namespace GameSystem {
	export let  wjBattlefieldSys = WJBattlefieldSys.ins.bind(WJBattlefieldSys);
}