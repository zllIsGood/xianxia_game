/**
 * 天梯 - 匹配窗口
 */
class LadderChallengeWin extends BaseEuiView {

	public otherHead: eui.Image;
	public scrollHead: eui.Image;
	public myhead: eui.Image;
	public ingImg: eui.Image;
	public enterTime: eui.Label;

	public myname: eui.Label;
	public othername: eui.Label;
	public mylv: eui.Label;
	public otherlv: eui.Label;

	public time: number;
	private posY: number;
	private posYScroll: number;
	private posYImg: number;
	private otherMask: egret.Rectangle;
	private scrollMask: egret.Rectangle;

	private rollTime: number;

	private tweenObj: any;

	private roleInfoList: number[][][] = [
		[[2, 1], [1, 0]],
		[[1, 0], [3, 1]],
		[[3, 1], [2, 1]],
		[[2, 1], [3, 1]]
	];

	constructor() {
		super();
		this.skinName = `ChallengeSkin`;
	}

	public initUI(): void {
		this.tweenObj = {index: 0};
		//设置头像滚动初值
		this.otherHead.scrollRect = new egret.Rectangle(-1, -1, 84, 84);
		this.scrollHead.scrollRect = new egret.Rectangle(-1, -56, 84, 84);

		this.otherMask = this.otherHead.scrollRect;
		this.scrollMask = this.scrollHead.scrollRect;

		this.posY = this.otherMask.y;
		this.posYImg = this.scrollHead.y;
		this.posYScroll = this.scrollMask.y;
	}

	public open(...param: any[]): void {
		//事件监听
		this.observe(Rank.ins().postRankingData, this.updataHeadInfo);
		//请求匹配玩家 34-2
		Ladder.ins().sendGetSomeOne();
		//设置自己的数据显示
		this.setMyHead();
		//开始滚动对手头像
		this.startScrollHead();
		this.ingImg.visible = true;
		this.enterTime.visible = false;
		//关闭自动挑战关卡boss
		PlayFun.ins().closeAuto();
	}

	public close(...param: any[]): void {
		//停止滚动对手头像
		this.stopScrollHead();
		this.removeObserve();
		this.ingImg.visible = true;
		this.enterTime.visible = false;
	}

	/**
	 * 设置自己的数据显示
	 */
	private setMyHead(): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(0);
		this.myhead.source = `head_${model.job}${model.sex}`;
		let config: TianTiDanConfig = Ladder.ins().getLevelConfig();
		this.myname.text = Actor.myName;
		this.mylv.text = `${config.showLevel}${config.showDan||""}段`;
	}

	/**
	 * 开始滚动对手头像
	 */
	private startScrollHead(): void {
		this.rollTime = 0;
		this.otherMask.y = this.posY;
		this.scrollMask.y = this.posYScroll;
		this.scrollHead.y = this.posYImg;
		this.refushROllInfo(0);

		egret.Tween.get(this.tweenObj, {loop: true}).to({index: this.rollTime + 1}, 20).call(this.startScroll, this);
		// TimerManager.ins().doTimer(10, 54 * 4, this.startScroll, this, this.rollOver, this);
	}

	/**
	 * 停止滚动对手头像
	 */
	private stopScrollHead(): void {
		// TimerManager.ins().remove(this.startScroll, this);
		egret.Tween.removeTweens(this.tweenObj);
	}

	/**
	 * 滚动对手头像函数
	 */
	private startScroll(): void {
		this.otherMask.y += 2;
		this.scrollMask.y += 2;
		this.scrollHead.y -= 1;
		this.otherHead.scrollRect = this.otherMask;
		this.scrollHead.scrollRect = this.scrollMask;
		this.rollTime++;
		if (this.rollTime % 27 == 0) {
			this.otherMask.y = this.posY;
			this.scrollMask.y = this.posYScroll;
			this.scrollHead.y = this.posYImg;
			this.refushROllInfo(this.rollTime / 27);
			if (this.rollTime / 27 == 4) {
				this.scrollHead.source = "";
				this.rollOver();
			}
		}
	}

	/**
	 * 排行榜数据结果 18-1
	 */
	private updataHeadInfo(rankModel: RankModel): void {
		if (rankModel.type != RankDataType.TYPE_POWER ||
			rankModel.type != RankDataType.TYPE_BAOSHI ||
			rankModel.type != RankDataType.TYPE_LONGHUN ||
			rankModel.type != RankDataType.TYPE_WING ||
			rankModel.type != RankDataType.TYPE_BOOK ||
			rankModel.type != RankDataType.TYPE_ZS ||
			rankModel.type != RankDataType.TYPE_SCORE
		) return;
		if (rankModel.type == RankDataType.TYPE_POWER)
			this.refushROllInfo(0);
	}


	/**
	 * 对手头像滚动完成
	 */
	private rollOver(): void {
		//停止滚动对手头像
		this.stopScrollHead();
		this.ingImg.visible = false;
		this.enterTime.visible = true;
		this.rollTime = 3;
		//进入倒计时xxx秒
		this.enterTime.text = `进入倒计时${this.rollTime}秒`;
		if (Ladder.ins().getActorInfo(1) == 0 && Ladder.ins().getActorInfo(0) == 0) {
			UserTips.ins().showTips(`|C:0xf3311e&T:未匹配到对手|`);
			//未匹配到对手
			ViewManager.ins().close(this);
		} else {
			TimerManager.ins().doTimer(1000, 0, this.refushLabel, this);
		}
	}

	private refushLabel(): void {
		this.rollTime--;
		//进入倒计时xxx秒
		this.enterTime.text = `进入倒计时${this.rollTime}秒`;
		if (this.rollTime < 1) {
			this.sendStarPlay();
			TimerManager.ins().remove(this.refushLabel, this);
		}
	}

	private sendCount: number = 0;

	/**
	 * 设置对手数据
	 */
	private refushROllInfo(num: number): void {
		if (num > 3) {
			this.showPointPlayerInfo();
			return;
		}
		let mathLevel: number = Ladder.ins().level;
		let mathId: number = Math.floor(Math.random() * Ladder.ins().getLevelDuanWeiLength(mathLevel));
		let config: TianTiDanConfig = Ladder.ins().getLevelConfig(mathLevel, mathId);
		this.otherlv.text = `${config.showLevel}${config.showDan||""}段`;

		let list: number[][] = this.roleInfoList[num];
		//设置对手头像
		this.otherHead.source = `head_${list[0][0]}${list[0][1]}`;
		this.scrollHead.source = `head_${list[1][0]}${list[1][1]}`;

		let data: RankDataBase = this.getRankListOne();
		if (data == null) {
			return;
		}
	}

	private showPointPlayerInfo(): void {
		let info: any[] = Ladder.ins().getActorInfo();
		if (info.length == 0 || info[1] == 0 && info[0] == 0) {
			return;
		}
		this.otherHead.source = `head_${info[3]}${info[4]}`;
		this.scrollHead.source = "";
		let config: TianTiDanConfig = Ladder.ins().getLevelConfig(info[5], info[6]);
		this.otherlv.text = `${config.showLevel}${config.showDan||""}段`;
		this.othername.textFlow = TextFlowMaker.generateTextFlow1(info[2]);
	}

	public sendStarPlay(): void {
		Ladder.ins().sendStarPlay(Ladder.ins().getActorInfo(1), Ladder.ins().getActorInfo(0));
		ViewManager.ins().close(LadderWin);
		ViewManager.ins().close(this);
	}

	public getRankListOne(): RankDataBase {
		let rankModel: RankModel = Rank.ins().getRankModel(RankDataType.TYPE_POWER);
		if (rankModel && rankModel.getDataList().length <= 0) {
			//请求排行榜数据,超过2次就不重复请求了
			if (this.sendCount < 2) {
				Rank.ins().sendGetRankingData(RankDataType.TYPE_POWER);
				this.sendCount++;
				return null;
			}
			return null;
		}
		this.sendCount = 0;
		let arr = rankModel.getDataList();
		let randData: RankDataBase = arr[Math.floor(Math.random() * arr.length)];
		if (randData && randData.id == Actor.actorID) {
			//如果排行榜只有自己  直接返回自己
			if (arr.length == 1) {
				return randData;
			}
			return this.getRankListOne();
		}
		return randData;
	}
}

ViewManager.ins().reg(LadderChallengeWin, LayerManager.UI_Popup);
