class HuanShouUpgradeWin extends BaseEuiView {
	private fabaoName: eui.Image;
	private fabaoName0: eui.Image;
	private shengQiGroup: eui.Group;

	private hsMC: HuanShouMc;

	public constructor() {
		super();
		this.skinName = "huanShouLevel";
	}

	public initUI(): void {
		super.initUI();
		this.hsMC = new HuanShouMc();
		this.shengQiGroup.addChild(this.hsMC);
	}

	public open(...param: any[]): void {
		let rank = param[0];
		this.addTouchEvent(this, this.onTap);

		TimerManager.ins().doTimer(5000, 1, this.closeWin, this);

		this.setData(rank);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onTap);
		TimerManager.ins().removeAll(this);
	}

	private onTap(): void {
		this.closeWin();
	}

	private setData(rank: number): void {
		let str: string = rank > 9 ? rank + "" : "0" + rank;
		this.fabaoName0.source = "sqlevel_" + str;
		str = rank > 9 ? rank + "" : "0" + rank;
		this.fabaoName.source = `hsname_0${str}_png`;
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank];
		let avatar:string = conf.avatar ? conf.avatar : GlobalConfig.MonstersConfig[conf.monsterId].avatar;
		this.hsMC.setData(avatar);
	}
}

ViewManager.ins().reg(HuanShouUpgradeWin, LayerManager.UI_Popup);