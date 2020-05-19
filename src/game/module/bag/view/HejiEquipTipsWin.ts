class HejiEquipTipsWin extends BaseEuiView {
	private group: eui.Group;
	private forgeGroup: eui.Group;
	private nextForgeGroup: eui.Group;
	private background: eui.Image;
	private nameLabel: eui.Label;
	private type: eui.Label;
	private lv: eui.Label;
	private levelKey: eui.Label;
	private career: eui.Label;
	private score: eui.Label;

	private attr1: eui.Label;
	private attr2: eui.Label;
	private attr3: eui.Label;
	private attr4: eui.Label;

	private nextAttr1: eui.Label;
	private nextAttr2: eui.Label;
	private nextAttr3: eui.Label;
	private nextAttr4: eui.Label;
	// private jobGroup: eui.Group;
	// private baseAttr: eui.Label;
	// private randAttr: eui.Label;
	// private nameAttr: eui.Label;

	private itemIcon: ItemIcon;
	// private totalPower: egret.DisplayObjectContainer;

	private roleModel: Role;
	private _bottomY: number = 0;	//最后一个组件的Y坐标值

	private _equipPower: number = 0;
	private _totalPower: number = 0;

	private changeBtn: eui.Button;

	private curRole: number = 0;
	private index: number = 0;
	// private powerGroup:eui.Group;
	private powerPanel: PowerPanel;
	private powerPanel0: PowerPanel;
	private quali: eui.Image;
	private bgClose: eui.Image;
	private data: any;
	private needCount: number;
	constructor() {
		super();
		this.skinName = "HejiEquipTipsSkin";
		// this.setSkinPart("powerPanel", new PowerPanel());
		// this.powerPanel.setBgVis(false);
		// this.powerPanel0.setBgVis(false);
	}


	public initUI(): void {
		super.initUI();
		this.init();
	}

	public init(): void {
		this.itemIcon.imgJob.visible = false;
		this.waylist.itemRenderer = RingGainItem;
	}

	public isBagTips: boolean;
	public open(...param: any[]): void {
		this.data = param[0];

		if (param[1]) {
			this.changeBtn.visible = true;
		} else {
			this.changeBtn.visible = false;
		}
		this.isBagTips = param[2];

		// let handle: number = param[1];
		// let configID: number = param[2];
		// let data = param[3];

		// this.roleModel = param[4];
		// if (param[5] >= 0) {
		// 	this.curRole = param[5];
		// 	this.index = param[6];
		// 	this.changeBtn.visible = true;
		// } else {
		// 	this.changeBtn.visible = false;
		// }
		// this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEndEvent(this.bgClose, this.otherClose)
		this.addTouchEndEvent(this.changeBtn, this.onEquipChange)
		this.waylist.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.setData(this.data);

		this.checkGateWay();

	}

	public close(...param: any[]): void {
		// this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEquipChange, this.changeBtn);
		this.waylist.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
	}

	
	public checkGateWay(): void {
		//限时任务存在时才限时限时任务这个获取途径
		if( UserTask.ins().currTaskListsId > 0 ) {
			this.gainWay = [["参与击杀试炼BOSS", "BossWin", 2],["限时任务", "LimitTaskView"]];
		} else {
			this.gainWay = [["参与击杀试炼BOSS", "BossWin", 2]];
		}
	}


	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			GameGuider.guidance(item[1], item[2], true);
			ViewManager.ins().close(this);
		}
	}
	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(HejiEquipTipsWin);
	}

	private onEquipChange(e: egret.Event): void {
		if (!this.needCount) {
			UserTips.ins().showTips("|C:0xff0000&T:材料不足");
			return;
		}

		this.onBtn();
		// ViewManager.ins().close(HejiEquipTipsWin);
		// ViewManager.ins().open(PunchEquipChooseWin, ItemConfig.getSubType(this.data.itemConfig), 1);
	}

	public onBtn(): void {
		let nextId: number;
		//未激活状态
		if (!(this.data instanceof ItemData) && !this.data.id) {
			let posId: number = 910000 + this.data + 1;
			nextId = posId;
		} else {
			nextId = this.data.configID + 10;
		}

		let nextItemConfig: ItemConfig = GlobalConfig.ItemConfig[nextId];
		let pos: number = ItemConfig.getSubType(nextItemConfig);
		let itemList: ItemData[] = UserBag.ins().getHejiEquipsByType(pos);
		let handle: number = 0;
		for (let i = 0; i < itemList.length; i++) {
			if (itemList[i].configID == nextItemConfig.id && pos == ItemConfig.getSubType(itemList[i].itemConfig)) {
				handle = itemList[i].handle;
				break;
			}
		}
		if (!handle) {
			UserTips.ins().showTips("|C:0xff0000&T:印记异常");
			return;
		}


		let itemlv = nextItemConfig.level ? nextItemConfig.level : 0;
		let itemzslv = nextItemConfig.zsLevel ? nextItemConfig.zsLevel : 0;
		if (itemzslv > UserZs.ins().lv || itemlv > Actor.level) {
			UserTips.ins().showTips(`|C:0xff0000&T:印记需要${itemzslv}转${itemlv}级`);
			return;
		}
		ViewManager.ins().close(HejiEquipTipsWin);

		UserSkill.ins().sendDressHejiEquip(handle, pos);
	}
	private setData(_data?: any): void {
		let data: any
		if (!(_data instanceof ItemData)) {
			if (!_data.id) {
				if (_data > 910000) {
					data = new ItemData();
					data.configID = _data;
				} else {
					let posId: number = 910000 + _data + 1;
					data = new ItemData();
					data.configID = posId;
				}
			} else {
				data = new ItemData();
				data.configID = _data.id;
			}
			let itemData: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_EQUIP, data.configID);
			if (!itemData || !itemData.count)
				this.currentState = "unactivated_no";//未激活未有材料
			else
				this.currentState = "unactivated_have";//未激活有材料
		} else {
			data = _data;

			let next: EquipConfig = GlobalConfig.EquipConfig[data.configID + 10];
			if (next) {
				let itemData: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_EQUIP, next.id);
				if (itemData)
					this.currentState = "not_max";//激活未满级 有材料
				else
					this.currentState = "not_max_no";//激活未满级 无材料
			}
			else
				this.currentState = "max";//激活已满级
			// this.currentState = "default";
		}
		if (this.isBagTips)
			this.currentState = "default";

		//设置状态后 要马上刷新 不然控件数据刷新会在下一帧触发
		this.validateNow();

		this.needCount = 0;
		this.setCurAttrs(data);
		this.setNextAttrs(data);
		this.unactivated(data);//未激活状态描述

	}
	//未激活状态
	private attr0: eui.Label;
	private attr5: eui.Label;
	private attr6: eui.Label;
	private waylist: eui.List;
	private gainWay: any[] = [];
	private unactivated(data: any) {
		let nextId: number;
		//未激活状态
		if (!(this.data instanceof ItemData) && !this.data.id) {
			nextId = data.configID;
		} else {
			nextId = data.configID + 10;
		}

		let nextItemConfig: ItemConfig = GlobalConfig.ItemConfig[nextId];
		let itemData: ItemData = null
		if (nextItemConfig) {
			this.attr0.text = `${nextItemConfig.name}`;
			this.attr0.textColor = ItemConfig.getQualityColor(nextItemConfig);
			itemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_EQUIP, nextItemConfig.id);
		}
		if (itemData) {
			this.attr6.text = `(拥有×${itemData.count})`;
			this.attr6.textColor = 0x00ff00;
			this.needCount = itemData.count;
		} else {
			this.attr6.textColor = 0xff0000;
		}

		//未激活未有材料
		if (this.currentState == "unactivated_no" || this.currentState == "not_max_no") {
			this.waylist.dataProvider = new eui.ArrayCollection(this.gainWay);
		}
		//未激活有材料
		else if (this.currentState == "unactivated_have") {
			this.changeBtn.label = "激  活";
		}

	}

	/** 下一属性 **/
	private nextTile: eui.Label;
	private attr7: eui.Label;
	private attr9: eui.Label;
	private setNextAttrs(data: any) {
		if (this.currentState != "not_max" && this.currentState != "not_max_no")
			return;
		this.changeBtn.label = "升  级";
		let nextId: number = data.configID + 10;
		let nextItemConfig: ItemConfig = GlobalConfig.ItemConfig[nextId];
		let nextEquipConfig: EquipConfig = GlobalConfig.EquipConfig[nextId];
		let itemConfig: ItemConfig = nextItemConfig;
		this._totalPower = 0;

		this.nextTile.text = `下级(${itemConfig.name})`;
		this.nextTile.textColor = ItemConfig.getQualityColor(itemConfig);
		this.attr7.text = `${itemConfig.name}`;
		this.attr7.textColor = this.nextTile.textColor;
		let itemData: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_EQUIP, nextItemConfig.id);
		if (itemData) {
			this.attr9.text = `(拥有×${itemData.count})`;
			this.attr9.textColor = 0x00ff00;
			this.needCount = itemData.count;
		} else {
			this.attr9.textColor = 0xff0000;
		}
		//道具框数据
		// let q = ItemConfig.getQuality(itemConfig);
		// this.quali.source = q > 0 ? `common1_tips_${q}` : "";
		// this.itemIcon.setData(itemConfig);
		// if (data instanceof ItemData || itemConfig != null) {
		// 	if (data && ItemConfig.getType((<ItemData>data).itemConfig) == 5) {
		// 		this.levelKey.text = itemConfig.zsLevel > 0 ? "转生：" : "等级：";
		// 		this.type.text = Role.getHejiEquipNameByType(ItemConfig.getSubType(itemConfig));
		// 		this.lv.text = itemConfig.zsLevel > 0 ? (itemConfig.zsLevel + "转") : (itemConfig.level + "级");
		// 		if (itemConfig.zsLevel > 0) {
		// 			this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
		// 		}
		// 		else {
		// 			this.lv.textColor = Actor.level < (itemConfig.level || 1) ? 0xf3311e : 0x35e62d;
		// 		}
		// 	}
		// }
		let ii = 1;
		this.nextAttr1.visible = false;
		this.nextAttr2.visible = false;
		this.nextAttr3.visible = false;
		this.nextAttr4.visible = false;
		let config = nextEquipConfig;
		let totalAttr: AttributeData[] = [];
		this.score.visible = false;//必杀不显示评分
		if (data.att) {
			for (let k in AttributeData.translate) {
				if (!config[k] || config[k] <= 0) continue;
				let tempAtt: AttributeData = new AttributeData(AttributeData.translate[k], config[k]);
				for (let j in data.att) {
					if (data.att[j].type == tempAtt.type) {
						tempAtt.value += data.att[j].value;
						break;
					}
				}
				let attrStr = "";
				attrStr = AttributeData.getAttStrByType(tempAtt, 0, "  ");
				totalAttr.push(tempAtt);
				this['nextAttr' + ii].text = attrStr;
				this['nextAttr' + ii].visible = true;
				ii++;
			}

			this._bottomY = this['nextAttr' + (ii - 1)].y + this['nextAttr' + (ii - 1)].height;
		} else {
			for (let k in AttributeData.translate) {
				if (!config[k] || config[k] <= 0) continue;
				let tempAtt: AttributeData = new AttributeData(AttributeData.translate[k], config[k])
				let attrStr = "";
				// tempAtt.value = Math.floor(tempAtt.value * 1.15);
				attrStr = AttributeData.getAttStrByType(tempAtt, 0, "  ");
				totalAttr.push(tempAtt);
				this['nextAttr' + ii].text = attrStr;
				this['nextAttr' + ii].visible = true;
				ii++;
			}

			this._bottomY = this['nextAttr' + (ii - 1)].y + this['nextAttr' + (ii - 1)].height;
		}

		if (config.baseAttr) {
			let att: AttributeData = new AttributeData(config.baseAttr.type, config.baseAttr.value);
			totalAttr.push(att);
		}

		this._equipPower = Math.floor(UserBag.getAttrPower(totalAttr));
		this._totalPower += this._equipPower + (config.exPower || 0);
		this._totalPower *= SubRoles.ins().subRolesLen;
		this.score.text = "评分：" + this._totalPower;

		while (this.nextForgeGroup.numElements) {
			this.nextForgeGroup.removeChildAt(0);
		}
		this.addTips(config, this.nextForgeGroup);

		this.background.height = this._bottomY + 12;
		// this.anigroup.height = this.background.height + 60;
		// this.anigroup.y = this.anigroup.height / 2 - this.background.height / 2;

		this.powerPanel0.setPower(this._totalPower);
	}

	/** 当前属性 **/
	private next: eui.Group;
	private setCurAttrs(data: any) {
		let itemConfig: ItemConfig = data.itemConfig;
		this._totalPower = 0;

		this.nameLabel.text = itemConfig.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(itemConfig);
		let q = ItemConfig.getQuality(itemConfig);
		this.quali.source = q > 0 ? `common1_tips_${q}` : "";
		this.itemIcon.setData(itemConfig);
		if (data instanceof ItemData || itemConfig != null) {
			if (data && ItemConfig.getType((<ItemData>data).itemConfig) == 5) {
				this.levelKey.text = itemConfig.zsLevel > 0 ? "转生：" : "等级：";
				this.type.text = Role.getHejiEquipNameByType(ItemConfig.getSubType(itemConfig));
				this.lv.text = itemConfig.zsLevel > 0 ? (itemConfig.zsLevel + "转") : (itemConfig.level + "级");
				if (itemConfig.zsLevel > 0) {
					this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
				}
				else {
					this.lv.textColor = Actor.level < (itemConfig.level || 1) ? 0xf3311e : 0x35e62d;
				}
			}
		}
		let ii = 1;
		this.attr1.visible = false;
		this.attr2.visible = false;
		this.attr3.visible = false;
		this.attr4.visible = false;
		let config = GlobalConfig.EquipConfig[data.configID];
		let totalAttr: AttributeData[] = [];
		this.score.visible = false;//必杀不显示评分
		if (data.att) {
			for (let k in AttributeData.translate) {
				if (!config[k] || config[k] <= 0) continue;
				let tempAtt: AttributeData = new AttributeData(AttributeData.translate[k], config[k]);
				for (let j in data.att) {
					if (data.att[j].type == tempAtt.type) {
						tempAtt.value += data.att[j].value;
						break;
					}
				}
				let attrStr = "";
				attrStr = AttributeData.getAttStrByType(tempAtt, 0, "  ");
				totalAttr.push(tempAtt);
				this['attr' + ii].text = attrStr;
				this['attr' + ii].visible = true;
				ii++;
			}
			this._bottomY = this['attr' + (ii - 1)].y + this['attr' + (ii - 1)].height;
		} else {
			for (let k in AttributeData.translate) {
				if (!config[k] || config[k] <= 0) continue;
				let tempAtt: AttributeData = new AttributeData(AttributeData.translate[k], config[k])
				let attrStr = "";
				// tempAtt.value = Math.floor(tempAtt.value * 1.15);
				attrStr = AttributeData.getAttStrByType(tempAtt, 0, "  ");
				totalAttr.push(tempAtt);
				this['attr' + ii].text = attrStr;
				this['attr' + ii].visible = true;
				ii++;
			}
			this._bottomY = this['attr' + (ii - 1)].y + this['attr' + (ii - 1)].height;
		}

		if (config.baseAttr) {
			let att: AttributeData = new AttributeData(config.baseAttr.type, config.baseAttr.value);
			totalAttr.push(att);
		}

		this._equipPower = Math.floor(UserBag.getAttrPower(totalAttr));
		this._totalPower += this._equipPower + (config.exPower || 0);
		this._totalPower *= SubRoles.ins().subRolesLen;
		this.score.text = "评分：" + this._totalPower;

		while (this.forgeGroup.numElements) {
			this.forgeGroup.removeChildAt(0);
		}
		this.addTips(config, this.forgeGroup);

		this.background.height = this._bottomY + 12;
		// this.anigroup.height = this.background.height + 60;
		// this.anigroup.y = this.anigroup.height / 2 - this.background.height / 2;

		this.powerPanel.setPower(this._totalPower);
		this.next.y = this._bottomY + 12;
	}
	private addTips(data: EquipConfig, forgeGroup: eui.Group): void {
		let titleAttrTxt: eui.Label = new eui.Label;
		let attrTxt: eui.Label = new eui.Label;

		if (data.baseAttr) {
			if (!titleAttrTxt.parent) this.createTitle(titleAttrTxt, attrTxt, forgeGroup);
			attrTxt.text += AttributeData.getAttStrByType(data.baseAttr, 1, "");
			this._bottomY = attrTxt.y + attrTxt.height;
		}
		if (data.exAttr1) {
			if (!titleAttrTxt.parent) this.createTitle(titleAttrTxt, attrTxt, forgeGroup);

			attrTxt.text += AttributeData.getExtAttStrByType(data.exAttr1, 1, "");
			this._bottomY = attrTxt.y + attrTxt.height;
		}

		if (data["exAttr2"]) {
			attrTxt.text = AttributeData.getExtAttStrByType(data["exAttr2"], 1, "");
			this._bottomY = attrTxt.y + attrTxt.height;
		}

		//只显示当前
		if (this.forgeGroup == forgeGroup) {
			let titlePunchAttrTxt: eui.Label = new eui.Label;
			let attrPunchTxt: eui.Label = new eui.Label;
			let pos: number = data.id % 10;
			let lv: number = UserSkill.ins().getPunchForge().getPunchLevel(pos - 1);
			let config: PunchEquipConfig = GlobalConfig.PunchEquipConfig[pos - 1][lv];
			if (config) {
				if (!titlePunchAttrTxt.parent) this.createTitle(titlePunchAttrTxt, attrPunchTxt, forgeGroup, "注灵属性");
				attrPunchTxt.text = AttributeData.getAttStr(config.attr, 1, 1, " ");
				this._bottomY = attrPunchTxt.y + attrPunchTxt.height;
			}
		}

	}

	private createTitle(titleAttrTxt: eui.Label, attrTxt: eui.Label, forgeGroup: eui.Group, title?: string): void {
		titleAttrTxt.fontFamily = "Arial";
		titleAttrTxt.size = 20;
		titleAttrTxt.textColor = 0x7e6437;
		titleAttrTxt.bold = true;
		titleAttrTxt.x = 24;
		titleAttrTxt.y = this._bottomY + 10 + 14;
		forgeGroup.addChild(titleAttrTxt);
		titleAttrTxt.text = title ? title : "极品属性";

		attrTxt.fontFamily = "Arial";
		attrTxt.size = 18;
		attrTxt.lineSpacing = 8;
		attrTxt.x = 46;
		attrTxt.y = titleAttrTxt.y + 24;
		attrTxt.textColor = 0xFF49F4;
		forgeGroup.addChild(attrTxt);
	}



}
ViewManager.ins().reg(HejiEquipTipsWin, LayerManager.UI_Popup);