class PunchExchangeWin extends BaseEuiView {
	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "PunchExchangeSkin";

		this.goturn.textFlow = [{text:`碎片兑换`,style:{underline:true}}];

		this.exchangelist.itemRenderer = PunchExchangeItem;
		this.equiplist.itemRenderer = PunchExchangeBtn;
		this.initMenu();
	}

	private data: any;
	private exchangelist: eui.List;
	private equiplist: eui.List;
	private currentSelect: number = 0;
	private menuArr: any[];
	private exchangeArr: any[];
	private suipian: eui.Label;
	private suipian1: eui.Label;
	private goturn: eui.Label;
	public open(...param: any[]): void {
		this.data = param[0];
		// this.addTouchEvent(this.equiplist, this.onListChange);
		this.equiplist.addEventListener(egret.Event.CHANGING, this.checkIsOpen, this);
		// this.observe(UserBag.ins().postItemChange, this.onListChange);//道具变更
		// this.observe(UserBag.ins().postItemAdd, this.onListChange);//道具添加
		// this.observe(UserBag.ins().postItemDel, this.onListChange);//道具删除
		this.observe(Actor.ins().postUpdateTogeatter, this.onListChange);
		this.addTouchEvent(this.goturn, this.onTap);
		this.equiplist.selectedIndex = this.currentSelect;
		this.refushInfo();
	}

	public close(...param: any[]): void {
		// this.removeTouchEvent(this.equiplist, this.onListChange);
		this.equiplist.removeEventListener(egret.TouchEvent.CHANGING, this.checkIsOpen, this);
		this.removeTouchEvent(this.goturn, this.onTap);
		this.removeObserve();
	}

	@callLater
	private onListChange(egret: TouchEvent): void {
		this.currentSelect = this.equiplist.selectedIndex;
		this.refushInfo();
	}

	private initMenu(): void {
		this.menuArr = [];
		this.exchangeArr = [];
		let config: TogetherHitEquipPageConfig[] = GlobalConfig.TogetherHitEquipPageConfig;
		let index: number = 0;
		let zlv = UserSkill.ins().getMaxzLv();
		for (let k in config) {
			let id0 = config[k].id[0];
			let conf = GlobalConfig.TogetherHitEquipExchangeConfig[id0];
			if (conf.zsLevel > zlv[0] || conf.level > zlv[1]) {
				break;
			}
			this.menuArr.push({config:config[k],index:+k});
			this.exchangeArr[index] = [];
			for (let i in config[k].id) {
				let item: any = GlobalConfig.TogetherHitEquipExchangeConfig[config[k].id[i]];
				this.exchangeArr[index].push(item);
			}
			index++;
		}
	}

	private refushInfo(): void {
		this.suipian.text = `${Actor.togeatter1}`;
		this.suipian1.text = `${Actor.togeatter2}`;
		this.equiplist.dataProvider = new eui.ArrayCollection(this.menuArr);
		let currentList: any[] = this.exchangeArr[this.currentSelect];
		this.exchangelist.dataProvider = new eui.ArrayCollection(currentList);
	}

	private onTap(e: egret.TouchEvent): void {
		let tar = e.currentTarget;
		if (tar == this.goturn) {
			ViewManager.ins().open(PunchTransformWin);
		}
	}

	private checkIsOpen(e: egret.Event) {
		let list = e.target;
		let config = this.exchangeArr[list.selectedIndex][0];
		let zsLv: number = config.zsLevel || 0;
		let lv: number = config.level;
		let boo: boolean = true;// (Actor.level >= lv && UserZs.ins().lv >= zsLv);
		if (!boo) {
			let str: string = Actor.level >= lv ? `${zsLv}转开启` : `${lv}级开启`;
			UserTips.ins().showTips(`${str}开启`);
			e.$cancelable = true;
			e.preventDefault();
			return;
		} else {
			this.onListChange(null);
		}
	}
}

ViewManager.ins().reg(PunchExchangeWin, LayerManager.UI_Main);
