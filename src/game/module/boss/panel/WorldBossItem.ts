class WorldBossItem extends BaseItemRender {

	// private head: eui.Image;

	private timeTxt: eui.Label;

	private titleText: eui.Label;

	// private nameTxt: eui.Label;
	private killImg: eui.Image;
	constructor() {
		super();
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
	}

	public dataChanged(): void {
		if (!this.data) return;
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.data.id];
		if(!config)return;
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
		TimerManager.ins().remove(this.updateTime, this);
		// this.titleText.text = config.zsLevel > 0 ? `${config.zsLevel}转BOSS` : `${config.level}级BOSS`;
		this.titleText.text = bossBaseConfig.name;
		if (this.data.bossState == 2 || this.data.bossState == 0) {
			this.killImg.visible = false;
			this.updateTime();
			TimerManager.ins().doTimer(1000, 0, this.updateTime, this);
		} else if (this.data.bossState == 1) {
			this.timeTxt.text = "已刷新";
			this.killImg.visible = true;
		} else {
			this.killImg.visible = false;
		}
	}

	private updateTime(): void {
		let time: number = this.data.relieveTime - egret.getTimer();
		this.timeTxt.text = `${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}`;
		if (time <= 0) {
			TimerManager.ins().remove(this.updateTime, this);
			this.timeTxt.text = ``;
		}
	}

	private onRemove(e) {
		TimerManager.ins().remove(this.updateTime, this);
	}
}