/**
 *双12充值
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveRechargeWin extends BaseEuiView {

	public bg: eui.Image;
	public title: eui.Image;
	public rechargeCount: eui.BitmapLabel;
	public list: eui.List;
	public btn: eui.Group;
	public rechargeBtn: eui.Button;
	public recharge: eui.Label;
	public get: eui.Label;
	public limitTime: eui.Label;
	public first: eui.Group;
	public count0: eui.BitmapLabel;
	public unit0: eui.Image;
	public second: eui.Group;
	public count1: eui.BitmapLabel;
	public unit1: eui.Image;
	public third: eui.Group;
	public count2: eui.BitmapLabel;
	public unit2: eui.Image;
	public select0: eui.Image;
	public select1: eui.Image;
	public select2: eui.Image;
	public closeBtn: eui.Button;
	public chooseBtn0: eui.Button;
	public chooseBtn1: eui.Button;
	public chooseBtn2: eui.Button;
	public bgClose:eui.Rect;

	public idAry: number[];
	public selectIndex: number;

	constructor() {
		super();
		this.skinName = "DTRechargeSkin";
		this.isTopLevel = true;
	}

	public open(...args: any[]): void {
		this.list.itemRenderer = DoubleTwelveRechargeItem;
		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.addTouchEvent(this.bgClose, this.closeWin);
		this.addTouchEvent(this.chooseBtn0, this.onSelect);
		this.addTouchEvent(this.chooseBtn1, this.onSelect);
		this.addTouchEvent(this.chooseBtn2, this.onSelect);
		this.addTouchEvent(this.rechargeBtn, this.onRecharge);

		this.observe(Recharge.ins().postUpdateRecharge, this.updateView);
		this.observe(Recharge.ins().postUpdateRechargeEx, this.updateView);
		this.observe(Activity.ins().postChangePage, this.updateView);
		this.observe(Activity.ins().postRewardResult,this.updateView);
		this.observe(Activity.ins().postActivityIsGetAwards,this.updateView);
		TimerManager.ins().doNext(()=>{this.updateView();}, this);
	}

	private onRecharge(e: egret.TouchEvent): void
	{
		let id = this.idAry[this.selectIndex];
		if(this.recharge.visible)//充值
		{
			let cfg: ActivityType3Config = GlobalConfig.ActivityType3Config[id][1];
			let val = cfg.val;
			val = Math.floor(val/100);
			ViewManager.ins().open(ChargeFirstWin);
		}
		else //领取奖励
		{
			Activity.ins().sendReward(id, 1);
		}
	}

	private updateView(): void {
		this.idAry = Activity.ins().doubleTwelveRechargeIDAry;
		let data: ActivityType3Data = Activity.ins().doubleTwelveRechargeData[this.idAry[0]] as ActivityType3Data;
		let time = data.getLeftTime();
		let timedesc = Math.floor(time * 1000 / DateUtils.MS_PER_DAY);
		let desc;
		if(timedesc == 0){
		    timedesc = Math.floor(time * 1000 / (DateUtils.MS_PER_DAY/24));
			desc = `${timedesc}小时`;
		}
		else
		{
			desc = `${timedesc}天`;
		}
		this.limitTime.text = `距离活动结束仅剩${desc}`;
		for (let i = 0; i < 3; i++) {
			this.setText(i);
		}
		if(this.selectIndex){
			this.selectActivity(this.selectIndex);
		}
		else
		{
			this.selectActivity(0);
		}
	}

	private selectBtn(index: number): void {
		this.select0.visible = false;
		this.select1.visible = false;
		this.select2.visible = false;
		this[`select${index}`].visible = true;
	}

	private selectActivity(index: number): void {
		this.selectIndex = index;
		let activityId = this.idAry[index];
		let data: ActivityType3Data = Activity.ins().doubleTwelveRechargeData[activityId] as ActivityType3Data;
		let needMoney = DoubleTwelveModel.ins().getNeedRecharge(activityId);
		this.rechargeCount.text = needMoney.toString();
		if (data.recrod > 0) {
			this.btn.visible = false;
		}
		else {
			this.btn.visible = true;
			if (needMoney > 0) {
				this.recharge.visible = true;
				this.get.visible = false;
			}
			else {
				this.recharge.visible = false;
				this.get.visible = true;
			}
		}

		let cfg: ActivityType3Config = GlobalConfig.ActivityType3Config[activityId][1];
		this.list.dataProvider = new ArrayCollection(cfg.rewards);

		this.selectBtn(index);
	}

	private setText(index: number): void {
		let id = this.idAry[index];
		let cfg: ActivityType3Config = GlobalConfig.ActivityType3Config[id][1];
		let val = cfg.val;
		if (index == 0) {
			val = Math.floor(val / 1000);
		}
		else {
			val = Math.floor(val / 10000);;
		}
		this[`count${index}`].text = val.toString();
	}

	private onSelect(e: egret.TouchEvent): void {
		let btn = e.target;
		let index = 0;
		if(btn == this.chooseBtn0){
			index = 0;
		}
		else if(btn == this.chooseBtn1){
			index = 1;
		}else {
			index = 2;
		}
		this.selectActivity(index);
	}
}

ViewManager.ins().reg(DoubleTwelveRechargeWin, LayerManager.UI_Popup);