/**
 * 全民boss结算面板
 */
class PubResultWin extends BaseEuiView {

	private closeBtn: eui.Button;

	private container0: eui.Group;

	private container1: eui.Group;
	/** 倒计时剩余秒 */
	private s: number;

	private txt0: eui.TextInput;
	private txt1: eui.TextInput;
	private txt2: eui.TextInput;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "PubResultSkin";
	}

	public open(...param: any[]): void {
		let myRank: number = param[0];
		let no1Name: string = param[1];
		let no1Level: number = param[2];
		let no1Reward: RewardData[] = param[3];
		let myReward: RewardData[] = param[4];

		this.addTouchEvent(this.closeBtn, this.onTap);

		TimerManager.ins().doTimer(1000, 10, this.updateCloseBtnLabel, this);

		this.txt0.text = `（${no1Name} Lv.${no1Level}）`;

		for (let i = 0; i < this.container0.numChildren; i++) {
			let element: ItemBase = this.container0.getChildAt(i) as ItemBase;
			element.destruct();
		}
		for (let i = 0; i < this.container1.numChildren; i++) {
			let element: ItemBase = this.container1.getChildAt(i) as ItemBase;
			element.destruct();
		}
		this.container0.removeChildren();
		this.container1.removeChildren();
		this.txt1.visible = myRank != 1;
		this.txt2.visible = myRank != 1;

		for (let i = 0; i < no1Reward.length; i++) {
			let item: ItemBase = new ItemBase;
			item.data = no1Reward[i];
			this.container0.addChild(item)
		}

		this.s = 10;
		this.closeBtn.name = "退出";

		if (myRank == 1)
			return;

		this.txt2.text = `（伤害排名：第${myRank}名）`;

		for (let i = 0; i < myReward.length; i++) {
			let item = new ItemBase;
			item.data = myReward[i];
			this.container1.addChild(item);
		}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);

		if (GameMap.fubenID > 0) {
			UserFb.ins().sendExitFb();
		}
	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			this.onTap();
		this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}

	private onTap(): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(PubResultWin, LayerManager.UI_Main);