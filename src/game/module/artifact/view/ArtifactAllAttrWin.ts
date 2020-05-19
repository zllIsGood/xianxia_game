class ArtifactAllAttrWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `shenqiAttrskin`;
		this.list.itemRenderer = ArtifactAttrDescItem;
	}

	private list: eui.List;
	private rect: eui.Rect;


	public open() {
		this.addTouchEvent(this.rect, this.onTap);
		this.list.dataProvider = new eui.ArrayCollection(Artifact.ins().getAttr());
	}

	public close() {

	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.rect:
				ViewManager.ins().close(this);
				break;
		}
	}

}
ViewManager.ins().reg(ArtifactAllAttrWin, LayerManager.UI_Popup);