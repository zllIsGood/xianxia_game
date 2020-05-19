/**
 * 符文分解窗体
 */
class RuneDecomposePanel extends BaseView {
	/** 当前选择的角色 */
	public curRole: number;

	public decomposeBtn: eui.Button;
	public itemList: eui.List;
	public curLab: eui.Label;
	public suipianNow: eui.Label;
	public addLab: eui.Label;
	public suipianAdd: eui.Label;
	public cb0: eui.CheckBox;
	public cb1: eui.CheckBox;
	public cb2: eui.CheckBox;
	public cb3: eui.CheckBox;
	public cb4: eui.CheckBox;

	/**选项卡数据链表 */
	private cardList: RuneDecomposeItemData[] = null;
	/**选项卡EUI数据集 */
	private cardCollection: eui.ArrayCollection = null;

	/**复选框数量 */
	private checkBoxNum: number = 5;

	/**列表滚动位置 */
	private itemListScrollV: number = 0;
	private resolveIng: boolean = false;
	private _addNum: number = 0;
	private _chipNum: number = 0;

	public constructor() {
		super();
		// this.skinName = "DecomposeruneSkin";
	}

	protected childrenCreated(){
		this.init();
	}

	public init(): void {
		this.itemList.itemRenderer = RuneDecomposeItemRenderer;
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
		this.observe(GameLogic.ins().postRuneShatter, this.onShatterChange);
		this.observe(GameLogic.ins().postRuneExchange, this.onShatterChange);
		this.observe(Rune.ins().postOneKeyDecomposeResult, this.onDecomposeResult);

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
		this.removeObserve();
		this.cleanCardList();
	}

	/**
	 * 分解结果
	 * @returns void
	 */
	public onDecomposeResult(param: any[]): void {
		if (param[0]) {
			let normalNum: number = param[1];
			let specialNum: number = param[2];
			let str: string = "";
			let num: number = 0;
			if (normalNum > 0) {
				str = "普通";
				num = normalNum;
			}
			else if (specialNum > 0) {
				str = "特殊";
				num = specialNum;
			}
			if( this._addNum )
				UserTips.ins().showTips(`分解成功，|C:0x35e62d&T:符文精华x${this._addNum}|`);
			// UserTips.ins().showTips(`分解成功，获得${num}个${str}符文精华`);
			if( this._chipNum )
				UserTips.ins().showTips(`分解成功，|C:0x35e62d&T:符文碎片x${this._chipNum}|`);

			this.playEffect();
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
			let item: RuneDecomposeItemRenderer = this.itemList.getChildAt(i) as RuneDecomposeItemRenderer;
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
			let itemRenderer: RuneDecomposeItemRenderer = this.itemList.getVirtualElementAt(index) as RuneDecomposeItemRenderer;
			if (itemRenderer
				&& itemRenderer instanceof RuneDecomposeItemRenderer
				&& itemRenderer.cb) {
				let data: RuneDecomposeItemData = itemRenderer.data as RuneDecomposeItemData;
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
					this.decomposeRune();
					break;
			}
		}
	}

	/**
	 * 分解符文
	 * @returns void
	 */
	private decomposeRune(): void {
		if (this.resolveIng)
			return;
		if (this.cardList && this.cardList.length > 0) {
			//检测
			let hasMaxQuality: boolean = false;
			let rbc: RuneBaseConfig = null;
			let ic: ItemConfig = null;
			let idList: ItemData[] = [];
			for (let v of this.cardList) {
				if (v && v.isSelected && v.itemData && v.itemData.itemConfig) {
					idList.push(v.itemData);
					rbc = RuneConfigMgr.ins().getBaseCfg(v.itemData);
					ic = v.itemData.itemConfig;
					if (ItemConfig.getQuality(ic) >= RuneConfigMgr.ins().getOtherCfg().maxQuality) {
						hasMaxQuality = true;
					}
				}
			}
			//执行
			if (hasMaxQuality) {
				let specialStr: string = "";
				let qualityStr: string = "";
				let plusStr: string = "";
				// if (hasSpecail) specialStr = "<font color = '0xFFFFFF' size = '22'>[特殊符文]</font>";
				if (hasMaxQuality) qualityStr = "<font color = '" + ItemBase.QUALITY_COLOR[RuneConfigMgr.ins().getOtherCfg().maxQuality] + "' size = '22'>顶级符文</font>";
				// if (hasSpecail && hasMaxQuality) plusStr = "和";

				let str: string = specialStr + plusStr + qualityStr;
				let finalStr: string = "当前分解符文包括" + str + "，是否继续进行分解";
				WarnWin.show(finalStr, () => {
					this.resolveIng = true;
					Rune.ins().sendOneKeyDecompose(idList);
				}, this);
				return;
			}
			else {
				if (idList.length > 0) {
					this.resolveIng = true;
					Rune.ins().sendOneKeyDecompose(idList);
					return;
				}
			}
		}

		UserTips.ins().showTips("当前无选择任何符文");
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
	 * 更新碎片
	 * @returns void
	 */
	private updateShatter(): void {
		let shatter: number = Actor.runeShatter;
		this.curLab.text = shatter.toString();
		let rune:number = Actor.runeExchange;
		this.suipianNow.text = rune.toString();
	}

	/**\
	 * 更新添加的碎片
	 * @returns void
	 */
	public updateAddShatter(): void {
		let addNum: number = 0;//符文精华
		let chip: number = 0;//符文碎片
		let rbc: RuneBaseConfig = null;
		// let rcc: RuneConverConfig = null;
		if (this.cardList && this.cardList.length > 0) {
			for (let v of this.cardList) {
				if (v && v.isSelected && v.itemData && v.itemData.itemConfig) {
					rbc = RuneConfigMgr.ins().getBaseCfg(v.itemData);
					if (rbc){
						addNum += rbc.gain;
						if( rbc.chip )
							chip += rbc.chip;
					}
					// rcc = RuneConfigMgr.ins().getConverCfgByItemConfig(v.itemData);
					// if (rcc)
					// 	chip += rcc.conversion;
				}
			}
		}
		this._addNum = addNum;
		this._chipNum = chip;

		this.addLab.text = addNum > 0 ? "+" + addNum : "";
		this.suipianAdd.text = chip?"+"+chip:"";
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
		// if (qua >= 0) {
		// 	this.updateCheckBoxState();
		// }

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

	/**
	 * 初始化选项卡链表
	 * @returns void
	 */
	private initCardList(): void {
		this.cleanCardList();
		this.cardList = [];
		let list: ItemData[] = UserBag.ins().getItemByType(6);
		if (list && list.length > 0) {
			let rdid: RuneDecomposeItemData = null;
			for (let v of list) {
				for (let i: number = 0; i < v.count; i++) {
					rdid = new RuneDecomposeItemData();
					rdid.itemData = v;
					this.cardList.push(rdid);
					// if (this.cardList.length >= 20) {
					// 	break;
					// }
				}
				// if (this.cardList.length >= 20) {
				// 	break;
				// }
			}

			//排序
			this.cardList.sort(this.sortList);
		}
		//压入
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
	 * @param  {RuneDecomposeItemData} a
	 * @param  {RuneDecomposeItemData} b
	 * @returns number
	 */
	private sortList(a: RuneDecomposeItemData, b: RuneDecomposeItemData): number {
		let aq = ItemConfig.getQuality(a.itemData.itemConfig);
		let bq = ItemConfig.getQuality(b.itemData.itemConfig);
		if (aq > bq) return -1;
		if (aq < bq) return 1;

		let arbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(a.itemData);
		let brbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(b.itemData);
		if (arbc && brbc) {
			let lvlA = arbc.id % 100;
			let lvlB = brbc.id % 100;
			if (lvlA > lvlB) {
				return -1;
			} else if (lvlA < lvlB) {
				return 1;
			}
		}

		return a.itemData.configID - b.itemData.configID;
	}
}