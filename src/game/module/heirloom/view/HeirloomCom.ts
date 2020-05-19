class HeirloomCom extends BaseEuiView {

	/**控件*/
	public jihuo0: eui.Button;
	public countLabel0: eui.Label;
	public getItemTxt0: eui.Label;
	public model: eui.Image;
	public modelAni: MovieClip;
	public icon0: eui.Image;
	public rect: eui.Rect;

	public curIndex: number;
	public roleId: number;

	private eff: MovieClip = new MovieClip();

	constructor() {
		super();
		this.skinName = "heirloomCom";
	}

	public initUI(): void {
		super.initUI();

		this.curIndex = 0;
	}

	public open(...param: any[]): void {
		// this.roleId = param[0];//当前选中的role

		// this.observe(Heirloom.ins().postHeirloomInfo, this.updateData);
		this.observe(UserBag.ins().postItemDel, this.updateData);
		this.observe(UserBag.ins().postItemCountChange, this.updateData);
		this.observe(Heirloom.ins().postHeirloomInfo, this.updateData);

		this.addTouchEvent(this.rect, this.onClick);
		this.addTouchEvent(this.getItemTxt0, this.onClick);
		this.addTouchEvent(this.jihuo0, this.onClick);

		for (let i = 0; i < 8; i++) {
			this.addTouchEvent(this["item" + i], this.onTap);
		}



		this.initData();

		this.modelAni.parent.addChild(this.eff);
		this.eff.playFile(`${RES_DIR_EFF}artifacteff2`, -1)

		this.eff.x = this.modelAni.x;
		this.eff.y = this.modelAni.y;
	}
	public initData() {
		this.model.visible = false;//定位模型
		for (let i = 0; i < 8; i++) {
			let config: HeirloomEquipConfig = HeirloomData.getInfoBySoltFirst(i);
			this["item" + i].data = { pos: i, info: config };
			this["item" + i].cleanEff();
		}
		this["item0"].selectIcon.visible = true;
		let config: HeirloomEquipConfig = HeirloomData.getInfoBySoltFirst(0);
		this.setModel(config);
		this.setCost(config);
	}
	public updateData() {
		let pos = this.curIndex;
		let config: HeirloomEquipConfig = HeirloomData.getInfoBySoltFirst(pos);
		this["item" + pos].data = { pos: pos, info: config };
		this["item" + pos].cleanEff();
		this.setCost(config);
	}

	public close(...param: any[]): void {
		for (let i = 0; i < 8; i++) {
			this.removeTouchEvent(this["pos" + i], this.onTap);
		}
		this.removeTouchEvent(this.rect, this.onClick);
		this.removeTouchEvent(this.getItemTxt0, this.onClick);
		this.removeTouchEvent(this.jihuo0, this.onClick);


		this.removeObserve();
		this.removeAni();
	}
	public removeAni() {
		DisplayUtils.removeFromParent(this.modelAni);
		if (this.modelAni)
			egret.Tween.removeTweens(this.modelAni);
		this.modelAni = null;
	}
	public onClick(e: egret.Event) {
		let cfg: HeirloomEquipConfig;
		let itemData: ItemData;
		let config: HeirloomEquipItemConfig;
		switch (e.currentTarget) {
			case this.rect:
				ViewManager.ins().close(this);
				break;
			case this.getItemTxt0:
				config = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
				(<ShopGoodsWarn>ViewManager.ins().open(ShopGoodsWarn)).setData(config.expend.id);
				break;
			case this.jihuo0://合成
				config = GlobalConfig.HeirloomEquipItemConfig[this.curIndex + 1];
				//如果已拥有 就提示穿戴 针对武器1和衣服3
				if (this.curIndex + 1 == HeirloomSlot.wq || this.curIndex + 1 == HeirloomSlot.yf) {
					itemData = UserBag.ins().getBagItemById(config.item);
					if (itemData) {
						UserTips.ins().showTips("|C:0x00ff00&T:已拥有该道具 请激活穿戴");
						return;
					}
				}
				// cfg = HeirloomData.getInfoBySoltFirst(this.curIndex);
				itemData = UserBag.ins().getBagItemById(config.expend.id);
				let cost: number = itemData ? itemData.count : 0;
				//当前背包材料数量
				if (cost >= config.expend.count)
					Heirloom.ins().sendHeirloomAdd(this.curIndex + 1);
				else
					UserTips.ins().showTips("材料不足");
				break;

		}

	}

	public onTap(e: egret.Event) {
		for (let i = 0; i < 8; i++) {
			this["item" + i].selectIcon.visible = false;
			switch (e.currentTarget) {
				case this["item" + i]:
					if (this.curIndex == i) {
						this["item" + i].selectIcon.visible = true;
						break;
					}
					this.curIndex = i;
					this["item" + i].selectIcon.visible = true;
					let config: HeirloomEquipConfig = HeirloomData.getInfoBySoltFirst(i);
					this.setModel(config);
					this.setCost(config);
					break;
			}
		}
	}

	/**设置模型特效*/
	public setModel(config: HeirloomEquipConfig) {
		let eff = "";

		if (!config) {
			return;
		}
		eff = config.model;

		if (!this.modelAni) {
			this.modelAni = new MovieClip;
			this.modelAni.playFile(RES_DIR_EFF + eff, -1);
			this.modelAni.x = this.model.x + this.model.width / 2;
			this.modelAni.y = this.model.y + this.model.height / 2;
			this.model.parent.addChildAt(this.modelAni, this.model.parent.getChildIndex(this.model));
			DisplayUtils.upDownGroove(this.modelAni, -12, 0);
			return;
		}
		this.modelAni.playFile(RES_DIR_EFF + eff, -1);
		DisplayUtils.upDownGroove(this.modelAni, -12, 0);

	}
	/**设置消耗数据*/
	public setCost(config: HeirloomEquipConfig) {
		if (!config) {
			return;
		}
		let cfg: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[config.slot];
		let expend: { id: number, count: number } = cfg.expend;//config.expend;
		let equipConfig: ItemConfig = GlobalConfig.ItemConfig[expend.id];
		if (!equipConfig) {
			return;
		}
		this.icon0.source = equipConfig.icon.toString() + "_png";
		let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);
		let cost: number = itemData ? itemData.count : 0;
		let costItemLen: number = cost;//当前背包材料数量
		// this.countLabel0.textFlow = TextFlowMaker.generateTextFlow(`${costItemLen}/${expend.count}`);
		let colorStr: string = "";
		if (costItemLen >= expend.count)
			colorStr = ColorUtil.GREEN_COLOR;
		else
			colorStr = ColorUtil.RED_COLOR;
		this.countLabel0.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${costItemLen}</font><font color=${ColorUtil.WHITE_COLOR}>/${expend.count}</font> `);
		let labelbtn: string = `|U&T:获取宝钻`;
		if (config.slot == HeirloomSlot.wq) {
			labelbtn = `|U&T:获取诛仙之刃`;
		} else if (config.slot == HeirloomSlot.yf) {
			labelbtn = `|U&T:获取诛仙神甲`;
		}
		this.getItemTxt0.textFlow = TextFlowMaker.generateTextFlow(labelbtn);
	}




}

ViewManager.ins().reg(HeirloomCom, LayerManager.UI_Popup);