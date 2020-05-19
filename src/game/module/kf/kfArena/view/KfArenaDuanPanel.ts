/**
 * 跨服竞技场段位
 */
class KfArenaDuanPanel extends BaseEuiView {
	private list: eui.List;
	private listArray: eui.ArrayCollection;
	private dw: eui.Label;
	private rewardList: eui.List;
	private degree: eui.Label;

	constructor() {
		super();
		this.name = `段位`;
	}

	protected childrenCreated() {
		this.initUI();
	}

	public initUI(): void {
		super.initUI();
		this.listArray = new eui.ArrayCollection();
		this.list.itemRenderer = KfArenaDuanItemRender;
		this.rewardList.touchChildren = false;
		this.list.dataProvider = this.listArray;
		this.rewardList.itemRenderer = ItemBaseNoName;
		this.degree.textFlow = new egret.HtmlTextParser().parser(`<u>${this.degree.text}</u>`);
	}

	public open(): void {
		this.addTouchEvent(this.rewardList, this.onTouch);
		this.addTouchEvent(this.degree, this.onTouch);
		this.observe(KfArenaRedPoint.ins().postRedPoint_2, this.update);
		this.update();
	}

	private update(): void {
		let data: RewardData[] = KfArenaSys.ins().getDuanAwards()
		for (let i in data) {
			data[i].isRedPoint = KfArenaRedPoint.ins().joinState;
		}
		let arrTem = CommonUtils.objectToArray(GlobalConfig.CrossArenaRankAward);
		let tem = (CommonUtils.objectToArray(GlobalConfig.CrossArenaMetalAward));
		tem.sort(this.sort);
		for (let i of tem)
			arrTem.push(i);
		this.listArray.source = arrTem;
		this.rewardList.dataProvider = new eui.ArrayCollection(data);
		this.dw.text = KfArenaSys.ins().getDuanName();
	}

	protected onTouch(e: egret.Event): void {
		switch (e.target) {
			case this.rewardList:
				KfArenaSys.ins().sendDailyRewards();
				break;
			case this.degree:
				ViewManager.ins().open(DegreeTpisWin, GlobalConfig.CrossArenaBase.degreeTpis);
				break;
		}

	}

	/**
	 * 排序
	 */
	public sort(a: any, b: any): number {
		return Algorithm.sortDesc(a.metal, b.metal);
	}
}
