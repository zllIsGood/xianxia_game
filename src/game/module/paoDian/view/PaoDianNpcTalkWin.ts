class PaoDianNpcTalkWin extends BaseEuiView {

	public bgClose: eui.Rect;
	public anigroup: eui.Group;
	public desc: eui.Label;
	public rule: eui.Label;
	public goTo: eui.Button;
	public redPoint: eui.Image;

	public constructor() {
		super();
		this.skinName = "PointTipsSkin";
	}

	public open(...args: any[]): void {
		this.addTouchEvent(this, this.onGoto);
		this.update();
	}

	public close(): void {
		this.removeTouchEvent(this.goTo, this.onGoto);
	}

	private update(): void {
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.PassionPointConfig.desc);
		this.rule.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.HelpInfoConfig[20].text);
		this.redPoint.visible = PaoDianCC.ins().isOpen;
	}

	private onGoto(e: egret.TouchEvent): void {
		if (e.target == this.goTo) {
			if (!PaoDianCC.ins().isOpen) {
				UserTips.ins().showTips(GlobalConfig.PassionPointConfig.openTips);
				return;
			}

			var openLevel: number = GlobalConfig.PassionPointConfig.openLv;
			if (Actor.level + UserZs.ins().lv * 1000 < openLevel) {
				UserTips.ins().showTips((openLevel < 1000 ? openLevel + "级" : (openLevel % 1000 == 0 ?
					openLevel / 1000 + "转" : openLevel / 1000 + "转" + openLevel % 1000 + "级")) + `可参与瑶池盛会`);
				return;
			}

			var cd: number = PaoDianCC.ins().getEnterCD();
			if (cd > 0) {
				UserTips.ins().showTips(cd + "秒后才可进入瑶池盛会");
				return;
			}

			PaoDianCC.ins().enterPaoDian();
		}
		else if (e.target == this.bgClose)
			ViewManager.ins().close(this);
	}

}
ViewManager.ins().reg(PaoDianNpcTalkWin, LayerManager.UI_Popup);