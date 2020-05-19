/**
 * 具体剑灵界面
 *
 */
class WeaponPanel extends BaseEuiView {
	private upGradeBtn0: eui.Button;
	private redPoint: eui.Image;

	private desc1: eui.Label;//文字:使用剑灵
	private desc2: eui.Label;//文字:激活技能

	private ringname: eui.Label;//剑灵名字
	private levellabel: eui.Label;//剑灵等级

	private skillicon: WeaponSkillItem;
	private skillname: eui.Label;
	// private powerPanel: PowerPanel;
	private weaponShowPanel: WeaponShowPanel;
	private skill: eui.Label;
	private look: eui.Label;

	private roleId: number;
	private weaponId: number;//选中的剑灵

	private closeBtn: eui.Button;
	private huanhuaImage: eui.Group;
	private powerPanel: PowerPanel;
	private descGroup: eui.Group;
	private desc: eui.Label;
	private turnTxt: eui.Label;

	private closeCb: Function;
	private callObject: any;
	constructor() {
		super();
		this.skinName = 'weaponSoulSkin2';
		this.isTopLevel = true;
		// this.setSkinPart("powerPanel", new PowerPanel());
		// this.setSkinPart("weaponShowPanel", new WeaponShowPanel());
	}

	public close(...param: any[]): void {
		if (this.closeCb) {
			this.closeCb.call(this.callback);
			this.closeCb = this.callObject = null;
		}
	}
	public open(roleId: number, weaponId: number, closeCb: Function, callObject: any): void {
		this.addTouchEvent(this.look, this.onEvent);
		this.addTouchEvent(this.skillicon, this.onEvent);
		this.addTouchEvent(this.upGradeBtn0, this.onEvent);
		this.addTouchEvent(this.turnTxt, this.onEvent);
		this.addTouchEvent(this.closeBtn, this.onEvent);
		this.observe(Weapons.ins().postWeaponsAct, this.callback);
		this.observe(Weapons.ins().postWeaponsUse, this.callback);
		this.observe(Weapons.ins().postWeaponsUpLevel, this.callback);
		// this.observe(UserBag.ins().postItemDel, this.updateData);
		this.weaponShowPanel.open();
		this.roleId = roleId;
		this.weaponId = weaponId;
		this.closeCb = closeCb;
		this.callObject = callObject;
		this.init(this.weaponId);


	}

	public init(id: number) {
		this.updateUI(id);

	}

	/**
	 * @param 剑灵id
	 * **/
	private updateUI(id: number) {
		let wsconfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		if (!wsconfig) {
			for (let k in GlobalConfig.WeaponSoulConfig) {
				wsconfig = GlobalConfig.WeaponSoulConfig[k];
				break;
			}
		}

		let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		// this.powerPanel.setPower(role.power);

		//剑灵属性描述
		this.ringname.text = wsconfig.name;//剑灵名字
		let wsinfo: WeaponsSoulInfo = role.weapons.getSoulInfoData()[id];
		let wss: WeaponSoulSuit = role.weapons.getSuitConfig(id);
		let descex = "|C:0x00ff00&T:(已激活)";
		let color = "|C:0xffd93f&T:";
		if (!wsinfo || !wsinfo.id) {
			color = "";
			for (let k in GlobalConfig.WeaponSoulSuit[id]) {
				wss = GlobalConfig.WeaponSoulSuit[id][k];//取第一个
				break;
			}
		}
		if (role.weapons.getFlexibleData().indexOf(id) == -1)
			descex = "";
		//剑灵等级
		this.levellabel.text = wss.level + "阶";
		//技能框
		this.skillicon.data = { icon: wss.skillicon };
		//技能名
		this.skillname.text = wss.skillname;

		//战斗力
		this.powerPanel.setPower(role.getWeaponTotalPower(id));

		//剑灵所有属性
		let filterAttr = [4, 2, 6, 5];//显示属性过滤
		let attrValue = [0, 0, 0, 0];
		for (let i = 0; i < wsconfig.actcond.length; i++) {//此剑灵的所有部位
			let slot: number = wsconfig.actcond[i];
			let wsinfo: WeaponsInfo = role.weapons.getSlotByInfo(slot);
			if (wsinfo) {
				for (let j = 0; j < wsinfo.attr.length; j++) {//每个部位的属性
					let attr: { type: number, value: number } = wsinfo.attr[j];
					if (filterAttr.indexOf(attr.type) != -1) {
						for (let z = 0; z < filterAttr.length; z++) {//规定的几个属性
							if (filterAttr[z] == attr.type)
								attrValue[z] += attr.value;
						}
					}
				}
			}
		}

		for (let i = 0; i < 4; i++) {//wss.attr.length
			if (this["attr" + i]) {
				let attname: string = AttributeData.getAttrStrByType(filterAttr[i]);
				this["attr" + i].text = attname + "+" + attrValue[i];
				// let attname:string = AttributeData.getAttrStrByType(wss.attr[i].type);//属性名
				// this["attr"+i].text = attname + "+" + wss.attr[i].value;
			}
		}
		//特殊属性
		// for( let i = 0;i < wss.ex_attr.length;i++ ){
		// 	let attname:string = AttributeData.getAttrStrByType(wss.ex_attr[i].type);//属性名
		// 	this["attr4"].text = attname + "+" + wss.ex_attr[i].value;
		// 	break;
		// }
		//技能描述
		this.skill.textFlow = TextFlowMaker.generateTextFlow1(`${color}${wss.skilldesc}` + descex);

		//激活按钮是否显示
		let ws: WeaponsSoulInfo = role.weapons.getWeapsInfoBySoulId(id);
		if (this.turnTxt.parent)
			this.turnTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:剑魂之灵`);
		this.descGroup.visible = true;
		//只要角色使用了兵魂之灵就显示带跳转的提示
		if (role.weapons.flexibleCount) {
			this.desc.text = `使用后变更技能效果请前往`;
			if (!this.turnTxt.parent) {
				// this.turnTxt.visible = true;
				this.desc.parent.addChild(this.turnTxt);
			}
		} else {
			this.desc.text = `使用后将激活剑魂的技能效果`;
			// this.turnTxt.visible = false;
			DisplayUtils.removeFromParent(this.turnTxt);
		}
		if (!ws || !ws.id) {//套装id为0证明没激活
			this.upGradeBtn0.label = "激 活";
			this.huanhuaImage.visible = false;
			this.redPoint.visible = role.weapons.IsActivityWeapon(id);
			this.descGroup.visible = false;
		}
		else if (role.weapons.weaponsId == ws.id) {//选中的剑灵是正在使用的剑灵
			this.upGradeBtn0.label = "取 消";
			this.huanhuaImage.visible = true;
			this.redPoint.visible = false;
		}
		else if (!role.weapons.weaponsId) {//目前没有使用任何剑灵
			this.upGradeBtn0.label = "使 用";
			this.huanhuaImage.visible = false;
			this.redPoint.visible = true;
		} else {//替换
			this.upGradeBtn0.label = "替 换";
			this.huanhuaImage.visible = false;
			this.redPoint.visible = false;
		}
		//获得每一件部位的情况
		this.weaponShowPanel.init(id, this.roleId);


	}

	public onEvent(e: egret.Event) {
		switch (e.currentTarget) {
			case this.skillicon:
			case this.look:
				ViewManager.ins().open(WeaponSoulSkillTips, this.roleId, this.weaponId);
				break;
			case this.upGradeBtn0:
				let role: Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
				if (this.upGradeBtn0.label == "激 活") {
					//取最小等级套装 如果取不到配置证明其中一个部位未激活
					let minSuitConfig: WeaponSoulSuit = role.weapons.getSuitConfig(this.weaponId);
					if (!minSuitConfig) {
						UserTips.ins().showTips("还有部位未激活");
						return;
					}
					Weapons.ins().sendWeaponsAct(this.roleId, this.weaponId);
				}
				else if (this.upGradeBtn0.label == "使 用") {
					Weapons.ins().sendWeaponsUse(this.roleId, this.weaponId);
				}
				else if (this.upGradeBtn0.label == "取 消") {
					Weapons.ins().sendWeaponsUse(this.roleId, 0);
				}
				else if (this.upGradeBtn0.label == "替 换") {
					Weapons.ins().sendWeaponsUse(this.roleId, this.weaponId);
				}
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.turnTxt:
				let win: ForgeWin = ViewManager.ins().getView(ForgeWin) as ForgeWin;
				if (win) {
					win.weaponsoul.open(this.roleId, false);
				}
				ViewManager.ins().close(this);
				break;
		}
	}
	//消息返回更新处理
	private callback() {
		this.updateUI(this.weaponId);
	}

	public destoryView(): void {
		super.destoryView();
	}
}
ViewManager.ins().reg(WeaponPanel, LayerManager.UI_Popup);