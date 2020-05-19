class GuideArrow extends BaseEuiView {
	public bg: eui.Group;
	public lab: eui.Label;


	public constructor() {
		super();
		this.skinName = "guideArrowSkin";
	}
	public update() {
		let curCfg: GuideConfig = GuideUtils.ins().curCfg;
		if (!curCfg) return;
		if (!curCfg.tips || curCfg.tips == "") {
			this.visible = false;
			return;
		}
		egret.Tween.removeTweens(this.parent);
		this.parent.x = 0;
		this.visible = true;
		if (curCfg.direction == 1) {
			// this.currentState = "right";
			egret.Tween.get(this.parent, { loop: true }).to({ x: 40 }, 1000).to({ x: 0 }, 1000);
		}
		else {
			// this.currentState = "left";
			egret.Tween.get(this.parent, { loop: true }).to({ x: -40 }, 1000).to({ x: 0 }, 1000);
		}
		this.lab.text = curCfg.tips;

	}
	public close() {
		if (this.parent)
			egret.Tween.removeTweens(this.parent);
	}
}