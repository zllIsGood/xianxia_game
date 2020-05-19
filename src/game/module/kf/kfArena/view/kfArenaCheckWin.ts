/**
 * 跨服竞技场查看界面
 * @author yuyaolong
 *
 */
class kfArenaCheckWin extends BaseEuiView {
	public checkBtn: eui.Button;
	public outBtn: eui.Button;
	public bgClose: eui.Rect;
	public nameLab: eui.Label;
	public powerLab: eui.Label;
	public scoreLab: eui.Label;
	public winRateLab: eui.Label;
	public inviteBtn: eui.Button;
	private face: eui.Image;
	public data: KfArenaRoleVo;

	public constructor() {
		super();
		this.skinName = "kfArenaCheckSkin";
		this.isTopLevel = true;
	}

	public open(...args: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTouch);
		this.addTouchEvent(this.outBtn, this.onTouch);
		this.addTouchEvent(this.checkBtn, this.onTouch);
		this.data = args[0];
		this.update();
	}

	private update(): void {
		this.currentState = KfArenaSys.ins().isTFCaptain ? "normal" : "check";
		this.nameLab.text = this.data.roleName;
		this.powerLab.text = `战力：${CommonUtils.overLengthChange(this.data.power)}`;
		this.scoreLab.text = `积分：${this.data.score}`;
		this.winRateLab.text = `胜率：${this.data.winRate}%`;
		this.face.source = `head_${this.data.job}${this.data.sex}`;
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.bgClose:
				break;
			case this.outBtn:
				KfArenaSys.ins().sendOutTeam(this.data.roleID);
				break;
			case this.checkBtn:
				UserReadPlayer.ins().sendFindPlayer(this.data.roleID, this.data.roleName);
				break;
		}

		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(kfArenaCheckWin, LayerManager.UI_Popup);