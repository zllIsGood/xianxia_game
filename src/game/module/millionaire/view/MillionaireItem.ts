/**
 * 大富翁格子控件
 *
 */
class MillionaireItem extends BaseItemRender {
	public static ACTION_1 = 1;//普通奖励: param随机一个  exparam固定奖励
	public static ACTION_2 = 2;//随机命运
	public static ACTION_3 = 3;//传送门
	public static ACTION_4 = 4;//奖励骰子数

	public itemicon:eui.Image;
	private shadow:eui.Image;
	private Img:eui.Image;
	public isEffing:boolean;

	private startX:number;
	private startY:number;
	constructor() {
		super();
		this.skinName = 'richmanItemSkin';
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		
		this.isEffing = false;
		this.startX = this.itemicon.x;
		this.startY = this.itemicon.y;
	}
	//{rewardId:MillionaireData.ins().rewardIdByGrids[i],index:i+1};
	public setHide(){
		this.itemicon.alpha = 1;
		this.itemicon.source = "";
		this.shadow.visible = false;
		this.itemicon.x = this.startX;
		this.itemicon.y = this.startY;
	}
	public setHideEff(){
		// this.isEffing = true;
		// let self = this;
		// egret.Tween.get(this.itemicon).to({y:this.itemicon.y-150,alpha:0},1000).call(()=>{
		// 	egret.Tween.removeTweens(self.itemicon);
		// 	self.isEffing = false;
		// 	self.setHide();
		// });
		// this.shadow.visible = false;

		let flyItem:eui.Image = new eui.Image(this.itemicon.source);
		flyItem.x = this.startX;
		flyItem.y = this.startY;
		flyItem.width = this.itemicon.width;
		flyItem.height = this.itemicon.height;
		this.itemicon.parent.addChild(flyItem);
		GameLogic.ins().postFlyItemEx(flyItem);

		this.setHide();

	}
	protected dataChanged(): void {
		this.shadow.visible = true;
		let id:number = this.data.index;
		//特殊格子索引是0 踩过的格子是-1
		if( this.data.rewardId == -1 ){
			//踩过的格子 图标和影子消失
			this.itemicon.source = "";
			this.shadow.visible = false;
			return;
		}
		let rewardId:number = this.data.rewardId - 1;//因为奖励id索引是从1开始 这里-1

		let config:RichManGridConfig = GlobalConfig.RichManGridConfig[id];
		if( !config )
			return;

		//param不是奖励数据或者随机命运都是0
		let rdata:RewardData;
		//优先处理固定圈数奖励
		if(config.exparam){
			for( let k in config.exparam ){
				if( Number(k) == Millionaire.ins().round ){
					rdata = config.exparam[k];
					break;
				}
			}
		}
		//有值代表是固定圈数奖励(注意:固定圈数奖励优先级高于随机命运奖励)
		if( rdata ){
			this.setImgSouce(rdata);
			return;
		}

		if( config.action == MillionaireItem.ACTION_1 ){
			/**每个格子在初始化普通奖励之前要检查随机命运奖励是否有值**/
			id = Millionaire.ins().randomGridById;
			if( id ){
				//随机命运格子id存在 则用随机命运奖励
				config = GlobalConfig.RichManGridConfig[id];
				rewardId = Millionaire.ins().randomGridByRewardId - 1;//随机命运没踩中时候为0 因为奖励id索引是从1开始 这里-1
			}
			rdata = config.param[rewardId];
			this.setImgSouce(rdata);
		}
		else if( config.action == MillionaireItem.ACTION_2 ){
			id = Millionaire.ins().randomGridById;
			if( id ){
				//随机命运格子id存在 则用随机命运奖励
				config = GlobalConfig.RichManGridConfig[id];
				rewardId = Millionaire.ins().randomGridByRewardId - 1;//因为奖励id索引是从1开始 这里-1
				rdata = config.param[rewardId];
				this.setImgSouce(rdata);
			}
			else{
				this.itemicon.source = "richman_json.richiman_random";
				// this.shadow.visible = false;
			}
		}
		else if( config.action == MillionaireItem.ACTION_3 ){
			this.itemicon.source = "richman_json.richiman_teleport";//"tongyong_json.tiaozhan01";//传送门
		}
		else if( config.action == MillionaireItem.ACTION_4 ){
			this.itemicon.source = "richman_json.richman_dice6";//骰子
		}


	}
	//设置格子道具图片
	private setImgSouce(rdata:RewardData){
		let itemType:number = 0;
		if( !rdata.type ){
			this.itemicon.source = RewardData.getCurrencyRes(rdata.id);
			switch (rdata.id) {
				case MoneyConst.yuanbao:
					itemType = 5;
					break;
				case MoneyConst.gold:
					itemType = 0;
					break;
				case MoneyConst.soul:
					itemType = 2;
					break;
				case MoneyConst.piece:
					itemType = 2;
					this.itemicon.source = RewardData.CURRENCY_RES[rdata.id];
					break;
				default:
					break;
			}
		}
		else{
			let itemconfig:ItemConfig = GlobalConfig.ItemConfig[rdata.id];
			if( itemconfig ){
				this.itemicon.source = itemconfig.icon + "_png";
			}
		}
	}

	public destruct(): void {

	}
	protected clear(): void {

	}
}