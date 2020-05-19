class HonorMarketPanel extends BaseView {
	private listView: eui.List;
	private dataArr: eui.ArrayCollection;
	private myAttrValue0:eui.Label;
	private get:eui.Label;
	constructor() {
		super();
		this.name = "功勋商店";
	}

	public childrenCreated(): void{
		this.init();
	}

	public init(): void {

		this.listView.itemRenderer = HonorMarketItemRenderer;
		this.dataArr = new eui.ArrayCollection;
		this.listView.dataProvider = this.dataArr;
	}

	public open(...param: any[]): void {
		this.listView.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onTap,this);
		this.addTouchEndEvent(this.get,this.onClick);
		// this.observe(Shop.ins().postBuyCount,this.updateData);
		this.observe(Shop.ins().postRefresMedalMessage,this.updateData);
		this.observe(Actor.ins().postFeatsChange,this.callback);
		this.observe(Shop.ins().postUpdateBuyMedal,this.callback);
		Shop.ins().sendMedalMessage();
		// this.updateData();
	}
	public callback(){
		Shop.ins().sendMedalMessage();
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.get,this.onClick);
		this.removeObserve();
	}

	private updateData() {
		let arr = [];
		let dataProvider = GlobalConfig.FeatsStore;
		for (let k in dataProvider) {
			let isPush:boolean = true;
			//判断永久购是否购完
			if( dataProvider[k].type == FEATS_TYPE.forever ){
				for( let i in Shop.ins().medalData.exchangeCount ){
					if ( dataProvider[k].index == Number(i) && dataProvider[k].daycount){
						if( Shop.ins().medalData.exchangeCount[i] >= dataProvider[k].daycount ){
							isPush = false;//永购已经完成
						}
						break;
					}
				}
			}
			if( isPush )
				arr.push(dataProvider[k]);
		}
		// this.listView.dataProvider = new eui.ArrayCollection(arr);
		// this.listView.validateNow();
		this.dataArr.replaceAll(arr);
		this.myAttrValue0.text = Actor.feats + "";

		let text = this.get.text;
		this.get.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${text}`);
	}
	private onClick(e:egret.TouchEvent){
		switch (e.currentTarget){
			case this.get:
				UserWarn.ins().setBuyGoodsWarn(7);
				break;
		}
	}
	private onTap(e: eui.ItemTapEvent) {
		// if (e && e.itemRenderer && e.item ) {
		// 	let feats:FeatsStore = e.item as FeatsStore;
		// 	// if( Shop.ins().medalData.checkHonorBuy(feats.index) ){
		// 		ViewManager.ins().open(BuyWin, feats.index,2);//2代表区分功勋商店
		// 	// }
		// }
	}


}

ViewManager.ins().reg(HonorMarketPanel, LayerManager.UI_Main);
