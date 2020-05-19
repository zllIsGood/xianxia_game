/**
 * Created by MPeter on 2018/3/14.
 *  跨服竞技场战斗界面
 */
class KfArenaFightWin extends BaseEuiView {
	//////////////////////////组件部分///////////////////////////
	/*倒计时组*/
	public bigTimeGroup: eui.Group;
	/*倒计时*/
	public countDown: eui.BitmapLabel;
	/*问号按钮 */
	public seeRule: eui.Button;
	/*蓝方积分*/
	public blueScore: eui.BitmapLabel;
	/*红方积分*/
	public redScore: eui.BitmapLabel;
	/*背景*/
	public hintImg: eui.Image;
	/*我的积分*/
	public score: eui.Label;
	/*我的排名*/
	public rank: eui.Label;
	/*当前剩余时间标签*/
	public leftTime: eui.Label;
	/*未开始前文本图文*/
	public txtPrepare: eui.Image;
	/*信息按钮*/
	public infoBtn: eui.Button;
	public teamBar: eui.Scroller;
	/*队伍列表*/
	public teamList: eui.List;

	public collectBookTip: eui.Group;
	public tipLabel: eui.Label;

	/**可攻击组*/
	public canAttackGroup: eui.Group;
	public canAttackBar: eui.Scroller;
	/*可攻击列表*/
	public canAttackList: eui.List;
	/*采集书*/
	public bookList: eui.List;


	//////////////////////////私有变量///////////////////////////
	private startTime: number;
	private endTimeStamp: number;
	private lastTips: boolean = false;
	private lastAScoreTip: boolean = false;
	private lastBScoreTip: boolean = false;
	private list2Dt: eui.ArrayCollection;
	private bookDt: eui.ArrayCollection;
	private teamDt: eui.ArrayCollection;
	private modeSys: KfArenaSys;

	public constructor() {
		super();
		this.skinName = "KfArenaFightSkin";
	}


	

	public init() {
		
		
		this.bigTimeGroup.visible = true;
		this.showCollectTip(false);

		this.teamList.itemRenderer = KfArenaTeamItemRender;
		this.teamDt = new eui.ArrayCollection;
		this.teamList.dataProvider = this.teamDt;

		this.canAttackList.itemRenderer = KfArenaTeamItemRender;
		this.bookList.itemRenderer = TargetMemberHeadRender;

		this.list2Dt = new eui.ArrayCollection;
		this.list2Dt.source = TargetListCC.ins().canAttackHandles;
		this.canAttackList.dataProvider = this.list2Dt;

		this.bookDt = new eui.ArrayCollection;
		this.bookList.dataProvider = this.bookDt;
	}

	protected childrenCreated(): void {
		this.init();
	}

	public open(...param): void {
		this.modeSys = KfArenaSys.ins();

		this.addTouchEvent(this.seeRule, this.onTouch);
		this.addTouchEvent(this.infoBtn, this.onTouch);
		this.observe(this.modeSys.postChangeScore, this.upScore);
		this.observe(this.modeSys.postMyBattleInfo, this.updata);
		this.observe(this.modeSys.postRefFlag, this.refBook);
		this.observe(GameLogic.ins().postCOEntity, this.upTeam);
		this.observe(GameLogic.ins().postChangeCamp, this.upTeam);
		this.observe(GameLogic.ins().postRemoveEntity, this.onRemove);
		this.observe(GameLogic.ins().postHpChange, this.onHpchange);
		this.observe(GameLogic.ins().syncMyPos, this.transferFun);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);
		this.observe(TargetListCC.ins().postChangeCanAttackHandle, this.updateCanAttackList);


		this.startTime = param[0];
		this.endTimeStamp = param[1];

		this.startCountDown(this.startTime);
		this.upScore();
		this.updata();
		this.upTeam();

	}

	public close(): void {
		for (let i: number = 0; i < this.teamList.numElements; i++) {
			let item = <KfArenaTeamItemRender>this.teamList.getElementAt(i);
			if (item) item.close();
		}

		for (let i: number = 0; i < this.canAttackList.numElements; i++) {
			let item = <KfArenaTeamItemRender>this.canAttackList.getElementAt(i);
			if (item) item.close();
		}

	}

	private onTime(): void {
		this.refBook();
	}


	/**刷新天书*/
	private refBook(): void {
		let cd = KfArenaSys.ins().flagCD - egret.getTimer() / 1000 >> 0;
		if (cd > 0) {
			TimerManager.ins().doTimer(1000, cd + 1, () => {
				this.bookDt.replaceAll([KfArenaSys.ins().flagHandle]);
			}, this);
		}
		else {
			this.bookDt.replaceAll([KfArenaSys.ins().flagHandle]);
		}

	}

	/**查看其他玩家 */
	private openOtherPlayerView(otherPlayerData: OtherPlayerData): void {
		let win = <RRoleWin>ViewManager.ins().open(RRoleWin, otherPlayerData);
		win.hideEx(2);
	}

	/**初始化队伍*/
	private upTeam(): void {
		let entityList = EntityManager.ins().getAllEntity();
		let dataList = [];
		let lenObj = {};
		for (let handel in entityList) {
			let mode = (<CharMonster>entityList[handel]).infoModel;
			if ((<Role>mode).camp != KfArenaSys.ins().myCampId || mode.isMy)continue;
			//用于计算长度
			lenObj[mode.masterHandle] = mode;
			dataList[Object.keys(lenObj).length - 1] = lenObj[mode.masterHandle];
		}
		//请求当前玩家的信息，用于获取角色ID
		if (!this.teamDt.length) this.modeSys.sendDataInfo();
		this.teamDt.replaceAll(dataList);
	}

	/**玩家离开 */
	private onRemove([handle, entity]): void {
		if (!(entity instanceof CharRole) || (<Role>entity.infoModel).camp != KfArenaSys.ins().myCampId)return;

		this.upTeam();
	}


	private updata(): void {
		this.score.text = this.modeSys.ownScore + "";
		this.rank.text = this.modeSys.ownBattleRank + "";
	}

	/**更新血量*/
	private onHpchange([target, hp, oldHp]): void {
		if (target.isMy)return;
		for (let i: number = 0; i < this.teamList.numElements; i++) {
			let item = <KfArenaTeamItemRender>this.teamList.getElementAt(i);
			if (item && target.infoModel == item.data) {
				item.upHp();
				break;
			}
		}

		for (let i: number = 0; i < this.canAttackList.numElements; i++) {
			let item = <KfArenaTeamItemRender>this.canAttackList.getElementAt(i);
			if (item && target.infoModel.masterHandle == item.data) {
				item.upHp();
				break;
			}

		}

	}

	/**更新积分*/
	private upScore(): void {
		//自己的阵营
		if (this.modeSys.myCampId == 1) {
			this.blueScore.text = this.modeSys.scoreA + "";
			this.redScore.text = this.modeSys.scoreB + "";

		}
		else {
			this.blueScore.text = this.modeSys.scoreB + "";
			this.redScore.text = this.modeSys.scoreA + "";
		}


		//各方阵营只提示一次
		if (!GlobalConfig.CrossArenaBase.tipScore) GlobalConfig.CrossArenaBase.tipScore = 800;
		if (!this.lastAScoreTip && this.modeSys.scoreA >= GlobalConfig.CrossArenaBase.tipScore) {
			this.showScoreTip(this.modeSys.myCampId == 1 ? 1 : 2, this.modeSys.scoreA);
			this.lastAScoreTip = true;
		}
		else if (!this.lastBScoreTip && this.modeSys.scoreB >= GlobalConfig.CrossArenaBase.tipScore) {
			this.showScoreTip(this.modeSys.myCampId == 1 ? 2 : 1, this.modeSys.scoreB);
			this.lastBScoreTip = true;
		}

	}

	/**显示达标提示*/
	private showScoreTip(type: number, score: number): void {
		this.hintImg.source = type == 1 ? `kfarena_words_win_friend` : `kfarena_words_win_enemy`;
		this.bigTimeGroup.visible = true;
		this.countDown.text = score + "";
		TimerManager.ins().doTimer(5000, 1, this.hideEnd, this);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.seeRule:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[42].text);
				break;
			case this.infoBtn:
				ViewManager.ins().open(KfArenaInfoWin);
				break;

		}
	}

	/**开始倒计时*/
	private startCountDown(t: number): void {
		this.txtPrepare.visible = true;
		this.leftTime.visible = false;
		this.startTime = egret.getTimer() + t * 1000;
		this.hintImg.source = `kfarena_words_start`;
		this.timeGo();
		if (t > 0 && !TimerManager.ins().isExists(this.timeGo, this)) {
			this.bigTimeGroup.visible = true;
			TimerManager.ins().doTimer(1000, 0, this.timeGo, this);
		}

	}

	private timeGo(): void {
		let t = (this.startTime - egret.getTimer()) / 1000 >> 0;
		if (t > 0) {
			this.countDown.text = t + "";
		}
		else {
			TimerManager.ins().remove(this.timeGo, this);
			this.bigTimeGroup.visible = false;
			this.showCollectTip(true);

			this.txtPrepare.visible = false;
			this.leftTime.visible = true;
			let lefttime: number = (DateUtils.formatMiniDateTime(this.endTimeStamp) - GameServer.serverTime) / DateUtils.MS_PER_SECOND >> 0;
			if (lefttime > 0 && !TimerManager.ins().isExists(this.lefttimeFun, this)) {
				TimerManager.ins().doTimer(1000, 0, this.lefttimeFun, this);
			}

		}

	}


	private lefttimeFun(): void {
		let lefttime: number = (DateUtils.formatMiniDateTime(this.endTimeStamp) - GameServer.serverTime) / DateUtils.MS_PER_SECOND >> 0;
		if (lefttime < 0) {
			TimerManager.ins().removeAll(this);
			return;
		}
		this.leftTime.text = DateUtils.getFormatBySecond(lefttime, DateUtils.TIME_FORMAT_3);


		//提示10秒后结束
		if (!this.lastTips && lefttime <= 10) {
			this.lastTips = true;
			this.countDown.text = lefttime + "";
			this.hintImg.source = `kfarena_words_end`;
			this.bigTimeGroup.visible = true;
			TimerManager.ins().doTimer(5000, 1, this.hideEnd, this);
		}
	}

	private hideEnd(): void {
		this.bigTimeGroup.visible = false;
	}

	private transferFun(): void {
		this.showCollectTip(false);
	}

	/**显示是否采集*/
	public showCollectTip(boo: boolean): void {
		this.collectBookTip.visible = boo;
	}


	////////////////////////////////////////////////////////////////////
	private updateCanAttackList(): void {
		let data = TargetListCC.ins().canAttackHandles;
		this.canAttackBar.visible = data.length > 0;
		if (!this.canAttackBar.visible) return;

		this.list2Dt.replaceAll(TargetListCC.ins().canAttackHandles);

	}
}
ViewManager.ins().reg(KfArenaFightWin, LayerManager.UI_Main);
