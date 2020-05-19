class ArtifactChipOpenWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `shenqiPartActskin`;
		this.list.itemRenderer = ArtifactAttrDescItem;
	}


	private list: eui.List;
	private imgArtifact: eui.Image;
	private btnOpen: eui.Button;
	private index: number;
	private labelInfo: eui.Label;
	private labelName: eui.Label;
	private rect: eui.Rect;
	private mId: number;

	public open(...param: any[]) {
		this.index = param[1];
		this.mId = param[0];
		this.openTips(this.mId);
		this.addTouchEvent(this.btnOpen,this.onTap);
	}

	public close() {

	}

	private openTips(mId: number) {
		let data = Artifact.ins().getNewArtifactBy(this.index);

		let conf = GlobalConfig.ImbaJigsawConf[mId];
		let itemConf = GlobalConfig.ItemConfig[mId];
		this.list.dataProvider = new eui.ArrayCollection(conf.attrs);
		this.imgArtifact.source = itemConf.icon + '_png';
		this.labelInfo.text = `再获得${data.remindNumToOpen()}个碎片可激活完整神器`;
		this.labelName.text = conf.name;
	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.btnOpen:
				Artifact.ins().sendOpenChip(this.mId);
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(ArtifactChipOpenWin, LayerManager.UI_Popup);