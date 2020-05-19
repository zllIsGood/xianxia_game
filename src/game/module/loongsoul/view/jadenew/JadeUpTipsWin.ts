/** 玉佩蕴养提示界面 */
class JadeUpTipsWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public BG:eui.Image;
	public num:eui.Label;
	public use:eui.Label;
	public info:eui.Group;
	public num0:eui.Label;
	public attr:eui.Label;
	public itemIcon:ItemIcon;
	public nameLabel:eui.Label;
	public tipGroup:eui.Group;
	public closeBtn2:eui.Button;

	public constructor() {
		super();
		this.skinName = "YuPeiUpTipsSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTouch);

		let info:{id:number, used:number, curMax:number, jade:number, count:number} = args[0];
		let itemConfig:ItemConfig = GlobalConfig.ItemConfig[info.id];
		this.itemIcon.setData(itemConfig);
		this.nameLabel.text = itemConfig.name;
		this.use.text = info.used + "/" + info.curMax;
		this.num.text = info.count + "";
		this.attr.textFlow = TextFlowMaker.generateTextFlow1(itemConfig.desc);

		let maxPhase:number = Math.floor((Object.keys(GlobalConfig.JadePlateLevelConfig).length - 1) / GlobalConfig.JadePlateBaseConfig.perLevel) + 1;
		let cfg:JadePlateLevelConfig;
		let show:boolean = false;
		let i:number;
		for (i = info.jade; i <= maxPhase; i++)
		{
			cfg = GlobalConfig.JadePlateLevelConfig[(i - 1) * GlobalConfig.JadePlateBaseConfig.perLevel];
			if (cfg.upgradeItemInfo && cfg.upgradeItemInfo[info.id] && (+cfg.upgradeItemInfo[info.id]) > info.curMax)
			{
				show = true;
				break;
			}
		}

		if (show)
		{
			this.info.visible = true;
			this.num0.text = i + "阶";
		}
		else
			this.info.visible = false;

	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTouch);
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}

	}
}

ViewManager.ins().reg(JadeUpTipsWin, LayerManager.UI_Main);