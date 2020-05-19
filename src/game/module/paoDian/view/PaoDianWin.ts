class PaoDianWin extends BaseEuiView{

	public wholeLeftTime:eui.Label;
	public currentArea:eui.Button;
	public area0:eui.Button;
	public name0:eui.Label;
	public guild0:eui.Label;
	public occupy0:eui.Label;
	public area1:eui.Button;
	public name1:eui.Label;
	public guild1:eui.Label;
	public occupy1:eui.Label;
	public area2:eui.Button;
	public name2:eui.Label;
	public guild2:eui.Label;
	public occupy2:eui.Label;
	public area3:eui.Button;
	public name3:eui.Label;
	public guild3:eui.Label;
	public occupy3:eui.Label;
	public area4:eui.Button;
	public name4:eui.Label;
	public guild4:eui.Label;
	public occupy4:eui.Label;
	public help:eui.Button;

	private _leftTime:number = 0;

	private _stateList:Array<String> = ["one", "two", "three", "", "five"];

	public constructor() {
		super();
		this.skinName = "PointFightSkin";
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTouch);
		this.observe(PaoDianCC.ins().postEnterSuccess, this.updateTime);
		this.observe(PaoDianCC.ins().postBelongChange, this.update);
		this.observe(PaoDianCC.ins().postAreaChange, this.updateCurrentArea);

		this.update();
		this.updateTime();
		this.updateCurrentArea();
	}

	public update():void
	{
		let cfg:any[], id:number;
		let belong:{id:number, handler:number};
		let btn:eui.Button;
		let char:CharRole;
		for (let i:number = 0; i < 5; i++)
		{
			cfg = GlobalConfig.PassionPointConfig.expPoint[i];
			id = cfg[2];
			belong = PaoDianCC.ins().getBelongById(id);
			btn = this["area" + i];
			btn.name = belong ? belong.handler + "" : cfg[0] + "," + cfg[1];
			this["occupy" + i].visible = belong == null;
			
			if (belong)
			{
				char = EntityManager.ins().getEntityBymasterhHandle(belong.handler) as CharRole;
				this["name" + i].text = char.infoModel.name;
				this["guild" + i].text = (char.infoModel as Role).guildName;
			}
			else
			{
				this["name" + i].text = "";
				this["guild" + i].text = "";
			}
		}
	}

	private updateTime():void
	{
		TimerManager.ins().remove(this.repeat, this);
		this._leftTime = PaoDianCC.ins().getLeftTime();

		if (this._leftTime > 0)
		{
			TimerManager.ins().doTimer(1000, 0, this.repeat, this);
			this.repeat();
		}
		else
			this.wholeLeftTime.text = "";
	}

	private repeat():void
	{
		if (this._leftTime <= 0)
		{
			this.wholeLeftTime.text = "";
			TimerManager.ins().remove(this.repeat, this);
			return;
		}

		this.wholeLeftTime.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 4);
		this._leftTime--;
	}

	private updateCurrentArea():void
	{
		var cfg:PassionPointAwardConfig = GlobalConfig.PassionPointAwardConfig[PaoDianCC.ins().areaId];
		this.currentArea.currentState = this._stateList[cfg ? cfg.times - 1 : 0] as string;
	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTouch);
		this.removeObserve();
		TimerManager.ins().remove(this.repeat, this);
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.area0:
			case this.area1:
			case this.area2:
			case this.area3:
			case this.area4:
				let list:Array<any> = e.target.name.split(",");
				if (list.length == 1) //有归属者
					GameLogic.ins().postChangeAttrPoint(Number(list[0]));
				else
				{
					GameLogic.ins().stopAI();
					SysSetting.ins().setValue("mapClickTx", 0);
					SysSetting.ins().setValue("mapClickTy", 0);
					GameMap.moveTo(Number(list[0]) * GameMap.CELL_SIZE, Number(list[1]) * GameMap.CELL_SIZE);
				}
				break;
			case this.currentArea:
				PaoDianCC.ins().sendCheckMyInfo();
				ViewManager.ins().open(PaoDianCurrentWin);
				break;
			case this.help:
				 ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[20].text);
				break;
		}
	}
}

ViewManager.ins().reg(PaoDianWin, LayerManager.Main_View);