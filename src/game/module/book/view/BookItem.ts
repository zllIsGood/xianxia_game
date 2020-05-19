class BookItem extends BaseItemRender {
	public imgBox: eui.Image;
	public imgBook: eui.Image;
	public quality0: eui.Image;
	public quality1: eui.Image;
	public quality2: eui.Image;
	public quality3: eui.Image;
	public quality: eui.Image;
	public quality4: eui.Image;
	public labelName: eui.Label;
	// public labelPower: eui.Label;
	public redPoint: eui.Group;
	public txt0: eui.Label;
	private pown: eui.BitmapLabel;
	// private starList: StarList;
	public rect: eui.Rect;
	public manji: eui.Image;
	public weiji: eui.Image;
	// public pownGP: eui.Group;
	public kejihuo: eui.Image;
	public tw: egret.Tween;
	public constructor() {
		super();
		this.skinName = `tujianskinstate`;
		// this.starList = new StarList(10, 0, 43, 0);
		// this.starList.x = 40;
		// this.starList.y = -218;
		// this.starList.scaleX = 0.3;
		// this.starList.scaleY = 0.3;
		// this.addChild(this.starList);

		this.tw = egret.Tween.get(this.kejihuo, { loop: true });
		this.tw.to({ scaleX: this.kejihuo.scaleX + 0.3, scaleY: this.kejihuo.scaleY + 0.3 }, 500).
			to({ scaleX: this.kejihuo.scaleX, scaleY: this.kejihuo.scaleY }, 500);

	}

	protected dataChanged() {
		let id = this.data as number;
		let bookData = Book.ins().getBookById(id);
		let confBase = GlobalConfig.DecomposeConfig[id]
		let level = bookData.level > -1 ? bookData.level : 0;
		let conf = GlobalConfig.CardConfig[id][level];
		//获取是此图鉴所属职业 非职业图鉴roleJob是undefine
		let roleJob: number;
		for (let i in GlobalConfig.SuitConfig) {
			let scfg: SuitConfig = GlobalConfig.SuitConfig[i][1];
			let sid: number = scfg.idList.indexOf(id);//找到图鉴所属套装id
			if (sid == -1) {
				continue;
			}
			roleJob = Book.jobs.indexOf(Number(i));//是否职业图鉴
			if (roleJob != -1) {
				break;
			}
			roleJob = undefined;
		}
		let state = bookData.getState(roleJob);
		this.quality0.source = this.quality1.source = this.quality2.source = this.quality3.source = "tujian_" + confBase.quality + "c";
		this.quality.source = "tujian_" + confBase.quality + "a";
		this.quality4.source = "tujian_" + confBase.quality + "b";
		this.setStar(level);

		let power = UserBag.getAttrPower(conf.attrs);
		power = Book.ins().getBookPowerNum(power, confBase.id);

		this.pown.text = power + "";


		// this.pownGP.addChild(this.pown);
		this.rect.visible = false;
		this.weiji.visible = false;
		this.manji.visible = false;
		this.kejihuo.visible = false;
		// egret.log("oo:" + confBase.imgLight);
		if (bookData.level == 10) {
			this.manji.visible = true;
			this.redPoint.visible = false;
			this.imgBox.source = `${confBase.imgLight}`;
		} else {
			switch (state) {
				case BookState.canOpen:
					this.imgBox.source = `${confBase.imgLight}`;
					this.redPoint.visible = false;//true
					// this.setStar(0);
					this.rect.visible = true;
					this.kejihuo.visible = true;
					break;
				case BookState.haveOpen:
					this.imgBox.source = `${confBase.imgLight}`;
					// this.setStar(bookData.level);
					let needScore = bookData.getNextLevelCost();
					this.redPoint.visible = needScore && Book.ins().score >= needScore;
					break;
				case BookState.noOpen:
					this.imgBox.source = `${confBase.imgLight}`;
					this.redPoint.visible = false;
					// this.setStar(0);
					this.rect.visible = true;
					this.weiji.visible = true;
					break;
				default:
					this.imgBox.source = `${confBase.imgLight}`;
					break;
			}
		}
		// this.labelPower.text = `${conf.power}`;
		this.labelName.text = confBase.name;
		this.labelName.textColor = ItemBase.QUALITY_COLOR[confBase.quality];
		// this.currentState = `${state}`;
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);

	}
	public onRemove() {
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		egret.Tween.removeTweens(this.kejihuo);
	}
	public setRemoveTween(v: boolean) {
		if (v)
			egret.Tween.removeTweens(this.kejihuo);
	}
	public setStar(num: number) {
		for (let i = num; i < 10; i++) {
			this[`imgStar${i}`].visible = false;
		}

		for (let i = 0; i < num; i++) {
			this[`imgStar${i}`].visible = true;
		}

	}

	protected getCurrentState(): string {
		let state = "notactive";
		// if (!this.enabled) {
		// 	state = "disabled";
		// }
		// if (this.touchCaptured) {
		// 	state = "down";
		// }
		// if (this._selected) {
		// 	let selectedState = state + "AndSelected";
		// 	let skin = this.skin;
		// 	if (skin && skin.hasState(selectedState)) {
		// 		return selectedState;
		// 	}
		// 	return state == "disabled" ? "disabled" : "down";
		// }
		return state;
	}

}