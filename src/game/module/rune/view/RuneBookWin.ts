/**
 * 符文总览窗体
 */
class RuneBookWin extends BaseEuiView {
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public nuneList: eui.List;
	private dataCollection: eui.ArrayCollection = null;
	private title:BaseComponent;

	public constructor() {
		super();

		this.skinName = "RuneOverViewSkin";
		this.isTopLevel = true;

		// this.setSkinPart("title",new RoleSelectPanel());
	}

	public initUI(): void {
		this.nuneList.itemRenderer = RuneBookItemRenderer;
		super.initUI();
	}

	public open(...param: any[]): void {
		//添加侦听
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.nuneList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
		this.showList();
	}

	public close(...param: any[]): void {
		this.cleanList();
		this.nuneList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
	}

	/**
	 * 点击处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			switch (e.currentTarget) {
				case this.closeBtn:
				case this.closeBtn0:
					ViewManager.ins().close(RuneBookWin);
					break;
			}
		}
	}

	/**
	 * 列表点击处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onListTap(e: eui.ItemTapEvent): void {
		let rbc: RuneBookItemData = e.item as RuneBookItemData;
		if (rbc && rbc.data) {
			let target = e.item;
			let depth = 6;
			while (depth > 0 && target) {
				if (target.getItemConfig) {
					let itemConfig = target.getItemConfig();
					ViewManager.ins().open(RuneBookItemTipsWin,rbc.data,itemConfig);
					break;
				}
				target = target.parent;
				depth -= 1;
			}
			// ViewManager.ins().open(RuneBookItemTipsWin, rbc);
		}
	}

	/**
	 * 显示列表
	 * @returns void
	 */
	private showList(): void {

		if (!this.dataCollection) {
			let arr = [];
			arr.push(new RuneBookItemData(null,`默认解锁`));

			let data: RuneConverConfig[] = RuneConfigMgr.ins().getExchangeDataList();
			for (let i in data) {
				arr.push(new RuneBookItemData(data[i]));
			}

			this.dataCollection = new eui.ArrayCollection(arr);
		}
		this.nuneList.dataProvider = this.dataCollection;
	}

	/**
	 * 清理链表
	 * @returns void
	 */
	private cleanList(): void {
		if (this.dataCollection) {
			this.dataCollection = null;
		}
		this.nuneList.dataProvider = null;
	}
}

ViewManager.ins().reg(RuneBookWin, LayerManager.UI_Main);