/**
 * 每日签到面板
 */
class DailyCheckInPanel extends BaseEuiView {
	public checkInLab: eui.Label;
	public remainComplementLab: eui.Label;

	public cardScroller: eui.Scroller;
	public cardList: eui.List;

	public dayReardText: eui.Label;
	public rewardItem: ItemBase;
	public rewardBtn: eui.Button;
	private isTweenItem: boolean = false;
	private rewardGroup: eui.Group;
	private eff: MovieClip;
	private listData: eui.ArrayCollection;
	public constructor() {
		super();

		this.skinName = "DailyCheckInPanelSkin";
		this.cardList.itemRenderer = DailyCheckInCard;
	}


	public childrenCreated(): void {
		
		this.init();
	}

	

	public init() {
		this.eff = new MovieClip;
		this.eff.x = 428;
		this.eff.y = 43;
		// this.eff.scaleX = 0.85;
		// this.eff.scaleY = 0.85;
		this.eff.touchEnabled = false;
		this.listData = new eui.ArrayCollection();
		this.cardList.dataProvider = this.listData;

	}

	public open(...param: any[]): void {
		this.observe(DailyCheckIn.ins().postCheckInData, this.onCheckInData);
		this.observe(DailyCheckIn.ins().postCheckIn, this.onCheckIn);
		this.observe(UserVip.ins().postUpdateVipData, this.onCheckInData);
		this.cardScroller.addEventListener(egret.Event.ENTER_FRAME, this.updateListPos, this);
		this.addTouchEvent(this.cardList, this.onListTap);
		this.addTouchEvent(this.rewardBtn, this.ondayRewardListTap);
		this.isTweenItem = true;
		this.initPanel();
		this.updateCheckInTimes();
		this.updateList();
	}

	public close(...param: any[]): void {
		this.isTweenItem = false;
		this.cardScroller.removeEventListener(egret.Event.ENTER_FRAME, this.updateListPos, this);
		DisplayUtils.removeFromParent(this.eff);
		this.listData = null;
		this.removeObserve();
		this.cleanList();
	}

	/**
	 * 去签到
	 * @param  {number} index
	 * @returns void
	 */
	private toCheckIn(index: number): void {
		DailyCheckIn.ins().sendCheckIn(index);
	}

	/**
	 * 签到处理
	 * @param  {any[]} param
	 * @returns void
	 */
	private onCheckIn(param: any[]): void {
		//反馈
		let success: boolean = param[0];
		let index: number = param[1];
		let str: string = success ? "签到成功" : "签到失败，请稍后再试";
		UserTips.ins().showTips(str);

		//飘物品
		if (success && this.isTweenItem) {
			this.runTweenItem(this, index);
		}
	}

	public runTweenItem(self: DailyCheckInPanel, index: number): any[] {
		if (!self) return;
		let cardList: eui.List = self.cardList;
		if (!cardList) return;
		let card: DailyCheckInCard = cardList.getElementAt(index - 1) as DailyCheckInCard;
		if (!card) return;
		let rewardCfg: MonthSignConfig = card.data as MonthSignConfig;
		if (!rewardCfg) return;
		let itemCfg: ItemConfig = GlobalConfig.ItemConfig[rewardCfg.rewards[0].id];
		if (!itemCfg) return;

		// 计算位置
		let cardGlobalPos: egret.Point = cardList.localToGlobal(card.x + (card.width >> 1), card.y + (card.height >> 1));
		let posX: number = cardGlobalPos.x;
		let posY: number = cardGlobalPos.y;

		return [itemCfg.icon.toString(), posX, posY];
	}


	/**
	 * 签到数据处理
	 * @param  {any[]} param
	 * @returns void
	 */
	private onCheckInData(param: any[]): void {
		this.updateCheckInTimes();
		this.updateList();
	}

	/**
	 * 列表点击
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onListTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			// let checkIndata: MonthSignConfig = this.cardList.selectedItem as MonthSignConfig;
			if (this.cardList.selectedItem) {
				let state: number = DailyCheckIn.ins().getCheckInState(this.cardList.selectedItem.day);
				if (state) {
					if (state == 1) {
						if( UserVip.ins().lv > 0 ){
							this.toCheckIn(this.cardList.selectedItem.day);
						}
						// this.toCheckIn(data.day);
						else if (this.cardList.selectedItem.vipLabel && UserVip.ins().lv < this.cardList.selectedItem.vipLabel) {
							let str = `建议双倍领取，长期可获得高达百倍收益`;
							let win = WarnWin.show(str, () => {
								this.toCheckIn(this.cardList.selectedItem.day);
							}, this, () => {
								ViewManager.ins().open(Recharge1Win);
							}, this);
							win.showUI("","","",`${UserVip.formatLvStr(1)}`);
							win.setBtnLabel(`单倍领取`, `双倍领取`);
						} else {
							this.toCheckIn(this.cardList.selectedItem.day);
						}

					} else if (state == 2) {
						UserTips.ins().showTips("已签到");
					}
				} else {
					if (this.cardList.selectedItem.day > this.currentDay) {
						UserTips.ins().showTips("未到签到时间");
					}
				}
			}
		}
	}

	/**
	 * 列表点击
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private ondayRewardListTap(e: egret.TouchEvent): void {
		DailyCheckIn.ins().sendGetReward(this.curRewardData.days);
	}

	/**
	 * 点击未签到卡的处理
	 * @param  {MonthSignConfig} rewardCfg
	 * @returns void
	 */
	private onNotYetCardTap(rewardCfg: MonthSignConfig): void {
		if (!rewardCfg) return;
		let card: DailyCheckInCard = this.cardList.getElementAt(rewardCfg.day - 1) as DailyCheckInCard;
		if (!card) return;
	}

	/**
	 * 更新签到次数
	 * @returns void
	 */
	public updateCheckInTimes(): void {
		this.checkInLab.text = `${DailyCheckIn.ins().loginTimes.toString()}天`;
	}

	private monthList: MonthSignConfig[];
	private initPanel(): void {
		this.monthList = CheckInConfigMgr.ins().getMonthRewardCfg_Daily();
		let xm: number = this.panelwidth / 7;
		let ym: number = 0;
		this.listData.replaceAll(this.monthList);
	}

	private updateList(): void {
		this.addDate();
	}

	private currentyear: number = 0;
	private currentDay: number = 0;
	private panelwidth: number = 400;

	private curRewardData: MonthSignDaysConfig;

	private xqArr: string[] = ["日", "一", "二", "三", "四", "五", "六"];
	private MonthArr: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	private addDate(): void {
		this.listData.replaceAll(this.monthList);
		//更新列表位置
		let logIndays: number = DailyCheckIn.ins().conLoginTimes;
		let tempRewardList: MonthSignDaysConfig = DailyCheckIn.ins().getRewardList(DailyCheckIn.ins().rewardIndex);
		if (tempRewardList) {
			this.rewardBtn.visible = this.rewardItem.visible = true;
			this.curRewardData = tempRewardList;
			let comDays: number = this.curRewardData.days - logIndays >= 0 ? this.curRewardData.days - logIndays : 0;
			let boo: boolean = logIndays >= this.curRewardData.days;
			let color1: number = boo ? 0x20CB30 : 0xF3311E;
			let color2: number = 0x9F946D;
			let color3: number = 0xF8B141;
			let str = `已累计签到(|C:${color1}&T:${logIndays}|/|C:${color2}&T:${this.curRewardData.days}|)天，\n再签到|C:${color3}&T:${comDays}天|领取奖励。`;
			this.dayReardText.textFlow = TextFlowMaker.generateTextFlow(str);
			this.rewardItem.data = this.curRewardData.rewards[0];
			if (boo) {
				this.rewardBtn.enabled = true;
				this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
				if (!this.eff.parent) this.rewardGroup.addChild(this.eff);
			} else {
				this.rewardBtn.enabled = false;
				DisplayUtils.removeFromParent(this.eff);
			}
		} else {
			DisplayUtils.removeFromParent(this.eff);
			// let nextRewardData = DailyCheckIn.ins().getRewardList();
			this.rewardBtn.visible = this.rewardItem.visible = false;
			this.rewardBtn.enabled = false;
			let comDays: number = 1;
			let boo: boolean = false;
			let color1: number = boo ? 0x20CB30 : 0xF3311E;
			let color2: number = 0x9F946D;
			let color3: number = 0xF8B141;
			// let str = `已累计签到(|C:${color1}&T:${0}|/|C:${color2}&T:${logIndays}|)天，\n再签到|C:${color3}&T:${comDays}天|领取奖励：`;
			let str = `已领取所有的累计奖励`;
			this.dayReardText.textFlow = TextFlowMaker.generateTextFlow(str);
			// this.rewardItem.visible = false;
			// this.rewardItem.data = nextRewardData.rewards[0];
		}
	}

	/**
	 * 清理列表
	 * @returns void
	 */
	private cleanList(): void {
		this.cardList.dataProvider = null;
	}

	/**
	 * 更新列表位置
	 * @returns void
	 */
	private updateListPos(): void {
		this.cardScroller.removeEventListener(egret.Event.ENTER_FRAME, this.updateListPos, this);
		//确认位置
		let cardIndex: number = DailyCheckIn.ins().loginTimes;
		//调整位置
		if (cardIndex >= 25) {
			//全部签到或签到位置在索引25以上
			// this.cardScroller.viewport.scrollV = 500;
			this.cardScroller.viewport.scrollV = this.cardScroller.viewport.contentHeight - this.cardScroller.height;
		}
	}
}