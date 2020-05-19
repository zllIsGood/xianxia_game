class GuildMosterPanel extends BaseView {
	private bossmc: MovieClip;
	private staticMc: MovieClip;
	private index: number;
	private start: RobberStartInfo;
	public constructor() {
		super();

		this.bossmc = new MovieClip;
		this.bossmc.scaleX = -0.5;
		this.bossmc.scaleY = 0.5;
		this.bossmc.x = 0;
		this.bossmc.y = 0;
		this.addChild(this.bossmc);

		this.staticMc = new MovieClip;
		this.addChild(this.staticMc);
		this.staticMc.y = -60;
		this.addTouchEvent(this, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		if (this.start.robberStart == 1) {
			UserTips.ins().showTips("|C:0xf3311e&T:正在被挑战中|");
			return;
		}
		// if (GuildRobber.ins().robberChanllge >= GlobalConfig.robberfbconfig.challengeMax) {
		// 	UserTips.ins().showTips("|C:0xf3311e&T:本日挑战次数不足|");
		// 	return;
		// }
		GuildRobber.ins().sendRobberChanger(this.index);
		ViewManager.ins().close(GuildMap);
	}

	public update(info: RobberStartInfo, bossnum: number, p: number): void {
		this.start = info;
		let monster: string = '';
		// monster = GlobalConfig.robberfbconfig.effect[this.start.robberType - 1];
		this.bossmc.playFile(RES_DIR_EFF +`monster${monster}_${p}s`, -1);
		this.index = bossnum + 1;
		this.staticMc.playFile(RES_DIR_EFF + (info.robberStart==0 ? 'ketiaozhan' : 'zhandouzhong'), -1);
	}

}