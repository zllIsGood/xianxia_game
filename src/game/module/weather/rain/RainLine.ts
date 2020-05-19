class RainLine extends eui.Image {

	/**
	 * 是否自动旋转
	 */
	public autoRotation: boolean = true;

	/**
	 * 自转增量
	 */
	public rotationPlus: number;

	/**
	 * x方向加速度
	 */
	public sptx: number = 0;

	/**
	 * x轴速度
	 */
	public speedx: number = 0;

	/**
	 * y轴速度
	 */
	public speedy: number = 0;

	/**
	 * 目标y
	 */
	public targety: number = 0;

	/**
	 * 起点Y
	 */
	public sy: number = 0;

	/**
	 * 原始随机缩放
	 */
	public sScale: number;

	/**
	 * 是否向下运动
	 */
	public down: boolean = true;

	/**
	 * 粒子类型（0表示移动类型，1表示缩放类型）
	 */
	public type: number;

	public isDeath: boolean;

	private spt: number = 0;
	public constructor() {
		super();
		this.touchEnabled = false;
		// this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);
	}

	private onRemoveFromStage() {
		this.isDeath = true;
	}

	/**更新
	 * @param {boolean} 是否使用 参数进行X轴变化
	 */
	public update(useSpt: boolean = true): void {
		this.spt += this.sptx;
		var tx: number = this.x + this.speedx + (useSpt ? Math.cos(this.spt) * 2 : 0);
		var ty: number = this.y + this.speedy;

		if (this.type == 0) {
			if (this.autoRotation) {
				var angle: number = -(Math.atan2(tx - this.x, ty - this.y) * 180) / Math.PI + 90;
				this.rotation = angle;
			}

			this.x = tx;
			this.y = ty;

			if (this.down) {
				if (this.y >= this.targety) {
					this.isDeath = true;

					return;
				}
			}
			else {
				if (this.y <= this.targety) {
					this.isDeath = true;

					return;
				}
			}
		}
		else {
			this.scaleX += 0.2;
			this.scaleY += 0.2;

			if (this.scaleX >= 1) {
				this.isDeath = true;

				return;
			}
		}
		let stage = egret.MainContext.instance.stage;
		let map = ViewManager.gamescene.map;
		this.isDeath = (this.x <= -map.x - stage.stageWidth || this.y <= -map.y - stage.stageHeight || this.x >= -map.x + stage.stageWidth + 50 || this.y >= -map.y + stage.stageHeight + 50);
		// this.isDeath = false;
	}

}