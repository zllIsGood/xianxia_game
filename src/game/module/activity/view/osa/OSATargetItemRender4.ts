/**
 * 活动4控件
 */
class OSATargetItemRender4 extends BaseItemRender {
	private rankImg:eui.Image;
	private rankNum:eui.BitmapLabel;
	private name1:eui.Label;
	private value:eui.Label;
	private reward:eui.List;
	constructor() {
		super();
		this.skinName = 'OSARankListItemSkin';
		this.init();
	}


	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);

		this.reward.itemRenderer = ItemBase;
	}
	/**触摸事件 */
	public onClick(e:egret.Event) {
		// switch (e.target){
        //
		// 		break;
		// }
	}
	//{rankData:rankDataList[i],rankType:rankType}
	protected dataChanged(): void {
		if( !this.data.rankData )
			return;
		let rankData: any = this.data.rankData;
		let activityID: any = this.data.activityID;

		let pos:number;
		// let data: ActivityType4Data = Activity.ins().getActivityDataById(config.Id) as ActivityType4Data;
		let cfg:ActivityType4Config = GlobalConfig.ActivityType4Config[activityID][1];
		let rankType:number = cfg.rankType;
		if(rankType == RankDataType.TYPE_HF_XIAOFEI){
			//消费榜
			if(rankData instanceof DabiaoData){
				let rank: any = this.data.rank?this.data.rank:rankData.rankIndex;
				if( rank <= 3 ){
					this.rankImg.source = `kaifu_icon_rank${rank}`;
					this.rankNum.visible = false;
				}else{
					this.rankImg.source = ``;
					this.rankNum.visible = true;
					this.rankNum.text = rank + "";
				}
				this.name1.text = rankData.name;
				this.value.text = rankData.numType;
				pos = rank;
				if( pos == 1 ){
					pos = 1;
				}else if( pos == 2 || pos == 3 ){
					//2~3
					pos = 2;
				}else if( pos == 4 || pos == 5 ){
					//4~5
					pos = 4;
				}else{
					//6~20
					pos = 6;
				}
				cfg = GlobalConfig.ActivityType4Config[activityID][pos];
				this.reward.dataProvider = new eui.ArrayCollection(cfg.rewards);
			}else{
				let rank: any = this.data.rank?this.data.rank:rankData.pos;
				if( rank <= 3 ){
					this.rankImg.source = `kaifu_icon_rank${rank}`;
					this.rankNum.visible = false;
				}else{
					this.rankImg.source = ``;
					this.rankNum.visible = true;
					this.rankNum.text = rank;
				}
				this.name1.text = rankData.player;
				this.value.text = rankData.value;
				pos = rank;
				if( pos == 1 ){
					pos = 1;
				}else if( pos == 2 || pos == 3 ){
					//2~3
					pos = 2;
				}else if( pos == 4 || pos == 5 ){
					//4~5
					pos = 4;
				}else{
					//6~20
					pos = 6;
				}
				cfg = GlobalConfig.ActivityType4Config[activityID][pos];
				this.reward.dataProvider = new eui.ArrayCollection(cfg.rewards);
			}

		}else{
			//除了消费榜以外
			if(rankData instanceof DabiaoData){
				if( rankData.rankIndex <= 3 ){
					this.rankImg.source = `kaifu_icon_rank${rankData.rankIndex}`;
					this.rankNum.visible = false;
				}else{
					this.rankImg.source = ``;
					this.rankNum.visible = true;
					this.rankNum.text = rankData.rankIndex + "";
				}
				this.name1.text = rankData.name;
				this.value.text = rankData.numType;
				pos = rankData.rankIndex;
				if(pos > 4){//4-20奖励一样
					pos = 4;
				}
				cfg = GlobalConfig.ActivityType4Config[activityID][pos];
				this.reward.dataProvider = new eui.ArrayCollection(cfg.rewards);
			}else{
				if( this.data.pos <= 3 ){
					this.rankImg.source = `kaifu_icon_rank${this.data.pos}`;
					this.rankNum.visible = false;
				}else{
					this.rankImg.source = ``;
					this.rankNum.visible = true;
					this.rankNum.text = this.data.pos;
				}
				this.name1.text = rankData.player;
				this.value.text = rankData.value;
				pos = this.data.pos;
				cfg = GlobalConfig.ActivityType4Config[activityID][pos];
				this.reward.dataProvider = new eui.ArrayCollection(cfg.rewards);
			}
		}


		// this.reward.validateNow();
		// for( let j = 0;j < this.reward.numElements;j++ ){
		// 	let item: ItemBase = this.reward.getVirtualElementAt(j) as ItemBase;
		// 	if (item.getItemType() == 17)
		// 		item.showSpeicalDetail = false;
		// }

		// let idx:number = rankData.pos;
		// if( isNaN(idx) ){
		// 	idx = rankData.rankIndex;//合服消费排行数据对齐
		// }
		// if(cfg){
		// 	this.reward.dataProvider = new eui.ArrayCollection(cfg.rewards);
		// }else{
		// 	this.reward.dataProvider = null;
		// }
		// this.pos = bytes.readShort();//排名
		// this.id = bytes.readInt();//角色id
		// this.player = bytes.readString();//角色名
		// this.level = bytes.readShort();//等级
		// this.zslevel = bytes.readShort();//转生等级
		// this.viplevel = bytes.readShort();//vip等级
		// this.monthCard = bytes.readShort();//月卡
		// this.value = bytes.readInt();//对应排行属性值
		// this.validateNow();
	}




}