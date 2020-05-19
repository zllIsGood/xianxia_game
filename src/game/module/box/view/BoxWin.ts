class BoxWin extends BaseEuiView {

	public scrollerRoom: eui.Scroller;
	public freeNum: eui.Label;
	public listBox: eui.List;
	public box1: BoxFreeItemRenderer;
	public box2: BoxFreeItemRenderer;


	public constructor() {
		super();
		this.skinName = `ChestSkin`;
		this.name = `宝箱`;
	}

	public createChildren(): void {
		this.listBox.itemRenderer = BoxPayItemRenderer;
	}

	public open() {
		this.addTouchEvent(this.listBox, this.onListTap);
		this.addTouchEvent(this.box1, this.onTap);
		this.addTouchEvent(this.box2, this.onTap);
		this.observe(Box.ins().postUpdateData, this.setGridInfo);
		this.observe(Box.ins().postUpdateFreeBox, this.setFreeBox);
		this.setGridInfo();
	}

	public close(): void {
		this.removeTouchEvent(this.box1, this.onTap);
		this.removeTouchEvent(this.box2, this.onTap);
		this.removeTouchEvent(this.listBox, this.onListTap);
		this.removeObserve();
		this.box1.removeTimer();
		this.box2.removeTimer();
	}

	private setGridInfo(): void {
		this.listBox.dataProvider = new eui.ArrayCollection(BoxModel.ins().getGridCfgList());
		this.setFreeBox();
	}

	private setFreeBox(): void {
		let openNum: number = 0;
		let data: BoxFreeData = Box.ins().freeInfoList[0];
		this.box1.data = data;
		if (data.getTime() <= 0) {
			++openNum;
		}
		data = Box.ins().freeInfoList[1];
		this.box2.data = data;
		if (data.getTime() <= 0) {
			++openNum;
		}
		this.freeNum.text = `(${openNum}/2)`;
	}

	private onListTap(e: egret.Event): void {
		let tar = e.target.parent as BoxPayItemRenderer;
		if (!tar || !tar.data) return;

		let info: TreasureBoxGridConfig = tar.data as TreasureBoxGridConfig;
		let level: number = UserFb.ins().guanqiaID;
		if (info.chapter > level) {
			//格子还未开启
			UserTips.ins().showTips(`通关条件不足，无法获得新的宝箱位`);
			return;
		}

		let data: BoxOpenData = Box.ins().getGridInfoById(tar.data.pos);
		if (data && data.itemId > 0) {
			if (data.state == 2 && data.getTime() <= 0) {
				Box.ins().sendOpen(data.pos);
			} else {
				ViewManager.ins().open(BoxDetailWin, data);
			}
		} else {
			UserWarn.ins().setBuyGoodsWarn(GlobalConfig.TreasureBoxBaseConfig.getItemguide, 1);
		}
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.box1:
				if (this.box1.currentState == "open") {
					Box.ins().sendOpenFreeBox(1);
				}
				break;
			case this.box2:
				if (this.box2.currentState == "open") {
					Box.ins().sendOpenFreeBox(2);
				}
				break;
		}
	}

	public static openCheck(...param: any[]): boolean {
		if (Actor.level >= GlobalConfig.TreasureBoxBaseConfig.openLevel) {
			return true;
		}
		UserTips.ins().showTips(`${GlobalConfig.TreasureBoxBaseConfig.openLevel}级开启宝箱`);
		return false;
	}
}
ViewManager.ins().reg(BoxWin, LayerManager.UI_Main);