/**
 * 功能预告
 */
class FuncNoticeWin extends BaseEuiView {
	public bodyImg: eui.Image;
	public sureBtn: eui.Button;
	public txt: eui.Label;

	private curConfig:FuncNoticeConfig;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "FuncNoticeSkin";

	}

	/**
	 * 显示窗口
	 */
	public showWin(lv: number): void {
//		let lv:number = FbMgr.ins().guanqiaID;
		this.curConfig = FuncNoticeWin.getFuncNoticeConfigById(lv);
		let openLv: number = this.curConfig.openLv;
		(lv == openLv) ? this.sureBtn.icon = "yg_002" : this.sureBtn.icon = "yg_001";
		this.bodyImg.source = "yg_" + this.curConfig.index + "_png";
		this.txt.textFlow = TextFlowMaker.generateTextFlow("|C:0x35e62d&T:" + openLv + "|关开启");

		this.addTouchEvent(this.sureBtn,this.onTouch);
	}

	private onTouch(e: egret.TouchEvent): void {
		let btn: eui.Button = e.target;
		if(btn.icon == "yg_002") {
			let winName:string = this.curConfig.openPanel[0].toString();
			let page:number = this.curConfig.openPanel[1];
			GameGuider.guidance(winName,page);
		}
		this.removeTouchEvent(this.sureBtn,this.onTouch);
		ViewManager.ins().close(this);
	}


	static getFuncNoticeConfigById(id: number): FuncNoticeConfig {
		let config: FuncNoticeConfig[] = GlobalConfig.FuncNoticeConfig;
		for(let i in config) {
			if(config[i].openLv >= id) {
				return config[i];
			}
		}
		return null;
	}
}

ViewManager.ins().reg(FuncNoticeWin, LayerManager.UI_Tips);
