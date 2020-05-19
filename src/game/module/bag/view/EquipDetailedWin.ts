/**
 *
 * @author hepeiye
 *
 */
class EquipDetailedWin extends BaseEuiView {
	private group: eui.Group;
	private forgeGroup: eui.Group;
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
	private jobGroup: eui.Group;
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
	private quali: eui.Image;
	private bgClose: eui.Image;
	private _score: number;

	constructor() {
		super();
		this.skinName = "EquipTipsSkin";
		// this.setSkinPart("powerPanel", new PowerPanel());
	}


	public initUI(): void {
		super.initUI();
		// this.totalPower = BitmapNumber.ins().createNumPic(0, "8");
		// this.totalPower.x = 70;
		// this.totalPower.y = 10;
		// this.powerGroup.addChild(this.totalPower);
		this.powerPanel.setBgVis(false);
		this.itemIcon.imgJob.visible = false;
	}

	/**这个参数是觉醒属性预览顶级的等级（因为这个类历史耦合度太高，基本重写不了了，只能这样了 */
	private awakenLv;
	public open(...param: any[]): void {
		let type: number = param[0];

		let handle: number = param[1];
		let configID: number = param[2];
		let data = param[3];

		this.roleModel = param[4];
		if (param[5] >= 0) {
			this.curRole = param[5];
			this.index = param[6];
			this.changeBtn.visible = true;
		} else {
			this.changeBtn.visible = false;
		}
		this.awakenLv = param[7];
		// this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEndEvent(this.bgClose, this.otherClose)
		this.addTouchEndEvent(this.changeBtn, this.onEquipChange)
		this.setData(type, handle, configID, data);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(EquipDetailedWin);
	}

	private onEquipChange(e: egret.Event): void {
		ViewManager.ins().open(RoleChooseEquipWin, this.curRole, this.index);
		ViewManager.ins().close(EquipDetailedWin);
	}

	private totalAttr: AttributeData[];
	private setData(type: number, handle: number, configID: number, _data?: any): void {
		let data = _data instanceof ItemData ? _data : undefined;
		let itemConfig: ItemConfig;
		this._totalPower = 0;
		if (handle != undefined && data == undefined) {
			data = UserBag.ins().getItemByHandle(type, handle);
			if (!data) {  //检查是否在身上
				let len: number = SubRoles.ins().subRolesLen;
				for (let i: number = 0; i < len; i++) {
					let role: Role = SubRoles.ins().getSubRoleByIndex(i);
					let equipLen: number = role.getEquipLen();
					for (let kk: number = 0; kk < equipLen; kk++) {
						if (role.getEquipByIndex(kk).item.handle == (handle)) {
							data = role.getEquipByIndex(kk).item;
							break;
						}
					}
				}

			}

			if (!data) {//检查是否在商店
				let shopData: ShopData = Shop.ins().shopData;
				let len: number = shopData.getShopEquipDataLength();
				let sed: ShopEquipData = null;
				for (let i: number = 0; i < len; i++) {
					sed = shopData.getShopEquipDataByIndex(i);
					if (sed != null) {
						if (handle == sed.item.handle) {
							data = sed.item;
							break;
						}
					}
				}
			}

			if (!data) {
				new Error("请检查handle是否传错！");
			}

			itemConfig = data.itemConfig;
			configID = data.configID;
		} else
			itemConfig = GlobalConfig.ItemConfig[configID];


		this.nameLabel.text = itemConfig.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(itemConfig);
		let q = ItemConfig.getQuality(itemConfig);
		let subType = ItemConfig.getSubType(itemConfig);
		let job = ItemConfig.getJob(itemConfig);
		this.quali.source = `common1_tips_${q}`;
		this.itemIcon.setData(itemConfig);
		let exPower: number = 0;
		if (data instanceof ItemData || itemConfig != null) {
			if (data && ItemConfig.getType((<ItemData>data).itemConfig) == 4) {
				this.levelKey.text = "需求：";
				this.type.text = Role.getWingEquipNameByType(subType);
				this.lv.text = itemConfig.level + 1 + "阶羽翼可穿戴";
				this.lv.textColor = 0xf3311e;
				let len: number = SubRoles.ins().subRolesLen;
				for (let i: number = 0; i < len; i++) {
					if (SubRoles.ins().getSubRoleByIndex(i).wingsData.lv >= itemConfig.level) {
						this.lv.textColor = 0x35e62d;
						break;
					}
				}
				this.career.text = Role.getJobNameByJob(job);
				this.jobGroup.visible = true;
			} else if (data && ItemConfig.getType((<ItemData>data).itemConfig) == 5) {
				this.levelKey.text = itemConfig.zsLevel > 0 ? "转生：" : "等级：";
				this.type.text = Role.getHejiEquipNameByType(subType);
				this.lv.text = isNaN(itemConfig.zsLevel) ? ((itemConfig.level || 1) + "级") : (itemConfig.zsLevel + "转");
				if (itemConfig.zsLevel > 0) {
					this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
				}
				else {
					this.lv.textColor = Actor.level < itemConfig.level ? 0xf3311e : 0x35e62d;
				}
				this.jobGroup.visible = false;
				if (UserBag.fitleEquip.indexOf(itemConfig.id) != -1) {
					this.lv.text = "无级别";
				}
			}
			else {
				if (subType == EquipPos.DZI) {
					this.levelKey.text = "等阶：";
					this.type.text = Role.getEquipNameByType(subType);
					this.lv.text = UserBag.ins().getGuanyinLevel(itemConfig);
				} else {
					this.levelKey.text = itemConfig.zsLevel > 0 ? "转生：" : "等级：";
					this.type.text = Role.getEquipNameByType(subType);
					this.lv.text = isNaN(itemConfig.zsLevel) ? ((itemConfig.level || 1) + "级") : (itemConfig.zsLevel + "转");
					if (UserBag.fitleEquip.indexOf(itemConfig.id) != -1) {
						this.lv.text = "无级别";
					}
				}
				if (itemConfig.zsLevel > 0) {
					this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
				}
				else {
					this.lv.textColor = Actor.level < itemConfig.level ? 0xf3311e : 0x35e62d;
				}
				this.career.text = Role.getJobNameByJob(job);
				this.jobGroup.visible = true;
			}

		}

		// let nameList: string[] = [];
		// let baseAttrList: string[] = [];
		// let randAttrList: string[] = [];

		let ii = 1;
		this.attr1.visible = false;
		this.attr2.visible = false;
		this.attr3.visible = false;
		this.attr4.visible = false;
		let config = GlobalConfig.EquipConfig[configID];
		this.totalAttr = [];
		let info: HeirloomInfo;

		let transfrom = [
			'',
			'',
			'hp',  //2
			'',
			'atk',  //4
			'def',  //5
			'res',  //6
		];

		if (this.roleModel)
			info = this.roleModel.heirloom.getInfoBySolt(this.index);
		for (let k in Role.translate) {
			if (isNaN(config[k]) || !config[k])
				continue;

			let attrStr = "";
			// baseAttrList.push(config[k] + "");
			// nameList.push(AttributeData.getAttrStrByType(this.translate[k]));
			attrStr += AttributeData.getAttrStrByType(Role.getAttrTypeByName(k)) + "  ";
			attrStr += config[k];
			let attrs: AttributeData = new AttributeData;
			if (data != undefined) {
				if (data.att) {
					let attr = data.att;
					for (let index = 0; index < attr.length; index++) {
						if (attr[index].type == Role.getAttrTypeByName(k)) {
							// randAttrList.push('+' + attr[index].value);
							attrStr += ' +' + attr[index].value;
							if (info && info.attr_add) {
								attrStr += "+" + Math.floor((config[k] + attr[index].value) * (info.attr_add / 100));
							}
							attrs.type = attr[index].type;
							attrs.value = config[k] + attr[index].value;
							this.totalAttr.push(attrs);
							break;
						}
					}
				} else {
					for (let k in config) {
						if (!transfrom[k]) continue;
						let value = config[transfrom[k]];
						if (value == undefined || value == 0) continue;
						let type = Role.getAttrTypeByName(transfrom[k]);
						attrStr += AttributeData.getAttrStrByType(type) + "  ";
						attrStr += config[k];

						attrs.type = type;
						attrs.value = config[k];
						// let additionRange = equipConfig.additionRange?equipConfig.additionRange:15;
						// allPower += (value + Math.floor(value * ItemBase.additionRange / 100)) * powerConfig[k].power;
						this.totalAttr.push(attrs);
					}
				}
			} else {
				attrs.type = Role.getAttrTypeByName(k);
				attrs.value = config[k];
				this.totalAttr.push(attrs);
			}

			this['attr' + ii].text = attrStr;
			this['attr' + ii].visible = true;

			ii++;
		}
		if (data) {
			this._equipPower = data.point;//在point里面已经计算 expower
		} else {
			this._equipPower = Math.floor(UserBag.getAttrPower(this.totalAttr));
			if (config && config.exPower) {
				exPower = config.exPower;
			}
		}

		this._totalPower += this._equipPower + exPower;
		this._score = this._totalPower;
		this.score.text = "评分：" + this._totalPower;
		this._bottomY = this['attr' + (ii - 1)].y + this['attr' + (ii - 1)].height;

		while (this.forgeGroup.numElements) {
			this.forgeGroup.removeChildAt(0);
		}
		if (this.roleModel) {
			//身上装备
			let len: number = this.roleModel.getEquipLen();
			// let equipsData: EquipsData[] = this.roleModel.equipsData;
			for (let i: number = 0; i < len; i++) {
				let equipsData: EquipsData = this.roleModel.getEquipByIndex(i);
				if (equipsData.item.handle == (handle)) {
					this.setForge(equipsData, i);
					break;
				}
			}
		}
		if (subType == EquipPos.DZI) this.addTips(null, 5, 0);
		if (itemConfig.desc) {
			//分割线
			// let lineImg: eui.Image = new eui.Image;
			// lineImg.source = "zyz_01";
			// lineImg.width = 291;
			// lineImg.x = 97;
			// lineImg.y = this._bottomY += 10;
			// this.forgeGroup.addChild(lineImg);
			//描述
			let desc: eui.Label = new eui.Label;
			// desc.fontFamily = "黑体";
			desc.size = 18;
			desc.width = 250;
			desc.textColor = 0xD1C28F;
			desc.x = this.attr1.x;
			desc.y = this._bottomY += 10;
			desc.textFlow = TextFlowMaker.generateTextFlow(itemConfig.desc);
			this.forgeGroup.addChild(desc);
			this._bottomY += desc.textHeight;
		}
		this.background.height = this._bottomY + 12;
		this.anigroup.height = this.background.height + 60;
		this.anigroup.y = this.anigroup.height / 2 - this.background.height / 2;

		// BitmapNumber.ins().changeNum(this.totalPower, this._totalPower, "8");
		this.powerPanel.setPower(this._totalPower);
		// this.totalPower.y = this.anigroup.y + 45;

		// this.baseAttr.text = ItemData.getStringByList(baseAttrList);
		// this.randAttr.text = ItemData.getStringByList(randAttrList);
		// this.nameAttr.text = ItemData.getStringByList(nameList);

	}

	private setForge(equipsData: EquipsData, pos: number): void {
		let lv: number = 0;
		for (let i: number = 0; i < 5; i++) {
			switch (i) {
				case ForgeWin.Page_Select_Boost:
					lv = equipsData.strengthen;
					break;
				case ForgeWin.Page_Select_ZhuLing:
					lv = equipsData.zhuling;
					break;
				case ForgeWin.Page_Select_Gem:
					lv = equipsData.gem;
					break;
				case ForgeWin.Page_Select_Weapon:
					lv = equipsData.tupo;
					break;
				// case ForgeWin.Page_Select_Awaken:
				// 	if (this.awakenLv) {
				// 		this.changeBtn.visible = false;
				// 		lv = this.awakenLv;
				// 	} else {
				// 		lv = this.roleModel.awakenData.posLevel[pos];
				// 	}
				// 	break;
			}
			if (lv > 0) {
				let attrs: AttributeData[] = [];
				// if (i == ForgeWin.Page_Select_Awaken) {
				// 	attrs = this.roleModel.awakenData.getAttrs(pos + 1, lv);
				// } else {
					attrs = UserForge.ins().getForgeConfigByPos(pos, lv, i).attr;
				// }
				//装备仅8个部位有觉醒属性
				if (!attrs) return;
				this.addTips(attrs, i, lv);
				let power: number = 0;
				if (i == 3) {
					power = Math.floor(this._equipPower * (Number(attrs) / 100));
				} else {
					// if (i == ForgeWin.Page_Select_Awaken) {
					// 	//这里要加上基础属性值百分比战力
					// 	let basePower = UserBag.getAttrPower(this.totalAttr);
					// 	power = Math.floor(this.roleModel.awakenData.getBaseAttrAdd(pos + 1) / 100 * basePower);
					// }
					power += Math.floor(UserBag.getAttrPower(attrs));
				}
				this._totalPower += power;
			}
		}
	}

	private addTips(attr: AttributeData[], type: number, lv: number): void {
		// let lineImg: eui.Image = new eui.Image;
		// lineImg.source = "zyz_01";
		// lineImg.width = 291;
		// lineImg.x = 97;
		// lineImg.y = this._bottomY + 10;
		// this.forgeGroup.addChild(lineImg);
		let titleAttrTxt: eui.Label = new eui.Label;
		titleAttrTxt.fontFamily = "Arial";
		titleAttrTxt.size = 20;
		titleAttrTxt.textColor = 0x7e6437;
		titleAttrTxt.bold = true;
		titleAttrTxt.x = 24;
		titleAttrTxt.y = this._bottomY + 10 + 14;
		titleAttrTxt.touchEnabled = false;
		this.forgeGroup.addChild(titleAttrTxt);
		let attrTxt: eui.Label = new eui.Label;
		attrTxt.fontFamily = "Arial";
		attrTxt.size = 18;
		attrTxt.lineSpacing = 8;
		// attrTxt.textColor = 0x9f946d;
		attrTxt.x = 46;
		attrTxt.y = titleAttrTxt.y + 24;
		attrTxt.touchEnabled = false;
		this.forgeGroup.addChild(attrTxt);
		let attrs: AttributeData[];
		switch (type) {
			case ForgeWin.Page_Select_Boost:
				titleAttrTxt.text = "强化属性";
				attrs = AttributeData.getAttrStrAdd(attr, 11);
				attrTxt.textColor = 0x5186fd;
				break;
			case ForgeWin.Page_Select_Gem:
				titleAttrTxt.text = "聚灵属性";
				attrs = AttributeData.getAttrStrAdd(attr, 12);
				attrTxt.textColor = 0xd242fb;
				break;
			case ForgeWin.Page_Select_ZhuLing:
				titleAttrTxt.text = "魔晶属性";
				attrTxt.textColor = 0xe5b613;
				attrs = AttributeData.getAttrStrAdd(attr, 15);
				break;
			case ForgeWin.Page_Select_Weapon:
				titleAttrTxt.text = "突破属性";
				break;
			// case ForgeWin.Page_Select_Awaken:
			// 	titleAttrTxt.text = "觉醒属性";
			// 	attrTxt.textColor = 0xB5AE9E;
			// 	attrs = attr;
			// 	//这里添加属性阶段星图
			// 	let max = Object.keys(GlobalConfig.AwakenAttrConfig[0]).length;
			// 	let star = new StageStarView(max, 0, StageStarEnum.Awaken, 10, null, true, false);
			// 	this.forgeGroup.addChild(star);
			// 	//觉醒的阶级星图占了一些位置,所以把觉醒属性标题上移一点
			// 	titleAttrTxt.y = titleAttrTxt.y - 8;
			// 	star.scaleX = star.scaleY = .7;
			// 	//觉醒的阶级星图放到属性标题下面
			// 	star.x = 46;
			// 	star.y = titleAttrTxt.y + 22;
			// 	attrTxt.y += 30;
			// 	star.update(lv);
			// 	this._bottomY = titleAttrTxt.y + titleAttrTxt.height;
			// 	break;
			case 5:
				titleAttrTxt.text = "特殊属性";
				this._bottomY = titleAttrTxt.y + titleAttrTxt.height;
				break;
		}

		//诛仙
		let info: HeirloomInfo;
		if (type != ForgeWin.Page_Select_ZhuLing && this.roleModel)
			info = this.roleModel.heirloom.getInfoBySolt(this.index);
		if (attrs) {
			if (type != ForgeWin.Page_Select_Weapon)
				attrTxt.text = AttributeData.getAttStr(attrs, 1, 1, "  ", false, true, info);
			else
				attrTxt.text = "基础属性 +" + attr + "%";
		}
		this._bottomY = attrTxt.y + attrTxt.height;
	}

	/**
	 * 统计装备的积分
	 * @returns {number}
	 */
	public getScore(): number {
		return this._score;
	}

	/**
	 * 统计装备的战斗力
	 * @returns {number}
	 */
	public getPower(): number {
		return this.powerPanel.power;
	}

	/**
	 * 获取装扮类型
	 * @returns {string}
	 */
	public getType(): string {
		return this.type.text;
	}

}
ViewManager.ins().reg(EquipDetailedWin, LayerManager.UI_Popup);