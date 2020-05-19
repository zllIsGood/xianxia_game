class HuanShouEquipTiips extends BaseEuiView {
	private group: eui.Group;
	private forgeGroup: eui.Group;
	private background: eui.Image;
	private nameLabel: eui.Label;
	private type: eui.Label;
	private lv: eui.Label;
	private levelKey: eui.Label;
	private careerKey: eui.Label;

	private career: eui.Label;
	private score: eui.Label;

	private attr1: eui.Label;
	private attr2: eui.Label;
	private attr3: eui.Label;
	private attr4: eui.Label;

	private itemIcon: ItemIcon;
	public powerPanel: PowerPanel;

	private attrList: eui.Label[];
	private _bottomY: number = 0;

	private slotNumberToName = {
		1: "兽刃",
		2: "兽甲",
		3: "兽环",
		4: "兽纹",
		5: "兽珠",
		6: "兽印",
	};

	public constructor() {
		super();
		this.skinName = "EquipTipsSkin";
	}

	public initUI(): void {
		super.initUI();

		this.itemIcon.imgJob.visible = false;
		this.career.text = "";
		this.careerKey.text = "";
		this.attrList = [this.attr1, this.attr2, this.attr3, this.attr4];
		this.attr1.visible = false;
		this.attr2.visible = false;
		this.attr3.visible = false;
		this.attr4.visible = false;
	}

	public open(...param: any[]): void {
		let id: number = param[0];
		this.addTouchEndEvent(this, this.closeWin);
		this.setData(id);
	}

	public close(...param: any[]): void {

	}

	private setData(itemid: number): void {
		let config = UserHuanShou.ins().getEquipConfById(itemid);
		let itemconf = GlobalConfig.ItemConfig[itemid];
		let itemConfig;
		let power = 0;
		if (config) {
			itemConfig = GlobalConfig.ItemConfig[itemid];
			this.nameLabel.text = itemConfig.name;
			this.nameLabel.textColor = ItemBase.QUALITY_COLOR[itemConfig.quality];
			this.itemIcon.setData(itemConfig);
			power = Math.floor(UserBag.getAttrPower(config.attrs));

			this.lv.text = itemconf.level + "";
			this.type.text = this.slotNumberToName[config.pos];
			this.career.y = this.careerKey.y = this.levelKey.y;

			let ii = 0;

			for (let k in config.attrs) {
				let attrStr = "";
				attrStr += AttributeData.getAttrStrByType(config.attrs[k].type) + ": ";
				attrStr += ' +' + AttributeData.getExtAttStrByType(config.attrs[k]);
				this.attrList[ii].text = attrStr;
				this.attrList[ii].visible = true;
				ii++;
			}
			this._bottomY = this.attrList[ii - 1].y + this.attrList[ii - 1].height;
			if (config.percent_attrs) {
				for (let key in config.percent_attrs) {

					let temp = config.percent_attrs[key];
					let str = AttributeData.getCustomAttName(temp.type, `加成`, ":");
					str += (temp.percent / 100) + `%`;
					if (ii >= this.attrList.length) {
						this.addTips(null, str);
					} else {
						this.attrList[ii].text = str;
						this.attrList[ii].visible = true;
						this._bottomY = this.attrList[ii].y + this.attrList[ii].height;
					}
					ii++;
				}
				power += config.expower;
			}


			this.background.height = 155 + this._bottomY + 12;
			this.group.y = this.group.height / 2 - this.background.height / 2;
			this.powerPanel.setPower(power);
			this.score.text = "评分：" + power;
			this.powerPanel.y = this.group.y + 121;

		}
	}

	private addTips(attr: AttributeData, customStr: string): void {

		let attrTxt: eui.Label = new eui.Label;
		attrTxt.fontFamily = "黑体";
		attrTxt.size = 16;
		attrTxt.lineSpacing = 8;
		attrTxt.textColor = 0xFFFFFF;
		attrTxt.x = 129;
		attrTxt.y = this._bottomY + 10;
		this.forgeGroup.addChild(attrTxt);
		let str = "";
		if (customStr) {
			str = `|C:${0xFFFFFF}}&T:${customStr}`;
		} else {
			str = `|C:${0xFFFFFF}}&T:${AttributeData.getAttStr(attr, 1, 1, ":")}`;
		}
		attrTxt.textFlow = TextFlowMaker.generateTextFlow(str);
		this._bottomY = attrTxt.y + attrTxt.height;
	}
}
ViewManager.ins().reg(HuanShouEquipTiips, LayerManager.UI_Popup);