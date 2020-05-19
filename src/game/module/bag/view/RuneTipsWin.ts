/**
 * Created by Administrator on 2017/3/6.
 */
class RuneTipsWin extends BaseEuiView {

	public itemIcon: ItemIcon;
	public nameLabel: eui.Label;
	public attrName: eui.Label;
	public attrValue: eui.Label;
	public attrDes: eui.Label;
	// public backDesc:eui.Label;
	// public power:eui.Label;
	public cur_desc: string;
	public cur_desc2: string;
	public randomAttr: eui.Label;
	public runeAttr: eui.Group;

	public initUI(): void {
		super.initUI();
		this.skinName = "RuneTipsSkin";
		this.cur_desc = "";
	}

	public open(...param: any[]): void {
		let id: number = param[0];
		let item_config_id: number = param[1];
		this.cur_desc = param[2];
		this.cur_desc2 = param[3];
		this.addTouchEndEvent(this, this.otherClose);
		this.setData(item_config_id);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private setData(id: number): void {
		let itemCfg: ItemConfig = GlobalConfig.ItemConfig[id];
		if (!itemCfg) {
			return;
		}
		this.itemIcon.setData(itemCfg);
		let lvstr = "";
		let itemLv = itemCfg.id % 100;
		if (itemLv == 0) {
			if (!this.cur_desc2) {//主要指非符文槽
				lvstr = " lv." + itemLv;
			}
		} else {
			if (ItemConfig.getSubType(itemCfg) != 0) {//主要指符文精华 //itemCfg.type != 1 &&
				lvstr = " lv." + itemLv;
			}
		}
		this.nameLabel.textFlow = new egret.HtmlTextParser().parser("<font color = '" + ItemConfig.getQualityColor(itemCfg) + "'>" + itemCfg.name + lvstr + "</font>");

		// this.power.text = `评分：${runeCfg.power}`;
		// this.backDesc.textFlow = new egret.HtmlTextParser().parser(`回收可获得<font color = '0xC78563'>${runeCfg.gain}</font>精华`);
		//非符文直接用道具描述
		let desc = "";
		let isRune = false;
		if (ItemConfig.getType(itemCfg) == 1) {
			this.randomAttr.text = itemCfg.desc;
		}
		else {
			let runeCfg: RuneBaseConfig = GlobalConfig.RuneBaseConfig[id];
			if (!runeCfg) {
				//读item表数据
				this.randomAttr.visible = true;
				this.randomAttr.text = itemCfg.desc;
				if (this.cur_desc2)
					this.attrDes.text = `通关${this.cur_desc2}解锁`;
				else
					this.attrDes.visible = false;
			}
			else {
				isRune = true;
				//属性名
				this.attrName.text = RuneConfigMgr.ins().getcfgAttrData(runeCfg);

				//属性值
				this.attrValue.text = RuneConfigMgr.ins().getcfgAttrData(runeCfg, false);

				this.attrName.x = this.runeAttr.width / 2 - (this.attrName.width + this.attrValue.width) / 2;
				this.attrValue.x = this.attrName.x + this.attrName.width;
				//描述
				this.attrDes.text = this.cur_desc;
				// egret.log("属性名 = "+this.attrName.text)
				// egret.log("属性值 = "+this.attrValue.text)
				// egret.log("描述 = "+this.attrDes.text)
				// egret.log("白色描述 = "+this.randomAttr.text);
			}
		}
		this.attrName.visible = this.attrValue.visible = isRune;
		this.randomAttr.visible = !isRune;

	}
}
ViewManager.ins().reg(RuneTipsWin, LayerManager.UI_Popup);