class MonthCardWin extends BaseView {


	public monthGroup: eui.Group;

	private btn1:eui.Button;
	private leftTime:eui.Label;
	private feng:eui.Label;
	private first:eui.Label;
	constructor() {
		super();
		this.skinName = "MonthCardSkin";
	}

	public open(...param: any[]): void {
		this.observe(Recharge.ins().postUpdateRecharge, this.setView);
		this.addTouchEvent(this.btn1, this.onTap);
		if( this.feng.visible ){
			this.btn1.visible = false;
		}else{
			if (Recharge.ins().monthDay > 0) {
				TimerManager.ins().doTimer(1000, 0, this.setTimeLbel, this);
				this.setTimeLbel();
				this.btn1.visible = false;
			} else {
				//TODO:档位需要同步
				//微信小游戏档位
				if (LocationProperty.isWeChatMode) {
					this.btn1.label = "25元抢购";
				}
				this.btn1.visible = true;
				TimerManager.ins().remove(this.setTimeLbel, this);
			}
			this.leftTime.visible = Recharge.ins().monthDay > 0?true:false;
			this.setView();
		}

        //
		// if (Recharge.ins().getIsForeve()) {
        //
		// } else {
        //
		// }
		// // let data: RechargeData = Recharge.ins().getRechargeData(0);
		// this.setView();
	}

	private setView(): void {
		//TODO:档位需要同步
		//微信小游戏档位
		if (LocationProperty.isWeChatMode) {
			this.first.text = "现在购买，额外赠送 250 元宝";
		}
		this.first.visible = !Setting.ins().getValue(ClientSet.firstMonthCard);
	}

	private setTimeLbel(): void {
		let endedTime: number = Recharge.ins().monthDay;//Math.ceil((Recharge.ins().monthDay - egret.getTimer()) / 1000);
		let str: string = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 1);
		str = `<font color='#35e62d'>剩余时间:${str}</font>`;
		this.leftTime.textFlow = new egret.HtmlTextParser().parser(str);

	}

	public close(...param: any[]): void {
		this.removeObserve();
		this.removeTouchEvent(this.btn1, this.onTap);
		TimerManager.ins().remove(this.setTimeLbel, this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.btn1:
				let rechargeid = Recharge.ins().getMonthCardRechargeId();
				if (rechargeid) {
					Recharge.ins().showReCharge(rechargeid);
				}
				break;
		}
	}
}

// ViewManager.ins().reg(MonthCardWin, LayerManager.UI_Main);