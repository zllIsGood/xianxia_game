/**
 * 主界面最上面显示栏
 */
class UIView1 extends BaseEuiView {

	/** 金钱 */
	private goldTxt: eui.Label;
	/** 元宝 */
	private ybTxt: eui.Label;

	/** 名字 */
	private nameTxt: eui.Label;
	/** 等级 */
	private lvTxt: eui.Label;

	public recharge: eui.Button;
	public recharge0: eui.Button;

	private ft: FrameTick = new FrameTick;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "UIView1Skin";

		this.touchEnabled = false;
	}

	public initData(): void {
		if (this.ft.checkAndTick(0))
			return;

		CommonUtils.labelIsOverLenght(this.goldTxt, Actor.gold);
		CommonUtils.labelIsOverLenght(this.ybTxt, Actor.yb);
		//设置名字
		this.nameTxt.text = Actor.myName;
		//设置等级
		this.expChange();
	}

	public open(...param: any[]): void {
		super.open(param);
		this.observe(GameLogic.ins().postChildRole, this.initData);
		this.observe(Actor.ins().postGoldChange, this.initData);
		this.observe(Actor.ins().postYbChange, this.initData);
		this.observe(Actor.ins().postNameChange, this.initData);
		this.observe(Actor.ins().postPowerChange, this.initData);
		this.observe(Actor.ins().postLevelChange, this.expChange);
		this.addTouchEvent(this.recharge, this.onClick);
		this.addTouchEvent(this.recharge0, this.onClick);
		this.initData();
	}

	public close(...param: any[]): void {
		super.close(param);
		this.removeTouchEvent(this.recharge, this.onClick);
		this.removeTouchEvent(this.recharge0, this.onClick);
		this.removeObserve();
	}

	private onClick(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.recharge:
				ViewManager.ins().open(ChargeFirstWin);
				break;
			case this.recharge0:
				if (GameServer.serverOpenDay < 2) {
					UserTips.ins().showTips("|C:0xf3311e&T:开服第三天开启摇钱树|");
					return;
				}
				ViewManager.ins().open(FuliWin);
				break;
		}
	}

	/** 设置等级 */
	private expChange(): void {
		let lv: number = Actor.level;
		let zs: number = UserZs.ins() ? UserZs.ins().lv : 0;
		let strLv: string = "|C:0xF1D715&T:" + (zs ? zs + "转" : "") + "|";
		strLv = strLv + lv + "级";
		this.lvTxt.textFlow = TextFlowMaker.generateTextFlow(strLv);
	}

}

ViewManager.ins().reg(UIView1, LayerManager.UI_Popup);
