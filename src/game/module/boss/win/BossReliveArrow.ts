class BossReliveArrow extends BaseEuiView {
	public reliveBossLab: eui.Label;
	private btnGo: eui.Button;
	private head: eui.Image;
	private closeBtn: eui.Button;

	private openViewIndex: number;
	public constructor() {
		super();
		this.skinName = "BossRefreshSkin";
		this.addTouchEvent(this.btnGo, this.onBtnGo);
		this.addTouchEvent(this.closeBtn, ()=>{
			this.closeArrow();
		});
	}

	public setBossName(name: string, viewIndex: number = 0, headImage: string = ""): void {
		this.reliveBossLab.textFlow = new egret.HtmlTextParser().parser(`<font color="#35e62d">${name}</font>`);
		this.openViewIndex = viewIndex;
		if (headImage != "") {
			this.head.source = `monhead${headImage}_png`;
		}
	}

	public close() {

	}

	public onBtnGo() {
		ViewManager.ins().open(BossWin,this.openViewIndex);
		this.closeArrow();	
	}

	private closeArrow() {
		let view = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (view) {
			view.publicBossRelive(false);
		}
	}
}
