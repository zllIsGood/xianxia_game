/**
 * Created by Administrator on 2016/8/24.
 */
class GuildWin extends BaseEuiView {

	public tab: eui.TabBar;
	public viewStack: eui.ViewStack;
	public InfoPanel: GuildInfoPanel;
	public managePanel: GuildManagePanel;
	public memberPanel: GuildMemberPanel;
	public listPanel: GuildListPanel;
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public redPoint0: eui.Image;
	private lastSelect: number;
	private redPoint1:eui.Image;
	constructor() {
		super();
		this.skinName = "GuildBgSkin";
		this.isTopLevel = true;
		// this.setSkinPart("InfoPanel", new GuildInfoPanel());
		// this.setSkinPart("managePanel", new GuildManagePanel());
		// this.setSkinPart("memberPanel", new GuildMemberPanel());
		// this.setSkinPart("listPanel", new GuildListPanel());
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}

	public initUI(): void {
		super.initUI();
		this.tab.dataProvider = this.viewStack;
	}

	public static openCheck(...param: any[]): boolean {
		let rtn = (Guild.ins().guildID != 0);
		if (!rtn) {
			UserTips.ins().showTips("还未加入仙盟！");
		}
		return rtn;
	}


	public open(...param: any[]): void {
		if (param && param.length > 0) {
			this.lastSelect = param[0];
		} else
			this.lastSelect = 0;
		this.viewStack.selectedIndex = this.lastSelect;

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addChangeEvent(this.tab,this.setSelectedIndex);
		this.observe(GuildRedPoint.ins().postGldt, this.updateRedPoint);
		Guild.ins().sendMyGuildInfo();
		Guild.ins().sendGuildMembers();
		this.updateRedPoint();
		this.viewStack.getElementAt(this.lastSelect)['open']();
	}

	public close(...param: any[]): void {
		this.viewStack.getElementAt(this.lastSelect)['close']();
		ViewManager.ins().open(GuildMap);
	}

	private onTap(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().open(GuildMap);
				ViewManager.ins().close(GuildWin);
				break;
		}
	}

	private setSelectedIndex(e: egret.Event) {
		this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.viewStack.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();
	}

	private updateRedPoint(): void {
		this.redPoint1.visible = GuildRedPoint.ins().gldt;
}
}

ViewManager.ins().reg(GuildWin, LayerManager.UI_Main);