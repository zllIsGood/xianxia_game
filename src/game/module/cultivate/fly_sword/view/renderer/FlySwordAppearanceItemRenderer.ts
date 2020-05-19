/**
 * 飞剑幻化图标
 */
class FlySwordAppearanceItemRenderer extends BaseItemRender {
	public iconImg: eui.Image;
	public qualityImg: eui.Image;
	public clock: eui.Image;
	public selectIcon: eui.Image;
	public redPoint: eui.Image;
	public cosPlay: eui.Image;
	public nameLabel: eui.Label;

	public data: FlySwordAppearanceData;

	public constructor() {
		super();
		this.skinName = `FlySwordPetItemSkin`;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
		
	}
	

	public init() {
		this.observe(FlySwordRedPoint.ins().postAppearanceRedPoint, this.updateRedPoint);

	}

	public updateRedPoint(): void {
		this.redPoint.visible = this.data ? FlySwordRedPoint.ins().appearanceRedPoint[this.data.roleId][this.itemIndex] || false : false;
	}

	protected dataChanged(): void {
		super.dataChanged();

		let data: FlySwordAppearanceData = this.data;
		if (!data)
			return;

		let config: ICultivateTypeConfig = data.getConfig();
		let isActivation: boolean = data.getIsActivation();
		if (config) {
			this.nameLabel.text = config.name;
			this.iconImg.source = config.headIcon;
			this.qualityImg.source = ItemConfig.getQualityBg(config.quality);
		}
		this.clock.visible = !isActivation;
		this.cosPlay.visible = data.getIsAppearance();
		this.nameLabel.textColor = isActivation ? 0xE3B953 : ColorUtil.NORMAL_COLOR;
		this.updateRedPoint();
	}

}