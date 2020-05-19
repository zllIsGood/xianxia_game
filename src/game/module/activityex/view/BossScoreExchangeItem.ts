class BossScoreExchangeItem extends eui.ItemRenderer {
	private goBtn: eui.Button;
	private descLab: eui.Label;
	private nameLab: eui.Label;
	private icon: eui.Image;
	private redPoint: eui.Image;
	private itemIcon0: ItemBase;
	private itemConfig: ItemConfig;
	private count:eui.Label;
	public constructor() {
		super();
		this.skinName = 'hefuBossItemSkin';
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

			// this.goBtn.touchEnabled = isBuy && count >= config.score;

			this.redPoint.visible = isBuy && count >= config.score;

			this.nameLab.text = item.name;

			let color: string = (count < config.score) ? "#F3311E" : "#35E62D";

			// this.descLab.textFlow = new egret.HtmlTextParser().parser(`<font color = '${color}'>${count}</font><font color = '#9F946D'>/${config.score}</font>`);
			this.descLab.textFlow = new egret.HtmlTextParser().parser(`<font color = '${color}'>${config.score}</font>`);

			this.goBtn.currentState = "up";
			this.goBtn.touchEnabled = true;
			//剩余份数
			if( config.count ){
				this.count.visible = true;
				let sum = config.count - actdata.personalRewardsSum[config.index];
				sum = sum>0?sum:0;
				if( !sum ){
					this.goBtn.currentState = "disabled";
					this.goBtn.touchEnabled = false;
				}
				let colorInt = sum < 0? 0xF3311E : 0x35E62D;
				this.count.textFlow = TextFlowMaker.generateTextFlow1(`|C:0x9F946D&T:剩余|C:${colorInt}&T:${sum}|C:0x9F946D&T:份`)
				// new egret.HtmlTextParser().parser(`<font color = '#9F946D'>剩余</font><font color = '${color}'>${sum}</font><font color = '#9F946D'>份</font>`);
			}else{
				this.count.visible = false;
			}

			this.itemConfig = item;
			this.itemIcon0.data = config.rewards[0];

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