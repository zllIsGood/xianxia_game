/**
 *
 * @author
 *
 */
class StarList1 extends BaseView {

	private list: StarItem[];
	private starList: number[];

	private _statListLength: number;
	private _starNum: number;

	private mc: MovieClip;

	public constructor(listLength: number = 10, starNum: number = 0, spacing: number = -40, isShowNum: number = 1) {
		super();

		this._statListLength = listLength;
		this._starNum = starNum;

		this.list = [];

		for (let i: number = 0; i < this._statListLength; i++) {
			let starItem: StarItem = new StarItem;
			starItem.x = i * spacing - 10;
			this.addChild(starItem);
			if (i <= this._starNum - 1)
				starItem.isShow(1);
			starItem.isShowFull(isShowNum);
			this.list.push(starItem);
		}

		this.mc = new MovieClip();
		this.mc.scaleX = 1.5;
		this.mc.scaleY = 1.5;
	}

	public setStarNum(num: number, show: number = 0): void {
		if (this._starNum == num) return;
		this._starNum = num;

		for (let i: number = 0; i < this._statListLength; i++) {
			if (i <= this._starNum - 1) {
				this.list[i].isShow(1);
				if (show == 1 && i == this._starNum - 1) {
					this.mc.x = this.list[i].x + 24;
					this.mc.y = this.list[i].y + 28;
					if (!this.mc.parent) {
						this.addChild(this.mc);
					}
					this.mc.playFile(RES_DIR_EFF + "minusstar", 1);
				}
			} else {
				this.list[i].isShow(0);
			}
		}
	}

	public get starNum(): number {
		return this._starNum;
	}

	public get listLength(): number {
		return this._statListLength;
	}

	public setlistLength(listLength: number = 10, starNum: number = 0, spacing: number = 50, isShowNum: number = 1) {
		for (let i: number = this._statListLength; i < listLength; i++) {
			let starItem: StarItem = new StarItem;
			starItem.x = i * spacing + 10;
			this.addChild(starItem);
			if (i <= starNum - 1)
				starItem.isShow(1);
			starItem.isShowFull(isShowNum);
			this.list.push(starItem);
		}
		this._statListLength = listLength;
	}
}
