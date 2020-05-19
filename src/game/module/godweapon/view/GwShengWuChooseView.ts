class GwShengWuChooseView extends BaseEuiView {
	private bgClose: eui.Rect;
	private scroll: eui.Scroller;
	private list: eui.List;
	private _aryDate: eui.ArrayCollection;
	private _data: GwItem;
	private tipLabel1: eui.Label;
	private tipLabel2: eui.Label;
	public constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "GwShengWuChooseSkin";
		this._aryDate = new eui.ArrayCollection();
		this.list.dataProvider = this._aryDate;
		this.list.itemRenderer = GwShengwurenderItem;
	}
	public open(...param: any[]): void {
		this._data = param[0];
		this.addTouchEvent(this.bgClose, this.closeHandler);
		this.addTouchEvent(this.list, this.clickHandler);
		this.updateView();
	}
	private updateView(): void {
		let temp: GwItem[] = GwShengWuChooseView.getGwItemType(this._data);//得到背包里圣物
		temp.sort(this.sortFun);
		if (this._data.itemId) {
			let tempData: GwItem = new GwItem();
			tempData.itemId = this._data.itemId;
			tempData.weaponId = this._data.weaponId;
			tempData.isCur = true;
			temp.unshift(tempData);
		}
		if (temp.length == 0) {
			this.tipLabel2.visible = true;
		} else {
			this.tipLabel2.visible = false;
		}
		this._aryDate.replaceAll(temp);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.closeHandler);
		this.removeTouchEvent(this.list, this.clickHandler);
		this.list.dataProvider = null;
	}
	private closeHandler(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
	//镶嵌
	private clickHandler(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let tempRender: GwShengwurenderItem = e.target.parent as GwShengwurenderItem;
			// if(ItemConfig.getQuality(this._data.itemConfig) > ItemConfig.getQuality(tempRender.datathis.itemConfig)){
			// 	WarnWin.show(`镶嵌会直接摧毁原镶嵌圣物，确定吗？`,
			// 		 function () {
			// 			GodWeaponCC.ins().inlayItem(this._data.weaponId,this._data.pos,tempRender.datathis.itemId);
			// 			ViewManager.ins().close(this);
			// 	}, this);
			// 	return;
			// }
			GodWeaponCC.ins().inlayItem(this._data.weaponId, this._data.pos, tempRender.datathis.itemId);
			ViewManager.ins().close(this);
		}
	}
	//得到所用圣物
	public static getGwItemType(_data: GwItem): GwItem[] {
		let temp: GwItem[] = [];
		let itemData: ItemData[] = UserBag.ins().bagModel[UserBag.BAG_TYPE_OTHTER];
		let j: number = 0;
		if (itemData) {
			for (let i: number = 0; i < itemData.length; i++) {
				let type: number = ItemConfig.getType(itemData[i].itemConfig);
				let job: number = ItemConfig.getJob(itemData[i].itemConfig);
				if (ItemConfig.getType(itemData[i].itemConfig) == 15 && ItemConfig.getJob(itemData[i].itemConfig) == _data.weaponId) {
					for (j = 0; j < itemData[i].count; j++) {
						let tempData: GwItem = new GwItem();
						tempData.itemId = itemData[i].configID;
						tempData.weaponId = _data.weaponId;
						temp.push(tempData);
					}
				}
			}
		}
		let tempGw: GwItem[] = GodWeaponCC.ins().allGodItemData[_data.weaponId];
		tempGw = tempGw.concat();
		let objdata: any = {};
		//已经镶嵌的圣物的总个数
		for (j = 0; j < tempGw.length; j++) {
			if (tempGw[j].itemId) {
				if (objdata[tempGw[j].itemId] == undefined) {
					objdata[tempGw[j].itemId] = 1;
				} else {
					objdata[tempGw[j].itemId]++;
				}
			}
		}
		for (j = 0; j < tempGw.length; j++) {
			if (tempGw[j].itemId) {
				if (tempGw[j].config.onlyOne) {
					let only: number = tempGw[j].config.onlyOne;
					if (tempGw[j].config.onlyOne == objdata[tempGw[j].itemId]) {
						GwShengWuChooseView.deleteItemData(tempGw[j].itemId, temp);
						delete objdata[tempGw[j].itemId];
					}
				}
			}
		}
		return temp;
	}
	//按战力来排序
	private sortFun(a: GwItem, b: GwItem): number {
		return b.power - a.power;
	}
	//过滤
	public static deleteItemData(id, temp: GwItem[]): void {
		for (let i: number = 0; i < temp.length; i++) {
			if (temp[i].itemId == id) {
				temp.splice(i--, 1);
			}
		}
	}
}
ViewManager.ins().reg(GwShengWuChooseView, LayerManager.UI_Popup);
class GwShengwurenderItem extends BaseItemRender {
	private nameTxt: eui.Label;
	private skill: eui.Label;
	private attr: eui.Label;
	private best: eui.Image;//推荐图
	private changeBtn: eui.Button;//更换按钮;
	private itemIcon: Gwshengwuitem_icon;//圣物icon
	private now: eui.Group;//当前装备
	private quality: eui.Label;//品质文本
	private power: eui.Label//评分
	public datathis: GwItem;
	private qualityName: string[] = ["凡品", "精品", "极品", "神品"];
	private addNameLb: eui.Label;//增加技能的名字
	constructor() {
		super();
		this.skinName = "GWChooseItemSkin";
		this.best.visible = false;
	}
	public dataChanged(): void {
		super.dataChanged();
		if (!this.data) {
			return;
		}
		this.datathis = this.data;
		let qualityNum: number = ItemConfig.getQuality(this.datathis.itemConfig);
		this.nameTxt.text = this.datathis.itemConfig.name;
		this.nameTxt.textColor = ItemConfig.getQualityColor(this.datathis.itemConfig);
		this.attr.text = this.datathis.addatrStr;
		this.power.text = `评分：${this.datathis.power}`;
		this.itemIcon.imgJob.source = `common1_profession${this.datathis.weaponId}`;
		this.itemIcon.imgIcon.source = this.datathis.itemConfig.icon + "_png";
		this.itemIcon.imgBg.source = ItemConfig.getQualityBg(qualityNum);
		if (qualityNum - 1 < 0) {
			this.quality.text = this.qualityName[0];
		} else {
			this.quality.text = this.qualityName[qualityNum - 1];
		}
		this.quality.textColor = ItemConfig.getQualityColor(this.datathis.itemConfig);
		this.addNameLb.text = `装备该圣物可提升${this.datathis.skillName}等级`;
		if (this.datathis.isCur == true) {
			this.now.visible = true;
			this.changeBtn.visible = false;
		} else {
			this.now.visible = false;
			this.changeBtn.visible = true;
		}
	}
}
class Gwshengwuitem_icon extends eui.Component {
	public imgBg: eui.Image;
	public imgJob: eui.Image;
	public imgIcon: eui.Image;
	constructor() {
		super();
	}
}
