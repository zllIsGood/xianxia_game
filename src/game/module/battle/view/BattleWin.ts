class BattleWin extends BaseEuiView{
	
	public rank0:eui.Image;
	public name0:eui.Label;
	public num0:eui.Label;
	public rank1:eui.Image;
	public name1:eui.Label;
	public num1:eui.Label;
	public rank2:eui.Image;
	public name2:eui.Label;
	public num2:eui.Label;
	public rank3:eui.Label;
	public name3:eui.Label;
	public num3:eui.Label;
	public jump:eui.Label;
	public wholeLeftTime:eui.Label;
	public campLeftTime0:eui.Label;
	public countDown:eui.BitmapLabel;
	public giftBtn:eui.Image;
	public redPoint:eui.Image;
	public scoreTxt:eui.Label;
	public scoreTxt2:eui.Label;
	public giftGroup:eui.Group;
	public bigTimeGroup:eui.Group;
	public assignPer:eui.Group;


	private _leftTime:number = 0;

	private _changeTime:number = -1;

	private _littleChangeTime:number = -1;

	private _canGetGift:boolean;

	private _giftMax:boolean;

	public constructor() {
		super();
		this.skinName = "BattleLittleRankSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
	

		this.jump.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:查看排行`);
		this.bigTimeGroup.visible = false;
		this.assignPer.visible = false;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTap);
		this.observe(BattleCC.ins().postRankInfo, this.updateRank);
		this.observe(BattleCC.ins().postScoreChange, this.updateMyScore);
		this.observe(BattleCC.ins().postGiftInfo, this.updateGift);
		this.observe(BattleCC.ins().postEnterSuccess, this.update);
		this.observe(BattleCC.ins().postChangeTime, this.update);
		this.observe(BattleCC.ins().postLittleChange, this.update);
		this.updateRank();
		this.updateGift();
		this.updateMyScore();
		this.update();
	}

	public update():void
	{
		TimerManager.ins().remove(this.repeat, this);
		this._leftTime = BattleCC.ins().getLeftTime();
		let startTimer:boolean;
		if (this._leftTime > 0)
			startTimer = true;
		else
			this.wholeLeftTime.text = "";

		this._changeTime = BattleCC.ins().getChangeTime();
		if (this._changeTime > 0)
			startTimer = true;
		else
			this.assignPer.visible = false;

		this._littleChangeTime = BattleCC.ins().getChangeLittleTime();
		if (this._littleChangeTime > 0)
			startTimer = true;
		else
			this.bigTimeGroup.visible = false;

		if (startTimer)
		{
			TimerManager.ins().doTimer(1000, 0, this.repeat, this);
			this.repeat();
		}
	}

	private repeat():void
	{
		if (this._leftTime <= 0)
		{
			if (this.wholeLeftTime.text != "")
				this.wholeLeftTime.text = "";
		}
		else
			this.wholeLeftTime.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 4);

		this._leftTime--;

		if (this._changeTime <= 0)
		{
			if (this.assignPer.visible)
				this.assignPer.visible = false;
		}
		else 
		{
			if (!this.assignPer.visible)
				this.assignPer.visible = true;

			this.campLeftTime0.text = DateUtils.getFormatBySecond(this._changeTime, DateUtils.TIME_FORMAT_5, 4);	
		}
			
		this._changeTime--;

		if (this._littleChangeTime <= 0)
		{
			if (this.bigTimeGroup.visible)
				this.bigTimeGroup.visible = false;
		}
		else
		{
			this.countDown.text = Math.floor(this._littleChangeTime) + "";
			if (!this.bigTimeGroup.visible)
				this.bigTimeGroup.visible = true;
		}
	
		this._littleChangeTime--;
	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTap);
		this.removeObserve();
		TimerManager.ins().removeAll(this);
		this._giftMax = false;
		this._canGetGift = false;
	}

	private updateRank():void
	{
		var ranks:Array<BattleRankVo> = BattleCC.ins().getRankTop();
		var len:number = ranks ? ranks.length : 0;
		var vo:BattleRankVo;
		for (var i:number = 0; i < 3; i++)
		{
			if (i < len)
				vo = ranks[i];
			else 
				vo = null;

			this["name" + i].text = vo ? vo.roleName : "";
			this["num" + i].text = vo ? vo.score + "" : "";
		}

	}

	private updateMyScore():void
	{
		this.num3.text = BattleCC.ins().myScore + "";
		this.rank3.text = BattleCC.ins().myRank + "";
		this.updateGift();
	}

	private updateGift():void
	{
		if (this._giftMax)
			return;
		
		var awardId:number = BattleCC.ins().awardID;
		var len:number = Object.keys(GlobalConfig.CampBattlePersonalAwardConfig).length;
		this._canGetGift = false;

		if (awardId >= len)
		{
			this._giftMax = true;
			this.giftGroup.visible = false;
		}
		else
		{
			this.giftGroup.visible = true;
			let cfg:CampBattlePersonalAwardConfig;
			cfg = GlobalConfig.CampBattlePersonalAwardConfig[awardId + 1];
			this._canGetGift = BattleCC.ins().myScore >= cfg.integral;

			this.redPoint.visible = this._canGetGift;
			this.scoreTxt.text = "战绩：" +  BattleCC.ins().myScore;

			let colorStr = this._canGetGift ? 0x00ff00:0xff0000;
			this.scoreTxt2.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${BattleCC.ins().myScore}|/${cfg.integral}`);
		}
	}

	private onTap(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.jump:
				ViewManager.ins().open(BattleRankWin);
				break;
			case this.giftBtn:
				if (this._canGetGift)
					BattleCC.ins().getMyAward();
				break;

		}
	}
	
}

ViewManager.ins().reg(BattleWin, LayerManager.Main_View);