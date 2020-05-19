class BoxDetailWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `ChestRewardSkin`;
		this.list.dataProvider = null;
		this.list.itemRenderer = BoxDetailItem;
		this.isTopLevel = true;
	}

	private endTime: number;

	private rect: eui.Rect;
	private data: BoxOpenData;
	public costNum: eui.Label;
	public t3: eui.Label;
	public labelTime: eui.Label;
	public btnOpen: eui.Button;
	public list: eui.List;
	public imgBox: eui.Image;
	public rule: eui.Group;
	private labelVip: eui.Label;
	private labelWarning: eui.Label;
	private costMoney: number;

	public open(...param: any[]) {
		this.data = param[0];
		let conf = GlobalConfig.TreasureBoxConfig[this.data.itemId];
		this.imgBox.source = conf.imgClose;
		this.updateList();
		this.endTime = this.data.getTime();
		if (this.data.state == 2) {
			this.currentState = `payOpen`;
			this.doTime();
			TimerManager.ins().doTimer(1000, this.endTime, this.doTime, this);
		} else if (this.data.state == 1 && Box.ins().isHaveFreePos()) {
			this.currentState = `open`;
			this.t3.text = DateUtils.getFormatBySecond(conf.time);
		} else {
			this.currentState = `jiesuo`;
			this.labelTime.text = DateUtils.getFormatBySecond(conf.time);
			this.costMoney = BoxModel.ins().countBoxTimeCost(conf.time, conf.type);
			this.costNum.text = this.costMoney + "";
			if (UserVip.ins().lv < GlobalConfig.TreasureBoxBaseConfig.thirdOpenLevel) {
				this.labelVip.visible = true;
				this.labelWarning.text = `队列不足，只能同时解锁1个宝箱`;
				this.labelVip.text = `${UserVip.formatLvStr(GlobalConfig.TreasureBoxBaseConfig.thirdOpenLevel)} 可同时解锁2个宝箱`;
			} else {
				this.labelVip.visible = false;
				this.labelWarning.text = `队列不足，只能同时解锁2个宝箱`;
			}
		}
		this.addTouchEvent(this.rect, this.onTap);
		this.addTouchEvent(this.btnOpen, this.onTap);
	}

	public close() {
		this.removeTouchEvent(this.rect, this.onTap);
		this.removeTouchEvent(this.btnOpen, this.onTap);
	}


	private doTime() {
		this.endTime--;
		if (this.endTime <= -1) {
			TimerManager.ins().remove(this.doTime, this);
			Box.ins().sendOpen(this.data.pos);
			ViewManager.ins().close(BoxDetailWin);
		} else {
			this.labelTime.text = DateUtils.getFormatBySecond(this.endTime, 1);
			this.costMoney = BoxModel.ins().countBoxTimeCost(this.endTime, this.data.itemId);
			this.costNum.text = this.costMoney + "";
		}
	}

	private updateList() {
		this.list.dataProvider = new eui.ArrayCollection(this.data.getDetailData());
	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.btnOpen:
				if (Actor.yb < this.costMoney) {
					UserTips.ins().showTips(`元宝不足`);
					ViewManager.ins().close(this);
					return;
				}
				Box.ins().sendOpen(this.data.pos);
				ViewManager.ins().close(BoxDetailWin);
				break;
			case this.rect:
				ViewManager.ins().close(BoxDetailWin);
				break;
		}
	}
}

ViewManager.ins().reg(BoxDetailWin, LayerManager.UI_Popup);