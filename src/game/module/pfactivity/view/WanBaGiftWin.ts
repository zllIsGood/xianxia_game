/**
 * Created by Administrator on 2016/8/1.
 */
class WanBaGiftWin extends BaseEuiView {

	public bgClose: eui.Rect;
	public closeBtn: eui.Button;
	public cardList0: eui.List;
	public title: eui.Label;
	public title2: eui.Label;

	constructor() {
		super();
		this.skinName = "GetItemSkin";
	}

	public initUI(): void {
		super.initUI();
	}

	public open(...param: any[]): void {

		let day: number = param[0];
		let result: boolean = param[1];
		let giftType: number = param[2];
		let typeString: number = param[3];

		// this.currentState = result ? "success" : "fail";
		this.title.text = result ? "领取成功" : "只能领取一次哦";
		this.title2.text = result ? "恭喜您获得：" : "您已领取过：";

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);

		let rewardConf;
		switch (giftType) {
			case 1:
				rewardConf = GlobalConfig.WanBaGiftbagConst.items;
				break;
			case 2:
				rewardConf = GlobalConfig.WanBaGiftbagBasic[day].items;
				break;
			case 3:
				if (GlobalConfig.WanBaGiftbagBasic[typeString]) {
					rewardConf = GlobalConfig.WanBaGiftbagBasic[typeString].items;
				}
				break;
		}

		if (rewardConf) {
			this.cardList0.itemRenderer = ItemBase;
			this.cardList0.dataProvider = new eui.ArrayCollection(rewardConf);
		}

		// let s: string = "";
		// for (let i: number = 0; i < config.items.length; i++) {
		// 	if (config.items[i].type == 0)
		// 		s += RewardData.getCurrencyName(config.items[i].id);
		// 	else
		// 		s += GlobalConfig.ItemConfig[config.items[i].id].name;
		// 	s += "×" + config.items[i].count;
		// 	if (i + 1 < config.items.length)
		// 		s += "、";
		// }
	}

	public close(...param: any[]): void {
	}

	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(WanBaGiftWin, LayerManager.UI_Main);