/**
 * 锻造格子转圈
 */
class CircleRunView extends BaseView {

	/** 强化 */
	public static BOOST: number = 0;
	/** 宝石 */
	public static GEM: number = 1;
	/** 注灵 */
	public static ZHU_LING: number = 2;

	public static EQUIP_COUNT:number = 8;

	/** 强化 */
	private boostView: CircleRunBoostView;
	/** 宝石 */
	private gemView:CircleRunGemView;
	/** 注灵 */
	private zhulingView:CircleRunZhulingView;

	private _curRole: number;
	private _type: number;

	public constructor() {
		super();

		this.boostView = new CircleRunBoostView;
		this.addChild(this.boostView);
		this.gemView = new CircleRunGemView;
		this.addChild(this.gemView);
		this.zhulingView = new CircleRunZhulingView;
		this.addChild(this.zhulingView);
	}

	public get type(): number {
		return this._type;
	}

	public setCurRole(value:number): void {
		this._curRole = value;
		this.boostView.curRole = value;
		this.gemView.curRole = value;
		this.zhulingView.curRole = value;
	}
	public getCurRole():number{
		return this._curRole;
	}

	//格子显示数字类型  0强化 1宝石 2注灵 3突破
	public set type(value: number) {
		this._type = value;
		this.boostView.visible = false;
		this.gemView.visible = false;
		this.zhulingView.visible = false;
		switch (this._type) {
			case 0:
				this.boostView.visible = true;
				this.boostView.type = value;
				break;
			case 1:
				this.gemView.visible = true;
				this.gemView.type = value;
				break;
			case 2:
				this.zhulingView.visible = true;
				this.zhulingView.type = value;
				break;
			case 3:
				break;

		}

		this.setValue();
	}

	/**
	 * 格子显示数值
	 */
	public setValue(): void {
		switch (this._type) {
			case 0:
				this.boostView.setValue();
				break;
			case 1:
				this.gemView.setValue();
				break;
			case 2:
				this.zhulingView.setValue();
				break;
			case 3:
				break;
		}
	}

	public turnItem(pos: number): void {
		switch (this._type) {
			case 0:
				this.boostView.turnItem(pos);
				break;
			case 1:
				this.gemView.turnItem(pos);
				break;
			case 2:
				this.zhulingView.turnItem(pos);
				break;
			case 3:
				break;
		}
	}
}
