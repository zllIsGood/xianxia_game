/**
 * 活动26控件
 */
class OSATargetItemRender26 extends BaseItemRender {
	private reward: eui.List;//奖励列表
	private times: eui.Label;//可领取次数
	private get: eui.Button;//充值
	private charge: eui.Label;//秒杀价
	private worth: eui.Label;//秒杀价
	private redPoint: eui.Image;

	private index: number;
	private Cur:number;
	private rechargeId:number;

	constructor() {
		super();
		this.skinName = 'YYMSItemSkin';
		this.init();
	}

	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		this.reward.itemRenderer = ItemBase;
	}
	/**触摸事件 */
	public onClick(e: egret.Event) {
		switch (e.target) {
			case this.get:
				if (this.Cur == 0){
					UserTips.ins().showTips(`|C:0xff0000&T:购买次数已用完`);
				} else {
					Recharge.ins().showReCharge(this.rechargeId);
				}
		}
	}

	protected dataChanged(): void {
		if (!this.data) return;
		let config: ActivityType26Config = this.data;
		let act26Data: ActivityType26Data = Activity.ins().getActivityDataById(config.Id) as ActivityType26Data;
		if (!config || !act26Data) {
			return;
		}
		this.redPoint.visible = false;

		let data = Activity.ins().giftData;
		for (let i in data){
			if (config.index == data[i].index){
				this.Cur = config.limit - data[i].count;
			}
		}

		this.rechargeId = config.rechargeId;
		this.Cur = this.Cur <= 0 ? 0 : this.Cur;
		this.get.enabled = this.Cur > 0 ? true : false;
		let colorStr = this.Cur ? 0x00ff00 : 0xff0000;
		this.times.textFlow = TextFlowMaker.generateTextFlow1(`可购买：|C:${colorStr}&T:${this.Cur}|/${config.limit}`);
		this.times.visible = this.get.visible = this.Cur <= config.limit ? true : false;
		this.charge.textFlow = TextFlowMaker.generateTextFlow1(`${config.prices} 元`);
		this.worth.textFlow = TextFlowMaker.generateTextFlow1(`价值: ${config.worth}元宝`);

		this.reward.dataProvider = new eui.ArrayCollection(config.items);
		this.index = config.index;
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}
}