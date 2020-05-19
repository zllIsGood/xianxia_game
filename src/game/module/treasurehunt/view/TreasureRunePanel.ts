/**
 * Created by Administrator on 2017/3/7.
 */
class TreasureRunePanel extends BaseView {

	public num0: eui.Label;
	public num1: eui.Label;
	public buy1: eui.Button;
	public buy10: eui.Button;
	public outBag: eui.Button;
	public list1: eui.List;
	public redPoint2: eui.Image;

	private btnGroup: eui.Group;
	private eff: MovieClip;

	private redPoint0: eui.Image;
	private outBag0: eui.Button;
	// private boxsEff:MovieClip[];
	private boxcount: eui.Label;
	private runel1: eui.Label;
	private runel2: eui.Label;
	private runey1: eui.Image;
	private runey2: eui.Image;
	public runey1l: eui.Label;
	public runey2l: eui.Label;
	private leftTime: eui.Label;
	private endedTime: number;
	private hope: eui.Label;
	private hopeValue: eui.BitmapLabel;
	private maxHopeValue: eui.Image;
	private times: eui.BitmapLabel;
	constructor() {
		super();
		// this.skinName = "TreasureRune";
		this.name = "符文";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init() {
		this.updateDescEx();

		let config: FuwenTreasureLevelConfig[] = GlobalConfig.FuwenTreasureLevelConfig;
		let lv: number = SkyLevelModel.ins().cruLevel;
		let useCfg: FuwenTreasureLevelConfig = null;
		for (let str in config) {
			let cfg: FuwenTreasureLevelConfig = config[str];
			if (lv >= cfg.level && lv <= cfg.levelend) {
				useCfg = cfg;
			}
		}
		this.list1.itemRenderer = ItemBase;
		// useCfg.showicon.sort(this.sortFunc);
		this.list1.dataProvider = new eui.ArrayCollection(useCfg.showicon);

		this.eff = new MovieClip;
		this.eff.x = 52;
		this.eff.y = 24;
		this.eff.scaleX = 1.11;
		this.eff.scaleY = 1.11;
		this.eff.touchEnabled = false;

		// this.boxsEff = [];
		// for( let i=0;i < 4;i++ ){
		// 	let ef = new MovieClip();
		// 	this.boxsEff.push(ef);
		// }

		this.open();
	}
	private sortFunc(a: RewardData, b: RewardData): number {
		let rune1: ItemConfig = GlobalConfig.ItemConfig[a.id];
		let rune2: ItemConfig = GlobalConfig.ItemConfig[b.id];
		let r1: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(rune1)];
		let r2: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(rune2)];
		if (r1.type < r2.type)
			return -1;
		else
			return 1;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.buy1, this.onBuy);
		this.addTouchEvent(this.buy10, this.onBuy);
		this.addTouchEvent(this.outBag, this.onBuy);
		this.addTouchEvent(this.outBag0, this.onBuy);
		this.observe(Rune.ins().postHuntRuneInfo, this.callRuneResult);

		for (let i = 0; i < Rune.BoxSum; i++) {
			this.addTouchEvent(this["box" + i], this.onTab);
		}

		this.observe(UserBag.ins().postHuntStore, this.setRedStatu);
		this.observe(Rune.ins().postRuneBoxGift, this.callback);

		Hunt.ins().sendHuntList();
		this.setRedStatu();
		this.setBoxData();

		//去掉特效和框
		for (let i: number = 0; i < this.list1.numElements; i++) {
			let item: ItemBase = (this.list1.getElementAt(i) as ItemBase);
			if (item) {
				item.clearEffect();
				item.HideImgBg();
			}
		}

		// this.leftTime.visible = true;
		let leftDate = DateUtils.calcWeekFirstDay();
		this.endedTime = leftDate.getTime() / 1000;
		TimerManager.ins().remove(this.timeClock, this);
		TimerManager.ins().doTimer(1000, 0, this.timeClock, this);
	}


	public close(...param: any[]): void {
		this.removeTouchEvent(this.buy1, this.onBuy);
		this.removeTouchEvent(this.buy10, this.onBuy);
		this.removeTouchEvent(this.outBag, this.onBuy);
		DisplayUtils.removeFromParent(this.eff);
		// for( let i=0;i < this.boxsEff.length;i++ ){
		// 	DisplayUtils.removeFromParent(this.boxsEff[i]);
		// }
		for (let i = 0; i < Rune.BoxSum; i++) {
			this.removeTouchEvent(this["box" + i], this.onTab);
		}
		this.removeObserve();
		TimerManager.ins().remove(this.timeClock, this);
	}
	//倒计时
	private timeClock() {
		this.endedTime -= 1;
		if (this.endedTime <= 0) {
			let leftDate = DateUtils.calcWeekFirstDay();
			this.endedTime = leftDate.getTime() / 1000;
		}
		this.leftTime.text = `累计重置剩余时间：` + DateUtils.getFormatBySecond(this.endedTime, DateUtils.TIME_FORMAT_5, 4);
	}

	private setRedStatu(): void {
		let boo: boolean = Boolean(UserBag.ins().getHuntGoods(1).length);
		if (boo) {
			this.outBag.parent.addChildAt(this.eff, this.getChildIndex(this.outBag));
			this.eff.playFile(RES_DIR_EFF + "chargeff2", -1);
		} else {
			DisplayUtils.removeFromParent(this.eff);
		}
		this.redPoint2.visible = boo;
		this.redPoint0.visible = RuneRedPointMgr.ins().checkCanExchange();
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
				ViewManager.ins().open(TreasureStorePanel, DepotType.Rune);
				break;
			case this.outBag0:
				// ViewManager.ins().open(RuneWin, 0,2);
				ViewManager.ins().open(RuneExchangeShopWin);
				break;
			default:
				break;
		}
	}
	private boxId: number;
	private onTab(e: egret.TouchEvent) {
		for (let i = 0; i < Rune.BoxSum; i++) {
			if (e.target == this["box" + i]) {
				if (Rune.ins().boxs[i] == Rune.UNGET) {
					ViewManager.ins().open(HuntBoxsTips, i + 1);
					break;
				} else if (Rune.ins().boxs[i] == Rune.ISNGET) {
					ViewManager.ins().open(HuntBoxsTips, i + 1);
					break;
				}
				this.boxId = i + 1;
				Rune.ins().sendRuneBoxGift(i + 1);
				break;
			}
		}
	}
	private buyHunt(type: number): void {
		//寻10次(扣除现有寻宝图数 即有几张图寻几次)
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.FuwenTreasureConfig.huntItem);
		if (item) {
			Rune.ins().sendHuntRune(type);
			return;
		}
		let huntOnce: number = type == 0 ? GlobalConfig.FuwenTreasureConfig.huntOnce : GlobalConfig.FuwenTreasureConfig.huntTenth;
		let yb: number = Actor.yb;
		if (yb >= huntOnce) {
			Rune.ins().sendHuntRune(type);
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}
	}
	private callback() {
		if (this.boxId) {
			let cfg: FuwenTreasureRewardConfig = GlobalConfig.FuwenTreasureRewardConfig[this.boxId];
			if (cfg)
				for (let i = 0; i < cfg.reward.length; i++) {
					UserTips.ins().showTips(`|C:0xff00ff&T:获得符文碎片X${cfg.reward[i].count}`);
				}
			this.boxId = 0;
		}
		this.setBoxData();
	}
	private setBoxData() {
		//设置次数
		// this.boxcount.text = `已累积${Rune.ins().runeCount}次`;
		this.times.text = Rune.ins().runeCount + "";
		for (let i = 0; i < Rune.BoxSum; i++) {
			let config: FuwenTreasureRewardConfig = GlobalConfig.FuwenTreasureRewardConfig[i + 1];
			let count: number = config.needTime ? config.needTime : 0;
			//根据宝箱状态设置对应效果
			//200116_png  200116_0_png
			switch (Rune.ins().boxs[i]) {
				case Rune.UNGET:
					this["time" + i].text = count + "次";
					this["time" + i].visible = true;
					this["done" + i].visible = !this["time" + i].visible;
					this["box" + i].source = "200116_0_png";
					this["boxPoint" + i].visible = false;
					break;
				case Rune.CANGET:
					this["time" + i].text = count + "次";
					this["time" + i].visible = false;
					this["done" + i].visible = !this["time" + i].visible;
					this["done" + i].text = "可领取";
					this["box" + i].source = "200116_png";
					this["boxPoint" + i].visible = true;
					break;
				case Rune.ISNGET:
					this["time" + i].text = count + "次";
					this["time" + i].visible = false;
					this["done" + i].visible = !this["time" + i].visible;
					this["done" + i].text = "已领取";
					this["box" + i].source = "200116_0_png";
					this["boxPoint" + i].visible = false;
					break;
			}
		}
	}

	private callRuneResult() {
		this.updateDescEx();
	}
	private updateDesc() {
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.FuwenTreasureConfig.huntItem);
		if (item) {
			this.runey1.visible = this.runey2.visible = false;
			this.runel1.visible = this.runel2.visible = true;
			this.num1.visible = this.num0.visible = true;
			this.runey1l.visible = this.runey2l.visible = false;
			this.num1.text = "1";
			this.num0.text = "10";
			// this.num1.x = this.runel1.x + this.runel1.width;
			// this.num10.x = this.runel2.x + this.runel2.width;
		} else {
			this.runey1.visible = this.runey2.visible = true;
			this.runel1.visible = this.runel2.visible = false;
			this.num1.visible = this.num0.visible = false;
			this.runey1l.visible = this.runey2l.visible = true;
			this.runey1l.text = GlobalConfig.FuwenTreasureConfig.huntOnce + "";
			this.runey2l.text = GlobalConfig.FuwenTreasureConfig.huntTenth + "";
		}
		// this.hope.text = `${Rune.ins().hope}/${GlobalConfig.FuwenTreasureConfig.maxBlissVal}`;

	}
	private zw1: eui.Label;
	private zw10: eui.Label;
	private updateDescEx() {
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.FuwenTreasureConfig.huntItem);
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
		this.zw1.text = GlobalConfig.FuwenTreasureConfig.huntOnce + "";
		this.zw10.text = GlobalConfig.FuwenTreasureConfig.huntTenth + "";
		this.hopeValue.text = Rune.ins().hope + "";

		this.maskImage();
	}
	private masksp: egret.Sprite;
	private maskImage() {
		let curPross = Rune.ins().hope;
		let maxPross = GlobalConfig.FuwenTreasureConfig.maxBlissVal;

		let percent = Math.floor(0.0096 * Math.pow(curPross, 0.6719) * maxPross) / maxPross;//显示百分比
		// let percent:number = curPross/maxPross;
		percent = percent < 1 ? percent : 1;

		if (percent >= 1) {
			DisplayUtils.removeFromParent(this.masksp);
			this.masksp = null;
			return;
		}

		let imgHeight = 118;

		if (!this.masksp) {
			this.masksp = new egret.Sprite();
			let square: egret.Shape = new egret.Shape();
			square.graphics.beginFill(0xffff00);
			square.graphics.drawRect(this.maxHopeValue.x, this.maxHopeValue.y, 90, imgHeight);
			square.graphics.endFill();
			this.masksp.addChild(square);
			this.maxHopeValue.parent.addChild(this.masksp);
			this.maxHopeValue.mask = this.masksp;
		}
		this.masksp.y = imgHeight * (1 - percent);
	}
}
