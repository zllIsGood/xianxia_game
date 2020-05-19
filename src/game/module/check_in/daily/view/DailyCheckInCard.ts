class DailyCheckInCard extends eui.ItemRenderer {
	private static GENE_STRING_LIST: string[] = ["零", "一", "双", "三", "四", "五", "六", "七", "八", "九", "十"];

	public item: ItemBase;

	public complement: eui.Image;

	public vipFlagGroup: eui.Group;
	public vipLab: eui.Label;

	public dayFlagGroup: eui.Group;
	public dayLab: eui.Label;

	public checkedMask: eui.Image;

	public checked: eui.Image;
	public selImg: eui.Image;

	public id: number = 0;

	public checkInState: number = 0;

	// private EquipEffect: MovieClip;
	// quaeff4
	public constructor() {
		super();
		this.skinName = "DailyCheckInItem";
	}

	public dataChanged(): void {
		// this.id = this.data;
		//清理
		// if(!this.data)return;
		// return;
		this.resetView();
		// if(!this.data)return;
		//根据数据刷新
		let rewardCfg: MonthSignConfig = this.data as MonthSignConfig;
		if (rewardCfg) {
			//点击穿透
			this.vipFlagGroup.touchChildren = false;
			this.vipFlagGroup.touchEnabled = false;
			this.dayFlagGroup.touchChildren = false;
			this.dayFlagGroup.touchEnabled = false;
			this.complement.touchEnabled = false;
			this.dayFlagGroup.visible = false;

			//道具
			this.item.data = rewardCfg.rewards[0];

			this.item.touchChildren = false;
			this.item.touchEnabled = false;
			// this.item.isShowName(false);

			let state: number = DailyCheckIn.ins().getCheckInState(rewardCfg.day);
			if (state) {
				switch (state) {
					case DailyCheckInState.canCheck:
						this.checkInState = DailyCheckInState.canCheck;
						this.showFlag();
						break;
					case DailyCheckInState.hasChecked:
						this.checkInState = DailyCheckInState.hasChecked;
						this.showChecked();
						break;
				}
			} else {
				this.showFlag();
				let isComplement: boolean = false;
				this.item.touchChildren = !isComplement;
				this.item.touchEnabled = !isComplement;
			}
		}
		this.showEquipEffect();
	}

	private showEquipEffect(): void {
		let state: number = DailyCheckIn.ins().getCheckInState(this.data.day);
		// if (state != DailyCheckInState.canCheck) {
		// 	if (this.EquipEffect) DisplayUtils.removeFromParent(this.EquipEffect);
		// } else {
		// 	this.EquipEffect = this.EquipEffect || new MovieClip();
		// 	this.EquipEffect.touchEnabled = false;
		// 	this.EquipEffect.x = 50;
		// 	this.EquipEffect.y = 48;
		// 	this.EquipEffect.scaleX = 1.6;
		// 	this.EquipEffect.scaleY = 1.6;
		// 	if (!this.EquipEffect.parent) this.addChild(this.EquipEffect);
		// 	this.EquipEffect.playFile(RES_DIR_EFF + "quaeff4", -1);
		// }

		if (state == DailyCheckInState.canCheck) {
			this.selImg.visible = true;
			DisplayUtils.flashingObj(this.selImg, true);
		} else {
			this.selImg.visible = false;
			DisplayUtils.flashingObj(this.selImg, false);
		}
	}
 
	/**
	 * 显示已签到
	 * @returns void
	 */
	private showChecked(): void {
		this.checked.visible = this.checkedMask.visible = true;
	}

	/**
	 * 显示标识
	 * @returns void
	 */
	private showFlag(): void {
		let rewardCfg: MonthSignConfig = this.data as MonthSignConfig;
		if (rewardCfg) {
			if (rewardCfg.vipLabel > 0) {
				//VIP标识
				let vipLevel: number = rewardCfg.vipLabel;
				if (vipLevel > 10) vipLevel = 10;
				let vipCfg: MonthSignVipConfig = CheckInConfigMgr.ins().getVipCfg_Daily(vipLevel);
				if (vipCfg) {
					this.vipFlagGroup.visible = true;

					this.vipLab.text = (`${UserVip.formatLvStr(vipLevel)}双倍`).replace("IP", "");
				}
			}
			else {
				//无VIP标识
				if (rewardCfg.dayLabel > 0) {
					//日期标识
					this.dayLab.text = `${rewardCfg.day}天`;
				}
			}
		}
	}

	/**
	 * 重置视图
	 * @returns void
	 */
	private resetView(): void {
		this.complement.visible = false;
		this.vipFlagGroup.visible = false;
		this.dayFlagGroup.visible = false;
		this.checked.visible = this.checkedMask.visible = false;
		// if (this.EquipEffect) DisplayUtils.removeFromParent(this.EquipEffect);
	}
}