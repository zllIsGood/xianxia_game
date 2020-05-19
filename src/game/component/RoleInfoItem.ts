/**
 *
 * @author
 *
 */
class RoleInfoItem extends BaseView {
	// private iconDisplay: eui.Image;
	private lvTxt: eui.Label;
	private labelDisplay: eui.Label;
	private redPoint: eui.Image;
	private bgImg: eui.Image;
	private _imgSource: string;
	private _lv: number;
	private _nameTxt: string;

	private iconMc: MovieClip;
	constructor() {
		super();
		this.skinName = "RoleInfoItemSkin";

		this.iconMc = new MovieClip();
		this.iconMc.x = 45;
		this.iconMc.y = 40;
		this.iconMc.scaleX = this.iconMc.scaleY = 0.4;
	}

	public getImgSource(): string {
		return this._imgSource;
	}

	public setImgSource(value: number, isAct: number) {
		let effSoure: string = value ? `hushen` : `mabi`;
		this.iconMc.playFile(RES_DIR_EFF + effSoure, -1);
		if (this.iconMc && !this.iconMc.parent) this.addChild(this.iconMc);
		let filter = isAct ? [] : FilterUtil.ARRAY_GRAY_FILTER;
		this.iconMc.filters = filter;
	}

	public getLv(): number {
		return this._lv;
	}

	public setLv(value: number) {
		if (this._lv != value) {
			this._lv = value;
			if (this._lv == 0)
				this.lvTxt.text = "";
			else
				this.lvTxt.text = "+" + this._lv;
		}
	}

	public getNameTxt(): string {
		return this.labelDisplay.text;
	}

	public setNameTxt(value: string) {
		if (this._imgSource != value) {
			// if (value == "") {
			// this.labelDisplay.textColor = 0x8e8e8e;
			// this.labelDisplay.text = "未激活";
			// } else {
			// this.labelDisplay.textColor = 0xFECA2D;
			// this.labelDisplay.text = value;
			// }
			this.labelDisplay.text = value;
		}
	}

	public setBgValue(value: string) {
		this.bgImg.source = value;
	}

	public getRedPointVisibel(): boolean {
		return this.redPoint.visible;
	}

	public setRedPointVisibel(value: boolean) {
		this.redPoint.visible = value;
	}

	public destory():void
	{
		this.iconMc.filters = null;
		DisplayUtils.removeFromParent(this.iconMc);
		this.iconMc.filters = null;
	}
}
