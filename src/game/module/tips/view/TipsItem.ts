/**
 *
 */
class TipsItem extends BaseView {
	public bg: eui.Image;
	public lab: eui.Label;

	protected _labelText: string;
	private _type: number;
	private index: number = 0;
	protected addToEvent:boolean;

	constructor() {
		super();
		this.skinName = "TipsSkin";
		// this.bg.visible = false;

		this.lab.stroke = 1;
		this.lab.strokeColor = 0x000000;
	}

	public setIndex(value: number): void {
		this.index = value;
	}


	public get labelText(): string {
		return this._labelText;
	}

	public set labelText(value: string) {
		this._labelText = value;
		this.lab.textFlow = TextFlowMaker.generateTextFlow(this._labelText);
		this.bg.width = this.lab.width;

		this.bg.visible = false;
		this.lab.alpha = 1;

		this.bg.y = 0;
		// this.lab.verticalCenter = -1;

		if(!this.addToEvent) {
			this.addToEvent = true;
			TimerManager.ins().doTimer(1200, 1, this.removeFromParent, this);
		}
	}

	protected removeFromParent() {
		this.addToEvent = false;
		DisplayUtils.removeFromParent(this);
		egret.Tween.removeTweens(this);
		ObjectPool.push(this);
	}
}