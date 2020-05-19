/**
 * 新装备穿戴提示
 *
 */
class NewEquipWin extends BaseView {

	private equipName: eui.Label;//装备名字
	private powerLabel: eui.Label;//装备战斗力
	private powerCount: eui.Label;//装备战斗力数值

	private equip: ItemBase;
	private go: eui.Button;

	private time: number;

	constructor() {
		super();
		this.skinName = "newEquipSkin";


	}

	public close(...param: any[]): void {

		this.removeTouchEvent(this.go, this.onEvent);
		this.removeObserve();
		TimerManager.ins().remove(this.updateTime, this);
		egret.Tween.removeTweens(this);
		egret.Tween.get(this).to({ right: -this.width }, 200).call(
			() => {
				this.itemdata = null;
				if (NewEquip.ins().equipsList.length) {
					this.open();
				} else {
					this.visible = false
				}
			},
			false);
	}

	public open(...param: any[]): void {
		if (!NewEquip.ins().equipsList.length || this.itemdata) return;

		this.time = 5;
		this.itemdata = NewEquip.ins().equipsList.shift();
		TimerManager.ins().doTimer(1000, this.time, this.updateTime, this, this.sendWear, this);
		this.go.label = `装备(${this.time})`;
		this.init();
		this.addTouchEvent(this.go, this.onEvent);

		this.visible = true;
		egret.Tween.removeTweens(this);
		this.right = -this.width;
		egret.Tween.get(this).to({ right: 6 }, 400)
		// this.observe(UserEquip.ins().postEquipChange, this.callBack);//装备穿戴返回
		// if (NewEquip.ins().check()) {
		// 	if (!TimerManager.ins().isExists(this.updateTime, this)) {
		// 		this.tick = this.time;
		// 		
		// 		this.visible = true;
		// 		egret.Tween.removeTweens(this);
		// 		this.right = -this.width;
		// 		egret.Tween.get(this).to({ right: 6 }, 400)
		// 		this.init();
		// 	}
		// }
	}
	private updateTime() {
		this.go.label = `装备(${this.time})`;
		this.time--;
		// this.visible = true;
	}
	/**穿戴返回*/
	public callBack() {
		//头装备已传戴成功
		// NewEquip.ins().equipsList.shift();
		// if(NewEquip.ins().equipsList.length == 0)
		// 	this.close();
		// this.tick = this.time;
	}
	private itemdata: ItemData;
	public init() {
		if (this.itemdata && this.itemdata.itemConfig) {
			this.equip.data = this.itemdata._configID;
			this.equip.isShowName(false);
			this.equipName.text = this.itemdata.itemConfig.name;
			this.equipName.textColor = ItemConfig.getQualityColor(this.itemdata.itemConfig);
			this.powerCount.text = this.itemdata.point + "";//UserBag.getAttrPower(this.itemdata.att) + "";

		}
	}
	public onEvent(e: egret.TouchEvent) {
		switch (e.target) {
			case this.go:
				this.sendWear();
				break;
		}
	}
	private sendWear() {
		this.close();
		if (this.itemdata) {
			let pos: number = ItemConfig.getSubType(this.itemdata.itemConfig);
			UserEquip.ins().sendWearEquipment(this.itemdata.handle, pos, 0);
		}
	}

}