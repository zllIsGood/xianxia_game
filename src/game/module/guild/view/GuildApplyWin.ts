/**
 * Created by Administrator on 2016/8/24.
 * 仙盟列表
 */
class GuildApplyWin extends BaseEuiView {

	public createBtn: eui.Button;
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public list: eui.List;
	public leftBtn: eui.Button;
	public rightBtn: eui.Button;
	public noGuild: eui.Label;
	public bgClose:eui.Rect;
	/**第一页从0开始*/
	private dataArr: eui.ArrayCollection;

	constructor() {
		super();
		this.isTopLevel = true;

		this.dataArr = new eui.ArrayCollection([]);
		this.skinName = "GuildApplySkin";
		this.list.itemRenderer = GuildListItemRender;
		this.list.dataProvider = this.dataArr;
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.createBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.list, this.onListTouch);
		this.observe(Guild.ins().postGuildList, this.updateList);
		Guild.ins().sendGuildList();
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildListItemRender = e.target.parent as GuildListItemRender;
			item.onTap();
		}
	}

	private updateList(): void {
		this.noGuild.visible = Guild.ins().guildListInfos.length == 0;
		this.dataArr.replaceAll(Guild.ins().guildListInfos);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.createBtn:
				ViewManager.ins().open(GuildCreateWin);
				break;
		}
	}

	public destoryView(): void {
		super.destoryView();

		for (let i: number = 0; i < this.list.numElements; i++) {
			if ((this.list.getElementAt(i) as GuildListItemRender))
				(this.list.getElementAt(i) as GuildListItemRender).destruct();
		}
	}

}

ViewManager.ins().reg(GuildApplyWin, LayerManager.UI_Popup);