/**
 * 道具数量按钮（红点显示数量）
 */
class ItemNumberButton extends eui.Button {
	public selectIcon: eui.Image;
	public iconDisplay: eui.Image;
	public redPoint: eui.Group;
	public txt: eui.Label;
	public group_Notice: eui.Group;
	public label_Notice: eui.Label;

	private _eff: MovieClip;
	private _num: number = 0;
	private _itemID: number;
	private _itemData: ItemData;
	private _showNum: boolean;

	public constructor(itemID?: number, showNum: boolean = true) {
		super();
		this.skinName = `Btn32Skin`;
		this._showNum = this.txt.visible = showNum;

		if (itemID != undefined)
			this.setItemID(itemID)
		else
			this.update();
	}

	/**
	 * 设置道具ID
	 * @param  {number} id
	 */
	public setItemID(id: number) {
		if (this._itemID != id)
			this._itemID = id;

		this.update();
	}

	/**
	 * 获取数量
	 * @returns number
	 */
	public getNum(): number {
		return this._num;
	}

	/**
	 * 刷新显示
	 * @returns void
	 */
	public update(): void {
		if (this._itemID) {
			this._itemData = UserBag.ins().getBagItemById(this._itemID);
			this._num = Math.min(this._itemData ? this._itemData.count : 0, 99);
		}

		if (this._showNum) this.txt.text = this._num.toString();
		this.redPoint.visible = this._num > 0;
	}

	/**
	 * 播放特效
	 * @returns void
	 */
	public playEff(): void {
		if (!this._eff) {
			this._eff = new MovieClip();
			this._eff.x = 30;
			this._eff.y = 30;
		}

		if (this._eff.isPlaying)
			this._eff.gotoAndPlay(0);
		else
			this._eff.playFile(`${RES_DIR_EFF}litboom`, 1);

		this.addChild(this._eff);
	}
}