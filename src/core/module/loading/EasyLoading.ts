/**
 * Created by husong on 4/10/15.
 */
class EasyLoading extends BaseClass {

	private content: egret.Sprite = null;
	private speed: number = 10 / (1000 / 60);
	private averageUtils: AverageUtils;
	private uiImageContainer: egret.DisplayObjectContainer;

	constructor() {
		super();
		this.init();
	}

	public static ins(): EasyLoading {
		return super.ins() as EasyLoading;
	}

	private init(): void {
		this.averageUtils = new AverageUtils();

		this.content = new egret.Sprite();
		this.content.graphics.beginFill(0x000000, 0.2);
		this.content.graphics.drawRect(0, 0, StageUtils.ins().getWidth(), StageUtils.ins().getHeight());
		this.content.graphics.endFill();
		this.content.touchEnabled = true;

		this.uiImageContainer = new egret.DisplayObjectContainer();
		this.uiImageContainer.x = this.content.width * 0.5;
		this.uiImageContainer.y = this.content.height * 0.5;
		this.content.addChild(this.uiImageContainer);

		RES.getResByUrl(RES_DIR + "load_Reel.png", function (texture: egret.Texture): void {
			let img: egret.Bitmap = new egret.Bitmap();
			img.texture = texture;
			img.x = -img.width * 0.5;
			img.y = -img.height * 0.5;
			this.uiImageContainer.addChild(img);
		}, this, RES.ResourceItem.TYPE_IMAGE);

		GameSocket.ins().setOnClose(this.showLoading, this);
		GameSocket.ins().setOnConnected(this.hideLoading, this);
	}

	public showLoading(): void {
		StageUtils.ins().getStage().addChild(this.content);
		// egret.Ticker.getInstance().register(this.enterFrame, this);
		egret.startTick(this.enterFrame, this);
	}

	public hideLoading(): void {
		if (this.content && this.content.parent) {
			StageUtils.ins().getStage().removeChild(this.content);
			this.uiImageContainer.rotation = 0;
		}
		egret.stopTick(this.enterFrame, this);
	}

	private enterFrame(time: number): boolean {
		this.averageUtils.push(this.speed * time);
		this.uiImageContainer.rotation += this.averageUtils.getValue();
		return false;
	}
}
