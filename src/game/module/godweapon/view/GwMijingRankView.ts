/**
 * 神兵副本排行榜
 */
class GwMijingRankView extends BaseEuiView {
	private bgClose: eui.Rect;
	private list: eui.List;
	private _ary: eui.ArrayCollection;
	public constructor() {
		super();
		this.skinName = "GwMijingRankSkin";
	}
	public initUI(): void {
		super.initUI();
		this.touchEnabled = true;
		this.addTouchEvent(this.bgClose, this.touchHandler);

		this._ary = new eui.ArrayCollection();
		this.list.dataProvider = this._ary;
		this.list.itemRenderer = GwMijingRankItemRender;
	}
	/**
	 * @param param 参数
	 */
	public open(...param: any[]): void {
		this._ary.replaceAll(GodWeaponCC.ins().rankInfoDataAry);
	}
	/**
	 * @param param 参数
	 */
	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.touchHandler);
		this.list.dataProvider = null;
	}
	//点击事件
	private touchHandler(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
}
//排行榜组件
class GwMijingRankItemRender extends BaseItemRender {
	private rank: eui.Label;
	private playerName: eui.Label;
	private storeyCount: eui.Label;
	private time: eui.Label;
	private qiansan: eui.Image;
	private _thisData: GwRankInfoData;
	constructor() {
		super();
	}
	public dataChanged(): void {
		super.dataChanged();
		if (!this.data) {
			return;
		}
		this._thisData = this.data;
		this.playerName.text = this._thisData.nameStr;
		this.storeyCount.text = `第${this._thisData.floorNum}层`;
		this.time.text = this._thisData.getgetTimeStr();
		if (this._thisData.rank <= 3) {
			this.rank.visible = false;
			this.qiansan.visible = true;
			this.qiansan.source = `paihang${this._thisData.rank}`;
		} else {
			this.rank.text = `${this._thisData.rank}`;
			this.rank.visible = true;
			this.qiansan.visible = false;
		}

	}
}
ViewManager.ins().reg(GwMijingRankView, LayerManager.UI_Popup);