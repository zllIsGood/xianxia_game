class XiaoNianListRenderer extends BaseItemRender {

	public showText: eui.Label;

	constructor() {
		super();
		this.skinName = "HuntListRendererSkin";
	}

	public dataChanged(): void {
		if( !this.data )return;
		this.showText.textFlow = TextFlowMaker.generateTextFlow(this.data);
	}

}