class RankItemRenderer extends BaseItemRender {
	/** 前2，3名排名标志 */
	public t1: eui.Image;

	/** 前2，3名背景标志 */
	public t3: eui.Image;

	public t10: eui.Image;

	public vip: eui.Image;

	public pos: eui.Label;

	/** 数据格式 */
	public static dataFormat: Object;

	public constructor() {
		super();
		this.touchEnabled = true;
		this.touchChildren = true;
	}

	public dataChanged(): void {
		if (this.data != null) {
			for (let key in this.data) {
				let component: any = this[key] as eui.Component;
				if (component)
					this.updateValue(component, key, this.data[key]);
			}

			//前2，3名背景标志
			if (this.data[RankDataType.DATA_POS] == 2) {
				this.t3.source = `rankcolor_2`;
				this.t1.source = `common1_no2`;
				this.pos.visible = false;
				this.t1.visible = true;
			}
			else if (this.data[RankDataType.DATA_POS] == 3) {
				this.t3.source = `rankcolor_3`;
				this.t1.source = `common1_no3`;
				this.pos.visible = false;
				this.t1.visible = true;
			}
			else {
				this.t3.source = "";
				this.pos.visible = true;
				this.t1.visible = false;
			}

			if (this.t10) this.t10.visible = (this.data.pos <= 10)
			this.vip.visible = (this.data.vip > 0);
		}
		this.visible = this.data != null;
	}

	/**
	 * 更新数据
	 */
	protected updateValue(component: any, key: string, value: any): void {
		switch (key) {
			case RankDataType.DATA_VIP:

				return;

			case RankDataType.DATA_MONTH:
				(<eui.Image>component).visible = value == 1;
				return;

			case RankDataType.DATA_LEVEL:
				value = `${value}级`;
				break;

			case RankDataType.DATA_COUNT:
				if (Rank.ins().curType == RankDataType.TYPE_XUNZHANG) {
					//徽章
					let cfg: KnighthoodConfig = GlobalConfig.KnighthoodConfig[value];
					value = cfg.type;
				} else if (Rank.ins().curType == RankDataType.TYPE_LILIAN) {
					//天阶
					let cfg: TrainLevelConfig = GlobalConfig.TrainLevelConfig[value];
					value = `${cfg.trainlevel}等${cfg.trainName}`;
				} else if (Rank.ins().curType == RankDataType.TYPE_XIANHUA)
				{
					value = value;
				}
				break;
			case RankDataType.DATA_WEIWANG:
				value = WeiWangCC.ins().getWeiWangCfg(value).res;
				break;
		}
		if (component instanceof eui.Label) {
			if (typeof value == 'number')
				value = CommonUtils.overLength(value);
			(<eui.Label>component).text = key in RankItemRenderer.dataFormat ? RankItemRenderer.dataFormat[key].replace('{value}', value) : <string>value;
		} else if (component instanceof eui.Image) {
			(<eui.Image>component).source = key in RankItemRenderer.dataFormat ? RankItemRenderer.dataFormat[key].replace('{value}', value) : <string>value;
		}
	}
}