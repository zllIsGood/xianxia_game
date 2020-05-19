class BoxBgWin extends BaseEuiView {

	public roleSelect: RoleSelectPanel;
	private boxPanel: BoxWin;
	private bookPanel: BookWin;
	private artifactPanel: NewArtifactWin;
	private viewStack: eui.ViewStack;
	private tab: eui.TabBar;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public help:eui.Button;
	private _ext:any;
	public constructor() {
		super();
		this.skinName = `chestbgskin`;
		this.isTopLevel = true;
	}

	public open(...param: any[]) {
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("boxPanel", new BoxWin());
		// this.setSkinPart("bookPanel", new BookWin());
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.observe(Book.ins().postDataChange, this.redUpdate);
		this.observe(Box.ins().postUpdateData, this.redUpdate);
		this.observe(Box.ins().postUpdateFreeBox, this.redUpdate);
		this.addTouchEvent(this.help, this.onBtnClick);

		this.tab.selectedIndex = this.viewStack.selectedIndex = param[0] || 0;
		this._ext = param[1];
		this.setSelectedIndex(this.tab.selectedIndex);

		this.help.visible = false;
		// this.bookPanel.open();
		this.redUpdate();
	}

	public close() {
		this.boxPanel.close();
		this.bookPanel.close();
		this.removeObserve();
		// this.artifactPanel.close();
	}

	public redUpdate(): void {
		this.redPoint1.visible = BoxModel.ins().checkRedPointShow();
		this.redPoint2.visible = Book.ins().getBookRed();
	}
	private onBtnClick(e:egret.Event){
		switch (e.currentTarget){
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 11);
				break;
		}
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent = null): void {
		this.setSelectedIndex(this.tab.selectedIndex);
	}

	private setSelectedIndex(index: number) {
		this.help.visible = false;
		if (index == 0) {
			this.boxPanel.open();
		} else if (index == 1) {
			if(this._ext){
				this.bookPanel.open(this._ext);
				this._ext = null;
			}else{
				this.bookPanel.open();
			}
			this.help.visible = true;
		}
	}
}
ViewManager.ins().reg(BoxBgWin, LayerManager.UI_Main);