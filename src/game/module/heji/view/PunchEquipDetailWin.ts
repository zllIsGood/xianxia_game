class PunchEquipDetailWin extends BaseEuiView {
	// public colorCanvas: eui.Image;
	// public group: eui.Group;
	public background: eui.Image;
	public itemIcon: ItemIcon;
	public nameLabel: eui.Label;
	public type: eui.Label;
	public attr1: eui.Label;
	public lv: eui.Label;
	public career: eui.Label;
	public score: eui.Label;
	public levelKey: eui.Label;
	public forgeGroup: eui.Button;
	public tupoDesc: eui.Group;
	public attr2: eui.Label;
	// public attPoint: eui.Image;
	public baseDesc: eui.Group;
	public desc1: eui.Label;
	public attr0: eui.Label;
	public bestAtt: eui.Label;
	public line: eui.Image;
	private offY: number = 150;
	// private totalPower: egret.DisplayObjectContainer;
	public data: any = null;

	private duanwei: String[] = ["高", "初", "中"];
	// private powerGroup: eui.Group;
	private powerPanel: PowerPanel;
	private group: eui.Group;

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		// this.totalPower = BitmapNumber.ins().createNumPic(0, "8");
		// this.totalPower.x = 80;
		// this.totalPower.y = 11;

		this.skinName = "PunchEquipTipsSkin";
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public open(...param: any[]): void {
		this.data = param[0];
		this.forgeGroup.visible = param[1];

		this.forgeGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		// this.group.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.observe(UserSkill.ins().postHejiEquipChange, this.refushInfo);
		// this.colorCanvas.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.refushInfo();
	}

	public close(...param: any[]): void {
		this.forgeGroup.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		// this.group.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		// this.colorCanvas.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.removeObserve()
	}

	private refushInfo(): void {
		let config: ItemConfig;
		let str1: string = "";
		let str2: string = "";
		config = this.data.itemConfig;
		let point: number = 0;
		point = this.data.point;
		// let point = Math.floor(GameGlobal.getAttrPower(this.data.att));
		this.score.text = "评分：" + point;
		// let tupoLevel: number = GameGlobal.LunhuiEquipsModel.getTuPoLevel(-1, config.subType);
		let addPoint: number = 0;
		// this.tupoDesc.visible = tupoLevel > 0;
		// if (tupoLevel > 0) {
		// addPoint = GameGlobal.LunhuiEquipsModel.getAddPointAttr(config.subType, tupoLevel);
		// this.attr2.text = "基础属性：+" + addPoint + "%";
		// }
		// BitmapNumber.ins().changeNum(this.totalPower, Math.floor(point * (100 + addPoint) / 100), "8");
		this.powerPanel.setPower(Math.floor(point * (100 + addPoint) / 100))
		let atts: AttributeData[] = this.data.att;
		let bestDesc: string = "";
		for (let i: number = 0; i < atts.length; i++) {
			if (atts[i].type == 0) continue;
			let str: string = AttributeData.getAttrNameByAttrbute(atts[i], true);
			str1 += str + "\n";
		}

		let extAtts: AttributeData[] = this.data.extAtt;
		let hasExtAtt: boolean = false;
		for (let j: number = 0; j < extAtts.length; j++) {
			if (extAtts[j].type == 0) continue;
			hasExtAtt = true;
			let str: string = AttributeData.getAttrNameByAttrbute(extAtts[j], true);
			str2 += str + "\n";
		}

		if (hasExtAtt) {
			this.tupoDesc.visible = true;
			this.group.height = 600;
			this.forgeGroup.y = 530;
		} else {
			this.tupoDesc.visible = false;
			this.group.height = 600 - this.offY;
			this.forgeGroup.y = 530 - this.offY;
		}
		// this.attPoint.visible = true;
		// if (!this.totalPower.parent)
		// 	this.powerGroup.addChild(this.totalPower);
		this.desc1.text = "基础属性:";

		this.nameLabel.text = config.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(config);
		this.itemIcon.setData(config);
		let chong: number = config.level % 3;
		this.lv.text = config.zsLevel > 0 ? `等级：${config.zsLevel}转` : `等级：${config.level}级`;
		this.attr1.text = str1;
		this.attr0.text = str2;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.forgeGroup:
				ViewManager.ins().close(PunchEquipDetailWin);
				ViewManager.ins().open(PunchEquipChooseWin, this.data.itemConfig.subType, 1);
				break;
			default:
				ViewManager.ins().close(PunchEquipDetailWin);
		}
	}
}

ViewManager.ins().reg(PunchEquipDetailWin, LayerManager.UI_Main);
