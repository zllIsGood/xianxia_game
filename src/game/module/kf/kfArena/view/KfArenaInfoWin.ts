/**
 * Created by MPeter on 2018/3/15.
 * 跨服3v3 竞技场数据面板
 */
class KfArenaInfoWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public sureBtn: eui.Button;
	public list: eui.List;
	public blueScore: eui.BitmapLabel;
	public redScore: eui.BitmapLabel;


	private itemDt: eui.ArrayCollection;

	public constructor() {
		super();
		this.skinName = `KfArenaInfoSkin`;
	}


	

	public init() {
		
		this.list.itemRenderer = KfArenaDataItem;
		this.itemDt = new eui.ArrayCollection();
		this.list.dataProvider = this.itemDt;

	}

	protected childrenCreated(): void {	
		this.init();
	}

	public open(...param): void {
		this.addTouchEvent(this.bgClose, this.onTouch);
		this.addTouchEvent(this.sureBtn, this.onTouch);
		this.observe(KfArenaSys.ins().postDataInfo, this.updata);

		// this.updata(param[0]);
		KfArenaSys.ins().sendDataInfo();
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.bgClose:
			case this.sureBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private updata(dt: KfArenaData[]): void {
		let modeSys: KfArenaSys = KfArenaSys.ins();
		//自己的阵营
		if (modeSys.myCampId == 1) {
			this.blueScore.text = modeSys.scoreA + "";
			this.redScore.text = modeSys.scoreB + "";
		}
		else {
			this.blueScore.text = modeSys.scoreB + "";
			this.redScore.text = modeSys.scoreA + "";
		}

		this.itemDt.replaceAll(dt);
	}
}
ViewManager.ins().reg(KfArenaInfoWin, LayerManager.UI_Popup);
