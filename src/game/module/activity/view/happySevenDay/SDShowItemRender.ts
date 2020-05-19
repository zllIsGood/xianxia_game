class SDShowItemRender extends BaseItemRender {
	
	public scheduleTxt:eui.Label;
	public list:eui.List;

	public constructor() {
		super();
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.list.itemRenderer = ItemBase;
	}

	public dataChanged():void
	{
		//{reward:conf.reward, showText:conf.showText}
		this.scheduleTxt.textFlow = TextFlowMaker.generateTextFlow1(this.data.showText);
		this.list.dataProvider = new ArrayCollection(this.data.reward);
	}
}