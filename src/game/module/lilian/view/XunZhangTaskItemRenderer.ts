/**
 * Created by Administrator on 2017/3/28.
 */
class XunZhangTaskItemRenderer extends BaseItemRender {

	public taskIcon: eui.Image;
	public nameTF: eui.Label;
	public barBg: eui.Image;
	public expBar: eui.ProgressBar;
	public expLabel: eui.Label;

	constructor() {
		super();
		this.skinName = "XunzhangTaskSkin";
	}

	protected dataChanged(): void {
		let data: AchievementData = this.data as AchievementData;
		if (data && data["null"] == null && Object.keys(data).length>0) {
			let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			this.nameTF.textFlow = TextFlowMaker.generateTextFlow(config.name);
			let value: number = Math.min(data.value, config.target);
			this.expLabel.text = `${value}/${config.target}`;
			this.expBar.maximum = config.target;
			this.expBar.value = value;
			this.taskIcon.source = "xunzhang" + data.achievementId + "_png";
			if (data.value >= config.target) {
				this.currentState = "done";
			} else {
				this.currentState = "goon";
			}
		}
	}
}
