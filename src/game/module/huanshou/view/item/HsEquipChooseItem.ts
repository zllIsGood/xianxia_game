class HsEquipChooseItem extends BaseItemRender {
	private nameLabel: eui.Label;
	private redPoint0: eui.Image;

	constructor() {
		super();
	}

	protected dataChanged(): void {
		if (isNaN(this.data))
			return;
		let id: number = this.data;
		this.nameLabel.text = GlobalConfig.ItemConfig[id].name;

		this.redPoint0.visible = UserHuanShou.ins().isComposeEquip(id);
	}
}

