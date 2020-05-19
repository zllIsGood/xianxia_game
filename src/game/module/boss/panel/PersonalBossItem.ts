class PersonalBossItem extends BaseItemRender {

	private nameTxt: eui.Label;
	private notOpenImg: eui.Image;
	constructor() {
		super();
		this.skinName = "personalBossItemSkin";
	}

	public dataChanged(): void {
		let tData: DailyFubenConfig = this.data;
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[tData.bossId];
		let str: string = "";
		if (tData.monthcard) {
			str = "元宝月卡";
		} else if( tData.specialCard ){
			str = "至尊";
		} else if (tData.privilege) {
			str = "贵族";
		} else {
			str = tData.zsLevel > 0 ? `${tData.zsLevel}转` : `${tData.levelLimit}级`;
		}

		this.nameTxt.text = `${bossBaseConfig.name}·${str}`;

		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		let config: FbModel = UserFb.ins().getFbDataById(this.data.id);
		let isDie: boolean = config.getPlayCount() <= 0;
		let bossLv: number = this.data.zsLevel * 1000 + this.data.levelLimit;
		if (isDie) {
			this.enabled = false;
			this.currentState = "disabled";
			this.notOpenImg.visible = false;
		} else {
			this.enabled = true;
			if (tData.monthcard) {
				this.notOpenImg.visible = Recharge.ins().monthDay?false:true;
			} else if (tData.privilege) {
				this.notOpenImg.visible = Recharge.ins().forevetCard != 2;
			} else if( tData.specialCard ){
				this.notOpenImg.visible = Recharge.ins().franchise?false:true;
			} else {
				this.notOpenImg.visible = roleLv < bossLv;
			}
		}
	}
}