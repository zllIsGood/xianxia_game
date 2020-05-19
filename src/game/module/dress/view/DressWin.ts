/**装扮 */
class DressWin extends BaseEuiView {

	public viewStack: eui.ViewStack;
	public wingImg: eui.Image;
	public bodyImg: eui.Image;
	public weaponImg: eui.Image;
	public footGrp: eui.Group;
	private footMc: MovieClip;
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public help: eui.Button;
	public roleSelect: RoleSelectPanel;
	public roleSelect0: RoleSelectPanel
	public list: eui.List;
	public titleList: eui.List;
	// public powerImg: eui.Image;
	public tab: eui.TabBar;
	public selectGroup: eui.Group;
	// public nameImage: eui.Image;
	public dressBtn: eui.Button;
	public background: eui.Image;
	public dressName: eui.Label;
	public attrLabel: eui.Label;
	public namelabel: eui.Label;
	public itemName: eui.Label;
	// public attrPower: eui.Label;
	public unSelectGroup: eui.Group;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	private curRole: number;
	private selectIndex: number;
	private listInfo: DressItemInfo[];
	private arry: eui.ArrayCollection;

	// private totalPower: egret.DisplayObjectContainer;
	private _totalPower: number;
	private id: number;
	private isjihuo: boolean = false;

	private titleGroup: eui.Group;
	private dressGroup: eui.Group;
	// private powerGroup: eui.Group;
	private powerPanel: PowerPanel;

	public titleImg: eui.Image;


	constructor() {
		super();
		this.skinName = "DressSkin";
		this.isTopLevel = true;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("roleSelect0", new RoleSelectPanel());
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.listInfo = [];

		this.arry = new eui.ArrayCollection(this.listInfo);
		this.list.itemRenderer = DressItemRenderer;
		this.list.dataProvider = this.arry;


		this.titleList.itemRenderer = TitleItem;

		let arr = [];
		// arr.push(GlobalConfig.ZhuangBanConfig.zhuangbanpos[0]);
		arr = CommonUtils.copyDataHandler(GlobalConfig.ZhuangBanConfig.zhuangbanpos);
		arr.push("称号");
		this.tab.dataProvider = new eui.ArrayCollection(arr);

		// this.totalPower = BitmapNumber.ins().createNumPic(1000000, "8", 0);
		// this.totalPower.x = 90;
		// this.totalPower.y = 5;
		// this.powerGroup.addChild(this.totalPower);
	}

	public open(...param: any[]): void {

		this.curRole = param[0] || 0;
		if (param[1] != undefined) { //用于打开界面选择角色计算战斗力，之前没有传这个参数，如计算战斗力功能不需要，可以删掉这三行代码Peach.T
			this.lastIndex = parseInt(param[1] + "");
		}
		this.list.selectedIndex = -1;
		this.roleSelect.setCurRole(this.curRole);
		this.roleSelect0.setCurRole(this.curRole);
		MessageCenter.ins().addListener(Title.TITLE_WIN_REFLASH_PANEL, (obj, param) => {
			if (obj.itemIndex == Title.ins().list.length - 1) {
				let itemHeight: number = Title.EXPAND_HEIGHT - Title.SIMLPE_HEIGHT
				if (param == "expand") {
					this.titleList.scrollV = this.titleList.contentHeight - this.titleList.height + itemHeight;
				} else {
					this.titleList.scrollV = this.titleList.contentHeight - this.titleList.height - itemHeight;
				}
				this.titleList.validateNow();
			}
		}, this);
		this.observe(Dress.ins().postDressInfo, this.update);
		this.observe(Dress.ins().postJiHuo, this.onJihuo);
		this.observe(GameLogic.ins().postChildRole, this.getDressInfo);
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addTouchEvent(this.help, this.onClick);
		this.addTouchEvent(this.itemName, this.onClick);
		this.addChangeEvent(this.list, this.onChange);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.addChangeEvent(this.roleSelect0, this.onChange);
		this.addTouchEvent(this.dressBtn, this.onClick);

		this.observe(Title.ins().postListUpdate, this.updateList);
		this.observe(Title.ins().postTitleShow, this.updateShow);
		this.observe(Title.ins().postUseTitle, this.useTitle);
		this.list.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouch, this);
		this.list.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
		this.list.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouch, this);
		this.titleList.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouch, this);
		this.titleList.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
		this.titleList.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouch, this);
		this.titleGroup.visible = false;
		this.dressGroup.visible = true;
		this.update();
		this.careerRedPoint();
		this.getDressInfo();
		if (this.lastIndex >= 0) {
			this.setSelectedIndex(this.lastIndex);
		}
	}

	private onTouch(e: egret.TouchEvent) {
		if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
			this.roleSelect.parent.touchEnabled = false;
			this.roleSelect0.parent.touchEnabled = false;
		} else {
			this.roleSelect.parent.touchEnabled = true;
			this.roleSelect0.parent.touchEnabled = true;
		}
	}

	private getDressInfo(): void {
		Dress.ins().sendDressInfoReq()
	}

	//不同的角色或者时装处理
	private lastRole: number = -1;

	private onChange(e: egret.Event): void {
		switch (e.target) {
			case this.roleSelect:
				if (this.lastRole == this.roleSelect.getCurRole()) return;
				this.curRole = this.roleSelect.getCurRole();
				this.list.selectedIndex = -1;
				this.lastWeapon = 0;
				this.lastBody = 0;
				this.lastRole = this.curRole;
				this.update();
				this.careerRedPoint();
				break;
			case this.roleSelect0:
				if (this.lastRole == this.roleSelect0.getCurRole()) return;
				Title.ins().curSelectRole = this.lastRole = this.roleSelect0.getCurRole();
				if (Title.ins().list == null)
					Title.ins().sendGetList();
				else
					this.updateList();
				break;
			case this.list:
				let item: DressItemRenderer = e.target as DressItemRenderer;
				this.onInfoUpdate(item.data);
				break;
		}
	}

	private careerRedPoint(): void {
		let career: number = SubRoles.ins().getSubRoleByIndex(this.curRole).job;
		let redPoint: boolean[] = Dress.ins().postRedPoint(career);
		for (let i: number = 0; i < 4; i++) {
			this["redPoint" + i].visible = redPoint[i];
		}
	}

	//不同的类型时装
	private lastIndex: number = -1;

	private onTabTouch(e: egret.TouchEvent): void {
		let sro = this.list.parent as eui.Scroller;
		sro.stopAnimation();
		this.list.scrollH = 0;

		this.selectIndex = e.currentTarget.selectedIndex;
		this.setSelectedIndex(this.selectIndex);
	}

	private setSelectedIndex(index) {
		// this.titleImg.source = index == 4 ? `biaoti_chenghao_png` : `dress_word`;
		this.lastIndex = this.selectIndex;
		if (this.selectIndex < this.tab.dataProvider.length - 1) {
			this.dressGroup.visible = true;
			this.roleSelect.openRole();
			this.titleGroup.visible = false;
			this.update();
		} else {
			this.dressGroup.visible = false;
			this.titleGroup.visible = true;
			Title.ins().curSelectRole = 0;
			this.roleSelect.hideRole();
			if (Title.ins().list == null)
				Title.ins().sendGetList();
			else
				this.updateList();
		}
	}

	//时装数据
	private update(): void {
		if (this.curRole == null)
			this.curRole = 0;
		if (this.selectIndex == null)
			this.selectIndex = 0;
		let model: Dress = Dress.ins();
		this.listInfo = [];
		let zbConf = GlobalConfig.ZhuangBanId;
		let job = SubRoles.ins().getSubRoleByIndex(this.curRole).job;
		for (let k in zbConf) {
			if (job == zbConf[k].roletype && ((this.selectIndex + 1) == zbConf[k].pos)) {
				let info: DressItemInfo = new DressItemInfo();
				info.zhuanban = zbConf[k];
				let listLen: number = model.timeInfo.length
				for (let i: number = 0; i < listLen; i++) {
					if (info.zhuanban.id == model.timeInfo[i].dressId) {
						info.isUser = true;
						info.timer = model.timeInfo[i].invalidtime;
						break;
					}
				}
				if (model.posInfo.length > this.curRole && info.zhuanban.id == model.posInfo[this.curRole].posAry[this.selectIndex])
					info.isDress = true;
				this.listInfo.push(info);
			}
		}
		this.arry.replaceAll(this.listInfo);
		this.list.dataProvider = this.arry;
		this.onInfoUpdate();
		this.redPoint();
		this.careerRedPoint();
	}

	//角色红点
	private redPoint() {
		let subRoles = SubRoles.ins();
		for (let i: number = 0; i < subRoles.subRolesLen; i++) {
			let isOpen = Dress.ins().canDress(subRoles.getSubRoleByIndex(i).job, this.tab.selectedIndex + 1);
			this.roleSelect.showRedPoint(i, isOpen);
		}
	}

	private dress: DressItemInfo
	//信息更新
	private onInfoUpdate(data: DressItemInfo = null): void {
		if (data == null) {
			this.dress = this.list.selectedItem;
			this.powerPanel.setPower(0);
		}
		else
			this.dress = data;

		if (this.dress) {
			this.selectGroup.visible = true;
			this.unSelectGroup.visible = false;
			this.attrLabel.text = AttributeData.getAttStr(AttributeData.transformAttr(this.dress.zhuanban.attr), 0, 1, ":");
			// this.attrPower.text = "战力:" + UserBag.getAttrPower(AttributeData.transformAttr(this.dress.zhuanban.attr));
			let power: number = UserBag.getAttrPower(AttributeData.transformAttr(this.dress.zhuanban.attr));
			this.powerPanel.setPower(power);
			// this.nameImage.source = "dress" + this.dress.zhuanban.id + "n_png";
			this.namelabel.visible = false;
			this.itemName.visible = false;
			this.dressName.text = "属性-" + this.dress.zhuanban.name;
			if (this.dress.isUser && !this.dress.isDress)
				this.dressBtn.label = "幻 化";
			else if (this.dress.isDress)
				this.dressBtn.label = "脱 下";
			else {
				this.dressBtn.label = "激 活";
				this.namelabel.visible = true;
				this.itemName.visible = true;
				this.id = this.dress.zhuanban.cost["itemId"]
				let num: number = this.dress.zhuanban.cost["num"];
				let str: string;
				this.isjihuo = false;
				if (UserBag.ins().getItemCountById(0, this.id) >= num)
					str = "<font color = '#23C42A'><u>" + GlobalConfig.ItemConfig[this.id].name + "×" + num + "</u></font>";
				else {
					str = "<font color = '#f3311e'><u>" + GlobalConfig.ItemConfig[this.id].name + "×" + num + "</u></font>";
					this.isjihuo = true;
				}
				this.itemName.textFlow = new egret.HtmlTextParser().parser(str);
			}
			this.onupdateEquip(false);
		} else {
			this.selectGroup.visible = false;
			this.unSelectGroup.visible = true;
			this.onupdateEquip(true);
		}
		// this.updatePower();
	}

	//计算战斗力
	private updatePower(): void {
		let info: DressTimeInfo[] = Dress.ins().timeInfo;
		this._totalPower = 0;
		for (let i: number = 0; i < info.length; i++) {
			if (SubRoles.ins().getSubRoleByIndex(this.curRole).job == this.getZhuangbanById(info[i].dressId).roletype)
				this._totalPower += UserBag.getAttrPower(AttributeData.transformAttr(this.getZhuangbanById(info[i].dressId).attr));
		}
		// BitmapNumber.ins().changeNum(this.totalPower, this._totalPower, "8", 0);
		this.powerPanel.setPower(this._totalPower);
	}

	private lastBody: number;
	private lastWeapon: number;
	//角色装扮显示更新
	private onupdateEquip(isshowjichu: boolean = false): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let info: DressPosInfo = Dress.ins().getModelPosId(this.curRole);
		if (!info || !info.posAry || info.posAry.length <= 0) {
			debug.log(this.listInfo);
			let tempInfo: DressItemInfo = this.listInfo[0];
			if (tempInfo.zhuanban.pos == 1) {
				this.setEquip(model, tempInfo.zhuanban.id, this.lastWeapon)
				this.lastBody = tempInfo.zhuanban.id;
			} else if (tempInfo.zhuanban.pos == 2) {
				this.setEquip(model, this.lastBody, tempInfo.zhuanban.id)
				this.lastWeapon = tempInfo.zhuanban.id;
			} else if (tempInfo.zhuanban.pos == 4) {
				this.setFootPrint(tempInfo.zhuanban.id);
			} else {
				this.setWing(tempInfo.zhuanban.id);
			}
			// this.setEquip(model, this.dress.zhuanban.id, this.dress.zhuanban.id)
			debug.log("没有时装数据。。。。。。。。。。。。。。。。")
			return
		}
		if (isshowjichu) {//显示当前角色装扮
			this.setWing(info.posAry[2]);
			this.setEquip(model, info.posAry[0], info.posAry[1]);
			this.setFootPrint(info.posAry[3]);
		} else {
			if (this.dress.zhuanban.pos == 3)
				this.setWing(this.dress.zhuanban.id);
			else if (this.dress.zhuanban.pos == 1) {
				if (this.lastWeapon > 0)
					this.setEquip(model, this.dress.zhuanban.id, this.lastWeapon)
				else
					this.setEquip(model, this.dress.zhuanban.id, info.posAry[1])
				this.lastBody = this.dress.zhuanban.id;
			}
			else if (this.dress.zhuanban.pos == 4) {
				this.setFootPrint(this.dress.zhuanban.id);
			} else {
				if (this.lastBody > 0)
					this.setEquip(model, this.lastBody, this.dress.zhuanban.id)
				else
					this.setEquip(model, info.posAry[0], this.dress.zhuanban.id)
				this.lastWeapon = this.dress.zhuanban.id;
			}
		}
	}

	//设置翅膀
	protected setWing(wingId: number): void {
		let wingdata: WingsData = SubRoles.ins().getSubRoleByIndex(this.curRole).wingsData;
		if (wingId > 0)
			this.wingImg.source = this.getZhuangbanById(wingId).res + "_png";
		else if (wingdata.openStatus) {
			this.wingImg.source = GlobalConfig.WingLevelConfig[wingdata.lv].appearance + "_png";
		} else {
			this.wingImg.source = "";
		}
		// debug.log("wwwwwwwwwww:::"+this.getZhuangbanById(wingId).res)
	}

	public destoryView(): void {
		super.destoryView();
		if (this.roleSelect)
			this.roleSelect.destructor();
		if (this.roleSelect0)
			this.roleSelect0.destructor();
	}

	/** 设置装备 */
	protected setEquip(role: Role, bodyId: number, weaponId: number): void {
		if (!role)
			return;
		let equipData: EquipsData[] = role.equipsData;
		let isHaveBody: boolean;
		this.weaponImg.source = "";
		for (let i = 0; i < equipData.length; i++) {
			let element: EquipsData = equipData[i];

			if (i == 0 || i == 2) {
				let id: number = equipData[i].item.configID;
				if (id > 0) {
					let fileName: string = DisplayUtils.getAppearanceByJobSex(
						GlobalConfig.EquipConfig[id].appearance, role.job, role.sex);
					if (i == 0) {
						this.weaponImg.source = fileName;
					}
					else {
						this.bodyImg.source = fileName;
						isHaveBody = true;
					}
				}
			}
		}
		if (!isHaveBody)
			this.bodyImg.source = DisplayUtils.getAppearanceBySex(`body${role.job}00`, role.sex);
		if (weaponId > 0)
			this.weaponImg.source = DisplayUtils.getAppearanceByJobSex(this.getZhuangbanById(weaponId).res, role.job, role.sex);
		if (bodyId > 0)
			this.bodyImg.source = DisplayUtils.getAppearanceByJobSex(this.getZhuangbanById(bodyId).res, role.job, role.sex);
	}

	private setFootPrint(footId: number): void {
		let role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let zbConf = GlobalConfig.ZhuangBanId;
		for (let k in zbConf) {
			let conf = zbConf[k];
			if (conf.pos == 4 && conf.id == footId) {
				this.footMc = this.footMc || new MovieClip();
				if (!this.footMc.parent) {
					this.footGrp.addChild(this.footMc);
					this.footMc.touchEnabled = false;
				}
				this.footMc.playFile(`${RES_DIR_FOOTSTEP}${conf.res}`, -1);
				return;
			}
		}
		if (this.footMc) this.footMc.destroy();
	}

	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}

	//激活并幻化
	private onJihuo(): void {
		if (this.dress) {
			Dress.ins().sendDressUserReq(this.curRole, this.dress.zhuanban.id);
		}
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(DressWin);
				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 9);
				break;
			case this.itemName:
				let itemconfig: ItemConfig = GlobalConfig.ItemConfig[this.id];
				let type = ItemConfig.getType(itemconfig);
				if (itemconfig != undefined && itemconfig && type != undefined) {
					if (type == 0 || type == 4) {
						ViewManager.ins().open(EquipDetailedWin, 1, undefined, itemconfig.id);
					} else {
						ViewManager.ins().open(ItemDetailedWin, 0, itemconfig.id);
					}
				}
				break;
			case this.dressBtn:
				if (!this.dress || !this.dress.zhuanban) {
					debug.log(DressWin, "DressWin　　" + this.dress + " ++++++ ");
					return;
				}
				if (this.dressBtn.label == "激 活") {
					if (this.isjihuo) {
						UserTips.ins().showTips("|C:0xf3311e&T:激活道具不足|");
						return;
					}
					if (this.dress.zhuanban.pos == 3 && Actor.level < 16) {
						UserTips.ins().showTips("16级开启羽翼后可激活");
						return;
					}
					let jobNumberToName = {
						0: "通用",
						1: "战士",
						2: "法师",
						3: "术士",
					};
					let posAry: string[] = GlobalConfig.ZhuangBanConfig.zhuangbanpos;
					WarnWin.show(`确定要激活<font color='#35e62d'>${jobNumberToName[this.dress.zhuanban.roletype] + posAry[this.dress.zhuanban.pos - 1]}</font>装扮${this.dress.zhuanban.name}吗?`, () => {
						Dress.ins().sendDressActivationReq(this.dress.zhuanban.id)
					}, this);
				} else if (this.dressBtn.label == "幻 化")
					Dress.ins().sendDressUserReq(this.curRole, this.dress.zhuanban.id);
				else
					Dress.ins().sendUnDressUserReq(this.curRole, this.dress.zhuanban.id);
				break;
		}
	}

	/**
	 * 请求带上或卸下称号
	 */
	private useTitle(info: TitleInfo): void {
		//带上
		if (info.config.Id != Title.ins().showTitleDic[Title.ins().curSelectRole]) {
			//检查职业
			if (!info.config.job || info.config.job == SubRoles.ins().getSubRoleByIndex(this.roleSelect.getCurRole()).job)
				Title.ins().setTitle(this.roleSelect0.getCurRole(), info.config.Id);
			else
				UserTips.ins().showTips('职业不符');
		}
		//卸下
		else {
			Title.ins().setTitle(Title.ins().curSelectRole, 0);
		}
	}

	/**
	 * 更新列表
	 */
	private updateList(): void {
		this.titleList.dataProvider = Title.ins().list;
		Title.ins().list.refresh();
	}

	/**
	 * 更新设置的称号
	 */
	private updateShow(param: Array<any>): void {
		let roleIndex: number, titleID: number, lastID: number;
		roleIndex = param[0];
		titleID = param[1];
		lastID = param[2];
		// if (roleIndex != Title.ins().useRole)
		// 	return;
		//更换，只刷新两个项
		if (titleID > 0 == lastID > 0) {
			this.updateItemByID(lastID);
			this.updateItemByID(titleID);
		}
		//带上、卸下，刷新所有已得到的称号
		else {
			for (let id in Title.ins().timeDict) {
				this.updateItemByID(Number(id));
			}
		}
	}

	/**
	 * 更新指定称号的列表项
	 */
	private updateItemByID(titleID: number): void {
		if (!(titleID in Title.ins().infoDict))
			return;
		let info: TitleInfo = Title.ins().infoDict[titleID];
		Title.ins().list.itemUpdated(info);
	}
}

ViewManager.ins().reg(DressWin, LayerManager.UI_Main);