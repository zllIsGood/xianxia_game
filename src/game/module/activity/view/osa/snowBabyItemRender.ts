class snowBabyItemRender extends BaseItemRender{
	
	public boxUnder:eui.Image;
	public box:eui.Image;
	public boxSchadule:eui.Label;
	public lingqu:eui.Image;
	public redPoint:eui.Group;
	public count:eui.Label;

	private _state:number = 0;
	
	public constructor() {
		super();
		this.skinName = "snowBabyItemSkin";
		this.touchChildren = false;
	}

	public dataChanged():void
	{
		//this["reward" + i].data = {id:config.reward[index].id,type:config.reward[index].type,count:config.reward[index].count, index:index + 1, state:state, times:config.reward[index].times, curTimes:curTimes};
		this.touchEnabled = this.data.state != 2;
		this.redPoint.visible = this.data.state == 1;
		this.lingqu.visible = this.data.state == 2;

		let colorStr = this.data.state == 0 ? 0xff0000 : 0x00ff00;
		this.boxSchadule.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${this.data.curTimes > this.data.times ? this.data.times : this.data.curTimes}|/${this.data.times}`);
		this.count.text = this.data.count;

		//道具奖励
		if (this.data.type == 1)
		{
			let itemConfig:ItemConfig = GlobalConfig.ItemConfig[this.data.id];
			this.box.source = itemConfig.icon + '_png';
		}
		else
			this.box.source = "richman_reward";
	}
}