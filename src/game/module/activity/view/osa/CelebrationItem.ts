class CelebrationItem extends BaseItemRender {

	public index: number;
	private already: eui.Image;//已领取
	private redPoint: eui.Image;
	private target: eui.Label;
	private ball: eui.Image;
	private ball0: eui.Image;

	constructor() {
		super();
		this.skinName = 'CERechargeItemSkin';

	}

	public destruct(): void {

	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	protected dataChanged(): void {
		if (!this.data) return;
		let item: { curCost: number, config: ActivityType3Config } = this.data;
		let actData: ActivityType3Data = Activity.ins().getActivityDataById(item.config.Id) as ActivityType3Data;
		let state = actData.getRewardStateById(item.config.index);
		this.redPoint.visible = false;
		this.already.visible = false;
		let color: number = 0xD1C28F;
		// config.expAttr [完整 , 破蛋, 锤子特效, 爆炸特效]
		this.ball.source = item.config.expAttr[0];
		if (state == Activity.Geted) {
			//已领取
			this.already.visible = true;
			color = 0x00ff00;
			this.ball.source = item.config.expAttr[1];
		} else if (state == Activity.CanGet) {
			//可领取
			color = 0x00ff00;
			this.redPoint.visible = true;
		} else {
			//未达成
			color = 0xff0000;
		}

		this.target.textFlow = TextFlowMaker.generateTextFlow(`|C:${item.config.val <= item.curCost ? 0x00ff00 : 0xD1C28F}&T:${item.config.val}`);
		this.ball0.visible = false;//选中
	}

	//是否选中
	public setSelect(s: boolean): void {
		this.ball0.visible = s;
	}
}
