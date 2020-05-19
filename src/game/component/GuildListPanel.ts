class GuildListPanel extends BaseComponent {
	private list: eui.List;

	/**第一页从0开始*/
	private curPage: number;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	protected init(): void {
		this.list.itemRenderer = GuildListItem2Render;
	}

	public open(...param: any[]): void {
		this.observe(Guild.ins().postGuildList, this.updateList);
		this.updateList();
		this.pageChange(0);
	}


	private pageChange(page: number): void {
		if (this.curPage != page && page >= 0 && page < Guild.ins().pageMax) {
			this.curPage = page;
			Guild.ins().sendGuildList(this.curPage, 6);
		}
	}

	private updateList(): void {
		this.list.dataProvider = new eui.ArrayCollection(Guild.ins().guildListInfos);
	}

}