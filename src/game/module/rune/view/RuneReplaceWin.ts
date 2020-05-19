/**
 * 符文替换弹窗
 */
class RuneReplaceWin extends BaseEuiView {
	// public colorCanvas: eui.Image;
	public scroll: eui.Scroller;
	public list: eui.List;
	public myItem: RuneReplaceItemRenderer;

	/**位置索引 */
	public posIndex: number = 0;
	/**角色索引 */
	public roleIndex: number = 0;
	private runeTypeList: number[];
	//当前选中部位的符文数据
	private item: ItemData = null;
	private itemGroup: eui.Group;

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "RuneEquipChangeSkin";
		this.isTopLevel = true;
		this.list.itemRenderer = RuneReplaceItemRenderer;
		this.myItem = new RuneReplaceItemRenderer();
		this.itemGroup.addChild(this.myItem);
	}

	public open(...param: any[]): void {
		//获取位置索引
		this.posIndex = isNaN(param[0]) ? 0 : param[0];

		//获取角色索引
		this.roleIndex = isNaN(param[1]) ? 0 : param[1];

		//获取选中的符文数据
		this.item = param[2];
		this.runeTypeList = param[3];

		RuneDataMgr.ins().posIsWear = this.item;

		this.myItem.data = new RuneReplaceItemData(this.item);
		this.myItem.setBtnStatu();


		//添加侦听
		this.addTouchEvent(this.list, this.onListTap);
		this.observe(Rune.ins().postInlayResult, this.onInlayResult);

		//更新列表
		this.updateList();
	}

	public close(...param: any[]): void {
		MessageCenter.ins().removeAll(this);
		this.list.dataProvider = null;
	}

	/**
	 * 列表处理
	 * @param  {egret.Event} e
	 * @returns void
	 */
	private onListTap(e: egret.Event): void {
		if (e.target.name != "changeBtn") {
			if (e.target.name == "getBtn") {
				// ViewManager.ins().close(RoleWin);
				// ViewManager.ins().close(RuneWin);
				// ViewManager.ins().close(RuneReplaceWin);
				ViewManager.ins().open(FbWin, 2);
			}
			return;
		}
		//获取点击项数据
		let item: ItemData = null;
		let rData = this.list.selectedItem as RuneReplaceItemData;
		if (rData) item = rData.data;

		//是否镶嵌有相同的符文
		let flag: boolean = false;
		//数据处理
		if (item && item instanceof ItemData) {
			//检测
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[item.configID];
			let selectedRuneData: ItemData = RuneDataMgr.ins().getRune(this.roleIndex, this.posIndex);
			if (selectedRuneData) {
				let selectedRuneCfg: RuneBaseConfig = null;
				if (selectedRuneData.configID > 0)
					selectedRuneCfg = RuneConfigMgr.ins().getBaseCfg(selectedRuneData);
				if (selectedRuneCfg && selectedRuneData.itemConfig &&
					ItemConfig.getSubType(itemCfg) == ItemConfig.getSubType(selectedRuneData.itemConfig)) {
					//同类型可替换
					//...预留品质判断
				}
				else {
					//不同类型/空孔
					let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(this.roleIndex);
					if (rdList) {
						let tempCfg: ItemConfig = null;
						for (let v of rdList) {
							if (v && v.itemConfig && v.itemConfig.id > 0) {
								tempCfg = GlobalConfig.ItemConfig[v.configID];
								if (tempCfg && ItemConfig.getSubType(tempCfg) == ItemConfig.getSubType(itemCfg)) {
									flag = true;
									break;
								}
							}
						}
					}
				}
			}
			if (flag) {
				UserTips.ins().showTips(`每个角色同种属性的符文只能镶嵌一个`);
				return;
			}

			//发送协议
			Rune.ins().sendInlay(this.roleIndex, this.posIndex, item.handle);
		}
	}

	/**
	 * 更新列表显示
	 * @returns void
	 */
	private updateList(): void {
		let itemDataList: ItemData[] = UserBag.ins().getItemByType(6);
		if (itemDataList) {
			//数据
			// let datas: ItemData[] = [];
			let arr1: ItemData[] = []; //可替换的
			let arr2: ItemData[] = []; //不可替换的
			let curType = this.item && this.item.itemConfig ? ItemConfig.getSubType(this.item.itemConfig) : -1;
			for (let v of itemDataList) {
				if (v && RuneConfigMgr.ins().getBaseCfg(v)) {
					let type = ItemConfig.getSubType(v.itemConfig);
					if (curType == type || this.runeTypeList.indexOf(type) < 0) {
						if (curType > -1 && this.item.configID == v.configID) {
							//同样的印记不放到里面去
						} else {
							arr1.push(v);
						}
					} else {
						arr2.push(v);
					}
				}
			}
			//排序
			arr1.sort(this.sortRunes);
			arr2.sort(this.sortRunes);

			let arr = [].concat(arr1, arr2);
			let tempItem = new ItemData();
			arr.push(tempItem);

			let datas = [];
			for (let i = 0; i < arr.length; i++) {
				let data = new RuneReplaceItemData(arr[i]);
				data.canEquip = false;
				if (i < arr1.length) {
					data.canEquip = true;
				}
				datas.push(data);
			}
			this.list.dataProvider = new eui.ArrayCollection(datas);
		}
	}

	private sortRunes(a: ItemData, b: ItemData): number {
		let aq = ItemConfig.getQuality(a.itemConfig);
		let bq = ItemConfig.getQuality(b.itemConfig);
		if (aq > bq) return -1;
		if (aq < bq) return 1;

		let arbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(a);
		let brbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(b);
		if (arbc && brbc) {
			let lvlA = arbc.id % 100;
			let lvlB = brbc.id % 100;
			if (lvlA > lvlB) {
				return -1;
			} else if (lvlA < lvlB) {
				return 1;
			}
		}

		return a.configID - b.configID;
	}

	/**
	 * 处理镶嵌结果
	 * @param  {any[]} param
	 * @returns void
	 */
	private onInlayResult(param: any[]): void {
		//替换符文
		if (param[0]) {
			ViewManager.ins().close(RuneReplaceWin);
		}
	}
}

ViewManager.ins().reg(RuneReplaceWin, LayerManager.UI_Main);