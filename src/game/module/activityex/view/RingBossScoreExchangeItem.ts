class RingBossScoreExchangeItem extends eui.ItemRenderer {
	private goBtn: eui.Button;
	private descLab: eui.Label;
	private nameLab: eui.Label;
	private icon: eui.Image;
	private redPoint: eui.Image;
	private itemIcon0: ItemBase;
	private itemConfig: ItemConfig;
	public count:eui.Label;

	public constructor() {
		super();
		this.skinName = 'ringBossItemSkin';
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.goBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick,this);

	}

	protected dataChanged(): void {
		if( this.data instanceof ActivityType7Config ){
			let config:ActivityType7Config = this.data as ActivityType7Config;
			let item = GlobalConfig.ItemConfig[config.rewards[0].id];
			let actdata:ActivityType7Data = Activity.ins().getActivityDataById(config.Id) as ActivityType7Data;
			let count = actdata.bossScore;
			let isBuy:boolean = Activity.ins().getIsBuy(config);
			this.redPoint.visible = isBuy && count >= config.score;
			this.nameLab.text = item.name;
			let color: string = (count < config.score) ? "#F3311E" : "#35E62D";
			this.descLab.textFlow = new egret.HtmlTextParser().parser(`<font color = '${color}'>${count}</font><font color = '#9F946D'>/${config.score}</font>`);
			this.itemConfig = item;
			this.itemIcon0.data = config.rewards[0];
			this.itemIcon0.hideName();

			let data = Activity.ins().getActivityDataById(config.Id) as ActivityType7Data;
			let useCount = data.personalRewardsSum[config.index];
			let remainCount = config.count - useCount;
			if(remainCount){
				this.count.text = "剩余" + remainCount  + "份";
			}
			else{
				this.count.text = "";
			}
		}
	}

	public onClick() {
		if( this.data instanceof ActivityType7Config ){
			let config:ActivityType7Config = this.data as ActivityType7Config;
			let actdata:ActivityType7Data = Activity.ins().getActivityDataById(config.Id) as ActivityType7Data;
			if (actdata.bossScore < config.score) {
				UserTips.ins().showTips("|C:0xf3311e&T:积分不足|");
				return;
			}
			if (!Activity.ins().getIsBuy(config)) {
				UserTips.ins().showTips("|C:0xf3311e&T:已经兑换完|");
				return;
			}

			Activity.ins().sendReward(config.Id,config.index);
		}
	}

}