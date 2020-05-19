/**
 * 部分场景特殊处理合击按钮
 */
class BtnHejiWin extends BaseEuiView {
	public autoHeji: eui.Group;
	public heji: eui.Button;

	public constructor() {
		super();
		this.skinName = "BtnHejiSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.heji, this.onTap);

		if (PaoDianCC.ins().isPaoDian) {
			this.y = 200;
		}
		else if (KfArenaSys.ins().isKFArena) {
			this.y = 50;
		}

		this.hejiState(Setting.ins().getValue(ClientSet.autoHeji))
	}

	private onTap(): void {
		//自动释放合击
		let state = Setting.ins().getValue(ClientSet.autoHeji) > 0 ? 0 : 1;
		this.hejiState(state);
		Setting.ins().setValue(ClientSet.autoHeji, state);
	}

	private hejiState(state: number): void {
		this.heji.icon = (!state || state == 0) ? "noheji_png" : "heji_png";
	}
}

ViewManager.ins().reg(BtnHejiWin, LayerManager.UI_Main);