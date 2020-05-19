class BreakDownItemRenderer extends BaseItemRender {

	private itemIcon: ItemIcon;

	private level: eui.Label;
	private tip: eui.Label;
	private desc: eui.Label;
	private equipName: eui.Label;

	private breakDown: eui.Button;

	public configID;

	constructor() {
		super();
		this.configID = 0;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.itemIcon.imgJob.visible = false;
	}

	public dataChanged(): void {
		let itemConfig: ItemConfig = this.data.itemConfig;
		if (itemConfig.zsLevel > 0) {
			this.level.text = itemConfig.zsLevel + "转";
		} else {
			this.level.text = itemConfig.level?"Lv." + itemConfig.level:`Lv.1`;
		}

		this.itemIcon.setData(itemConfig);
		this.equipName.text = "" + itemConfig.name;
		this.equipName.textColor = ItemConfig.getQualityColor(itemConfig);

		if (ItemConfig.getType(itemConfig) == ItemType.TYPE_9) {
			let decomConf = Book.ins().getDecomposeConfigByItemId(itemConfig.id);
			let descValue:number = 0;
			if( decomConf )
				descValue = decomConf.value;
			else{
				//职业图鉴269999不单独存在DecomposeConfig表
				let cfg:DecomposeConfig = GlobalConfig.DecomposeConfig[67];//职业图鉴经验相同
				if( cfg )
					descValue = cfg.value;
			}
			this.desc.text = `图鉴经验 x${descValue}`;

			this.tip.visible = true;
			this.tip.x = this.equipName.x + this.equipName.width;
			this.level.text = '';
		}
		else {
			let currItem: EquipConfig = GlobalConfig.EquipConfig[itemConfig.id];
			if (!currItem)return;
			let rewardItem: ItemConfig = GlobalConfig.ItemConfig[currItem.stoneId];
			if (!rewardItem)return;
			// if (itemConfig.quality == 5) {
			// 	this.desc.text = `${rewardItem.name} x ${currItem.stoneNum}`
			// } else {
			// this.desc.text = "神装碎片 x" + BreakDownItemRenderer.getSmeltConfig(itemConfig).stoneNum;
			// }
			this.desc.text = `${rewardItem.name} x ${currItem.stoneNum}`;
			this.desc.textColor = this.equipName.textColor;
			let subType = ItemConfig.getSubType(itemConfig);

			let id = UserEquip.ins().getEquipConfigIDByPosAndQuality(subType, ItemConfig.getQuality(itemConfig));
			let fitConfig = GlobalConfig.ItemConfig[id];
			let l1zs = itemConfig.zsLevel?itemConfig.zsLevel:0;
			let flzs = fitConfig.zsLevel?fitConfig.zsLevel:0;
			let l1lv = itemConfig.level?itemConfig.level:0;
			let fllv = fitConfig.level?fitConfig.level:0;
			let L = l1zs * 10000 + l1lv;
			let fitL = flzs * 10000 + fllv;
			if (fitL > L) {
				if( UserZs.ins().lv >= flzs && Actor.level >= fllv ){
					this.tip.visible = false;
				}else{
					this.tip.visible = true;
					this.tip.x = this.equipName.x + this.equipName.width;
				}
			} else {
				this.tip.visible = false;
			}
		}


		this.configID = this.data.handle;
	}

	// static getSmeltConfig(itemConfig: ItemConfig) {
	// 	let smeltConfig = GlobalConfig.SmeltConfig;
	// 	return smeltConfig[itemConfig.level * 10 + itemConfig.zsLevel * 10000 + itemConfig.quality]
	// }
}