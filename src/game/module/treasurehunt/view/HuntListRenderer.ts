class HuntListRenderer extends BaseItemRender {

	public static QUALITY_COLOR: string[] = ["#e2dfd4", "#35e62d", "#d242fb", "#ff750f", "#f3311e", "#ffd93f"];
	public showText: eui.Label;

	constructor() {
		super();
		this.skinName = "HuntListRendererSkin";
	}

	public dataChanged(): void {
		let arr: any[] = this.data;
		let item: ItemConfig = GlobalConfig.ItemConfig[arr[1]];
		if (item == null) return;

		let str: string;
		let cstr = ItemConfig.getQualityColor(item);
		let type = ItemConfig.getType(item);
		if (type == 0) {
			str = "<font color = '#12b2ff'>" + arr[0] + "</font> 获得 <font color='" + cstr + "'>" + this.makeNameList(item) + "</font>";
		} else {
			str = "<font color = '#12b2ff'>" + arr[0] + "</font> 获得 <font color='" + cstr + "'>" + item.name + "</font>";
		}
		this.showText.textFlow = TextFlowMaker.generateTextFlow(str);
	}

	private job: string[] = ["", "战士", "法师", "术士"];

	private makeNameList(item: ItemConfig): string {
		let name: string = '';
		name = item.name;
		if (item.zsLevel > 0) {
			name += "(" + item.zsLevel + "转 ";
		} else {
			name += "(" + item.level + "级 ";
		}
		name += this.job[ItemConfig.getJob(item)] + ")";
		return name;
	}
}