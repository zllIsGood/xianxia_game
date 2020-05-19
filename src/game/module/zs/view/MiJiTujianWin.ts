class MiJiTujianWin extends BaseEuiView {
	public closeBtn: eui.Button;
	public mijiList: eui.List;
	public mijiOpen: eui.Label;
	public info: eui.Label;
	public mijiIcon: ItemIcon;
	public power: eui.Label;


	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "MijiPhotoSkin";

		this.mijiList.itemRenderer = ItemBaseNoTap;

		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.mijiList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.addTouchEvent(this.mijiOpen, this.onTap);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.mijiList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.removeTouchEvent(this.mijiOpen, this.onTap);
	}

	private updateData(): void {
		this.mijiOpen.textFlow = (new egret.HtmlTextParser()).parser("<font><u>通过论剑天下玩法获得</u></font>");
		let mijiAry: number[] = [];
		for (let config of GlobalConfig.ItemConfig) {
			if (ItemConfig.getType(config) == 2) {
				mijiAry.push(config.id);
			}
		}
		this.mijiList.dataProvider = new eui.ArrayCollection(mijiAry);

		if (mijiAry.length) {
			this.setData(mijiAry[0]);
			this.mijiList.selectedIndex = 0;
		}
	}

	/**
	 *
	 * 点选秘术回调函数
	 *
	 *
	 */
	private onItemTap(e: eui.ItemTapEvent): void {
		let data: number = this.mijiList.dataProvider.getItemAt(e.itemIndex);
		this.setData(data);
	}

	/**
	 *
	 * 设置下方图标  和   描述
	 * @param data  当前选中的秘术
	 *
	 */
	setData(data: number): void {
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[data];
		;
		this.mijiIcon.setData(itemConfig);
		//this.mijiLearnIcon.setCount("");
		let color: string = ItemConfig.getQualityColor(itemConfig).toString(16);
		this.info.textFlow = new egret.HtmlTextParser().parser("<font color='#" + color + "'>" + itemConfig.name + "</font>\n" + itemConfig.desc);
		this.mijiIcon.visible = true;
		let miji: number = 10;
		for (let config of GlobalConfig.MiJiSkillConfig) {
			if (config.item == data) {
				miji = config.id;
			}
		}
		this.power.text = "评分：" + GlobalConfig.MiJiSkillConfig[miji].power;
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.mijiOpen:
				ViewManager.ins().close(this);
				UserWarn.ins().setBuyGoodsWarn(
					200099, 1
				);
				break;
		}
	}
}

ViewManager.ins().reg(MiJiTujianWin, LayerManager.UI_Main);