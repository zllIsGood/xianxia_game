class NoticeYBListRenderer extends BaseItemRender {
	public showText: eui.Label;
	private activityID:number;
	constructor() {
		super();
		this.skinName = "HuntListRendererSkin";
	}

	public dataChanged(): void {
		let name = this.data.name;
		this.activityID = this.data.activityID;
		let multiple = this.data.multiple;
		let yb = this.data.yb;
		// let config:ActivityType10Config = GlobalConfig.ActivityType10Config[this.activityID][index];
		let str = "";
		// if( config ){
			let nstr:string = "";
			let cstr:number = ColorUtil.NORMAL_COLOR;
			//货币
			let type: number = 5;//颜色类型

			nstr = RewardData.getCurrencyName(2);
			cstr = 0xff0000;//ItemBase.QUALITY_COLOR[type];
			str = "<font color = '#16b2ff'>" + name + "</font> 在元宝转盘中抽中了 <font color='" + cstr + "'>" + multiple + "</font>倍，获得<font color='" + cstr + "'>" + `${yb}` + "</font>元宝";


		// }
		this.showText.textFlow = TextFlowMaker.generateTextFlow(str);
	}




}