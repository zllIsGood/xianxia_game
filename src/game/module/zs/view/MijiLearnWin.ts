class MijiLearnWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private smeltBtn: eui.Button;

	private itemScroller: eui.VScrollBar;
	private itemList: eui.List;

	private mijiLearnIcon: MijiItem;
	private info: eui.Label;

	private roleIndex: number;
	private link: eui.Label;

	private curName: string;

	// public mijitihuantips: eui.Label;
	private mijiName: eui.Label;

	constructor() {
		super();
		this.skinName = "MijiLearnSkin";
	}

	public initUI(): void {
		super.initUI();
		this.itemList.itemRenderer = MijiLearnItemRenderer;
		this.itemScroller.viewport = this.itemList;

		this.isTopLevel = true;

		this.link.textFlow = new egret.HtmlTextParser().parser("<u>获得途径</u>");
	}

	public open(...param: any[]): void {

		this.roleIndex = param[0];

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.addTouchEvent(this.smeltBtn, this.onTap);
		this.addTouchEvent(this.link, this.onTap);
		this.observe(UserBag.ins().postItemAdd, this.updateItem);//道具添加
		this.observe(UserBag.ins().postItemDel, this.updateItem);//道具删除
		this.observe(UserBag.ins().postItemChange, this.updateItem);//道具变更

		this.clearData();

		this.updateItem(true);
	}

	private sortFun(aItem: ItemData, bItem: ItemData): number {
		let ins: UserMiji = UserMiji.ins();
		let aid: number = MiJiSkillConfig.getSkillIDByItem(aItem.configID);
		let bid: number = MiJiSkillConfig.getSkillIDByItem(bItem.configID);
		if (ins.hasSpecificSkillOfRole(this.roleIndex, aid) == true)
			return 1;
		if (ins.hasSpecificSkillOfRole(this.roleIndex, bid) == true)
			return -1;
		if (aItem.configID < bItem.configID)
			return -1;
		if (aItem.configID > bItem.configID)
			return 1;
		return 0;
	}

	private updateItem(autoSet: boolean = false): void {
		let arr: ItemData[] = UserBag.ins().getItemByType(2);
		arr.sort(this.sortFun.bind(this));
		let learnAry: any[] = [];
		for (let i: number = 0; i < arr.length; i++) {
			let id: number = MiJiSkillConfig.getSkillIDByItem(arr[i].configID);
			let obj: Object = new Object();
			obj["islearn"] = UserMiji.ins().hasSpecificSkillOfRole(this.roleIndex, id);
			obj["item"] = arr[i];
			learnAry.push(obj);
		}
		// this.mijitihuantips.visible = false;
		// if (UserMiji.ins().hasNewSkillOfRole(this.roleIndex) == true) {
		// 	this.mijitihuantips.visible = true;
		// }
		this.itemList.dataProvider = new eui.ArrayCollection(learnAry);
		if (autoSet && arr.length) {
			this.setData(arr[0]);
			this.itemList.selectedIndex = 0;
		}
	}

	/**
	 *
	 * 设置下方图标  和   描述
	 * @param data  当前选中的秘术
	 *
	 */
	setData(data: ItemData): void {
		this.mijiLearnIcon.data = MiJiSkillConfig.getSkillIDByItem(data.configID);
		let color: string = ItemConfig.getQualityColor(data.itemConfig).toString(16);
		this.mijiName.textFlow = new egret.HtmlTextParser().parser("<font color='#" + color + "'>" + data.itemConfig.name + "</font>");
		this.info.textFlow = TextFlowMaker.generateTextFlow1(data.itemConfig.desc);
		this.mijiLearnIcon.visible = true;

		let id: number = MiJiSkillConfig.getSkillIDByItem(data.configID);
		let isLearn: boolean = UserMiji.ins().hasSpecificSkillOfRole(this.roleIndex, id);
		this.smeltBtn.label = isLearn ? "已学习" : "放 入";
		this.smeltBtn.enabled = !isLearn;

		this.curName = data.itemConfig.name;
	}

	clearData(): void {
		this.itemList.selectedIndex = -1;
		this.mijiLearnIcon.visible = false;
		this.mijiLearnIcon.data = null;
		this.info.text = "";
		this.curName = "";
		this.mijiName.text = "";
	}

	/**
	 *
	 * 点选秘术回调函数
	 *
	 *
	 */
	private onItemTap(e: eui.ItemTapEvent): void {
		let data: Object = this.itemList.dataProvider.getItemAt(e.itemIndex);
		this.setData(data["item"]);
	}

	private onTap(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.smeltBtn:
				//提升按钮
				if (!this.mijiLearnIcon.data) {
					UserTips.ins().showTips("请选择技能！");
					return;
				}

				//获取高级技能id
				let id: number = this.mijiLearnIcon.data + 1;
				//获取中级技能id
				id = this.mijiLearnIcon.data - 1;
				//是否已经学习了中级
				let tempName: string = GlobalConfig.ItemConfig[GlobalConfig.MiJiSkillConfig[this.mijiLearnIcon.data].item].name;
				UserMiji.ins().postSelectedMiji(this.mijiLearnIcon.data, this.curName);
				this.clearData();
				ViewManager.ins().close(this);
				break;

			case this.link:
				ViewManager.ins().close(this);
				UserWarn.ins().setBuyGoodsWarn(
					200099, 1
				);
				break;
		}

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.itemList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.removeTouchEvent(this.smeltBtn, this.onTap);
		this.removeTouchEvent(this.link, this.onTap);

		this.removeObserve();
	}
}

ViewManager.ins().reg(MijiLearnWin, LayerManager.UI_Main);