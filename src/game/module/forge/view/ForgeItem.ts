/**
 * 锻造格子
 */
class ForgeItem extends BaseComponent {

	private item: eui.Image;
	private itemName: eui.Image;
	private select: eui.Image;
	private labelBg: eui.Image;

	private boost: eui.Label;
	private gem: eui.Label;
	private zhuling: eui.Label;
	private tupo: eui.Label;

	private _type: number;
	private _source: string;
	private _sourceName: string;

	private selectEff: MovieClip;

	constructor() {
		super();
		//   this.skinName = "ForgeItemSkin";
	}

	public childrenCreated(): void {
	}

	public getSource(): string {
		return this._source;
	}
	public getSourceName(): string {
		return this._sourceName;
	}
	public setSource(value: string) {
		if (this._source == value)
			return;
		this._source = value;
		this.item.source = this._source;
	}
	public setSourceName(value: string) {
		if (this._sourceName == value)
			return;
		this._sourceName = value;
		this.item.source = this._sourceName;
	}

	public isSelect(value: boolean): boolean {
		this.select.visible = value;
		return value;
	}

	/**
	 * 是否显示选中特效
	 * @param  {boolean} value
	 * @returns boolean
	 */
	public isSelectEff(value: boolean): boolean {
		if (!this.parent) return;
		if (!this.selectEff) {
			this.selectEff = new MovieClip();
			this.selectEff.x = 40;
			this.selectEff.y = 38;
			this.selectEff.playFile(RES_DIR_EFF + "zhuling", -1);
		}
		if (!this.selectEff.parent && value) this.addChildAt(this.selectEff, 2);
		value ? this.selectEff.play(-1) : this.selectEff.stop();
		this.selectEff.visible = value;
		return value;
	}

	public setValue(num: number): void {
		switch (this._type) {
			case 0:
				this.boost.text = "+" + num;
				break;
			case 1:
				this.gem.text = "+" + num;
				break;
			case 2:
				this.zhuling.text = "+" + num;
				break;
			case 3:
				this.tupo.text = num + "星";
				break;
		}
	}

	public getType(): number {
		return this._type;
	}
	public setType(value: number) {
		if (this._type == value)
			return;
		this._type = value;
		switch (this._type) {
			case 0:
				this.boost.visible = true;
				this.itemName.visible = true;
				this.gem.visible = false;
				this.zhuling.visible = false;
				this.tupo.visible = false;
				this.isSelect(false);
				this.labelBg.visible = false;
				break;
			case 1:
				this.boost.visible = false;
				this.itemName.visible = false;
				this.gem.visible = true;
				this.zhuling.visible = false;
				this.tupo.visible = false;
				this.labelBg.visible = true;
				break;
			case 2:
				this.boost.visible = false;
				this.itemName.visible = false;
				this.gem.visible = false;
				this.zhuling.visible = true;
				this.tupo.visible = false;
				this.labelBg.visible = true;
				break;
			case 3:
				this.boost.visible = false;
				this.itemName.visible = false;
				this.gem.visible = false;
				this.zhuling.visible = false;
				this.tupo.visible = true;
				this.labelBg.visible = true;
				break;
		}
	}

}
