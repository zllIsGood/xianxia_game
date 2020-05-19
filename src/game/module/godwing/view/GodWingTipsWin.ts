
class GodWingTipsWin extends BaseEuiView {
	private group: eui.Group;

	private nameLabel: eui.Label;
	private type: eui.Label;
	private lv: eui.Label;

	private career: eui.Label;
	private score: eui.Label;

	private attr0: eui.Label;


	private itemIcon: GodWingItem;


	private powerPanel: PowerPanel;
	private bgClose: eui.Image;

	private gwConfig: GodWingItemConfig;
	private quali: eui.Image;
	constructor() {
		super();
		this.skinName = "ShenYuTipsSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.otherClose);
		this.gwConfig = param[0];
		this.updateTips()
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(GodWingTipsWin);
	}
	private updateTips() {
		let cfg: ItemConfig = GlobalConfig.ItemConfig[this.gwConfig.itemId];
		this.nameLabel.text = cfg.name;
		this.type.text = Wing.ins().getNameFromSlot(this.gwConfig.slot);
		this.lv.text = "羽翼" + this.gwConfig.level + "阶可穿戴";
		let color: number = 0xff0000;
		for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role && role.wingsData.lv + 1 >= this.gwConfig.level) {
				color = 0x00ff00;
				break;
			}
		}
		this.lv.textColor = color;
		this.nameLabel.textColor = ItemConfig.getQualityColor(cfg);

		let arr: AttributeData[] = this.gwConfig.attr;
		let exarr: AttributeData[] = this.gwConfig.exattr;
		let attrStr = "";
		let exattrStr = "";
		let exPower: number = this.gwConfig.exPower;
		for (let i = 0; i < arr.length; i++) {
			attrStr += AttributeData.getAttrStrByType(arr[i].type) + ": ";
			attrStr += arr[i].value + "\n";
		}
		for (let i = 0; i < exarr.length; i++) {
			attrStr += AttributeData.getExtAttrStrByType(exarr[i].type) + ": ";
			let value = exarr[i].value;
			if (exarr[i].type == ExAttributeType.eatMiss || exarr[i].type == ExAttributeType.eatHit) {
				value = value / 100;
				attrStr += value;
				attrStr += "%";
			}
			attrStr += "\n";
		}
		let index: number = attrStr.lastIndexOf("\n");
		attrStr = attrStr.substring(0, index);
		this.attr0.text = attrStr;//属性描述

		let totalAttr: AttributeData[] = arr;//arr.concat(exarr);
		let scorePower = Math.floor(UserBag.getAttrPower(totalAttr)) + exPower;
		this.score.text = `评分：${scorePower}`;
		this.powerPanel.setPower(scorePower);

		this.itemIcon.data = this.gwConfig;
		this.itemIcon.setNameVisible(false);
		this.itemIcon.setCountVisible(false);

		this.quali.source = `common1_tips_${ItemConfig.getQuality(cfg)}`;
	}
}
ViewManager.ins().reg(GodWingTipsWin, LayerManager.UI_Popup);