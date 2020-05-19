/**
 *
 * @author hepeiye
 *
 */

class LegendEquipPanel extends BaseView {
	private mixAttributes: eui.Component;
	private grewupAttributes: eui.Component;

	private executeBtn: eui.Button;
	private mixSwordBtn: eui.Button;
	private mixArmorBtn: eui.Button;
	private swordLevel: eui.Label;  //转身等级
	// private nextLevel: eui.Label;  //转身等级
	private armorLevel: eui.Label;  //转身等级
	private need: eui.Label;
	private cur: eui.Label;
	private topLevel: eui.Label;
	private getTreasureBtn: eui.Label;

	/**武器选中 */
	private swordSelect: eui.Image;
	private armorSelect: eui.Image;
	private armorIcon: eui.Image;
	private swordIcon: eui.Image;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;

	private _roleId: number = 0;
	private curIndex: number;
	private curEquipConfigId: number;
	// private zhanshi: eui.Image;
	// static swrodImg = ["chuanqi_0_png", "101501"];
	// static armorImg = ["chuanqi_1_png", "121501"];
	private costGroup: eui.Group;
	private effGroup: eui.Group;
	private bgMc: eui.Image;

	private legendMc: MovieClip;

	private legendMc1: MovieClip;
	private legendMc2: MovieClip;

	private legend1: eui.Image;
	private legend2: eui.Image;
	public weaponEffect: eui.Group;
	public bodyEffect: eui.Group;
	// public wPos0:eui.Image;
	// public wPos1:eui.Image;
	// public bPos0:eui.Image;
	// public bPos1:eui.Image;



	private _weaponEffect: MovieClip;
	private _bodyEffect: MovieClip;

	private chargeEff1: MovieClip;
	constructor() {
		super();
		// this.skinName = 'LegendEquipSkin'
	}

	public childrenCreated(): void {
		this.init();
	}


	public init(): void {
		this.curIndex = 0;  //0武器，2甲
		this.getTreasureBtn.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.getTreasureBtn.text}</u></a>`);
		this.getTreasureBtn.touchEnabled = true;

		this.legendMc = new MovieClip;
		this.legendMc1 = new MovieClip;
		this.legendMc2 = new MovieClip;

		this.chargeEff1 = new MovieClip;
		this.chargeEff1.x = this.getTreasureBtn.x + this.getTreasureBtn.width / 2;
		this.chargeEff1.y = this.getTreasureBtn.y + this.getTreasureBtn.height / 2;
		this.chargeEff1.touchEnabled = false;
		this.chargeEff1.scaleY = 0.7;
		this.chargeEff1.scaleX = 0.9;

		this._weaponEffect = new MovieClip();
		this._bodyEffect = new MovieClip();
	}

	public open(...param: any[]): void {
		this.legendMc.playFile(RES_DIR_EFF + "artifacteff", -1);
		this.bodyEffect.addChild(this.legendMc);
		this.legendMc1.playFile(RES_DIR_EFF + "chuanqizbeff", -1);
		this.legendMc1.x = this.legend1.x + this.legend1.width / 2 + 7;
		this.legendMc1.y = this.legend1.y + this.legend1.height / 2 + 7;
		this.legendMc1.scaleX = this.legendMc1.scaleY = 1.4;
		this.addChild(this.legendMc1);
		this.legendMc2.playFile(RES_DIR_EFF + "chuanqizbeff", -1);
		this.legendMc2.x = this.legend2.x + this.legend2.width / 2 + 7;
		this.legendMc2.y = this.legend2.y + this.legend2.height / 2 + 7;
		this.legendMc2.scaleX = this.legendMc2.scaleY = 1.4;
		this.addChild(this.legendMc2);
		this.getTreasureBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.openSmeltView, this);
		this.addTouchEvent(this.mixSwordBtn, this.onSelect);
		this.addTouchEvent(this.mixArmorBtn, this.onSelect);
		this.addTouchEvent(this.armorIcon, this.onSelect);
		this.addTouchEvent(this.swordIcon, this.onSelect);
		this.addTouchEvent(this.executeBtn, this.executeCB);

		this.observe(UserEquip.ins().postMixGodEquip, this.mixCB);
		this.observe(UserBag.ins().postItemAdd, this.updateView);//道具添加
		this.observe(UserBag.ins().postItemDel, this.updateView);//道具删除
		this.observe(UserBag.ins().postItemChange, this.updateView);//道具变更
		this.observe(GameLogic.ins().postChildRole, this.updateSubRoleChange);//子角色变更
		TimerManager.ins().doTimer(2000, 0, this.mcChange, this);
		this.updateView();
	}

	public close(...param: any[]): void {
		this.getTreasureBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.openSmeltView, this);
		this.removeTouchEvent(this.mixSwordBtn, this.onSelect);
		this.removeTouchEvent(this.mixArmorBtn, this.onSelect);
		this.removeTouchEvent(this.armorIcon, this.onSelect);
		this.removeTouchEvent(this.swordIcon, this.onSelect);
		this.removeTouchEvent(this.executeBtn, this.executeCB);
		TimerManager.ins().remove(this.mcChange, this);
		this.removeObserve();
		DisplayUtils.removeFromParent(this.legendMc);
		DisplayUtils.removeFromParent(this.legendMc1);
		DisplayUtils.removeFromParent(this.legendMc2);
		DisplayUtils.removeFromParent(this._weaponEffect);
		DisplayUtils.removeFromParent(this._bodyEffect);
	}

	private mcChange(): void {
		egret.Tween.removeTweens(this.bgMc);
		let tween: egret.Tween = egret.Tween.get(this.bgMc);
		tween.to({ "alpha": 0 }, 1000).to({ "alpha": 1 }, 1000);
	}

	private executeCB(e: egret.TouchEvent) {
		if (parseInt(this.cur.text) < parseInt(this.need.text.substr(1))) {
			UserTips.ins().showTips("|C:0xf3311e&T:焚天碎片不足|");
			return;
		}

		if (this.executeBtn.label == c_grewup) {
			this.grewup();
		} else if (this.executeBtn.label == c_mix) {
			this.mix();
		}
	}

	private grewup() {  //满级时按钮会消失，不用验证了
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
		// let id = UserEquip.ins().getEquipConfigIDByPosAndQuality(this.curIndex, 5);
		let id = UserEquip.ins().getEquipConfigIDByPosAndQualityByLegend(this._roleId, this.curIndex, 5);
		let config = GlobalConfig.ItemConfig[id];
		if (config.level <= Actor.level && config.zsLevel <= UserZs.ins().lv) {
			UserEquip.ins().sendMixEquip(this._roleId, this.curEquipConfigId, this.curIndex);
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:等级不满足，无法合成|");
		}

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
		ViewManager.ins().open(BreakDownView, BreakDownView.type_legend, 5);
	}

	private onSelect(e: egret.TouchEvent): void {
		let level: number = Actor.level;
		switch (e.currentTarget) {
			case this.mixSwordBtn:
			case this.swordIcon:
				this.curIndex = 0;
				break;
			case this.mixArmorBtn:
			case this.armorIcon:
				this.curIndex = 2;
				break;
		}

		this.updateView();
	}

	public setRoleId(id: number) {
		this._roleId = id;
		let role: Role = SubRoles.ins().getSubRoleByIndex(this._roleId);
		let equipData0 = role.getEquipByIndex(0);
		let equipData2 = role.getEquipByIndex(2);
		if (equipData0 && this.checkQuality(equipData0)) {
			//默认选择有装备的
			this.curIndex = 0;
		}
		else if (equipData2 && this.checkQuality(equipData2)) {
			this.curIndex = 2;
		}
		this.updateView();
	}

	private updateView() {
		this.updateAttrPanel();
		this.updateIconAndDesc();

		// if (!UserEquip.ins().checkRedPoint(5)) {
		// 	this.chargeEff1.visible = false;
		// } else {
		// 	this.chargeEff1.visible = true;
		// 	this.chargeEff1.playFile(RES_DIR_EFF + "chargeff1", -1);
		// 	this.addChild(this.chargeEff1);
		// }
		let red: boolean = this.setRedPoint();
		if (red) {
			this.setEff();
		}
	}
	private setEff() {
		let itemData: ItemData[] = UserBag.ins().getLegendOutEquips();
		if (!itemData.length) {
			DisplayUtils.removeFromParent(this.chargeEff1);
		} else {
			this.chargeEff1.playFile(RES_DIR_EFF + "chargeff1", -1);
			if (!this.chargeEff1.parent) this.getTreasureBtn.parent.addChild(this.chargeEff1);
		}
	}

	/** 子角色变更 */
	private updateSubRoleChange(): void {
		let red: boolean = this.setRedPoint();
		if (red) {
			this.setEff();
		}
	}

	private checkQuality(data: EquipsData): boolean {
		let rtn = false;
		if (data && data.item && data.item.itemConfig) {
			rtn = (ItemConfig.getQuality(data.item.itemConfig) == 5)
		}
		return rtn
	}

	//更新属性面板
	private updateAttrPanel() {
		let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(this.curIndex);
		let nextEquipData = GlobalConfig.ItemConfig[equipData.item.configID + 1];
		let needNum = 0;
		let costID = 0;

		let q = ItemConfig.getQuality(equipData.item.itemConfig);
		if (nextEquipData == undefined && equipData.item.handle != 0 && q == 5) {//满级
			this.mixAttributes.visible = true;
			this.grewupAttributes.visible = false;
			this.curEquipConfigId = this.updateMixPanel();
			this.topLevel.visible = true;
			this.costGroup.visible = false;
			this.executeBtn.visible = false;

			this.need.text = "";
			this.cur.text = "";
		} else {
			if (nextEquipData != undefined && equipData.item.handle != 0 && q == 5) {
				this.mixAttributes.visible = false;
				this.grewupAttributes.visible = true;
				this.curEquipConfigId = this.updateGrewupPanel();

				this.executeBtn.label = c_grewup;
				let grewupConfig = GlobalConfig.LegendLevelupConfig[this.curEquipConfigId];
				needNum = grewupConfig.count;
				costID = grewupConfig.itemId;
			} else {
				this.mixAttributes.visible = true;
				this.grewupAttributes.visible = false;
				this.curEquipConfigId = this.updateMixPanel();

				if (this.curEquipConfigId == null) return;

				this.executeBtn.label = c_mix;
				let mixConfig = GlobalConfig.LegendComposeConfig[this.curEquipConfigId];
				needNum = mixConfig.count;
				costID = mixConfig.itemId;
			}

			this.executeBtn.visible = true;
			this.topLevel.visible = false;
			this.costGroup.visible = true;
			let curNum = UserBag.ins().getItemCountById(0, costID);
			this.need.text = "/" + needNum;
			this.cur.text = curNum + "";

			if (curNum >= needNum) {
				this.cur.textColor = ColorUtil.GREEN_COLOR_N;
			} else {
				this.cur.textColor = ColorUtil.RED_COLOR_N;
			}
		}
	}

	private updateMixPanel() {
		let level = Actor.level;
		if (level < 10) {
			debug.log("error: 10级开启");
			return;
		}

		// let configID = UserEquip.ins().getEquipConfigIDByPosAndQuality(this.curIndex, 5);
		let configID = UserEquip.ins().getEquipConfigIDByPosAndQualityByLegend(this._roleId, this.curIndex, 5);

		let config = GlobalConfig.EquipConfig[configID];
		if (!config) return;
		// detail
		let nameList: string[] = [];
		let baseAttrList: string[] = [];
		let randAttrList: string[] = [];

		// let config = GlobalConfig.EquipConfig[configID];

		for (let k in AttributeData.translate) {
			if (!config[k] || config[k] <= 0)
				continue;

			baseAttrList.push(config[k] + "");
			nameList.push(AttributeData.getAttrStrByType(AttributeData.translate[k]));
			randAttrList.push(" +" + Math.floor(ItemBase.additionRange / 100 * config[k]));
		}


		this.mixAttributes['baseAttr'].text = ItemData.getStringByNextList(baseAttrList, randAttrList);
		this.mixAttributes['nameAttr'].text = ItemData.getStringByList(nameList);
		this.mixAttributes['randAttr'].text = ""//ItemData.getStringByList(randAttrList);
		this.mixAttributes['score'].text = ItemConfig.pointCalNumber(GlobalConfig.ItemConfig[configID]);

		return configID;
	}

	private updateGrewupPanel() {
		let equipData = SubRoles.ins().getSubRoleByIndex(this._roleId).getEquipByIndex(this.curIndex);
		let configID = equipData.item.configID;
		let curItemData = GlobalConfig.ItemConfig[configID];
		let nextItemData = GlobalConfig.ItemConfig[configID + 1];

		if (nextItemData == undefined) { // 满级

		} else {
			for (let i = 1; i <= 4; i++) {
				this.grewupAttributes["arrow" + i].visible = false;
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
				this.grewupAttributes["arrow" + ii].visible = true;
				ii++;
				baseAttrList.push(curEquipData[k] + "");
				nextBaseAttrList.push(nextEquipData[k] + "");
				nextRandAttrList.push(" +" + Math.floor(ItemBase.additionRange / 100 * nextEquipData[k]));
				nameList.push(AttributeData.getAttrStrByType(AttributeData.translate[k]));
			}


			this.grewupAttributes['curBaseAttr'].text = ItemData.getStringByNextList(baseAttrList, randAttrList);
			this.grewupAttributes['nextBaseAttr'].text = ItemData.getStringByNextList(nextBaseAttrList, nextRandAttrList);
			this.grewupAttributes['nameAttr'].text = ItemData.getStringByList(nameList);
			this.grewupAttributes['curScore'].text = "评分：" + ItemConfig.pointCalNumber(curItemData);
			this.grewupAttributes['nextScore'].text = "评分：" + ItemConfig.pointCalNumber(nextItemData);
		}

		return configID;
	}

	private updateIconAndDesc() {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this._roleId);
		// let equipsData = .equipsData;
		let equipData0 = role.getEquipByIndex(0);
		let equipData2 = role.getEquipByIndex(2);

		// this.arrow.visible = false;
		// this.nextLevel.visible = false;

		if (this.curIndex == 0) {  //选标
			this.swordSelect.visible = true;
			this.armorSelect.visible = false;
			//this.zhanshi.source = LegendEquipPanel.swrodImg[0];
			// this.zhanshi.source = null;
			this.currentState = 'jian';
			// this.setWeaponEffect(equipData0.item.configID, "wPos", role.sex, this.weaponEffect, this._weaponEffect);
			this.setWeaponEffect(this.weaponEffect, this._weaponEffect);
			this._bodyEffect.parent && this._bodyEffect.parent.removeChild(this._bodyEffect);

		} else {
			this.swordSelect.visible = false;
			this.armorSelect.visible = true;
			// this.zhanshi.source = LegendEquipPanel.armorImg[0];
			this.currentState = 'jia';
			// this.setWeaponEffect(equipData2.item.configID, "bPos", role.sex, this.bodyEffect, this._bodyEffect, 2);
			this.setWeaponEffect(this.bodyEffect, this._bodyEffect, 2);
			this._weaponEffect.parent && this._weaponEffect.parent.removeChild(this._weaponEffect);
		}

		this.updateItem(equipData0, this.swordIcon, this.swordLevel, this.mixSwordBtn);
		this.updateItem(equipData2, this.armorIcon, this.armorLevel, this.mixArmorBtn, 2);
	}

	private updateItem(equipData: EquipsData, icon: eui.Image, levelLabel: eui.Label, mixBtn: eui.Button, pos?: number) {
		// let zhuan = GlobalConfig.ItemConfig[UserEquip.ins().getEquipConfigIDByPosAndQuality(this.curIndex, 5)].zsLevel;
		let curPos: number = pos ? pos : this.curIndex;
		let zhuan = GlobalConfig.ItemConfig[UserEquip.ins().getEquipConfigIDByPosAndQualityByLegend(this._roleId, curPos, 5)].zsLevel;

		if (equipData.item.handle != 0 && ItemConfig.getQuality(equipData.item.itemConfig) == 5) {
			let itemConfig = GlobalConfig.ItemConfig[equipData.item.configID];
			mixBtn.visible = false;
			levelLabel.text = itemConfig.zsLevel + "转";
			let nextItem;
			for (let i = this.curEquipConfigId; i % 100 != 99; i++) {
				nextItem = GlobalConfig.ItemConfig[this.curEquipConfigId + 1];
				if (nextItem != undefined) {
					break;
				}
			}
			if (curPos == ItemConfig.getSubType(equipData.item.itemConfig) && nextItem != undefined) { //升级相关
				levelLabel.x = mixBtn.x + 15 - levelLabel.width / 2;
			} else {
				levelLabel.x = mixBtn.x + 15;
			}
		} else {
			mixBtn.visible = false;
			levelLabel.text = zhuan + "转";
			levelLabel.x = mixBtn.x + 15;
		}
	}

	public setRedPoint(): boolean {
		let showRed: boolean = false;
		let boo: boolean = false;
		for (let i = 0; i < 2; i++) {
			boo = UserEquip.ins().setLegendEquipItemUpState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(this._roleId));
			boo = UserEquip.ins().setLegendEquipItemState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(this._roleId)) || boo;
			if (this["redPoint" + i]) this["redPoint" + i].visible = boo;
			if (!showRed)
				showRed = boo;
			//可分解也显示红点
			if (!showRed) {
				let itemData: ItemData[] = UserBag.ins().getLegendOutEquips();
				showRed = itemData.length > 0;
			}

		}
		return showRed;
	}

	/** 设置武器模型和服装特效 */
	// private setWeaponEffect(id: number, posStr:string, sex: number, group:eui.Group , suitEff: MovieClip, pos:number = 0):void
	// {
	//     let cfg:EquipWithEffConfig = GlobalConfig.EquipWithEffConfig[id + "_" + sex];
	// 	let showFirst:boolean = false;
	// 	if (!cfg)
	// 	{
	// 		cfg = GlobalConfig.EquipWithEffConfig[(pos == 0 ? LegendEquipPanel.swrodImg[1] : LegendEquipPanel.armorImg[1])  + "_" + sex];
	// 		showFirst = true;
	// 	}

	//    	suitEff.scaleX = suitEff.scaleY = cfg.scaling;
	// 	suitEff.x = this[posStr + sex].x;
	// 	suitEff.y = this[posStr + sex].y;
	// 	if (!suitEff.parent)
	//         group.addChild(suitEff);

	// 	suitEff.playFile(RES_DIR_EFF + (showFirst ? cfg.inShowEff : cfg.nextShowEff), -1);

	// }
	private setWeaponEffect(group: eui.Group, suitEff: MovieClip, pos: number = 0): void {

		if (!suitEff.parent)
			group.addChild(suitEff);

		suitEff.playFile(`${RES_DIR_EFF}${["sword", "", "loricae"][pos]}`, -1);

	}
}
