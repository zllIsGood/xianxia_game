/**
 *
 * @author
 *
 */
class TipsView extends BaseEuiView {
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.touchChildren = false;
		this.touchEnabled = false;

		this.equipTip1 = new TipsGoodEquip();

		this.rewardTip = new TipsGoodReward();

		this.skillTip1 = new TipsSkillAlertPanel();

		this.equipTip = new TipsEquipAlertPanel();

		this.boxTip = new BoxGetHintTips();

	}

	private labCount: number = 0;

	private list: TipsItem[] = [];

	private listCenter: TipsItem[] = [];

	private centerList: CenterTipsItem[] = [];

	private sceneList: SceneTipsItem[] = [];

	private attrList: AttriteChangeView[] = [];

	private everList: EverTipsItem[] = [];

	private hintList: HintTipsItem[] = [];

	public open(...param: any[]): void {
		this.observe(Actor.ins().postExp, this.showExp);
	}

	private showExp(exp: number) {
		if (!exp) return;
		this.showTips(`|C:0x23CA23&T:经验 +${exp}|`);
	}

	/**
	 * 显示图片提示
	 * @param str
	 */
	public showHintTips(pic: string): void {
		let oldHints = this.hintList[0];
		if (oldHints && oldHints.getTips() == pic) return;
		let tips: HintTipsItem = ObjectPool.pop("HintTipsItem");
		tips.verticalCenter = 157;
		tips.horizontalCenter = 0;
		tips.setTips(pic);
		this.addChild(tips);
		this.hintList.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeHintTip, this);
		for (let i: number = this.hintList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.hintList[i]);
			let t: egret.Tween = egret.Tween.get(this.hintList[i]);
			t.to({ "verticalCenter": 157 + i * -30 }, 300);
		}
	}

	private removeHintTip(e: egret.Event): void {
		let index: number = this.hintList.indexOf(e.currentTarget);
		this.hintList.splice(index, 1);
		egret.Tween.removeTweens(e.currentTarget);
		e.currentTarget.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeHintTip, this);
		ObjectPool.push(e.currentTarget);
	}

	/**
	 * 显示任意位置tips
	 * @param str
	 */
	public showEverTips(para: any): void {
		let tips: EverTipsItem = ObjectPool.pop("EverTipsItem");
		tips.x = para.x;
		tips.y = para.y;
		tips.labelText = para.str;
		this.addChild(tips);
		this.everList.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeEverTip, this);
		for (let i: number = this.everList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.everList[i]);
			let t: egret.Tween = egret.Tween.get(this.everList[i]);
			t.to({ "y": tips.y - (i * 30) }, 300);
		}
	}

	private removeEverTip(e: egret.Event): void {
		let index: number = this.everList.indexOf(e.currentTarget);
		this.everList.splice(index, 1);
		egret.Tween.removeTweens(e.currentTarget);
		e.currentTarget.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeEverTip, this);
		ObjectPool.push(e.currentTarget);
	}


	/**
	 * 显示tips
	 * @param str
	 */
	public showAttrTips(para: any): void {
		// return;
		let tips: AttriteChangeView = ObjectPool.pop("AttriteChangeView");
		tips.left = 30;
		tips.bottom = 190;
		tips.setLabelText(para[0], para[1]);
		this.addChild(tips);
		this.attrList.unshift(tips);
		tips.once(egret.Event.REMOVED_FROM_STAGE, this.removeAttrTip, this);
		for (let i: number = this.attrList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.attrList[i]);
			let t: egret.Tween = egret.Tween.get(this.attrList[i]);
			t.to({ "bottom": 190 + (i * 40) }, 300);
		}
	}

	private removeAttrTip(e: egret.Event): void {
		let index: number = this.attrList.indexOf(e.currentTarget);
		this.attrList.splice(index, 1);
		egret.Tween.removeTweens(e.currentTarget);
		ObjectPool.push(e.currentTarget);
	}

	/**
	 * 显示tips
	 * @param str
	 */
	public showCenterTips(str: string): void {
		let tips: CenterTipsItem = ObjectPool.pop("CenterTipsItem");
		tips.verticalCenter = 0;
		tips.horizontalCenter = 0;
		tips.labelText = str;
		this.addChild(tips);
		this.centerList.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeCenterTip, this);
		for (let i: number = this.centerList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.centerList[i]);
			let t: egret.Tween = egret.Tween.get(this.centerList[i]);
			t.to({ "verticalCenter": 0 + i * -30 }, 500);
		}
	}

	private removeCenterTip(e: egret.Event): void {
		let tips = e.currentTarget;
		let index: number = this.centerList.indexOf(tips);
		this.centerList.splice(index, 1);
		tips.horizontalCenter = NaN;
		tips.verticalCenter = NaN;
		egret.Tween.removeTweens(tips);
		tips.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeCenterTip, this);
		ObjectPool.push(tips);
	}

	/**
	 * 居中显示向上飘tips
	 * @param str
	 */
	public showCenterTips2(str: string): void {
		let tips: CenterTipsItem = ObjectPool.pop("CenterTipsItem");
		tips.horizontalCenter = 0;
		tips.verticalCenter = -60;
		this.addChild(tips);
		tips.labelText2 = str;
		this.centerList.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeCenterTip2, this);
		for (let i: number = this.centerList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.centerList[i]);
			let t: egret.Tween = egret.Tween.get(this.centerList[i]);
			t.to({ "verticalCenter": -120 - (i * 30) }, 300);
		}
	}

	private removeCenterTip2(e: egret.Event): void {
		let tips = e.currentTarget;
		tips.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeCenterTip2, this);
		tips.horizontalCenter = NaN;
		tips.verticalCenter = NaN;
		let index: number = this.centerList.indexOf(tips);
		this.centerList.splice(index, 1);
	}


	/**
	 * 显示tips
	 * @param str
	 */
	public showSceneTips(str: string): void {
		let tips: SceneTipsItem = ObjectPool.pop("SceneTipsItem");
		tips.verticalCenter = -175;
		tips.horizontalCenter = 0;
		tips.labelText = str;
		this.addChild(tips);
		this.sceneList.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeSceneTip, this);
		for (let i: number = this.sceneList.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.sceneList[i]);
			let t: egret.Tween = egret.Tween.get(this.sceneList[i]);
			t.to({ "verticalCenter": -175 + i * -30 }, 500);
		}
	}

	private removeSceneTip(e: egret.Event): void {
		let index: number = this.sceneList.indexOf(e.currentTarget);
		this.sceneList.splice(index, 1);
		egret.Tween.removeTweens(e.currentTarget);
		e.currentTarget.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeSceneTip, this);
		ObjectPool.push(e.currentTarget);
	}

	/**
	 * 显示tips
	 * @param str
	 */
	public showTips(str: string): void {
		let tips: TipsItem = ObjectPool.pop("TipsItem");
		tips.left = 0;
		tips.bottom = 190;
		this.addChild(tips);
		tips.labelText = str;
		this.list.unshift(tips);
		tips.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeTipsItem, this);
		for (let i: number = this.list.length - 1; i >= 0; i--) {
			egret.Tween.removeTweens(this.list[i]);
			let t: egret.Tween = egret.Tween.get(this.list[i]);
			t.to({ "bottom": 190 + (i * 30) }, 300);
		}
	}

	private removeTipsItem(e: egret.Event): void {
		let tips = e.currentTarget;
		tips.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeTipsItem, this);
		tips.left = NaN;
		tips.bottom = NaN;
		let index: number = this.list.indexOf(tips);
		this.list.splice(index, 1);
		ObjectPool.push(tips);
	}

	private goodEquipList: any[] = [];
	private equipTip1: TipsGoodEquip;
	private boxTip: BoxGetHintTips;
	private isWait: boolean;

	private skillTipList: any[] = [];
	private skillTip1: TipsSkillAlertPanel;

	private equipItemList: any[] = [];
	private equipTip: TipsEquipAlertPanel;

	private rewardTipList: any[] = [];
	private rewardTip: TipsGoodReward;

	public showGoodEquipTip(item: ItemData) {
		this.goodEquipList.push(item);

		if (TimerManager.ins().isExists(this.goodEquipTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.goodEquipTimer, this);
		}
	}

	public showGoodRewardTip(item: RewardData) {
		this.rewardTipList.push(item);

		if (TimerManager.ins().isExists(this.goodRewardTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.goodRewardTimer, this);
		}
	}

	public showBoxTip(id: number) {
		let conf = GlobalConfig.TreasureBoxConfig[id];
		this.goodEquipList.push(conf);

		if (TimerManager.ins().isExists(this.goodEquipTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.goodEquipTimer, this);
		}
	}

	private goodRewardTimer() {
		if (this.rewardTipList.length == 0) {
			TimerManager.ins().remove(this.goodEquipTimer, this);
			return;
		}

		if (this.isWait) {
			return;
		}

		let equipTip: TipsGoodReward;
		if (!this.rewardTip.isUsing) {
			equipTip = this.rewardTip;
		}

		if (!equipTip) {
			return;
		}

		equipTip.x = 50;
		equipTip.y = 750;
		equipTip.alpha = 1;
		if (!equipTip.parent) this.addChild(equipTip);
		equipTip.isUsing = true;
		this.isWait = true;
		equipTip.data = this.rewardTipList.pop();

		let t: egret.Tween = egret.Tween.get(equipTip);
		t.to({"y": 600}, 300).wait(1000).to({"alpha": 0}, 1000).call(() => {
			equipTip.isUsing = false;
			this.isWait = false;
			egret.Tween.removeTweens(equipTip);
			this.removeChild(equipTip);
		});
	}

	private goodEquipTimer() {
		if (this.goodEquipList.length == 0) {
			TimerManager.ins().remove(this.goodEquipTimer, this);
			return;
		}

		if (this.isWait) {
			return;
		}

		let equipTip: TipsGoodEquip;
		if (!this.equipTip1.isUsing) {
			equipTip = this.equipTip1;
		}

		if (!equipTip) {
			return;
		}

		equipTip.x = 50;
		equipTip.y = 750;
		equipTip.alpha = 1;
		if (!equipTip.parent) this.addChild(equipTip);
		equipTip.isUsing = true;
		this.isWait = true;
		equipTip.data = this.goodEquipList.pop();

		let t: egret.Tween = egret.Tween.get(equipTip);
		t.to({ "y": 600 }, 300).wait(1000).to({ "alpha": 0 }, 1000).call(() => {
			equipTip.isUsing = false;
			this.isWait = false;
			egret.Tween.removeTweens(equipTip);
			this.removeChild(equipTip);
		});
	}

	public showRewardBox(type: number): void {
		let conf = GlobalConfig.TreasureBoxConfig[type];
		this.goodEquipList.push(conf);
		if (TimerManager.ins().isExists(this.goodEquipTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.goodEquipTimer, this);
		}
	}

	public showSkillTip(item: number) {
		this.skillTipList.push(item);

		if (TimerManager.ins().isExists(this.skillTipTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.skillTipTimer, this);
		}
	}

	private skillTipTimer() {
		if (this.skillTipList.length == 0) {
			TimerManager.ins().remove(this.skillTipTimer, this);
			return;
		}

		if (this.isWait) {
			return;
		}

		let skillTip: TipsSkillAlertPanel;
		if (!this.skillTip1.isUsing) {
			skillTip = this.skillTip1;
		}

		if (!skillTip) {
			return;
		}

		skillTip.x = 50;
		skillTip.y = 750;
		skillTip.alpha = 1;
		this.addChild(skillTip);
		skillTip.isUsing = true;
		this.isWait = true;
		skillTip.data = this.skillTipList.pop();

		let t: egret.Tween = egret.Tween.get(skillTip);
		t.to({ "y": 600 }, 300).wait(1000).to({ "alpha": 0 }, 1000).call(() => {
			skillTip.isUsing = false;
			this.isWait = false;
			egret.Tween.removeTweens(skillTip);
			this.removeChild(skillTip);
		});
	}

	public showItemTip(item: number) {
		this.equipItemList.push(item);
		if (TimerManager.ins().isExists(this.itemTipTimer, this)) {

		} else {
			TimerManager.ins().doTimer(16, 0, this.itemTipTimer, this);
		}
	}

	private itemTipTimer() {
		if (this.equipItemList.length == 0) {
			TimerManager.ins().remove(this.itemTipTimer, this);
			return;
		}

		if (this.isWait) {
			return;
		}

		let itemTip: TipsEquipAlertPanel;
		if (!this.equipTip.isUsing) {
			itemTip = this.equipTip;
		}

		if (!itemTip) {
			return;
		}

		itemTip.x = 50;
		itemTip.y = 750;
		itemTip.alpha = 1;
		this.addChild(itemTip);
		itemTip.isUsing = true;
		this.isWait = true;
		itemTip.data = this.equipItemList.pop();
		let t: egret.Tween = egret.Tween.get(itemTip);
		t.to({ "y": 600 }, 300).wait(1000).to({ "alpha": 0 }, 1000).call(() => {
			itemTip.isUsing = false;
			this.isWait = false;
			egret.Tween.removeTweens(itemTip);
			this.removeChild(itemTip);
		});
	}
}

ViewManager.ins().reg(TipsView, LayerManager.UI_Tips);
