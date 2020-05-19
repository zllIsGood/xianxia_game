/**
 *
 * @author 
 *
 */
class AchieveItem extends BaseItemRender {

	private taskImg: eui.Image;
	private taskName: eui.Label;
	private taskInfo: eui.Label;
	public gotoBtn: eui.Button;
	public awardsBtn: eui.Button;
	private completeImg: eui.Image;
	private completeLabel: eui.Label;

	private awards1:PriceIcon;
	private awards2:PriceIcon;
	constructor() {
		super();

		this.skinName = "TaskItemSkin";
	}

	protected dataChanged(): void {
		let data: AchievementData = this.data as AchievementData;
		if(data) {
			let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			this.taskImg.source = "";//目前没图片
			this.taskName.textFlow = TextFlowMaker.generateTextFlow(config.name + "|C:0x35e62d&T:(" + data.value + "/" + config.target + ")|");
			this.taskInfo.text = config.desc;
			let i: any;
			let num: number = 1;
			for(i in config.awardList) {
				(this["awards" + num++] as PriceIcon).setData(config.awardList[i]);
			}
			switch(data.state) {
				case 0:
					this.gotoBtn.visible = true;
					this.awardsBtn.visible = false;
					this.completeImg.visible = this.completeLabel.visible = false;
					break;
				case 1:
					this.gotoBtn.visible = false;
					this.awardsBtn.visible = true;
					this.completeImg.visible = this.completeLabel.visible = false;
					break;
				case 2:
					this.gotoBtn.visible = false;
					this.awardsBtn.visible = false;
					this.completeImg.visible = this.completeLabel.visible = true;
					break;
			}
			if(config.control == 0)
				this.gotoBtn.visible = false;
		}
	}
}

