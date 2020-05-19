/**
 * 飞剑奇缘
 */
class OSATarget20Panel extends ActivityPanel {
	public infoBg: eui.Group;
	public actTime: eui.Label;
	public leftBtn: eui.Image;
	public rightBtn: eui.Image;
	public showReward: eui.List;
	public showRewardData: eui.ArrayCollection = new eui.ArrayCollection();
	public reward: eui.List;
	public rewardData: eui.ArrayCollection = new eui.ArrayCollection();
	public goBtn: eui.Button;
	public redPoint: eui.Image;
	public state: eui.Image;
	public rechargeBar: eui.ProgressBar;
	public mc: MovieClip;
	public showimg: eui.Image;

	private actData: ActivityType20Data;

	public nowNum: eui.Label;

	public constructor() {
		super();
		this.skinName = `OSFsBossSkin`;
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
		
	}

	public init() {
		this.showReward.itemRenderer = OSFsBossItem;
		this.showReward.dataProvider = this.showRewardData;
		this.reward.itemRenderer = ItemBase;
		this.reward.dataProvider = this.rewardData;
		this.rechargeBar.maximum = 5;
		this.addTouchEvent(this.goBtn, this.sendChallenge);
		this.addTouchEvent(this.leftBtn, this.pageChange);
		this.addTouchEvent(this.rightBtn, this.pageChange);
		this.addEvent(eui.ItemTapEvent.CHANGE, this.showReward, this.showRewardTouch);

		this.observe(Activity.ins().postChangePage, this.changeView);

		this.mc = new MovieClip();
		this.addChild(this.mc);
		this.mc.x = this.width / 2, this.mc.y = 290;
		this.mc.playFile(`${RES_DIR_EFF}artifacteff2`, -1);

	}

	public open(...param: any[]): void {
		this.actData = Activity.ins().activityData[this.activityID] as ActivityType20Data;
		if (!this.actData) return;
		egret.Tween.get(this.showimg, { loop: true }).to({ y: 53 - 15 }, 1500).to({ y: 53 }, 1500);
		this.updateView(this.curPage = this.actData.curCheckPoint >= 5 ? 2 : 1);
		TimerManager.ins().doTimer(1000, 0, this.updateTimeView, this);
		this.updateTimeView();
		//飞剑奇缘活动，登录时显示红点，进入飞剑活动界面后去掉红点
		Activity.ins().feijianHappyHoursRed = false;
	}

	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().remove(this.updateTimeView, this);
		egret.Tween.removeTweens(this.showimg);
		//这里矫正位置防止缓动造成的偏差
		this.showimg.y = 53;
		Activity.ins().removeFeijianFbEvent();
	}


	private changeView(): void {
		this.lastPage = 0;
		this.lastIndex = -1;
		this.actData = Activity.ins().activityData[this.activityID] as ActivityType20Data;
		if (!this.actData) return;
		this.updateView(this.curPage = this.actData.curCheckPoint >= 5 ? 2 : 1);
	} 

	private lastPage: number = 0;
	private lastIndex: number = -1;
	private updateView(page: number): void {
		// if (this.lastPage == page) return;
		this.lastPage = page;
		this.showRewardData.source = this.actData.getCurPageData(page);
		//选中下一关
		this.showReward.selectedIndex = this.lastIndex == -1 ? this.actData.curCheckPoint == 0 ? 0 : this.actData.curCheckPoint % 5 : this.lastIndex;
		this.showRewardTouch();
	}

	private showRewardTouch() {
		let item = this.showRewardData.source[this.showReward.selectedIndex];
		this.lastIndex = this.showReward.selectedIndex;
		this.nowNum.text = `第${item.index}关`;
		this.rewardData.source = item.rewards;
		this.rechargeBar.value = this.getCurVal();
		this.leftBtn.visible = this.curPage != 1;
		this.rightBtn.visible = this.curPage != 2;

		this.state.visible = item.index <= this.actData.curCheckPoint;
		this.goBtn.visible = !this.state.visible;
	}

	private getCurVal(): number {
		let pos = Math.ceil(this.actData.curCheckPoint / 5);
		if (this.curPage < pos) {
			return 5;
		} else if (this.curPage == pos) {
			if (pos == 2 && this.actData.curCheckPoint % 5 == 0) return 5;
			return this.actData.curCheckPoint % 5;
		} else {
			return 0;
		}
	}

	private updateTimeView(): void {
		this.actTime.text = this.actData.getRemainTime();
	}

	private sendChallenge() {
		let conf: ActivityType20Config = this.showReward.selectedItem;
		if (!conf) return;
		//判断是否挑战过，是否可以挑战
		if (conf.index == this.actData.curCheckPoint + 1) {
			Activity.ins().sendEnterFlySwordFb(this.activityID);
			ViewManager.ins().close(ActivityWin);
			Activity.ins().addFeijianFbEvent();
		} else {
			//是否全通关了
			if (!this.actData.isAllPass()) UserTips.ins().showTips(`请先通关前面关卡`);
		}
	}

	private curPage: number = 0;
	private pageChange(e: egret.TouchEvent) {
		switch (e.currentTarget) {
			case this.leftBtn: {
				this.curPage--;
				this.updateView(Math.max(1, this.curPage));
				break;
			}
			case this.rightBtn: {
				this.curPage++;
				let confs = GlobalConfig.ActivityType20Config[this.actData.id];
				this.updateView(Math.min(Math.ceil(Object.keys(confs).length / 5), this.curPage));
				break;
			}
		}
	}
}

class OSFsBossItem extends eui.ItemRenderer {
	public reward: ItemBase;
	public select: eui.Image;
	public arrow: eui.Image;
	public num: eui.Label;

	public constructor() {
		super();
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		this.reward.isShowName(false);
	}

	protected dataChanged() {
		super.dataChanged();
		let conf = this.data as ActivityType20Config;
		if (!conf) return;
		this.num.text = `第${conf.index}关`;
		this.reward.data = conf.rewards[0] as RewardData;
	}
}