//神兵加成属性界面详细
class GwAddAttrView extends BaseEuiView {
	private GwName: eui.Label;
	private rect: eui.Rect;
	private list: eui.List;
	private _ary: eui.ArrayCollection;
	public constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "GwAttrskin";
		this._ary = new eui.ArrayCollection();
		this.list.dataProvider = this._ary;
		this.list.itemRenderer = GwAddAttrRender;
	}
	/**
	 * @param param 参数
	 */
	public open(...param: any[]): void {
		this._ary.replaceAll(GodWeaponCC.ins().gwAddAttr(param[0]));
		this.addTouchEvent(this.rect, this.onTap);
		switch (param[0]) {
			case 0:
				this.GwName.text = "雷霆怒斩";
				break;
			case 1:
				this.GwName.text = "羲和神杖";
				break;
			case 2:
				this.GwName.text = "伏魔之灵";
				break;
		}
	}
	/**
	 * @param param 参数
	 */
	public close(...param: any[]): void {
		this.list.dataProvider = null;
		this.removeTouchEvent(this.rect, this.onTap);
	}
	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
}
class GwAddAttrRender extends BaseItemRender {
	private labelInfo: eui.Label;
	private _thisData: { value: number, type: number };
	constructor() {
		super();
	}
	public dataChanged(): void {
		super.dataChanged();
		if (!this.data) {
			return;
		}
		this._thisData = this.data;
		this.labelInfo.text = AttributeData.getAttrStrByType(this._thisData.type) + "：" + this._thisData.value;
	}
}
ViewManager.ins().reg(GwAddAttrView, LayerManager.UI_Popup);