class NewLilianWin extends BaseEuiView {

	private attrTxt: eui.Label;
	private nextTxt: eui.Label;
	private upgradeBtn: eui.Button;
	private list: eui.List;
	private itemList: eui.List;
	// private skillItem: eui.Image;
	public imgMedal: eui.Image;
	public levelImg: eui.Image;
	public levelLabel: eui.Label;
	public levelLabel0: eui.Label;
	public redPoint: eui.Image;
	public redPoint0: eui.Image;
	private _totalPower: number;
	private powerPanel: PowerPanel;

	private barbc: ProgressBarEff;
	private expGroup: eui.Group;

	private showAct: eui.Group;//天阶界面信息界面
	private Activation: eui.Group;//开启激活天阶界面

	private UplevelBtn0: eui.Button;//开启天阶按钮
	private activeTipsTxt0: eui.Label;
	private upInfo: eui.Group;
	private eff: MovieClip;

	public addReward: eui.Group;
	public item4: ItemBase;
	// public special: eui.Label;
	public reward: eui.Button;

	public targetLevel: eui.Label;
	public tipsGroup: eui.Group;

	public guanyinBg0: eui.Image;
	// public guanyinLv0: eui.Image;
	// public guanyinLv1: eui.Image;

	private lilianed: eui.Label;//今日历练
	// private lilian0//历练值描述
	// private gift0 //图标
	private trainMc: Map<MovieClip>;//天阶每日奖励特效
	public constructor() {
		super();
		this.name = `天阶`;
		this.isTopLevel = true;
		this.skinName = "LiLianSkin";
	}

	protected childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.setSkinPart("barbc", new ProgressBarEff);
		this.list.itemRenderer = LiLianItem;
		this.itemList.itemRenderer = ItemBase;

		// this.barbc.setWidth(525);
		// this.barbc.x = 3;
		// this.barbc.y = -15;
		// this.expGroup.addChild(this.barbc);

		this.eff = new MovieClip;
		this.eff.x = 479;
		this.eff.y = 55;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
		this.item4.isShowName(false);

		this.trainMc = {};
	}

	public open(): void {
		this.addTouchEvent(this.list, this.onListTouch);
		this.addTouchEvent(this.upgradeBtn, this.onUpgrade);
		// this.addTouchEvent(this.skillItem, this.onSeeSkill);
		this.addTouchEvent(this.UplevelBtn0, this.onActive);
		this.addTouchEvent(this.reward, this.sendGetReward);
		this.observe(UserTask.ins().postTaskChangeData, this.setWinData);
		this.observe(LiLian.ins().postLilianData, this.onListChange);
		this.observe(LiLian.ins().postTrainsDayAward, this.updateProgress);//领取每日历练奖励返回刷新进度

		for (let i = 1; i <= 4; i++) {
			this.addTouchEvent(this[`isget${i}`], this.onGiftClick);
		}

		this.barbc.reset();
		this.setWinData();

		this.showActPanel();

		this.activeTipsTxt0.text = `激活神器 鱼龙变 可开启天阶晋升之路`;
	}

	public close(): void {
		this.removeTouchEvent(this.list, this.onListTouch);
		this.removeTouchEvent(this.upgradeBtn, this.onUpgrade);
		// this.removeTouchEvent(this.skillItem, this.onSeeSkill);
		this.removeTouchEvent(this.UplevelBtn0, this.onActive);
		this.removeTouchEvent(this.reward, this.sendGetReward);
		DisplayUtils.removeFromParent(this.eff);
		for (let i in this.trainMc) {
			DisplayUtils.removeFromParent(this.trainMc[i]);
		}
		for (let i = 1; i <= 4; i++) {
			this.removeTouchEvent(this[`isget${i}`], this.onGiftClick);
		}
	}

	private sendGetReward(): void {
		if (UserBag.ins().getSurplusCount() >= 1) {
			LiLian.ins().sendGetLilianReward();
		}
		else
			UserTips.ins().showTips("|C:0xff0000&T:背包已满，请清理背包|");
	}

	/**是否显示激活界面 */
	private showActPanel() {
		// this.Activation.visible = LiLian.ins().isAct == 0;
		this.Activation.visible = false;
		this.showAct.visible = !this.Activation.visible;
	}

	/**激活天阶 */
	private onActive(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.UplevelBtn0:
				if (!LiLian.ins().getLilianActiveState()) {
					UserTips.ins().showTips(`激活神器 鱼龙变 后开启`);
					e.$cancelable = true;
					e.preventDefault();
				}
				break;
		}
	}
	//可领取点击飞道具
	private onGiftClick(e: egret.TouchEvent): void {
		for (let i = 1; i <= 4; i++) {
			if (e.currentTarget == this[`isget${i}`]) {
				let itemicon: ItemIcon = this[`gift${i}`].getItemIcon();
				LiLian.ins().getTraining = true;
				this.flyItem(itemicon);
				LiLian.ins().sendTrainsDayAward(i);
				break;
			}
		}
	}
	private flyItem(itemicon: ItemIcon) {
		let flyItem: eui.Image = new eui.Image(itemicon.imgIcon.source);
		flyItem.x = itemicon.imgIcon.x;
		flyItem.y = itemicon.imgIcon.y;
		flyItem.width = itemicon.imgIcon.width;
		flyItem.height = itemicon.imgIcon.height;
		flyItem.scaleX = itemicon.imgIcon.scaleX;
		flyItem.scaleY = itemicon.imgIcon.scaleY;
		itemicon.imgIcon.parent.addChild(flyItem);
		GameLogic.ins().postFlyItemEx(flyItem);
	}
	private onUpgrade(e: egret.TouchEvent): void {
		let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[LiLian.ins().liLianLv + 1];
		if (!config)
			return;
		let exp: number = LiLian.ins().liLianExp;
		if (exp >= config.exp) {
			LiLian.ins().sendLilianUpgrade();
		}
		else {
			UserTips.ins().showTips("|C:0xf3311e&T:历练不足，无法升级|");
		}
	}

	private onSeeSkill(e: egret.TouchEvent): void {
		ViewManager.ins().open(LiLianTips);
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Label) {
			let item: LiLianItem = e.target.parent as LiLianItem;
			if (!item.isClose) {
				ViewManager.ins().close(NewLilianWin);
				ViewManager.ins().close(LiLianWin);
			}
			FbWin.isClose = item.isClose;
			GameGuider.taskGuidance((item.data as TaskData).id, 0);
			ViewManager.ins().close(LimitTaskView);
		}
	}

	private onListChange(map: any): void {

		let flag = map.flag;
		//为了不影响原来逻辑
		if (flag) {
			this.lilianUpgradeSuccess();
			this.setWinData();
		}
		//是否显示激活界面

		this.showActPanel();

		//是否显示激活特效界面

		if (LiLian.ins().isShow) {
			let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[LiLian.ins().liLianLv + 1];
			let img = "juewei" + "_" + config.type + "_1";
			Activationtongyong.show(0, config.trainName, `${img}_png`);
		}
	}

	private setWinData(): void {
		let lv: number = LiLian.ins().liLianLv;
		this._totalPower = LiLian.ins().getPower();
		this.powerPanel.setPower(this._totalPower);
		let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[lv];
		if (ErrorLog.Assert(config, "LiLianPanel  config is null  lv = " + lv)) {
			return;
		}
		let imgType = config.type;
		this.imgMedal.source = `juewei_1_${imgType}_png`;
		this.levelImg.source = `juewei_0_${imgType}_png`;
		this.levelLabel.text = `${config.trainlevel}等`;
		let skillcfg: TrainLevelAwardConfig = LiLian.ins().getCruLevelSkillCfg();
		// this.skillItem.source = skillcfg ? skillcfg.icon + "" : "";

		this.attrTxt.text = AttributeData.getAttStr(config.attrAward, 0, 1, "：");
		let nextConfig: TrainLevelConfig = GlobalConfig.TrainLevelConfig[lv + 1];
		if (nextConfig) {
			let str: string = "";
			for (let i: number = 0; i < nextConfig.attrAward.length; i++) {
				str += nextConfig.attrAward[i].value;
				if (i < nextConfig.attrAward.length - 1)
					str += "\n";
			}
			this.nextTxt.text = str;
			this.itemList.dataProvider = new eui.ArrayCollection(nextConfig.itemAward);
			this.currentState = `nomax`;
			let tempStr: string = config.trainlevel == 1 ? nextConfig.trainName : "";
			this.levelLabel0.text = `${nextConfig.trainlevel}等${tempStr}`;
		} else {
			this.currentState = `max`;
			this.itemList.dataProvider = new eui.ArrayCollection([]);
		}
		this.expChange();

		let taskList: TaskData[] = UserTask.ins().task;
		this.list.dataProvider = new eui.ArrayCollection(taskList);
		// this.list.validateNow();
		this.addRewardRefush();
		this.updateProgress();
	}

	public addRewardRefush(): void {
		if (LiLian.ins().lilianReward > 0) {
			this.addReward.visible = true;
			let liliangReward: number = LiLian.ins().lilianReward;
			let tlac: GuanYinAwardConfig[] = GlobalConfig.GuanYinAwardConfig;
			let data: GuanYinAwardConfig = tlac[liliangReward];
			if (Assert(data, "获取神功达标奖励异常")) {
				return;
			}
			let itemData = new ItemData();
			itemData.configID = data.award.id;
			this.item4.data = itemData;
			if (LiLian.ins().lilianReward > 10) {
				this.guanyinBg0.height = 89;
				// this.guanyinLv1.visible = true;
				let n1 = Math.floor(LiLian.ins().lilianReward / 10);
				let n2 = LiLian.ins().lilianReward % 10;
				let s1 = n1 == 1 ? `10` : `0${n1}`;
				let s2 = n2 == 10 ? `10` : `0${n2}`;
				// this.guanyinLv0.source = `guanyin_${s1}_png`;
				// this.guanyinLv1.source = `guanyin_${s2}_png`;
			} else {
				this.guanyinBg0.height = 75;
				let str = LiLian.ins().lilianReward == 10 ? `10` : `0${LiLian.ins().lilianReward}`;
				// this.guanyinLv0.source = `guanyin_${str}_png`;
				// this.guanyinLv1.visible = false;
			}
			this.reward.visible = this.reward.enabled = LiLian.ins().checkShowRedPoint2();
			// this.reward.visible = true;
			this.tipsGroup.visible = !this.reward.visible;
			this.targetLevel.text = (data.level - LiLian.ins().liLianLv) + "";
		} else {
			this.addReward.visible = false;
			this.reward.enabled = false;
			this.tipsGroup.visible = false;
		}
	}

	private expChange(): void {
		let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[LiLian.ins().liLianLv + 1];
		if (!config)
			config = GlobalConfig.TrainLevelConfig[LiLian.ins().liLianLv];

		let maxExp: number = config.exp;
		let exp: number = LiLian.ins().liLianExp;

		let boo: boolean = exp >= maxExp;
		if (boo) {
			this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
			if (!this.eff.parent) this.upInfo.addChild(this.eff);
		} else {
			DisplayUtils.removeFromParent(this.eff);
		}

		this.barbc.setData(exp, maxExp);
		this.redPoint.visible = LiLian.ins().getLilianBtnState();
		this.redPoint0.visible = LiLian.ins().checkShowRedPoint2()
	}

	/**
	 * 神功升级特效
	 */
	private lilianUpgradeSuccess(): void {
		let len: number = this.itemList.dataProvider.length;
		let resource: string[] = [];
		for (let i: number = 0; i < len; i++) {
			let item: ItemBase = this.itemList.getVirtualElementAt(i) as ItemBase;
			resource.push(item.getItemSoure());
		}
		LiLian.ins().postGetLilianReward(resource);
	}

	/**
	 * 历练进度
	 */
	private updateProgress() {
		let train: TrainDayAwardConfig[] = LiLian.ins().getTrainDayAwardConfigs(GameServer.serverOpenDay + 1)
		if (train) {
			this.lilianed.text = LiLian.ins().liLianExpDay + "";
			for (let i in train) {
				let config: TrainDayAwardConfig = train[i];
				if (config) {
					this[`lilian${i}`].text = `${config.score}`;
					let cfg: ItemConfig = GlobalConfig.ItemConfig[config.reward[0].id];
					// this[`gift${i}`].setData(cfg);
					this[`gift${i}`].data = { id: config.reward[0].id, type: config.reward[0].type, count: config.reward[0].count };
					this[`gift${i}`].isShowName(false);
					// this[`gift${i}`].showNum(false);
					this[`bar${i}`].maximum = 100;
					this[`lingqu${i}`].touchEnabled = false;
					if (LiLian.ins().liLianExpDayReward >> config.id & 1) {
						//已领取
						this[`bar${i}`].value = 100;
						this[`lingqu${i}`].visible = true;
						this[`isget${i}`].touchEnabled = false;//点击飞道具
					} else {
						//未领取
						this[`lingqu${i}`].visible = false;
						if (LiLian.ins().liLianExpDay >= config.score) {
							//可领取
							this[`bar${i}`].value = 100;
							this[`isget${i}`].touchEnabled = true;//点击飞道具
						} else {
							//不可领取
							let preconfig: TrainDayAwardConfig = train[Number(i) - 1];
							let expday: number = LiLian.ins().liLianExpDay;
							let totalscore: number = config.score;
							if (preconfig) {
								expday = LiLian.ins().liLianExpDay - preconfig.score;
								totalscore = config.score - preconfig.score;
							}
							expday = expday > 0 ? expday : 0;
							this[`bar${i}`].value = Math.floor(expday / totalscore * 100);
							this[`isget${i}`].touchEnabled = false;//点击飞道具
						}
					}
					this.updateTrainEff(config.id);//更新特效红点
				}
			}
		}

	}
	//天阶每日奖励特效
	private updateTrainEff(id: number) {
		if (!this.trainMc[id])
			this.trainMc[id] = new MovieClip;
		//特效
		let b: boolean = LiLian.ins().isGetTrainDayAward(id);
		this[`redPoint${id}`].visible = b;
		if (b) {
			if (!this.trainMc[id].parent) {
				this[`eff${id}`].parent.addChild(this.trainMc[id]);
				this.trainMc[id].playFile(RES_DIR_EFF + "openRole1", -1);//chuanqizbeff actIconCircle
				this.trainMc[id].x = this[`eff${id}`].x;
				this.trainMc[id].y = this[`eff${id}`].y;
				// this.trainMc[id].scaleX = this[`gift${id}`].scaleX;
				// this.trainMc[id].scaleY = this[`gift${id}`].scaleY;
			}
		} else {
			DisplayUtils.removeFromParent(this.trainMc[id]);
		}
	}
}
ViewManager.ins().reg(NewLilianWin, LayerManager.UI_Popup);