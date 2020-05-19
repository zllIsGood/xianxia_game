/**
 * Created by Administrator on 2017/3/13.
 */
class BoxRoomItem extends BaseItemRender {
	constructor() {
		super();
	}

	private labelName: eui.Label;
	private labelTips: eui.Label;
	private imgBox: eui.Image;
	protected dataChanged() {
		let data = this.data as BoxRoomData;
		if (!data.canUsed) {
			this.currentState = `Tips`;
			this.labelTips.text = `通关到第${data.openChapter}开启`;
			return;
		}
		if (data.itemId) {
			this.currentState = `box`;
			let conf = GlobalConfig.TreasureBoxConfig[data.itemId];
			this.imgBox.source = conf.imgClose;
			this.labelName.text = conf.name;
		} else {
			this.currentState = `room`;
		}
	}
}
