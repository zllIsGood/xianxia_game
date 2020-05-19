/**
 * Created by MPeter on 2018/3/12.
 * 跨服3v3竞技场- 结算界面
 */
class KfArenaResultWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public sureBtn: eui.Button;
	public list: eui.List;
	public blueScore: eui.BitmapLabel;
	public redScore: eui.BitmapLabel;
	public leaveInfo: eui.Label;
	public extrReward: eui.List;
	public blueResult: eui.Image;
	public redResult: eui.Image;
	public loseMask0: eui.Image;
	public loseMask1: eui.Image;


	private quitTime: number;
	private QUIT_T: number = 30;

	public constructor() {
		super();
		this.skinName = `KfArenaResultSkin`;

	}

	protected childrenCreated(): void {
		this.init();
	}

	public init() {
		this.extrReward.itemRenderer = ItemBase;
		this.list.itemRenderer = KfArenaResultDataItem;
	}

	public open(...param): void {
		this.addTouchEvent(this.bgClose, this.onTouch);
		this.addTouchEvent(this.sureBtn, this.onTouch);

		let [winCamp, scoreA, scoreB, dataList, extrReward] = param;
		//平局
		if (winCamp == 3) {
			this.blueResult.source = "tag_draw";
			this.redResult.source = "tag_draw";
			this.loseMask0.visible = false;
			this.loseMask1.visible = false;
		}
		else if (winCamp == KfArenaSys.ins().myCampId) {
			this.blueResult.source = "tag_win";
			this.redResult.source = "tag_lose";
			this.loseMask0.visible = false;
			this.loseMask1.visible = true;
		}
		else {
			this.blueResult.source = "tag_lose";
			this.redResult.source = "tag_win";
			this.loseMask0.visible = true;
			this.loseMask1.visible = false;
		}


		if (KfArenaSys.ins().myCampId == 1) {
			this.blueScore.text = scoreA + "";
			this.redScore.text = scoreB + "";
		}
		else {
			this.blueScore.text = scoreB + "";
			this.redScore.text = scoreA + "";
		}


		this.list.dataProvider = new eui.ArrayCollection(dataList);
		this.extrReward.dataProvider = new eui.ArrayCollection(extrReward);

		this.quitTime = egret.getTimer() + this.QUIT_T * 1000;
		if (!TimerManager.ins().isExists(this.onTime, this))
			TimerManager.ins().doTimer(1000, 0, this.onTime, this);
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			// case this.bgClose:
			case this.sureBtn:
				this.onExit();
				break;
		}
	}

	private onTime(): void {
		let t = (this.quitTime - egret.getTimer()) / 1000 >> 0;
		if (t > 0) {
			this.leaveInfo.text = `${t}s后自动离开战场`;
		}
		else {
			this.onExit();
			TimerManager.ins().remove(this.onTime, this);
		}

	}

	private onExit(): void {
		UserFb.ins().sendExitFb();
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(KfArenaResultWin, LayerManager.UI_Popup);
