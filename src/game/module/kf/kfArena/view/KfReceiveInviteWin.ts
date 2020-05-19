/**
 * 跨服竞技场收到邀请界面
 * @author yuyaolong
 *
 */
class kfReceiveInviteWin extends BaseEuiView {
	public notBtn: eui.Button;
	public sureBtn: eui.Button;
	//public bgClose: eui.Rect;
	private nameLabel: eui.Label;
	private powerLabel: eui.Label;
	private scoreLabel: eui.Label;
	private winRateLabel: eui.Label;
	private index: number;
	private inviteData: KFInviteData;

	public constructor() {
		super();
		this.skinName = "kfReceiveInviteSkin";
		this.isTopLevel = true;
	}

	public open(...args: any[]): void {
		this.index = args[0];
		this.inviteData = KfArenaSys.ins().inviteDataList[this.index];
		//this.addTouchEvent(this.bgClose, this.onTouch);
		this.addTouchEvent(this.notBtn, this.onTouch);
		this.addTouchEvent(this.sureBtn, this.onTouch);
		this.update();
	}

	private update(): void {
		this.nameLabel.text = this.inviteData.name;
		this.powerLabel.text = `战力：${CommonUtils.overLengthChange(this.inviteData.power)}`;
		this.scoreLabel.text = `积分：${this.inviteData.score}`;
		this.winRateLabel.textFlow = TextFlowMaker.generateTextFlow(`胜率：|C:${0xFFFF00}&T:${this.inviteData.winRate}%|`);
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			// case this.bgClose:
			//     ViewManager.ins().close(this);
			//     break;
			case this.notBtn:
				KfArenaSys.ins().sendRespondInvite(this.inviteData.roleId, 0);
				KfArenaSys.ins().inviteDataList.slice(this.index, 1);
				ViewManager.ins().close(this);
				break;
			case this.sureBtn:
				KfArenaSys.ins().sendRespondInvite(this.inviteData.roleId, 1);
				KfArenaSys.ins().inviteDataList.slice(this.index, 1);
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(kfReceiveInviteWin, LayerManager.UI_Popup);