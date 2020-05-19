class GuildManagePanel extends BaseComponent {

	private buildList: eui.List;
	private messageList: eui.List;
	public buildScroller: eui.Scroller;


	constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	protected init(): void {
		this.buildList.itemRenderer = GuildBuildItemRender;
		this.messageList.itemRenderer = GuildEventItenRender;
	}

	public static openCheck(...param: any[]): boolean {
		let rtn = (Guild.ins().guildID != 0);
		if (!rtn) {
			UserTips.ins().showTips("还未加入仙盟！");
		}
		return rtn;
	}

	public open(): void {
		this.addTouchEvent(this.buildList, this.onListTouch);
		this.observe(Guild.ins().postUpBuilding, this.updateList);
		this.observe(Guild.ins().postManageList, this.update);
		this.observe(Guild.ins().postGuildMoney, this.update);
		Guild.ins().sendManageList();
		this.updateList();
	}

	public close(): void {
		this.removeTouchEvent(this.buildList, this.onListTouch);
		this.removeObserve();
	}

	private update(): void {
		this.messageList.dataProvider = new eui.ArrayCollection(Guild.ins().records);
	}

	private index: number;

	private updateList(): void {
		this.index = this.buildScroller.viewport.scrollV;
		this.buildList.dataProvider = new eui.ArrayCollection([GuildBuilding.GUILD_HALL, GuildBuilding.GUILD_LIANGONGFANG, GuildBuilding.GUILD_SHOP]);//, GuildBuilding.GUILD_SHOP
		this.refushBar();
	}

	private refushBar(): void {
		TimerManager.ins().remove(this.refushBarList, this);
		TimerManager.ins().doTimer(100, 1, this.refushBarList, this);
	}

	private refushBarList(): void {
		TimerManager.ins().remove(this.refushBarList, this);
		this.buildScroller.viewport.scrollV = this.index;
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildBuildItemRender = e.target.parent as GuildBuildItemRender;
			item.onTap(e.target);
		}
	}
}