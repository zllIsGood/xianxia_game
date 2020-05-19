class NoticeListRenderer extends BaseItemRender {
	private job: string[] = ["", "战士", "法师", "术士"];
	public static QUALITY_COLOR: string[] = ["#e2dfd4", "#35e62d", "#d242fb", "#ff750f", "#f3311e", "#ffd93f"];
	public showText: eui.Label;
	private activityID:number;
	constructor() {
		super();
		this.skinName = "HuntListRendererSkin";
	}

	public dataChanged(): void {
		if (!this.data.activityID) return;
		let name = this.data.name;
		this.activityID = this.data.activityID;
		let index = this.data.index;
		let config:ActivityType9Config = GlobalConfig.ActivityType9Config[this.activityID][index];
		let str = "";
		if( config ){
			let nstr:string = "";
			let cstr:number = ColorUtil.NORMAL_COLOR;
			//货币
			if( !config.reward[0].type ){
				let type: number = 1;//颜色类型
				switch (config.reward[0].id) {
					case MoneyConst.yuanbao:
						type = 5;
						break;
					case MoneyConst.gold:
						type = 0;
						break;
					case MoneyConst.soul:
						type = 2;
						break;
					case MoneyConst.piece:
						type = 2;
						break;
					case MoneyConst.godweaponExp:
						type = 2;
						break;
					default:
						break;
				}
				nstr = RewardData.getCurrencyName(config.reward[0].id);
				cstr = ItemBase.QUALITY_COLOR[type];
				str = "<font color = '#12b2ff'>" + name + "</font> 获得 <font color='" + cstr + "'>" + nstr + "</font>";

			}else{
				//道具
				let item:ItemConfig = GlobalConfig.ItemConfig[config.reward[0].id];
				nstr = item.name;
				cstr = ItemConfig.getQualityColor(item);
				let itemtype = ItemConfig.getType(item);
				if (itemtype == 0) {
					if( item ){
						if (item.zsLevel > 0) {
							nstr += "(" + item.zsLevel + "转 ";
						} else {
							nstr += "(" + item.level + "级 ";
						}
						nstr += this.job[ItemConfig.getJob(item)] + ")";
					}
				}

				str = "<font color = '#12b2ff'>" + name + "</font> 获得 <font color='" + cstr + "'>" + nstr + "</font>";

			}
		}
		this.showText.textFlow = TextFlowMaker.generateTextFlow(str);
	}




}