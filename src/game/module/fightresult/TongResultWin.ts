/**
 * 通天塔结算页
 */
class TongResultWin extends BaseEuiView {

	public bg: eui.Image;
	public txt: eui.Label;
	public closeBtn: eui.Button;

	public closeFunc: Function;

	public list0: eui.List;
	public listData0: eui.ArrayCollection;
	public defeat: eui.Group;

	public title: eui.Image;


	private rewardBtn: eui.Button;
	private rewardBtnText: string

	/** 倒计时剩余秒 */
	private s: number;
	private listCoin: eui.List;
	private listItem: eui.List;
	private labelItem: eui.Label;

	private scrollerGroup: eui.Group;
	/**印记解锁类型显示 */
	private nune: eui.Group;

	//解锁
	private nameLabel: eui.Label;
	private nuneValue: eui.Label;

	//开启
	private nuneLock: eui.Group;
	private oldValue: eui.Label;
	private newValue: eui.Label;
	private repeatTimes: number = 5;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ChuangtianguanResultSkin";
		this.listCoin.itemRenderer = ResultCoinItem;
		this.listItem.itemRenderer = ItemBase;

		this.listData0 = new eui.ArrayCollection();

		this.list0.itemRenderer = DefeatItem;

	}

	/**解锁类型 */
	private showRune(result: number) {
		//只有通天塔显示
		if (GameMap.fbType != UserFb.FB_TYPE_TIAOZHAN) {
			return;
		}
		//失败不显示
		if (!result) {
			this.nune.visible = false;
			return;
		}

		//开启符文槽：  equipPos有值
		//解锁类型：  equipPos没值
		let fbconfig: FbChallengeConfig = GlobalConfig.FbChallengeConfig[SkyLevelModel.ins().cruLevel - 1];
		if (!fbconfig || !fbconfig.showIcon) {
			this.nune.visible = false;
			return;
		}

		//判断品质3奖品符文不显示
		let item_config: ItemConfig = GlobalConfig.ItemConfig[fbconfig.showIcon];
		let quality: number = ItemConfig.getQuality(item_config);
		if (quality == FBChallengePanel.RunType) {
			this.nune.visible = false;
			return;
		}

		this.nune.visible = true;
		this.scrollerGroup.y += this.nune.height * 3 / 2;
		let desc = "";
		if (fbconfig.equipPos) {
			this.nuneLock.visible = true;
			desc = "开启符文槽：";
			this.oldValue.text = (fbconfig.equipPos - 1).toString();
			this.newValue.text = fbconfig.equipPos.toString();
		}
		else {
			this.nuneLock.visible = false;
			desc = "解锁类型：";
			// let item_config:ItemConfig = GlobalConfig.ItemConfig[fbconfig.showIcon];
			this.nuneValue.text = fbconfig.describe;
		}
		this.nameLabel.text = desc;
		//解锁属性描述
		this.nuneValue.visible = !this.nuneLock.visible;

	}


	public open(...param: any[]): void {
		super.open(param);

		let result: number = param[0];
		this.bg.source = result ? "win_jpg" : "lost_jpg";
		this.closeBtn.name = result ? "领取奖励" : "退出";
		this.title.source = result ? "win_02" : "lost_02";
		//死亡引导判断
		DieGuide.ins().postdieGuide(result);
		this.showRune(result);

		let closeTime: number = 5;

		this.s = this.repeatTimes = closeTime;

		TimerManager.ins().doTimer(1000, this.repeatTimes, this.updateCloseBtnLabel, this);

		let rewards: RewardData[] = param[1];


		if (param[2])
			this.txt.text = param[2];
		UserFb.ins().isQuite = true;
		if (param[3] instanceof Function) {
			this.closeFunc = param[3];
		} else {
			if (param[3] == false) {
				UserFb.ins().isQuite = param[3];
			}
		}



		this.txt.visible = (result != 0)
		this.defeat.visible = (result == 0);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.rewardBtn, this.onTap);

		if (result == 0) {
			this.rewardBtn.visible = false;
			this.updateDefeatList();
		}
		else if (result == 1) {
			let model: SkyLevelModel = SkyLevelModel.ins();
			let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[model.cruLevel];
			if (info) {
				if (UserZs.ins().lv >= info.zsLevelLimit && Actor.level >= info.levelLimit && SkyLevelModel.ins().lotteryRemainTimes == 0) {
					this.rewardBtn.visible = true;
					this.closeBtn.x = 0;
					if (info.layer == 1) {
						this.rewardBtn.label = `继续挑战`;
						this.rewardBtn.width = 130;
					} else {
						this.rewardBtn.label = `挑战第${info.layer}层`;
						this.rewardBtn.width = 140;
					}
					this.rewardBtnText = this.rewardBtn.label;
					if (Recharge.ins().franchise > 0 && this.rewardBtnText)   //特权月卡 => 副本胜利结算时，倒计时后自动挑战下一关
						this.rewardBtn.label += `(${this.s}s)`;
				} else {
					this.rewardBtn.visible = false;
					this.closeBtn.x = 90;
				}
			} else {
				this.rewardBtn.visible = false;
				this.closeBtn.x = 90;
			}
		}
		if (rewards)
			this.setRewardList(rewards);
		else
			this.setRewardList();//失败的情况

		TongResultWin.oneBtnX = this.closeBtn.x;
		TongResultWin.twoBtnX = this.rewardBtn.x;
		this.setBtnLayout();
		this.updateCloseBtnLabel();
	}

	private static oneBtnX: number = 0;
	private static twoBtnX: number = 0;

	/**
	 * 设置两个按钮布局
	 * @returns void
	 */
	private setBtnLayout(): void {
		if (this.closeBtn.visible && this.rewardBtn.visible) {
			this.closeBtn.x = TongResultWin.oneBtnX;
			this.rewardBtn.x = TongResultWin.twoBtnX;
		} else if (this.closeBtn.visible) {
			this.closeBtn.horizontalCenter = 0;
		} else if (this.rewardBtn.visible) {
			this.rewardBtn.horizontalCenter = 0;
		}
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let itemData: RewardData[] = [];

		let soulData: RewardData[] = [];
		let material: RewardData[] = [];
		let rewardList: RewardData[] = [];
		for (let i = 0; i < rewards.length; i++) {

			//材料聚合
			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
			if (ItemConfig.getType(itemConfig) == 1) {
				if (material.length) {
					let ishave = false;
					for (let j = 0; j < material.length; j++) {
						if (material[j].id == rewards[i].id) {
							material[j].count += rewards[i].count;
							ishave = true;
							break;
						}
					}
					if (!ishave)
						material.push(rewards[i]);
				} else {
					material.push(rewards[i]);
				}
				continue;
			}

			if (rewards[i].type == 0) {
				coinData.push(rewards[i]);
			} else {
				itemData.push(rewards[i]);
			}
		}

		this.scrollerGroup.height = 324;
		this.labelItem.text = "获得道具：";
		this.labelItem.height = itemData.length > 0 ? 20 : 0;
		this.labelItem.visible = itemData.length > 0;
		coinData.sort(this.RuleSort);
		itemData.sort(this.RuleSortByItem);
		this.listCoin.dataProvider = new eui.ArrayCollection(coinData);
		rewardList = soulData.concat(coinData, material, itemData);
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

		if (SkyLevelModel.ins().lotteryRemainTimes > 0 && GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) {
			ViewManager.ins().open(BabelLotteryWin);
		}

	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0) {
			if (this.rewardBtn.visible && Recharge.ins().franchise > 0/*特权月卡*/) {
				UserFb2.ins().sendChallenge(); //特权月卡 => 副本胜利结算时，倒计时后自动挑战下一关
				UserFb.ins().isQuite = false;
			}
			ViewManager.ins().close(this);
		}

		if (Recharge.ins().franchise > 0 && this.rewardBtnText) {//特权月卡 => 副本胜利结算时，倒计时后自动挑战下一关
			this.rewardBtn.label = `${this.rewardBtnText}(${this.s}s)`;
			this.closeBtn.label = this.closeBtn.name;
		}
		else
			this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.rewardBtn:
				UserFb2.ins().sendChallenge();
				UserFb.ins().isQuite = false;
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
					if (cfg.gainWay[j][0] == 16) {
						let pic_img: string = DieGuide.ins().getOpenRoles();
						if (pic_img) {
							let desConfig: DeathgainWayConfig = GlobalConfig.DeathgainWayConfig[cfg.gainWay[j][0]];
							desConfig.itemId = pic_img;//修改配置表 因为只显示当前登陆一次 往后不作修改
							gainWay.push(cfg.gainWay[j][0]);
						}
						continue;
					}
					if (cfg.gainWay[j][0] == 14 || cfg.gainWay[j][0] == 20) {
						let maxVipLv = Object.keys(GlobalConfig.VipConfig).length;
						if (UserVip.ins().lv >= maxVipLv) {
							continue;//VIP满级不弹出对应提示
						}
					}
					gainWay.push(cfg.gainWay[j][0]);
				}
				break;
			}
		}

		this.listData0.source = gainWay;

		this.list0.dataProvider = this.listData0;

	}
	private RuleSort(a: RewardData, b: RewardData): number {
		if (a.id < b.id)
			return -1;
		else
			return 1;
	}
	private RuleSortByItem(a: RewardData, b: RewardData): number {
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

ViewManager.ins().reg(TongResultWin, LayerManager.UI_Popup);