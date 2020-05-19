class TreasureChuanshiGiftWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public already:eui.Label;
	public gift:eui.List;
	public get:eui.Button;
	public closeBtn0:eui.Button;

	private type:number;

	private id:number;

	private num:number;

	private lastSelected:number = -1;
	private choose:eui.Label;
	public constructor() {
		super();
		this.skinName = "TreasureChuanshiGift";
	}

	public open(...args:any[]):void
	{
		this.type = args[0];
		this.id = args[1];
		this.num = args[2];
		this.addTouchEvent(this, this.onTouch);
		this.observe(UserBag.ins().postGiftResult, this.otherClose);
		this.update();
	}

	private update():void
	{
		let config = GlobalConfig.OptionalGiftConfig[this.id];
		this.gift.itemRenderer = TreasureChuanshiItemRender;
		if( config.show[0]["reward"].length <= 4 ){
			this.currentState = "special";
		}else{
			this.currentState = "normal";
		}
		this.validateNow();
		this.gift.dataProvider = new eui.ArrayCollection(config.show[0]["reward"]);
		this.gift.validateNow();

		this.choose.textFlow = TextFlowMaker.generateTextFlow1(config.show[0]["str"]);
	}

	public close(...args:any[]):void
	{
		this.removeTouchEvent(this, this.onTouch);
		this.lastSelected = -1;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		if (e.target == this.get)
		{
			if (this.gift.selectedIndex < 0)
			{
				UserTips.ins().showTips("请选择一个奖励");
				return;
			}

			UserBag.ins().sendChoosableGift(this.id, 1, this.gift.selectedIndex);
		}
		else if (e.target.parent == this.gift)
		{
			if (this.lastSelected >= 0)
				(this.gift.getChildAt(this.lastSelected) as TreasureChuanshiItemRender).checkSelcted(this.gift.selectedIndex);

			this.lastSelected = this.gift.selectedIndex;
			(this.gift.getChildAt(this.lastSelected) as TreasureChuanshiItemRender).checkSelcted(this.gift.selectedIndex);
		}
		else
			this.otherClose();

	}

	private otherClose():void
	{
		ViewManager.ins().close(this);
	}


}

ViewManager.ins().reg(TreasureChuanshiGiftWin, LayerManager.UI_Popup);