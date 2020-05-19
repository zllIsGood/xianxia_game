/** 
 * 关卡boss头像
 */
class GuanqiaBossHead extends BaseComponent {

	/** boss头像 */
	public imgHead: eui.Image;
	/** 头像边框 - 小 */
	public imgFrameLittle: eui.Image;
	/** 头像边框 - 大 */
	public imgFrameBig: eui.Image;
	/** 选中 */
	public imgSelect: eui.Image;

	/** 是否选中状态 */
	private _isSelect: boolean;
	/** 是否为大头像框 true：大	false：小  */
	private _isFrameBig: boolean;

	public constructor() {
		super();
		// this.skinName = "GuanqiaBossHeadSkin";
	}

	public childrenCreated(): void{
		this.init();
	}

	protected init(): void {

		this._isSelect = false;
		this._isFrameBig = false;
		this.imgSelect.visible = false;
		this.imgFrameBig.visible = false;
		this.imgFrameLittle.visible = true;
	}

	/** 设置boss头像 */
	public setHeadSource(str: string): void {
		this.imgHead.source = str;
	}

	/** 设置头像灰化 */
	public setGray(value: boolean): void {
		let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
		this.imgHead.filters = value ? [new egret.ColorMatrixFilter(colorMatrix)] : [];
	}

	/** 设置大头像框 true：大	false：小 */
	public setFrameBig(value: boolean): void {
		if (value == this._isFrameBig) return;
		this._isFrameBig = value;
		this.imgFrameBig.visible = value;
		this.imgFrameLittle.visible = !value;
	}
	/** 是否为大头像框 true：大	false：小  */
	public getFrameBig(): boolean {
		return this._isFrameBig;
	}

	/** 设置选中 */
	public setSelect(value: boolean): void {
		if (value == this._isSelect) return;
		this.imgSelect.visible = value;
		this._isSelect = value;
	}
	/** 获取选中状态 */
	public getSelect(): boolean {
		return this._isSelect;
	}

}