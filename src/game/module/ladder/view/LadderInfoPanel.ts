class LadderInfoPanel extends BaseComponent {

	public flowPlayer: eui.Button;
	public winImg: eui.Image;
	public rewardList: eui.List;
	public duanwei: eui.Label;
	public winNum: eui.Label;
	public winNum0: eui.Label;
	public buyTime: eui.Label;
	public showReward: eui.Label;
	public showNomber: eui.Label;
	public lastNum: eui.Label;
	public starInfo: LadderStarListView;
	public noOpenDesc: eui.Label;
	public openInfo: eui.Group;
	public showNomber0: eui.Label;

	constructor() {
		super();
		this.name = `天梯`;
		// this.skinName = "ladderinfoskin";
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		this.rewardList.itemRenderer = ItemBase;
	}

	public open(): void {

		this.buyTime.textFlow = new egret.HtmlTextParser().parser(`<u>购买匹配次数</u>`);
		this.showNomber.textFlow = new egret.HtmlTextParser().parser(`<u>查看排名</u>`);
		this.showReward.textFlow = new egret.HtmlTextParser().parser(`<u>查看奖励</u>`);
		this.showNomber0.textFlow = new egret.HtmlTextParser().parser(`<u>上周排名</u>`);

		this.addTouchEvent(this.flowPlayer, this.onTap);
		this.addTouchEvent(this.buyTime, this.onTap);
		this.addTouchEvent(this.showNomber, this.onTap);
		this.addTouchEvent(this.showReward, this.onTap);
		this.addTouchEvent(this.showNomber0, this.onTap);
		this.observe(Ladder.ins().postTadderChange, this.tadderInfoChange);
		this.observe(Ladder.ins().postRankInfoList, this.tadderInfoChange);
		//获取排行榜数据 34-5
		Ladder.ins().sendGetRankInfo();

		this.tadderInfoChange();
	}

	public $onClose(): void {
		super.$onClose();
		TimerManager.ins().removeAll(this);
	}

	private updateTime(): void {
		let v = Ladder.ins().challgeNum;
		let mv = GlobalConfig.TianTiConstConfig.maxRestoreChallengesCount;
		let color = v > 0 ? `2ECA22` : `f3311e`;
		let time = Math.round((Ladder.ins().challgeCd - egret.getTimer()) / 1000);
		time = time <= 0 ? 0 : time;
		let str = v >= mv ? `(2小时恢复1次)` : `(恢复倒计时：${DateUtils.getFormatBySecond(time)})`;
		this.lastNum.textFlow = new egret.HtmlTextParser().parser(`<font color="#${color}">剩余次数：${v}/${mv} <font color="#F2BE15">${str}</font></font>`);
		// if( !time ){
		// 	Ladder.ins().challgeCd = GlobalConfig.TianTiConstConfig.challengesCountCd*1000 + egret.getTimer();
		// 	Ladder.ins().challgeNum++;
		// 	Ladder.ins().challgeNum = Ladder.ins().challgeNum >=mv?mv:Ladder.ins().challgeNum;
		// }
	}

	/**刷新 自己的挑战数据*/
	private tadderInfoChange(): void {
		TimerManager.ins().remove(this.updateTime, this);
		TimerManager.ins().doTimer(500, 0, this.updateTime, this);
		this.updateTime();
		let rankModel: RankModel = Rank.ins().rankModel[RankDataType.TYPE_LADDER];
		if (rankModel)
			this.winNum0.text = rankModel.selfPos > 0 ? `${rankModel.selfPos}` : `未上榜`;
		this.winNum.text = `${Ladder.ins().winNum}`;
		this.duanwei.text = Ladder.ins().getDuanWeiDesc();
		let config: TianTiDanConfig = Ladder.ins().getLevelConfig();
		if (config) {
			this.rewardList.dataProvider = new eui.ArrayCollection(config.danAward);
		}
		this.winImg.visible = Ladder.ins().lianWin;
		this.starInfo.updataStarInfo(config);
		this.starInfo.setLvAndRank(config);
		this.noOpenDesc.visible = !Ladder.ins().isOpen;
		this.openInfo.visible = Ladder.ins().isOpen;
	}

	/**触摸事件 */
	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(LimitTaskView);
		switch (e.currentTarget) {
			case this.flowPlayer:
				if (UserFb.ins().checkInFB()) return;
				//匹配对手
				if (Ladder.ins().challgeNum <= 0) {
					UserTips.ins().showTips(`|C:0xf3311e&T:挑战次数不足|`);
					return;
				}
				if (ViewManager.ins().isShow(LadderChallengeWin)) {
					//不允许重复打开 匹配面板
					return;
				}
				ViewManager.ins().open(LadderChallengeWin);
				break;
			case this.buyTime:
				//购买次数
				if (Ladder.ins().todayBuyTime == GlobalConfig.TianTiConstConfig.maxBuyChallengesCount) {
					UserTips.ins().showTips(`|C:0xf3311e&T:今日购买次数已达上限|`);
					return;
				}
				if (Actor.yb < GlobalConfig.TianTiConstConfig.buyChallengesCountYuanBao) {
					UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
					return;
				}

				WarnWin.show(`确定花费<font color='#FFB82A'>${GlobalConfig.TianTiConstConfig.buyChallengesCountYuanBao}元宝</font>购买1次论剑天下挑战次数吗？\n` +
					`今日已购买：${Ladder.ins().todayBuyTime}/${GlobalConfig.TianTiConstConfig.maxBuyChallengesCount}`, function () {
					Ladder.ins().sendBuyChallgeTime();
				}, this);
				break;
			//查看奖励
			case this.showReward:
				ViewManager.ins().open(LadderRewardShowWin);
				break;
			//查看排行
			case this.showNomber:
				ViewManager.ins().open(LadderLastRankWin, 1);
				break;
			case this.showNomber0:
				if (Ladder.ins().upLevel > 0)
					ViewManager.ins().open(LadderLastRankWin, 0);
				else
					UserTips.ins().showTips(`|C:0xf3311e&T:暂无上周排行数据|`);
				break;
		}
	}
}