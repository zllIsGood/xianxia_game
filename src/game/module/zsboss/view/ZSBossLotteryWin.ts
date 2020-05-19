class ZSBossLotteryWin extends BaseEuiView {

	public colorCanvas: eui.Image;
	public play: eui.Button;
	public giveUp: eui.Button;
	public bar: eui.ProgressBar;
	public closeBtn: eui.Button;
	public item0: ItemBase;
	public playSuccess: eui.Label;
	public timeLabel: eui.Label;

	public point: eui.Image;
    public maxPoint: eui.Label;
    private pointImg: eui.BitmapLabel;

	private times: number;
	public statu: number;
	private configTimes: number = 0;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ZSBossLotterySkin";

		this.bar.labelFunction = function () {
			return "";
		}
		this.isTopLevel = true;

		this.pointImg = BitmapNumber.ins().createNumPic(0, "1", 10);
		this.pointImg.x = this["point"].x;
		this.pointImg.y = this["point"].y;
		DisplayUtils.removeFromParent(this["point"]);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.play, this.onTap);
		this.addTouchEvent(this.giveUp, this.onTap);

		this.observe(UserBoss.ins().postLotteryRan, this.getMyPoint);
		this.observe(UserBoss.ins().postLotteryResult, this.getMaxPoint);
		this.observe(GuildWar.ins().postLotteryPoint, this.getMyPoint);
		this.observe(GuildWar.ins().postLotteryMaxPost, this.getMaxPoint);

		this.statu = 0;
        if (param[0])
            this.statu = param[0];
        else
            this.statu = 0;

		if (ZsBoss.ins().isZsBossFb(GameMap.fubenID)) {
			this.configTimes = GlobalConfig.WorldBossBaseConfig.lotteryTime;
		} else {
			this.configTimes = 10;
		}

		this.bar.maximum = 10 * this.configTimes;
		this.refushInfo();
		this.play.enabled = true;
		// this.currentState = "select";
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.play, this.onTap);
		this.removeTouchEvent(this.giveUp, this.onTap);
		TimerManager.ins().remove(this.refushBar, this);
		this.removeObserve();
	}

	private refushInfo(): void {
		this.times = 0;
		this.item0.data = UserBoss.ins().worldPrize;
		TimerManager.ins().doTimer(100, 10 * this.configTimes, this.refushBar, this, this.TimeOver, this);
		this.timeLabel.text = `${this.configTimes}秒`;
	}

	private refushBar(): void {
		this.times++;
		let value: number = 10 * this.configTimes - this.times;
		this.bar.value = value;
		this.timeLabel.text = Math.floor(this.configTimes - this.times / 10) + "秒";
	}

	private TimeOver(): void {
		// if (this.currentState == "select") {
			ViewManager.ins().close(ZSBossLotteryWin);
		// }
	}

	private getMyPoint(point: number): void {
        // this.currentState = "play";
		this.play.enabled = false;
        BitmapNumber.ins().changeNum(this.pointImg, point, "7", 2);
        this.addChild(this.pointImg);
    }

    private getMaxPoint(info: any[]): void {
        this.maxPoint.textFlow = new egret.HtmlTextParser().parser("<font color = '#FFB82A'>" + info[0] + "</font>投出了<font color = '#FFB82A'>" + info[1] + "</font>点");
    }

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(ZSBossLotteryWin);
				break;
			case this.play:
				if (this.statu == 0) {
					//转生boss 抽奖
					UserBoss.ins().sendJoinLottery();
                } else if (this.statu == 1) {
					//帮派战 城门 抽奖
					GuildWar.ins().sendPlayLotteryInfo();
                }
				break;
			case this.giveUp:
				ViewManager.ins().close(ZSBossLotteryWin);
				break;
		}
	}
}

ViewManager.ins().reg(ZSBossLotteryWin, LayerManager.UI_Popup);