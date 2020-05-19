class PaoDianIconRule extends RuleIconBase{
	private _timeTxt:eui.Label;

	private _time:number = 0;
	
	public constructor(t: egret.DisplayObjectContainer) {
		super(t);

		this._timeTxt = new eui.Label();
		this._timeTxt.x = 0;
		this._timeTxt.y = 80;
		this._timeTxt.width = 70;
		this._timeTxt.textAlign = "center";
		this._timeTxt.text = "";
		this._timeTxt.size = 14;
		this._timeTxt.textColor = 0x00FF00;
		t.addChild(this._timeTxt);

		this.updateMessage = [
			Actor.ins().postLevelChange,
			PaoDianCC.ins().postOpenInfo
		];
	}

	checkShowIcon(): boolean {
		TimerManager.ins().removeAll(this);
		if(!OpenSystem.ins().checkSysOpen(SystemType.PAODIAN))
			return false;

		if (PaoDianCC.ins().isOpen)
		{
			this._timeTxt.text = "进行中";
			return true;
		}

		if (!PaoDianCC.ins().isOpen)
		{
			let leftTime:number = PaoDianCC.ins().getOpenLeftTime();
			if (leftTime > 0)
			{
				this._time = leftTime;
				this._timeTxt.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);
				TimerManager.ins().doTimer(1000, 0, this.setRepeat, this);
				return true;
			}
		}

		return false;
	}

	private setRepeat():void
	{
		this._time--;
		if (this._time > 0)
			this._timeTxt.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 4);
		else
		{
			this._timeTxt.text = "进行中";
			TimerManager.ins().removeAll(this);
		}
	}

	checkShowRedPoint(): number {
		
		return 0;
	
	}

	getEffName(redPointNum: number): string {
		this.effX = 38;
		this.effY = 55;
		return "actIconCircle";
	}

	tapExecute(): void {
		ViewManager.ins().open(LadderWin, 3);
		this.update();
	}
}