//神兵副本鼓舞界面
class GwMijingRiseUpView extends BaseEuiView {
	private now: eui.Label;//现在加成
	private goldCost: eui.Label;
	private goldImg: eui.Image;
	private goldText: eui.Label;
	private gold: eui.CheckBox;//金币

	private yuanbaoText: eui.Label;
	private yuanbaoImg: eui.Image;
	private yuanbaoCost: eui.Label;
	private yuanbao: eui.CheckBox;//元宝
	private cancelBtn: eui.Button;//取消
	private sureBtn: eui.Button;//确定
	private isMax1: boolean = false;
	private isMax2: boolean = false;
	public constructor() {
		super();
	}
	public initUI(): void {
		this.skinName = "GwRiseUpSkin";
	}
	public open(...param: any[]): void {
		this.gold.selected = true;
		this.addTouchEvent(this.gold, this.onTap);
		this.addTouchEvent(this.yuanbao, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);
		this.addTouchEvent(this.cancelBtn, this.onTap);
		this.observe(GodWeaponCC.ins().postFubenInfo, this.updateView);
		this.updateView();
	}
	private updateView(): void {
		let data: GwFubenData = GodWeaponCC.ins().fubenInfoData;
		let addNum: number = data.getBuyCount * 10;
		this.now.text = `当前鼓舞  伤害 +${addNum}%`;
		this.goldCost.text = GlobalConfig.GodWeaponBaseConfig.buyBuff[0].moneyCount + "";
		this.yuanbaoCost.text = GlobalConfig.GodWeaponBaseConfig.buyBuff[1].moneyCount + "";

		let dataType: number[] = data.buyTypeData(1);
		if (dataType[1] >= GlobalConfig.GodWeaponBaseConfig.buyBuff[0].maxCount) {
			this.gold.visible = false;
			this.goldImg.visible = false;
			this.goldCost.visible = false;
			this.goldText.text = `金币鼓舞次数已满`;
			this.isMax1 = true;
			this.gold.selected = false;
		}
		dataType = data.buyTypeData(2);
		if (dataType[1] >= GlobalConfig.GodWeaponBaseConfig.buyBuff[1].maxCount) {
			this.yuanbao.visible = false;
			this.yuanbaoCost.visible = false;
			this.yuanbaoImg.visible = false;
			this.yuanbaoText.text = `元宝鼓舞次数已满`;
			this.isMax2 = true;
		}
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.gold, this.onTap);
		this.removeTouchEvent(this.yuanbao, this.onTap);
		this.removeTouchEvent(this.cancelBtn, this.onTap);
		this.removeTouchEvent(this.cancelBtn, this.onTap);
		this.removeObserve();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.gold:
				this.yuanbao.selected = false;
				this.gold.selected = true;
				break;
			case this.yuanbao:
				this.yuanbao.selected = true;
				this.gold.selected = false;
				break;
			case this.cancelBtn:
				ViewManager.ins().close(this);
				break;
			case this.sureBtn:
				if (this.isMax2 && this.isMax1) {
					UserTips.ins().showTips(`鼓舞次数已满`);
					return;
				}
				if (!this.yuanbao.selected && !this.gold.selected) {
					UserTips.ins().showTips(`请选择购买的金钱类型`);
					return;
				}
				if (this.gold.selected) {
					if (Actor.gold < GlobalConfig.GodWeaponBaseConfig.buyBuff[0].moneyCount) {
						UserTips.ins().showCenterTips(`金币不足`);
						return;
					}
				} else {
					if (Actor.yb < GlobalConfig.GodWeaponBaseConfig.buyBuff[1].moneyCount) {
						UserTips.ins().showCenterTips(`元宝不足`);
						return;
					}
				}
				GodWeaponCC.ins().buybuff(this.gold.selected ? 1 : 2);
				let maxCount: number = GlobalConfig.GodWeaponBaseConfig.buyBuff[1].maxCount + GlobalConfig.GodWeaponBaseConfig.buyBuff[0].maxCount;
				if (GodWeaponCC.ins().fubenInfoData.getBuyCount == maxCount - 1) {
					ViewManager.ins().close(this);
				}
				break;
		}
	}
}
ViewManager.ins().reg(GwMijingRiseUpView, LayerManager.UI_Popup);