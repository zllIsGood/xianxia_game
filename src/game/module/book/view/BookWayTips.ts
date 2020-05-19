class BookWayTips extends BaseEuiView {
	private bgClose:eui.Rect;
	private nameLabel:eui.Label;
	private suitlist:eui.List;

	private suitId:number;//套装id
	constructor() {
		super();
		this.skinName = "TuJianSuitTips";
	}


	public initUI(): void {
		super.initUI();
		this.suitlist.itemRenderer = BookWayTipsItem;
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.otherClose)
		this.suitId = param[0]
		this.updateData();

	}
	public updateData(){
		// let bcfg:BookListConfig = GlobalConfig.BookListConfig[this.suitId];
		this.nameLabel.text = Book.ins().getTitleById(this.suitId) + "套装加成";
		let config:SuitConfig[] = GlobalConfig.SuitConfig[this.suitId];
		let datalist = [];
		// let conf = GlobalConfig.SuitConfig[this.suitId][1];
		// let level = Book.ins().getSuitLevel(this.suitId);//返回套装等级
		// //激活了套装
		// if (level > 0) {
		// 	conf = GlobalConfig.SuitConfig[this.suitId][level];
		// }
		let curNum:number = Book.ins().getSuitNum(this.suitId);
		for( let i in config ){
			let cfg:SuitConfig = config[i];
			let data = {config:cfg,curNum:curNum};
			datalist.push(data);
		}
		this.suitlist.dataProvider = new eui.ArrayCollection(datalist);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.otherClose);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(BookWayTips);
	}



}
ViewManager.ins().reg(BookWayTips, LayerManager.UI_Popup);