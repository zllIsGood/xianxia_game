/**
 * 跨服竞技场参与
 */
class KfArenaJoinPanel extends BaseEuiView {
	private myRecord: eui.Label;
	private list: eui.List;
	private listArray: eui.ArrayCollection;

	constructor() {
		super();
		this.name = `达标`;
	}

	protected childrenCreated() {
		this.initUI();
	}

	public initUI(): void {
		super.initUI();
		this.listArray = new eui.ArrayCollection();
		this.list.itemRenderer = KfArenaJoinItemRender;
		this.list.dataProvider = this.listArray;
	}

	public open(): void {
		this.observe(KfArenaSys.ins().postJoinRewards, this.update);
		this.update();
	}

	private update(): void {
		let peakAwards: KfArenaPeakAwards[] = GlobalConfig.CrossArenaBase.peakAwards;
		let tem: KfArenaPeakAwards[] = [];
		let index: number = 1;
		for (let i in peakAwards) {
			peakAwards[i].id = index;
			peakAwards[i].sortIndex = 1;
			if (((KfArenaSys.ins().dflState >> index) & 1) == 1) {
				//已领
				peakAwards[i].sortIndex = 0;
			} else {
				if (KfArenaRedPoint.ins().JoinRedPoint.length > 0 && KfArenaRedPoint.ins().JoinRedPoint[index] > 0) {
					peakAwards[i].sortIndex = 2;
				}
			}
			tem.push(peakAwards[i]);
			index++;
		}
		tem.sort(this.sort);
		this.listArray.source = tem;
		this.myRecord.text = KfArenaSys.ins().dflCount;
	}

	/**
	 * 排序
	 */
	public sort(a: any, b: any): number {
		let index = Algorithm.sortDesc(a.sortIndex, b.sortIndex);
		if (index == 0) {
			index = Algorithm.sortAsc(a.id, b.id);
		}
		return index;
	}


}
