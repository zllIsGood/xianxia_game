class HighProjectItemRender extends BaseItemRender{
	
	public projectName:eui.Label;
	public daliyCount:eui.Label;
	public jifen:eui.Label;

	public constructor() {
		super();
		this.skinName = "highProjectItemSkin";
		this.touchChildren = false;
		this.touchEnabled = true;
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}

	public dataChanged():void
	{
		//{config:config, times:data.achieveInfo[i]};
		this.projectName.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.data.config.name}`);
		this.jifen.textFlow = TextFlowMaker.generateTextFlow1(`|C:${0x00ff00}&T:${this.data.config.score}|积分`) ;

		//let colorStr = this.data.times < this.data.config.dayLimit ? 0xff0000 : 0x00ff00;
		let cur = Math.floor(this.data.times/this.data.config.target);
		let max = Math.floor(this.data.config.dayLimit/this.data.config.target);
		if (cur > max) cur = max;
		this.daliyCount.textFlow = TextFlowMaker.generateTextFlow1(`|C:${0x00ff00}&T:${cur}|/${max}`);
	}

	private onTouch(e:egret.TouchEvent):void
	{
		if (this.data.config.turn)
			ViewManager.ins().open(this.data.config.turn[0], this.data.config.turn[1]);
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}
}