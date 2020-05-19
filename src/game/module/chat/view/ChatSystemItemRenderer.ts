class ChatSystemItemRenderer extends BaseItemRender {

	public str:eui.Label;
	public type:eui.Image;

	public constructor() {
		super();
		this.skinName = "SysMesItemSkin";
	}

	public dataChanged(): void {
		// this.type.source = "lt_0"+this.data.type;
		if(this.data.type == 1)
		{
			this.str.textFlow = TextFlowMaker.generateTextFlow("|C:0xFD2F2F&T:"+this.data.str+"|");
			this.type.source = "lt_01";
		}else{
			this.str.textFlow = TextFlowMaker.generateTextFlow(this.data.str);
			this.type.source = "lt_02";
		}
	}
}