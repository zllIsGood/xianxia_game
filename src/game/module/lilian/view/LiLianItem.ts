/**
 * 历练item
 */
class LiLianItem extends BaseItemRender {

	public nameTxt: eui.Label;
	public descTxt: eui.Label;
	public liLianNumTxt: eui.Label;
	public goOnTxt: eui.Label;
	public sureImg: eui.Image;
	public isClose:boolean;

	constructor() {
		super();
		this.skinName = 'LiLianItemSkin';
		this.isClose = false;
		this.goOnTxt.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.goOnTxt.text}</u></a>`);
		this.goOnTxt.touchEnabled = true;
	}

	protected dataChanged(): void {
		let data: TaskData = this.data as TaskData;
		if (data && data["null"] == null && Object.keys(data).length>0) {
			let config: DailyConfig = GlobalConfig.DailyConfig[data.id];
			this.nameTxt.text = config.name;
			this.descTxt.textFlow = TextFlowMaker.generateTextFlow("|C:0x35e62d&T:" + data.value + "/" + config.target + "|");
			this.liLianNumTxt.text = config.trainExp + "历练";
			if (data.state > 0) {
				this.sureImg.visible = true;
				this.goOnTxt.visible = false;
			} else {
				this.sureImg.visible = false;
				this.goOnTxt.visible = true;
			}
			//不退出天阶面板的跳转id来自DailyConfig
			if( data.id == 1 || data.id == 3 || data.id == 4 || data.id == 5 ||
				data.id == 6 || data.id == 7 || data.id == 8 ||
				data.id == 9 || data.id == 10){
				this.isClose = true;
			}
		}
	}
}
