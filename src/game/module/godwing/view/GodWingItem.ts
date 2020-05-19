/**
 * 神羽控件专属
 */
class GodWingItem extends BaseItemRender {
	private itemIcon: ItemIcon;
	private nameTxt: eui.Label;
	private select: eui.Image;
	private redPoint: eui.Image;
	public itemId: number;
	private count: eui.Label;
	constructor() {
		super();
		this.skinName = 'ShenYuItem';

	}
	protected childrenCreated(): void {
		super.childrenCreated();
	}
	public setSelect(b: boolean): void {
		this.select.visible = b;
	}
	protected dataChanged(): void {
		if (!this.data)
			return;
		// this.itemIcon.touchEnabled = this.select.touchEnabled = false;
		this.itemId = 0;
		this.itemIcon.imgJob.visible = false;
		this.itemIcon.imgIcon.source = "";
		if (this.data instanceof GodWingItemConfig) {
			let gitem: GodWingItemConfig = this.data as GodWingItemConfig;
			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[gitem.itemId];
			this.itemIcon.imgIcon.source = itemConfig.icon + "_png";
			this.nameTxt.text = itemConfig.name;
			this.itemId = gitem.itemId;
			//隐藏数量
			this.itemIcon.imgBg.source = ItemConfig.getQualityBg(ItemConfig.getQuality(itemConfig));
			this.nameTxt.textColor = ItemConfig.getQualityColor(itemConfig);
		}
		else if (this.data instanceof ItemData) {
			let itemdata: ItemData = this.data as ItemData;
			//转换
			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[itemdata._configID];
			this.itemIcon.imgIcon.source = itemConfig.icon + "_png";
			this.nameTxt.text = itemConfig.name;
			this.itemId = itemConfig.id;
			//数量
			this.count.text = itemdata.count + "";

			this.itemIcon.imgBg.source = ItemConfig.getQualityBg(ItemConfig.getQuality(itemConfig));
			this.nameTxt.textColor = ItemConfig.getQualityColor(itemConfig);
		}
		else if (this.data instanceof ItemConfig) {
			let config: ItemConfig = this.data as ItemConfig;
			//合成碎片
			this.itemIcon.imgIcon.source = config.icon + "_png";
			this.nameTxt.text = config.name;
			this.itemId = config.id;

			this.itemIcon.imgBg.source = ItemConfig.getQualityBg(ItemConfig.getQuality(config));
			this.nameTxt.textColor = ItemConfig.getQualityColor(config);
		}
		else if (this.data instanceof GodWingSuitConfig) {
			//神羽技能tips用
			let config: GodWingSuitConfig = this.data as GodWingSuitConfig;
			if (!config.skillname) {
				for (let k in GlobalConfig.GodWingSuitConfig) {
					if (GlobalConfig.GodWingSuitConfig[k].skillname) {
						config = GlobalConfig.GodWingSuitConfig[k];
						this.data = config;
						break;
					}
				}
			}
			this.itemIcon.imgIcon.source = config.skillicon + "_png";
			// let rex:RegExp = /\d+/g;
			// let rlv = rex.exec(config.skillname);//获取等级
			this.nameTxt.text = config.skillname;

		}
		else if (this.data instanceof GodWingLevelConfig) {
			//合成查看下一阶
			let config: GodWingLevelConfig = this.data as GodWingLevelConfig;
			let cfg: ItemConfig = GlobalConfig.ItemConfig[config.itemId];
			this.itemIcon.imgIcon.source = cfg.icon + "_png";
			this.nameTxt.text = cfg.name;

			this.itemIcon.imgBg.source = ItemConfig.getQualityBg(ItemConfig.getQuality(cfg));
			this.nameTxt.textColor = ItemConfig.getQualityColor(cfg);
		}
		this.itemIcon.imgIcon.visible = this.itemIcon.imgIcon.source ? true : false;

	}
	public setCountVisible(b: boolean) {
		this.count.visible = b;
	}
	public setNameVisible(b: boolean) {
		this.nameTxt.visible = b;
		if (!b)
			this.setQuality(ItemConfig.getQualityBg(0));

	}
	public setImgIcon(img: string) {
		this.itemIcon.imgIcon.source = img;
		this.itemIcon.imgJob.visible = false;
		this.itemIcon.imgIcon.visible = this.itemIcon.imgIcon.source ? true : false;
	}
	public updateRedPoint(b: boolean) {
		this.redPoint.visible = b;
	}
	public setNameText(str: string) {
		this.nameTxt.text = str;
	}
	public setQuality(str: string) {
		this.itemIcon.imgBg.source = str;
	}

	public destruct(): void {

	}


}