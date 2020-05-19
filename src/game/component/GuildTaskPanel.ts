class GuildTaskPanel extends BaseComponent {

	private list: eui.List;

	public constructor() {
		super();
	}

	public childrenCreated(): void{
		this.init();
	}

	protected init(): void {
		this.list.itemRenderer = GuildTaskItemRender;
	}

	public open(...param: any[]): void {
		// this.observe(Guild.ins().postGuildTaskUpdate, this.updateList);
		this.addTouchEvent(this.list, this.onListTouch);
		this.list.dataProvider = Guild.ins().guildTaskInfos;
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.list, this.onListTouch);
		this.removeObserve();
	}

	private onLink(): void {
		ViewManager.ins().open(VipWin);
	}
	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildTaskItemRender = e.target.parent.parent as GuildTaskItemRender;
			item.onTap(e.target);
		}
	}
}