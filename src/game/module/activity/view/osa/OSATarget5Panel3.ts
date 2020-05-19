class OSATarget5Panel3 extends BaseView {

	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime1: eui.Label;
	public actInfo1: eui.Label;
	public group1: eui.Group;
	public suerBtn: eui.Button;
	public daylabel: eui.Label;
	public dayaward: eui.Label;
	public redPoint: eui.Image;
	public done: eui.Label;

	private itemary: ItemBase[] = [];
	private itemList: ActivityHFRenderItem[] = [];
	private _activityID: number;
	private _activityData: ActivityType5Data;
	private btnMC: MovieClip;
	private maxNum: number;
	private day: number;
	private dayindex: number = 1;

	public constructor() {
		super();
		//this.skinName = 'NYLogSkin';
	}

	public get activityID(): number {
		return this._activityID;
	}

	public set activityID(value: number) {
		this._activityID = value;
		this.setCurSkin();
	}

	private setCurSkin(): void {
		let aCon: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "NYLogSkin";
	}

	public open(...param: any[]): void {
		egret.setTimeout(()=>{
			this.setCurSkin();
			let config: ActivityType5Config[] = GlobalConfig.ActivityType5Config[this.activityID];
			this.actInfo1.text = GlobalConfig.ActivityConfig[this.activityID].desc;

			this.itemList = [];
			this.maxNum = Object.keys(config).length;
			for (let i: number = 0; i < this.maxNum; i++) {
				this.itemList[i] = this['dayNum' + (i + 1)];
				this.addTouchEvent(this.itemList[i], this.itemTouch);
				this.itemList[i].item.hideName();
			}

			this._activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType5Data;
			this.addTouchEvent(this.suerBtn, this.onTouch);

			this.observe(Activity.ins().postActivityIsGetAwards, this.changeList);
			TimerManager.ins().doTimer(1000, 0, this.setTime, this);
			this.updateData();
			let dayNum: number = param[0];
			if (dayNum)
				this.setList(dayNum);
		},this,0);
	}

	public close(...param: any[]): void {
		DisplayUtils.removeFromParent(this.btnMC);
		this.itemList.length = 0;
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}

	private changeList(): void {
		let day: number = 1;
		let dayNum: number = (this._activityData as ActivityType5Data).getCurDay();
		if (!dayNum)
			dayNum = day;

		if (dayNum >= this.maxNum)
			day = this.maxNum;
		else
			day = dayNum;

		for (let i: number = 1; i <= day; i++) {
			let config: any = GlobalConfig['ActivityType5Config'][this.activityID][(i) + ""];
			if (dayNum >= config.day) {
				if ((this._activityData.recrod >> config.day & 1) == 0) {
					this.setList(i);
					return;
				}
			}
		}
		this.setList(day + 1);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.suerBtn:
				if ((this._activityData as ActivityType5Data).getCurDay() >= this.day)
					Activity.ins().sendReward(this.activityID, this.day);
				else
					UserTips.ins().showTips("|C:0xf3311e&T:登陆天数不足，无法领取|");
				break;
		}
	}

	private itemTouch(e: egret.TouchEvent): void {
		this.setList(e.currentTarget.data)
	}

	private setList(index: number = -1): void {
		if (index == -1) {
			index = this.dayindex;
		}
		if (index > this.maxNum) {
			index = this.maxNum;
		}
		this.dayindex = index;
		let conf: any = GlobalConfig['ActivityType5Config'][this.activityID][(index) + ""];
		let list: RewardData[] = conf.rewards;
		this.day = conf.day;
		let today: number = 1;
		today = (this._activityData as ActivityType5Data).getCurDay();
		this.daylabel.text = `登陆天数：${today}`;
		let flag: boolean = ((this._activityData.recrod >> this.day & 1) == 1);
		this.dayaward.text = `第${TextFlowMaker.numberToChinese(index)}天奖励详情`
		this.suerBtn.visible = true;
		this.done.visible = false;
		if (today >= this.day) {
			if (!flag) {
				this.btnMC = this.btnMC || new MovieClip;
				this.btnMC.x = this.suerBtn.width / 2;
				this.btnMC.y = this.suerBtn.height / 2;
				this.btnMC.playFile(RES_DIR_EFF + "chargebtn", -1);
				this.suerBtn.addChild(this.btnMC);
				this.redPoint.visible = true;
			} else {
				this.suerBtn.visible = false;
				this.redPoint.visible = false;
				this.done.visible = true;
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

		for (let i: number = 0; i < this.maxNum; i++) {
			this.itemList[i].activityID = this.activityID;
			this.itemList[i].data = i + 1;
			if (i + 1 == index || (i + 1 == this.maxNum && index == this.maxNum)) {
				this.itemList[i].setSelectImg(true);
			} else {
				this.itemList[i].setSelectImg(false);
			}
		}
	}

	updateData() {
		this.changeList();
		this.setTime();
	}

	private setTime() {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime1.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime1.text = "活动已结束";
		} else {
			this.actTime1.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
	}
}


