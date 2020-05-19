
class InviteCheckInCard extends eui.ItemRenderer {

    public item: ItemBase;
	public checkedMask: eui.Image;
	public checked: eui.Image;
	public selImg: eui.Image;

	public id: number = 0;
    
    public constructor() {
		super();
		this.skinName = "inviteCheckInItem";
		
    }
    

    public dataChanged(): void {

		this.resetView();
		
		//根据数据刷新
		let dailyInviteCfg: DailyInviteConfig = this.data as DailyInviteConfig;

		/** 读取服务器数据, 获取当前进度信息 */
		let inviteModel: DailyInviteModel = Invite.ins().model;
		
		if (dailyInviteCfg) {
			//道具
			this.item.data = dailyInviteCfg.inviteAwards[0];

			this.item.touchChildren = false;
			this.item.touchEnabled = false;

			/** 判断是否已经领奖, awardTotalCount是从1开始的 */
			let isGet: boolean = Boolean((inviteModel.dailyAwardCount >> dailyInviteCfg.index) & 1);
			// 已领取
			if (isGet) {

				this.selImg.visible = false;
				DisplayUtils.flashingObj(this.selImg, false);
				this.checked.visible = true;
				this.checkedMask.visible = true;
				// this.item.touchEnabled = false;
			
			} else { 

				this.checked.visible = false;
				this.checkedMask.visible = false;
				
				// 未领取
				if (inviteModel.dailyFinishCount >= dailyInviteCfg.index) {
					
					// this.item.touchEnabled = true;
					this.selImg.visible = true;
					DisplayUtils.flashingObj(this.selImg, true);
					
				} else { // 未可以领取

					this.selImg.visible = false;
					DisplayUtils.flashingObj(this.selImg, false);
				}
			}
		}
	}


	/**
	 * 重置视图
	 * @returns void
	 */
	private resetView(): void {
		this.checked.visible = this.checkedMask.visible = false;
	}
}