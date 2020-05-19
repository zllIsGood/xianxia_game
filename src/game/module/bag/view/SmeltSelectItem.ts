/**
 *
 * @author
 *
 */
class SmeltSelectItem extends BaseItemRender {
	private itemIcon: ItemIcon;
	private lvLabel: eui.Label;
	private nameLabel: eui.Label;
	private gradeLabel: eui.Label;
	private attrLabel: eui.Label;
	public checkBoxs: eui.CheckBox;
	public arrowIcon: eui.Image;

	public translate = {
		'hp': AttributeType.atMaxHp,
		'atk': AttributeType.atAttack,
		'def': AttributeType.atDef,
		'res': AttributeType.atRes,
		'crit': AttributeType.atCrit,
		'tough': AttributeType.atTough
	}

	protected itemConfig: ItemConfig;

	constructor() {
		super();

		this.skinName = "SmeltSeletctItemSkin";
		this.touchChildren = false;

	}

	protected createChildren(): void {
		super.createChildren();
	}

	protected dataChanged(): void {

		if (this.data instanceof ItemData) {
			let data: ItemData = this.data as ItemData;
			//道具数据
			this.itemConfig = data.itemConfig;
			this.arrowIcon.visible = false;
			if (!this.itemConfig)
				return;
			this.itemIcon.setData(this.itemConfig);
			let type = ItemConfig.getType(this.itemConfig);
			if (type == 4) {
				this.updateWingEquip();//比较翅膀装备
				this.lvLabel.text = this.itemConfig.name;
			}
			else if (type == 0) {
				this.lvLabel.text = ((this.itemConfig.zsLevel) ? this.itemConfig.zsLevel + "转" : "lv." + this.itemConfig.level);
			}
			else {
				this.lvLabel.text = '';
			}
			this.nameLabel.textColor = ItemConfig.getQualityColor(this.itemConfig);
			this.nameLabel.text = this.itemConfig.name;

			this.gradeLabel.text = "评分：" + data.point;//ItemConfig.calculateBagItemScore(data);

			this.attrLabel.text = AttributeData.getAttrInfoByItemData(data);
		}
	}

	//对比下翅膀装备
	private updateWingEquip(): void {
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let wingsData: WingsData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
			let equipLen: number = wingsData.equipsLen;
			for (let k: number = 0; k < equipLen; k++) {
				let equdata: EquipsData = wingsData.getEquipByIndex(k);
				if (equdata.item.configID != 0) {
					if (ItemConfig.getSubType(this.data.itemConfig) == ItemConfig.getSubType(equdata.item.itemConfig)
						// && ItemConfig.calculateBagItemScore(this.data) > ItemConfig.calculateBagItemScore(equdata.item)) {
						&& this.data.point > equdata.item.point) {
						//这件装备比身上的号。就显示个↑图标
						this.arrowIcon.visible = true;
						return;
					}
				} else if (this.data.itemConfig.subType == k) {
					this.arrowIcon.visible = true;
					return;
				}
			}
		}
	}

}
