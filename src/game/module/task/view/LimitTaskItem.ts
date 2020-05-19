class LimitTaskItem extends BaseItemRender {
	public goBtn: eui.Button;
	public taskIcon: ItemBase;
	public taskNameTxt: eui.Label;
	public progTxt: eui.Label;
	public stateTxt: eui.Label;
	public headBG: eui.Image;
	public redPoint: eui.Image;
	private done:eui.Label;
	constructor() {
		super();
		this.skinName = "LimitTimeItem";
	}

	protected dataChanged(): void {
		this.goBtn.visible = true;
		this.done.visible = false;
		this.taskNameTxt.text = this.data.name;
		this.taskIcon.isShowName(false);
		// let baseData = GlobalConfig.LimitTimeTaskConfig[config.taskIds[k]];
		this.taskIcon.data = this.data.awardList[0];
		this.progTxt.text = `(${this.data.progress}/${this.data.target})`;
		if (this.data.type == 83) {
			if (this.data.progress >= this.data.target) {
				this.progTxt.text = '1/1';
			} else {
				this.progTxt.text = '0/1';
			}
		}

		this.progTxt.textColor = 0xC41200;
		if (this.data.state == 0) {
			this.stateTxt.text = "进行中";
			this.goBtn.label = "前往";
		} else if (this.data.state == 1) {
			this.stateTxt.text = "可领取奖励";
			this.goBtn.label = "领取";
			this.progTxt.textColor = 0x499B4F;
		} else if (this.data.state == 2) {
			this.stateTxt.text = "已完成";
			this.goBtn.visible = false;
			this.done.visible = true;
			this.progTxt.textColor = 0x499B4F;
		}

		this.redPoint.visible = (this.data.state == 1);

		// this.goBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.taskIcon.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTopIcon,this);
		this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTap,this);
	}

	private onTopIcon(e:egret.TouchEvent):void {
		e.stopImmediatePropagation();
		e.stopPropagation();
	}

	private onTap(e:egret.TouchEvent):void {
		if (this.data.state == 0) {
			let para: number = this.data.controlTarget[1] ? this.data.controlTarget[1] : 0;
			if (this.data.controlTarget[0] == 'GuanQiaRewardWin') {
				this.gotoQuanQia();
				return;
			}

			ViewManager.ins().open(this.data.controlTarget[0], para);
		} else if (this.data.state == 1) {
			if (UserBag.ins().getSurplusCount() < 1) {
				UserTips.ins().showTips(`背包剩余空位不足，请先清理`);
			} else {
				UserTask.ins().sendGetLimitTaskReward(this.data.id)
			}
		}
	}

	private gotoQuanQia(){
		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
			ViewManager.ins().closeTopLevel();
			ViewManager.ins().open(BagFullTipsWin);
		} else {
			if (UserFb.ins().currentEnergy >= UserFb.ins().energy) {
				ViewManager.ins().closeTopLevel();
				UserFb.ins().autoPk();
			} else {
				UserTips.ins().showTips("|C:0xf3311e&T:能量不足|");
			}
		}
		return false;
	}
}

