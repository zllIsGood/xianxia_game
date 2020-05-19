/**
 * 个人boss结算页
 */
class PersonalResultWin extends BaseEuiView {

	public bg: eui.Image;
	public txt: eui.Label;
	public closeBtn: eui.Button;

	public closeFunc: Function;

	public list0: eui.List;
	public listData0: eui.ArrayCollection;
	public defeat: eui.Group;


	public title: eui.Image;


	/** 倒计时剩余秒 */
	private s: number;

	private listCoin: eui.List;
	private listItem: eui.List;
	private labelItem: eui.Label;


	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "PersonalBossResultSkin";
		this.listCoin.itemRenderer = ResultCoinItem;
		this.listItem.itemRenderer = ItemBase;

		this.listData0 = new eui.ArrayCollection();

		this.list0.itemRenderer = DefeatItem;

	}

	private repeatTimes: number = 5;
	private _fbType:number;
	public open(...param: any[]): void {
		super.open(param);

		this._fbType = GameMap.fbType;
		let result: number = param[0];
		this.bg.source = result ? "win_jpg" : "lost_jpg";

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
		UserFb.ins().isQuite = true;
		if (param[3] instanceof Function) {
			this.closeFunc = param[3];
		}

		this.txt.visible = (result != 0)
		this.defeat.visible = (result == 0);
		this.addTouchEvent(this.closeBtn, this.onTap);

		if (result == 0)
			this.updateDefeatList();


		if (rewards)
			this.setRewardList(rewards);
		else
			this.setRewardList();
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let itemData: RewardData[] = [];
		let soulData: RewardData[] = [];
		let material: RewardData[] = [];
		let rewardList: RewardData[] = [];
		for (let i = 0; i < rewards.length; i++) {
			//材料聚合
			let itemConfig:ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
			if( ItemConfig.getType(itemConfig) == 1 ){
				if( material.length ){
					let ishave = false;
					for( let j = 0;j < material.length;j++ ){
						if( material[j].id == rewards[i].id ){
							material[j].count += rewards[i].count;
							ishave = true;
							break;
						}
					}
					if( !ishave )
						material.push(rewards[i]);
				}else{
					material.push(rewards[i]);
				}
				continue;
			}

			if (rewards[i].type == 0) {
				coinData.push(rewards[i]);
			}else {
				itemData.push(rewards[i]);
			}
		}
		this.labelItem.text = "获得道具：";
		this.labelItem.height = itemData.length > 0 ? 20 : 0;
		this.labelItem.visible = itemData.length > 0;
		coinData.sort(this.RuleSort);
		itemData.sort(this.RuleSortByItem);
		this.listCoin.dataProvider = new eui.ArrayCollection(coinData);
		rewardList = soulData.concat(coinData, material,itemData);
		this.listItem.dataProvider = new eui.ArrayCollection(rewardList);

	}
	
	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);


		this.removeTouchEvent(this.closeBtn, this.onTap);
		if (GameMap.fubenID > 0) {
			if (UserFb.ins().isQuite) {
				UserFb.ins().sendExitFb();
			}
		}

		if (this.closeFunc) {
			this.closeFunc();
			this.closeFunc = null;
		}
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
					if( cfg.gainWay[j][0] == 14 ){//首充
						let rch:RechargeData = Recharge.ins().getRechargeData(0);
						if( rch.num && rch.num != 2){//vip满级过滤vip增强提示
							if( UserVip.ins().lv >= Object.keys(GlobalConfig.VipConfig).length )
								continue;
						}
					}
					else if( cfg.gainWay[j][0] == 16 ){
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
	private RuleSort(a:RewardData,b:RewardData):number{
		if( a.id < b.id )
			return -1;
		else
			return 1;
	}
	private RuleSortByItem(a:RewardData,b:RewardData):number{
		let aItem: ItemConfig = GlobalConfig.ItemConfig[a.id];
		let bItem: ItemConfig = GlobalConfig.ItemConfig[b.id];
		let aq = ItemConfig.getQuality(aItem);
		let bq = ItemConfig.getQuality(bItem);
		if (aq > bq)
			return -1;
		else if (aq < bq)
			return 1;
		else {
			return 0;
		}
	}

}

ViewManager.ins().reg(PersonalResultWin, LayerManager.UI_Popup);