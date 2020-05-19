/**
 * Created by Peach.T on 2017/12/28.
 */
class GuardCallBossWin extends BaseEuiView {
	public anigroup: eui.Group;
	public callTimesLable: eui.Label;
	public desc: eui.Label;
	public desc0: eui.Label;
	public closeBtn: eui.Button;
	public up: eui.Button;
	public cost: eui.Group;
	public zb0: eui.Label;

	private time: number;
	private money: number;

	constructor() {
		super();
		this.skinName = "guardGodWeaponBossTips";
		this.isTopLevel = true;
	}

	public open(): void {

		let time = GuardWeaponModel.ins().getCallBossTimes();
		let money = GuardWeaponModel.ins().callBossMoney();
		this.callTimesLable.text = `${time}`;
		if (time == 0) money = 0;
		this.zb0.text = `${money}`;
		this.time = time;
		this.money = money;

		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.addTouchEvent(this.up, this.callBoss);
	}

	public callBoss(): void {
		if (this.time > 0) {
			if (Actor.yb < this.money) {
				UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
			} else {
				UserFb.ins().callGuardBoss();
			}
		}
		else {
			UserTips.ins().showTips("没有召唤BOSS次数");
		}
		this.closeWin();
	}

	public closeWin(): void {
		ViewManager.ins().close(this);
	}

}

ViewManager.ins().reg(GuardCallBossWin, LayerManager.UI_Popup);