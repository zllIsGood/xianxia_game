/** 腊八兑换列表项 */
class LabaChangeItemRender extends BaseItemRender{
	public get:eui.Button;
	public redPoint:eui.Image;

	private _dataCollect:ArrayCollection;
	private limitchange1:eui.Label;
	private reward:eui.List;
	private result:ItemBase;
	private slimit:eui.Group;
	private limitchange0:eui.Label;
	public constructor() {
		super();
		//this.skinName = "LaBaexchangeItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();

		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	public dataChanged():void
	{
		if( !this.data )return;
		//{config:configs[i],state:state}
		let config  = this.data.config;
		let state  = this.data.state;
		let actData = Activity.ins().getActivityDataById(config.Id) as ActivityType7Data;

		if (!this._dataCollect){
			this._dataCollect = new ArrayCollection();	
			this.reward.dataProvider = this._dataCollect;
		}
		this.result.data = config.rewards[0];
		let items = [];
		for( let i in config.items ){
			let itemcfg = GlobalConfig.ItemConfig[config.items[i].id];
			let item = {id:config.items[i].id,count:config.items[i].count,type:ItemConfig.getType(itemcfg)};
			items.push(item);
		}
		// this._dataCollect.source = items;
		this._dataCollect.replaceAll(items);
		this.reward.validateNow();
		for( let i = 0;i < this.reward.numElements;i++ ){
			let render: ItemBase = this.reward.getVirtualElementAt(i) as ItemBase;
			let datas:{id:number,count:number,type:number} = this.reward.dataProvider.getItemAt(i) as {id:number,count:number,type:number};
			let itemData: ItemData = UserBag.ins().getBagItemById(datas.id);
			let curCount = itemData?itemData.count:0;
			let color = curCount >= datas.count?0x00ff00:0xff0000;
			render.setName(`|C:${color}&T:(${curCount}/${datas.count})`);
		}
		let colorStr = 0;
		if( state == Activity.CanGet ){
			this.get.enabled = true;
			this.get.currentState = "up";
			colorStr = 0x00ff00;
		}else{
			this.get.enabled = false;
			this.get.currentState = "disabled";
			colorStr = 0xff0000;
		}
		//个人和每日不允许同时存在 若同时存在 只显示个人
		let sum:number = 0;
		if( config.count ){
			sum = config.count - actData.personalRewardsSum[config.index];
			sum = sum>0?sum:0;
			this.limitchange1.textFlow = TextFlowMaker.generateTextFlow1(`剩余：${sum}`);
		}
		else if( config.dailyCount ){
			sum = config.dailyCount - actData.exchange[config.index];
			sum = sum>0?sum:0;
			this.limitchange1.textFlow = TextFlowMaker.generateTextFlow1(`今日剩余：${sum}`);
		}
		if( config.scount ){
			this.slimit.visible = true;
			sum = config.scount - actData.worldRewardsSum[config.index];
			sum = sum>0?sum:0;
			this.limitchange1.textFlow = TextFlowMaker.generateTextFlow1(`今日全服可兑换次数：${sum}`);
		}else{
			this.slimit.visible = false;
		}

		this.redPoint.visible = this.get.enabled;

		let maxitems = 3;
		//控件未满 符号移除
		for( let i = 0;i < maxitems;i++ ){
			if( !config.items[maxitems-i-1] ){
				if( this[`add${maxitems-i-1}`] )
					DisplayUtils.removeFromParent(this[`add${maxitems-i-1}`]);
			}
		}

	}

	private onTap(e:egret.TouchEvent) {
		if( !this.data || !this.data.config ){
			UserTips.ins().showTips(`数据异常`);
			return;
		}
		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH)
		{
			ViewManager.ins().open(BagFullTipsWin);
			return;
		}

		Activity.ins().sendReward(this.data.config.Id, this.data.config.index);
    }

	public destruct(): void {
		this.get.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}