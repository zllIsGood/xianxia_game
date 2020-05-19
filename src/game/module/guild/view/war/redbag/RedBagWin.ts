class RedBagWin extends BaseEuiView {
	public send: eui.Button;
	public rob: eui.Button;
	public btn1: eui.Button;
	public btn3: eui.Button;
	public btn2: eui.Button;
	public btn4: eui.Button;
	public btn5: eui.Button;
	public btn6: eui.Button;
	public remainBag: eui.Label;
	public price: PriceIcon;

	public num1: eui.TextInput;
	public num2: eui.TextInput;

	private model: GuildWarModel;
	private sendYb: number;
	private sendNum: number;

	private sendMaxNum: number;
	private sendYBMaxNum: number;
	public bgClose: eui.Rect;

	public initUI(): void {
		super.initUI();
		this.skinName = "RedBagWinSkin";
		this.model = GuildWar.ins().getModel();
		this.num1.restrict = "0-9";
		this.num2.restrict = "0-9";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.rob, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.send, this.onTap);
		this.addTouchEvent(this.btn1, this.onTap);
		this.addTouchEvent(this.btn2, this.onTap);
		this.addTouchEvent(this.btn3, this.onTap);
		this.addTouchEvent(this.btn4, this.onTap);
		this.addTouchEvent(this.btn5, this.onTap);
		this.addTouchEvent(this.btn6, this.onTap);
		this.addChangeEvent(this.num1, this.onTxtChange);
		this.addChangeEvent(this.num2, this.onTxtChange);

		if (this.model.canRod) {
			this.currentState = "rob";
			this.refushInfo();
		} else {
			this.currentState = "send";
			this.refushSendInfo();
		}
	}

	private onTxtChange(e: egret.Event): void {
		let index: number = 1;
		switch (e.currentTarget) {
			case this.num1:
				index = 1;
				break;
			case this.num2:
				index = 2;
				break;
		}

		TimerManager.ins().doTimer(500, 1, () => {
			this.checkInputChange(index)
		}, this);
	}

	private checkInputChange(index: number): void {
		let num: number;
		switch (index) {
			case 1:
				num = Number(this.num1.text);
				if (num > this.sendYBMaxNum) {
					num = this.sendYBMaxNum;
				}
				this.sendYb = num;
				this.num1.text = this.sendYb + "";
				break;
			case 2:
				num = Number(this.num2.text);
				if (num > this.sendMaxNum) {
					num = this.sendMaxNum;
				}
				this.sendNum = num;
				this.num2.text = this.sendNum + "";
				break;
		}
		this.checkPercentage();
	}

	public refushSendInfo(): void {
		//发红包状态
		this.sendYb = this.sendYBMaxNum = this.model.remainYB;
		this.sendMaxNum = this.sendNum = Guild.ins().getMemberNum();
		this.price.setPrice(this.sendYb);
		this.num1.text = this.sendYb + '';
		this.num2.text = this.sendNum + '';
	}

	public refushInfo(): void {
		this.remainBag.text = this.model.remainRedNum + "/" + this.model.maxRedNum;
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(RedBagWin);
				break;
			case this.rob:
				GuildWar.ins().requestRobRedBag();
				break;
			case this.send:
				GuildWar.ins().requestSendRedBag(this.sendYb, this.sendNum);
				break;
			case this.btn1:
				--this.sendYb;
				if (this.sendYb < this.sendNum) {
					this.sendYb = this.sendNum;
				}
				this.num1.text = this.sendYb + "";
				break;
			case this.btn2:
				++this.sendYb;
				if (this.sendYb > this.sendYBMaxNum) {
					this.sendYb = this.sendYBMaxNum;
				}
				this.num1.text = this.sendYb + "";
				break;
			case this.btn3:
				--this.sendNum;
				if (this.sendNum < 1) {
					this.sendNum = 1;
				}
				this.num2.text = this.sendNum + "";
				break;
			case this.btn4:
				++this.sendNum;
				if (this.sendNum > this.sendMaxNum) {
					this.sendNum = this.sendMaxNum;
				}
				this.num2.text = this.sendNum + "";
				break;
			case this.btn5:
				this.sendYb = this.sendYBMaxNum;
				this.num1.text = this.sendYb + "";
				break;
			case this.btn6:
				this.sendNum = this.sendMaxNum;
				this.num2.text = this.sendNum + "";
				break;
		}
	}

	private checkPercentage(): void {
		if (this.sendYb < this.sendNum) {
			this.sendYb = this.sendNum;
			this.num1.text = this.sendYb + "";
		}
	}
}

ViewManager.ins().reg(RedBagWin, LayerManager.UI_Main);