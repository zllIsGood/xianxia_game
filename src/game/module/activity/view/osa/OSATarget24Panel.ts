/**
 * boss狂欢 24
 */
class OSATarget24Panel extends ActivityPanel {
	private actTime: eui.Label;
	private actDesc: eui.Label;
	private btnChallenge: eui.Button;

	private actData;
	private curTime: number;

	public constructor() {
		super();
		this.skinName = `OSABossCarnival`;
	}

	protected childrenCreated() {
		super.childrenCreated();
	}

	public open(...param: any[]): void {
		this.refreshData();
		this.addTouchEvent(this.btnChallenge,()=>{
			if (this.actData && this.actData.isOpenActivity()) {
				ViewManager.ins().open(BossWin,1);
			}
			else {
				UserTips.ins().showTips('野外Boss功能未开启');
			}
		})
	}

	public refreshData(): void {
		this.actData = Activity.ins().getActivityDataById(this.activityID) as ActivityType24Data;
		// console.log(this.actData);
		// console.log(this.actData.isOpenActivity());
		this.actDesc.text = this.actData.config.desc
		this.setTimer();

	}

	public close(...param: any[]): void {
		this.removeObserve();
	}

	private setTimer(): void {
		if (TimerManager.ins().isExists(this.updateTimer,this)) {
			TimerManager.ins().remove(this.updateTimer,this);
		}
		this.curTime = this.actData.getLeftTime();
		this.actTime.text = DateUtils.getFormatBySecond(this.curTime,DateUtils.TIME_FORMAT_5,4);
		let overTimes: number = this.curTime;
		TimerManager.ins().doTimer(1000,overTimes,this.updateTimer,this);		
	}
	private updateTimer(): void {
		this.curTime -= 1;
		if (this.curTime <= 0) {
			this.actTime.text = "已结束";
			return;
		}
		this.actTime.text = DateUtils.getFormatBySecond(this.curTime,DateUtils.TIME_FORMAT_5,4);
	}

}