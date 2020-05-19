/**
 * Created by Administrator on 2017/5/2.
 */
class BoxFreeItemRenderer extends BaseItemRender {

	public imgBox0: eui.Image;
	public labelTime: eui.Label;
	public info: BoxFreeData;

	public constructor() {
		super();
		this.skinName = `ChestSkinReward2`;
	}

	protected dataChanged() {
		this.info = this.data as BoxFreeData;
		if (!this.info)
			return;
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE,this.onRemove,this);
		let downIndex: number = BoxModel.ins().getDownTimeIndex();
		if (this.info.getTime() > 0 && downIndex == this.info.pos) {
			this.currentState = "close";
			this.refushDaojishi();
			TimerManager.ins().doTimer(1000, 0, this.refushDaojishi, this);
		} else {
			if (this.info.getTime() <= 0) {
				this.currentState = "open";
			} else {
				this.currentState = "wait";
			}
		}
	}

	private refushDaojishi(): void {
		let time: number = this.info.getTime();
		this.labelTime.text = DateUtils.getFormatBySecond(time);
		if (time <= 0) {
			TimerManager.ins().removeAll(this);
			this.currentState = "open";
			Box.ins().postUpdateFreeBox();
		}
	}

	private onRemove(){
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE,this.onRemove,this);
		this.removeTimer();
	}

	public removeTimer(){
		TimerManager.ins().removeAll(this);
	}
}
