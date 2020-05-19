class BossHomeMainWin extends BaseView {
	private list: eui.List;

	private titleList: eui.List;
	/** 恢复次数剩余时间 */
	private timeTxt: eui.Label;
	/** boss提醒设置 */
	private setting: eui.Label;
	/** boss自动挑战 */
	private autofigh: eui.Label;
	private di: eui.Image;

	private titleText: eui.Label;

	private listData: eui.ArrayCollection;

	private titleListData: eui.ArrayCollection;

	/** 是否开始计时，防止重复注册计时器 */
	private isStartTime: boolean = false;

	private type: number = 0;

	private vipTipTxt: eui.Label;

	private mainGroup: eui.Group;

	private rukou: eui.Group;

	// private groupList: eui.List;
	private bosshome0: eui.Group;
	private bosshome1: eui.Group;
	private bosshome2: eui.Group;
	private bosshome3: eui.Group;

	private rewardList0: eui.List;
	private rewardList1: eui.List;
	private rewardList2: eui.List;
	private rewardList3: eui.List;

	private currData;

	private restoreTime = 0;

	private lastIndex: number = -1;

	private isClickItem: boolean = false;

	constructor() {
		super();
		// this.skinName = `VipBossPanelSkin2`;
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		// this.groupList.itemRenderer = HomeBossGroupItem;

		this.list.itemRenderer = HomeBossItem;

		this.titleList.itemRenderer = VipBossItem;
		this.setting.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.setting.text}</u></a>`);
		this.setting.touchEnabled = true;

		// this.autofigh.visible = false
		this.autofigh.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.autofigh.text}</u></a>`);
		this.autofigh.touchEnabled = true;
		// this.setting.visible = false;

		this.listData = new eui.ArrayCollection();
		this.list.dataProvider = this.listData;
		let tArr = []
		for (let k in GlobalConfig.BossHomeConfig) {
			tArr.push(k);
		}
		this.titleList.dataProvider = new eui.ArrayCollection(tArr);

		// this.groupList.dataProvider = new eui.ArrayCollection(tArrSp);
		this.setLoginView();
	}

	public open(...param): void {
		this.setGroupVis(true);
		this.type = UserBoss.BOSS_SUBTYPE_HOMEBOSS;
		this.lastIndex = -1;
		this.titleList.selectedIndex = 0;
		this.observe(UserBoss.ins().postWorldBoss, this.setData);
		this.setting.addEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.autofigh.addEventListener(egret.TextEvent.LINK, this.onLink1, this);
		this.titleList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onClickMenu, this);
		this.addTouchEvent(this.bosshome0, this.onTap);
		this.addTouchEvent(this.bosshome1, this.onTap);
		this.addTouchEvent(this.bosshome2, this.onTap);
		this.addTouchEvent(this.bosshome3, this.onTap);

		this.rewardList0.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList1.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList2.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList3.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);

		// this.groupList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onRukouClick, this);
		this.setData();
		this.BtnStatus()
	}

	public close(): void {
		this.setting.removeEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.autofigh.removeEventListener(egret.TextEvent.LINK, this.onLink1, this);
		this.rewardList0.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList1.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList2.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.rewardList3.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}

	//自动挑战按钮显示状态-----------------------------------------------------------------------
	private BtnStatus():void{
		if (Recharge.ins().leftTime > 0){
			//激活
			this.di.source = "";
		} else if (Recharge.ins().leftTime == 0){
			//未激活
			this.di.source = "";
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bosshome0:
				this.onRukouClick(0);
				break;
			case this.bosshome1:
				this.onRukouClick(1);
				break;
			case this.bosshome2:
				this.onRukouClick(2);
				break;
			case this.bosshome3:
				this.onRukouClick(3);
				break;
			case this.rewardList0:
			case this.rewardList1:
			case this.rewardList2:
			case this.rewardList3:
				this.isClickItem = true;
				break;
		}
	}

	private onRukouClick(num: number): void {
		if (this.isClickItem) {
			this.isClickItem = false;
			return;
		}
		let config: BossHomeConfig = GlobalConfig.BossHomeConfig[num + 1];
		if (UserVip.ins().lv < config.vip) {
			UserTips.ins().showTips(`${UserVip.formatLvStr(config.vip)}开启`);
			return;
		}
		this.titleList.selectedIndex = num;
		this.setGroupVis(false);
		this.setData();
	}

	private setGroupVis(boo: boolean): void {
		this.rukou.visible = boo;
		this.mainGroup.visible = !boo;
	}

	private onClickMenu(e: eui.ItemTapEvent): void {
		// this.currData = this.list.dataProvider.getItemAt(e.itemIndex);
		this.setData();
	}

	private setLoginView(): void {
		for (let i: number = 0; i < 4; i++) {
			let config: BossHomeConfig = GlobalConfig.BossHomeConfig[i + 1];
			this[`rewardList${i}`].itemRenderer = ItemBase;
			this[`rewardList${i}`].dataProvider = new eui.ArrayCollection(config.icon);
			this[`vipImg${i}`].text = UserVip.formatBmpLv(config.vip);
			// let str1:string = config.zsLevel>0?`${config.zsLevel}转`:`${config.level}级`;
			// let str2:string = config.zsLevel>0?`${config.zsLevel}转`:`${config.level}级`;

		}
	}

	setData() {
		if (this.lastIndex == this.titleList.selectedIndex) {
			return;
		}
		this.lastIndex = this.titleList.selectedIndex;

		let scro: eui.Scroller = this.list.parent as eui.Scroller;
		scro.stopAnimation();
		this.list.scrollV = 0;

		let tempArr: WorldBossItemData[] = UserBoss.ins().worldInfoList[this.type].slice();
		let bossInfos: WorldBossItemData[] = [];
		// let dieArr: WorldBossItemData[] = [];
		let canPlayArr: WorldBossItemData[] = [];
		let canPlayDieArr: WorldBossItemData[] = [];
		let canNotPlayArr: WorldBossItemData[] = [];
		let canNotPlayDieArr: WorldBossItemData[] = [];
		let canNotLevel: WorldBossItemData[] = [];
		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;

		let index: number = this.titleList.selectedIndex + 1;
		let baseConfig = GlobalConfig.BossHomeConfig[index];
		let bossIdArr = baseConfig.boss;

		this.titleText.text = `VIPBOSS ${index}层`;

		this.vipTipTxt.text = `${UserVip.formatLvStr(baseConfig.vip)}无限挑战`;
		for (let i: number = 0; i < tempArr.length; i++) {
			if (bossIdArr.indexOf(tempArr[i].id) == -1) continue;
			let isDie: boolean = (tempArr[i].bossState == 2);

			let bossConfig: WorldBossConfig = GlobalConfig.WorldBossConfig[tempArr[i].id];
			let bossLv: number = bossConfig.zsLevel * 1000 + bossConfig.level;
			if (roleLv < bossLv) {
				canNotLevel.push(tempArr[i]);
			} else {
				let boo: boolean = UserBoss.ins().getBossRemindByIndex(tempArr[i].id,1);
				if (boo) {
					if (isDie) {
						canPlayDieArr.push(tempArr[i]);
					} else {
						canPlayArr.push(tempArr[i]);
					}
				} else {
					if (isDie) {
						canNotPlayDieArr.push(tempArr[i]);
					} else {
						canNotPlayArr.push(tempArr[i]);
					}
				}
			}

		}
		canPlayArr.sort(this.compareFn);
		canPlayDieArr.sort(this.compareFn);
		canNotPlayArr.sort(this.compareFn);
		canNotPlayDieArr.sort(this.compareFn);
		canNotLevel.sort(this.compareFn);
		bossInfos = canPlayArr.concat(canPlayDieArr, canNotPlayArr, canNotPlayDieArr, canNotLevel);
		this.listData.replaceAll(bossInfos);
		this.currData = bossInfos[0];
		// this.updateTime();
		// TimerManager.ins().doTimer(100, 0, this.updateTime, this);

		if (!this.isStartTime) {
			TimerManager.ins().doTimer(1000, 0, this.updateTime, this);
			this.restoreTime = UserBoss.ins().worldBossrestoreTime[this.type];
			this.isStartTime = true;
			this.updateTime();
		}
	}

	// private updateTime(): void {
	// 	let model: WorldBossItemData = this.currData;
	// 	let time: number = model.relieveTime - egret.getTimer();
	// 	this.timeTxt.text = `${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}后刷新`;
	// 	if (time <= 0) {
	// 		// UserBoss.ins().sendBossList();
	// 		UserBoss.ins().sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_HOMEBOSS);
	// 		TimerManager.ins().remove(this.updateTime, this);
	// 	}
	// }


	/** 更新恢复次数剩余时间计时 */
	private updateTime(): void {
		if (this.timeTxt == undefined) return;
		let model: WorldBossItemData = this.currData;
		let time: number = model.relieveTime - egret.getTimer();
		if (time <= 0) {
			//移除计时器
			TimerManager.ins().remove(this.updateTime, this);
			this.isStartTime = false;
			//挑战次数满了隐藏计时文本，否则请求计时数据
			this.timeTxt.visible = false;
			UserBoss.ins().sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_HOMEBOSS);
		} else {
			if (!this.timeTxt.visible) this.timeTxt.visible = true;
			this.timeTxt.text = `${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}后刷新`;
		}
	}

	private compareFn(a: WorldBossItemData, b: WorldBossItemData): number {
		let configA: WorldBossConfig = GlobalConfig.WorldBossConfig[a.id];
		let configB: WorldBossConfig = GlobalConfig.WorldBossConfig[b.id];

		if (configA.zsLevel < configB.zsLevel) {
			return 1;
		} else if (configA.zsLevel > configB.zsLevel) {
			return -1;
		}

		if (configA.level < configB.level)
			return 1;
		else if (configA.level > configB.level)
			return -1;
		else
			return 0;
		// }
	}

	private onTouch(): void {
		GameGuider.guidance(egret.getQualifiedClassName(ForgeWin), 2);
	}

	private onLink(): void {
		ViewManager.ins().open(PubBossRemindWin, UserBoss.BOSS_SUBTYPE_HOMEBOSS);
	}

	private onLink1(): void {
		if(Recharge.ins().leftTime == 0){
			UserTips.ins().showTips(`特权月卡激活自动挑战`);
		} else if (Recharge.ins().leftTime>0) {
			ViewManager.ins().open(PubBossAotuFighWin, UserBoss.BOSS_SUBTYPE_HOMEBOSS);
		}
	}
}