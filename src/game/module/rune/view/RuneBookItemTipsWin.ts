/**
 * 符文图鉴的TIPS窗体
 */
class RuneBookItemTipsWin extends BaseEuiView {
	private QUALITY_LABEL_LIST: string[] = ["零级", "初级", "中级", "高级", "顶级", "神级"];
	private SPECIAL_LABEL_LIST: string[] = ["普通", "特殊"];

	public bg: eui.Image;

	public itemIcon: ItemIcon;
	public nameLabel: eui.Label;

	public mainGroup: eui.Group;
	public attrName: eui.Label;
	public attrValue: eui.Label;

	public attrDes: eui.Label;

	public gainList: eui.List;

	// private power: egret.DisplayObjectContainer = null;


	public constructor() {
		super();
		this.skinName = "RuneGainTipsSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		//战力初始化
		// this.power = BitmapNumber.ins().createNumPic(0, "1");
		// this.addChild(this.power);
		// this.power.x = 190;
		// this.power.y = 408;
		this.gainList.itemRendererSkinName = 'RuneGainTipsItemSkin';
		this.gainList.itemRenderer = GainGoodsNoSkinItem;
		super.initUI();
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.setData(param[0], param[1]);
	}

	public close(...param: any[]): void {
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.resetView();
	}

	private otherClose(e: egret.TouchEvent): void {
		ViewManager.ins().close(RuneBookItemTipsWin);
	}

	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			GameGuider.guidance(item[1], item[2]);
			ViewManager.ins().close(RuneBookItemTipsWin);
		}
	}

	/**
	 * 设置数据
	 * @param  {number} item
	 * @returns void
	 */
	public setData(item: RuneConverConfig, itemCfg: ItemConfig): void {
		// let itemCfg: ItemConfig = GlobalConfig.ItemConfig[item.showIcon];
		if (itemCfg) {
			//名字
			this.nameLabel.textFlow = new egret.HtmlTextParser().parser("<font color = '" + ItemConfig.getQualityColor(itemCfg) + "'>" + itemCfg.name + "Lv." + (itemCfg.level||1) + "</font>");
			//图标
			this.itemIcon.setData(itemCfg);
			let runeCfg = GlobalConfig.RuneBaseConfig[itemCfg.id];
			//属性名
			this.attrName.text = RuneConfigMgr.ins().getcfgAttrData(runeCfg);
			//属性值
			this.attrValue.text = RuneConfigMgr.ins().getcfgAttrData(runeCfg, false);
			if (item.checkpoint == 0) {
				this.attrDes.text = `默认解锁`;
			} else {
				this.attrDes.text = `通关通天塔${GlobalConfig.FbChNameConfig[Math.round(item.checkpoint / 10)].name}解锁`;
			}

			let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[itemCfg.id];
			let listHeight: number = 0;
			if (gainConfig) {
				this.gainList.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
				listHeight = gainConfig.gainWay.length * 60;
			} else {
				this.gainList.dataProvider = new eui.ArrayCollection([]);
			}

			// this.mainGroup.height = 390 + listHeight;
		}
		else {
			this.resetView();
		}
	}

	/**
	 * 重置视图
	 * @returns void
	 */
	private resetView(): void {
		this.nameLabel.text = "";
		this.itemIcon.setData(null);
		// BitmapNumber.ins().changeNum(this.power, 0, "1");
	}
}

ViewManager.ins().reg(RuneBookItemTipsWin, LayerManager.UI_Popup);