class MoneyTreeBoxWin extends BaseEuiView{

	public closeBtn:eui.Button;
	public closeBtn1:eui.Button;
	public sure:eui.Button;
	public desc:eui.Label;
	public list:eui.List;

	private dataList:RewardData[] = [];
	private index:number;

	constructor() {
		super();
	}

	public initUI():void
	{
		super.initUI();
		this.skinName = "MoneyTreeBoxSkin";

		this.list.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.sure, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.index = param[0]
		let data:any = UserFuLi.ins().getBoxInfoByIndex(this.index);
		this.desc.text = "今日使用摇钱树"+data.time+"次，可额外获得：";
		this.creatRewardList(data.box);
		this.list.dataProvider = new eui.ArrayCollection(this.dataList);
		this.sure.enabled = UserFuLi.ins().playNum >= data.time;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.sure, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn1, this.onTap);
	}

	private creatRewardList(count:number[]):void
	{
		let item:RewardData;
		for(let i:number = 0; i< 3; i++)
		{
			if(!this.dataList[i])
			{
				item = new RewardData();
				item.type = 0;
				item.id = 1;
				this.dataList.push(item);
			}else{
				item = this.dataList[i];
			}
			item.count = count[i];
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch(e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn1:
				ViewManager.ins().close(this);
			break;
			case this.sure:
				UserFuLi.ins().sendGetCaseReward(this.index);
				ViewManager.ins().close(this);
			break;
		}
	}
}

ViewManager.ins().reg(MoneyTreeBoxWin,LayerManager.UI_Main);