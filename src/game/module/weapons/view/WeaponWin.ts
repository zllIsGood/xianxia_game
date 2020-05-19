/**
 * 剑灵主界面
 *
 */
class WeaponWin extends BaseEuiView {
	private upInfo: eui.Group;
	//attr0-4
	private list1: eui.List;

	private desc1: eui.Label;//文字:使用剑灵
	private desc2: eui.Label;//文字:激活技能

	private powerPanel: PowerPanel;

	public roleId: number;
	public weaponId: number;//选中的剑灵
	private listdata: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number }[];
	private dataArr: eui.ArrayCollection;
	private soulArr: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number }[];
	private leftbtn: eui.Image;
	private rightbtn: eui.Image;

	private turnBtn: eui.Button;//兵魂之灵入口
	private redPoint0: eui.Image;

	private normal: eui.Group;//兵魂界面
	private soul: eui.Group;//兵魂之灵界面
	/**兵魂之灵*/
	private leftbtn0: eui.Image;
	private rightbtn0: eui.Image;
	private list0: eui.List;
	private skill: eui.Label;
	private skillicon0: WeaponSkillItem;
	private skillname0: eui.Label;
	private active: eui.Button;
	private redPoint: eui.Image;
	private nothingTips: eui.Label;
	private bg: eui.Image;
	public weaponFlexible: number;//选中的兵魂之灵(兵魂id)
	private backBtn: eui.Button;
	private redPoint1: eui.Image;
	private descGroup: eui.Label;
	private desc: eui.Label;
	private list0Scroll: eui.Scroller;
	private list1Scroll: eui.Scroller;
	private isSendActFlex: boolean;//发送的是激活兵魂 用于区分刷新按钮状态
	constructor() {
		super();
		this.skinName = 'weaponSoulSkin';
		this.isTopLevel = true;
	}

	//关闭兵魂之灵重置兵魂界面
	private closeSoulCondition(b: boolean) {
		this.normal.visible = b;
		this.soul.visible = !b;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.leftbtn, this.onEvent);
		this.removeTouchEvent(this.rightbtn, this.onEvent);
		// this.removeTouchEvent(this.list1, this.onEvent);
		this.removeTouchEvent(this.list1, this.onClick);
		// this.list1.removeEventListener(egret.Event.CHANGE, this.onClick, this);
		this.removeObserve();
		(ViewManager.ins().getView(ForgeWin) as ForgeWin).isNotMove = false;
		// for( let i = 0; i < this.list1.numElements;i++ ){
		// 	let item:WeaponListItem = (this.list1.getElementAt(i) as WeaponListItem);
		// 	this.removeTouchEvent(item, this.onClick);
		// }
	}
	public open(...param: any[]): void {
		(ViewManager.ins().getView(ForgeWin) as ForgeWin).isNotMove = true;
		this.roleId = param[0];
		this.addTouchEvent(this.leftbtn, this.onEvent);
		this.addTouchEvent(this.rightbtn, this.onEvent);
		this.addTouchEvent(this.active, this.onEvent);
		this.addTouchEvent(this.turnBtn, this.onEvent);
		this.addTouchEvent(this.backBtn, this.onEvent);
		this.addTouchEvent(this.leftbtn0, this.onEvent);
		this.addTouchEvent(this.rightbtn0, this.onEvent);
		this.addChangeEvent(this.list1, this.onEvent);
		this.addTouchEvent(this.list1, this.onClick);
		this.addEvent(eui.UIEvent.CHANGE_END, this.list1Scroll, this.onChange);
		this.addEvent(eui.UIEvent.CHANGE_END, this.list0Scroll, this.onChangeFlex);
		this.list0.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onSoulClick, this);
		// this.list1.addEventListener(egret.Event.CHANGE, this.onClick, this)
		this.observe(Weapons.ins().postWeaponsAct, this.callback);
		this.observe(Weapons.ins().postWeaponsUse, this.callback);
		this.observe(Weapons.ins().postWeaponsUpLevel, this.callback);
		this.observe(Weapons.ins().postWeaponsFlexibleAct, this.callback1);
		this.observe(Weapons.ins().postWeaponsFlexibleCount, this.callback);
		this.list1.itemRenderer = WeaponListItem;
		this.list0.itemRenderer = WeaponListItem;
		this.leftbtn.parent.touchEnabled = false;
		// this.observe(UserBag.ins().postItemDel, this.updateData);
		this.weaponId = 1;
		this.closeSoulCondition(param[1]);//切换兵魂之灵的前置条件
		this.updateBtn();
		this.initWeapon(this.weaponId);

		this.list1.useVirtualLayout = true;
		// for( let i = 0; i < this.list1.numElements;i++ ){
		// 	let item:WeaponListItem = (this.list1.getElementAt(i) as WeaponListItem);
		// 	this.addChangeEvent(item, this.onClick);
		// }

	}

	private updateBtn() {
		this.turnBtn.visible = true;
	}

	public initWeapon(selectId: number) {
		this.soulArr = [];
		this.listdata = [];
		this.dataArr = new eui.ArrayCollection(this.listdata);
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		for (let k in GlobalConfig.WeaponSoulConfig) {
			let wsconfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[k];
			let wsinfo: WeaponsSoulInfo = role.weapons.getSoulInfoData()[wsconfig.id];
			let wss: WeaponSoulSuit = role.weapons.getSuitConfig(wsconfig.id);
			let tmp: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } = {
				isuse: role.weapons.weaponsId == wsconfig.id ? true : false,
				id: wss ? wss.id : 0,//用作判断是否激活
				isRedPoint: role.weapons.getRedPointBySuit(wsconfig.id),
				level: wss ? wss.level : 0,
				isSelect: k == selectId.toString() ? true : false,
				showId: wsconfig.id,//用作显示的剑灵数据
				job: role.job
			};
			this.listdata.push(tmp);
			//兵魂之灵只展示激活的兵魂
			if (wsinfo && wsinfo.id && wss)
				this.soulArr.push(tmp);
			// if( k == selectId.toString() )
			// if( tmp.isuse )
			// 	this.updateUI(wsconfig.id);
		}
		this.updateUI();
		this.list1.dataProvider = this.dataArr;
		this.list1.scrollH = 0;
		this.onChange();
		this.updateSoul(this.soulArr, true);
		this.updateRedPoint();
		this.onChangeFlex();
	}
	public setSelectId(selectId: number) {
		for (let i = 0; i < this.listdata.length; i++) {
			let tmp: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } = this.listdata[i];
			tmp.isSelect = i == selectId ? true : false;
		}
		this.dataArr.replaceAll(this.listdata);
		this.list1.dataProvider = this.dataArr;
	}

	private onSoulClick(e: eui.ItemTapEvent) {
		if (e && e.itemRenderer && e.item) {
			let info: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } = e.item as { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number };
			let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
			let fb: number[] = role.weapons.getFlexibleData();
			let wsconfig: WeaponSoulSuit = role.weapons.getSuitConfig(info.id);
			if (wsconfig) {
				let color = "";
				if (info.isuse) {
					color = `|C:0xffd93f&T:`;
					this.active.visible = true;
				} else {
					this.active.visible = role.weapons.flexibleCount <= fb.length ? false : true;
				}
				this.weaponFlexible = wsconfig.id;
				this.skillicon0.data = {icon: wsconfig.skillicon};
				this.skill.textFlow = TextFlowMaker.generateTextFlow1(color + wsconfig.skilldesc);
				this.skillname0.textFlow = TextFlowMaker.generateTextFlow1(wsconfig.skillname);
			} else {
				this.weaponFlexible = 0;
			}
			if (info.isuse) {//激活使用中
				this.active.label = "取  消";
				this.redPoint.visible = false;
			} else {
				this.active.label = "激  活";
				this.redPoint.visible = role.weapons.flexibleCount <= fb.length ? false : true;
			}

		}
	}


	public onClick(e: egret.TouchEvent) {
		let selectIndex: number = e.currentTarget.selectedIndex;
		selectIndex = selectIndex > 0 ? selectIndex : 0;
		if (this.listdata[selectIndex]) {
			this.weaponId = this.listdata[selectIndex].showId;

			this.setSelectId(selectIndex);
			this.list1.visible = this.powerPanel.visible = false;
			ViewManager.ins().open(WeaponPanel, this.roleId, this.weaponId, () => {
				this.list1.visible = this.powerPanel.visible = true;
			}, this);
		}
		this.onChange();
	}
	private onChange(): void {
		if (this.list1.scrollH < 150) {
			this.leftbtn.visible = false;
			this.rightbtn.visible = true;
		} else if (this.list1.scrollH >= (this.list1.dataProvider.length - 3) * 150) {
			this.leftbtn.visible = true;
			this.rightbtn.visible = false;
		} else {
			this.leftbtn.visible = true;
			this.rightbtn.visible = true;
		}

	}

	private onChangeFlex(): void {
		if (this.nothingTips.visible) {
			this.leftbtn0.visible = false;
			this.rightbtn0.visible = false;
			return;
		}
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		if (role && this.soulArr.length <= 3) {
			this.leftbtn0.visible = false;
			this.rightbtn0.visible = false;
			return;
		}
		if (this.list0.scrollH < 150) {
			this.leftbtn0.visible = false;
			this.rightbtn0.visible = true;
		} else if (this.list0.scrollH >= (this.list0.dataProvider.length - 3) * 150) {
			this.leftbtn0.visible = true;
			this.rightbtn0.visible = false;
		} else {
			this.leftbtn0.visible = true;
			this.rightbtn0.visible = true;
		}
	}

	public onEvent(e: egret.TouchEvent) {
		let num: number = 150 * 3;
		switch (e.currentTarget) {
			case this.leftbtn:
				if (this.list1.scrollH <= num)
					this.list1.scrollH = 0;
				else
					this.list1.scrollH -= num;
				break;
			case this.rightbtn:
				if (this.list1.scrollH >= ((this.list1.dataProvider.length - 3) * 150))
					this.list1.scrollH = (this.list1.dataProvider.length - 3) * 150;
				else
					this.list1.scrollH += num;
				break;
			case this.leftbtn0:
				if (this.list0.scrollH <= num)
					this.list0.scrollH = 0;
				else
					this.list0.scrollH -= num;
				break;
			case this.rightbtn0:
				if (this.list0.scrollH >= ((this.list0.dataProvider.length - 3) * 150))
					this.list0.scrollH = (this.list0.dataProvider.length - 3) * 150;
				else
					this.list0.scrollH += num;
				break;
			case this.active:
				if (this.active.label == "激  活") {
					//判定使用的个数是否大于当前激活的兵魂之灵数量
					//第一个是本身激活的兵魂 丹药是额外次数flexibleCount已经处理+1 所以这里不处理
					let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
					let fb: number[] = role.weapons.getFlexibleData();
					if (role.weapons.flexibleCount <= fb.length) {
						UserTips.ins().showCenterTips(`当前已激活${role.weapons.flexibleCount}个兵魂技能，请先取消任意一个`);
						return;
					}
					if (!this.weaponFlexible) {
						UserTips.ins().showCenterTips("兵魂之灵激活数据异常");
						return;
					}
					this.isSendActFlex = true;
					Weapons.ins().sendWeaponsFlexibleAct(this.roleId, WeaponFlex.act, this.weaponFlexible);
				} else if (this.active.label == "取  消") {
					if (!this.weaponFlexible) {
						UserTips.ins().showCenterTips("兵魂之灵取消数据异常");
						return;
					}
					this.isSendActFlex = true;
					Weapons.ins().sendWeaponsFlexibleAct(this.roleId, WeaponFlex.cancel, this.weaponFlexible);
				}
				break;
			case this.turnBtn://兵魂之灵入口
				this.close();
				this.open(this.roleId, false);
				let v: ForgeWin = ViewManager.ins().getView(ForgeWin) as ForgeWin;
				if (v)
					v.redPointEx();
				let item = UserBag.ins().getBagItemById(GlobalConfig.WeaponSoulBaseConfig.itemid);
				let r: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
				if (item && r.weapons.flexibleCount - 1 < GlobalConfig.WeaponSoulBaseConfig.maxItemNum) {
					ViewManager.ins().open(RoleChooseItemWin, this.roleId);
				}
				break;
			case this.backBtn:
				if (!UserBag.ins().getBagItemById(GlobalConfig.WeaponSoulBaseConfig.itemid)) {
					UserTips.ins().showTips(`背包内没有兵魂之灵`);
					return;
				}
				//使用兵魂之灵 弹出人物选择使用框
				ViewManager.ins().open(RoleChooseItemWin, this.roleId);

				//返回兵魂主界面
				// this.close();
				// this.open(this.roleId,true);
				// let view:ForgeWin = ViewManager.ins().getView(ForgeWin) as ForgeWin;
				// if( view )
				// 	view.redPointEx();
				break;
		}
		this.onChange();
		this.onChangeFlex();
	}
	/**
	 * @param 剑灵id
	 * **/
	private updateUI() {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		this.powerPanel.setPower(role.getWeaponTotalPower());
		//
		// let wss:WeaponSoulSuit = role.weapons.getSuitConfig(id);
		// if( !wss ){
		// 	for (let k in GlobalConfig.WeaponSoulSuit[id] ){
		// 		wss = GlobalConfig.WeaponSoulSuit[id][k];//取第一个
		// 		break;
		// 	}
		// }

		//所有剑灵属性集合
		let filterAttr = [4, 2, 6, 5];//显示属性过滤
		let attrValue = [0, 0, 0, 0];


		let infodata: Map<Map<WeaponsInfo>> = role.weapons.getInfoData();
		for (let k in infodata) {
			let wsinfo: Map<WeaponsInfo> = infodata[k];
			for (let w in wsinfo) {
				let info: WeaponsInfo = wsinfo[w];
				for (let j = 0; j < info.attr.length; j++) {//每个部位的属性
					let attr: { type: number, value: number } = info.attr[j];
					if (filterAttr.indexOf(attr.type) != -1) {
						for (let z = 0; z < filterAttr.length; z++) {//规定的几个属性
							if (filterAttr[z] == attr.type)
								attrValue[z] += attr.value;
						}
					}
				}

			}
		}
		// let wsSoulInfo:Map<WeaponsSoulInfo> = role.weapons.getSoulInfoData();
		// for( let k in wsSoulInfo ){//所有剑灵
		// 	let info:WeaponsSoulInfo = wsSoulInfo[k];
		// 	if( info.id ){
		// 		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[info.id];
		// 		for( let i = 0;i < wsconfig.actcond.length;i++ ){//此剑灵的所有部位
		// 			let slot:number = wsconfig.actcond[i];
		// 			let wsinfo:WeaponsInfo = role.weapons.getSlotByInfo(slot);
		// 			if( wsinfo ){
		// 				for( let j = 0;j < wsinfo.attr.length;j++ ){//每个部位的属性
		// 					let attr:{type:number,value:number} = wsinfo.attr[j];
		// 					if( filterAttr.indexOf(attr.type) != -1 ){
		// 						for( let z=0;z<filterAttr.length;z++ ){//规定的几个属性
		// 							if( filterAttr[z] == attr.type )
		// 								attrValue[z] += attr.value;
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }

		for (let i = 0; i < 4; i++) {//wss.attr.length
			if (this["attr" + i]) {
				let attname: string = AttributeData.getAttrStrByType(filterAttr[i]);
				this["attr" + i].text = attname + "+" + attrValue[i];
				// let attname:string = AttributeData.getAttrStrByType(wss.attr[i].type);//属性名
				// this["attr"+i].text = attname + "+" + wss.attr[i].value;
			}
		}
	}

	//消息返回更新处理
	private callback1() {
		this.soulArr = [];
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let wss: WeaponSoulSuit = role.weapons.getSuitConfig(this.weaponId);
		for (let k in this.listdata) {
			let wsinfo: WeaponsSoulInfo = role.weapons.getSoulInfoData()[this.listdata[k].showId];
			let info: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } = this.listdata[k];
			if (info.showId == this.weaponId) {
				info.isuse = role.weapons.weaponsId == this.weaponId ? true : false;
				info.id = wss ? wss.id : 0;
				info.isRedPoint = role.weapons.getRedPointBySuit(this.weaponId);
				info.level = wss ? wss.level : 0;
				info.isSelect = true;
				info.showId = this.weaponId;
			} else {
				info.isRedPoint = role.weapons.getRedPointBySuit(info.showId);
				info.isSelect = false;
				info.isuse = info.showId == role.weapons.weaponsId;
			}
			//兵魂之灵只展示激活的兵魂
			if (wsinfo && wsinfo.id)
				this.soulArr.push(info);

			// if( info.isuse )
			// 	this.updateUI(this.weaponId);
		}
		this.updateUI();
		this.dataArr.replaceAll(this.listdata);
		this.list1.dataProvider = this.dataArr;
		this.updateSoul(this.soulArr);
		this.updateActLabel();
		this.updateRedPoint();
	}
	//消息返回更新处理
	private callback() {
		this.soulArr = [];
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let wss: WeaponSoulSuit = role.weapons.getSuitConfig(this.weaponId);
		for (let k in this.listdata) {
			let wsinfo: WeaponsSoulInfo = role.weapons.getSoulInfoData()[this.listdata[k].showId];
			let info: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } = this.listdata[k];
			if (info.showId == this.weaponId) {
				info.isuse = role.weapons.weaponsId == this.weaponId ? true : false;
				info.id = wss ? wss.id : 0;
				info.isRedPoint = role.weapons.getRedPointBySuit(this.weaponId);
				info.level = wss ? wss.level : 0;
				info.isSelect = true;
				info.showId = this.weaponId;
			} else {
				info.isRedPoint = role.weapons.getRedPointBySuit(info.showId);
				info.isSelect = false;
				info.isuse = info.showId == role.weapons.weaponsId;
			}
			//兵魂之灵只展示激活的兵魂
			if (wsinfo && wsinfo.id)
				this.soulArr.push(info);

			// if( info.isuse )
			// 	this.updateUI(this.weaponId);
		}
		this.updateUI();
		this.dataArr.replaceAll(this.listdata);
		this.list1.dataProvider = this.dataArr;
		this.updateSoul(this.soulArr,true);
		this.updateActLabel();
		this.updateRedPoint();
	}

	/**
	 * 兵魂之灵
	 * @param arr 已激活的兵魂数组
	 * */
	private updateSoul(arr: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number }[], init?: boolean) {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		this.soulArr = [];
		if (role.weapons.flexibleCount) {
			for (let i = 0; i < arr.length; i++) {
				let info: { isuse: boolean, id: number, isRedPoint: boolean, level: number, isSelect: boolean, showId: number, job: number } =
					{
						isuse: Weapons.ins().checkIsUseFlexible(role.index, arr[i].id),//这里代表此兵魂是否有被使用兵魂之灵 用于显示使用标签
						id: arr[i].id,
						isRedPoint: ForgeRedPoint.ins().getFlexibleRedPointOnly(role.index, arr[i].showId),
						level: arr[i].level,
						isSelect: arr[i].isSelect,
						showId: arr[i].showId,
						job: arr[i].job
					};
				this.soulArr.push(info);
			}
		}
		this.list0.dataProvider = new eui.ArrayCollection(this.soulArr);

		//描述flexibleCount有数据的时候被强制+1了
		let count = role.weapons.flexibleCount ? role.weapons.flexibleCount - 1 : 0;
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(`|C:0xF8B141&T:当前已使用|C:0x00ff00&T:${count}|C:0xF8B141&T:个剑魂之灵，最多可以同时激活|C:0x00ff00&T:${count + 1}|C:0xF8B141&T:把剑魂技能效果`);
		//初始化兵魂之灵描述(默认选中第一把)
		if (init) {
			if (this.soulArr.length > 0 && role.weapons.flexibleCount) {
				this.active.visible = this.skillicon0.visible = this.skill.visible = this.skillname0.visible = true;
				let wsconfig: WeaponSoulSuit = role.weapons.getSuitConfig(this.soulArr[0].id);
				if (wsconfig) {
					let color = "";
					if (this.soulArr[0].isuse)
						color = `|C:0xffd93f&T:`;
					this.skillicon0.data = {icon: wsconfig.skillicon};
					this.skill.textFlow = TextFlowMaker.generateTextFlow1(color + wsconfig.skilldesc);
					this.skillname0.textFlow = TextFlowMaker.generateTextFlow1(wsconfig.skillname);
				}
				this.leftbtn0.visible = this.rightbtn0.visible = false;
				if (this.soulArr.length > 3) {
					this.rightbtn0.visible = true;
				}
				if (this.soulArr[0].isuse) {//激活使用中
					this.active.label = "取  消";
					this.redPoint.visible = false;
				} else {
					this.active.label = "激  活";
					let fb: number[] = role.weapons.getFlexibleData();
					this.active.visible = this.redPoint.visible = role.weapons.flexibleCount <= fb.length ? false : true;
				}
				this.weaponFlexible = this.soulArr[0].showId;//选中的兵魂之灵
			} else {
				this.redPoint.visible = false;
				this.leftbtn0.visible = this.rightbtn0.visible = false;
				this.active.visible = this.skillicon0.visible = this.skill.visible = this.skillname0.visible = false;
			}

			this.nothingTips.visible =  !this.skillicon0.visible;
			this.bg.visible = !this.nothingTips.visible
			if (this.nothingTips.visible) {
				if (!role.weapons.flexibleCount)
					this.nothingTips.text = `该角色尚未使用剑魂之灵`;
				else
					this.nothingTips.text = `目前尚未激活任何剑魂`;
			}
		}
	}

	private updateActLabel() {
		if (!this.isSendActFlex) {
			this.isSendActFlex = false;
			return;
		}
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let fb: number[] = role.weapons.getFlexibleData();
		this.isSendActFlex = false;
		let str = this.skill.text;
		if (this.active.label == "激  活") {
			this.active.label = "取  消";
			this.redPoint.visible = false;
			this.skill.textFlow = TextFlowMaker.generateTextFlow1(`|C:0xffd93f&T:${str}`);
		} else if (this.active.label == "取  消") {
			this.active.label = "激  活";
			// this.redPoint.visible = true;

			//判定使用的个数是否大于当前激活的兵魂之灵数量
			//第一个是本身激活的兵魂 丹药是额外次数flexibleCount已经处理+1 所以这里不处理
			this.active.visible = this.redPoint.visible = role.weapons.flexibleCount <= fb.length ? false : true;
			this.skill.textFlow = TextFlowMaker.generateTextFlow1(`|C:0x898989&T:${str}`);
		}
	}

	public destoryView(): void {
		super.destoryView();
	}

	/**是否在显示兵魂之灵*/
	public isShowSoul() {
		if (!this.soul)
			return false;
		return this.soul.visible;
	}

	/**兵魂界面红点*/
	public updateRedPoint() {
		let item: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WeaponSoulBaseConfig.itemid);
		//入口红点
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		this.redPoint0.visible = ForgeRedPoint.ins().getFlexibleRedPoint(this.roleId) || (item && role.weapons.flexibleCount - 1 < GlobalConfig.WeaponSoulBaseConfig.maxItemNum) ? true : false;

		//返回主界面红点
		// b = false;
		// for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
		// 	b = Weapons.ins().checkRedPoint(roleIndex);
		// 	if( b )
		// 		break;
		// }
		//使用兵魂之灵
		this.backBtn.visible = this.redPoint1.visible = (item && role.weapons.flexibleCount - 1 < GlobalConfig.WeaponSoulBaseConfig.maxItemNum) ? true : false;
	}
}
// ViewManager.ins().reg(WeaponWin, LayerManager.UI_Main);