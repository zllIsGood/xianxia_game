class BookWin extends BaseComponent {

	private listBook: eui.List;
	private listMenu: eui.List;
	private listScroller:eui.Scroller;

	private labelSuit: eui.Label;
	private labelAttr: eui.Label;

	private resolve:eui.Label;
	private expValue:eui.Label;

	private curId: number;//套装id
	private pown: egret.DisplayObjectContainer;
	private power:eui.BitmapLabel;
	public xiangqing: eui.Image;
	private chargeEff1: MovieClip;
	private preScrollV:number;

	private progress:eui.Label;//集齐进度
	private attr:eui.Label;//属性
	private getway:eui.Button;
	private graycolor:number;
	private greencolor:number;
	private labelIcon:eui.Image;
	private itemHeight:number;//但图鉴控件高度
	private leftGroup:eui.Group;
	private rightGroup:eui.Group;
	private leftRed:eui.Image;
	private rightRed:eui.Image;
	private eff:eui.Group;
	public constructor() {
		super();
		this.name = `图鉴`;
		this.skinName = "tujian";
	}

	protected childrenCreated(){
		this.init();
	}

	private init() {
		this.listBook.dataProvider = null;
		this.listMenu.dataProvider = null;
		this.listBook.itemRenderer = BookItem;
		this.listMenu.itemRenderer = BookListItem;
		this.listBook.touchEnabled = false;

		// this.pown = BitmapNumber.ins().createNumPic(0, '8', 10);
		// this.pown.scaleX = 0.8;
		// this.pown.scaleX = 0.8;
		// this.pown.x = 90;
		// this.pown.y = 62;
		// this.addChild(this.pown);

		this.resolve.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:分解多余图鉴|`);

		this.chargeEff1 = new MovieClip;
		this.eff.addChild(this.chargeEff1)
		this.chargeEff1.x = this.eff.x;//this.resolve.x + 64;
		this.chargeEff1.y = this.eff.y;//this.resolve.y + 12;
		this.chargeEff1.touchEnabled = false;
		this.chargeEff1.scaleY = 0.5;
		this.chargeEff1.scaleX = 0.9;

		this.greencolor = 0x20cb30;
		this.graycolor = this.attr.textColor;

		this.itemHeight = 150;
	}

	public open(...param) {
		this.labelAttr.text = ``;
		this.labelSuit.text = ``;
		// Book.ins().sendBookData();

		this.listBook.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onBookTap,this);
		this.listMenu.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onMenuTap,this);
		this.addTouchEvent(this.xiangqing, this.onTap);
		this.addTouchEvent(this.resolve, this.onTap);
		this.addTouchEvent(this.getway, this.onTap);
		this.addTouchEvent(this.leftGroup, this.onTap);
		this.addTouchEvent(this.rightGroup, this.onTap);
		this.observe(Book.ins().postDataChange, this.onItemChange);
		this.observe(UserBag.ins().postItemDel,this.onItemChange);
		this.observe(UserBag.ins().postItemAdd,this.onItemChange);
		this.observe(UserBag.ins().postItemChange,this.onItemChange);
		this.observe(BookRedPoint.ins().postRedPoint, this.updateRedPoint);
		// this.addChangeEvent(this.listScroller, this.onChange);
		this.addEvent(eui.UIEvent.CHANGE_END, this.listScroller, this.onChange);
		this.initView();

		let curId = param[0] || 0;
		let conf = null;
		let subSelect = 0;
		let subSelect2 = 0;

		// let tlabel = this.getway.text;
		// this.getway.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${tlabel}|`);

		if (curId) {
			conf = Book.ins().getDecomposeConfigByItemId(curId);
			let suitConf = GlobalConfig.SuitConfig;
			let subId = 1;
			for (let id in suitConf) {
				if (suitConf[id][1].idList.indexOf(conf.id) >= 0) {
					subId = parseInt(id);
					break;
				}
			}
			for (let id in GlobalConfig.BookListConfig) {
				let bcfg = GlobalConfig.BookListConfig[id];
				if (bcfg.idList.indexOf(subId) >= 0) {
					subSelect = bcfg.sort - 1;
					subSelect2 = GlobalConfig.BookListConfig[id].idList.indexOf(subId);
					break;
				}
			}
		}

		TimerManager.ins().doTimer(200, 1, () => {
			this.listMenu.selectedIndex = subSelect;
			let firstMenu = this.listMenu.getVirtualElementAt(subSelect) as BookListItem;
			if (firstMenu) {
				if( firstMenu.idList ){
					this.curId = firstMenu.idList[subSelect2];
					this.updateBook();
					this.updateAttr();
				}
			}
		}, this);
		this.preScrollV = 0;
	}
	private onChange():void{
		if (this.listMenu.scrollH < 46) {
			this.leftGroup.visible = false;
			this.rightGroup.visible = true;
		} else if (this.listMenu.scrollH >= this.listMenu.contentWidth - this.listMenu.width - 46) {
			this.leftGroup.visible = true;
			this.rightGroup.visible = false;
		} else {
			this.leftGroup.visible = true;
			this.rightGroup.visible = true;
		}

		this.updateRedPoint();
	}
	private onTap(e:egret.TouchEvent): void {
		let num: number = 92 * 5;
		let scrollH: number = 0;
		switch (e.currentTarget) {
			case this.xiangqing:
				ViewManager.ins().open(BookAttrWin);
				break;
			case this.resolve:
				ViewManager.ins().open(BreakDownView, BreakDownView.type_book, ItemType.TYPE_9);
				break;
			case this.getway:
				ViewManager.ins().open(BookWayTips,this.curId);
				break;
			case this.leftGroup:
				scrollH = this.listMenu.scrollH - num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH < 0) {
					scrollH = 0;
				}
				this.listMenu.scrollH = scrollH;
				this.onChange();
				break;
			case this.rightGroup:
				scrollH = this.listMenu.scrollH + num;
				scrollH = Math.round(scrollH / 92) * 92;
				if (scrollH > this.listMenu.contentWidth - this.listScroller.width) {
					scrollH = this.listMenu.contentWidth - this.listScroller.width;
				}
				this.listMenu.scrollH = scrollH;
				this.onChange();
				break;
		}
	}

	public close() {
		this.removeTouchEvent(this.xiangqing, this.onTap);
		this.removeTouchEvent(this.resolve, this.onTap);
		this.removeTouchEvent(this.getway, this.onTap);
		this.removeTouchEvent(this.listMenu, this.onMenuTap);
		this.removeTouchEvent(this.leftGroup, this.onTap);
		this.removeTouchEvent(this.rightGroup, this.onTap);
		this.listBook.removeEventListener(eui.ItemTapEvent.ITEM_TAP,this.onBookTap,this);
		this.listMenu.removeEventListener(eui.ItemTapEvent.ITEM_TAP,this.onMenuTap,this);
		// this.listScroller.removeEventListener(egret.Event.CHANGE, this.onChange, this);
		this.listScroller.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onChange, this);
		this.removeObserve();
	}

	private initView() {
		let config = GlobalConfig.BookListConfig;
		let conf = [];
		for (let k in config) {
			conf.push(config[k]);
		}
		conf.sort((a:BookListConfig,b:BookListConfig)=>{
			if( a.sort < b.sort )
				return -1;
			else
				return 1;
		})
		let data = new eui.ArrayCollection(conf);
		this.listMenu.dataProvider = data;
		this.updateBook();
		this.leftGroup.parent.touchEnabled = false;
		this.onChange();
	}

	private playEffect () {
		if (!BookRedPoint.ins().getRedPoint(1)) {
			DisplayUtils.removeFromParent(this.chargeEff1);
		} else {
			if (!this.chargeEff1.parent) {
				// this.resolve.parent.addChild(this.chargeEff1);
				this.eff.addChild(this.chargeEff1);
			}
			this.chargeEff1.playFile(RES_DIR_EFF + "chargeff1", -1);

		}
	}

	private onItemChange(){
		this.updateBook();
		let g:eui.Group = this.listBook.parent as eui.Group;
		g.scrollV = this.preScrollV;
	}
	//设置指定位置
	private setStartPosition(idList:number[]){
		let g:eui.Group = this.listBook.parent as eui.Group;
		let scro:eui.Scroller = g.parent as eui.Scroller;
		scro.stopAnimation();
		let startPos:number = 0;
		for( let i = 0;i < idList.length;i++ ){
			if( this.getIsAct(idList[i]) ){
				if(  i > 9 ){
					startPos = Math.floor((i+1)/3)*this.itemHeight;
				}
				break;
			}
		}


		//修正最底部
		if( scro.height >= this.listBook.contentHeight )
			startPos = 0;
		else{
			let maxHeight = this.listBook.contentHeight - scro.height*41/30;
			maxHeight = maxHeight>0?maxHeight:0;
			if( startPos >= maxHeight )
				startPos = maxHeight;
		}

		g.scrollV = startPos;
		this.preScrollV = g.scrollV;
		// g.validateNow();
		// scro.validateNow();
		// this.listBook.validateNow();
	}
	private updateBook(noUpdateMenu?) {
		if (!this.curId)
			return;
		let conf = GlobalConfig.SuitConfig[this.curId][1];
		let dataPro = this.listBook.dataProvider as eui.ArrayCollection;
		if(dataPro && dataPro.source == conf.idList) {
			dataPro.refresh();
		} else {
			this.listBook.dataProvider = new eui.ArrayCollection(conf.idList);
		}

		this.listBook.validateNow();

		this.setStartPosition(conf.idList);
		if (!noUpdateMenu) {
			let dataProvider = this.listMenu.dataProvider as eui.ArrayCollection;
			for (let i in dataProvider.source)
				dataProvider.itemUpdated(dataProvider.getItemAt(parseInt(i)));
		}


		this.updateAttr();
		this.playEffect();

		// let power = Book.ins().getBookPown();
		// power = Book.ins().getBookPowerNum(power,this.curId);
		let power = Book.ins().getBookPowerNumEx();
		this.power.text = power + "";
		// BitmapNumber.ins().changeNum(this.pown, power, "8");
	}

	private onBookTap(e: eui.ItemTapEvent) {
		let id = this.listBook.selectedItem;
		let data = Book.ins().getBookById(id);
		if (!id || !data) {
			return;
		}

		let g:eui.Group = this.listBook.parent as eui.Group;
		this.preScrollV = g.scrollV;
		ViewManager.ins().open(BookUpWin, data);
	}

	private updateAttr() {
		let conf = GlobalConfig.SuitConfig[this.curId][1];
		let level = Book.ins().getSuitLevel(this.curId);//返回套装等级
		let labelColor:number;
		//激活了套装
		if (level > 0) {
			conf = GlobalConfig.SuitConfig[this.curId][level];
			// for (let i = 0; i < arr.length; i++) {
			// 	newStr = `${newStr} ${arr}`;
			// 	if (i % 3 == 2)
			// 		newStr = `${newStr}\n`;
			// }
			labelColor = this.greencolor;
		}
		//未激活
		else{
			labelColor = this.graycolor;
		}
		//集齐
		let title:string = "";
		// this.progress.textColor = labelColor;
		for( let k in GlobalConfig.BookListConfig ){
			let config:BookListConfig = GlobalConfig.BookListConfig[k];
			if( config.idList.indexOf(this.curId) != -1 ){
				title = config.nameImg;//config.name;
				break;
			}
		}
		let curNum:number = Book.ins().getSuitNum(this.curId);
		let maxNum:number = conf.idList.length;
		this.progress.text = `（已集齐${curNum}/${maxNum}）`;//传奇之路（已集齐 10/12）
		this.labelIcon.source = title;
		//属性
		let str = AttributeData.getAttStr(conf.attrs, 0, 1, ":");
		let arr = str.split("\n");
		let newStr = `集齐套装效果：`;
		for( let i = 0; i < arr.length;i++ ){
			newStr += arr[i] + "  ";
		}
		this.attr.textFlow = TextFlowMaker.generateTextFlow1(`|C:${labelColor}&T:${newStr}`);


		// this.labelAttr.text = newStr;
		// this.labelSuit.text = `已收集此套装(${Book.ins().getSuitNum(this.curId)}/${conf.idList.length})`;
		this.expValue.text = Book.ins().score+"";
		// } else {
		// 	this.labelAttr.text = ``;
		// 	this.labelSuit.text = `套装未激活`;
		// }

	}

	private onMenuTap(e: eui.ItemTapEvent) {
		let data = e.item;
		this.curId = data.idList[0];
		this.updateBook(true);
		this.updateAttr();
	}
	//图鉴是否激活
	private getIsAct(id:number){
		let bookData = Book.ins().getBookById(id);
		let state = bookData.getState();
		return state == BookState.canOpen;
	}
	private updateRedPoint(){
		this.leftRed.visible  = BookRedPoint.ins().redpoint;
		this.rightRed.visible = BookRedPoint.ins().redpoint;
	}
}
