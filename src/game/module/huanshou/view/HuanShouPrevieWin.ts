class HuanShouPrevieWin extends BaseEuiView {
	private colorCanvas: eui.Image;
	private itemList: eui.List;
	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = `huanShouManual`;
		this.itemList.itemRenderer = HsSkillBookListItem;
		let newArr: HuanShouPreviewConfig[] = [];
		let confs = GlobalConfig.HuanShouPreviewConfig;
		for (let key in confs) {
			newArr.push(confs[key]);
		}
		this.itemList.dataProvider = new eui.ArrayCollection(newArr);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.colorCanvas, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.colorCanvas, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.colorCanvas:
			case this.closeBtn0:
			case this.closeBtn:
				this.closeWin();
				break;
		}
	}

}

ViewManager.ins().reg(HuanShouPrevieWin, LayerManager.UI_Popup);