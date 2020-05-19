/**
 * 天仙皮肤界面
 *
 */
class ZhanLingPanelEx extends ZhanLingPanel {
	constructor() {
		super();
		this.skinName = 'ZhanlingSkin';
		this.isTopLevel = true;
	}

	protected childrenCreated() {
		this.setSkinPart("barbc", new ProgressBarEff());
	}

	public open(...param: any[]): void {
		this.openView(param);
		this.roleSelect.hideRole();
	}

}
ViewManager.ins().reg(ZhanLingPanelEx, LayerManager.UI_Main);
