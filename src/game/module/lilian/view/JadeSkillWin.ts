class JadeSkillWin extends BaseEuiView{

	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public background:eui.Image;
	public deter0:eui.Image;
	public content:eui.Label;
	public tipGroup:eui.Group;

	public constructor() {
		super();
		this.skinName = "YupeiSkillTipsSkin";
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this.bgClose, this.onClose);

		let cfg:YuPeiConfig = GlobalConfig.YuPeiConfig[LiLian.ins().jadeLv];
		let per:string = "0";
		for (let k in cfg.attrs)
		{
			if (cfg.attrs[k].type == AttributeType.atYuPeiDeterDam)
			{
				per = (cfg.attrs[k].value / 100).toFixed(1);
				break;
			}
			
		}

		this.content.textFlow = TextFlowMaker.generateTextFlow1( GlobalConfig.YuPeiBasicConfig.deterDesc.replace("{0}", per + "%"));	
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onClose);
	}

	private onClose(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(JadeSkillWin, LayerManager.UI_Main);