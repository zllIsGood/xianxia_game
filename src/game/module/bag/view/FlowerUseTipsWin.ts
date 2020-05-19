/**
 * 送花界面
 * @author wanghengshuai
 * 
 */
class FlowerUseTipsWin extends BaseEuiView{

	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public BG:eui.Image;
	public sub1Btn:eui.Button;
	public add1Btn:eui.Button;
	public maxBtn:eui.Button;
	public minBtn:eui.Button;
	public itemCount:eui.Label;
	public charmPoint:eui.Label;
	public sendBtn:eui.Button;
	public openListBtn:eui.Button;
	public scroller:eui.Scroller;
	public list:eui.List;
	public selectName:eui.Label;
	public numLabel:eui.Label;
	public closeBtn:eui.Button;
	public openListType:eui.Button;
	public scroller1:eui.Scroller;
	public list1:eui.List;
	public selectName1:eui.Label;
	public clickBtn:eui.CheckBox;
	
	private _showFriendsList:boolean;
	
	private _collect:ArrayCollection;
	private _collect1:ArrayCollection;
	
	private _friendID:number;
	private _flowerID:number;
	public boostPrice: PriceIcon;

	private _sendCount:number = 1;

	private _maxCount:number = 0;

	private itemData:ItemConfig;
	private shopConfig: ItemStoreConfig;

	private startNum:number = 0;

	private ID:number = 0;

	public constructor() {
		super();
		this.skinName = "flowerUseTips";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.list.itemRenderer = FlowerTargetItemrender;
		this.list1.itemRenderer = FlowerTargetItemrender1;
	}

	public open(...param: any[]):void
	{
		this.addTouchEvent(this, this.onTouch);
		this.addTouchEvent(this.list, this.onTouchList);
		this.addTouchEvent(this.list1, this.onTouchList1);
		this.observe(Friends.ins().postFriendChange, this.update, this);
		this.observe(UserBag.ins().postItemAdd, this.updateMaterial);
		this.observe(UserBag.ins().postItemChange, this.updateMaterial);
		this.observe(UserBag.ins().postItemDel, this.updateMaterial);
		this.observe(Shop.ins().postBuyResult,this.UpdataInfo);

		this._sendCount = 1;
		this._friendID = 0;
		this._flowerID = 0;
		this.update();
		this.selectName.text = "";
		this.selectName1.text = "";
		this.clickBtn.selected = false;

		this.ID = param[0];
		let index:number = 0;
		let list = GlobalConfig.TeamFuBenBaseConfig.flowerList;
		index = list.indexOf(this.ID)
		let itemData = GlobalConfig.ItemConfig[this.ID];
		this.setID(itemData);
		
		let config = GlobalConfig.TeamFuBenBaseConfig.flowerValue;

		for (let i in config){
			if (itemData.id == parseInt(i)){
				this.startNum = config[i];
			}
		}
	}

	public close():void
	{
		this.scroller.visible = false;
		this.scroller1.visible = false;
	}

	private update():void
	{
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.list.dataProvider = this._collect;
		}

		if (!this._collect1)
		{
			this._collect1 = new ArrayCollection();
			this.list1.dataProvider = this._collect1;
		}

		this._collect.source = Friends.ins().friendsList.source;
		this._collect1.source = GlobalConfig.TeamFuBenBaseConfig.flowerList;

		

		this.UpdataInfo();
	}

	private UpdataInfo():void{
		this.updateCount();
		this.updateMaterial();
	}

	private updateMaterial():void
	{	
		let itemData: ItemData
		if (this.itemData!=undefined){
			itemData = UserBag.ins().getBagItemById(this.itemData.id);
		} else{
			itemData = UserBag.ins().getBagItemById(this.ID);
		}
		this._maxCount = itemData ? itemData.count : 0;
		this.itemCount.text = this._maxCount +"";
	}
	
	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.bgClose:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.sendBtn:
				if (!this._friendID)
				{
					UserTips.ins().showTips(`请选择要赠送鲜花的好友`);
					return;
				}

				
				if (!this._flowerID){
					UserTips.ins().showTips(`请选择要赠送鲜花`);
					return;
				}
				
				if (this.clickBtn.selected){
					let num = this._sendCount - this._maxCount;
					if (num>0){
						if (this._sendCount > this._maxCount  && Actor.yb>=(this.shopConfig.price *num)){
							let arr = [this.shopConfig.id, num];
							Shop.ins().sendBuy(1, [arr]);
						} else {
							UserTips.ins().showTips("鲜花不足");
							return;
						}
					}
				} else{
					if (this._maxCount <= 0 || this._maxCount < this._sendCount)
					{
						UserTips.ins().showTips(`背包内没有足够的道具`);
						return;
					}
				}

				UserTips.ins().showTips("成功赠送鲜花");
				UserFb.ins().sendTfFlower(this._friendID,this._flowerID,this._sendCount);
				break;
			case this.minBtn:
				if (this._sendCount != 1)
				{
					this._sendCount = 1;
					this.updateCount();
				}
				break;
			case this.maxBtn:
				if (this._sendCount != this._maxCount)
				{
					this._sendCount = this._maxCount;
					this.updateCount();
				}
				break;
			case this.sub1Btn:
				if (this._sendCount > 1)
				{
					this._sendCount--;
					this.updateCount();
				}
				break;
			case this.add1Btn:
			    this._sendCount++;
			    this.updateCount();
				break;
			case this.openListBtn:
				this.scroller.visible = !this.scroller.visible;
				break;
			case this.openListType:
				this.scroller1.visible = !this.scroller1.visible;
				break;
		}
	}

	private onTouchList(e:egret.TouchEvent):void
	{
		let selectedItem:FriendData = this.list.selectedItem;
		if (selectedItem) 
		{
			this._friendID = selectedItem.id;
			this.selectName.text = selectedItem.name;
			this.scroller.visible = !this.scroller.visible;
		}
	}

	public setID(itemDatas:ItemConfig){
		this._flowerID = itemDatas.id;
		this.selectName1.text = itemDatas.name;
		this.shopConfig = ItemStoreConfig.getStoreByItemID(itemDatas.id);
	}

	private onTouchList1(e:egret.TouchEvent):void
	{
		this.selectName1.text = "";
		this.itemData = GlobalConfig.ItemConfig[this.list1.selectedItem];
		if (this.list1.selectedItem) 
		{
			this.setID(this.itemData);
			this.scroller1.visible = !this.scroller1.visible;
		}

		this.updateCount();
		this.updateMaterial();

		
		this.shopConfig = ItemStoreConfig.getStoreByItemID(this.itemData.id);
	}

	private updateCount():void
	{
		let num = this.startNum;
		if (this.itemData!=undefined){
			let config = GlobalConfig.TeamFuBenBaseConfig.flowerValue;
			for (let i in config){
				if (this.itemData.id == parseInt(i)){
					num = config[i];
				}
			}
		}

		this.charmPoint.text = "";
		this.numLabel.text = this._sendCount + "";
		this.charmPoint.text = (this._sendCount * num) + "";
	}

}

ViewManager.ins().reg(FlowerUseTipsWin, LayerManager.UI_Popup);