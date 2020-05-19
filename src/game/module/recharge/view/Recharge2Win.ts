/**
 * 日充
 */

class Recharge2Win extends BaseEuiView {
	// public list: eui.List;
	public moneyGroup: eui.Group;
	public closeBtn: eui.Button;
	public goUpBtn: eui.Button;
	public bgClose: eui.Rect;
	private totalPower: eui.BitmapLabel;
	public goUpBtnLabel: eui.Label;
	// private rewardList: eui.ArrayCollection;
	public mainGroup: eui.Group;
	private eff: MovieClip;
	private goUpBtnEff: eui.Group;

	constructor() {
		super();
		this.skinName = "DailyChargeSkin2";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI()
		// this.totalPower = BitmapNumber.ins().createNumPic(0, "vip_v", 5);
		// this.totalPower.x = 0;
		// this.totalPower.y = 0;
		// this.moneyGroup.addChild(this.totalPower);

		this.eff = new MovieClip;
		this.eff.x = this.goUpBtnEff.width/2;
		this.eff.y = this.goUpBtnEff.height/2;
		this.eff.touchEnabled = false;
		this.goUpBtnEff.touchEnabled = false;
		this.goUpBtnEff.addChild(this.eff);
		this.eff.playFile(RES_DIR_EFF + "rechargeBtn", -1);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.goUpBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(Recharge.ins().postUpdateRechargeEx, this.setWinData);

		let playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (playPunView) {
			playPunView.preRecharge = playPunView.recharge.visible = false;
		}

		this.setWinData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.goUpBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		DisplayUtils.removeFromParent(this.eff);
		egret.Tween.removeTweens(this);
		this.removeObserve()
	}

	protected onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.bgClose:
				ViewManager.ins().close(Recharge2Win);
				break;
			case this.goUpBtn:
				if (this.goUpBtnLabel.text == `领取大礼包`) {
					if (this.currData) {
						// Recharge.ins().getDayReward(this.currData.index);
						this.getReward();
					}
				} else if (this.goUpBtnLabel.text == `充点小钱玩玩`) {
					ViewManager.ins().open(ChargeFirstWin);
				}
				break;
		}
	}

	private getReward(): void {
		let func = (infoData) => {
			Recharge.ins().getDayReward(infoData.index);
		};
		this.playGet(func, this.currData);
	}

	public playGet(fun, infoData): void {
		let uiView2: UIView2 = ViewManager.ins().getView(UIView2) as UIView2;
		let bagBtn = uiView2.getBagBtn();
		let targetX: number = bagBtn.x - 50;
		let targetY: number = bagBtn.y - this.mainGroup.y - 110;
		//获取动画
		for (let i = 0; i < 4; i++) {
			let t: egret.Tween = egret.Tween.get(this["item" + (i + 1)]);
			t.to({ x: targetX, y: targetY, scaleX: 0, scaleY: 0 }, 500).call(() => {
				this["item" + (i + 1)].visible = false;
			});
		}
		let tt: egret.Tween = egret.Tween.get(this);
		tt.wait(1000).call(() => {
			if (fun != undefined) {
				fun(infoData);
			}
		}, this)
	}

	private currData: DailyRechargeConfig;
	private setWinData(): void {
		let data: RechargeData = Recharge.ins().getRechargeData(0);
		let config: any = Recharge.ins().getCurRechargeConfig();
		this.currData = null;
		let minRecharge = Number.MAX_VALUE;
		for (let k in config) {
			let state = ((data.isAwards >> config[k].index) & 1);
			if (!state && minRecharge > config[k].pay) {
				minRecharge = config[k].pay;
				this.currData = config[k];
			}
		}
		if (!this.currData) this.currData = config[0];
		if (this.currData) {
			let cost: number = this.currData.pay - data.curDayPay;
			if (cost > 0) {
				this.goUpBtnLabel.text = `充点小钱玩玩`;
				// DisplayUtils.removeFromParent(this.eff);
			} else {
				this.goUpBtnLabel.text = `领取大礼包`;
				// if (!this.eff.parent) {
				// 	this.goUpBtn.parent.addChildAt(this.eff, this.getChildIndex(this.goUpBtn));
				// 	this.eff.playFile(RES_DIR_EFF + "chongzhi", -1);
				// }
			}
			// this.rewardList.replaceAll(this.currData.awardList);
			// this.arr = this.currData.awardList.slice();
			this.setItem();
			this.totalPower.text = (cost < 0 ? 0 : cost) + "";
		}
		this.initPos();
	}

	private setItem(): void {
		for (let j = 0; j < this.currData.awardList.length; j++) {
			let d: RechargeRewardData = this.currData.awardList[j];
			this["item" + (j + 1)].data = d;
			this["item" + (j + 1)].visible = true;
			this["item" + (j + 1)].scaleX = this["item" + (j + 1)].scaleY = 1;
			this["item" + (j + 1)].x = 90 * j;
			this["item" + (j + 1)].y = 0;
		}
	}

	private initPos(): void {
		// this.totalPower.x = (this.moneyGroup.width - this.totalPower.width) / 2;
	}
}
ViewManager.ins().reg(Recharge2Win, LayerManager.UI_Popup);
