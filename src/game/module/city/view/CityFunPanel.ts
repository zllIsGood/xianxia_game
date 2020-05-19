class CityFunPanel extends BaseEuiView {

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
		this.observe(CityCC.ins().postChangeAttStatue, this.changeBtn);
		this.observe(CityCC.ins().postCityBossId, this.changeAttStatue);
		this.changeAttStatue()
	}

	private changeAttStatue() {
		if (CityCC.ins().cityBossId > 0) {
			CityCC.ins().postChangeAttStatue(1);
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
				else if (CityCC.ins().cityBossId == 0) {
					type = 2;
					ViewManager.ins().close(TargetListPanel);
				} else {
					UserTips.ins().showTips('当前远古BOSS攻城期间，不能切换模式');
				}

				CityCC.ins().postChangeAttStatue(type);

				break;

			case this.quit:
				WarnWin.show(`是否退出主城，退出后有30秒进入CD`, () => {
					UserFb.ins().sendExitFb();
				}, this);
				break;

			case this.npcBtn:
				break;
		}
	}
}

namespace GameSystem {
	export let  cityfunpanel = () => {
		ViewManager.ins().reg(CityFunPanel, LayerManager.Main_View);
	}
}