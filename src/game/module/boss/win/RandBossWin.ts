class RandBossWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public list: eui.List;
	public playNum: eui.Label;
	public upVip: eui.Label;
	public sure: eui.Button;

	public info: OtherBoss2Config;
	public lastNum: number;
	public bossdesc: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "RandBossSkin";
		this.list.itemRenderer = ItemBase;
		this.upVip.textFlow = new egret.HtmlTextParser().parser("<font color = '#23C42A'><u>提升VIP等级</u></fomt>");
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.sure, this.onTap);
		this.addTouchEvent(this.upVip, this.onTap);

		this.info = this.getUserInfoByItemId(param[0]);
		this.list.dataProvider = new eui.ArrayCollection(this.info.show);
		let num: number = UserFb.ins().bossCallNum;
		let maxNum: number = this.info.challengeTime[UserVip.ins().lv];
		this.playNum.text = maxNum - num + "/" + maxNum;
		this.lastNum = maxNum - num;
		this.bossdesc.text = this.info.titledes;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.sure, this.onTap);
		this.removeTouchEvent(this.upVip, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.sure:
				if (this.lastNum <= 0) {
					UserTips.ins().showTips("|C:0xf3311e&T:今日召唤次数已用完|");
					return;
				}
				if (Actor.level >= this.info.levelLimit) {
					UserFb.ins().sendCallBossPlay(this.info.id);
					ViewManager.ins().close(this);
					ViewManager.ins().close(BagWin);
					return;
				}
				UserTips.ins().showTips("|C:0xf3311e&T:等级达到" + this.info.levelLimit + "级可召唤|");
				break;
			case this.upVip:
				ViewManager.ins().open(VipWin);
				break;
		}
	}

	private getUserInfoByItemId(id: number): OtherBoss2Config {
		let config: OtherBoss2Config[] = GlobalConfig.OtherBoss2Config;
		for (let i in config) {
			if (config[i].itemId == id) {
				return config[i];
			}
		}
		return null;
	}
}

ViewManager.ins().reg(RandBossWin, LayerManager.UI_Main);