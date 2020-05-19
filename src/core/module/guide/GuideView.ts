/**
 * 这是一个例子
 */
class GuideView extends GuideViewBase {
	/**箭头 */
	// private img: eui.Image;
	private mc: MovieClip;
	private lab: eui.Label;
	private arrowGroup: eui.Group;
	private arrow: GuideArrow;
	public constructor() {
		super();

		this.rect = new egret.Rectangle(1, 1, 1, 1);

		this.infoGroup = new eui.Group;
		this.infoGroup.touchEnabled = false;
		this.infoGroup.touchChildren = false;
		this.addChild(this.infoGroup);

		this.mc = new MovieClip;
		this.infoGroup.addChild(this.mc);

		this.arrowGroup = new eui.Group();
		this.infoGroup.addChild(this.arrowGroup);

		this.arrow = new GuideArrow;
		this.arrowGroup.addChild(this.arrow);
		//暂时屏蔽箭头
		// this.img = new eui.Image;
		// this.img.x = -5;
		// this.img.y = 0;
		// this.img.source = "mainUI_json.mainUI_MU_finger";
		// this.infoGroup.addChild(this.img);
	}

	/**
	 * 设置显示数据
	 * @param obj
	 */
	public show(obj: egret.DisplayObject): void {
		super.show(obj);
		this.arrow.update();
		this.mc.playFile(`${RES_DIR_EFF}guideff`, -1);

	}

	public close(): void {
		super.close();
		this.arrow.close();
	}
}