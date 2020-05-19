/**
 * 获取方式道具细节窗口
 *
 */
class PropGainTipsWin extends BaseEuiView {

	private itemIcon: ItemIcon;//icon
	private nameLabel: eui.Label;//名字
	private num: eui.Label;//数量
	private lv: eui.Label;//等级
	private description0: eui.Label;//描述

	private BG: eui.Image;
	private power: eui.Label;
	private gainList:eui.List;//获取方式

	constructor() {
		super();
	}


	public initUI(): void {
		super.initUI();
		this.skinName = "PropGainTipsSkin";
		this.itemIcon.imgJob.visible = false;
		this.gainList.itemRenderer = GainGoodsNoSkinItem;//GainGoodsItem;
	}

	public open(...param: any[]): void {
		let type: number = param[0];
		let id: number = param[1];
		let num: number = param[2];
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.addTouchEndEvent(this, this.otherClose);
		this.setData(type, id, num);
	}

	public close(...param: any[]): void {
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			// ViewManager.ins().closeTopLevel();
			let isShow:boolean = true;
			if( item[1] == "Recharge2Win" ){
				let rdata:RechargeData = Recharge.ins().getRechargeData(0);
				if(!rdata || !rdata.num ){//首冲
					isShow = false;
					ViewManager.ins().open(Recharge1Win);
				}
			}
			if( isShow )
				GameGuider.guidance(item[1], item[2], item[3]);
			ViewManager.ins().close(ShopGoodsWarn);
			ViewManager.ins().close(BookUpWin);
			ViewManager.ins().close(WeaponPanel);
			ViewManager.ins().close(WeaponSoulBreakWin);
			if( item[1] != "HeirloomCom" )
				ViewManager.ins().close(HeirloomCom);
			if( item[1] == "LadderWin" )
				ViewManager.ins().close(ForgeWin);
			if( item[1] == "PlayFunView" ){
				ViewManager.ins().close(ShopWin);
			}

		}
	}


	private setData(type: number, id: number, num: number): void {
		let numStr = "";
		if (num == undefined) {
			let data = UserBag.ins().getItemByTypeAndId(type, id);
			numStr = data ? (data.count + "") : "0";
		} else
			numStr = num + "";


		let config = GlobalConfig.ItemConfig[id];

		this.nameLabel.text = config.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(config);
		this.itemIcon.setData(config);
		this.lv.text = (config.level || 1) + "级";
		this.num.text = numStr;
		this.description0.textFlow = TextFlowMaker.generateTextFlow(config.desc);

		if (ItemConfig.getType(config) == 2) {
			let sID: number = MiJiSkillConfig.getSkillIDByItem(config.id);
			this.power.text = "评分：" + GlobalConfig.MiJiSkillConfig[sID].power;
		}
		else
			this.power.text = "";

		// this.BG.height = 170 + this.description0.height;

		let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[id];
		if( gainConfig ){
			this.gainList.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
		}else{
			this.gainList.dataProvider = new eui.ArrayCollection([]);
		}

	}

}
ViewManager.ins().reg(PropGainTipsWin, LayerManager.UI_Popup);