/**
 * 心法部位分解窗体
 */
class HeartMethodDecomposePanel extends BaseEuiView {
	/** 当前选择的角色 */
	public curRole: number;

	public decomposeBtn: eui.Button;
	public itemList: eui.List;
	public curLab: eui.Label;
	public suipianNow: eui.Label;
	public addLab: eui.Label;
	public cb0: eui.CheckBox;
	public cb1: eui.CheckBox;
	public cb2: eui.CheckBox;
	public cb3: eui.CheckBox;
	// public cb4: eui.CheckBox;

	private suipianIcon: eui.Image;
	private suipianNum: eui.Label;
	private suipianAdd: eui.Label;

	/**选项卡数据链表 */
	private cardList: HeartMethodDecomposeItemData[] = null;
	/**选项卡EUI数据集 */
	private cardCollection: eui.ArrayCollection = null;

	/**复选框数量 */
	private checkBoxNum: number = 4;

	/**列表滚动位置 */
	private itemListScrollV: number = 0;
	private resolveIng: boolean = false;
	private _addNum: number = 0;
	private _chipNum: number = 0;
	private bgClose: eui.Rect;
	private heartId: number;//心法id
	public constructor() {
		super();
		this.skinName = "heartmethodDecomposeSkin";
	}

	protected childrenCreated() {
		this.itemList.itemRenderer = HeartMethodDecomposeItemRenderer;
		this.itemList.useVirtualLayout = true;
	}

	public open(...param: any[]): void {
		//添加侦听
		for (let i: number = 0; i < this.checkBoxNum; i++) {
			if (this["cb" + i]) {
				this.addTouchEvent(this["cb" + i], this.onCBTap);
			}
		}
		this.addTouchEvent(this.decomposeBtn, this.onTap);
		this.addTouchEvent(this.itemList, this.onListTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(HeartMethod.ins().postOneKeyDecompose, this.onDecomposeResult);

		this.heartId = param[0];
		//初始化选项卡链表
		this.initCardList();
		//重置复选框
		this.resetCheckBox();
		//更新数据
		// this.updateList(true);
		this.updateShatter();
		// this.updateAddShatter();
	}

	public close(...param: any[]): void {
		this.cleanCardList();
	}

	/**
	 * 分解结果
	 * @returns void
	 */
	public onDecomposeResult(param: any[]): void {
		if (param[0]) {
			let heardId: number = param[1];
			let len: number = param[2];
			if (len) {
				// let splitItem = GlobalConfig.HeartMethodConfig[heardId].splitItem;
				// let itemConfig:ItemConfig = GlobalConfig.ItemConfig[splitItem];
				// UserTips.ins().showTips(`分解成功，|C:${ItemConfig.getQualityColor(itemConfig)}d&T:${itemConfig.name}x${len}|`);
			}
			// this.playEffect();
			TimerManager.ins().doTimer(500, 1, () => {
				this.initCardList();
				// this.resetCheckBox();
				this.updateShatter();
				// this.updateList(true);
				this.updateAddShatter();
				this.resolveIng = false;
			}, this);

		}
		else {
			UserTips.ins().showTips("分解失败，请稍后再试");
		}
	}

	private playEffect(): void {
		let num: number = this.itemList.numChildren;
		for (let i: number = 0; i < num; i++) {
			let item: HeartMethodDecomposeItemRenderer = this.itemList.getChildAt(i) as HeartMethodDecomposeItemRenderer;
			if (item) {
				item.playEffect();
			}
		}
	}

	/**
	 * 碎片变化
	 * @returns void
	 */
	public onShatterChange(): void {
		this.updateShatter();
	}

	/**
	 * 点击链表处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onListTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			let index: number = this.itemList.selectedIndex;
			if (index < 0) {
				return;
			}
			let itemRenderer: HeartMethodDecomposeItemRenderer = this.itemList.getVirtualElementAt(index) as HeartMethodDecomposeItemRenderer;
			if (itemRenderer
				&& itemRenderer instanceof HeartMethodDecomposeItemRenderer
				&& itemRenderer.cb) {
				let data: HeartMethodDecomposeItemData = itemRenderer.data as HeartMethodDecomposeItemData;
				if (data) {
					data.isSelected = !data.isSelected;
					this.cardCollection.itemUpdated(data);
				}
			}
			this.itemList.selectedIndex = -1;

			//更新增加碎片
			this.updateAddShatter();
			//更新复选框状态
			// this.updateCheckBoxState();
		}
	}

	/**
	 * 点击处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			switch (e.currentTarget) {
				case this.decomposeBtn:
					this.decomposeHeart();
					break;
				case this.bgClose:
					ViewManager.ins().close(this);
					break;
			}
		}
	}

	/**
	 * 分解心法
	 * @returns void
	 */
	private decomposeHeart(): void {
		if (this.resolveIng)
			return;
		if (this.cardList && this.cardList.length > 0) {
			//检测
			let rbc: HeartMethodStarConfig = null;
			let idList: ItemData[] = [];
			for (let v of this.cardList) {
				if (v && v.isSelected && v.itemData && v.itemData.itemConfig) {
					idList.push(v.itemData);
				}
			}
			//执行
			if (idList.length > 0) {
				this.resolveIng = true;
				HeartMethod.ins().sendOneKeyDecompose(this.heartId, idList);
				return;
			}
		}

		UserTips.ins().showTips("当前无选择任何心法");
	}

	/**
	 * 复选框点击
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onCBTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			let cb: eui.CheckBox = e.currentTarget as eui.CheckBox;
			if (cb && cb instanceof eui.CheckBox) {
				// if (cb.selected) {
				// 	cb.selected = this.checkCanSelectedCheckBox(cb);
				// }


				let tempCB: eui.CheckBox = null;
				for (let i: number = 0; i < this.checkBoxNum; i++) {
					tempCB = this["cb" + i] as eui.CheckBox;
					if (tempCB && tempCB === cb) {
						this.setQualitySelected(i + 1, cb.selected);
						// this.updateList(false, i);
						// this.updateAddShatter();
						return;
					}
				}
			}
		}
	}

	/**
	 * 更新心法对应的分解道具
	 * @returns void
	 */
	private updateShatter(): void {
		let splitItem: number = GlobalConfig.HeartMethodConfig[this.heartId].splitItem;
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[splitItem];
		this.suipianIcon.source = itemConfig.icon + "_png";
		let item: ItemData = UserBag.ins().getBagItemById(itemConfig.id);
		this.suipianNum.text = (item ? item.count : 0) + "";
	}

	/**\
	 * 更新添加的碎片
	 * @returns void
	 */
	public updateAddShatter(): void {
		let addNum: number = 0;
		let rbc: HeartMethodStarConfig = null;
		if (this.cardList && this.cardList.length > 0) {
			for (let v of this.cardList) {
				if (v && v.isSelected && v.itemData && v.itemData.itemConfig) {
					rbc = HeartMethod.ins().getHeartCfg(v.itemData);
					if (rbc) {
						addNum += rbc.splitNum;
					}
				}
			}
		}
		this._addNum = addNum;

		this.suipianAdd.text = addNum ? "+" + addNum : "";
	}


	private setQualitySelected(qua: number, selected: boolean) {
		if (qua < 0) {
			for (let v of this.cardList) {
				if (v.itemData && v.itemData.itemConfig) {
					v.isSelected = false;
				}
			}
		} else {
			for (let v of this.cardList) {
				if (v.itemData && v.itemData.itemConfig) {
					if (ItemConfig.getQuality(v.itemData.itemConfig) == qua) {
						v.isSelected = selected;
					}
				}
			}
		}

		let len = this.cardCollection.length;
		for (let i = 0; i < len; i++) {
			this.cardCollection.itemUpdated(this.cardList[i]);
		}

		this.updateAddShatter();

	}


	/**
	 * 获取复选框的选中状态
	 * @param  {number} qualityIndex
	 * @returns boolean
	 */
	private getCheckBoxSelected(qualityIndex: number): boolean {
		let cb: eui.CheckBox = this["cb" + (qualityIndex - 1)];
		if (cb) {
			return cb.selected;
		}
		return false;
	}

	/**
	 * 重置复选框
	 * @param  {number=1} defaultIndex    默认勾选索引（-1就全部都没有勾选）
	 * @returns void
	 */
	private resetCheckBox(defaultIndex: number = 1): void {
		let cb: eui.CheckBox = null;
		for (let i: number = 0; i < this.checkBoxNum; i++) {
			cb = this["cb" + i];
			if (cb && cb instanceof eui.CheckBox) {
				cb.selected = (i + 1) == defaultIndex;
			}
		}
		this.setQualitySelected(defaultIndex, true);
	}

	/***
	 * 筛选出某一个心法的所有部位
	 */
	private selectHeartItem(list: ItemData[]) {
		let hlist: ItemData[] = [];
		for (let i = 0; i < list.length; i++) {
			let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[list[i].configID];
			if (this.heartId == config.heartmethodId)
				hlist.push(list[i]);
		}
		return hlist;
	}

	/**
	 * 初始化选项卡链表
	 * @returns void
	 */
	private initCardList(): void {
		this.cleanCardList();
		this.cardList = [];
		let totallist: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_18);
		let list: ItemData[] = this.selectHeartItem(totallist);
		if (list && list.length > 0) {
			let rdid: HeartMethodDecomposeItemData = null;
			for (let v of list) {
				for (let i: number = 0; i < v.count; i++) {
					rdid = new HeartMethodDecomposeItemData();
					rdid.itemData = v;
					this.cardList.push(rdid);
				}
			}

			//排序
			this.cardList.sort(this.sortList);
		}
		this.cardCollection = new eui.ArrayCollection(this.cardList);
		this.itemList.dataProvider = this.cardCollection;
	}

	/**
	 * 清理选项卡链表
	 * @returns void
	 */
	private cleanCardList(): void {
		this.cardList = null;
		this.cardCollection = null;
		this.itemList.dataProvider = null;
	}

	/**
	 * 排序链表
	 * @param  {HeartMethodDecomposeItemData} a
	 * @param  {HeartMethodDecomposeItemData} b
	 * @returns number
	 */
	private sortList(a: HeartMethodDecomposeItemData, b: HeartMethodDecomposeItemData): number {
		let aq = ItemConfig.getQuality(a.itemData.itemConfig);
		let bq = ItemConfig.getQuality(b.itemData.itemConfig);
		if (aq > bq)
			return -1;
		if (aq < bq)
			return 1;
		//相同品质 对比星数
		let arbc: HeartMethodStarConfig = HeartMethod.ins().getHeartCfg(a.itemData);
		let brbc: HeartMethodStarConfig = HeartMethod.ins().getHeartCfg(b.itemData);
		if (arbc.star > brbc.star)
			return -1;
		else
			return 1;

	}
}

ViewManager.ins().reg(HeartMethodDecomposePanel, LayerManager.UI_Popup);