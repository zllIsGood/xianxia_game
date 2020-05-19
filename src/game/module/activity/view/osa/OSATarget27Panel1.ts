class OSATarget27Panel1 extends BaseView {

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
	public gift12: ItemBase;
	public gift13: ItemBase;

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
	public yb10: eui.Label;
	public zbHunt1: eui.Group;
	public yb1: eui.Label;
	public barList: eui.Scroller;
	public list: eui.List;
	public leftTimeTxt: eui.Label;
	public num: eui.Label;
	public icon1: eui.Image;
	public icon10: eui.Image;
	public num10: eui.Label;
	public jpList: eui.List;
	private endedTime: string;

	private addBoxEvent: boolean = false;

	public activityID: number;

	private huntType: number = 1;

	public constructor(id: number) {
		super();
		this.activityID = id;
		this.setCurSkin();
	}

	private setCurSkin(): void {
		let aCon: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "CETreasureSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		let configs: ActivityType27Config[] = GlobalConfig.ActivityType27Config[this.activityID];
		let config: ActivityType27Config = configs[0];
		let len = config.showDrop.length;
		let gift: ItemBase;
		for (let i: number = 0; i < len && i < 16; i++) {
			gift = this["gift" + i];
			gift.data = config.showDrop[i];
			if (i <= 1)
				gift.setItemHeirloomBgImg(true, "csbk03");
		}

		this.list.itemRenderer = HuntListRenderer;
		this.jpList.itemRenderer = HuntListRenderer;
		for (let k in configs) {
			if (configs[k].count == 1)
				this.yb1.text = configs[k].yb + "";
			else if (configs[k].count == 10)
				this.yb10.text = configs[k].yb + "";
		}
	}

	public open(...param: any[]): void {
		this.setCurSkin();

		this.addTouchEvent(this.buy1, this.onBuy);
		this.addTouchEvent(this.buy10, this.onBuy);

		this.observe(Activity.ins().postChangePage, this.updateData);//单份活动刷新
		// this.updateData();


		// let data = Activity.ins().getActivityDataById(this.activityID) as ActivityType27Data;
		// this.endedTime = data.getLeftTime();
		this.timeClock();
		TimerManager.ins().remove(this.timeClock, this);
		TimerManager.ins().doTimer(1000, 0, this.timeClock, this);
		this.addBoxEvent = true;
		Activity.ins().sendChangePage(this.activityID);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.buy1, this.onBuy);
		this.removeTouchEvent(this.buy10, this.onBuy);
		this.removeObserve();
		TimerManager.ins().remove(this.timeClock, this);
		this.addBoxEvent = false;
	}

	public updateData() {
		this.listRefush();
		this.updateBox();
		this.updateMaterial();
	}

	//倒计时
	private timeClock() {
		let data = Activity.ins().getActivityDataById(this.activityID) as ActivityType27Data;
		if (data) {
			this.endedTime = data.getLeftTime();
			this.leftTimeTxt.text = this.endedTime;
		}
	}

	private listRefush(): void {
		let data = Activity.ins().getActivityDataById(this.activityID) as ActivityType27Data;
		this.list.dataProvider = new eui.ArrayCollection(data.logs);
		this.jpList.dataProvider = new eui.ArrayCollection(data.bestlogs);
	}

	private onBuy(e: egret.TouchEvent) {
		switch (e.target) {
			case this.buy1:
				this.buyHunt(1);
				break;
			case this.buy10:
				this.buyHunt(2);
				break;
			default:
				break;
		}
	}

	private buyHunt(index: number): void {
		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
			ViewManager.ins().open(BagFullTipsWin);
			return;
		}

		this.huntType = index;
		let configs = GlobalConfig.ActivityType27Config[this.activityID];
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, configs[index].item);
		if (item && item.count) {
			Activity.ins().sendReward(this.activityID, index);
		}
		else {
			let times: number = index > 1 ? 10 : 1;
			let huntOnce: number = configs[index].yb;
			HuntWarnBuyWin.showBuyWarn("OSATarget27Panel1-HuntResultWin" + (times == 10 ? 1 : 0), this.huntWarnFun.bind(this), `是否消耗${huntOnce}元宝购买${GlobalConfig.ItemConfig[configs[index].item].name}*${times}`)
		}
	}

	private huntWarnFun(): void {
		let huntOnce: number = GlobalConfig.ActivityType27Config[this.activityID][this.huntType].yb;
		if (Actor.yb >= huntOnce) {
			Activity.ins().sendReward(this.activityID, this.huntType);
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}
	}

	private updateBox(): void {
		let configs: ActivityType27Config[] = GlobalConfig.ActivityType27Config[this.activityID];
		let boxConfig: ActivityType27Config[] = [];
		for (let i in configs) {
			if (configs[i].dbCount)
				boxConfig.push(configs[i]);
		}
		boxConfig.sort((a, b) => {
			return Algorithm.sortAsc(a.dbCount,b.dbCount);
		});

		let data = Activity.ins().getActivityDataById(this.activityID) as ActivityType27Data;

		let state: number;
		let config: ActivityType27Config;
		let i: number = 0;
		let lenBox: number = boxConfig.length;
		let lastCount: number = 0;
		for (let k in boxConfig) {
			config = boxConfig[k];
			this["time" + i].text = config.dbCount + "次";

			this["time" + i].visible = true;
			this["done" + i].visible = false;
			this["boxPoint" + i].visible = false;
			this["bar" + i].value = 0;
			this["bar" + i].maximum = 100;
			this["box" + i].source = "200116_0_png";
			this["box" + i].name = "box" + (config.index);
			if (!this.addBoxEvent)
				this.addTouchEvent(this["box" + i], this.onGetAward);

			if (i < lenBox) {
				state = data.getStateByIndex(config.index);
				if (state == 2) {
					this["box" + i].source = "200116_png";
					this["bar" + i].value = 100;
					this["boxPoint" + i].visible = true;

				}
				else if (state == 1) {
					this["time" + i].visible = false;
					this["done" + i].visible = true;
					this["bar" + i].value = 100;
				}
				else {
					let value = Math.floor((data.num - lastCount) / (config.dbCount - lastCount) * 100);
					if (value < 0) value = 0;
					else if (value > 100) value = 100;
					this["bar" + i].value = value;
				}
			}

			lastCount = config.dbCount;

			i++;
		}

        let itemCfg = GlobalConfig.ItemConfig[configs[1].item];
        if (itemCfg) {
            this.icon10.source = this.icon1.source = itemCfg.icon + `_png`;   
        }
	}

	private onGetAward(e: egret.TouchEvent) {
		let index: number = e.target.name.slice(3, 4);
		let data = Activity.ins().getActivityDataById(this.activityID) as ActivityType27Data;
		var state = data.getStateByIndex(index);
		if (state == 2)
			Activity.ins().sendReward(this.activityID, index);
		else
			ViewManager.ins().open(HuntBoxsTips, index, 3, this.activityID);
	}

	private updateMaterial(): void {
		let item = UserBag.ins().getItemByTypeAndId(0, GlobalConfig.ActivityType27Config[this.activityID][1].item);
		let count: number = item ? item.count : 0;
		this.num.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ count ? ColorUtil.GREEN_COLOR_N : ColorUtil.RED_COLOR_N}&T:${count}|`);
		this.num10.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ count >= 10 ? ColorUtil.GREEN_COLOR_N : ColorUtil.RED_COLOR_N}&T:${count}|`);
	}
}