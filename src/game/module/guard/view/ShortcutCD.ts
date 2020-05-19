/**
 * Created by Peach.T on 2018/1/3.
 */
class ShortcutCD extends egret.Sprite {

	private radius: number;

	private maskShape: egret.Shape;

	private duration: number;

	private startTime: number;

	public constructor(radius: number) {
		super();
		this.setSize(radius);
	}

	public setSize(radius: number): void {
		this.radius = radius;
		this.graphics.clear();
		this.graphics.beginFill(0, 0.9);
		this.graphics.drawCircle(0, 0, radius);
		this.graphics.endFill();

		this.maskShape = new egret.Shape();
		this.maskShape.graphics.clear();
		this.maskShape.graphics.beginFill(0, 0.7);
		this.maskShape.graphics.drawCircle(0, 0, radius);
		this.maskShape.graphics.endFill();
		this.addChild(this.maskShape);
		this.mask = this.maskShape;
		this.visible = false;
	}

	public play(duration: number): void {
		duration *= 1000;
		if (duration > 0) {
			this.visible = true;
			this.duration = duration;
			this.startTime = egret.getTimer();
			egret.startTick(this.onUpdate, this);
		}
	}

	public onUpdate(): boolean {
		let time = egret.getTimer();
		let useTime = time - this.startTime;
		if (useTime >= this.duration) {
			this.stop();
			return false;
		}
		this.maskShape.graphics.clear();
		this.maskShape.graphics.beginFill(0, 0.7);
		this.maskShape.graphics.moveTo(0, 0);
		this.maskShape.graphics.lineTo(this.radius, 0);
		this.maskShape.graphics.drawArc(0, 0, this.radius, (useTime / this.duration) * 2 * Math.PI - Math.PI / 2, 2 * Math.PI - Math.PI / 2);
		this.maskShape.graphics.lineTo(0, 0);
		this.maskShape.graphics.endFill();
		return false;
	}

	public stop(): void {
		this.visible = false;
		egret.stopTick(this.onUpdate, this);
		this.maskShape.graphics.clear();
	}
}
