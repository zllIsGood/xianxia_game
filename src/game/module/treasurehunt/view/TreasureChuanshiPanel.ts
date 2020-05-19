class TreasureChuanshiPanel extends BaseView {

	public gift0: ItemBase;
	public gift1: ItemBase;
	public gift2: ItemBase;
	public gift3: ItemBase;
	public gift4: ItemBase;
	public gift5: ItemBase;
	public gift6: ItemBase;
	public gift7: ItemBase;
	public gift8: ItemBase;
	public gift9: ItemBase;
	public gift10: ItemBase;
	public gift11: ItemBase;

	public maxHopeValue0: eui.Image;
	public hopeValue0: eui.BitmapLabel;
	public bar0: eui.ProgressBar;
	public bar1: eui.ProgressBar;
	public bar2: eui.ProgressBar;
	public bar3: eui.ProgressBar;
	public bar4: eui.ProgressBar;
	public box0: eui.Image;
	public time0: eui.Label;
	public done0: eui.Label;
	public boxPoint0: eui.Image;
	public box1: eui.Image;
	public time1: eui.Label;
	public done1: eui.Label;
	public boxPoint1: eui.Image;
	public box2: eui.Image;
	public time2: eui.Label;
	public done2: eui.Label;
	public boxPoint2: eui.Image;
	public box3: eui.Image;
	public time3: eui.Label;
	public done3: eui.Label;
	public boxPoint3: eui.Image;
	public box4: eui.Image;
	public time4: eui.Label;
	public done4: eui.Label;
	public boxPoint4: eui.Image;
	public times: eui.BitmapLabel;
	public buy1: eui.Button;
	public buy10: eui.Button;
	public zbHunt10: eui.Group;
	public zb10: eui.Label;
	public zbHunt1: eui.Group;
	public zb1: eui.Label;
	public num1: eui.Label;
	public num0: eui.Label;
	public barList: eui.Scroller;
	public list: eui.List;
	public btnGroup: eui.Group;
	public outBag: eui.Button;
	public redPoint2: eui.Image;
	public leftTimeTxt: eui.Label;
	public redPoint3: eui.Image;

	private eff: MovieClip;

	private endedTime: number;

	private maskShape: egret.Shape;

	private addBoxEvent: boolean = false;

	public constructor() {
		super();
		this.name = "诛仙";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		var len: number = GlobalConfig.HeirloomTreasureConfig.boxes.length;
		var gift: ItemBase;
		for (let i: number = 0; i < len; i++) {
			gift = this["gift" + i];
			gift.data = GlobalConfig.HeirloomTreasureConfig.boxes[i];
			// if (gift.getItemType() == 17)
			// 	gift.showSpeicalDetail = false;
		}

		this.eff = new MovieClip;
		this.eff.x = 59;
		this.eff.y = 23;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
		this.list.itemRenderer = HuntListRenderer;

		this.zb1.text = GlobalConfig.HeirloomTreasureConfig.huntOnce + "";
		this.zb10.text = GlobalConfig.HeirloomTreasureConfig.huntTenth + "";
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.buy1, this.onBuy);
		this.addTouchEvent(this.buy10, this.onBuy);
		this.addTouchEvent(this.outBag, this.onBuy);
		this.observe(Heirloom.ins().postHuntRecord, this.listRefush);
		this.observe(UserBag.ins().postItemAdd, this.setRedStatu);
		this.observe(Heirloom.ins().postHuntBoxInfo, this.updateBox);
		this.observe(Heirloom.ins().postHuntResult, this.updateMaterial);

		this.listRefush();
		Heirloom.ins().sendHuntRecord();
		this.updateBox();
		this.addBoxEvent = true;
		this.updateMaterial();
		this.setRedStatu();

		let leftDate = DateUtils.calcWeekFirstDay();
		this.endedTime = leftDate.getTime() / 1000;
		TimerManager.ins().remove(this.timeClock, this);
		TimerManager.ins().doTimer(1000, 0, this.timeClock, this);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.buy1, this.onBuy);
		this.removeTouchEvent(this.buy10, this.onBuy);
		this.removeTouchEvent(this.outBag, this.onBuy);
		this.removeObserve();
		DisplayUtils.removeFromParent(this.eff);
		TimerManager.ins().remove(this.timeClock, this);
		this.addBoxEvent = false;
	}

	//倒计时
	private timeClock() {
		this.endedTime -= 1;
		if (this.endedTime <= 0) {
			let leftDate = DateUtils.calcWeekFirstDay();
			this.endedTime = leftDate.getTime() / 1000;
		}

		this.leftTimeTxt.text = DateUtils.getFormatBySecond(this.endedTime, DateUtils.TIME_FORMAT_5, 4);
	}

	private listRefush(): void {
		this.list.dataProvider = new eui.ArrayCollection(Heirloom.ins().huntRecords);
	}

	private onBuy(e: egret.TouchEvent) {
		switch (e.target) {
			case this.buy1:
				this.buyHunt(0);
				break;
			case this.buy10:
				this.buyHunt(1);
				break;
			case this.outBag:
				ViewManager.ins().open(TreasureStorePanel, DepotType.Heirloom);
				break;
			default:
				break;
		}
	}

	private buyHunt(type: number): void {
		//免费寻宝
		if (type == 0 && Heirloom.ins().huntFreeTimes > 0) {
			Heirloom.ins().sendHunt(type);
			return;
		}

		//寻10次(扣除现有寻宝图数 即有几张图寻几次)
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.HeirloomTreasureConfig.huntItem);
		if (item) {
			Heirloom.ins().sendHunt(type);
			return;
		}

		let huntOnce: number = type == 0 ? GlobalConfig.HeirloomTreasureConfig.huntOnce : GlobalConfig.HeirloomTreasureConfig.huntTenth;
		if (Actor.yb >= huntOnce)
			Heirloom.ins().sendHunt(type);
		else
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
	}

	private setRedStatu(): void {
		let boo: boolean = Boolean(UserBag.ins().getHuntGoods(2).length);
		if (boo) {
			this.outBag.parent.addChildAt(this.eff, this.getChildIndex(this.outBag));
			this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
		} else {
			DisplayUtils.removeFromParent(this.eff);
		}
		this.redPoint2.visible = boo;
	}

	private updateBox(): void {
		let lenBox: number = Heirloom.ins().huntBoxInfo.length;
		let state: number;
		let config: HeirloomTreasureRewardConfig;
		let i: number = 0;
		for (let k in GlobalConfig.HeirloomTreasureRewardConfig) {
			config = GlobalConfig.HeirloomTreasureRewardConfig[k];
			this["time" + i].text = config.needTime + "次";

			this["time" + i].visible = true;
			this["done" + i].visible = false;
			this["boxPoint" + i].visible = false;
			this["bar" + i].value = 0;
			this["box" + i].source = "200116_0_png";
			this["box" + i].name = "box" + (i + 1);
			if (!this.addBoxEvent)
				this.addTouchEvent(this["box" + i], this.onGetAward);

			if (i < lenBox) {
				state = Heirloom.ins().huntBoxInfo[i];
				if (state == Heirloom.CANGET) {
					this["box" + i].source = "200116_png";
					this["bar" + i].value = 100;
					this["boxPoint" + i].visible = true;

				}
				else if (state == Heirloom.ISNGET) {
					this["time" + i].visible = false;
					this["done" + i].visible = true;
					this["bar" + i].value = 100;
				}
			}

			i++;
		}

		this.hopeValue0.text = Heirloom.ins().huntHope + "";
		this.times.text = Heirloom.ins().huntTimes + "";
		this.maskImage();
		this.redPoint3.visible = Heirloom.ins().huntFreeTimes > 0;
		this.buy1.label = Heirloom.ins().huntFreeTimes > 0 ? "免费寻宝" : "寻宝一次";
	}

	private maskImage() {
		let curPross = Heirloom.ins().huntHope;
		let maxPross = GlobalConfig.HeirloomTreasureConfig.maxBlissVal;
		let percent = Math.min(Math.floor(0.01 * Math.pow(curPross, 0.74) * maxPross) / maxPross, 1);//显示百分比


		if (!this.maskShape) {
			this.maskShape = new egret.Shape();

		}else{
			this.maskShape.graphics.clear();
		}


		this.maskShape.graphics.beginFill(0xffff00);
		this.maskShape.graphics.drawRect(this.maxHopeValue0.x, this.maxHopeValue0.y, this.maxHopeValue0.width, this.maxHopeValue0.height);
		this.maskShape.graphics.endFill();
		this.maxHopeValue0.parent.addChild(this.maskShape);
		this.maxHopeValue0.mask = this.maskShape;


		this.maskShape.y = this.maxHopeValue0.height * (1 - percent);
	}

	private onGetAward(e: egret.TouchEvent) {
		let index: number = e.target.name.slice(3, 4);
		var state = Heirloom.ins().huntBoxInfo[index - 1];
		if (state == Heirloom.CANGET)
			Heirloom.ins().sendHuntAward(index);
		else
			ViewManager.ins().open(HuntBoxsTips, index, 2);
	}

	private updateMaterial(): void {
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.HeirloomTreasureConfig.huntItem);
		let colorStr: string = "";
		let sum: number = 0;
		if (item) {
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		} else {
			colorStr = ColorUtil.RED_COLOR;
		}
		let txt = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.num1.textFlow = this.num0.textFlow = txt;
	}

}