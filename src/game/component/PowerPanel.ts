/**
 * 战斗力
 */
class PowerPanel extends BaseView {
	protected labPower: eui.BitmapLabel;
	private flameMC: MovieClip;
	public flameGroup: eui.Group;
	private powerImg: eui.Image;
	private bgImg: eui.Image;
	/**
	 * 战斗力
	 */
	public power: number;

	constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.touchEnabled = this.touchChildren = false;
		this.playFlameMC();
	}

	public setPower(value: number) {
		this.power = value;
		this.labPower.text = value.toString();
	}

	public setBgVis(bool: boolean): void {
		if (!this.bgImg || !this.flameGroup) return;

		//因为有几个不同的皮肤调用这个逻辑类，有些皮肤设置了控件显示与隐藏，在皮肤区分了，所以这里只作显示的处理
		if (this.bgImg.visible) this.bgImg.visible = bool;
		if (this.flameGroup.visible) this.flameGroup.visible = bool;
	}

	public setMcVisible(bool) {
		if (!this.flameGroup || !this.flameGroup.visible) return;
		this.flameGroup.visible = bool;
	}

	/**
	 * 播放火焰动画
	 */
	private playFlameMC() {
		if (this.flameMC) {
			this.flameMC.play(-1);
		} else if (this.flameGroup && this.flameGroup.visible) {
			this.flameMC = new MovieClip();
			this.flameMC.x = 100;
			this.flameMC.y = 8;
			this.flameMC.playFile(RES_DIR_EFF + "zhanduolibeijing", -1);
			this.flameGroup.addChild(this.flameMC);
		}
	}

	public destructor(): void {
		DisplayUtils.removeFromParent(this);
	}
}