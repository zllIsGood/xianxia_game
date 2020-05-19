/**
 * 货币tips
 *
 */
class ItemCurrencyWin extends BaseEuiView {

	private nameLabel: eui.Label;
	private description: eui.Label;
	private num: eui.Label;
	private itemIcon: ItemIcon;
	private BG: eui.Image;

	constructor() {
		super();
	}


	public initUI(): void {
		super.initUI();
		this.skinName = "ItemCurrencySkin";
		this.itemIcon.imgJob.visible = false;
	}

	public open(...param: any[]): void {
		let id: number = param[0];
		let count: number = param[1];
		count = count?count:0;
		this.addTouchEndEvent(this, this.otherClose);
		this.setData(id, count);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}


	private setData(id: number, count: number): void {
		let numStr = "";
		switch (id) {
			case MoneyConst.feat:
				numStr = count?count+"":"0";
				break;
		}

		let config:MoneyConfig = GlobalConfig.MoneyConfig[id];
		this.nameLabel.text = config.name;
		this.num.text = numStr;
		this.setImgData(id,count);
		this.description.textFlow = TextFlowMaker.generateTextFlow1(config.describe);
		this.BG.height = 170 + this.description.height;

	}
	public setImgData(id:number,count:number){
		let type: number = 1;//颜色类型
		switch (id) {
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
				break;
			case MoneyConst.godweaponExp:
				type = 2;
				break;
			default:
				break;
		}
		this.nameLabel.text = RewardData.getCurrencyName(id);
		this.nameLabel.textColor = ItemBase.QUALITY_COLOR[type];
		this.itemIcon.imgIcon.source = RewardData.getCurrencyRes(id);
		this.itemIcon.imgBg.source = ItemConfig.getQualityBg(type);
		this.setCount(count + "")
	}
	private setCount(str: string): void {
		if (str.length > 4) {
			let wNum: number = Math.floor(Number(str) / 1000);
			str = wNum / 10 + "万";
		}
		this.num.text = str;
	}

}
ViewManager.ins().reg(ItemCurrencyWin, LayerManager.UI_Popup);