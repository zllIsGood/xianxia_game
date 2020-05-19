/**
 *
 * 排行榜查榜tips
 *
 */
class OSARankTipsWin extends BaseEuiView {
	private arr:any;
	private bgClose:eui.Rect;
	private record:eui.List;
	private title:eui.Label;
	private rankType:number;
	constructor() {
		super();
		this.skinName = "OSARankTipsSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.onClick);
		this.arr = param[0];
		this.rankType = param[1];
		this.record.itemRenderer = OSATargetItemRender4;

		this.init();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick)
		this.removeObserve();
	}

	public init(){
		switch (this.rankType){
			case RankDataType.TYPE_BAOSHI://铸总等级造榜
				this.title.text = "开服魔晶榜";
				break;
			case RankDataType.TYPE_LONGHUN://龙印总等级榜
				this.title.text = "开服龙印榜";
				break;
			case RankDataType.TYPE_WING://翅膀总等级榜
				this.title.text = "开服翅膀榜";
				break;
			case RankDataType.TYPE_BOOK://图鉴总战力
				this.title.text = "开服图鉴榜";
				break;
			case RankDataType.TYPE_ZS://转生榜
				this.title.text = "开服转生榜";
				break;
			case RankDataType.TYPE_SCORE://装备评分
				this.title.text = "开服装备榜";
				break;
			case RankDataType.TYPE_HF_XIAOFEI:
				this.title.text = "合服消费榜";
				break;
		}

		this.record.dataProvider = new eui.ArrayCollection(this.arr);
	}
	private onClick(){
		ViewManager.ins().close(this);
	}



}
ViewManager.ins().reg(OSARankTipsWin, LayerManager.UI_Popup);