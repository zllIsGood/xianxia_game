/**特效经验条组件 */
class ProgressBarEff extends BaseComponent {
	public constructor() {
		super();
	}

	/**是否播放提升特效 */
	private isPlayMc: boolean = true;
	/**尾巴特效 */
	private xianmc: MovieClip = new MovieClip();
	/**背景框特效 */
	private bordermc: MovieClip = new MovieClip();

	private static DEFAULT_MC_WIDTH: number = 453;

	public thumb: MovieClip;
	public labelDisplay: eui.Label;

	public _direction: eui.Direction = eui.Direction.LTR

	private $value: number = 0;
	public getValue(): number {
		return this.$value;
	}
	public setValue(v: number) {
		if (v == this.$value) return;
		let lastValue = this.$value;
		this.$value = v;
		this.updateDisplay(lastValue, v, this.$maximum);
	}

	private $maximum: number = 0;
	public getMaximum(): number {
		return this.$maximum;
	}
	public setMaximum(v: number) {
		if (v == this.$maximum) return;
		// let lastMax = this.$maximum || v;
		this.$maximum = v;
		this.updateDisplay(this.$value, this.$value, v);
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init(): void {
		this.touchEnabled = this.touchChildren = false;


		this.thumb = new MovieClip();
		this.thumb.playFile(RES_DIR_EFF + "jindutiaoeff", -1);
		this.thumb.y = -4;
		this.addChildAt(this.thumb, 1);

		this.xianmc.playFile(RES_DIR_EFF + "jindutiaotoueff", -1);
		this.xianmc.x = 0;
		this.xianmc.y = this.height / 2 - 20;
		this.addChildAt(this.xianmc, 2);

		if (this.contains(this.labelDisplay))
			this.setChildIndex(this.labelDisplay, 99)

		this.thumb.mask = new egret.Rectangle(-this.width, 0, this.width, this.height + 4);
	}

	private $curValue = 0;
	private $curMax = 0;
	private updateDisplay(lastValue: number, curValue: number, curMax: number, showLabel: boolean = true) {
		egret.Tween.removeTweens(this);
		this.$curValue = lastValue;
		this.$curMax = curMax;
		egret.Tween.get(this, {
			onChange: () => {
				let percent = Math.min(this.$curValue / this.$curMax, 1);
				let thumb = this.thumb;
				if (thumb) {
					let thumbWidth = this.width;
					let clipWidth = Math.round(percent * thumbWidth);
					if (clipWidth < 0 || clipWidth === Infinity)
						clipWidth = 0;
					let rect = thumb.mask;
					let thumbPosX = thumb.x - rect.x;
					let thumbPosY = thumb.y - rect.y;
					switch (this._direction) {
						case eui.Direction.LTR:
							rect.x = clipWidth-thumbWidth;
							break;
					}
					thumb.mask = rect;
					if (this.xianmc) {
						this.xianmc.x = this.width * percent - 23;
					}
				}
				if (showLabel) {
					this.setLbValueText(`${Math.floor(this.$curValue)}/${Math.floor(this.$curMax)}`);
				} else {
					this.setLbValueText("");
				}
			}, onChangeObj: this
		}).to(
			{ $curValue: curValue }, 500
			)
	}


	public setLbValueText(text) {
		if (this.labelDisplay) {
			this.labelDisplay.visible = true;
			this.labelDisplay.text = text;
		}
	}

	public reset() {
		this.$maximum = this.$value = 0;
	}

	public setData(value: number, max: number) {
		this.setValue(value);
		this.setMaximum(max);
	}

	public setMax() {
		this.updateDisplay(1, 1, 1, false)
		// this.setLbValueText("");
	}
}