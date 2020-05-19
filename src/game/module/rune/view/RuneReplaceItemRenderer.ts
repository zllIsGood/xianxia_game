/**
 * 符文替换道具渲染器
 */
class RuneReplaceItemRenderer extends eui.ItemRenderer {
	public nameLab: eui.Label;
	public back: eui.Label;
	public attr: eui.Label;
	public changeBtn: eui.Button;
	public changeBtn0: eui.Button;
	public getBtn: eui.Button;
	public itemIcon: RuneDisplay;
	public runeName: eui.Label;
	public now: eui.Label;
	public already: eui.Label;

	public constructor() {
		super();
		this.skinName = "RuneEquipChangeSkinItem";
		this.changeBtn.name = "changeBtn";
		this.changeBtn0.name = "changeBtn";
		this.getBtn.name = "getBtn";
	}

	public dataChanged(): void {
		let curData: RuneReplaceItemData = this.data;
		let itemData: ItemData = curData.data as ItemData;
		this.currentState = "all";
		this.validateNow();
		if (itemData && itemData instanceof ItemData) {
			if (itemData.configID) {
				let rbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(itemData);
				if (rbc) {
					//图标
					this.itemIcon.showName(false);
					this.itemIcon.setData(itemData);


					let itemCfg: ItemConfig = GlobalConfig.ItemConfig[itemData.itemConfig.id];
					let nameCfg: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(itemCfg)];
					this.runeName.textFlow = TextFlowMaker.generateTextFlow(`|C:${ItemConfig.getQualityColor(itemCfg)}&T:${nameCfg.runeName}Lv.${itemCfg.id % 100}`);
					//名字
					// this.runeName.textFlow = new egret.HtmlTextParser().parser("<font color = '" + ItemBase.QUALITY_COLOR[itemData.itemConfig.quality] + "'>" + itemData.itemConfig.name + "</font>");
					//属性
					this.back.text = `回收可得${rbc.gain}精华`;
					//属性
					this.attr.text = RuneConfigMgr.ins().getcfgAttrDesc(rbc);
					//数量
					this.changeBtn.visible = curData.canEquip && RuneDataMgr.ins().posIsWear;
					this.changeBtn0.visible = curData.canEquip && !RuneDataMgr.ins().posIsWear;
					this.now.visible = !curData.canEquip && RuneDataMgr.ins().posIsWear && RuneDataMgr.ins().posIsWear.configID == itemData.configID;
					this.already.visible = !curData.canEquip && (RuneDataMgr.ins().posIsWear != itemData);
				}
				else {
					this.resetView();
				}
			} else {
				this.setBtnStatu();
				this.resetView();
			}
		}
		else {
			this.resetView();
		}
	}

	public setBtnStatu(): void {
		if (this.data == null || this.data.data == null) {
			this.currentState = "dis";
			this.itemIcon.currentState = "emp";
		} else {
			if (this.data.data.configID) {
				this.currentState = "all";
				this.changeBtn.visible = false;
				this.changeBtn0.visible = false;
				this.now.visible = true;
				this.already.visible = false;
			} else {
				this.currentState = "get";
			}

		}
	}

	private resetView(): void {
		this.itemIcon.setData(null);
		this.nameLab.text = "";
		this.attr.text = "";
	}
}

class RuneReplaceItemData {
	canEquip: boolean;
	data: ItemData;

	constructor(data) {
		this.data = data;
	}
}