/**
 *
 * @author hepeiye
 *
 */
class TreasureHuntPanel extends BaseView {

	private icon1: eui.Image;
	private icon2: eui.Image;
	// public list1: eui.List;
	// public list2: eui.List;
	private posArr:number[];
	private award1: eui.Group;
	private award2: eui.Group;

	private buy1: eui.Button;
	private buy10: eui.Button;
	private outBag: eui.Button;
	private num1: eui.Label;
	private num0: eui.Label;
	public redPoint2: eui.Image;


	private mc1: MovieClip;
	private mc2: MovieClip;

	public list: eui.List;
	public chuanqi: eui.Group;
	private id1: number;
	private id2: number;
	private titleMcGroup: eui.Group;
	private longZhuEff: MovieClip;

	private btnGroup: eui.Group;
	
	private eff: MovieClip;
	private iteml1: eui.Label;
	private iteml2: eui.Label;
	private itemy1: eui.Image;
	private itemy2: eui.Image;
	private bdsz: eui.Label;
	constructor() {
		super();
		this.name = "装备";
		// this.skinName = "TreasureHuntPanelSkin"
	}

	public childrenCreated(): void {
		this.init();
	}

	public init() {
		this.updateDescEx();
		let config: TreasureHuntPoolConfig[] | TreasureHuntPoolHefuConfig[];
		if (Activity.ins().IsHefuXunBaoTimer()) {//是否合服寻宝期间
			this.bdsz.visible = false;
			config = GlobalConfig.TreasureHuntPoolHefuConfig;
		} else {
			config = GlobalConfig.TreasureHuntPoolConfig;
		}
		this.id1 = config[1].reward[0].id;
		this.id2 = config[2].reward[0].id;

		this.posArr = [ 150,50,
						70,130,
						30,230,
						70,330,
						150,410,
						45,50,
						120,130,
						160,230,
						120,330,
						45,410];

		let len1 = config[3].reward.length;
		let len2 = config[4].reward.length;
		for(let i = 0 ; i < 10; i ++){
			let item = ObjectPool.pop("ItemBase") as ItemBase;
			let id;
			if(i < 5){
				id = config[3].reward[i].id;
				item.setNum(config[3].reward[i].count);
				this.award1.addChild(item);
			}else{
				id = config[4].reward[i-5].id;
				item.setNum(config[4].reward[i-5].count);
				this.award2.addChild(item);
			}
			let itemc = GlobalConfig.ItemConfig[id] as ItemConfig; 
			// item.setDataByConfig(itemc);

			item.setItemConfig(itemc, id);
			item.addEventListener(egret.TouchEvent.TOUCH_END, item.onClick, item);
			//  ViewManager.ins().open(EquipDetailedWin);

			item.PosItem({x:this.posArr[i*2 +0],y:this.posArr[i*2 +1]});
		}

		// this.list1.itemRenderer = ItemBase;
		// this.list2.itemRenderer = ItemBase;
		// this.list1.dataProvider = new eui.ArrayCollection(config[3].reward);
		// this.list2.dataProvider = new eui.ArrayCollection(config[4].reward);



		// this.list2.validateNow();
		// for (let i = 0; i < this.list2.numElements; i++) {
		// 	let item: ItemBase = this.list2.getVirtualElementAt(i) as ItemBase;
		// 	if (item.getItemType() == 17)
		// 		item.showSpeicalDetail = false;
		// }

		// this.icon1.source = itemConfig[this.id1].icon + "";
		// this.icon2.source = itemConfig[this.id2].icon + "";

		this.mc1 = new MovieClip();
		this.mc1.x = this.icon1.x + 74;
		this.mc1.y = this.icon1.y + 40;
		this.mc1.scaleX = this.mc1.scaleY = 1.4;
		this.chuanqi.addChild(this.mc1);

		this.mc2 = new MovieClip();
		this.mc2.x = this.icon2.x + 74;
		this.mc2.y = this.icon2.y + 40;
		this.mc2.scaleX = this.mc2.scaleY = 1.4;
		this.chuanqi.addChild(this.mc2);
		this.list.itemRenderer = HuntListRenderer;
		this.listRefush([]);

		// this.longZhuEff = new MovieClip;
		// this.longZhuEff.x = 75;
		// this.longZhuEff.y = 35;
		// this.longZhuEff.touchEnabled = false;

		this.eff = new MovieClip;
		this.eff.x = 37;
		this.eff.y = 46;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;

		this.open();
	}

	public open(...param: any[]): void {
		// this.longZhuEff.playFile(RES_DIR_EFF + "longzubaozangeff", -1);
		// this.titleMcGroup.addChild(this.longZhuEff);
		this.addTouchEvent(this.buy1, this.onBuy);
		this.addTouchEvent(this.buy10, this.onBuy);
		this.addTouchEvent(this.outBag, this.onBuy);
		this.addTouchEvent(this.icon1, this.onClick);
		this.addTouchEvent(this.icon2, this.onClick);
		this.observe(Hunt.ins().postBestListInfo, this.listRefush);
		this.observe(UserBag.ins().postItemAdd, this.setRedStatu);
		this.observe(Hunt.ins().postHuntResult, this.callHuntResult);


		this.mc1.playFile(RES_DIR_EFF + "chuanqizbeff", -1);
		this.mc2.playFile(RES_DIR_EFF + "chuanqizbeff", -1);
		this.listRefush([]);

		Hunt.ins().sendHuntList();

		this.setRedStatu();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.buy1, this.onBuy);
		this.removeTouchEvent(this.buy10, this.onBuy);
		this.removeTouchEvent(this.icon1, this.onClick);
		this.removeTouchEvent(this.icon2, this.onClick);
		this.removeTouchEvent(this.outBag, this.onBuy);
		DisplayUtils.removeFromParent(this.eff);
		this.removeObserve();
		this.posArr = [];
	}

	private setRedStatu(): void {
		let boo: boolean = Boolean(UserBag.ins().getHuntGoods(0).length);
		if (boo) {
			this.outBag.parent.addChildAt(this.eff, this.getChildIndex(this.outBag));
			this.eff.playFile(RES_DIR_EFF + "actIconCircle", -1);
		} else {
			DisplayUtils.removeFromParent(this.eff);
		}
		this.redPoint2.visible = boo;
	}

	private listRefush(data: any[]): void {
		this.list.dataProvider = new eui.ArrayCollection(data);
	}

	private onBuy(e: egret.TouchEvent) {
		switch (e.target) {
			case this.buy1:
				this.buyHunt(0);
				break;
			case this.buy10:
				this.buyHunt(1);
				break;
			case this.outBag:
				ViewManager.ins().open(TreasureStorePanel, DepotType.Equip);
				break;
			default:
				break;
		}
	}

	private buyHunt(type: number): void {
		//寻10次(扣除现有寻宝图数 即有几张图寻几次)
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.TreasureHuntConfig.huntItem);
		if (item) {
			Hunt.ins().sendHunt(type);
			return;
		}

		let huntOnce: number = type == 0 ? GlobalConfig.TreasureHuntConfig.huntOnce : GlobalConfig.TreasureHuntConfig.huntTenth;
		let yb: number = Actor.yb;
		if (yb >= huntOnce) {
			Hunt.ins().sendHunt(type);
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}
	}

	private onClick(e: egret.TouchEvent) {
		switch (e.target) {
			case this.icon1:
				ViewManager.ins().open(EquipDetailedWin, 1, undefined, this.id1);
				break;
			case this.icon2:
				ViewManager.ins().open(EquipDetailedWin, 1, undefined, this.id2);
				break;
			default:
				break;
		}
	}
	private callHuntResult() {
		this.updateDescEx();
	}
	private updateDesc() {
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.TreasureHuntConfig.huntItem);
		if (item) {
			this.itemy1.visible = this.itemy2.visible = false;
			this.iteml1.visible = this.iteml2.visible = true;
			this.num1.text = "1";
			this.num0.text = "10";
			this.num1.x = this.iteml1.x + this.iteml1.width;
			this.num0.x = this.iteml2.x + this.iteml2.width;
		} else {
			this.itemy1.visible = this.itemy2.visible = true;
			this.iteml1.visible = this.iteml2.visible = false;
			this.num1.text = GlobalConfig.TreasureHuntConfig.huntOnce + "";
			this.num0.text = GlobalConfig.TreasureHuntConfig.huntTenth + "";
			this.num1.x = this.itemy1.x + this.itemy1.width;
			this.num0.x = this.itemy2.x + this.itemy2.width;
		}
	}
	private zb1: eui.Label;
	private zb10: eui.Label;
	private updateDescEx() {
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.TreasureHuntConfig.huntItem);
		let colorStr: string = "";
		let sum: number = 0;
		if (item) {
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		} else {
			colorStr = ColorUtil.RED_COLOR;
		}
		let txt = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.num1.textFlow = this.num0.textFlow = txt;
		this.zb1.text = GlobalConfig.TreasureHuntConfig.huntOnce + "";
		this.zb10.text = GlobalConfig.TreasureHuntConfig.huntTenth + "";
	}
}