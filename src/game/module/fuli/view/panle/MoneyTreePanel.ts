class MoneyTreePanel extends BaseView {

	public goUpBtn: eui.Button;
	// public depictLabel1: eui.Label;
	// public bar: eui.ProgressBar;
	// public cost: PriceIcon;
	public image1: eui.Image;
	public image3: eui.Image;
	public image2: eui.Image;
	// public image_1: eui.Image;
	// public image_3: eui.Image;
	// public image_2: eui.Image;
	public zhezhao: eui.Image;
	// public getNum: eui.Label;
	// public playNum: eui.Label;
	// public addPoint: eui.Label;
	// public add: eui.Label;
	// public depictLabel2: eui.Label;

	private mc1: MovieClip;
	private mc2: MovieClip;
	private mc3: MovieClip;

	public descBtn: eui.Image;

	private expMc: MovieClip;
	private posY: number = 180;
	// private rect: egret.Rectangle;

	private baojiMc: MovieClip;
	private movieExp: MovieClip;
	private costNum: number;
	private static MAXNUMBER: number = 50; //策划说固定显示50，不要问我为什么
	constructor() {
		super();
		this.skinName = "MoneyTreeSkin";

		this.mc1 = new MovieClip;
		this.mc1.x = 140;
		this.mc1.y = 46;
		// this.mc1.x = 347;
		// this.mc1.y = 150;

		this.mc2 = new MovieClip;
		this.mc2.x = 222;
		this.mc2.y = 46;

		this.mc3 = new MovieClip;
		this.mc3.x = 370;
		this.mc3.y = 46;

		this.expMc = new MovieClip();
		this.expMc.x = 376;
		this.expMc.y = this.posY;
		// this.rect = new egret.Rectangle(-35, 0, 70, 60);
		this.addChildAt(this.expMc, 3);

		this.baojiMc = new MovieClip();
		this.baojiMc.x = 207;
		this.baojiMc.y = 270;

		this.movieExp = new MovieClip();

		// this.depictLabel2.textFlow = new egret.HtmlTextParser().parser("<font color = '#23C42A'><u>提升VIP</u></font>");

		// this.bar.slideDuration = 0;
		// this.bar.maximum = MoneyTreePanel.MAXNUMBER;
	}

	public open(...param: any[]): void {
		this.observe(Notice.ins().postGameNotice, this.refushInfo);
		this.observe(UserFuLi.ins().postMoneyInfoChange, this.refushInfo);
		this.addTouchEvent(this.goUpBtn, this.onTap);
		this.addTouchEvent(this.image1, this.onTap);
		this.addTouchEvent(this.image2, this.onTap);
		this.addTouchEvent(this.image3, this.onTap);
		// this.addTouchEvent(this.depictLabel2, this.onTap);
		this.addTouchEvent(this.descBtn, this.onTap);
		this.addTouchEvent(this.expMc, this.onTap);
		this.refushInfo([true]);
		this.expMc.playFile(RES_DIR_EFF + "moneytreebar");
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.goUpBtn, this.onTap);
		this.removeTouchEvent(this.image1, this.onTap);
		this.removeTouchEvent(this.image2, this.onTap);
		this.removeTouchEvent(this.image3, this.onTap);
		// this.removeTouchEvent(this.depictLabel2, this.onTap);
		this.removeTouchEvent(this.descBtn, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.goUpBtn:
				//摇一摇
				if (UserFuLi.ins().playNum >= UserFuLi.ins().cruMaxNum) {
					if (UserVip.ins().lv >= 10) {
						UserTips.ins().showTips("|C:0xf3311e&T:今日次数已用完|");
					} else {
						UserTips.ins().showTips("|C:0xf3311e&T:提高vip等级，获得更多次数|");
					}
					return;
				}
				if (Actor.yb >= this.costNum) {
					UserFuLi.ins().sendPlayYaoYao();
					return;
				}
				UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
				break;
			case this.image1:
				ViewManager.ins().open(MoneyTreeBoxWin, 1);
				break;
			case this.image2:
				ViewManager.ins().open(MoneyTreeBoxWin, 2);
				break;
			case this.image3:
				ViewManager.ins().open(MoneyTreeBoxWin, 3);
				break;
			// case this.depictLabel2:
			// 	ViewManager.ins().open(VipWin);
			// 	break;
			case this.descBtn:
				ViewManager.ins().open(ZsBossRuleSpeak, 6);
				break;
			case this.expMc:
				ViewManager.ins().open(ZsBossRuleSpeak, 6);
				break;
		}
	}

	// private baojiInfo(list:any[])
	// {
	// 	this.refushInfo(list[0],list[1])
	// }

	private refushInfo(...param: any[]): void {
		let boo: boolean = false;
		let baoji: number = 0;
		let model: UserFuLi = UserFuLi.ins();
		let info: any = model.getIndexCost();
		let nowAdd: any = model.getNowCoefficientinfo();
		let nextAdd: any = model.getNowCoefficientinfo(1);
		// if(this.bar.maximum!=model.maxNum)
		// this.bar.maximum = MoneyTreePanel.MAXNUMBER;
		if (param && param[0]) {
			if (param[0][0]) boo = param[0][0];
			if (param[0][1]) baoji = param[0][1];
		}

		if (model.playNum == model.maxNum) {
			// this.depictLabel1.visible = false;
			// this.playNum.visible = false;
			// this.cost.visible = false;
			// this.getNum.text = "今日次数已全部用完";
		} else {
			// this.depictLabel1.visible = true;
			// this.playNum.visible = true;
			// this.cost.visible = true;
			// this.playNum.text = "（今日使用：" + model.playNum + "/" + model.maxNum + "）";
			this.costNum = info.yuanbao;
			// this.cost.setText(info.yuanbao + "");
			// this.getNum.textFlow = new egret.HtmlTextParser().parser("立即获得<font color = '#FFB82A'>" + CommonUtils.overLength(Math.floor(info.gold * nowAdd.rate / 100)) + "</font><font color = '#35e62d'>(+" + (nowAdd.rate - 100) + "%)</font>金币");
		}
		// this.add.text = "加成：" + (nowAdd.rate - 100) + "%";
		// this.bar.value = model.boxOn > 50 ? 50 : model.boxOn;
		// debug.log("max:"+model.maxNum+"    On:"+model.boxOn+"    asdasdadasd:"+this.bar.maximum)
		if (!boo)
			this.moveExpMc();
		let value: number = 0;
		if (nextAdd == null) {
			// this.addPoint.text = "已满级";
		} else {
			// this.addPoint.text = model.exp + "/" + nextAdd.needExp;
			value = 60 * (1 / -2 + 1 - (model.exp / nextAdd.needExp));
		}
		// this.rect.y = value;
		// this.expMc.mask = this.rect;

		this.refushBoxInfo();

		if (baoji > 1) {
			this.baojiMc.playFile(RES_DIR_EFF + "moneytreecrit", 1);
			this.addChild(this.baojiMc);
		}
	}

	private moveExpMc(): void {
		this.movieExp.x = 189;
		this.movieExp.y = 257;
		this.movieExp.playFile(RES_DIR_EFF + "moneytreeexp", 1);
		this.addChild(this.movieExp);
		let t: egret.Tween = egret.Tween.get(this.movieExp);
		t.to({ "y": 180, "x": 376 }, 420);
	}

	private refushBoxInfo(): void {
		let model: UserFuLi = UserFuLi.ins();
		// this.image_1.visible = model.getOrderByIndex(0) >= 1;
		// this.image_2.visible = model.getOrderByIndex(1) >= 1;
		// this.image_3.visible = model.getOrderByIndex(2) >= 1;
		for (let i: number = 1; i < 4; i++) {
			let mc: MovieClip = this["mc" + i];
			if (model.checkBoxIsCanget(i)) {
				this.playEffect(mc);
			} else {
				if (mc.parent) {
					DisplayUtils.removeFromParent(mc);
				}
			}
		}
	}

	/**
	 * 提升后的回调
	 */
	private playEffect(mc: MovieClip): void {
		mc.playFile(RES_DIR_EFF + "taskBox", 100);//待后续改变
		this.addChild(mc);
	}
}