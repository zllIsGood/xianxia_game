class BoxOpenWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `ChestOpenRewardSkin`;
		this.list.itemRenderer = ItemBase;
		this.isTopLevel = true;
	}

	private imgBox: eui.Image;
	private conf: TreasureBoxConfig;
	private rewardList: RewardData[] = [];
	public listCon: eui.Group;
	private items: ItemBase[] = [];
	private bgClose: eui.Rect;
	public list: eui.List;
	public boxBgMc: MovieClip;
	public bgGroup: eui.Group;
	public open(...param: any[]) {
		let para: number = param[0];
		this.conf = GlobalConfig.TreasureBoxConfig[para];
		this.rewardList = param[1];
		this.list.dataProvider = new eui.ArrayCollection(this.rewardList);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.showTween();
	}

	public close() {

	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(BoxOpenWin);
				break;
		}
	}

	private rollNum: number = 0;

	private showTween() {
		this.imgBox.source = this.conf.imgClose;
		this.rollNum = 0;
		let t = egret.Tween.get(this.imgBox, { loop: true });
		t.to({ x: 265 }, 20).to({ x: 245 }, 20).to({ x: 265 }, 20).call(() => {
			++this.rollNum;
			if (this.rollNum >= 9) {
				egret.Tween.removeTweens(this.imgBox);
				this.rotationComplete();
			}
		}, this);
	}

	private rotationComplete() {
		this.imgBox.source = this.conf.imgOpen;
		this.movieComplete();
	}

	private movieComplete() {
		// TimerManager.ins().doTimer(300, this.rewardList.length, this.showUp, this);
		let count = this.rewardList.length;
		let waitTime: number = 0;
		for (let i = 0; i < count; i++) {
			this.items[i] = this.createItem(this.rewardList[i]);
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			let posX: number = (i % 5) * 96 + 3;
			let posY: number = Math.floor(i / 5) * 106 + 205;
			this.items[i].alpha = 0;
			t.wait(waitTime).to({ x: posX, y: posY, alpha: 1 }, 200);
			waitTime += 500;
		}

		this.boxBgMc = this.boxBgMc || new MovieClip();
		this.boxBgMc.x = 0;
		this.boxBgMc.y = 50;
		this.boxBgMc.playFile(RES_DIR_EFF + "laddercircle", -1);
		this.bgGroup.addChild(this.boxBgMc);
		// TimerManager.ins().doTimer(2000, 1, () => {
		// 	ViewManager.ins().close(BoxOpenWin);
		// }, this);
	}

	private createItem(data: RewardData): ItemBase {
		let item = new ItemBase();
		this.listCon.addChild(item);
		item.data = data;
		item.x = 204;
		item.y = 52;
		return item;
	}

	private index: number = 0;

	private showUp() {
		let tar = this.list.getElementAt(this.index) as ItemBase;
		++this.index;
		tar.visible = true;
		let t = egret.Tween.get(tar);
		t.to({ alpha: 0 }, 200);
	}
}
ViewManager.ins().reg(BoxOpenWin, LayerManager.UI_Main);