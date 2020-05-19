/**VIP3至尊奖励 */
class Vip3Win extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn1: eui.Button;
	public closeBtn0: eui.Button;
	public sureBtn: eui.Button;

	private artifactEff: MovieClip;
	private qualityEff1: MovieClip;
	private qualityEff2: MovieClip;
	private qualityEff3: MovieClip;
	private suerEff: MovieClip;

	private closeBtn1Eff: MovieClip;
	constructor() {
		super();
		this.isTopLevel = true;
	}


	public initUI(): void {

		super.initUI();

		this.skinName = "Vip3Skin";

		this.artifactEff = new MovieClip;
		this.artifactEff.x = 233;
		this.artifactEff.y = 335;
		// this.artifactEff.scaleX = this.artifactEff.scaleY = 0.75;

		let proportionW: number = 0.178;
		let proportionH: number = this.height * 0.556;

		this.qualityEff1 = new MovieClip;
		this.qualityEff1.x = this.width * proportionW;
		this.qualityEff1.y = proportionH;

		this.qualityEff2 = new MovieClip;
		this.qualityEff2.x = this.width * 0.5;
		this.qualityEff2.y = proportionH;

		this.qualityEff3 = new MovieClip;
		this.qualityEff3.x = this.width * (1 - proportionW);
		this.qualityEff3.y = proportionH;

		// this.suerEff = this.suerEff || new MovieClip;
		// this.suerEff.x = 50;
		// this.suerEff.y = 19;

		this.closeBtn1Eff = new MovieClip();
		this.closeBtn1Eff.x = this.closeBtn1.x + this.closeBtn1.width / 2 - 2;
		this.closeBtn1Eff.y = this.closeBtn1.y + this.closeBtn1.height / 2 + 2;
		this.closeBtn1Eff.touchEnabled = false;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);
		//暂时屏蔽特效
		// this.artifactEff.loadFile("artifacteff1", true, -1);
		// this.addChildAt(this.artifactEff,4);
		this.qualityEff1.playFile(RES_DIR_EFF + "quality_05", -1);
		this.addChild(this.qualityEff1);
		this.qualityEff2.playFile(RES_DIR_EFF + "quality_05", -1);
		this.addChild(this.qualityEff2);
		this.qualityEff3.playFile(RES_DIR_EFF + "quality_05", -1);
		this.addChild(this.qualityEff3);
		this.closeBtn1Eff.playFile(RES_DIR_EFF + "chongzhi", -1);
		this.addChild(this.closeBtn1Eff);
		if (UserVip.ins().lv < 3) {
			this.sureBtn.visible = false;
		} else {
			this.sureBtn.visible = true;
			this.closeBtn1.visible = false;
			// this.suerEff.loadFile('normalbtn', true, -1);
			// this.sureBtn.addChild(this.suerEff);
		}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.closeBtn1, this.onTap);
		this.removeTouchEvent(this.sureBtn, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		let vim = ViewManager.ins();
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				vim.close(Vip3Win);
				break;
			case this.closeBtn1:
				vim.open(ChargeFirstWin);
				break;
			case this.sureBtn:
				vim.open(VipWin);
				vim.close(Vip3Win);
				break;
		}
	}
}

ViewManager.ins().reg(Vip3Win, LayerManager.UI_Main);