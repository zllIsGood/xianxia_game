/**
 * Created by Administrator on 2017/3/13.
 */
class BoxOpenItem extends BaseItemRender {
	constructor() {
		super();
		this.skinName = "ChestStateOpenSkin";
	}

	private labelTime: eui.Label;
	public time: number;
	private labelTips: eui.Label;
	private imgBox: eui.Image;
	protected dataChanged() {
		this.labelTime.text = "";
		TimerManager.ins().removeAll(this);
		let data = this.data as BoxOpenData;

		this.time = data.getTime();
		if (!data.canUsed) {
			this.labelTips.text = `${data.openTips}`
			this.currentState = `tips`;
			return;
		}
		if (!data.itemId) {
			this.currentState = `add`;
			return;
		}
		let conf = GlobalConfig.TreasureBoxConfig[data.itemId];
		this.imgBox.source = conf.imgClose;
		if (this.time > 0) {
			TimerManager.ins().doTimer(1000, this.time, this.updateTime, this);
			this.currentState = `waiting`;
		} else {
			this.currentState = `canOpen`;
		}
	}

	private updateTime() {
		if (this.time > 0) {
			this.time--;
			this.labelTime.text = DateUtils.getFormatBySecond(this.time, 1);

		} else {
			TimerManager.ins().removeAll(this);
		}
	}

	public destruct() {
		TimerManager.ins().removeAll(this);
	}
}