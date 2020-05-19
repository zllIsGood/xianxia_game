const c_grewup = "升 级";
const c_mix = "合 成";
class OrangeEquipPanel extends BaseView {
	public equip0: eui.Component;
	public equip1: eui.Component;
	public equip2: eui.Component;
	public equip3: eui.Component;
	public equip4: eui.Component;
	public equip5: eui.Component;
	public equip6: eui.Component;
	public equip7: eui.Component;

	private mixPanel: eui.Component;
	private grewupPanel: eui.Component;

	private executeBtn: eui.Button;
	private getTreasureBtn: eui.Label;

	private costNum: eui.Group;
	private need: eui.Label;
	private cur: eui.Label;
	// private topLevel: eui.Label;
	private chargeEff1: MovieClip;

	private _roleId: number = 0;
	private curIndex: number;
	private curEquipConfigId: number;
	//满级提示文本
	private labelMax: eui.Label;
	private btnGroup: eui.Group;
	private effArr: MovieClip[];
	static defaultEquipIcon = [
		"common1_icon_wuqi",
		"common1_icon_toubu",
		"common1_icon_yifu",
		"common1_icon_xianglian",
		"common1_icon_huwan",
		"common1_icon_yaodai",
		"common1_icon_jiezhi",
		"common1_icon_xiezi",
	];
	constructor() {
		super();
		this.name = "神装";
		//this.skinName = "OrangeEquipSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	// public constructor() {
	// 	super();
	// 	this.name = "神装";
	// 	this.isTopLevel = true;
	// 	this.skinName = "OrangeEquipSkin";
	// }

	// public initUI(): void {
	// 	super.initUI();
	// 	this.init();
	// }

	public init() {
		this.curIndex = 0;
		this.getTreasureBtn.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.getTreasureBtn.text}</u></a>`);
		this.getTreasureBtn.touchEnabled = true;

		this.chargeEff1 = new MovieClip;
		this.chargeEff1.x = this.getTreasureBtn.x + this.getTreasureBtn.width / 2;
		this.chargeEff1.y = this.getTreasureBtn.y + this.getTreasureBtn.height / 2;
		this.chargeEff1.touchEnabled = false;
		this.chargeEff1.scaleY = 0.7;
		this.chargeEff1.scaleX = 1.1;
	}

	public open(...param: any[]): void {
		this.getTreasureBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.openSmeltView, this);
		for (let i = 0; i < 8; i++) {
			let equipItem = this["equip" + i];
			this.addTouchEvent(equipItem, this.onSelect);
			this.addTouchEvent(equipItem.mixBtn, this.onSelect);
		}
		this.addTouchEvent(this.executeBtn, this.executeCB);
		let userBag = UserBag.ins();
		this.observe(UserEquip.ins().postMixEquip, this.mixCB);
		this.observe(userBag.postItemAdd, this.updateView);//道具添加
		this.observe(userBag.postItemDel, this.updateView);//道具删除
		this.observe(userBag.postItemChange, this.updateView);//道具变更

		this.curIndex = this.computerCurIndex();
		this.updateView();

		this.effArr = [];
	}


	public close(...param: any[]): void {
		this.getTreasureBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.openSmeltView, this);

		for (let i = 0; i < 8; i++) {
			let equipItem = this["equip" + i];
			this.removeTouchEvent(equipItem, this.onSelect);
			this.removeTouchEvent(equipItem.mixBtn, this.onSelect);
		}
		DisplayUtils.removeFromParent(this.chargeEff1);
		this.removeTouchEvent(this.executeBtn, this.executeCB);
		this.removeObserve();
		this.cleanEff();
	}

	private onSelect(e: egret.TouchEvent): void {
		let level: number = Actor.level;
		switch (e.currentTarget) {
			case this.equip0:
			case this.equip0['mixBtn']:
				this.curIndex = 0;
				break;
			case this.equip1:
			case this.equip1['mixBtn']:
				this.curIndex = 1;
				break;
			case this.equip2:
			case this.equip2['mixBtn']:
				this.curIndex = 2;
				break;
			case this.equip3:
			case this.equip3['mixBtn']:
				this.curIndex = 3;
				break;
			case this.equip4:
			case this.equip4['mixBtn']:
				this.curIndex = 4;
				break;
			case this.equip5:
			case this.equip5['mixBtn']:
				this.curIndex = 5;
				break;
			case this.equip6:
			case this.equip6['mixBtn']:
				this.curIndex = 6;
				break;
			case this.equip7:
			case this.equip7['mixBtn']:
				this.curIndex = 7;
				break;
		}

		this.updateView();
	}

	private executeCB(e: egret.TouchEvent) {
		if (parseInt(this.cur.text) < parseInt(this.need.text.substr(1))) {
			UserTips.ins().showTips("|C:0xf3311e&T:神装碎片不足|");
			return;
		}

		if (this.executeBtn.label == c_grewup) {
			this.grewup();
		} else if (this.executeBtn.label == c_mix) {
			let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(this.curIndex);
			let configID = equipData.item.configID;
			let curItemData = GlobalConfig.ItemConfig[configID];

			if (curItemData != undefined && ItemConfig.getQuality(curItemData) == 5) {
				let config = GlobalConfig.ItemConfig[equipData.item.configID];
				let str = config.zsLevel > 0 ? (config.zsLevel + "转") : (config.level + "级");
				let color: string = ItemConfig.getQualityColor(config).toString(16);
				WarnWin.show(`当前部位上已穿着<font color="#${color}">${str}传奇装备</font>，是否继续合成红色装备？\n`, () => {
					this.mix();
				}, this);
			} else {
				this.mix();
			}
		}
	}

	private grewup(): void {  //满级时按钮会消失，不用验证了
		let nextEquipConfig = GlobalConfig.ItemConfig[this.curEquipConfigId + 1];
		if (nextEquipConfig.level > Actor.level || nextEquipConfig.zsLevel > UserZs.ins().lv) {
			UserTips.ins().showTips("|C:0xf3311e&T:升级后超过角色等级，无法升级|");
			return;
		}

		UserEquip.ins().sendGrewupEquip(this._roleId, this.curIndex);
	}

	private grewupCB(roleId, result, configID) {
		if (result == 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:升级失败|");
			return;
		}

		UserTips.ins().showTips("升级成功");
		this.updateView();
	}

	private mix() {
		UserEquip.ins().sendMixEquip(this._roleId, this.curEquipConfigId, this.curIndex);
	}

	private mixCB(roleId, result, configID) {
		if (result == 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:合成失败|");
			return;
		}

		UserTips.ins().showTips("合成成功,已自动穿戴至角色身上");
		this.updateView();
	}

	private openSmeltView(e: egret.TouchEvent) {
		ViewManager.ins().open(BreakDownView, BreakDownView.type_legend, 4);
	}

	private updateView() {
		this.updateAllEquipItem();
		this.updateDetailPanel();


		if (!UserBag.ins().getLegendHasResolve()) {
			this.chargeEff1.visible = false;
			DisplayUtils.removeFromParent(this.chargeEff1);
		} else {
			this.chargeEff1.visible = true;
			this.chargeEff1.playFile(RES_DIR_EFF + "chargeff1", -1);
			if (!this.chargeEff1.parent) this.btnGroup.addChild(this.chargeEff1);
		}

		this.setItemRedPoint();
	}


	private updateDetailPanel() {
		let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(this.curIndex);
		if (equipData == null) return;
		let nextEquipData = GlobalConfig.ItemConfig[equipData.item.configID + 1];
		let needNum = 0;
		let costID = 0;
		this.costNum.visible = true;
		let q = ItemConfig.getQuality(equipData.item.itemConfig);
		if (nextEquipData == undefined && equipData.item.handle != 0 && q == 4) {//满级
			this.mixPanel.visible = true;
			this.labelMax.visible = true;
			this.grewupPanel.visible = false;
			this.curEquipConfigId = this.updateMixPanel();
			// this.topLevel.visible = true;
			this.executeBtn.visible = false;

			this.need.text = "";
			this.cur.text = "";
			this.costNum.visible = false;
		} else {
			if (nextEquipData != undefined && equipData.item.handle != 0 && q == 4 && equipData.item.itemConfig.level != 1 && UserBag.fitleEquip.indexOf(equipData.item.configID) == -1) {
				this.mixPanel.visible = false;
				this.grewupPanel.visible = true;
				this.curEquipConfigId = this.updateGrewupPanel();

				this.executeBtn.label = c_grewup;
				let grewupConfig = GlobalConfig.LegendLevelupConfig[this.curEquipConfigId];
				if (grewupConfig) {
					needNum = grewupConfig.count;
					costID = grewupConfig.itemId;
				}

			} else {
				this.mixPanel.visible = true;
				this.grewupPanel.visible = false;
				this.curEquipConfigId = this.updateMixPanel();

				this.executeBtn.label = c_mix;
				let mixConfig = GlobalConfig.LegendComposeConfig[this.curEquipConfigId];
				if (mixConfig) {
					needNum = mixConfig.count;
					costID = mixConfig.itemId;
				}

			}
			let curNum = UserBag.ins().getItemCountById(0, costID);
			this.need.text = "/" + needNum;
			this.cur.text = curNum + "";

			if (curNum >= needNum) {
				this.cur.textColor = ColorUtil.GREEN_COLOR_N;
			} else {
				this.cur.textColor = ColorUtil.RED_COLOR_N;
			}

			// this.topLevel.visible = false;
			this.executeBtn.visible = true;
			this.labelMax.visible = false;
		}
	}

	private updateMixPanel(): number {
		let level = Actor.level;
		let itemData: ItemConfig;
		let configID: any;
		if (level >= 1) {
			// let id = "1";
			let pos = this.curIndex;
			// if (pos == 4 || pos == 5)
			// 	pos = 4;
			// if (pos == 6 || pos == 7)
			// 	pos = 5;
			let subRoles = SubRoles.ins();
			let role: Role = subRoles.getSubRoleByIndex(this._roleId);
			configID = UserEquip.ins().getEquipConfigIDByPosAndQualityByGod(role, pos, 4, subRoles.getSubRoleByIndex(this._roleId).job);
			// configID = UserEquip.ins().getEquipConfigIDByPosAndQuality(pos, 4, SubRoles.ins().getSubRoleByIndex(this._roleId).job);
			itemData = GlobalConfig.ItemConfig[configID];
		}

		if (itemData != undefined) {
			if (itemData.zsLevel > 0) {
				this.mixPanel['level'].text = itemData.zsLevel + "转";
			} else {
				this.mixPanel['level'].text = itemData.level ? `Lv.${itemData.level}` : `Lv.1`;
			}

			this.mixPanel['equipName'].text = itemData.name;
			(this.mixPanel['itemIcon'] as ItemIcon).imgJob.visible = false;
			(this.mixPanel['itemIcon'] as ItemIcon).setData(itemData);
		}

		// detail
		let nameList: string[] = [];
		let baseAttrList: string[] = [];
		let randAttrList: string[] = [];

		let config = GlobalConfig.EquipConfig[configID];
		for (let k in AttributeData.translate) {
			if (!config[k] || config[k] <= 0)
				continue;

			baseAttrList.push(config[k] + "");
			nameList.push(AttributeData.getAttrStrByType(AttributeData.translate[k]));
			randAttrList.push(" +" + Math.floor(ItemBase.additionRange * config[k] / 100));
		}


		this.mixPanel['attributes'].baseAttr.text = ItemData.getStringByNextList(baseAttrList, randAttrList);
		this.mixPanel['attributes'].randAttr.text = "";//ItemData.getStringByList(randAttrList);
		this.mixPanel['attributes'].nameAttr.text = ItemData.getStringByList(nameList);
		this.mixPanel['attributes'].score.text = ItemConfig.pointCalNumber(itemData);

		return configID;
	}

	private updateGrewupPanel(): number {
		let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(this.curIndex);
		let configID = equipData.item.configID;
		let curItemData = GlobalConfig.ItemConfig[configID];
		let nextItemData = GlobalConfig.ItemConfig[configID + 1];

		if (nextItemData == undefined) { // 满级

		} else {
			this.grewupPanel['curName'].text = curItemData.name + "";
			this.grewupPanel['nextName'].text = nextItemData.name + "";
			if (curItemData.zsLevel > 0) {
				this.grewupPanel['curLevel'].text = curItemData.zsLevel + "转";
			} else {
				this.grewupPanel['curLevel'].text = curItemData.level ? `Lv.${curItemData.level}` : `Lv.1`;
			}
			if (nextItemData.zsLevel > 0) {
				this.grewupPanel['nextLevel'].text = nextItemData.zsLevel + "转";
			} else {
				this.grewupPanel['nextLevel'].text = nextItemData.level ? `Lv.${nextItemData.level}` : `Lv.1`;
			}

			(this.grewupPanel['curItemIcon'] as ItemIcon).imgJob.visible = false;
			(this.grewupPanel['nextItemIcon'] as ItemIcon).imgJob.visible = false;
			(this.grewupPanel['curItemIcon'] as ItemIcon).setData(curItemData);
			(this.grewupPanel['nextItemIcon'] as ItemIcon).setData(nextItemData);

			for (let i = 1; i <= 4; i++) {
				this.grewupPanel['attributes']["arrow" + i].visible = false;
			}

			let nameList: string[] = [];
			let baseAttrList: string[] = [];
			let randAttrList: string[] = [];
			let nextBaseAttrList: string[] = [];
			let nextRandAttrList: string[] = [];

			let curEquipData = GlobalConfig.EquipConfig[configID];
			let nextEquipData = GlobalConfig.EquipConfig[configID + 1];
			let data = equipData.item;
			let ii = 1;
			for (let k in AttributeData.translate) {
				if (!nextEquipData || !curEquipData || !curEquipData[k] || curEquipData[k] <= 0)
					continue;

				if (data != undefined) {
					let attr = data.att;
					for (let index = 0; index < attr.length; index++) {
						if (attr[index].type == AttributeData.translate[k]) {
							randAttrList.push(' +' + attr[index].value);
							break;
						}
					}
				}

				this.grewupPanel['attributes']["arrow" + ii].visible = true;
				ii++;
				baseAttrList.push(curEquipData[k] + "");
				nextBaseAttrList.push(nextEquipData[k] + "");
				nextRandAttrList.push(" +" + Math.floor(ItemBase.additionRange * nextEquipData[k] / 100));
				nameList.push(AttributeData.getAttrStrByType(AttributeData.translate[k]));
			}

			this.grewupPanel['attributes'].curBaseAttr.text = ItemData.getStringByNextList(baseAttrList, randAttrList);
			this.grewupPanel['attributes'].nextBaseAttr.text = ItemData.getStringByNextList(nextBaseAttrList, nextRandAttrList);
			this.grewupPanel['attributes'].nameAttr.text = ItemData.getStringByList(nameList);
			this.grewupPanel['attributes'].curScore.text = "评分：" + ItemConfig.pointCalNumber(curItemData);
			this.grewupPanel['attributes'].nextScore.text = "评分：" + ItemConfig.pointCalNumber(nextItemData);
		}

		return configID;
	}

	private updateAllEquipItem() {
		for (let i = 0; i < 8; i++) {
			this.updateEquipItem(i);
		}
	}

	private updateEquipItem(index) {
		let equipItem = this["equip" + index];
		if (equipItem == null) return;
		let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(index);
		let itemIcon: ItemIcon = equipItem.itemIcon;
		itemIcon.imgJob.visible = false;

		if (UserBag.fitleEquip.indexOf(equipData.item.configID) != -1 || equipData.item.handle == 0 || ItemConfig.getQuality(equipData.item.itemConfig) < 4 || (equipData.item.itemConfig.level == 1 && !equipData.item.itemConfig.zsLevel)) {
			itemIcon.setData(null);
			itemIcon.imgIcon.source = OrangeEquipPanel.defaultEquipIcon[index];
			equipItem.level.text = "";
			equipItem.mixBtn.visible = false;
			this.cleanEffOnly(index);
		} else {
			equipItem.mixBtn.visible = false;
			if (equipData.item.itemConfig.zsLevel > 0) {
				equipItem.level.text = equipData.item.itemConfig.zsLevel + "转";
			} else {
				equipItem.level.text = equipData.item.itemConfig.level ? `Lv.${equipData.item.itemConfig.level}` : `Lv.1`;
			}
			itemIcon.setData(equipData.item.itemConfig);
			this.playEff(index);
		}

		if (this.curIndex == index) {
			equipItem.select.visible = true;
		} else {
			equipItem.select.visible = false;
		}
	}

	private playEff(index) {
		if (index < 0 || index > 7)
			return;

		let i = index;
		if (!this["effArr" + i]) {
			this["effArr" + i] = new MovieClip();
			this["effArr" + i].x += this["equip" + i].width / 2;
			this["effArr" + i].y += this["equip" + i].height / 2 - 12;
			this["equip" + i].addChild(this["effArr" + i]);
			this["effArr" + i].playFile(RES_DIR_EFF + "quality_05", -1);
		}
	}
	private cleanEffOnly(index) {
		if (index < 0 || index > 7)
			return;
		let i = index;
		if (this["effArr" + i]) {
			DisplayUtils.removeFromParent(this["effArr" + i]);
			this["effArr" + i] = null;
		}
	}

	private cleanEff() {
		for (let i = 0; i < 8; i++) {
			if (!this["effArr" + i])
				continue;
			DisplayUtils.removeFromParent(this["effArr" + i]);
			this["effArr" + i] = null;
		}
	}

	private setItemRedPoint(): void {
		for (let i = 0; i < 8; i++) {
			let equipItem: eui.Component = this["equip" + i];
			let role: Role = SubRoles.ins().getSubRoleByIndex(this._roleId);
			equipItem["redPoint"].visible = UserEquip.ins().setOrangeEquipItemState(i, role);
			if (equipItem["redPoint"].visible) {
				let b = UserBag.ins().checkEqRedPoint(i, role, true);
				equipItem["redPoint"].visible = b != null ? b : equipItem["redPoint"].visible;
			}
		}
	}

	private computerCurIndex() {

		return 0;
	}


	public setRoleId(id: number) {
		this._roleId = id;
		this.updateView();
	}

}
// ViewManager.ins().reg(OrangeEquipPanel, LayerManager.UI_Main);

