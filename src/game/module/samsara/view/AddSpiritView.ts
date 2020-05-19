/**
 * 附灵页面
 * Created by Peach.T on 2017/11/29.
 */
class AddSpiritView extends BaseEuiView {
	public barGroup: eui.Group;
	public expBar: eui.ProgressBar;
	public barBg1: eui.Image;
	public dinghong: eui.Group;
	public upBtn: eui.Button;
	public redPoint: eui.Image;
	public powerPanel: PowerPanel;
	public lunhuiList: eui.List;
	public arrow: eui.Image;
	public attrGroup0: eui.Group;
	public attr0: eui.Label;
	public attr1: eui.Label;
	public attr2: eui.Label;
	public attr3: eui.Label;
	public attrGroup1: eui.Group;
	public attr4: eui.Label;
	public attr5: eui.Label;
	public attr6: eui.Label;
	public attr7: eui.Label;
	public attrGroup2: eui.Group;
	public attr8: eui.Label;
	public attr9: eui.Label;
	public attr10: eui.Label;
	public attr11: eui.Label;
	public expLabel: eui.Label;
	public lvTxt: eui.Label;
	public bgClose: eui.Rect;

	private roleIndex;
	private index;

	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "ReincarnateSpiritSkin";
	}

	public open(...param: any[]): void {
		this.lunhuiList.itemRenderer = ItemBase;
		this.addTouchEvent(this.upBtn, this.addSpirit);
		this.addTouchEvent(this.bgClose, this.closeWin);
		this.observe(UserEquip.ins().postAddSpirit, this.updateView);

		this.index = param[1];
		this.roleIndex = param[0];
		this.updateView();
	}

	private updateView(): void {
		let role = SubRoles.ins().getSubRoleByIndex(this.roleIndex);
		let data: EquipsData = role.getEquipByIndex(this.index);
		this.setData(data);
	}

	private addSpirit(): void {
		let data = this.lunhuiList.dataProvider;
		// if (SamsaraModel.ins().checkSpiritLvIsMax(this.equipData, this.index)) {
		// 	UserTips.ins().showTips("装备附灵等级已满级");
		// 	return;
		// }
		if (data.length == 0) {
			UserTips.ins().showTips("没有可以附灵的装备");
		}
		else {
			let filterAry: number[] = [];
			for (let i = 0; i < data.length; i++) {
				let id = data.getItemAt(i);
				let itemData = UserBag.ins().getFilterBagItemById(id, filterAry, UserBag.BAG_TYPE_EQUIP);
				if (itemData && itemData.handle) {
					filterAry.push(itemData.handle);
				}
			}
			if (filterAry.length > 0) UserEquip.ins().requestAddSpirit(this.roleIndex, this.index, filterAry);
		}
	}

	private setData(data: EquipsData): void {
		let lv = data.spiritLv;
		this.lvTxt.text = `(Lv.${lv})`;

		let cfg = CommonUtils.getObjectByUnionAttr(GlobalConfig.ReincarnateSpirit, this.index, lv);
		let nextCfg = CommonUtils.getObjectByUnionAttr(GlobalConfig.ReincarnateSpirit, this.index, lv + 1);
		let power = 0;

		this.attr4.text = "0"; //填充基础属性
		this.attr5.text = "0";
		this.attr6.text = "0";
		this.attr7.text = "0";
		if (cfg) {
			power = UserBag.getAttrPower(cfg.attrs);
			this.attr4.text = cfg.attrs[0].value.toString(); //填充基础属性
			this.attr5.text = cfg.attrs[1].value.toString();
			this.attr6.text = cfg.attrs[2].value.toString();
			this.attr7.text = cfg.attrs[3].value.toString();
		}
		this.powerPanel.setPower(power);

		if (lv == CommonUtils.getObjectLength(GlobalConfig.ReincarnateSpirit[this.index])) {
			this.attrGroup2.visible = false;
			this.expBar.maximum = 100;
			this.expBar.value = 100;
		}
		else {
			this.attrGroup2.visible = true;
			this.attr8.text = nextCfg.attrs[0].value.toString(); //填充基础属性
			this.attr9.text = nextCfg.attrs[1].value.toString();
			this.attr10.text = nextCfg.attrs[2].value.toString();
			this.attr11.text = nextCfg.attrs[3].value.toString();
			this.expBar.maximum = nextCfg.consume;
			this.expBar.value = data.spiritExp;
		}
		this.expLabel.text = this.expBar.value + "/" + this.expBar.maximum;

		let samsaraLv = SamsaraModel.ins().getEquipSamsaraLv(data.item.itemConfig.id);
		let role:Role = SubRoles.ins().getSubRoleByIndex(this.roleIndex);
		let ary = SamsaraModel.ins().getAddSpiritEquips(role, this.index);
		this.lunhuiList.dataProvider = new ArrayCollection(ary);

		this.redPoint.visible = SamsaraModel.ins().checkEquipPosCanAddSpirit(role, this.index);
	}

	public closeWin(): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(AddSpiritView, LayerManager.UI_Popup);