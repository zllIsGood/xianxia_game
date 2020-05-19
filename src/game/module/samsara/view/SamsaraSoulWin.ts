/**
 * Created by Peach.T on 2017/12/19.
 */
class SamsaraSoulWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public attrGroup3: eui.Group;
	public deter0: eui.Image;
	public desc0: eui.Label;
	public powerPanel3: PowerPanel;
	public attr3: eui.Label;
	public attrGroup0: eui.Group;
	public powerPanel0: PowerPanel;
	public attr0: eui.Label;
	public attrGroup1: eui.Group;
	public powerPanel1: PowerPanel;
	public attr1: eui.Label;
	public arrow0: eui.Image;
	public dinghong: eui.Group;
	public findItemTxt0: eui.Label;
	public soulBtn: eui.Button;
	public redPoint: eui.Image;
	public chainImg: eui.Image;
	public soulImg: eui.Image;
	public chainGroup: eui.Group;
	public chainName0: eui.Label;
	public chainLv0: eui.Label;
	public chainPos: eui.Label;
	public chainAttr: eui.Label;
	public chainState: eui.Label;
	public chainValue: eui.Label;
	public nextChain0: eui.Label;
	public nextChainDesc: eui.Label;
	public nextChainDesc1: eui.Label;
	public soulGroup: eui.Group;
	public soulName: eui.Label;
	public soulLvText: eui.Label;
	public soulAttr: eui.Label;
	public nextChain1: eui.Label;
	public nextSoulTextGroup: eui.Group;
	public nextChainTextGroup: eui.Group;
	public closeBtn: eui.Button;
	public materialLabel: eui.Label;
	public num: eui.Label;
	public needNum: eui.Label;
	public rein_title: eui.Image;
	public costImg: eui.Image;

	private itemId:number;
	private soulLv:number;
	private soulLinkLv:number;
	private subType:number;
	private roleIndex:number;
	public item1:ReincarnateItemIcon;

	constructor() {
		super();
		this.skinName = "ReincarnateSoulSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.observe(UserEquip.ins().postAddSoul, this.updateView);
		this.addTouchEvent(this.soulBtn, this.addSoul);
		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.roleIndex = param[0];
		this.subType = param[1];
		this.updateView();

		let config = param[2];
		this.item1.SetData(config);
		this.item1.SetSoul(true);
	}
	
	protected closeWin(): void {
		ViewManager.ins().close(this);
	}

	private addSoul(): void {
		UserEquip.ins().requestAddSoul(this.roleIndex, this.subType);
	}

	private updateView(): void {
		let role = SubRoles.ins().getSubRoleByIndex(this.roleIndex);
		let data: EquipsData = role.getEquipByIndex(this.subType);
		this.itemId = data.item.itemConfig.id;
		let mainEquip: EquipsData = role.getEquipByIndex(this.subType);
		this.soulLv = mainEquip.soulLv;
		this.soulLinkLv = SamsaraModel.ins().getSoulLinkLv(role, this.subType, mainEquip.soulLv);

		let itemCfg = GlobalConfig.ItemConfig[this.itemId];
		let subType = ItemConfig.getSubType(itemCfg); 
		let job = ItemConfig.getJob(itemCfg);
		let maxLv = SamsaraModel.ins().getSoulMaxLevel();
		let isSoulMax = this.soulLv == maxLv;
		let isChainMax = this.soulLinkLv == maxLv;
		this.nextSoulTextGroup.visible = !(this.soulLv == 0 || isSoulMax);
		this.nextChainTextGroup.visible = !(this.soulLinkLv ==0 || isChainMax);
		if (this.nextChainTextGroup.visible) {
			let tempCfg = SamsaraModel.ins().getReincarnationLinkLevel(subType, this.soulLinkLv + 1);
			this.nextChain0.text = tempCfg.attrs[0].value / 100 + "%";
			// let color;
			// if(this.soulLinkLv == 0){
			// 	color = 0x666666;
			// }else {
			// 	color = 0x00FF00;
			// }
			// this.nextChainDesc.textColor = color;
			// this.nextChainDesc1.textColor = color;
			// this.nextChain0.textColor = color;
		}
		if (this.nextSoulTextGroup.visible) {
			let tempCfg = GlobalConfig.ReincarnationDemonLevel[subType][this.soulLv + 1];
			this.nextChain1.text = (100 + tempCfg.precent/100) + "%";
		}
		let showSoulLinkLv = 0;
		if (this.soulLinkLv == 0) {
			showSoulLinkLv = 1;
		}
		else {
			showSoulLinkLv = this.soulLinkLv;
		}
		let showSoulLv = 0;
		if (this.soulLv == 0) {
			showSoulLv = 1;
		} else {
			showSoulLv = this.soulLv;
		}

		let cfg = SamsaraModel.ins().getReincarnationLinkLevel(subType, showSoulLinkLv);
		this.chainPos.text = `[魔魂${Role.getEquipNameByType(cfg.secondSlot)}]`;
		this.chainAttr.text = SamsaraModel.ins().getSoulLinkDesc(cfg.attrs[0].type);
		this.chainState.text = "增加";
		this.chainValue.text = (cfg.attrs[0].value / 100) + "%";

		let demon = GlobalConfig.ReincarnationDemonLevel[subType][showSoulLv];
		let soulAttrDesc;
		let per = demon.precent / 100;
		per += 100;
		soulAttrDesc = per + "%";
		this.soulAttr.text = soulAttrDesc;

		let soulCfg = GlobalConfig.ReincarnationSoulLevel[job][subType][showSoulLv];
		let attrDesc = AttributeData.getAttStr(soulCfg.attrs, 0, 1, "  :  ");
		// attrDesc += `\n神圣伤害 : ${this.getValue(soulCfg.ex_attrs, 54)}`;
		let power = UserBag.getAttrPower(soulCfg.attrs);
		power += this.getChainAddPower(this.soulLinkLv);//伤害加成
		power += this.getSoulAddPower(data, this.soulLv);//基础属性加成
		if (!isSoulMax) this.powerPanel0.setPower(power);
		if (this.soulLv == 0) {
			this.attr0.text = "攻击：0\n物防：0\n魔防：0\n生命：0\n神圣伤害：0";
			this.powerPanel0.setPower(0);
		}
		else {
			this.attr0.text = attrDesc;
		}
		let nextSoulCfg;
		if (isSoulMax) {
			this.attrGroup0.visible = false;
			this.attrGroup1.visible = false;
			this.attrGroup3.visible = true;
			this.attr3.text = attrDesc;
			this.powerPanel3.setPower(power);

		} else {
			this.attrGroup0.visible = true;
			this.attrGroup1.visible = true;
			this.attrGroup3.visible = false;
			nextSoulCfg = GlobalConfig.ReincarnationSoulLevel[job][subType][this.soulLv + 1];
			let attrDesc1 = AttributeData.getAttStr(nextSoulCfg.attrs, 0, 1, "  :  ");
			// attrDesc1 += `\n神圣伤害 : ${this.getValue(nextSoulCfg.ex_attrs, 54)}`;
			this.attr1.text = attrDesc1;

			let nextPower = UserBag.getAttrPower(nextSoulCfg.attrs);
			nextPower += this.getChainAddPower(this.soulLinkLv + 1);//伤害加成
			nextPower += this.getSoulAddPower(data, this.soulLv + 1);//基础属性加成
			this.powerPanel1.setPower(nextPower);
		}

		this.chainLv0.text = `Lv${showSoulLinkLv}`;
		this.soulLvText.text = `Lv${showSoulLv}`;

		let materialId = soulCfg.materialInfo.id;
		let count = UserBag.ins().getItemCountById(0, materialId);
		let isCanAdd = false;
		if(nextSoulCfg)isCanAdd = (count >= nextSoulCfg.materialInfo.count);
		this.materialLabel.text = GlobalConfig.ItemConfig[materialId].name;
		this.costImg.source = GlobalConfig.ItemConfig[materialId].icon + '_png';;
		this.num.text = count.toString();
		if(nextSoulCfg){
			this.needNum.text = "/" + nextSoulCfg.materialInfo.count.toString();
		}
		else {
			this.needNum.text = "/0";
		}
		this.soulBtn.enabled = isCanAdd && !isSoulMax;
		if (isCanAdd) {
			this.num.textColor = ColorUtil.GREEN_COLOR_N;
		}
		else {
			this.num.textColor = ColorUtil.RED_COLOR_N;
		}
		this.redPoint.visible = isCanAdd && !isSoulMax;
		this.arrow0.visible = !isSoulMax;
		this.rein_title.source = `rein_demon_soul_${job}${subType}`;
	}

	/**
	 * 获取灵魂锁链加成的战斗力
	 * @param soulLinkLv
	 * @returns {number}
	 */
	private getChainAddPower(soulLinkLv:number): number
	{
		if(soulLinkLv == 0)return 0;
		let cfg = SamsaraModel.ins().getReincarnationLinkLevel(this.subType, soulLinkLv);
		let role = SubRoles.ins().getSubRoleByIndex(this.roleIndex);
		let temp = UserBag.getAttrPower([cfg.attrs[0]]) + ItemConfig.relatePower(cfg.attrs[0], role);
		return temp >> 0;
	}

	private getSoulAddPower(equipData: EquipsData, soulLv: number): number
	{
		if(soulLv == 0)return 0;
		let cfg = GlobalConfig.ReincarnationDemonLevel[this.subType][soulLv];
		let percent = cfg.precent / 10000;
		let baseAttrs = ItemConfig.getBaseAttrData(equipData.item.itemConfig);
		return (UserBag.getAttrPower(baseAttrs)*percent) >> 0;

		// let equip = GlobalConfig.EquipConfig[equipData.item.itemConfig.id];
		// let point = equipData.item.point;
		// let holyAttr = 0;
		// let power = 0;
		// if(equip.baseAttr2){
		// 	holyAttr = UserBag.getAttrPower([equip.baseAttr2]);
		// 	power = (point - holyAttr) *  percent;
		// }
		// return power >> 0;
	}

	private getValue(attrs: AttributeData[], typeValue: number): string {
		let obj = CommonUtils.getObjectByAttr(attrs, "type", typeValue);
		return obj.value.toString();
	}
}

ViewManager.ins().reg(SamsaraSoulWin, LayerManager.UI_Main);
