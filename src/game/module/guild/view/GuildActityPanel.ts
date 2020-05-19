/*仙盟活动界面*/
class GuildActityPanel extends BaseView {
	public list: eui.List;
	public constructor() {
		super();
		this.initUI();
		this.name = "仙盟活动";
	}
	public initUI(): void {
		this.skinName = "GuildActitySkin";
		this.list.itemRenderer = GuildActityItemRender;
	}
	public open(...param: any[]): void {
		this.updateData();
		this.addTouchEvent(this.list, this.onListTouch);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.list, this.onListTouch);
	}
	private updateData(): void {
		let config: GuildActivityConfig[] = [];
		for (let k in GlobalConfig['GuildActivityConfig']) {
			let cfgg: GuildActivityConfig = GlobalConfig['GuildActivityConfig'][k];
			config.push(cfgg);
		}
		this.list.dataProvider = new eui.ArrayCollection(config);
	}
	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildActityItemRender = e.target.parent.parent as GuildActityItemRender;
			item.onTap(e.target);
		}
	}
}