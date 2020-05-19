class WorldBossJiangLiWin extends BaseEuiView {

	public colorCanvas: eui.Image;
	public play: eui.Button;
	public giveUp: eui.Button;
	public bar: eui.ProgressBar;
	// public closeBtn: eui.Button;
	public goods: ItemBase;
	public playSuccess: eui.Label;
	public timeLabel: eui.Label;

	public point: eui.Image;
    public maxPoint: eui.Label;
    // private pointImg: egret.DisplayObjectContainer;
	private myPoint: eui.Label;
	private playerName: eui.Label;
	private times: number;
	public statu: number;
	private configTimes: number = 0;

	private type: number = 0;//0世界BOSS，1仙盟战

	private maxPointGroup:eui.Group;
	private myPointGroup:eui.Group;
	private playGroup:eui.Group;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossJiangLiSkin";

		this.bar.labelDisplay.visible = false;
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.playGroup.visible = true;
		this.maxPointGroup.visible = false;
		this.myPointGroup.visible = false;
		// this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.play, this.onTap);
		this.addTouchEvent(this.giveUp, this.onTap);

		this.observe(UserBoss.ins().postLotteryRan, this.getMyPoint);
		this.observe(UserBoss.ins().postLotteryResult, this.getMaxPoint);
		this.observe(GuildWar.ins().postLotteryPoint, this.getMyPoint);
		this.observe(GuildWar.ins().postLotteryMaxPost, this.getMaxPoint);

		this.type = 0;
		if (param[0]) {
			this.configTimes = GlobalConfig.WorldBossBaseConfig.lotteryTime > 0 ? GlobalConfig.WorldBossBaseConfig.lotteryTime : 10;
			this.type = param[0];
		} else {
			this.configTimes = 10;
			this.type = 0;
		}

		this.bar.maximum = 10 * this.configTimes;
		this.refushInfo();
	}
	public close(...param: any[]): void {
		// this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.play, this.onTap);
		this.removeTouchEvent(this.giveUp, this.onTap);
		TimerManager.ins().remove(this.refushBar, this);
		this.removeObserve();
	}

	private refushInfo(): void {
		this.times = 0;
		if (this.type == 0) {
			this.goods.data = {type:1,id:UserBoss.ins().worldPrize,count:1};

		} else if (this.type == 1) {
			this.goods.data = {type:1,id:UserBoss.ins().worldPrize,count:1};
		}

		TimerManager.ins().doTimer(100, 10 * this.configTimes, this.refushBar, this, this.TimeOver, this);
		this.timeLabel.text = `${this.configTimes}秒`;
	}

	private refushBar(): void {
		this.times++;
		let value: number = 10 * this.configTimes - this.times;
		this.bar.value = value;
		this.timeLabel.text = Math.floor(this.configTimes - this.times / 10) + "秒";
		if (value <= 0) {
			ViewManager.ins().close(WorldBossJiangLiWin);
		}
	}

	private TimeOver(): void {
		// if (this.currentState == "select") {
		ViewManager.ins().close(WorldBossJiangLiWin);
		// }
	}

	private getMyPoint(point: number): void {
        // this.currentState = "play";
		this.play.touchEnabled = false;
		this.myPoint.text = point + "";
		this.myPointGroup.visible = true;
    }

    private getMaxPoint(info: any[]): void {
        this.maxPoint.text = info[1];
		this.playerName.text = info[0];
		this.maxPointGroup.visible = true;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.play:
				if (this.type == 0) {
					UserBoss.ins().sendJoinLottery();
				} else if (this.type == 1) {
					GuildWar.ins().sendPlayLotteryInfo();
				}
				this.playGroup.visible = false;
				break;
			case this.giveUp:
				if (this.type == 0) {
					ViewManager.ins().close(WorldBossJiangLiWin);
				} else if (this.type == 1) {
					ViewManager.ins().close(WorldBossJiangLiWin);
				}
				break;
		}
	}
}

ViewManager.ins().reg(WorldBossJiangLiWin, LayerManager.UI_Popup);