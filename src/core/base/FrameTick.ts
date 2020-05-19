/**
 * Created by zhangac on 2016/10/29.
 */
class FrameTick {
	private list: number[];

	public constructor() {
		this.list = [];
	}

	public tick(idx: number) {
		this.list[idx] = TimerManager.ins().getFrameId();
	}

	public isTick(idx: number): boolean {
		return this.list[idx] == TimerManager.ins().getFrameId();
	}

	public checkAndTick(idx: number): boolean {
		if (this.isTick(idx)) {
			return true;
		}
		else {
			this.tick(idx);
			return false;
		}
	}
}

