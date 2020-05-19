/**
 * 烈焰印记合成面板
 * Created by wanghengshuai on 2018/1/3.
 */
class LyMarkMixWin extends BaseEuiView{
	
	public closeBtn:eui.Rect;
	public list:eui.List;

	private _collect:ArrayCollection;

	public constructor() {
		super();
		this.skinName = "markMixSkin";
		this.isTopLevel = true;
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.list.itemRenderer = LyMarkMixItemRender;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTouch);
		this.observe(UserBag.ins().postItemAdd, this.update);
		this.observe(UserBag.ins().postItemChange, this.update);
		this.update();
	}

	public close():void
	{
	}

	private update():void
	{
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.list.dataProvider = this._collect;
		}

		let datas:any[] = [];
		let itemData: ItemData, cfg:FlameStampMat;
		let count:number, itemName:string, itemCount:number;
		for (let key in GlobalConfig.FlameStampMat)
		{
			cfg = GlobalConfig.FlameStampMat[key];
			if (cfg.costItem)
			{
				itemData = UserBag.ins().getBagItemById(cfg.costItem);
				itemName = GlobalConfig.ItemConfig[cfg.costItem].name;
				count = itemData ? itemData.count : 0;
			}
			else
			{
				count = 0;
				itemName = "";
			}

			itemData = UserBag.ins().getBagItemById(cfg.itemId);
			itemCount = itemData ? itemData.count : 0;
			
			datas.push({cfg:cfg, count:count, itemName:itemName, itemCount:itemCount});
		}

		this._collect.source = datas;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(LyMarkMixWin, LayerManager.UI_Main);