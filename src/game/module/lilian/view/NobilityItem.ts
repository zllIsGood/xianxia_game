/**
 *
 * @author 
 *
 */
class NobilityItem extends BaseItemRender {

	public nameTxt: eui.Label;
	public goOnTxt: eui.Label;
	public sureImg: eui.Image;

	constructor() {
		super();
		this.skinName = 'NobilityItemSkin';

		this.goOnTxt.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.goOnTxt.text}</u></a>`);
		this.goOnTxt.touchEnabled = true;
	}
	protected dataChanged(): void {
		let data: AchievementData = this.data as AchievementData;
		if (data) {
			let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			let str: string = config.name + "|C:0x35e62d&T:(" + data.value + "/" + config.target + ")|";
			this.nameTxt.textFlow = TextFlowMaker.generateTextFlow(str);
			if (data.state > 0) {
				this.sureImg.visible = true;
				this.goOnTxt.visible = false;
			} else {
				this.sureImg.visible = false;
				this.goOnTxt.visible = Boolean(config.control);
			}
		}
	}
}
