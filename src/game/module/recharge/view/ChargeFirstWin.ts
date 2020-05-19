class ChargeFirstWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public list: eui.List;
	public closeBtn0: eui.Button;
	public scrollBar: eui.Scroller;
	private topGroup: eui.Group;
	private barbc: eui.ProgressBar;
	private tipsText: eui.Label;
	// private vipImage: eui.Image;
	private vipBtn: eui.Button;
	private vipGroup: eui.Group;
	private vipValue: eui.BitmapLabel;
	constructor() {
		super();
		this.skinName = "ChargeSkin";
		this.isTopLevel = true;
		
		/** 初始化进度条数值 */
		this.barbc.value = 0;
	}

	public initUI(): void {
		super.initUI();
		// this.setSkinPart("roleSelect", new RoleSelectPanel());

		this.list.itemRenderer = ChargeItemRenderer;
		this.scrollBar.viewport = this.list;

		

		this.list.dataProvider = new eui.ArrayCollection(this.onGetListInfo());

		// this.barbc.setWidth(310);

		this.vipValue = BitmapNumber.ins().createNumPic(0, "vip_v", 5);
		this.vipValue.x = 36;
		this.vipValue.y = 39;
		this.vipGroup.addChild(this.vipValue);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.vipBtn, this.onTap);
		this.observe(Recharge.ins().postUpDataItem, this.refushInfo);
		this.observe(Recharge.ins().postUpDataItem,this.refushList)
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
		this.barbc.labelDisplay.visible = true;
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.vipBtn, this.onTap);
		this.list.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListTap, this);
		this.removeObserve();
	}

	private refushList():void{
        this.list.dataProvider = new eui.ArrayCollection(this.onGetListInfo());
	}

	public onGetListInfo():any{
		let index = Recharge.ins().numLun;
		let dataList: RechargeItemsConfig[] = Recharge.ins().getRechargeConfig();
		let dataArr: any[] = [];
		this.list.dataProvider = null;
		for (let str in dataList) {
			if (dataList[str].realMoney != 1) {
				if (LocationProperty.isWeChatMode){
					dataArr.push(dataList[str]);
				} else if (LocationProperty.isNotNativeMode){
					switch (index){
						case 0 :
							if (dataList[str].round == 0){
								dataArr.push(dataList[str]);
							}
							break;
						case 1 :
							if (dataList[str].round == 0 || dataList[str].round == 1){
								dataArr.push(dataList[str]);
							}
							break;
						default :
							dataArr.push(dataList[str]);
							break;
					}
				}
			}
		}
		return dataArr;
	}

	private onListTap(e: eui.ItemTapEvent) {
		let data = e.item;
		Recharge.ins().showReCharge(data.id);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(ChargeFirstWin);
				break;
			case this.vipBtn:
				ViewManager.ins().open(VipWin);
				break;
		}
	}

	private refushInfo() {
		let dataPro = this.list.dataProvider as eui.ArrayCollection;
		for (let i = 0; i < dataPro.length; i++) {
			let data = dataPro.getItemAt(i);
			dataPro.itemUpdated(data);
		}
		this.setView();
	}

	private setView(): void {
		let curLv = UserVip.ins().lv
		let nextConfig: VipConfig = GlobalConfig.VipConfig[curLv + 1];
		let nextNeedYb: number = 0;
		let ybValue: number = 0;
		let str: string = "";
		let vipData: UserVip = UserVip.ins();
		let config: VipConfig = GlobalConfig.VipConfig[vipData.lv];
		let curNeedYb: number = vipData.exp;
		if (nextConfig) {
			nextNeedYb = nextConfig.needYb - curNeedYb;
			str = `再充值|C:0xFFAA24&T:${nextNeedYb}元宝|成为|C:0xFFAA24&T:${UserVip.formatLvStr(curLv + 1)}|`;
			this.barbc.maximum = nextConfig.needYb;
			this.barbc.value = curNeedYb;
		} else {
			str = "VIP等级已满";
			this.barbc.maximum = config.needYb;
			this.barbc.value = config.needYb;
		}
		// this.vipImage.source = `vip_v${curLv}_png`;
		BitmapNumber.ins().changeNum(this.vipValue, curLv, "vip_v", 3);
		if (curLv < 10) {
			this.vipValue.x = 30;
			this.vipValue.y = 30;
		} else {
			this.vipValue.x = 22;
			this.vipValue.y = 30;
		}
		this.tipsText.textFlow = TextFlowMaker.generateTextFlow(str);
	}
}

ViewManager.ins().reg(ChargeFirstWin, LayerManager.UI_Popup);