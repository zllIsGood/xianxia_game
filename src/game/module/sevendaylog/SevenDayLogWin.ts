/**
 * 七天登录
 */
class SevenDayLogWin extends BaseView {

	// public image0: eui.Image;
	// public image1: eui.Image;
	// public image2: eui.Image;
	// public image3: eui.Image;
	// public image4: eui.Image;
	// public image5: eui.Image;
	// public image6: eui.Image;
	// public image7: eui.Image;

	// public closeBtn0: eui.Button;
	// public closeBtn: eui.Button;

	// public sureImg7: eui.Image;
	// public sureImg6: eui.Image;
	// public sureImg5: eui.Image;
	// public sureImg4: eui.Image;
	// public sureImg3: eui.Image;
	// public sureImg2: eui.Image;
	// public sureImg1: eui.Image;
	// public sureImg0: eui.Image;

	public group1: eui.Group;

	public group: eui.Group;
	public suerBtn: eui.Button;

	private itemary: ItemBase[] = [];

	public daylabel: eui.Label;

	private btnMC: MovieClip;
	private day: number;
	private dayindex: number = 0;
	private dayaward: eui.Label;
	private scroller: eui.Scroller;

	private itemList: SevenDayItemRender[] = [];
	private redPoint: eui.Image;
	constructor() {
		super();
		this.skinName = "act14logSkin";
		this.itemary = [];
		this.itemList = [];
		for (let i: number = 0; i < 14; i++) {
			this.itemList[i] = this['dayNum' + (i + 1)];
			this.itemList[i].touchEnabled = false;
		}
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.suerBtn, this.onTouch);
		// this.addTouchEvent(this.itemList, this.onTouch);
		this.addTouchEvent(this.group, this.onTouch);
		for (let i: number = 0; i < 14; i++) {
			this.addTouchEvent(this.itemList[i], this.itemTouch);
		}

		let actIns = Activity.ins();
		this.observe(actIns.postSevendayAwardCallback, this.setList);
		this.observe(actIns.postSevendayIsAwards, this.changeList);

		this.changeList();
		this.showRedPoint();
		let dayNum: number = param[0];
		if (dayNum) {
			this.setList(dayNum);
		}

		if (this.dayindex > 7) {
			TimerManager.ins().doNext(() => {
				this.scroller.viewport.scrollV = this.scroller.viewport.contentHeight - this.scroller.height;
			}, this);
		}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.suerBtn, this.onTouch);
		this.removeTouchEvent(this.group, this.onTouch);
		DisplayUtils.removeFromParent(this.btnMC);
		for (let i: number = 0; i < 14; i++) {
			this.removeTouchEvent(this.itemList[i], this.itemTouch);
		}
		this.removeObserve();
	}

	private changeList(): void {
		let day: number = 0;
		let dayNum: number = Activity.ins().dayNum;
		if (dayNum >= 14)
			day = 13;
		else
			day = dayNum;
		for (let i: number = 1; i <= day; i++) {
			let config: LoginRewardsConfig = GlobalConfig.LoginRewardsConfig[i];
			if (config) {
				if (dayNum >= config.day) {
					if ((Activity.ins().isAwards >> config.day & 1) == 0) {
						this.setList(i - 1);
						return;
					}
				}
			}
		}
		this.setList(day);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.group:
				this.setList(this.group.getChildIndex(e.target));
				break;
			case this.suerBtn:
				let actIns = Activity.ins();
				if (actIns.dayNum >= this.day)
					actIns.sendGetSevenDayAwards(this.day);
				else
					UserTips.ins().showTips("|C:0xf3311e&T:登陆天数不足，无法领取|");
				break;
		}
	}

	private itemTouch(e: egret.TouchEvent): void {
		this.setList(e.currentTarget.data - 1)
	}


	private setList(index: number = -1): void {
		if (index == -1) {
			index = this.dayindex;
		}
		this.dayindex = index;

		let list: RewardData[];
		let len: number = CommonUtils.getObjectLength(GlobalConfig.LoginRewardsConfig);

		list = GlobalConfig.LoginRewardsConfig[index + 1].rewards;
		this.day = GlobalConfig.LoginRewardsConfig[index + 1].day;
		let today: number = 0;
		let actIns = Activity.ins();
		today = actIns.dayNum;
		this.daylabel.text = `登陆天数：${today}`;
		this.daylabel.visible = true;
		let flag: boolean = ((actIns.isAwards >> this.day & 1) == 1);
		this.dayaward.text = `第${TextFlowMaker.numberToChinese(index + 1)}天奖励详情`
		this.suerBtn.visible = true;
		if (actIns.dayNum >= this.day) {
			if (!flag) {
				this.btnMC = this.btnMC || new MovieClip;
				this.btnMC.x = 80;
				this.btnMC.y = 26;
				this.btnMC.playFile(RES_DIR_EFF + "chargebtn", -1);
				this.suerBtn.addChild(this.btnMC);
				this.redPoint.visible = true;
			} else {
				this.daylabel.visible = false;
				this.suerBtn.visible = false;
				this.redPoint.visible = false;
			}
		} else {
			DisplayUtils.removeFromParent(this.btnMC);
			this.suerBtn.visible = false;
			this.redPoint.visible = false;
		}
		this.itemary.forEach(element => {
			if (element.parent) {
				element.parent.removeChild(element);
				element = null;
			}
		});
		this.itemary = [];
		for (let i: number = 0; i < list.length; i++) {
			let item: ItemBase = new ItemBase();
			this.group1.addChild(item);
			item.data = list[i];
			this.itemary.push(item);
		}

		for (let i: number = 0; i < 14; i++) {
			this.itemList[i].data = i + 1;
			if (i == index || (i == 13 && index == 13)) {
				this.itemList[i].setSelectImg(true);
			} else {
				this.itemList[i].setSelectImg(false);
			}
		}
		this.showRedPoint();
	}

	private showRedPoint(): void {

	}
}
// ViewManager.ins().reg(SevenDayLogWin,LayerManager.UI_Main);