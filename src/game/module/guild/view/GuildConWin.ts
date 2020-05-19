/**
 * Created by Administrator on 2016/8/30.
 */
class GuildConWin extends BaseEuiView {

	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public desc0: eui.Label;
	public desc1: eui.Label;
	public count0: eui.Label;
	public count1: eui.Label;
	public info0: eui.Label;
	public info1: eui.Label;
	public btn0: eui.Button;
	public btn1: eui.Button;
	private bgClose: eui.Rect;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "GuildConSkin";

		this.desc0.text = "捐献" + GlobalConfig.GuildDonateConfig[1].count + "元宝";
		this.desc1.text = "捐献" + GlobalConfig.GuildDonateConfig[2].count + "金币";

		this.info0.text = "贡献 +" + GlobalConfig.GuildDonateConfig[1].awardContri + "	资金 +" + GlobalConfig.GuildDonateConfig[1].awardFund;
		this.info1.text = "贡献 +" + GlobalConfig.GuildDonateConfig[2].awardContri + "	资金 +" + GlobalConfig.GuildDonateConfig[2].awardFund;

	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	private update(): void {
		let num: number = GlobalConfig.GuildDonateConfig[1].dayCount[UserVip.ins().lv];
		let nextNum: number = GlobalConfig.GuildDonateConfig[1].dayCount[UserVip.ins().lv + 1];
		let arr = Guild.ins().getConCount();
		if (arr[0] <= 0) {
			if (nextNum && (nextNum - num > 0))
				this.count0.textFlow = new egret.HtmlTextParser().parser("<font color='#f3311e'>" + UserVip.formatLvStr(UserVip.ins().lv + 1) + "</font>额外捐献" + (nextNum - num) + "次");
			else
				this.count0.text = (num - arr[0]) + "/" + GlobalConfig.GuildDonateConfig[1].dayCount[UserVip.ins().lv];
			this.btn0.enabled = false;
		} else {
			this.btn0.enabled = true;
			this.count0.text = (num - arr[0]) + "/" + GlobalConfig.GuildDonateConfig[1].dayCount[UserVip.ins().lv];
		}
		this.btn1.enabled = arr[1] > 0;
		
		this.count1.text = (GlobalConfig.GuildDonateConfig[2].dayCount - arr[1]) + "/" + GlobalConfig.GuildDonateConfig[2].dayCount;
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.btn0, this.onTap);
		this.addTouchEvent(this.btn1, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);


		this.observe(Guild.ins().postConCount, this.update);

		Guild.ins().sendConCount();
		if (UserVip.ins().lv == 0)
			this.btn0.label = "成为VIP";
		else
			this.btn0.label = "捐 献";
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.btn0, this.onTap);
		this.removeTouchEvent(this.btn1, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private onTap(e: egret.TouchEvent): void {

		let arr = Guild.ins().getConCount();
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;

			case this.btn0:
				if (UserVip.ins().lv == 0)
					ViewManager.ins().open(VipWin);
				else if (arr[0] <= 0)
					UserTips.ins().showTips("次数不足");
				else if (Actor.yb >= GlobalConfig.GuildDonateConfig[1].count) {
					Guild.ins().sendCon(1);
				}
				else {
					UserTips.ins().showTips("元宝不足");
					ViewManager.ins().close(this);
				}
				break;
			case this.btn1:
				if (arr[1] <= 0)
					UserTips.ins().showTips("次数不足");
				else if (Actor.gold >= GlobalConfig.GuildDonateConfig[2].count) {
					Guild.ins().sendCon(2);
				}
				else
					UserTips.ins().showTips("金币不足");
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(GuildConWin, LayerManager.UI_Popup);