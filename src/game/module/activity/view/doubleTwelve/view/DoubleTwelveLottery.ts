/**
 * Created by Peach.T on 2017/12/7.
 */
class DoubleTwelveLottery extends ActivityPanel {
	public title: eui.Group;
	public actTime: eui.Label;

	//抽奖
	// item0~item9: BabelLotteryItem;
	private tttzhi: eui.Image;
	private choujiangBtn: eui.Button;

	//消耗
	private pay0: eui.Label;
	private num: eui.Label;
	private icon: eui.Image;
	private getkey: eui.Label;//获取钥匙

	private turnten: eui.CheckBox;//10连抽
	private turntime: eui.Label;//次数

	private list: eui.List;

	//gift0~gift2:ItemBase
	//eff0~eff2:eui.Group
	//isget0~isget2:eui.Group
	//redPoint0~redPoint2:eui.Image
	private rolling: boolean;
	private num2: eui.Label;

	public constructor() {
		super();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		for (let i = 0; i < 3; i++) {
			this.removeTouchEvent(this[`isget${i}`], this.onGiftClick);
		}
		egret.Tween.removeTweens(this.tttzhi);
		this.rolling = false;
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType9Data;
		if (data.indexs.length == 1) {
			//当前在转动中
			Activity.ins().sendReward(this.activityID, 1);
		}
		TimerManager.ins().removeAll(this);
	}

	public open(...param: any[]): void {
		this.observe(Activity.ins().postChangePage, this.resultCallBack);
		this.observe(Activity.ins().postChangePage, this.updateView);
		this.observe(Activity.ins().postRewardResult,this.updateView);
		this.observe(Activity.ins().postActivityIsGetAwards,this.updateView);

		// this.observe(Activity.ins().postRewardResult, this.resultCallBack);//类型9的2号返回消息用7号替代
		// this.addTouchEvent(this.turnten, this.onTouch);
		// this.addTouchEvent(this.getkey, this.onTouch);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.addTouchEvent(this.choujiangBtn, this.getLottery);
		for (let i = 0; i < 3; i++) {
			this.addTouchEvent(this[`isget${i}`], this.onGiftClick);
		}
		this.list.itemRenderer = NoticeListRenderer;

		this.turnten.selected = false;
		this.updateView();
	}

	private onTouch(e: egret.TouchEvent) {
	}

	private updateView(): void {
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType9Data;
		let config: ActivityType9Config = GlobalConfig.ActivityType9Config[this.activityID][0];
		let itemcfg: ItemConfig = GlobalConfig.ItemConfig[config.item];
		if (itemcfg) {
			this.icon.source = itemcfg.icon + "_png";
			let item: ItemData = UserBag.ins().getBagItemById(itemcfg.id);
			let sum = 0;
			let maxsum = 1;
			let colorStr: number = 0xD1C28F;
			if (item) {
				sum = item.count;
				if (sum >= maxsum)
					colorStr = ColorUtil.GREEN;
				else
					colorStr = ColorUtil.RED;
			} else {
				colorStr = ColorUtil.RED;
			}
			this.num.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${sum}|C:0xD1C28F&T:/${maxsum}`);
			this.pay0.text = config.yb + "";
		}

		for (let i in GlobalConfig.ActivityType9Config[this.activityID]) {
			if (!(+i))continue;
			let cfg: ActivityType9Config = GlobalConfig.ActivityType9Config[this.activityID][i];
			let item: BabelLotteryItem = this["item" + (+i - 1)] as BabelLotteryItem;
			item.itemIcon.data = cfg.reward[0];
			item.rewardState(false);//可以无限抽奖 没有已领取状态
		}
		this.num2.visible = false;

		this.updateProgress();
		this.listRefush();
		this.setTime();
	}

	private resultCallBack() {
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType9Data;
		if (data.indexs.length > 1) {
			//10连抽返回 弹出奖励界面
			ViewManager.ins().open(LuckyResultWin, this.activityID, data.indexs);
		} else if (data.indexs.length == 1) {
			//单抽返回(第一次返回索引数组1) 第二次请求
			this.beginLottery(data.indexs[0]);
			// Activity.ins().sendReward(this.activityID,1);
		}
		this.listRefush();
	}

	private beginLottery(index: number): void {
		let rotat: number = 360 * 4 + (index - 1) * 36;
		let tween: egret.Tween = egret.Tween.get(this.tttzhi);
		this.rolling = true;
		tween.to({"rotation": rotat}, 4000, egret.Ease.circOut).call(() => {
			Activity.ins().sendReward(this.activityID, 1);
			this.flyItem(this["item" + (index - 1)] as BabelLotteryItem);
			egret.setTimeout(() => {
				this.rolling = false;
			},this, 2000);
		}, this);
	}

	private flyItem(item: BabelLotteryItem): void {
		var itemBase: ItemBase = new ItemBase();
		itemBase.x = item.x;
		itemBase.y = item.y;
		itemBase.data = item.itemIcon.data;
		itemBase.anchorOffsetX = itemBase.width / 2;
		itemBase.anchorOffsetY = itemBase.height / 2;
		item.parent.addChild(itemBase);
		GameLogic.ins().postFlyItemEx(itemBase);
	}

	private flyItemEx(itemicon: ItemIcon) {
		let flyItem: eui.Image = new eui.Image(itemicon.imgIcon.source);
		flyItem.x = itemicon.imgIcon.x;
		flyItem.y = itemicon.imgIcon.y;
		flyItem.width = itemicon.imgIcon.width;
		flyItem.height = itemicon.imgIcon.height;
		flyItem.scaleX = itemicon.imgIcon.scaleX;
		flyItem.scaleY = itemicon.imgIcon.scaleY;
		itemicon.imgIcon.parent.addChild(flyItem);
		GameLogic.ins().postFlyItemEx(flyItem);
	}

	private getLottery(): void {
		if (this.rolling) {
			UserTips.ins().showTips("正在抽奖，请稍候");
			return;
		}
		if (this.turnten.selected) {
			//10连
			if (Activity.ins().getIsRollTen(this.activityID)) {
				Activity.ins().sendReward(this.activityID, 2);
			} else {
				UserTips.ins().showTips("元宝不足");
			}

		} else {
			if (Activity.ins().getRollSum(this.activityID) || Actor.yb >= GlobalConfig.ActivityType9Config[this.activityID][0].yb) {
				Activity.ins().sendReward(this.activityID, 1);
			} else {
				UserTips.ins().showTips("元宝不足");
			}
		}
	}

	//可领取点击飞道具
	private onGiftClick(e: egret.TouchEvent): void {
		for (let i = 0; i < 3; i++) {
			if (e.currentTarget == this[`isget${i}`]) {
				let itemicon: ItemIcon = this[`gift${i}`].getItemIcon();
				this.flyItemEx(itemicon);
				Activity.ins().sendReward(this.activityID, 0, i + 1);
				break;
			}
		}
	}

	/**抽奖次数进度条*/
	private updateProgress() {
		let config: ActivityType9Config = GlobalConfig.ActivityType9Config[this.activityID][0];
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType9Data;
		if (config && data) {
			this.turntime.text = data.count + "";
			for (let i = 0; i < 3; i++) {
				this[`turntime${i}`].text = config.reward[i].times;

				this[`gift${i}`].data = {
					id: config.reward[i].id, type: config.reward[i].type, count: config.reward[i].count
				};
				this[`gift${i}`].isShowName(false);
				// this[`gift${i}`].showNum(false);
				this[`bar${i}`].maximum = 100;
				this[`lingqu${i}`].touchEnabled = false;
				if (data.record >> (i + 1) & 1) {
					//已领取
					this[`bar${i}`].value = 100;
					this[`lingqu${i}`].visible = true;
					this[`isget${i}`].touchEnabled = false;//点击飞道具
				} else {
					//未领取
					this[`lingqu${i}`].visible = false;
					if (data.count >= config.reward[i].times) {
						//可领取
						this[`bar${i}`].value = 100;
						this[`isget${i}`].touchEnabled = true;//点击飞道具
					} else {
						//不可领取
						let prerewards: {type: number,id: number,count: number,times?: number} = config.reward[i - 1];
						let curCount: number = data.count;
						let totalCount: number = config.reward[i].times;
						if (prerewards) {
							curCount = data.count - prerewards.times;
							totalCount = config.reward[i].times - prerewards.times;
						}
						curCount = curCount > 0 ? curCount : 0;
						this[`bar${i}`].value = Math.floor(curCount / totalCount * 100);
						this[`isget${i}`].touchEnabled = false;//点击飞道具
					}
				}
				this.updateRedPoint(this.activityID, i);//更新特效红点
			}
		}
	}

	/**抽奖次数红点*/
	private updateRedPoint(activityID: number, idx: number) {
		//是否有抽奖次数可领取判断
		//达到抽奖次数 并且未领取  抽奖次数奖励位第二位开始
		let b = Activity.ins().isGetRollReward(activityID, idx);
		this[`redPoint${idx}`].visible = b;
	}

	private listRefush(): void {
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType9Data;
		if (data) {
			let arr = [];
			for (let i = 0; i < data.noticeArr.length; i++) {
				let notice = {
					activityID: this.activityID, name: data.noticeArr[i].name, index: data.noticeArr[i].index
				};
				arr.push(notice);
			}
			this.list.dataProvider = new eui.ArrayCollection(arr);
		}
	}

	private setTime() {
		let data: ActivityType9Data = Activity.ins().doubleTwelveData[Activity.ins().doubleTwelveIDAry[2]] as ActivityType9Data;
		this.actTime.text = "剩余时间：" + data.getLastTime();
	}
}