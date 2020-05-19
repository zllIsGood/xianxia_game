class HuntBoxsTips extends BaseEuiView {

	private num0:eui.Label;
	private num1:eui.Label;
	private num2:eui.Label;
	private num3:eui.Label;
	private gift:eui.List;
	private index:number;
	private already:eui.Label;
	private bgClose:eui.Rect;
	private type:number = 0;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "TreasureRuneGift";

	}

	public open(...param: any[]): void {
		this.index = param[0];//奖励Id
		if (param.length >= 2)
			this.type = param[1];

		this.addTouchEvent(this.bgClose, this.onTap);
		this.gift.itemRenderer = ItemBase;
		if (this.type == 2)
			this.initHeirloom();
		else
			this.initInfo();
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}
	private initInfo(){
		let config:FuwenTreasureRewardConfig = GlobalConfig.FuwenTreasureRewardConfig[this.index];
		if( !config )
			return;
		// this.gift.data = config.reward[0];
		this.gift.dataProvider = new eui.ArrayCollection(config.reward);
		this.num0.text = Rune.ins().runeCount.toString();
		if( Rune.ins().boxs[this.index-1] == Rune.UNGET ){
			let sum:number = config.needTime - Rune.ins().runeCount;
			this.num1.text = sum > 0?sum+"":"0";
			this.already.visible = false;
		}else{
			this.num1.visible = this.num2.visible = this.num3.visible = false;
			this.already.visible = true;
		}
	}

	private initHeirloom():void
	{
		let config:HeirloomTreasureRewardConfig = GlobalConfig.HeirloomTreasureRewardConfig[this.index];
		if( !config )
			return;

		this.gift.dataProvider = new eui.ArrayCollection(config.reward);
		this.num0.text = Heirloom.ins().huntTimes.toString();
		if( Heirloom.ins().huntBoxInfo[this.index-1] == Heirloom.UNGET ){
			let sum:number = config.needTime - Heirloom.ins().huntTimes;
			this.num1.text = sum > 0?sum+"":"0";
			this.already.visible = false;
		}else{
			this.num1.visible = this.num2.visible = this.num3.visible = false;
			this.already.visible = true;
		}

	}
	private onTap(){
		ViewManager.ins().close(this);
	}


}
ViewManager.ins().reg(HuntBoxsTips, LayerManager.UI_Popup);