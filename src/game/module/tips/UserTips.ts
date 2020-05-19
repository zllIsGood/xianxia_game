class UserTips extends BaseClass {
	private _view: TipsView;

	constructor() {
		super();
	}

	public static ins(): UserTips {
		return super.ins() as UserTips
	}

	public get view() {
		if (!this._view || !this._view.parent) {
			let vim = ViewManager.ins();
			vim.open(TipsView);
			this._view = vim.getView(TipsView) as TipsView;
		}
		return this._view;
	}

	public showTips(str: string, func?: Function): void {
		if (str == `元宝不足` || str == `|C:0xf3311e&T:元宝不足|`) {
			let w = WarnWin.show(`元宝不足，是否前往充值？`, null, null, () => {
				if(WxTool.shouldRecharge()) {
					let rdata: RechargeData = Recharge.ins().getRechargeData(0);
					if (!rdata || rdata.num != 2) {
						ViewManager.ins().open(Recharge1Win);
					} else {
						ViewManager.ins().open(ChargeFirstWin);
					}
				}
				if (func && typeof func == "function")
					func();
			});
			w.setBtnLabel(`取消`, `前往`);
			return;
		}
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showTips, str);
	}

	public showCenterTips(str: string): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showCenterTips, str);
	}

	public showCenterTips2(str: string): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showCenterTips2, str);
	}

	public showSceneTips(str: string): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showSceneTips, str);
	}

	public showAttrTips(type: number, value: number): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showAttrTips, [type, value]);
	}

	public showGoodEquipTips(itemData: ItemData): void {
		this.view.showGoodEquipTip(itemData);
	}

	public showSkillTips(skillID: number): void {
		this.view.showSkillTip(skillID);
	}
	public showItemTips(itemID: number): void {
		this.view.showItemTip(itemID);
	}

	public showBoxTips(id: number): void {
		this.view.showBoxTip(id);
	}

	public showBoostPower(currentValue: number, lastValue: number): void {
		(<BoostPowerView>ViewManager.ins().open(BoostPowerView)).showBoostPower(currentValue, lastValue);
	}

	public showFuncNotice(lv: number): void {
		(<FuncNoticeWin>ViewManager.ins().open(FuncNoticeWin)).showWin(lv);
	}

	public showRewardBox(type: number): void {
		this.view.showRewardBox(type);
	}

	public showEverTips(str: any): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showEverTips, str);
	}

	public showHintTips(pic: string): void {
		DelayOptManager.ins().addDelayOptFunction(this.view, this.view.showHintTips, pic);
	}

	public showGoodRewardTips(itemData: RewardData): void {
		this.view.showGoodRewardTip(itemData);
	}

}

