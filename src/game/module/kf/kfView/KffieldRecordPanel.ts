/**
 * Created by MPeter on 2018/1/18.
 * 跨服战场-跨服战场掉落记录
 */
class KffieldRecordPanel extends BaseView {
	public listScroller: eui.Scroller;
	public list: eui.List;

	private listDt: eui.ArrayCollection;

	public constructor() {
		super();

	}

	protected childrenCreated(): void {
		this.init();
	}

	private init() {
		this.listDt = new eui.ArrayCollection();
		this.list.itemRenderer = KffieldRecordItemReder;
		this.list.dataProvider = this.listDt;
	}

	public open(): void {
		this.observe(KFBossSys.ins().postDropList, this.upList);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);

		this.upList();
		KFBossSys.ins().sendDropList();
	}


	/**查看其他玩家 */
	private openOtherPlayerView(otherPlayerData: OtherPlayerData): void {
		let win = <RRoleWin>ViewManager.ins().open(RRoleWin, otherPlayerData);
		win.hideEx(2);
	}

	private upList(): void {
		let list: KFDropRecordData[] = KFBossSys.ins().dropBestRecordDataList;
		list = list.concat(KFBossSys.ins().dropRecordDataList);
		// bestList.sort(this.compareFn);

		// bestList = bestList.concat(list);
		this.listDt.replaceAll(list);
		//DisplayUtils.scrollerToBottom(this.listScroller);
	}

	// /**排序*/
	// private compareFn(a: KFDropRecordData, b: KFDropRecordData): number {
	// 	if (a.time > b.time)return 1;
	// 	else if (a.time < b.time)return -1;
	// 	return 0;
	// }

}