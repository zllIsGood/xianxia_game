class BackStageNoticeView extends BaseEuiView {
	private frame: eui.Image;
	private label: eui.Label;
	private list: string[] = [];
	private speed: number = 90;

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.frame = new eui.Image;
		this.frame.source = "main_bg_rank_boss";
		this.frame.scale9Grid = new egret.Rectangle(143, 3, 17, 23);
		this.frame.left = 0;
		this.frame.right = 0;
		this.frame.height = 28;
		this.frame.horizontalCenter = 0;
		this.frame.y = 280;
		this.addChild(this.frame);
		this.frame.visible = false;

		this.label = new eui.Label;
		this.label.size = 20;
		this.label.textColor = 0xff0000;
		this.label.strokeColor = 0x000000;
		this.label.y = this.frame.y + 4;
		this.label.text = ``;
		this.addChild(this.label);

		this.touchChildren = false;
		this.touchEnabled = false;
	}

	/**
	 * 显示公告
	 * @param str
	 */
	public showNotice(str: string): void {
		this.frame.visible = true;
		this.list.push(str);

		if (this.list.length == 1) {
			this.tweenLab();
		}
	}

	private tweenLab(): void {
		let str: string = this.list[0];
		let stageW: number = StageUtils.ins().getWidth();
		this.label.textFlow = TextFlowMaker.generateTextFlow(str);
		this.label.x = stageW;

		let tweenX: number = -this.label.width;
		egret.Tween.removeTweens(this.label);
		let t: egret.Tween = egret.Tween.get(this.label);
		t.to({ "x": tweenX }, stageW / (this.speed / 1000)).call(() => {
			this.list.shift();
			if (this.list.length < 1) {
				this.label.text = ``;
				this.frame.visible = false;
			}
			else {
				this.tweenLab();
			}
		}, this);
	}

}

ViewManager.ins().reg(BackStageNoticeView, LayerManager.UI_Tips);
