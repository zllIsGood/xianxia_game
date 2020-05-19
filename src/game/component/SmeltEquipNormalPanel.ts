class SmeltEquipNormalPanel extends BaseComponent {
	/** 关闭按钮 */
		// public closeBtn: eui.Button;
		// public closeBtn0: eui.Button;
	public itemList: eui.List;
	private smeltBtn: eui.Button;
	/** 可熔炼装备列表 */
	private smeltEquips: ItemData[];
	private dataInfo: eui.ArrayCollection;
	// public tab: eui.TabBar;

	private viewIndex: number = 0;
	private eff: MovieClip;
	private btnGroup: eui.Group;

	private smeltLable:eui.Label;
	private backbtn:eui.Button;
	constructor() {
		super();
		this.name = "普通装备";
	}

	public childrenCreated(): void {
		this.init();

	}

	protected init(): void {
		// this.skinName = "SmeltMainSkin";
		this.smeltEquips = [];
		this.smeltEquips.length = 9;

		this.itemList.itemRenderer = SmeltEquipItem;

		this.dataInfo = new eui.ArrayCollection(this.smeltEquips);
		this.itemList.dataProvider = this.dataInfo;
		this.eff = new MovieClip;
		this.eff.x = 78;
		this.eff.y = 30;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.smeltBtn, this.onTap);
		this.addTouchEvent(this.itemList, this.onTap);
		this.addTouchEvent(this.smeltLable, this.onTap);
		this.addTouchEvent(this.backbtn, this.onTap);
		this.setItemData();
		this.observe(UserEquip.ins().postSmeltEquipComplete, this.smeltComplete);
		this.observe(UserEquip.ins().postEquipCheckList, this.setItemList);
		this.observe(UserEquip.ins().postSmeltEquipComplete, this.smeltShowTips);

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.smeltBtn, this.onTap);
		this.removeTouchEvent(this.itemList, this.onTap);
		this.removeTouchEvent(this.smeltLable, this.onTap);
		this.removeTouchEvent(this.backbtn, this.onTap);
		this.removeObserve();
		DisplayUtils.removeFromParent(this.eff);
		TimerManager.ins().remove(this.AutoSmeltEquip,this);
	}

	private smeltShowTips(itemList: { itemId: number, count: number }[]) {
		for (let i = 0; i < itemList.length; i++) {
			let idata = itemList[i];
			let equipConfig: EquipConfig = GlobalConfig.EquipConfig[idata.itemId];
			//是装备则中间飘提示
			if (equipConfig) {
				let itemConfig: ItemConfig = GlobalConfig.ItemConfig[equipConfig.id];
				if (itemConfig) {
					let quality: number = ItemConfig.getQualityColor(itemConfig);
					let str = "获得|C:" + quality + "&T:" + itemConfig.name + " x " + idata.count + "|";
					let p: egret.Point = this.smeltBtn.localToGlobal();
					UserTips.ins().showEverTips({str: str, x: p.x - 25, y: p.y - 45});
				}
			}
		}
	}

	private smeltComplete(): void {
		let n: number = this.itemList.numChildren;
		while (n--) {
			(this.itemList.getChildAt(n) as SmeltEquipItem).playEff();
		}
		this.setItemData();
	}

	private setItemData(): void {
		this.smeltEquips = UserBag.ins().getOutEquips();
		this.dataInfo.replaceAll(this.smeltEquips);
		if( this.smeltBtn.label != "取消熔炼" ){
			this.setBtnLabel();
		}
	}

	private setItemList(list: ItemData[]): void {
		this.dataInfo.replaceAll(list);
		this.itemList.dataProvider = this.dataInfo;
	}

	public getGuildButton(): any {
		this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
		if (!this.eff.parent) this.btnGroup.addChild(this.eff);
		return this.smeltBtn;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.smeltBtn:
				if( UserVip.ins().lv >= 6 ){// vip6开启一键熔炼
					if( this.smeltBtn.label == "取消熔炼" ){
						this.setBtnLabel();
						TimerManager.ins().remove(this.AutoSmeltEquip,this);
					}else{
						if( !TimerManager.ins().isExists(this.AutoSmeltEquip,this) ){
							this.smeltBtn.label = "取消熔炼";
							TimerManager.ins().doTimer(200, 0, this.AutoSmeltEquip, this);
						}
					}
				}else{
					DisplayUtils.removeFromParent(this.eff);
					let b = UserEquip.ins().sendSmeltEquip(this.viewIndex, this.smeltEquips);
					if (b) {
						SoundUtil.ins().playEffect(SoundUtil.SMELT);
					}
				}
				break;
			case this.itemList:
				let item: SmeltEquipItem = e.target as SmeltEquipItem;
				if (item && item.data) {
					let i: number = this.smeltEquips.indexOf(item.data);
					if (i >= 0) {
						this.smeltEquips.splice(i, 1);
						item.data = null;
					}
				}
				// else {
				// 	let smeltList: ItemData[] = UserBag.ins().getBagSortQualityEquips(this.viewIndex == 0 ? 3 : 5, 0, 0, this.viewIndex == 0 ? UserBag.ins().normalEquipSmeltFilter : UserBag.ins().otherEquipSmeltFilter);
				// 	if (smeltList.length > 0) {
				// 		let smeltSelectWin: SmeltSelectWin = ViewManager.ins().open(SmeltSelectWin, smeltList, 9) as SmeltSelectWin;
				// 		smeltSelectWin.setSmeltEquipList(this.smeltEquips);

				// 	}
				// 	else {
				// 		UserTips.ins().showTips("|C:0xf3311e&T:当前没有可熔炼的装备|");
				// 	}
				// }
				break;
			case this.smeltLable:

				break;
			case this.backbtn:
				ViewManager.ins().close(SmeltEquipTotalWin);
				break;
		}
	}
	/**特权 自动熔炼*/
	private AutoSmeltEquip(){
		DisplayUtils.removeFromParent(this.eff);
		let b = UserEquip.ins().sendSmeltEquip(this.viewIndex, this.smeltEquips);
		if (b) {
			SoundUtil.ins().playEffect(SoundUtil.SMELT);
		}else{
			this.setBtnLabel();
			TimerManager.ins().remove(this.AutoSmeltEquip,this);
		}
	}

	private setBtnLabel(){
		if( UserVip.ins().lv >= 6 ) // vip6开启一键熔炼
			this.smeltBtn.label = "一键熔炼";
		else
			this.smeltBtn.label = "熔  炼";
	}
}