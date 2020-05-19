/**阶段升星控件dwl */
class StageStarView extends BaseView {
	public greyGrp: eui.Group;
	public lightGrp: eui.Group;
	private len: number = 0;
	/**间距 */
	private spacing: number = null;
	private type: number = StageStarEnum.Awaken;
	/**列数（同时设置行数和列数只会生效一个） */
	private columnCount: number = null;
	/**行数（同时设置行数和列数只会生效一个） */
	private rowCount: number = null;
	/**是否显示灰色底图 */
	private isShowGrey: boolean = true;
	/**星星是否弧形排列(否则横向排列)*/
	private isCurve: boolean = true;

	public constructor(len: number, spacing: number = null, type: number = StageStarEnum.Awaken, columnCount: number = null, rowCount: number = null, isShowGrey: boolean = true, isCurve: boolean = true) {
		super();
		this.skinName = 'StageStarViewSkin';
		this.create(len, spacing, type, columnCount, rowCount, isShowGrey, isCurve);
	}

	private flag = false;

	public create(len: number, spacing: number = null, type: number = StageStarEnum.Awaken, columnCount: number = null, rowCount: number = null, isShowGrey: boolean = true, isCurve: boolean = true) {
		this.len = len;
		this.spacing = spacing;
		this.type = type;
		this.columnCount = columnCount;
		this.rowCount = rowCount;
		this.isShowGrey = isShowGrey;
		this.flag = true;
		this.isCurve = isCurve;

		if( !this.isCurve ) {
			this.greyGrp.layout = new eui.TileLayout();
			this.lightGrp.layout = new eui.TileLayout();
		}
		
		if (!this.isInit) return;
		this.render();
	}

	private isInit = false;
	private greys: eui.Image[] = [];
	private lights: eui.Image[] = [];

	protected childrenCreated() {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.isInit = true;
		if (!this.flag) return;
		this.render();
	}

	private render() {
		this.greyGrp.removeChildren();
		this.lightGrp.removeChildren();
		this.greys.length = 0;
		this.lights.length = 0;
		let greyRes = this.getSource(0);
		let lightRes = this.getSource(1);
		for (let i = 0; i < this.len; i++) {
			if (this.isShowGrey) {
				let grey = new eui.Image(greyRes);
				this.greyGrp.addChild(grey);
				this.greys.push(grey);
			}
			let light = new eui.Image(lightRes);
			this.lightGrp.addChild(light);
			this.lights.push(light);
			light.visible = false;
		}
		if( this.isCurve ) {
			if( this.len > 0 ) {
				this.starPostion();
			}
		} else {
			this.lightGrp.addEventListener(egret.Event.RENDER, () => {this.layout();}, this);
		}
	}

	/**
	 * 0未激活
	 * 1已激活
	 * @param  {number} state
	 * @returns string
	 */
	private getSource(state: number): string {
		switch (this.type) {
			case StageStarEnum.Awaken:
				return state == 0 ? 'shenlian_point_dark' : 'shenlian_point_bright';
		}
		return '';
	}

	public update(num: number) {

		for (let i = 0; i < this.lights.length; i++) {
			this.lights[i].visible = num > i;
			if (this.isShowGrey) {
				this.greys[i].visible = !this.lights[i].visible;
			}
		}
	}

	private layout() {
		console.log(this.greys[0].x);
		//约束宽高，即可自动按行或者列排序显示
		let totalWidth = 0;
		let totalHeight = 0;
		let w = this.lights[0].width;
		let h = this.lights[0].height;
		let spacing = this.spacing != null ? this.spacing : 6;
		//遵循Group设定，如果同时设置行数和列数，则只生效一个设置
		if (this.columnCount != null || this.rowCount != null) {
			if (this.columnCount != null) {
				let row = Math.ceil(this.len / this.columnCount);
				totalWidth = w * this.columnCount + spacing * (this.columnCount - 1);
				totalHeight = h * row + (row - 1) * spacing;
			} else if (this.rowCount != null) {
				let column = Math.ceil(this.len / this.rowCount)
				totalWidth = w * column + spacing * (column - 1);
				totalHeight = h * this.rowCount + (this.rowCount - 1) * spacing;
			}
		} else {
			totalWidth = w * this.len + (this.len - 1) * spacing;
			totalHeight = h;
		}
		this.greyGrp.width = this.lightGrp.width = totalWidth;
		this.greyGrp.height = this.lightGrp.height = totalHeight;
		let greyLayout = <eui.TileLayout>this.greyGrp.layout;
		let lightLayout = <eui.TileLayout>this.lightGrp.layout;
		greyLayout.horizontalGap = lightLayout.horizontalGap = spacing;
		greyLayout.verticalGap = lightLayout.verticalGap = spacing;

	}

	private starPostion() {
		let postion = [
			[142, 450],
			[92, 415], 
			[56, 370],
			[32, 315],
			[25, 260],
			[32, 205],
			[56, 150],
			[92, 105],
			[142, 70],
			[205, 50],
			[265, 50],
			[328, 70],
			[378, 105],
			[414, 150],
			[438, 205],
			[445, 260],
			[438, 315],
			[414, 370],
			[378, 415],
			[328, 450],
		];
		for (let i = 0; i < this.greys.length; i++) {
			this.greys[i].x = postion[i][0];
			this.greys[i].y = postion[i][1];
		}
		for (let i = 0; i < this.lights.length; i++) {
			this.lights[i].x = postion[i][0];
			this.lights[i].y = postion[i][1];
		}
	}
}

enum StageStarEnum {
	Awaken
}