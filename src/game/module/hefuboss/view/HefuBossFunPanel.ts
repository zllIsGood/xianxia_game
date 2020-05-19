class HefuBossFunPanel extends BaseEuiView {

	public attState: eui.ToggleButton;
	public quit: eui.Button;
	public npcBtn: eui.Button;

	constructor() {
		super();

		this.skinName = `CityFunSkin`;
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.attState, this.onClick);
		this.addTouchEvent(this.quit, this.onClick);
		this.addTouchEvent(this.npcBtn, this.onClick);
		this.observe(HefuBossCC.ins().postChangeAttStatue, this.changeBtn);
		this.observe(HefuBossCC.ins().postHefuBossId, this.changeAttStatue);
		this.attState.visible = false;
		this.quit.visible = false;
		this.changeAttStatue()
	}

	private changeAttStatue() {
		if (HefuBossCC.ins().hefuBossId > 0) {
			HefuBossCC.ins().postChangeAttStatue(1);
			ViewManager.ins().open(TargetListPanel);
		}
	}

	private changeBtn() {
		this.attState.selected = ViewManager.ins().isShow(TargetListPanel);
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.attState:
				let type = 0;

				if (this.attState.selected) {
					ViewManager.ins().open(TargetListPanel);
					type = 1;
				}
				else if (HefuBossCC.ins().hefuBossId == 0) {
					type = 2;
					ViewManager.ins().close(TargetListPanel);
				} else {
					UserTips.ins().showTips('当前远古BOSS攻城期间，不能切换模式');
				}

				HefuBossCC.ins().postChangeAttStatue(type);

				break;

			case this.quit:
				WarnWin.show(`是否退出副本，退出后有30秒进入CD`, () => {
					UserFb.ins().sendExitFb();
				}, this);
				break;

			case this.npcBtn:
				break;
		}
	}
}

namespace GameSystem {
	export let  hefubossfunpanel = () => {
		ViewManager.ins().reg(HefuBossFunPanel, LayerManager.Main_View);
	}
}