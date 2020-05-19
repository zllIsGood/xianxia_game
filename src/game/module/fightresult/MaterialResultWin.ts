/**
 * 材料副本/失乐园 结算页
 */
class MaterialResultWin extends BaseEuiView {

	public bg: eui.Image;
	public txt: eui.Label;
	public closeBtn: eui.Button;

	public list0: eui.List;
	public listData0: eui.ArrayCollection;
	public defeat: eui.Group;

	public title: eui.Image;


	/** 倒计时剩余秒 */
	private s: number;

	private listItem: eui.List;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "DailyFbResultSkin";
		this.listItem.itemRenderer = ItemBase;

		this.listData0 = new eui.ArrayCollection();

		this.list0.itemRenderer = DefeatItem;

	}

	private winResult: number = 0;
	private repeatTimes: number = 5;
	private _fbType:number;
	public open(...param: any[]): void {
		super.open(param);

		this._fbType = GameMap.fbType;
		let result: number = param[0];
		this.winResult = result;
		this.bg.source = result ? "win_jpg" : "lost_jpg";
		// this.bg1.source = result ? "win_02" : "jslost";
		this.closeBtn.name = result ? "领取奖励" : "退出";
		this.title.source = result ? "win_02" : "lost_02";
		//死亡引导判断
		DieGuide.ins().postdieGuide(result);

		//经验副本15秒
		let closeTime: number = 5;

		this.s = this.repeatTimes = closeTime;
		this.updateCloseBtnLabel();

		TimerManager.ins().doTimer(1000, this.repeatTimes, this.updateCloseBtnLabel, this);

		let rewards: RewardData[] = param[1];

		if (param[2])
			this.txt.text = param[2];



		this.txt.visible = (result != 0)
		this.defeat.visible = (result == 0);
		this.addTouchEvent(this.closeBtn, this.onTap);

		if (result == 0) {
			this.updateDefeatList();
		}

		if (rewards)
			this.setRewardList(rewards);
	}

	public setRewardList(rewards: RewardData[] = []) {
		let material: RewardData[] = [];
		for (let i = 0; i < rewards.length; i++) {
			//材料副本/失乐园也需要不折叠
			let itemConfig:ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
			if( ItemConfig.getType(itemConfig) == 1 ){
				material.push(rewards[i]);
			}
		}
		this.listItem.dataProvider = new eui.ArrayCollection(material);

	}
	
	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);

		this.removeTouchEvent(this.closeBtn, this.onTap);
		UserFb.ins().sendExitFb();

		if (this._fbType == UserFb.FB_TYPE_MATERIAL)
			ViewManager.ins().open(FbWin, 0);

	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			ViewManager.ins().close(this);

		this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private updateDefeatList(): void {
		let gainWay: number[] = [];	//道具途径
		for (let i in GlobalConfig.DeathGuideConfig) {
			let cfg: DeathGuideConfig = GlobalConfig.DeathGuideConfig[i];
			if (UserZs.ins().lv <= cfg.zslv || Actor.level <= cfg.lv) {
				for (let j in cfg.gainWay) {
					//死亡引导
					if( cfg.gainWay[j][0] == 16 ){
						let pic_img:string = DieGuide.ins().getOpenRoles();
						if( pic_img ){
							let desConfig:DeathgainWayConfig = GlobalConfig.DeathgainWayConfig[cfg.gainWay[j][0]];
							desConfig.itemId = pic_img;//修改配置表 因为只显示当前登陆一次 往后不作修改
							gainWay.push(cfg.gainWay[j][0]);
						}
						continue;
					}
					gainWay.push(cfg.gainWay[j][0]);
				}
				break;
			}
		}

		this.listData0.source = gainWay;

		this.list0.dataProvider = this.listData0;

	}

}

ViewManager.ins().reg(MaterialResultWin, LayerManager.UI_Popup);