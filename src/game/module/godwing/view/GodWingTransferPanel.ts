/**
 * 神羽转换界面
 */
class GodWingTransferPanel extends BaseView {
	public powerPanel: PowerPanel;

	/**控件*/
	public skill:GodWingItem;
	// public item0:GodWingItem
	public attr:eui.Button;
	private have:eui.List;
	private item0:GodWingItem;

	private transfer:eui.Button;
	private cost:eui.Label;
	private costImg0:eui.Image;
	private itemList:eui.ArrayCollection;
	private curItemId:number;
	private desId:number;//置换目标id
	private warn:eui.Label;
	constructor() {
		super();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.transfer,this.onClick);
		this.removeTouchEvent(this.have,this.onListTap);
		this.removeTouchEvent(this.item0,this.onClick);
		this.removeObserve();
		this.reset();
		for( let i = 1; i < Wing.GodWingMaxSlot;i++ ){
			this.removeTouchEvent(this[`item${i}`], this.onTouchItem);
		}
	}


	public open(...param: any[]): void {
		this.addTouchEndEvent(this.transfer,this.onClick);
		this.addTouchEvent(this.have, this.onListTap);
		this.addTouchEvent(this.item0, this.onClick);
		this.observe(UserBag.ins().postItemAdd,this.callbackUpdate);


		this.itemList = new eui.ArrayCollection();
		this.have.itemRenderer = GodWingItem;
		this.have.dataProvider = new eui.ArrayCollection([]);
		// this.observe(Wing.ins().postBoost, this.showBoost);
		this.updateGodWing()
	}
	private reset(){
		if (!this.itemList) return;
		//置换目标
		for( let i = 1; i < Wing.GodWingMaxSlot;i++ ){
			this.addTouchEvent(this[`item${i}`], this.onTouchItem);
			this[`item${i}`].setCountVisible(false);
			this[`item${i}`].setNameVisible(false);
			this[`item${i}`].setImgIcon("");
			this[`item${i}`].setSelect(false);
			this[`item${i}`].data = null;
		}
		this.item0.setCountVisible(false);
		this.item0.setImgIcon("");
		this.item0.setNameVisible(false);
		this[`item0`].data = null;

		this.updateBagList();
		this.warn.visible = this.itemList.length?false:true;
		this.curItemId = 0;
		this.desId = 0;
	}
	private updateBagList(){
		let itemData: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_16);
		this.itemList.replaceAll(itemData);
		this.have.dataProvider = this.itemList;
	}
	private callbackUpdate(){
		if( !this[`item0`].itemId )
			return;
		let item:ItemData = UserBag.ins().getBagItemById(this[`item0`].itemId);
		if( !item ){
			this.reset();
		}
		this.updateBagList();
		this.updateCost();
	}
	//转换
	private onClick(e:egret.TouchEvent):void{
		switch (e.currentTarget){
			case this.transfer:
				if( Boolean(UserBag.ins().getItemByType(ItemType.TYPE_16)) ){
					if( this[`item0`].itemId && this.desId )
						Wing.ins().sendResetGodWing(this[`item0`].itemId,this.desId);
					else
						UserTips.ins().showTips(`请确认转换源和转换目标`);
				}else{
					UserTips.ins().showTips(`不可转换`);
				}
				break;
			case this.item0://置换母本
				if( this.curItemId ){
					let config:GodWingItemConfig = GlobalConfig.GodWingItemConfig[this.curItemId];
					ViewManager.ins().open(GodWingTipsWin,config);
				}
				break;
		}


	}
	//选择转换目标
	private onTouchItem(e: egret.TouchEvent): void {
		for( let i = 1; i < Wing.GodWingMaxSlot;i++ ){
			if( e.currentTarget == this["item"+i] ){
				if( e.currentTarget.itemId ){
					this.desId = e.currentTarget.itemId;
					this["item"+i].setSelect(true);
				}
			}else{
				this["item"+i].setSelect(false);
			}
		}
	}
	//点击背包列表
	private onListTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget && this.have.selectedItem) {
			let itemdata:ItemData = this.have.selectedItem;//ItemData
			this.curItemId = itemdata._configID;
			let gwConfig:GodWingItemConfig = GlobalConfig.GodWingItemConfig[itemdata._configID];
			let cfg:GodWingLevelConfig[] = GlobalConfig.GodWingLevelConfig[gwConfig.level];//同一个等级
			this[`item0`].data = gwConfig;
			this.item0.setNameVisible(true);
			let itemcfg:ItemConfig = GlobalConfig.ItemConfig[itemdata._configID];
			this[`item0`].setImgIcon(itemcfg.icon + "_png");
			let idx:number = 1;
			for( let i in cfg){//不同一个部位
				if( cfg[i].slot != gwConfig.slot ){
					this[`item${idx}`].data = GlobalConfig.GodWingItemConfig[cfg[i].itemId];
					this[`item${idx}`].setNameVisible(true);
					this[`item${idx}`].setSelect(false);
					idx++;
					if( idx > 3 )break;//1换3
				}
			}
			this.updateCost();
		}
	}


	/**UI*/
	private updateGodWing(){
		this.reset();
		this.updateCost();
		// this.updateRedPoint();
	}

	private updateCost(){
		if( !this.curItemId ){
			this.costImg0.visible = this.cost.visible = false;
			return;
		}
		this.costImg0.visible = this.cost.visible = true;
		let config:GodWingItemConfig = GlobalConfig.GodWingItemConfig[this.curItemId];
		this.cost.text = config.needMoney + "";

	}
	private updateRedPoint(){
		// this.redPoint.visible = false;//GodWingRedPoint.ins().tabs[2];
	}

}
