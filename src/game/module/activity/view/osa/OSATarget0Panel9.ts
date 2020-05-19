/**
 * //静态跳转展示页
 */
class OSATarget0Panel9 extends BaseView {
	private actTime: eui.Label;
	private actInfo: eui.Label;
	private pay0: eui.Button;
	public activityID: number;
	private title: eui.Image;
	private _time: number = 0;
	//烈焰印记
	private img: eui.Image;
	private _balls: MovieClip[];
	private _angles: number[] = [0, 0, 0, 0, 0, 0, 0];
	private _circleCenter: { x: number, y: number } = {x: 168, y: 120};
	private _a: number = 155;
	private _b: number = 80;
	private _angle: number = 0.1;
	private redPoint: eui.Image;

	constructor(...param: any[]) {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();


	}

	private setCurSkin(): void {
		let aCon: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "XNWingUpSkin";
	}

	public open(...param: any[]): void {
		this.setCurSkin();
		this.addTouchEvent(this.pay0, this.onTap);
		this.observe(UserBag.ins().postItemChange,this.updateData)
		this.updateData();
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
	}

	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().removeAll(this);
		this.resetBalls();
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.pay0:
				let aCon: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
				if (!aCon.jump) return;
				switch (aCon.jump[0]) {
					case StatePageSysType.WING:
						// if (Actor.level < GlobalConfig.WingCommonConfig.openLevel) {
						// 	UserTips.ins().showTips("羽翼" + GlobalConfig.WingCommonConfig.openLevel + "级开启");
						// 	return;
						// }
						// ViewManager.ins().open(aCon.jump[1], aCon.jump[2], 0);
						// break;
					case StatePageSysType.RING:
						if (!LyMark.ins().checkOpen()) {
							UserTips.ins().showTips(`烈焰戒指达到${GlobalConfig.FlameStamp.openLevel}级开启`);
							return;
						}
						ViewManager.ins().open(aCon.jump[1], aCon.jump[2]);
						break;
					default:
						ViewManager.ins().open(aCon.jump[1], aCon.jump[2]);
				}
				break;

		}


	}

	public updateData() {
		let activityData: ActivityType0Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType0Data;
		let beganTime = Math.floor(activityData.startTime / 1000 - GameServer.serverTime / 1000);
		let endedTime = Math.floor(activityData.endTime / 1000 - GameServer.serverTime / 1000);

		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
			this._time = endedTime;
		}
		let btncfg: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		this.title.source = btncfg.title;
		this.actInfo.textFlow = TextFlowMaker.generateTextFlow1(btncfg.acDesc);
		let aCon: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		switch (aCon.jump[0]) {
			case StatePageSysType.RING:
				this.updateBalls();
				this.redPoint.visible = false;
				if (LyMark.ins().checkOpen()) {
					if (!LyMark.ins().isMax) {
						let cfg: FlameStampLevel = GlobalConfig.FlameStampLevel[LyMark.ins().lyMarkLv];
						let itemData: ItemData = UserBag.ins().getBagItemById(cfg.costItem);
						let count: number = itemData ? itemData.count : 0;
						this.redPoint.visible = count >= cfg.costCount;
					}
				}
				break;
		}
	}

	private setTime() {
		if (this._time > 0) {
			this._time -= 1;
			this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
		}
	}

	private updateBalls() {
		if (!this.img || !this.img.parent)
			return;

		//旋转印记
		let bollNum = 7;
		if (bollNum) {
			this.resetBalls();

			if (!this._balls) {
				this._balls = [];
				TimerManager.ins().doTimer(17 * 3, 0, this.doCircle, this);
			}
			this._circleCenter.x = 155.5;
			this._circleCenter.y = 140;
			let ball: MovieClip;
			let radian: number = 2 * Math.PI / bollNum;
			for (let i: number = 0; i < bollNum; i++) {
				ball = ObjectPool.pop("MovieClip");
				this.img.parent.addChild(ball);

				this._angles[i] = radian * i;
				ball.x = this._a * Math.cos(radian * i) + this._circleCenter.x;
				ball.y = this._b * Math.sin(radian * i) + this._circleCenter.y;
				this._balls.push(ball);
				ball.playFile(`${RES_DIR_EFF}lymarkeff`, -1);
			}
		}
	}

	private doCircle(): void {
		if (!this._balls) {
			TimerManager.ins().removeAll(this);
			return;
		}

		if (!this.img || !this.img.parent)
			return;

		let len: number = this._balls.length, ball: MovieClip;
		let parent: egret.DisplayObjectContainer;
		let imgIndex: number = 0, selfIndex: number = 0;
		for (let i: number = 0; i < len; i++) {
			ball = this._balls[i];
			ball.x = this._a * Math.cos(this._angles[i]) + this._circleCenter.x;
			ball.y = this._b * Math.sin(this._angles[i]) + this._circleCenter.y;
			this._angles[i] += this._angle;
			this._angles[i] = this._angles[i] % (2 * Math.PI);
			parent = ball.parent;
			imgIndex = parent.getChildIndex(this.img);
			selfIndex = parent.getChildIndex(ball);
			if (this._angles[i] >= 2.5 && this._angles[i] <= 6) {
				if (selfIndex > imgIndex)
					parent.addChildAt(ball, 3);
			}
			else {
				if (selfIndex < imgIndex)
					parent.addChildAt(ball, parent.numChildren);
			}
		}
	}

	private resetBalls(): void {
		TimerManager.ins().removeAll(this);
		if (this._balls) {
			let len: number = this._balls.length;
			for (let i: number = 0; i < len; i++) {
				this._balls[i].destroy();
				this._balls[i] = null;
			}

			this._balls.length = 0;
			this._balls = null;
		}
	}
}