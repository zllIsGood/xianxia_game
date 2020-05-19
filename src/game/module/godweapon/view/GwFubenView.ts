class GwFubenView extends BaseView {
	//前三名排名信息
	private player1Name: eui.Label;
	private player2Name: eui.Label;
	private player3Name: eui.Label;

	private player1Rank: eui.Label;
	private player2Rank: eui.Label;
	private player3Rank: eui.Label;

	private player1Time: eui.Label;
	private player2Time: eui.Label;
	private player3Time: eui.Label;
	private rank: eui.Group;

	//查看排行
	private checkRank: eui.Label;
	//挑战列表
	private list: eui.List;
	//挑战按钮
	private challenge: eui.Button;
	//剩余挑战次数
	private countText: eui.Label;
	private _ary: eui.ArrayCollection;
	private _selectData: GwfubenFloorData;
	private rpImg: eui.Image;
	private _isUser: boolean;
	public constructor() {
		super();
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		this._ary = new eui.ArrayCollection();
		this.checkRank.touchEnabled = true;
		// this.countText.touchEnabled = true;
		this.checkRank.textFlow = new egret.HtmlTextParser().parser(`<u>查看排行</u>`);
	}

	public open() {
		this.addTouchEvent(this.checkRank, this.touchHandler);
		this.addTouchEvent(this.challenge, this.touchHandler);
		// this.addTouchEvent(this.countText,this.touchHandler);
		this.observe(GodWeaponCC.ins().postFubenInfo, this.updateView);
		this.observe(GodWeaponCC.ins().postRankInfo, this.updateRank);
		this.observe(UserBag.ins().postItemCountChange, this.useToItem);
		this.list.dataProvider = this._ary;
		this.list.itemRenderer = GwFubenGridRender;
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		GodWeaponCC.ins().requestFubenInfo();

	}
	//更新界面
	private updateView(): void {
		GodWeaponCC.ins().requestRanInfo();
		this._ary.replaceAll(GodWeaponCC.ins().fubenInfoData.listData);
		let freeNum: number = GlobalConfig.GodWeaponBaseConfig.freeCount;
		let leftNum: number = GodWeaponCC.ins().fubenInfoData.hadChallengeNum;
		// if(leftNum <= 0 ){
		// 	this.countText.textFlow = new egret.HtmlTextParser().parser(`<u>增加次数</u>`);
		// }else{
		// 	this.countText.text = `今日剩余挑战次数： ${leftNum}`;
		// }
		this.countText.text = `今日剩余次数： ${leftNum}`;
		this.list.selectedIndex = 0;
		this._selectData = this.list.selectedItem;
		if (GodWeaponCC.ins().fubenInfoData.hadChallengeNum > 0) {
			this.rpImg.visible = true;
		} else {
			this.rpImg.visible = false;
		}
	}
	//更新排行信息
	private updateRank(): void {
		let ary: GwRankInfoData[] = GodWeaponCC.ins().rankInfoDataAry;
		let len: number = ary.length;
		if (len == 0) {
			this.rank.visible = false;
		} else {
			this.rank.visible = true;
		}
		let data: GwRankInfoData;
		for (let i: number = 0; i < 3; i++) {
			data = ary[i];
			if (data) {
				this.getRankImg(i + 1).visible = true;
				this.getPlayName(i + 1).visible = true;
				this.getPlayRank(i + 1).visible = true;
				this.getPlayTime(i+1).visible = true;

				this.getPlayName(i + 1).text = data.nameStr;
				this.getPlayRank(i + 1).text = `${data.floorNum}层`;
				this.getPlayTime(i+1).text = data.getgetTimeStr();
			} else {
				this.getPlayName(i + 1).visible = false;
				this.getPlayRank(i + 1).visible = false;
				this.getPlayTime(i + 1).visible = false;
				this.getRankImg(i + 1).visible = false;
			}
		}
	}
	private useToItem(): void {
		if (this._isUser) {
			this._isUser = false;
			if (this._selectData) {
				GodWeaponCC.ins().joinFuben(this._selectData.gridNum);//进入副本挑战
			}
		}
	}
	private getRankImg(index: number): eui.Label {
		return this[`rank${index}Img`];//rank1Img
	}
	private getPlayName(index: number): eui.Label {
		return this[`player${index}Name`];
	}
	private getPlayRank(index: number): eui.Label {
		return this[`player${index}Rank`];
	}
	private getPlayTime(index: number): eui.Label {
		return this[`player${index}Time`];
	}
	//关闭
	public close(): void {
		this._selectData = null;
		this.removeTouchEvent(this.checkRank, this.touchHandler);
		this.removeTouchEvent(this.challenge, this.touchHandler);
		// this.removeTouchEvent(this.countText,this.touchHandler);
		this.removeObserve();
		this.list.dataProvider = null;
	}
	//点击
	private touchHandler(e: egret.TouchEvent): void {
		if (e.target == this.challenge) {//挑战
			if (!this.showTips()) return;
			if (this._selectData) {
				GodWeaponCC.ins().joinFuben(this._selectData.gridNum);//进入副本挑战
			}
		} else if (e.target == this.checkRank) {//查看排行榜
			ViewManager.ins().open(GwMijingRankView);
		}
		// }else if(e.target == this.countText){
		// 	this.showTips();
		// }
	}
	private onTouchList(e: eui.PropertyEvent): void {
		this._selectData = this.list.selectedItem;
	}
	private showTips(): boolean {
		let count: number = GodWeaponCC.ins().fubenInfoData.hadChallengeNum;
		// let freeCount:number = GlobalConfig.GodWeaponBaseConfig.freeCount;
		if (count > 0) {
			return true;
		}
		let tipText = "";
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.GodWeaponBaseConfig.fubenItem);
		if (item) {
			tipText = `确定使用1个<font color='#FFB82A'>${item.itemConfig.name}</font>增加挑战次数？\n`;
			WarnWin.show(tipText, function () {
				this._isUser = true;
				UserBag.ins().sendUseItem(item.configID, 1);
			}, this);
		} else {
			UserTips.ins().showTips(`|C:0xf3311e&T:今日剩余次数不足|`);
		}
		// }else{
		// 	let buyNum:number = GodWeaponCC.ins().fubenInfoData.vipBuyNum;//已经购买的次数
		// 	let canBuy:number = GlobalConfig.GodWeaponBaseConfig.vipCount[UserVip.ins().lv];//当前vip可以购买的次数
		// 	if(buyNum >= canBuy){
		// 		UserTips.ins().showTips(`|C:0xf3311e&T:VIP等级不足，提升VIP等级可购买挑战次数|`);
		// 		return false;
		// 	}
		// 	let money:number = GlobalConfig.GodWeaponBaseConfig.vipMoney[UserVip.ins().lv];//当前vip等级购买一次消耗的元宝
		// 	if (Actor.yb < money) {
		// 		UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
		// 		return false;
		// 	}
		// 	tipText = `确定花费<font color='#FFB82A'>${money}元宝</font>购买1次挑战次数吗？\n` +
		// 		`今日已购买：${GodWeaponCC.ins().fubenInfoData.vipBuyNum}`
		// 	WarnWin.show(tipText, function () {
		// 		if(this._selectData){
		// 		GodWeaponCC.ins().joinFuben(this._selectData.gridNum);//进入副本挑战
		// 	}
		// 	}, this);
		// }
		return false;
	}
}
//列表组件
class GwFubenGridRender extends BaseItemRender {
	private storeyCount: eui.Label;//层
	private list: eui.List;//奖励物品
	private rankImg: eui.Image;//评分图
	private rankbg: eui.Image;//评分底图
	private choose: eui.Image;//选中
	private rank: eui.Group;//评分组
	private _ary: eui.ArrayCollection;
	private _thisData: GwfubenFloorData;
	constructor() {
		super();
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}


	public init() {
		this._ary = new eui.ArrayCollection();
		this.list.dataProvider = this._ary;
		this.list.itemRenderer = MijingItemBase;
	}
	public dataChanged(): void {
		super.dataChanged();
		if (!this.data) {
			return;
		}
		this._thisData = this.data;
		this.storeyCount.text = `第${this._thisData.gridNum}层`;
		let ary: RewardData[] = this._thisData.config.award[1].concat();
		ary = ary.concat(this._thisData.config.firstAward.concat());
		let newAry: MijinglistData[] = [];
		for (let i: number = 0; i < ary.length; i++) {
			let data: MijinglistData = new MijinglistData();
			data.data = ary[i];
			data.index = i + 1;//第几个
			data.start = this._thisData.config.award[1].length;//开始
			data.floorNum = this._thisData.gridNum;
			newAry.push(data);
		}
		this._ary.replaceAll(newAry);
		if (this._thisData.curPoint != 0) {
			this.rankImg.visible = true;
			this.rankbg.visible = true;
			this.rankImg.source = `godweapon_rank${this._thisData.curPoint}`;
		} else {
			this.rankImg.visible = false;
			this.rankbg.visible = false;
		}
		this.choose.visible = this.selected;
		this.rank.visible = !this.selected;
	}
	public invalidateState(): void {
		super.invalidateState();
		this.choose.visible = this.selected;
		this.rank.visible = !this.selected;
	}
}
class MijingItemBase extends BaseItemRender {
	protected _thisdata: MijinglistData;
	protected itemConfig: ItemConfig;
	protected itemIcon: ItemIcon;
	protected count: eui.Label;
	protected nameTxt: eui.Label;
	protected getImg: eui.Image;
	constructor() {
		super();
		this.init();
	}
	/**触摸事件 */
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}
	protected dataChanged(): void {
		super.dataChanged();
		if (!this.data) {
			return;
		}
		this._thisdata = this.data;
		this.itemIcon.imgJob.visible = false;
		if (this._thisdata.data.type == 0) {
			this.itemIcon.imgIcon.source = RewardData.getCurrencyRes(this._thisdata.data.id);
			let type: number = 1;
			switch (this._thisdata.data.id) {
				case MoneyConst.yuanbao:
					type = 5;
					break;
				case MoneyConst.gold:
					type = 0;
					break;
				case MoneyConst.soul:
					type = 2;
					break;
				case MoneyConst.piece:
					type = 2;
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[this._thisdata.data.id];
					break;
				case MoneyConst.godweaponExp:
					type = 2;
					break;
				default:
					break;
			}
			let count: number = this._thisdata.data.count;
			(count != undefined && count > 1) ? this.setCount(count + "") : this.setCount("");
			if (this._thisdata.index <= this._thisdata.start) {
				this.nameTxt.text = RewardData.getCurrencyName(this._thisdata.data.id);
				this.itemIcon.imgBg.source = ItemConfig.getQualityBg(type);
				this.nameTxt.textColor = ItemBase.QUALITY_COLOR[type];
			} else {
				this.nameTxt.text = "S首通奖励";
				let data: GwFubenData = GodWeaponCC.ins().fubenInfoData;
				this.getImg.visible = false;
				for (let i: number = 0; i < data.listData.length; i++) {
					if (this._thisdata.floorNum == data.listData[i].gridNum) {
						if (data.listData[i].curPoint == 1) {
							this.getImg.visible = true;
						}
						break;
					}
				}
				if (this._thisdata.floorNum <= 10) {
					this.nameTxt.textColor = ItemBase.QUALITY_COLOR[3];
					this.itemIcon.imgBg.source = ItemConfig.getQualityBg(3);
				} else {
					this.nameTxt.textColor = ItemBase.QUALITY_COLOR[4];
					this.itemIcon.imgBg.source = ItemConfig.getQualityBg(4);
				}
			}
		} else {
			//道具奖励
			this.itemConfig = GlobalConfig.ItemConfig[this._thisdata.data.id];
			if (!this.itemConfig)
				return;
			let type = ItemConfig.getQuality(this.itemConfig);
			this.nameTxt.textColor = ItemBase.QUALITY_COLOR[type];
			this.itemIcon.imgBg.source = ItemConfig.getQualityBg(type);
			let count: number = this._thisdata.data.count;
			count > 1 ? this.setCount(count + "") : this.setCount("");
			this.itemIcon.imgIcon.source = this.itemConfig.icon + '_png';
			if (this._thisdata.index <= this._thisdata.start) {
				this.nameTxt.text = this.itemConfig.name;
			} else {
				this.nameTxt.text = "S首通奖励";
				let data: GwFubenData = GodWeaponCC.ins().fubenInfoData;
				this.getImg.visible = false;
				for (let i: number = 0; i < data.listData.length; i++) {
					if (this._thisdata.floorNum == data.listData[i].gridNum) {
						if (data.listData[i].curPoint == 1) {
							this.getImg.visible = true;
						}
						break;
					}
				}
				// if(this._thisdata.floorNum <= 10){
				// 	this.nameTxt.textColor = ItemBase.QUALITY_COLOR[3];
				// 	this.itemIcon.imgBg.source = ItemConfig.getQualityBg(3);
				// }else{
				// 	this.nameTxt.textColor = ItemBase.QUALITY_COLOR[4];
				// 	this.itemIcon.imgBg.source = ItemConfig.getQualityBg(4);
				// }
			}
		}

	}
	private setCount(str: string): void {
		if (str.length > 4) {
			let wNum: number = Math.floor(Number(str) / 1000);
			str = wNum / 10 + "万";
		}
		this.count.text = str;
	}
	protected onClick() {
		this.showDetail();
	}
	protected showDetail() {
		this._thisdata.data.type
		// let type:number = ItemConfig.getType(this.itemConfig);
		if (this._thisdata.data.type != 0) {
			ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this._thisdata.data.count);
		}
	}
}
class MijinglistData {
	public data: RewardData;
	public floorNum: number;
	public index: number;
	public start: number;
	constructor() {
	}
}