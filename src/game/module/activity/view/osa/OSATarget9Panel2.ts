class OSATarget9Panel2 extends BaseView {

	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime1: eui.Label;
	public actInfo1: eui.Label;
	public list: eui.List;
	public price: PriceIcon;
	public turnten: eui.CheckBox;
	public reward: eui.Group;
	public bar0: eui.ProgressBar;
	public bar1: eui.ProgressBar;
	public bar2: eui.ProgressBar;
	public barbg: eui.Image;
	public reward0: snowBabyItemRender;
	public reward1: snowBabyItemRender;
	public reward2: snowBabyItemRender;
	public reward3: snowBabyItemRender;
	public arrowleft: eui.Image;
	public arrowright: eui.Image;
	public barList: eui.Scroller;
	public list0: eui.List;
	public buyBtn: eui.Button;
	public redPointLeft: eui.Image;
	public redPointRight: eui.Image;
	public effLocation: eui.Group;
	public costIcon: eui.Image;
	public costNum: eui.Label;

	private _activityID: number;

	private _recordCollect: ArrayCollection;

	private _curAwardPage: number = 1;

	private _maxAwardPages: number = 1;

	private _fireEff: MovieClip;
	private actType: number;

	private config: ActivityType9Config;
	private ins: Activity;

	public constructor() {
		super();
		//this.skinName = "NYFireworkerSkin";
	}

	public childrenCreated(): void {
		super.childrenCreated();

	}

	private init() {
		this.list.itemRenderer = ItemBase;
		this.list0.itemRenderer = NoticeListRenderer;

		let config: ActivityType9Config;
		let reward: RewardData;
		let datas: any[] = [];
		for (let i: number = 1; i <= 8; i++) {
			config = GlobalConfig.ActivityType9Config[this.activityID][i];
			reward = new RewardData();
			reward.type = config.reward[0].type;
			reward.id = config.reward[0].id;
			reward.count = config.reward[0].count;
			datas[i - 1] = reward;
		}

		this.list.dataProvider = new ArrayCollection(datas);
	}

	public get activityID(): number {
		return this._activityID;
	}

	public set activityID(value: number) {
		this._activityID = value;
		if (isNaN(this.actType)) {
			this.actType = ActivityPanel.getActivityTypeFromId(this._activityID);
		}
		this.setCurSkin();
	}

	private setCurSkin(): void {
		let aCon: ActivityConfig;
		aCon = GlobalConfig.ActivityConfig[this.activityID];

		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "NYFireworkerSkin";
	}

	public open(...param: any[]): void {
		this.setCurSkin();
		this.init();
		let ins: Activity;
		ins = Activity.ins();
		this.actInfo1.text = GlobalConfig.ActivityConfig[this.activityID].desc;
		
		this.observe(ins.postActivityIsGetAwards, this.updateData);
		this.observe(ins.postChangePage, this.resultCallBack);
		this.addTouchEvent(this, this.onTouch);

		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		this.removeTouchEvent(this, this.onTouch);

		TimerManager.ins().removeAll(this);
		DisplayUtils.removeFromParent(this._fireEff);
		this.turnten.selected = false;
	}

	private updateMaterial(): void {
		let item = UserBag.ins().getBagGoodsByTypeAndId(0, this.config.item);
		let count: number = item ? item.count : 0;
		this.costNum.textFlow = TextFlowMaker.generateTextFlow1(`|C:${count ? ColorUtil.GREEN_COLOR_N : ColorUtil.RED_COLOR_N}&T:${count}|`);
	}

	private onTouch(e: egret.TouchEvent) {
		switch (e.target) {
			case this.buyBtn:
				let item: ItemData = UserBag.ins().getBagGoodsByTypeAndId(UserBag.BAG_TYPE_OTHTER, this.config.item);
				if (item && item.count) {
					this.onSend();
				}
				else {
					let times: number = this.turnten.selected ? 10 : 1;
					let total: number = this.config.yb * times;
					HuntWarnBuyWin.showBuyWarn("LuckyResultWin" + this.activityID + (times == 10 ? "-10" : "-1"), this.huntWarnFun.bind(this), `是否消耗${total}元宝购买${GlobalConfig.ItemConfig[this.config.item].name}*${times}`)
				}
				break;
			case this.reward0:
			case this.reward1:
			case this.reward2:
			case this.reward3:
				let data = e.target.data;
				if (data.state == 0) //不能领取
					ViewManager.ins().open(ItemDetailedWin, 0, data.id, data.count);
				else if (data.state == 1) //可领取
				{
					this.flyItemEx(e.target);
					this.ins.sendReward(this.activityID, 0, data.index);
				}
				break;
			case this.arrowleft:
				if (this._curAwardPage > 1) {
					this._curAwardPage--;
					this.updateAwardPage();
				}
				break;
			case this.arrowright:
				if (this._curAwardPage < this._maxAwardPages) {
					this._curAwardPage++;
					this.updateAwardPage();
				}
				break;
		}
	}

	private huntWarnFun(): void {
		let times: number = this.turnten.selected ? 10 : 1;
		let total: number = this.config.yb * times;
		if (Actor.yb >= total) {
			this.onSend();
		}
		else {
			UserTips.ins().showTips("元宝不足");
		}
	}

	private onSend(): void {
		if (this.turnten.selected)
			this.ins.sendReward(this.activityID, 2);
		else {
			//类型9转盘活动单抽时需要发两次协议（爆竹活动没有抽奖动画所以直接发两条协议）
			this.ins.sendReward(this.activityID, 1);
			this.ins.sendReward(this.activityID, 1);
			if (!this._fireEff)
				this._fireEff = new MovieClip();

			if (!this._fireEff.parent) {
				this.effLocation.addChild(this._fireEff);
				this._fireEff.scaleX = this.effLocation.scaleX;
				this._fireEff.scaleY = this.effLocation.scaleY;
			}

			this._fireEff.playFile(RES_DIR_EFF + "yanhuaeff", 1);
		}
	}

	private setCurAwardPage(): void {
		let config: ActivityType9Config;
		let data: ActivityType9Data;
		config = GlobalConfig.ActivityType9Config[this.activityID][0];
		data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		
		this._maxAwardPages = config.reward.length / 4;

		if (!data) {
			this._curAwardPage = 1;
			return;
		}

		let len: number = config.reward.length;
		for (let i: number = 0; i < len; i++) {
			if (!(data.record >> (i + 1) & 1))//未领取
			{
				this._curAwardPage = Math.floor(i / 4) + 1;
				return;
			}
		}

		this._curAwardPage = 1;
	}

	public updateData(): void {
		let data: ActivityType9Data;
		let config9: ActivityType9Config[][];
		this.ins = Activity.ins();
		this.config = GlobalConfig.ActivityType9Config[this.activityID][0];
		data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		config9 = GlobalConfig.ActivityType9Config;

		this.price.setText(this.config.yb + "");
		this.price.setType(MoneyConst.yuanbao);
		this.costIcon.source = GlobalConfig.ItemConfig[this.config.item].icon + '_png';

		this.setCurAwardPage();
		this.updateAwardPage();

		//购买记录
		if (!this._recordCollect) {
			this._recordCollect = new ArrayCollection();
			this.list0.dataProvider = this._recordCollect;
		}

		if (data) {
			let arr = [];
			let len: number = data.noticeArr.length;
			let notice: any;
			for (let i = 0; i < len; i++) {
				let config: ActivityType9Config = config9[this.activityID][data.noticeArr[i].index];
				notice = {
					activityID: this.activityID,
					name: data.noticeArr[i].name,
					index: data.noticeArr[i].index,
					des: config ? config.middleDesc : null,
					actType: this.actType
				};
				arr.push(notice);
			}

			this._recordCollect.source = arr;
		}
		else
			this._recordCollect.source = null;

		//时间
		this.setTime();

		this.updateMaterial();
	}

	private updateAwardPage(): void {
		let config9: ActivityType9Config[][];
		let data: ActivityType9Data;
		config9 = GlobalConfig.ActivityType9Config;
		data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		
		this.arrowleft.visible = this._curAwardPage > 1;
		this.arrowright.visible = this._curAwardPage < this._maxAwardPages;
		let config: ActivityType9Config = config9[this.activityID][0];
		this.redPointLeft.visible = this.redPointRight.visible = false;
		if (!data)
			return;

		let curTimes: number = data.count;
		let index: number = 0;
		let state: number = 0;
		let cTimes: number = 0;
		let pTimes: number = 0;
		for (let i: number = 1; i <= this._maxAwardPages; i++) {
			for (let j: number = 0; j < 4; j++) {
				index = (i - 1) * 4 + j;
				if (data.record >> (index + 1) & 1) //已领取
					state = 2;
				else if (curTimes >= config.reward[index].times) //可领取
					state = 1;
				else
					state = 0;

				if (i == this._curAwardPage) {
					this["reward" + j].data = {
						id: config.reward[index].id,
						type: config.reward[index].type,
						count: config.reward[index].count,
						index: index + 1,
						state: state,
						times: config.reward[index].times,
						curTimes: curTimes
					};

					if (j > 0) {
						cTimes = this["reward" + j].data.times;
						if (curTimes >= cTimes) {
							this["bar" + (j - 1)].maximum = 100;
							this["bar" + (j - 1)].value = 100;
						}
						else {
							pTimes = this["reward" + (j - 1)].data.times;
							this["bar" + (j - 1)].maximum = cTimes - pTimes;
							this["bar" + (j - 1)].value = curTimes <= pTimes ? 0 : curTimes - pTimes;
						}
					}
				}
				else if (i < this._curAwardPage) {
					if (state == 1) {
						this.redPointLeft.visible = true;
						break;
					}
				}
				else {
					if (state == 1) {
						this.redPointRight.visible = true;
						break;
					}
				}
			}
		}
	}

	private resultCallBack(id: number) {
		let data: ActivityType9Data;
		data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		
		if (!data || this.activityID != id) return;
		if (data.indexs.length > 1){
			ViewManager.ins().open(LuckyResultWin, this.activityID, data.indexs);//10连抽返回 弹出奖励界面
			data.indexsEx = [];
		}else if (data.indexsEx.length) {
			ViewManager.ins().open(LuckyResultWin, this.activityID, data.indexsEx);
			data.indexsEx = [];
		}
		this.updateMaterial();
	}

	private flyItemEx(itemicon: snowBabyItemRender) {
		let flyItem: eui.Image = new eui.Image(itemicon.box.source);
		flyItem.x = itemicon.box.x;
		flyItem.y = itemicon.box.y;
		flyItem.width = itemicon.box.width;
		flyItem.height = itemicon.box.height;
		flyItem.scaleX = itemicon.box.scaleX;
		flyItem.scaleY = itemicon.box.scaleY;
		itemicon.box.parent.addChild(flyItem);
		GameLogic.ins().postFlyItemEx(flyItem);
	}

	private setTime() {
		let data: ActivityType9Data;
		data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		this.actTime1.text = data.getRemainTime();
	}
}