class HeirloomWin extends BaseEuiView {
	//ColorUtil.GRAY_COLOR//灰色
	public static Heir_Init = 1;
	public static Heir_Select = 2;
	public static Heir_LRBtn = 3;

	public static Heir_TIPS_0 = 0;//材料不足
	public static Heir_TIPS_1 = 1;//材料足够
	public static Heir_TIPS_2 = 2;//已满级

	/**角色选择面板 */
	public roleSelect: RoleSelectPanel;
	public powerPanel: PowerPanel;

	/**控件*/
	public leftBtn: eui.Button;
	public rightBtn: eui.Button;
	public icon0: eui.Image;//装备图
	public modelAni: MovieClip;
	public jihuo: eui.Button;

	public attrSet: eui.Button;
	private neatSet: eui.Button;

	public desc0: eui.Label;//武器
	public desc1: eui.Label;//头盔
	public desc2: eui.Label;//衣服
	public desc3: eui.Label;//项链
	public desc4: eui.Label;//护腕
	public desc5: eui.Label;//腰带
	public desc6: eui.Label;//鞋子

	public attr0: eui.Label;//攻击
	public attr1: eui.Label;//生命
	public attr2: eui.Label;//物防
	public attr3: eui.Label;//法防
	public attr4: eui.Label;//暴击伤害
	public attr5: eui.Label;//内功值
	public attr6: eui.Label;//XX部件所有属性

	public countLabel: eui.Label;//当前材料/所需材料

	public curIndex: number;
	public icon: eui.Image;//消耗材料的icon

	public getItemTxt: eui.Label;//合成道具(获取诛仙之刃 获取诛仙神甲) 分解道具

	public skill: HeirloomItem;
	public expendLabel: eui.Label;

	public itemName: eui.Label;
	private closeBtn: eui.Button;

	private eff: MovieClip = new MovieClip();
	constructor() {
		super();
		this.skinName = "heirloom";
		this.isTopLevel = true;


	}

	public initUI(): void {
		super.initUI();
		// this.setSkinPart("roleSelect", new RoleSelectPanel());

		this.icon0.visible = false;//用于定位 无显示作用
		this.curIndex = 0;

	}
	public destoryView(): void {
		super.destoryView();
		this.roleSelect.destructor();
	}

	public static openCheck(...param: any[]): boolean {
		// if (GameServer.serverOpenDay < 2){
		// 	UserTips.ins().showTips(`开服第三天开启诛仙装备`);
		// 	return false;
		// }
		if (UserZs.ins().lv < 3) {
			UserTips.ins().showTips(`诛仙装备3转开启`);
			return false;
		}
		return true;

	}
	public open(...param: any[]): void {
		let selectedIndex = param ? param[0] : 0;
		this.roleSelect.setCurRole(selectedIndex);
		this.observe(UserBag.ins().postItemDel, this.updateData);
		this.observe(UserBag.ins().postItemCountChange, this.updateData);
		this.observe(Heirloom.ins().postHeirloomInfo, this.updateData);
		this.addChangeEvent(this.roleSelect, this.switchRole);

		for (let i = 0; i < 8; i++) {
			this.addTouchEvent(this["pos" + i], this.onTap);
		}
		this.addTouchEvent(this.rightBtn, this.onClick);
		this.addTouchEvent(this.leftBtn, this.onClick);
		this.addTouchEvent(this.getItemTxt, this.onClick);
		this.addTouchEvent(this.jihuo, this.onClick);
		this.addTouchEvent(this.attrSet, this.onClick);
		this.addTouchEvent(this.neatSet, this.onClick);
		this.addTouchEvent(this.skill, this.onSkill);
		this.addTouchEvent(this.icon0.parent, this.onClick);
		this.addTouchEvent(this.closeBtn, this.onClick);

		this.initData();


		this.modelAni.parent.addChild(this.eff);
		this.eff.playFile(`${RES_DIR_EFF}artifacteff2`, -1)

		this.eff.x = this.modelAni.x;
		this.eff.y = this.modelAni.y;

		DisplayUtils.upDownGroove(this.modelAni, -12, 0);
	}

	public close(...param: any[]): void {
		for (let i = 0; i < 8; i++) {
			this.removeTouchEvent(this["pos" + i], this.onTap);
		}

		this.removeTouchEvent(this.rightBtn, this.onClick);
		this.removeTouchEvent(this.leftBtn, this.onClick);
		this.removeTouchEvent(this.getItemTxt, this.onClick);
		this.removeTouchEvent(this.jihuo, this.onClick);
		this.removeTouchEvent(this.attrSet, this.onClick);
		this.removeTouchEvent(this.neatSet, this.onClick);
		this.removeTouchEvent(this.skill, this.onSkill);
		this.roleSelect.removeEventListener(egret.Event.CHANGE, this.switchRole, this);
		this.removeTouchEvent(this.icon0.parent, this.onClick);
		this.removeTouchEvent(this.closeBtn, this.onClick);

		this.removeObserve();
		this.removeAni();
		this.clearEff();
	}
	public removeAni() {
		DisplayUtils.removeFromParent(this.modelAni);
		if (this.modelAni)
			egret.Tween.removeTweens(this.modelAni);
		this.modelAni = null;
	}
	public onSkill(e: egret.Event) {
		switch (e.currentTarget) {
			case this.skill:
				ViewManager.ins().open(HeirloomSkillItem,
					this.skill.itemIcon.imgIcon.source,
					this.skill.skillname,
					this.skill.skilldesc);
				break;
		}
	}
	public onClick(e: egret.Event) {
		switch (e.target) {
			case this.leftBtn:
				this.leftBtn.visible = false;
				this.rightBtn.visible = true;
				this.pre();
				break;
			case this.rightBtn:
				this.rightBtn.visible = false;
				this.leftBtn.visible = true;
				this.next();
				break;
			case this.getItemTxt:
				let tipsPos: number = 0;
				if (this.getItemTxt.text == "获取诛仙之刃") {
					tipsPos = HeirloomSlot.wq;
				} else if (this.getItemTxt.text == "获取诛仙神甲") {
					tipsPos = HeirloomSlot.yf
				}
				if (tipsPos) {
					let config: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[tipsPos];
					(<ShopGoodsWarn>ViewManager.ins().open(ShopGoodsWarn)).setData(config.item);
					return;
				}

				if (this.getItemTxt.text == "合成道具") {
					//弹出合成界面
					ViewManager.ins().open(HeirloomCom);
				} else {
					//弹出分解界面
					let cr = this.roleSelect.getCurRole();
					let r: Role = SubRoles.ins().getSubRoleByIndex(cr);
					let ifo: HeirloomInfo = r.heirloom.getInfoBySolt(this.curIndex);
					ViewManager.ins().open(HeirloomDownView, ifo);
				}
				break;
			case this.jihuo:
				let hinfo: HeirloomInfo = this.getInitInfo();
				let curRole = this.roleSelect.getCurRole();
				let role: Role = SubRoles.ins().getSubRoleByIndex(curRole);
				let info: HeirloomInfo = role.heirloom.getInfoBySolt(this.curIndex);
				let slot = this.curIndex + 1;
				//升级
				if (info && info.lv > 0) {
					let tips = this.check(hinfo);
					if (tips == HeirloomWin.Heir_TIPS_1) {
						Heirloom.ins().sendHeirloomUpLevel(curRole, slot);
					}
					else if (tips == HeirloomWin.Heir_TIPS_2) {
						UserTips.ins().showTips("已满级");
					}
					else {
						let config: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
						(<ShopGoodsWarn>ViewManager.ins().open(ShopGoodsWarn)).setData(config.expend.id);
					}
				}
				//未激活 or 未合成
				else {
					// let config:HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[slot];
					// let num = UserBag.ins().getBagEquipById(config.item);
					// //未激活 发送激活
					// if( num > 0 ){//数据表count是1就没事 万一1以上就不行
					// 	Heirloom.ins().sendHeirloomAct(curRole,slot);
					// }
					let tips = this.check(hinfo);
					if (tips == HeirloomWin.Heir_TIPS_1) {
						Heirloom.ins().sendHeirloomAct(curRole, slot);
					}
					//未合成 弹出获取途径
					else {
						let config: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
						(<ShopGoodsWarn>ViewManager.ins().open(ShopGoodsWarn)).setData(config.item);
					}
				}
				break;
			case this.attrSet:
				let rId = this.roleSelect.getCurRole();
				ViewManager.ins().open(RoleAttrWin, rId);
				break;
			case this.neatSet:
				let roleId = this.roleSelect.getCurRole();
				ViewManager.ins().open(HeirloomSuit, roleId);
				break;
			case this.icon0.parent:
				let rd = this.roleSelect.getCurRole();
				let crole: Role = SubRoles.ins().getSubRoleByIndex(rd);
				ViewManager.ins().open(HeirloomEquipTipsWin, crole, this.curIndex);
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}


	}

	//上一级(当前级)
	public pre() {
		let info: HeirloomInfo = this.getInitInfo();
		this.setHeirloom(this.curIndex, HeirloomWin.Heir_LRBtn, info);
	}
	//下一级
	public next() {
		let info: HeirloomInfo = this.getInitInfo();
		let slot = this.curIndex + 1;
		let level = info.lv ? info.lv + 1 : info.lv + 2;
		let config: HeirloomEquipConfig = this.getSlotInfoByLv(slot, level);
		this.setHeirloom(this.curIndex, HeirloomWin.Heir_LRBtn, config);
	}

	public onTap(e: egret.Event) {
		let curRole = this.roleSelect.getCurRole();
		let role: Role = SubRoles.ins().getSubRoleByIndex(curRole);
		for (let i = 0; i < 8; i++) {
			this["pos" + i].setSelectIconVisible(false);
			switch (e.currentTarget) {
				case this["pos" + i]:
					if (this.curIndex == i) {
						this["pos" + i].setSelectIconVisible(true);
						//再次选中打开tips
						ViewManager.ins().open(HeirloomEquipTipsWin, role, i);
						break;
					}
					this.curIndex = i;
					this.setHeirloom(i, HeirloomWin.Heir_Select);//Select时候i会作为部位索引获取该部位数据
					// this["pos"+i].selectIcon.visible = true;
					this["pos" + i].setSelectIconVisible(true);
					break;
			}
		}

	}
	//刷新诛仙装备
	public updateData() {
		let uplevel: boolean = Heirloom.ins().upRequest;//是否是升级请求回来的
		this.setHeirloom(this.curIndex, HeirloomWin.Heir_Select, null, uplevel);
		if (uplevel)
			Heirloom.ins().upRequest = false;
		this.setSuitLvIcon();
		this.setRedPoint();
		this.updateRedPoint();
		this.setPower();
		let role: CharRole = EntityManager.ins().getMainRole(this.roleSelect.getCurRole());
		if (role)
			role.setHeirloomSuitEff();
	}
	//主要用于刚打开诛仙界面时候 判断所有角色头有没有红点
	public updateRedPoint() {
		for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (!role)
				continue;
			let isShowRedPoint: boolean = false;
			for (let j = 0; j < 8; j++) {
				let info: HeirloomInfo = this.getInitInfoEx(role, j);
				let config: HeirloomEquipFireConfig | HeirloomEquipConfig;
				if (info.lv) {
					config = GlobalConfig.HeirloomEquipConfig[info.slot][info.lv];
				} else {
					config = GlobalConfig.HeirloomEquipFireConfig[j + 1];
				}
				let costItemLen: number = 0;
				let need: number = 0;
				if (config) {
					let expend: { id: number, count: number } = config.expend;
					if (!expend) {
						continue;
					}
					let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);//当前背包材料数量
					costItemLen = itemData ? itemData.count : 0;
					need = expend.count;
				}
				if (costItemLen >= need) {
					isShowRedPoint = true;
					break;
				}
				else
					isShowRedPoint = false;

			}
			//人物头像红点
			this.roleSelect.showRedPoint(i, isShowRedPoint);

		}

	}
	public initData() {
		let info: HeirloomInfo = this.getInitInfo();
		// this["pos0"].selectIcon.visible = true;
		for (let i = 0; i < 8; i++) {
			this.setHeirloom(i, HeirloomWin.Heir_Init, info);
		}
		this["pos0"].setSelectIconVisible(true);
		this.setSuitLvIcon();
		this.setRedPoint();
		this.setPower();
		this.updateRedPoint();
	}
	public switchRole() {
		this.curIndex = 0;
		this.initData();
	}
	/**
	 * 设置诛仙数据
	 * init不为Heir_Select的时候 参数hinfo才有意义 否则根据index自行获取info
	 * */
	public setHeirloom(index: number, init: number, hinfo?: HeirloomInfo | HeirloomEquipConfig, uplevel?: boolean) {
		let info: HeirloomInfo | HeirloomEquipConfig;
		if (init == HeirloomWin.Heir_Init) {
			info = hinfo;
		}
		else if (init == HeirloomWin.Heir_Select) {
			info = this.getInitInfo(index);
			//未开启数据补充 只判断1级即可
			//查看这个部位本身是否是有技能的 有要替换里边的skillicon字段
			if (!info.lv) {
				let cfg: HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[index + 1][1];
				info.skillname = cfg.skillname;
				info.skilldesc = cfg.skilldesc;
				info.skillicon = cfg.skillicon;
				info.name = cfg.name;
			}
		}
		else {
			info = hinfo;
		}
		//只展示当前选中
		if (info) {
			this.setModel(init, index, info);
			this.setUI(init, index, info);
			this.setDesc(init, index, info);
			this.setCost(init, index, info);
		}

		//左右切换查看不影响部位数据
		if (init != HeirloomWin.Heir_LRBtn) {
			//刷新每个控件数据
			if (init == HeirloomWin.Heir_Init && index > 0) {//初始化时候 每一件装备都要再拿一次数据
				info = this.getInitInfo(index);
			}
			if (!info.lv) {
				let cfg: HeirloomEquipConfig | HeirloomInfo = GlobalConfig.HeirloomEquipConfig[index + 1][1];
				info.name = cfg.name;
			}
			this["pos" + index].selectIcon.visible = false;

			this["pos" + index].data = { pos: index, info: info, uplevel: uplevel };
		}

		if (init == HeirloomWin.Heir_Init && index == 0 ||
			init == HeirloomWin.Heir_LRBtn ||
			init == HeirloomWin.Heir_Select
		) {
			let cfg: HeirloomEquipConfig | HeirloomInfo = GlobalConfig.HeirloomEquipConfig[index + 1][1];
			if (info.skillicon) {
				cfg = info;
			}
			if (cfg.skillicon) {
				this.skill.visible = true;
				this.skill.data = {
					pos: index,
					info: info,
					icon: cfg.skillicon,
					skillname: cfg.skillname,
					skilldesc: cfg.skilldesc
				}
				this.skill.cleanEff();
			}
		}


	}
	/**设置ui相关改变*/
	public setUI(init: number, index: number, hinfo: HeirloomInfo | HeirloomEquipConfig) {
		let info: HeirloomInfo | HeirloomEquipConfig;
		if (init == HeirloomWin.Heir_Init) {//刚进入界面初始化模型
			if (index > 0) return;//只初始化第一个装备进行展示
		}
		else if (init == HeirloomWin.Heir_Select) {
			//模型只展示当前选中的
			if (this.curIndex != index)
				return;
		}
		else if (init == HeirloomWin.Heir_LRBtn) {
			this.itemName.text = hinfo.name;
			return;//外部决定是否显示
		}
		info = hinfo;

		if (!info.expend || !info.lv)
			this.rightBtn.visible = false;
		else
			this.rightBtn.visible = true
		this.leftBtn.visible = false;//info&&info.lv?true:false;
		//获取与分解道具
		// let config:HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[index+1];
		// let num = UserBag.ins().getBagEquipById(config.item);
		// if( num > 0 )
		if (init == HeirloomWin.Heir_LRBtn) {//翻页仍然显示当前实际数据
			info = this.getInitInfo();
		}
		if (info.lv > 0) {
			this.getItemTxt.textFlow = TextFlowMaker.generateTextFlow("|U&T:分解道具");
			// this.getItemTxt.text = "分解道具";
			this.jihuo.label = "升  级";
			//检查是否有可分解
			let config: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
			let itemData: ItemData = UserBag.ins().getBagItemById(config.item);
			if (itemData) {
				this.setEff();
			} else {
				this.clearEff();
			}
		}
		else {
			this.clearEff();
			let str: string = "合成道具";
			// this.getItemTxt.text = "合成道具";
			let config: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
			if (config.pos == HeirloomSlot.wq) {
				let itemData: ItemData = UserBag.ins().getBagItemById(config.item);
				if (itemData)
					str = "获取诛仙之刃";
			}
			else if (config.pos == HeirloomSlot.yf) {
				let itemData: ItemData = UserBag.ins().getBagItemById(config.item);
				if (itemData)
					str = "获取诛仙神甲";
			}
			this.getItemTxt.textFlow = TextFlowMaker.generateTextFlow(`|U&T:${str}`);
			this.jihuo.label = "激  活";
		}
		if (info.skillicon) {
			this.skill.visible = true;
			this.skill.data = {
				pos: index,
				info: info,
				icon: info.skillicon,
				skillname: info.skillname,
				skilldesc: info.skilldesc
			}
			this.skill.cleanEff();
		}
		else {
			this.skill.visible = false;
		}

		this.itemName.text = info.name;

	}
	private resolveMc: MovieClip;
	private setEff() {
		if (!this.resolveMc)
			this.resolveMc = new MovieClip;
		if (!this.resolveMc.parent) {
			this.getItemTxt.parent.addChild(this.resolveMc);
			this.resolveMc.playFile(RES_DIR_EFF + "chargeff1", -1);
			this.resolveMc.touchEnabled = false;
			this.resolveMc.scaleY = 0.8;
			this.resolveMc.scaleX = 0.8;
		}
		this.resolveMc.x = this.getItemTxt.x + 38;
		this.resolveMc.y = this.getItemTxt.y + 9;
	}
	private clearEff() {
		DisplayUtils.removeFromParent(this.resolveMc);
	}

	/**设置模型特效*/
	public setModel(init: number, index: number, hinfo: HeirloomInfo | HeirloomEquipConfig) {
		// this.icon0.source = info.model;
		let eff = "";
		let info: HeirloomInfo | HeirloomEquipConfig;
		if (init == HeirloomWin.Heir_Init) {//刚进入界面初始化模型
			if (index > 0) return;//只初始化第一个装备进行展示
		}
		else if (init == HeirloomWin.Heir_Select) {
			//模型只展示当前选中的
			if (this.curIndex != index)
				return;
		}
		this.removeAni();
		info = hinfo;
		//激活
		if (info && info.lv > 0) {
			eff = info.model;
		}
		//未激活
		else {
			let config: HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[index + 1][1];
			eff = config.model;
		}

		if (!this.modelAni) {
			this.modelAni = new MovieClip;
			this.modelAni.playFile(RES_DIR_EFF + eff, -1);
			this.modelAni.x = this.icon0.x + this.icon0.width / 2;
			this.modelAni.y = this.icon0.y + this.icon0.height / 2;
			this.icon0.parent.addChildAt(this.modelAni, this.icon0.parent.getChildIndex(this.icon0));
			DisplayUtils.upDownGroove(this.modelAni, -12, 0);
			return;
		}
		this.modelAni.playFile(RES_DIR_EFF + eff, -1);
		DisplayUtils.upDownGroove(this.modelAni, -12, 0);
	}
	/**设置属性描述*/
	public setDesc(init: number, index: number, hinfo: HeirloomInfo | HeirloomEquipConfig) {
		let info: HeirloomInfo | HeirloomEquipConfig;
		if (init == HeirloomWin.Heir_Init) {//刚进入界面初始化模型
			if (index > 0) return;//只初始化第一个装备

		}
		else if (init == HeirloomWin.Heir_Select) {
			//模型只展示当前选中的
			if (this.curIndex != index)
				return;
		}
		info = hinfo;
		let attr: { type: number, value: number }[] = [];
		let config: HeirloomEquipConfig;
		//激活
		if (info && info.lv > 0) {
			attr = info.attr;
		}
		//未激活
		else {
			config = GlobalConfig.HeirloomEquipConfig[index + 1][1];
			attr = config.attr;
		}

		for (let i = 0; i < 6; i++) {
			// this["attr"+i].text = "+"+attr[i].value;
			switch (attr[i].type) {//AttributeData->getAttrStrByType
				case AttributeType.atAttack://攻击
					this.desc0.text = "攻击";
					this.attr0.text = "+" + attr[i].value;
					break;
				case AttributeType.atMaxHp://生命
					this.desc1.text = "生命";
					this.attr1.text = "+" + attr[i].value;
					break;
				case AttributeType.atDef://物防
					this.desc2.text = "物防";
					this.attr2.text = "+" + attr[i].value;
					break;
				case AttributeType.atRes://法防
					this.desc3.text = "法防";
					this.attr3.text = "+" + attr[i].value;
					break;
				case AttributeType.atCrit://暴击伤害
				case AttributeType.atCritHurt:
					this.desc4.text = "暴击";
					this.attr4.text = "+" + attr[i].value;
					break;
				case AttributeType.cruNeiGong://内功值
				case AttributeType.maxNeiGong:
					this.desc5.text = "内功";
					this.attr5.text = "+" + attr[i].value;
					break;
			}
		}
		//XX部件所有属性 读基础属性表
		let swType = info.slot ? info.slot : config.slot;
		let str = "";
		switch (swType) {
			case HeirloomSlot.wq:
				str = `武器`;
				break;
			case HeirloomSlot.tk:
				str = `头盔`;
				break;
			case HeirloomSlot.yf:
				str = `衣服`;
				break;
			case HeirloomSlot.xl:
				str = `项链`;
				break;
			case HeirloomSlot.hw:
				str = `手镯`;
				break;
			case HeirloomSlot.yd:
				str = `腰带`;
				break;
			case HeirloomSlot.jz:
				str = `戒指`;
				break;
			case HeirloomSlot.xz:
				str = `鞋子`;
				break;
		}
		let attrAdd = info.attr_add ? info.attr_add : config.attr_add;
		this.desc6.text = str + "部件所有属性";
		this.attr6.text = "+" + attrAdd + "%";
		this.attr6.x = this.desc6.x + this.desc6.width + 20;
	}
	/**设置消耗数据*/
	public setCost(init: number, index: number, hinfo: HeirloomInfo | HeirloomEquipConfig) {
		let info: HeirloomInfo | HeirloomEquipConfig;
		if (init == HeirloomWin.Heir_Init) {//刚进入界面初始化模型
			if (index > 0) return;//只初始化第一个装备
			info = hinfo;
		}
		else if (init == HeirloomWin.Heir_Select) {
			//模型只展示当前选中的
			if (this.curIndex != index)
				return;
			info = hinfo;
		}
		else if (init == HeirloomWin.Heir_LRBtn) {
			info = this.getInitInfo();
		}

		//激活
		let config: HeirloomEquipConfig | HeirloomEquipFireConfig; //| HeirloomEquipItemConfig;
		if (info.lv > 0) {
			config = GlobalConfig.HeirloomEquipConfig[info.slot][info.lv];
		}
		//未激活
		else {
			// config = GlobalConfig.HeirloomEquipItemConfig[info.slot+1];
			config = GlobalConfig.HeirloomEquipFireConfig[index + 1];
		}

		if (config) {
			let expend: { id: number, count: number } = config.expend;
			// this.icon.x = this.expendLabel.x + this.expendLabel.width;
			// this.countLabel.x = this.icon.x + this.icon.width;
			this.jihuo.visible = true;
			this.expendLabel.text = "消耗: ";
			if (!expend) {
				this.expendLabel.text = "";
				this.countLabel.text = "已满级";
				this.jihuo.visible = false;
				// this.icon.x = this.expendLabel.x;
				// this.countLabel.x = this.icon.x + this.icon.width;
				return;
			}
			let equipConfig: ItemConfig = GlobalConfig.ItemConfig[expend.id];
			if (!equipConfig) {
				return;
			}
			this.icon.source = equipConfig.icon.toString() + "_png";
			let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);//当前背包材料数量
			let costItemLen: number = itemData ? itemData.count : 0;
			// this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`${costItemLen}/${expend.count}`);
			let colorStr: string = "";
			if (costItemLen >= expend.count)
				colorStr = ColorUtil.GREEN_COLOR;
			else
				colorStr = ColorUtil.RED_COLOR;
			this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${costItemLen}</font><font color=${ColorUtil.WHITE_COLOR}>/${expend.count}</font> `);
		}
	}
	//判断材料是否足够
	public check(info: HeirloomInfo | HeirloomEquipConfig) {
		//激活
		let config: HeirloomEquipConfig | HeirloomEquipFireConfig; //| HeirloomEquipItemConfig;
		let func: any;
		let costItemLen: number = 0;
		let need: number = 0;
		if (info.lv > 0) {
			config = GlobalConfig.HeirloomEquipConfig[info.slot][info.lv];
		}
		//未激活
		else {
			// config = GlobalConfig.HeirloomEquipItemConfig[info.slot+1];
			config = GlobalConfig.HeirloomEquipFireConfig[this.curIndex + 1];
		}
		if (config) {
			let expend: { id: number, count: number } = config.expend;
			if (!expend) {
				return HeirloomWin.Heir_TIPS_2;
			}
			let equipConfig: ItemConfig = GlobalConfig.ItemConfig[expend.id];
			if (!equipConfig) {
				return HeirloomWin.Heir_TIPS_0;
			}
			let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);//当前背包材料数量
			costItemLen = itemData ? itemData.count : 0;
			need = expend.count;
		}

		if (costItemLen >= need) {
			return HeirloomWin.Heir_TIPS_1;
		}
		return HeirloomWin.Heir_TIPS_0;
	}
	public getInitInfoEx(role: Role, index: number): HeirloomInfo {
		let idx: number = index;
		let info: HeirloomInfo = role.heirloom.getInfoBySolt(idx);
		return info;
	}
	//获取诛仙装备数据
	public getInitInfo(index?: number): HeirloomInfo {
		let idx: number = index != null ? index : this.curIndex;
		let curRole = this.roleSelect.getCurRole();
		let role: Role = SubRoles.ins().getSubRoleByIndex(curRole);
		let info: HeirloomInfo = role.heirloom.getInfoBySolt(idx);
		return info;
	}
	//获取某个部位的某个等级数据
	public getSlotInfoByLv(slot: number, lv: number): HeirloomEquipConfig {
		let curRole = this.roleSelect.getCurRole();
		let role: Role = SubRoles.ins().getSubRoleByIndex(curRole);
		let config: HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[slot][lv];
		return config;
	}
	//齐鸣等级图标设置
	private setSuitLvIcon(): void {
		//heirqm_0
		let curRole = this.roleSelect.getCurRole();
		let role: Role = SubRoles.ins().getSubRoleByIndex(curRole);
		let hinfos: HeirloomInfo[] = role.heirloom.getData();
		let minLv: number = 0;
		let everyLv: boolean = true;//判断是否每一件lv都>0
		for (let i = 0; i < hinfos.length; i++) {
			let info: HeirloomInfo = hinfos[i];
			if (i == 0)
				minLv = info.lv;
			if (!info.lv && everyLv)
				everyLv = false;
			if (info.lv <= minLv)
				minLv = info.lv;
		}

		this.neatSet.currentState = minLv.toString();

	}

	/**设置红点*/
	public setRedPoint(): void {
		let isShowRedPoint: boolean = false;
		for (let i = 0; i < 8; i++) {
			let info: HeirloomInfo = this.getInitInfo(i);
			let config: HeirloomEquipFireConfig | HeirloomEquipConfig;
			if (info.lv) {
				// this["pos"+i].redPoint.visible = false;
				// continue;
				config = GlobalConfig.HeirloomEquipConfig[info.slot][info.lv];
			} else {
				config = GlobalConfig.HeirloomEquipFireConfig[i + 1];
			}
			let costItemLen: number = 0;
			let need: number = 0;
			if (config) {
				let expend: { id: number, count: number } = config.expend;
				if (!expend) {
					this["pos" + i].redPoint.visible = false;
					continue;
				}
				let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);//当前背包材料数量
				costItemLen = itemData ? itemData.count : 0;
				need = expend.count;
			}
			if (costItemLen >= need)
				this["pos" + i].redPoint.visible = true;
			else
				this["pos" + i].redPoint.visible = false;

			//检查是否有可分解
			if (!this["pos" + i].redPoint.visible) {
				let cfg: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[config.slot];
				let itemData: ItemData = UserBag.ins().getBagItemById(cfg.item);
				this["pos" + i].redPoint.visible = itemData ? true : false;
			}

			if (!isShowRedPoint)
				isShowRedPoint = this["pos" + i].redPoint.visible;

		}
		//人物头像红点
		if (isShowRedPoint) {
			let curRole: number = this.roleSelect.getCurRole();
			this.roleSelect.showRedPoint(curRole, isShowRedPoint);
		}
	}

	private setPower() {
		let roleId = this.roleSelect.getCurRole();
		let power: number = SubRoles.ins().getSubRoleByIndex(roleId).getAllHeirloomPower();
		this.powerPanel.setPower(power)
	}

}

ViewManager.ins().reg(HeirloomWin, LayerManager.UI_Main);