/**
 * ResultWin extends
 */
class ResultWin extends BaseEuiView {

	public bg: eui.Image;
	public txt: eui.Label;
	public closeBtn: eui.Button;

	public closeFunc: Function;

	// public list: eui.List;
	// public listData: eui.ArrayCollection;
	public list0: eui.List;
	public listData0: eui.ArrayCollection;
	public defeat: eui.Group;
	public lostTxt: eui.Label;

	public openRole: eui.Image;
	public openRole1: eui.Button;
	// public bg1: eui.Image;
	public title: eui.Image;

	private bossmc: MovieClip;

	private rewardBtn: eui.Button;

	private doublePrice: PriceIcon;

	/** 倒计时剩余秒 */
	private s: number;
	// private isQuit: boolean = true;

	private listCoin: eui.List;
	private listEmblem: eui.List;
	private listItem: eui.List;
	private labelEmblem: eui.Label;
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
	private rdir: eui.Image;

	private effGroup: eui.Group;
	private winnerEff: MovieClip;

	private roleIcon: eui.ToggleButton;
	private belongTxt: eui.Label;
	private winnerGroup: eui.Group;
	private wpkBoss: NewWorldBossResultPanel;

	private static filterFb:number[] = [UserFb.FB_TYPE_MATERIAL];//不需要折叠奖励的副本类型
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.init();
	}

	public init(): void {
		this.skinName = "ResultSkin";
		this.listCoin.itemRenderer = ResultCoinItem;
		this.listItem.itemRenderer = ItemBase;
		this.listEmblem.itemRenderer = ItemBase;

		this.listData0 = new eui.ArrayCollection();

		this.list0.itemRenderer = DefeatItem;

		this.winnerEff = new MovieClip;
		this.winnerEff.x = 41;
		this.winnerEff.y = 41;
		this.winnerEff.touchEnabled = false;
	}

	/** 货币排序 */
	private sortFunc(a: RewardData, b: RewardData): number {
		if (a.type == 1 && b.type == 1) {
			let aItem: ItemConfig = GlobalConfig.ItemConfig[a.id];
			let bItem: ItemConfig = GlobalConfig.ItemConfig[b.id];

			let aq = ItemConfig.getQuality(aItem);
			let bq = ItemConfig.getQuality(aItem);
			if (aq > bq)
				return -1;
			else if (aq < bq)
				return 1;
			else {
				if (aItem.level > bItem.level)
					return -1;
				else if (aItem.level < bItem.level)
					return 1;
			}
		}
		else {
			if (a.type < b.type)
				return -1;
			else if (a.type > b.type)
				return 1;
		}
		return 0;
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
		let item_config:ItemConfig = GlobalConfig.ItemConfig[fbconfig.showIcon];
		let quality:number = ItemConfig.getQuality(item_config);
		if( quality == FBChallengePanel.RunType ){
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

	private winResult: number = 0;
	private repeatTimes: number = 5;
	private isBossResult: boolean = false;
	private _fbType:number;
	public open(...param: any[]): void {
		super.open(param);

		this._fbType = GameMap.fbType;
		this.doublePrice.visible = false;
		let result: number = param[0];
		this.winResult = result;
		this.bg.source = result ? "win_jpg" : "lost_jpg";
		// this.bg1.source = result ? "win_02" : "jslost";
		this.closeBtn.name = result ? "领取奖励" : "退出";
		this.title.source = result ? "win_02" : "lost_02";
		//死亡引导判断
		DieGuide.ins().postdieGuide(result);
		this.showRune(result);
		//经验副本15秒
		let closeTime: number = GameMap.fbType == UserFb.FB_TYPE_EXP ? 15 : 5;
		if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS || GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS || GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS || GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS) {
			closeTime = 10;
		} else if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS) {
			closeTime = 21;
		}
		this.s = this.repeatTimes = closeTime;
		this.updateCloseBtnLabel();
		if (!CityCC.ins().isCity)
		TimerManager.ins().doTimer(1000, this.repeatTimes, this.updateCloseBtnLabel, this);

		let rewards: RewardData[] = param[1];
		// if (rewards) {
		// 	rewards.sort(this.sortFunc);
		// }

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
		if (CityCC.ins().isCity)
			UserFb.ins().isQuite = false;
		if (param[4]) {
			let isBelong: boolean = param[4][0];
			if (isBelong) {
				if (!this.winnerEff.parent) this.effGroup.addChild(this.winnerEff);
				this.winnerEff.playFile(RES_DIR_EFF + "yanhuaeff", 1);
			}
			let tname:string = param[4][1] || "";
			let strlist = tname.split("\n");
			if( strlist[1] )
				tname = strlist[1];
			else
				tname = strlist[0];

			tname = StringUtils.replaceStr(tname,"0xffffff",ColorUtil.ROLENAME_COLOR_GREEN + "");

			this.belongTxt.textFlow = TextFlowMaker.generateTextFlow1(tname);
			this.labelItem.text = isBelong ? "我的归属奖：" : "我的参与奖：";
			this.isBossResult = true;
			this.roleIcon.icon = param[4][2];
			this.roleIcon['jobImg'].visible = false;
			this.txt.text = "";
		} else {
			this.belongTxt.text = ""
		}

		this.txt.visible = (result != 0)
		this.defeat.visible = (result == 0);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.rewardBtn, this.onTap);
		this.addTouchEvent(this.openRole, this.onTap);
		this.addTouchEvent(this.openRole1, this.onTap);

		// this.openRole.visible = this.openRole1.visible = SubRoles.ins().subRolesLen < 3;
		this.openRole.visible = false;

		this.defeat.y = 210;
		this.closeBtn.x = 90;
		if (result == 0) {
			if (GameMap.fubenID != 0)
				this.defeat.y = 110;
			this.updateDefeatList();
		}
		if (GameMap.fubenID != 0 && result == 1) {
			if (GameMap.fbType == UserFb.FB_TYPE_EXP) {
				// this.rewardBtn.visible = true;
				this.closeBtn.label = "领取奖励";
				// this.closeBtn.x = 0;
				// this.doublePrice.visible = true;
				// let dailyConfig = GlobalConfig.DailyFubenConfig[GameMap.mapID];
				// this.doublePrice.setPrice(dailyConfig.ybRec);
			}
			else if (GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) {
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
					} else {
						this.rewardBtn.visible = false;
						this.closeBtn.x = 90;
					}
				} else {
					this.rewardBtn.visible = false;
					this.closeBtn.x = 90;
				}
			}
			else if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS) {
				this.winnerGroup.visible = false;
				this.closeBtn.visible = false;
				this.rewardBtn.visible = false;
				this.txt.visible = false;
				this.wpkBoss.visible = true;
				this.wpkBoss.open();
			}
			else {
				this.rewardBtn.visible = false;
			}
		} else {
			this.rewardBtn.visible = false;
		}
		if (rewards)
			this.setRewardList(rewards);
		else
			this.setRewardList();
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let emblemData: RewardData[] = [];
		let itemData: RewardData[] = [];
		if (this.isBossResult) {
			this.winnerGroup.visible = true;
			this.scrollerGroup.y += 60;
			this.scrollerGroup.height = 336;
			this.labelEmblem.height = 0;
			this.labelItem.height = 20;
			this.labelEmblem.visible = false;
			this.labelItem.visible = true;

			let soulData: RewardData[] = [];
			let rewardList: RewardData[] = [];
			for (let i = 0; i < rewards.length; i++) {

				//材料聚合
				let itemConfig:ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
				if( ItemConfig.getType(itemConfig) == 1 ){
					if( ResultWin.filterFb.indexOf(GameMap.fbType) != -1 ) {
						emblemData.push(rewards[i]);
					}else{
						if( emblemData.length ){
							let ishave = false;
							for( let j = 0;j < emblemData.length;j++ ){
								if( emblemData[j].id == rewards[i].id ){
									emblemData[j].count += rewards[i].count;
									ishave = true;
									break;
								}
							}
							if( !ishave )
								emblemData.push(rewards[i]);
						}else{
							emblemData.push(rewards[i]);
						}
					}
					continue;
				}

				if (rewards[i].type == 0) {
					if (rewards[i].id == MoneyConst.soul) {
						soulData.push(rewards[i])
					} else {
						coinData.push(rewards[i]);
					}
				} else {
					itemData.push(rewards[i]);
				}
			}
			itemData.sort(this.RuleSortByItem);
			rewardList = soulData.concat(coinData,emblemData, itemData);
			this.listItem.dataProvider = new eui.ArrayCollection(rewardList);
		}
		else {
			let soulData: RewardData[] = [];
			let material: RewardData[] = [];
			let rewardList: RewardData[] = [];
			for (let i = 0; i < rewards.length; i++) {

				//材料聚合
				let itemConfig:ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
				if( ItemConfig.getType(itemConfig) == 1 ){
					if( ResultWin.filterFb.indexOf(GameMap.fbType) != -1 ){
						material.push(rewards[i]);
					}else{
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
					}
					continue;
				}

				if (rewards[i].type == 0) {
					coinData.push(rewards[i]);
				}else {
					let conf = GlobalConfig.ItemConfig[rewards[i].id];
					let type = ItemConfig.getType(conf);
					if (type == ItemType.TYPE_6) {
						itemData.push(rewards[i]);
					} else {
						itemData.push(rewards[i]);
					}
				}
			}
			this.winnerGroup.visible = false;
			this.scrollerGroup.height = 324;
			this.labelItem.text = "获得道具：";
			this.labelEmblem.height = emblemData.length > 0 ? 20 : 0;
			this.labelItem.height = itemData.length > 0 ? 20 : 0;
			this.labelEmblem.visible = emblemData.length > 0;
			this.labelItem.visible = itemData.length > 0;
			coinData.sort(this.RuleSort);
			itemData.sort(this.RuleSortByItem);
			this.listCoin.dataProvider = new eui.ArrayCollection(coinData);
			this.listEmblem.dataProvider = new eui.ArrayCollection(emblemData);
			// this.listItem.dataProvider = new eui.ArrayCollection(itemData);
			rewardList = soulData.concat(coinData, material,itemData);
			this.listItem.dataProvider = new eui.ArrayCollection(rewardList);
		}
	}
	
	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);

		this.wpkBoss.close();

		for (let i: number = 1; i < 6; i++) {
			this.removeTouchEvent(this["img" + i], this.onTap);
		}

		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.openRole, this.onTap);
		this.removeTouchEvent(this.openRole1, this.onTap);
		if (GameMap.fubenID > 0) {
			if (UserFb.ins().isQuite) {
				// ControllerManager.ins().applyFunc(ControllerConst.Game, MapFunc.EXIT_FB);
				UserFb.ins().sendExitFb();
			}
		}

		if (this._fbType == UserFb.FB_TYPE_MATERIAL) {
			ViewManager.ins().open(FbWin, 0);
			// ViewManager.ins().addFilterTopView(FbWin);
		} else if (this._fbType == UserFb.FB_TYPE_GUILD_BOSS) {
			ViewManager.ins().open(GuildBossWin);
		} else if (this._fbType == UserFb.FB_TYPE_HOMEBOSS) {
			ViewManager.ins().open(BossWin, 5);
		}

		if (this.closeFunc) {
			this.closeFunc();
			this.closeFunc = null;
		}
		if (this.bossmc) {
			DisplayUtils.removeFromParent(this.bossmc);
			this.bossmc = null;
		}

		if (SkyLevelModel.ins().lotteryRemainTimes > 0 && GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) {
			ViewManager.ins().open(BabelLotteryWin);
	}

	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			ViewManager.ins().close(this);
		if (CityCC.ins().isCity)
			this.closeBtn.label = `${this.closeBtn.name}`;
		else
		this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			// case this.img1:
			// case this.img2:
			// case this.img3:
			// case this.img4:
			// case this.img5:
			// 	this.openWin(e.currentTarget);
			// 	break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.rewardBtn:
				UserFb2.ins().sendChallenge();
				UserFb.ins().isQuite = false;
				ViewManager.ins().close(this);
				break;
			case this.openRole:
			case this.openRole1:
				ViewManager.ins().close(this);
				ViewManager.ins().open(NewRoleWin);
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
			// if (aItem.level > bItem.level)
			// 	return -1;
			// else if (aItem.level < bItem.level)
			// 	return 1;
			// else{
			// 	return 0;
			// // 	if( a.id < b.id )
			// // 		return -1;
			// // 	else
			// // 		return 1;
			// }
		}
	}


	// private openWin(img: eui.Image): void {
	// 	ViewManager.ins().close(this);
	// 	let t: number = egret.setTimeout(() => {
	// 		let num: any[] = [0, 0];
	// 		switch (img) {
	// 			case this.img1:
	// 				num[0] = egret.getQualifiedClassName(RoleWin);
	// 				num[1] = 1;
	// 				break;
	// 			case this.img2:
	// 				num[0] = egret.getQualifiedClassName(ForgeWin);
	// 				num[1] = 0;
	// 				break;
	// 			case this.img3:
	// 				num[0] = egret.getQualifiedClassName(ForgeWin);
	// 				num[1] = 1;
	// 				break;
	// 			case this.img4:
	// 				num[0] = egret.getQualifiedClassName(LiLianWin);
	// 				num[1] = 0;
	// 				break;
	// 			case this.img5:
	// 				num[0] = egret.getQualifiedClassName(LongHunWin);
	// 				num[1] = 0;
	// 				break;
	// 		}
	// 		GameGuider.guidance(num[0], num[1]);
	// 		clearTimeout(t);
	// 	},this, 200);

	// }
}

ViewManager.ins().reg(ResultWin, LayerManager.UI_Popup);