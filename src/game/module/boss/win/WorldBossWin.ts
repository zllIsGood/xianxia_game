/**
 * 转生Boss窗口
 */
class WorldBossWin extends BaseEuiView {
	private challengeBtn: eui.Button;
	private leftBtn: eui.Button;
	private rightBtn: eui.Button;
	private nameTxt: eui.Label;
	private playerText: eui.Label;
	private guildText: eui.Label;
	private leftText: eui.Label;
	private leftCDText: eui.Label;
	private bossImage: MovieClip;
	private selectIndex: number = 0;
	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossSkin";

		this.bossImage = new MovieClip;
		this.bossImage.scaleX = -1;
		this.bossImage.scaleY = 1;
		this.bossImage.x = 330;
		this.bossImage.y = 380;

		this.challengeBtn.y = 400;
	}
}
ViewManager.ins().reg(WorldBossWin, LayerManager.UI_Main);