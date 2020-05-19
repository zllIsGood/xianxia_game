/**
 * Created by hrz on 2017/6/20.
 */

class BreakDownView extends BaseEuiView {

	static type_legend: number = 1;//神装传奇
	static type_book: number = 2;//图鉴

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public equipList: eui.List;
	public contrain: eui.Group;
	public border: eui.Image;
	public bg2: eui.Image;
	private equipScroller: eui.Scroller;
	private gainList: eui.List;

	private itemList: any[];

	private listData: eui.ArrayCollection;
	private goList: eui.ArrayCollection;

	private bgClose: eui.Rect;

	private _breakType: number;
	private _ext: any;

	private _addExp: number[] = [];

	private fitleEquip:Map<SpecialEquipsConfig>;
	public constructor() {
		super();
		this.skinName = "BreakDownSkin";
		this.isTopLevel = true;

		this.listData = new eui.ArrayCollection();

		this.equipList.itemRenderer = BreakDownItemRenderer;
		this.equipList.dataProvider = this.listData;

		this.gainList.itemRenderer = GainGoodsItem;
		this.goList = new eui.ArrayCollection();
		this.gainList.dataProvider = this.goList;
		this.fitleEquip = {};
		for( let i in GlobalConfig.SpecialEquipsConfig ){
			if( GlobalConfig.SpecialEquipsConfig[i].style == FitleStyle.fj ){
				this.fitleEquip[GlobalConfig.SpecialEquipsConfig[i].id] = GlobalConfig.SpecialEquipsConfig[i];
			}
		}
	}

	public open(...param): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(UserBag.ins().postItemDel, this.updateData);//道具删除
		this.observe(UserBag.ins().postItemCountChange, this.updateData);//
		this.observe(Book.ins().postDataChange, this.showExp);//
		this.addTouchEvent(this, this.onTap);
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onGo, this);
		this._breakType = param[0] || 0;
		this._ext = param[1];

		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this, this.onTap);
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onGo, this);

		this.removeObserve();
	}

	private getLegendSource() {
		// let itemData = UserBag.ins().getBagEquipsByQuality(this._ext);
		// let itemData = UserBag.ins().getLegendOutEquips();
		let itemData: ItemData[] = [];
		//神装分解规则
		if( this._ext == 4 ){
			let totalItemData = UserBag.ins().getEquipsByQuality(4);
			for( let i = 0;i < totalItemData.length;i++ ){
				//过滤分解的装备
				if( !this.fitleEquip[totalItemData[i].configID] ){
					itemData.push(totalItemData[i]);
				}
			}
		}else{
			//传奇分解规则
			itemData = UserBag.ins().getLegendOutEquips();
		}

		itemData.sort((n1, n2) => {
			let config1 = GlobalConfig.ItemConfig[n1.configID];
			let config2 = GlobalConfig.ItemConfig[n2.configID];
			if (config1.zsLevel > config2.zsLevel) {
				return 1;
			}

			if (config1.zsLevel < config2.zsLevel) {
				return -1;
			}

			if (config1.level > config2.level) {
				return 1;
			}

			if (config1.level < config2.level) {
				return -1;
			}

			return 0;
		});
		return itemData;
	}

	private getBookSource() {
		let itemData = UserBag.ins().getItemByType(this._ext);
		itemData.sort((n1, n2) => {
			let n1q = ItemConfig.getQuality(n1.itemConfig);
			let n2q = ItemConfig.getQuality(n2.itemConfig);

			if (n1q < n2q) {
				return -1;
			} else if (n1q > n2q) {
				return 1;
			}

			return n1.configID - n2.configID;
		});

		let itemArr = [];
		let listBook = Book.ins().itemBook;
		let noActDic: any = {};
		for (let itemId in listBook) {
			for (let item of listBook[itemId]) {
				if (item.getState() != BookState.haveOpen) {
					noActDic[itemId] = true;
					break;
				}
			}
		}

		for (let item of itemData) {
			if (noActDic[item.configID]) {
				continue;
			}
			let data = new ItemData();
			data.count = 1;
			data.handle = item.handle;
			data.configID = item.configID;
			for (let i = 0; i < item.count; i++) {
				itemArr.push(data);
			}
		}

		return itemArr;
	}

	private getLegendGoSource() {
		if (this.itemList) {
			return this.itemList;
		}
		let data1: GainWay = new GainWay();
		data1[0] = "获得神装：寻宝";
		data1[1] = egret.getQualifiedClassName(TreasureHuntWin);
		data1[2] = 0;
		let data2: GainWay = new GainWay();
		data2[0] = "获得神装：全民BOSS";
		data2[1] = egret.getQualifiedClassName(BossWin);
		data2[2] = 1;
		let data3: GainWay = new GainWay();
		data3[0] = "获得神装：挑战副本";
		data3[1] = egret.getQualifiedClassName(FbWin);
		data3[2] = 2;
		let data4: GainWay = new GainWay();
		data4[0] = "获得神装：寻宝";
		data4[1] = egret.getQualifiedClassName(TreasureHuntWin);
		data4[2] = 0;
		let list = [[], [], [], [], [data1, data2/*,data3*/], [data4]];
		this.itemList = list[this._ext];
		return this.itemList;
	}

	private getBookGoSource() {
		return [];//[[`宝箱`, BoxBgWin, 0]];
	}

	private updateData(): void {

		let source, goList;
		if (this._breakType == BreakDownView.type_legend) {
			source = this.getLegendSource();
			goList = this.getLegendGoSource();
		} else if (this._breakType == BreakDownView.type_book) {
			source = this.getBookSource();
			goList = this.getBookGoSource();
		}

		this.listData.source = source;
		this.goList.source = goList;
		let dataNum: number = goList.length;
		// this.refushPos(dataNum);
	}

	private showExp() {
		let exp = this._addExp.pop();
		if (exp) {
			// UserTips.ins().showTips(`获得图鉴经验|C:0x35e62d&T:+${exp}|`);
		}
	}

	private refushPos(len: number): void {
		this.contrain.height = 60 * len;
		this.equipScroller.height = 310 + 60 * (3 - len);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn0:
			case this.closeBtn:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;

			default:
				if (e.target instanceof eui.Button) {
					switch (e.target.name) {
						case "breakDown":
							this.onHandler(e.target.parent["data"]);
							break;
					}
				}
		}
	}

	private onHandler(data) {
		if (this._breakType == BreakDownView.type_legend) {
			UserEquip.ins().sendSmeltEquip(1, [data]);
		} else if (this._breakType == BreakDownView.type_book) {
			let config = Book.ins().getDecomposeConfigByItemId(data.itemConfig.id);
			Book.ins().sendDecompose([[config.id, data.count]]);
			this._addExp.push(config.value);
		}
	}

	private onGo(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			GameGuider.guidance(item[1], item[2]);
			ViewManager.ins().close(this);
		}
	}
}

ViewManager.ins().reg(BreakDownView, LayerManager.UI_Popup);