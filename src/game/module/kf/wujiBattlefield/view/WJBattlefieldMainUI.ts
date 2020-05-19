/**
 * Created by MPeter on 2017/12/07.
 * 跨服副本-无极战场-主UI
 */
class WJBattlefieldMainUI extends BaseEuiView {
	/**小地图 */
	private minMap: SmallMapPanel;
	/**小地图容器组 */
	private smallMapGroup: eui.Group;

	/**达标条件 */
	private winTermLabel: eui.Label;
	/**活动剩余时间 */
	private overTimerLabel: eui.Label;
	/**我方进度条 */
	private myScoreBar: eui.ProgressBar;
	/**敌方进度条 */
	private enemyScoreBar: eui.ProgressBar;
	/**我方积分 */
	private myScoreLabel: eui.Label;
	/**敌方积分 */
	private enemyScoreLabel: eui.Label;


	/**发送通告按钮 */
	private sChatBtn: eui.Button;
	/**通告组 */
	private sChatGroup: eui.Group;
	/**发送通告列表 */
	private sChatList: eui.List;


	/**旗子1 */
	private flag1: eui.Button;
	/**旗子2 */
	private flag2: eui.Button;
	/**旗子3 */
	private flag3: eui.Button;
	/**查看数据区域 */
	private viewArea: eui.Rect;
	/**击杀数 */
	private killTxt: eui.Label;
	/**被击杀数 */
	private deadTxt: eui.Label;
	/**助攻数 */
	private assistsTxt: eui.Label;
	/**采集数 */
	private collectTxt: eui.Label;
	/**聊天显示列表 */
	private chatList: eui.List;

	////////////////////////////////////////
	private _chatData: eui.ArrayCollection;
	private _sChatData: eui.ArrayCollection;


	/**旗子资源 0未分配 1己方 2敌方 */
	private flagRes: string[] = ["wj_gray_flag", "wj_green_flag", "wj_red_flag"];
	public constructor() {
		super();
		this.skinName = `WJBattleMainUISkin`;
	}
	public open(...args): void {
		this.addTouchEvent(this.sChatBtn, this.onTouch);
		this.addTouchEvent(this.flag1, this.onTouch);
		this.addTouchEvent(this.flag2, this.onTouch);
		this.addTouchEvent(this.flag3, this.onTouch);
		this.addTouchEvent(this.sChatList, this.sendChat);
		this.addTouchEvent(this.viewArea, this.onTouch);

		this.observe(WJBattlefieldSys.ins().postChatInfo, this.pushChatInfo);
		this.observe(WJBattlefieldSys.ins().postMyData, this.upMydata);
		this.observe(WJBattlefieldSys.ins().postRefCampScores, this.refScores);
		this.observe(WJBattlefieldSys.ins().postRefCampFlag, this.refFlag);

		this.minMap.open(SmallSceneType.WJBattle);
		this.startActTime();
		this.upMydata();
		this.refScores();
		this.refFlag();

		//需要隐藏主导航按钮
		if (ViewManager.ins().isShow(UIView2))
			(<UIView2>ViewManager.ins().getView(UIView2)).isHideNavBtn(false);
	}
	public close(...args): void {
		this.minMap.close();

		ViewManager.ins().close(TargetListPanel);
		TimerManager.ins().removeAll(this);

		//显示主导航按钮
		if (ViewManager.ins().isShow(UIView2))
			(<UIView2>ViewManager.ins().getView(UIView2)).isHideNavBtn(true);
	}
	public initUI(): void {
		this.sChatList.itemRenderer = WJBattleSChatItem;
		this.chatList.itemRenderer = WJBattleChatItem;

		this.minMap = new SmallMapPanel();
		this.smallMapGroup.addChild(this.minMap);


		this._sChatData = new eui.ArrayCollection;
		this.sChatList.dataProvider = this._sChatData;

		this._chatData = new eui.ArrayCollection;
		this.chatList.dataProvider = this._chatData;

		this.winTermLabel.text = `积分率先达到${GlobalConfig.WujiBaseConfig.winScore}获胜`;

		this._sChatData.replaceAll(GlobalConfig.WujiBaseConfig.quickChat);

		this.myScoreBar.maximum = GlobalConfig.WujiBaseConfig.winScore;
		this.enemyScoreBar.maximum = GlobalConfig.WujiBaseConfig.winScore;
		// (<eui.Image>this.enemyScoreBar.thumb).source =
	}

	/**更新我的数据 */
	private upMydata(data?: WJBattleData): void {
		this.killTxt.text = !data ? "0" : data.killNum + "";
		this.deadTxt.text = !data ? "0" : data.killedNum + "";
		this.collectTxt.text = !data ? "0" : data.collectFlagNum + "";
		this.assistsTxt.text = !data ? "0" : data.assistsNum + "";
	}
	/**刷新积分 */
	private refScores(): void {
		this.myScoreLabel.text = WJBattlefieldSys.ins().campAScores + "";
		this.enemyScoreLabel.text = WJBattlefieldSys.ins().campBScores + "";
		this.myScoreBar.value = WJBattlefieldSys.ins().campAScores;
		this.enemyScoreBar.value = WJBattlefieldSys.ins().campBScores;
	}
	/**刷新旗子 */
	private refFlag(): void {
		for (let i: number = 0; i < 3; i++) {
			let camp = WJBattlefieldSys.ins().flagInfos[i];
			if (camp) {
				this[`flag${i + 1}`].icon = camp == WJBattlefieldSys.ins().myCampId ? this.flagRes[1] : this.flagRes[2];
			}
			else
				this[`flag${i + 1}`].icon = this.flagRes[0];
		}
	}
	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.sChatBtn:
				this.sChatGroup.visible = !this.sChatGroup.visible;
				break;
			case this.flag1:
				GameLogic.ins().postChangeAttrPoint(WJBattlefieldSys.ins().flagHandle[1]);
				break;
			case this.flag2:
				GameLogic.ins().postChangeAttrPoint(WJBattlefieldSys.ins().flagHandle[2]);
				break;
			case this.flag3:
				GameLogic.ins().postChangeAttrPoint(WJBattlefieldSys.ins().flagHandle[3]);
				break;
			case this.viewArea:
				WJBattlefieldSys.ins().sendViewDataInfo();
				break;
		}
	}
	/**发送聊天 */
	private sendChat(e: egret.TouchEvent): void {
		if (e.target instanceof WJBattleSChatItem) {
			let item: WJBattleSChatItem = e.target;
			item.bg.scaleX = item.bg.scaleY = .9;
			WJBattlefieldSys.ins().sendChatInfo(e.target.data);
			this.sChatGroup.visible = false;
		}
	}

	/**启动活动倒计时 */
	private startActTime(): void {
		TimerManager.ins().doTimer(1000, 0, this.onTick, this);
	}
	private onTick(): void {
		let time: number = WJBattlefieldSys.ins().getEndTime();
		this.overTimerLabel.text = DateUtils.getFormatBySecond(time);
	}

	/**推入聊天信息*/
	private pushChatInfo(msg: string): void {
		this._chatData.addItem(msg);
		if (this._chatData.length > 3) this._chatData.removeItemAt(0);
	}

}

ViewManager.ins().reg(WJBattlefieldMainUI, LayerManager.UI_Popup);
