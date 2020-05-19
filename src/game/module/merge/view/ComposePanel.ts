/**
 * Created by hrz on 2018/1/22.
 */

class ComposePanel extends BaseComponent {
	public list: eui.List;
	public list0: eui.List;
	private contentScroller: eui.Scroller;

	private _tabListData: eui.ArrayCollection;
	private _listData: eui.ArrayCollection;

	private _id: number = -1;
	private _index: number = -1;

	constructor() {
		super();
	}

	protected childrenCreated() {
		this.init();
	}

	private init(): void {
		this.list.itemRenderer = ComposeMenuItem;
		this.list0.itemRenderer = SamsaraComposeItem;
		this._listData = new eui.ArrayCollection();
		this.list0.dataProvider = this._listData;

		this._tabListData = new eui.ArrayCollection();
		this.list.dataProvider = this._tabListData;
	}

	public open(...param: any[]): void {
		this.observe(UserBag.ins().postItemAdd, this.buffUpdata);//道具添加
		this.observe(UserBag.ins().postItemDel, this.buffUpdata);//道具
		this.observe(UserBag.ins().postItemChange, this.buffUpdata);//道具

		this.initView();
		this.updateState();
		if (param[0] != undefined && param[1] != undefined && param[2] != undefined)
			this.selectList(param[0], param[1], param[2]);
	}

	private initView() {
		this._tabListData.source = MergeCC.ins().getMergeMenu();//会滚动
	}

	get id() {
		return this._id;
	}

	get index() {
		return this._index;
	}

	/**缓冲数据更新，100毫秒内只处理一次！合成时，会更新很多次，导致掉帧严重 */
	private buffUpdata(): void {
		TimerManager.ins().remove(this.updateState, this);
		TimerManager.ins().doTimer(100, 1, this.updateState, this);
	}

	public updateState(): void {
		if (this._tabListData.length == 0) return;
		for (let i = 0; i < this._tabListData.length; i++) {
			this._tabListData.itemUpdated(this._tabListData.getItemAt(i));
		}

		let id: number = this._id;
		let index: number = this._index;
		let targetId = 0;
		if (this._id == -1 || this._index == -1) {
			for (let i = 0; i < this._tabListData.length; i++) {
				id = this._tabListData.getItemAt(i).id;
				let arr = MergeCC.ins().getMergeSecMenu(id);
				for (let j = 0; j < arr.length; j++) {
					targetId = MergeCC.ins().getCanMergeTargetId(arr[j].id, arr[j].index);
					if (targetId) {
						index = arr[j].index;
						break;
					}
				}
				if (targetId) break;
			}

			if (!targetId) {
				id = this._tabListData.getItemAt(0).id;
				let arr = MergeCC.ins().getMergeSecMenu(id);
				index = arr[0].index;
			}
		} else {
			targetId = MergeCC.ins().getCanMergeTargetId(id, index);
		}

		this.updateView(id, index, targetId);
	}

	public updateView(id: number, index: number, targetId: number = 0): void {
		let isRefush: boolean = this._id != id || this._index != index;
		this._id = id;
		this._index = index;
		let data = MergeCC.ins().getListData(id, index);
		this._listData.replaceAll(data.concat());
		this.refushBarList(targetId, isRefush);
	}

	private refushBarList(targetId: number, isRefush: boolean = true): void {
		if (isRefush) this.contentScroller.viewport.scrollV = 0;//默认顶部
		if (!targetId || !isRefush) return;

		let data = this.list0.dataProvider;
		for (let i = 0; i < data.length; i++) {
			if (targetId == data.getItemAt(i).id) {
				this.contentScroller.viewport.validateNow();
				let sh = i * 101;
				if (sh > this.contentScroller.viewport.contentHeight - this.contentScroller.viewport.height) {
					sh = this.contentScroller.viewport.contentHeight - this.contentScroller.height;
				}
				if (sh < 0) sh = 0;
				this.contentScroller.viewport.scrollV = sh;
				break;
			}
		}
	}

	public unSelectList(): void {
		let count = this.list.dataProvider.length;
		for (let i = 0; i < count; i++) {
			let item = this.list.getVirtualElementAt(i) as ComposeMenuItem;
			let tempList = item.list;
			for (let j = 0; j < tempList.dataProvider.length; j++) {
				let tempItem = tempList.getVirtualElementAt(j) as ComposeSecMenuItem;
				if (tempItem) tempItem.setSelect(false);
			}
		}
	}

	public selectList(type: number, secondIndex, index: number): void {
		let tabIndex: number = 0;
		let id: number;
		for (let i = 0; i < this._tabListData.length; i++) {
			let typeTem = this._tabListData.getItemAt(i).type;
			if (type == typeTem) {
				tabIndex = i;
				id = this._tabListData.getItemAt(i).id
				break;
			}
		}
		let item = this.list.getVirtualElementAt(tabIndex) as ComposeMenuItem;
		let tempList = item.list;
		let tempItem = tempList.getVirtualElementAt(secondIndex - 1) as ComposeSecMenuItem;
		if (tempItem) tempItem.setSelect(true);
		this.updateView(id, secondIndex, tempItem.data.id);
	}

	close() {

		this._id = -1;
		this._index = -1;
	}
}