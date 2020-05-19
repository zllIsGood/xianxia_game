class BattleNpcTipWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public desc:eui.Label;
	public rule:eui.Label;
	public goTo:eui.Button;
	public redPoint:eui.Image;


	
	public constructor() {
		super();
		this.skinName = "BattleTipsSkin";
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onGoto);
		this.update();
	}

	public close():void
	{
		this.removeTouchEvent(this.goTo, this.onGoto);
	}

	private update():void
	{
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.CampBattleConfig.desc);
		this.rule.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.HelpInfoConfig[17].text);
		this.redPoint.visible = BattleCC.ins().isOpen;
	}

	private onGoto(e:egret.TouchEvent):void
	{
		if (e.target == this.goTo)
		{
			if (Actor.level < GlobalConfig.CampBattleConfig.openLevel)
			{
				UserTips.ins().showTips(GlobalConfig.CampBattleConfig.openLevel + `级可参与仙魔战场`);
				return;
			}

			if (!BattleCC.ins().isOpen)
			{
				UserTips.ins().showTips(GlobalConfig.CampBattleConfig.openTips);
				return;
			}

			var cd:number = BattleCC.ins().getEnterCD();
			if (cd > 0)
			{
				UserTips.ins().showTips(cd + "秒后才可进入阵营副本");
				return;
			}
			
			BattleCC.ins().joinBattle();
		}
		else if (e.target == this.bgClose)
			ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(BattleNpcTipWin, LayerManager.UI_Main);
