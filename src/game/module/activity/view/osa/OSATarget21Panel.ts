/**
 * 寻宝开服
 */
class OSATarget21Panel extends ActivityPanel {
	public infoBg: eui.Group;
	public actTime: eui.Label;
	public actDesc: eui.Label;
	public show0: eui.Image;
	public reward: eui.List;
	public already: eui.Label;
	public getBtn: eui.Button;
	public redPoint: eui.Image;
	public leftBtn: eui.Image;
	public rightBtn: eui.Image;
	public showReward: eui.List;
	private showRewardData: eui.ArrayCollection = new eui.ArrayCollection();
	private rewardData: eui.ArrayCollection = new eui.ArrayCollection();

	public menuScroller: eui.Scroller;
	public mc: MovieClip;

	private actData: ActivityType21Data;
	private type:number;

	public constructor() {
		super();
		this.skinName = `OSTreasureGiftSkin`;
	}

	protected childrenCreated() {
		super.childrenCreated();
		this.init();
	}

	public init() {
	

		this.showReward.itemRenderer = OSTreasureGiftItem;
		this.showReward.dataProvider = this.showRewardData;
		this.reward.itemRenderer = ItemBase;
		this.reward.dataProvider = this.rewardData;

		this.addTouchEvent(this.rightBtn, this.onTouchBtn);
		this.addTouchEvent(this.leftBtn, this.onTouchBtn);
		this.addTouchEvent(this.getBtn, this.getTouch);
		this.addEvent(eui.ItemTapEvent.CHANGE, this.showReward, this.showRewardTouch);
		this.observe(Activity.ins().postRewardResult, this.updateView);

		this.mc = new MovieClip();
		this.addChild(this.mc);
		this.mc.x = 140, this.mc.y = 290;
		this.mc.playFile(`${RES_DIR_EFF}artifacteff2`, -1);
	}

	public open(...param: any[]): void {
		this.actData = Activity.ins().activityData[this.activityID] as ActivityType21Data;
		if (!this.actData) return;

		this.show0.source = "";
		let data = GlobalConfig.ActivityType21Config[this.activityID];
		this.show0.source = data[1].showimg;
		this.type = data[1].type;
		this.actDesc.text = "";
		let actcfg:ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		this.actDesc.text = actcfg.desc;


		egret.Tween.get(this.show0, { loop: true }).to({ y: 143 - 20 }, 1500).to({ y: 143 }, 1500);
		TimerManager.ins().doTimer(1000, 0, this.updateTimeView, this);
		this.updateTimeView();
		this.updateView();
		this.menuScroller.once(egret.Event.RENDER, this.changePos, this);
		this.addChangeEvent(this.menuScroller, this.onChange);

	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateTimeView, this);
		egret.Tween.removeTweens(this.show0);
		//这里矫正位置防止缓动造成的偏差
		this.show0.y = 143;
	}

	private changePos() {
		//自动滚到当前可以领取奖励的位置
		let pos = this.actData.getNoGetAward();
		let scrollPos = pos * 40;
		this.menuScroller.viewport.scrollH = scrollPos;
		this.onChange();
	}

	private onChange(): void {
		if (this.showReward.scrollH < 46) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = true;
		} else if (this.showReward.scrollH >= this.showReward.contentWidth - this.showReward.width - 46) {
			this.leftBtn.visible = true;
			this.rightBtn.visible = false;
		} else {
			this.leftBtn.visible = true;
			this.rightBtn.visible = true;
		}
	}

	private onTouchBtn(e: egret.TouchEvent): void {
		let num: number = 92 * 5;
		let scrollH: number = 0;
		let v = this.menuScroller.viewport;
		switch (e.target) {
			case this.leftBtn:
				scrollH = v.scrollH - num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH < 0) {
					scrollH = 0;
				}
				v.scrollH = scrollH;
				break;
			case this.rightBtn:
				scrollH = v.scrollH + num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH > v.contentWidth - this.menuScroller.width) {
					scrollH = v.contentWidth - this.menuScroller.width;
				}
				v.scrollH = scrollH;
				break;
		}
		this.onChange();
	}

	private updateView(actId: number = -1): void {
		if (actId != -1 && this.activityID != actId) return;
		if (actId == -1) {
			this.showRewardData.source = this.actData.getCntData();
		} else {
			this.showRewardData.replaceAll(this.actData.getCntData());
		}

		this.showReward.selectedIndex = this.actData.getNoGetAward();
		this.showRewardTouch();
	}

	private showRewardTouch() {
		this.rewardData.source = this.showRewardData.source[this.showReward.selectedIndex].rewards;
		this.already.visible = this.actData.isGetAward(this.showReward.selectedIndex + 1);
		this.getBtn.visible = !this.already.visible;
		this.getBtn.label = this.actData.isCanGetAward(this.showReward.selectedIndex + 1) ? `领取` : `前往寻宝`;
	}

	private updateTimeView(): void {
		this.actTime.text = this.actData.getRemainTime();
	}

	private pageChange(e: egret.TouchEvent) {
	}

	private getTouch() {
		if (this.actData.isCanGetAward(this.showReward.selectedIndex + 1)) {
			Activity.ins().sendReward(this.activityID, this.showReward.selectedIndex + 1);
			return;
		}

		let index:number = 0;
		switch (this.type) {
			case 0:
				index = 0;
				break;
			case 1:
				index = 0;
				break;
			case 2:
				index = 1;
				break;
			case 3:
				index = 2;
				break;
		}

		let openlevel: number = GlobalConfig.FuwenTreasureConfig.openlevel;
		if (OpenSystem.ins().checkSysOpen(SystemType.TREASURE)){
			if (Actor.level < openlevel && index == 1)  index = 0;
			if( !Heirloom.ins().isHeirloomHuntOpen() && index == 2)  index = 0;
		}
		ViewManager.ins().open(TreasureHuntWin,index);
	}
}

class OSTreasureGiftItem extends eui.ItemRenderer {
	public reward: ItemBase;
	public select: eui.Image;
	public num: eui.Label;
	public state: eui.Image;

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
		let conf: ActivityType21Config = this.data;
		if (!conf) return;
		this.reward.data = <RewardData>conf.rewards[0];
		let curCnt = conf['cnt'] >= conf.num ? `|C:0x35e62d&T:${conf['cnt']}|` : `|C:0xf3311e&T:${conf['cnt']}|`
		this.num.textFlow = TextFlowMaker.generateTextFlow(`${curCnt}/${conf.num}`);
		this.state.visible = conf['state'];
		this.reward.redPoint.visible = conf['isCanGetAward'];
	}
}