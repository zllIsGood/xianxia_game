/**
 * 玩法显示
 */
class PlayFunView extends BaseEuiView {
	public destoryView() {
	}

	private topGroup: eui.Group;
	private topMain: eui.Group;
	private downGroup: eui.Group;
	private leftGroup: eui.Group;
	private rightGroup: eui.Group;

	private mailBtn: eui.Group;
	private treasureHuntBtn: eui.Button;
	private shopBtn: eui.Button;
	private activityBtn: eui.Button;
	private activityFanli: eui.Button;
	private activityTehui: eui.Button;
	private activityExBtn: eui.Button; // 合服
	private activityFestivalBtn: eui.Button;
	private thanksBtn: eui.Button;
	private guildBtn: eui.Button;

	private boxBtn: eui.Button;
	private ringBtn: eui.Button;

	public btnFriends: eui.Button;
	private ladderBtn: eui.Button;
	/** 排行 */
	private rankBtn: eui.Button;

	private publicBossBtn: eui.Button;
	private fbBtn: eui.Button;
	private newBossRelive: eui.Group;
	private bossReliveArrow: BossReliveArrow;
	private reliveBossName: string;

	public taskTraceBtn: eui.Group;
	public taskTraceName: eui.Label;
	private taskTraceAwards: eui.Label;
	public rechargeBtn: eui.Button;
	public rechargeBtn0: eui.Button;
	private funcNoticeBtn: eui.Button;
	private funcNoticeLastLv: number = 0;
	public monthCard: eui.Button;
	private getMabi: eui.Button;
	public partner:eui.Button;
	public guildWar: eui.Button;
	private wpkboss: eui.Button;//世界boss
	private gsvip: eui.Button;//超级会员
	/**实名认证 */
	private renzhengBtn: eui.Button;

	private godWeaponBtn: eui.Button;//神兵按钮

	public passpointBtn: eui.Button;//泡点

	/**
	 * 开服功能预告按钮
	 */
	public newFuncNoticeBtn: eui.Button;

	public redBag: eui.Button;
	/** 野外boss提示 */
	private willBossPrompt: MovieClip;

	/** 自动挑战 */
	public autoPkBoss: eui.ToggleButton;

	//需要排列的按钮
	private btnSortList: eui.Button[][];
	public CDkey: eui.Button;

	/** 图标规则列表（RuleIconBase） */
	private ruleList = {};
	public ruleEff = {};
	private ruleParent = {};

	private btn_toolbar: eui.ToggleButton;

	/** 金钱 */
	private goldTxt: eui.Label;
	/** 元宝 */
	private ybTxt: eui.Label;

	/** 名字 */
	private nameTxt: eui.Label;
	/** 等级 */
	private lvTxt: eui.Label;

	public recharge1: eui.Button;
	public recharge2: eui.Button;

	public limitTask: eui.Button;
	public vipGift: eui.Button;
	public shareBtn: eui.Button;//分享
	public focusBtn: eui.Button;//关注
	public chongwu: eui.Button;

	private warmImage: eui.Image;
	private iconGroup: eui.Group;
	private headRedPoint: eui.Image;

	private mcGroup: eui.Group;
	private alphaGroup: eui.Group;
	public doubleEleven: eui.Button; //双十一

	public limitrecharge: eui.Button; //双十二充值
	public doubletwelve: eui.Button; //双十二活动


	private mapName0: eui.Label;

	//常驻图标
	private btnAlwaysList: eui.Button[];
	private rightBtnList: eui.Button[];
	private leftBtnList: eui.Button[];

	private groupGuanqia: eui.Group;
	private guanQicMc: MovieClip;

	private guanqiaEff0: eui.Group;
	private guanqiaBar: eui.ProgressBar;

	private guanQiaStarImg: eui.Image;

	private guanQiaLineMc: MovieClip;

	private taskAsseptMc: MovieClip;
	private taskComMc: MovieClip;
	private taskEffTypes: number[] = [];

	public pkBossBtnGroup: eui.Group;

	private maskImg: eui.Image;

	public location: eui.Group;

	private flameMC: MovieClip;
	private flameGroup: eui.Group;
	private fightImg: eui.Image;
	private power: eui.BitmapLabel;
	private tips: eui.Image;

	private vipGroup: eui.Group;
	private face: eui.Image;
	private set: eui.Image;
	// private vipImg0: eui.Image;
	private vipNum: eui.BitmapLabel;
	private vipBtn0: eui.Button;
	private taskTip: eui.Group;

	public btnGuanQiaGroup: eui.Group;

	private redPointVip0: eui.Image;

	private expGroup: eui.Group;
	private expTxt: eui.Label;

	public monster: eui.Group;
	public monsterRule: any;

	public preRecharge: boolean = false;
	public preVip: boolean = false;

	private city: eui.Button;

	public battle: eui.Button;

	private collectGroup: eui.Group;
	private collectBar: eui.ProgressBar; // 采集进度条
	private collectText: eui.Label;

	private awakeTaskBtn: eui.Button; // 唤醒任务入口按钮

	private funcNoticeEnter: eui.Button; // 功能预告入口

	private activitySevenBtn: eui.Button;// 七天乐

	private kftn: eui.Button;

	private collectgiftBtn: eui.Button; // 收藏有礼

	private invite: eui.Button; // 每日邀请

	private spring: eui.Button; // 春节活动
	private eightday: eui.Button; // 春节狂欢

	private itemQuickUse: QuickItemUseWin;
	private itemQuickUseGroup: eui.Group;

	private adddesk: eui.Button;

	private _flowerShowItem: FlowerShowItem;
	public floatedFlower:eui.Group;
	public flowerPic:eui.Image;
	private animType:number = 0;
	private Is_Play:boolean = true;

	public flower: eui.Group;

	//剑的黑烟特效
	public swordMc1: MovieClip = new MovieClip();
	public swordMc3: MovieClip = new MovieClip();

	private showViewList: { [key: number]: egret.DisplayObject };

	public hongbao: eui.Group;

	private barMask: egret.Shape;
	private sword_image: eui.Image;

	constructor() {
		super();
		this.touchEnabled = false;
	}

	@callLater
	public initData(): void {
		CommonUtils.labelIsOverLenght(this.goldTxt, Actor.gold);
		CommonUtils.labelIsOverLenght(this.ybTxt, Actor.yb);
		//设置名字
		this.nameTxt.text = Actor.myName;
		//设置等级
		this.expChange();

		this.power.text = Actor.power + "";

		// this.vipNum.x = UserVip.ins().lv >= 10 ? this.vipImg0.x + this.vipImg0.width : this.vipNum.x = this.vipImg0.x + this.vipImg0.width + 5;
		this.vipNum.text = UserVip.formatBmpLv(UserVip.ins().lv);
		this.upDataVipBtnRedPoint()
	}

	private btnSortCodeList: number[];
	private btnAlwaysCodeList: number[];

	public initUI(): void {
		super.initUI();

		this.skinName = "PlayFunSkin";

		this.showViewList = {};
		this.showViewList[PlayFunShow.topMain] = this.topMain;
		this.showViewList[PlayFunShow.leftGroup] = this.leftGroup;
		this.showViewList[PlayFunShow.rightGroup] = this.rightGroup;
		this.showViewList[PlayFunShow.downGroup] = this.downGroup;
		this.showViewList[PlayFunShow.topGroup] = this.topGroup;
		this.showViewList[PlayFunShow.btnGuanQiaGroup] = this.btnGuanQiaGroup;

		this.flameMC = new MovieClip();
		this.flameMC.x = 100;
		this.flameMC.y = 38;
		this.flameGroup.addChildAt(this.flameMC, 1);

		// this.power = BitmapNumber.ins().createNumPic(0, "8", 5);
		// this.power.scaleX = this.power.scaleY = 0.8;
		// this.power.x = this.fightImg.x + 53;
		// this.power.y = this.fightImg.y + 4;
		// this.flameGroup.addChild(this.power);

		this.guanQicMc = new MovieClip();
		// this.guanQicMc.x = 83;
		// this.guanQicMc.y = 81;
		this.guanQicMc.touchEnabled = false;

		this.expBallMc = new MovieClip;
		this.expBallMc.x = 80;
		this.expBallMc.y = 86;
		this.expBallMc.touchEnabled = false;

		this.guanQiaLineMc = new MovieClip();
		this.guanQiaLineMc.x = 83;
		this.guanQiaLineMc.y = 107;
		this.guanQiaLineMc.touchEnabled = false;

		this.taskAsseptMc = new MovieClip();
		this.taskAsseptMc.x = 140;
		this.taskAsseptMc.y = -60;
		this.taskAsseptMc.touchEnabled = false;

		this.taskComMc = new MovieClip();
		this.taskComMc.x = 140;
		this.taskComMc.y = -60;
		this.taskComMc.touchEnabled = false;

		let roleData: Role = SubRoles.ins().getSubRoleByIndex(0);
		// this.face.source = `yuanhead${roleData.job}${roleData.sex}`;
		this.face.source = `main_role_head${roleData.job}`;

		// this.vipNum = BitmapNumber.ins().createNumPic(UserVip.ins().lv, "zv0", 8);
		// this.vipNum.x = UserVip.ins().lv >= 10 ? this.vipImg0.x + this.vipImg0.width + 5 : this.vipNum.x = this.vipImg0.x + this.vipImg0.width + 10;

		// this.vipNum.y = this.vipImg0.y;
		// this.vipGroup.addChild(this.vipNum);

		this.guanqiaBar.slideDuration = 0;

		this.mailBtn.touchEnabled = true;

		this.btnAlwaysList = [
			this.boxBtn,
		];

		this.rightBtnList = [
			this.ladderBtn,
			this.fbBtn,
			this.publicBossBtn,
			this.godWeaponBtn,//神兵
		];
		this.leftBtnList = [
			this.rechargeBtn0,
			this.getMabi,
			this.monthCard,
			// this.partner
		];

		this.btnSortList = [
			[
				this.treasureHuntBtn,
				this.shopBtn,
				this.guildBtn,
				// this.rankBtn,
				this.CDkey,
				this.ringBtn,
				this.vipGift,
			],
			[
				this.gsvip,
				this.renzhengBtn,
				this.activityBtn,
				this.activityFanli,
				this.activityTehui,
				this.boxBtn,
				this.limitTask,
				this.thanksBtn,
				this.activityFestivalBtn,
				this.doubletwelve,
				this.limitrecharge,
				this.activitySevenBtn,
				this.activityExBtn,
			],
			[
				this.adddesk,
				this.shareBtn,
				this.focusBtn,
				// this.monthCard,
				this.doubleEleven,
				this.guildWar,
				this.wpkboss,
				this.battle,
				this.passpointBtn,
				this.chongwu,
				this.kftn,
				this.collectgiftBtn,
				this.invite,
				this.newFuncNoticeBtn,
				this.spring,
				this.eightday,
			]
		];

		this.btnSortCodeList = [];
		for (let i: number = 0; i < this.btnSortList.length; i++) {
			let btns = this.btnSortList[i];
			for (let j: number = 0; j < btns.length; j++) {
				this.btnSortCodeList[btns[j].hashCode] = 1;
			}
		}

		this.btnAlwaysCodeList = [];
		for (let i: number = 0; i < this.btnAlwaysList.length; i++) {
			let btn = this.btnAlwaysList[i];
			this.btnAlwaysCodeList[btn.hashCode] = 1;
		}

		this.funcNoticeBtn.visible = false;

		//邮件按钮特殊赋值
		this.mailBtn['redPoint'] = this['mailRedPoint'];
		this.mailBtn['count'] = this['count'];

		RuleIconBase.thisUpdate = this.updateRuleAndSort;
		RuleIconBase.thisObj = this;

		
		this.addRuleList(new ActivityIconRule(this.activityBtn));
		this.addRuleList(new ActivityIconRule_fanli(this.activityFanli));
		this.addRuleList(new ActivityIconRule_tehui(this.activityTehui));
		this.addRuleList(new ActivityExIconRule(this.activityExBtn));
		this.addRuleList(new ActivityFestivalIconRule(this.activityFestivalBtn));
		this.addRuleList(new ThanksIconRule(this.thanksBtn));
		this.addRuleList(new GuildIconRule(this.guildBtn));
		this.addRuleList(new BossIconRule(this.publicBossBtn));
		// this.addRuleList(new FirstRechargeIconRule(this.rechargeBtn));
		this.rechargeBtn.visible = false;
		this.addRuleList(new FirstRechargeIconRule(this.rechargeBtn0));
		this.groupGuanqia.touchEnabled = false;
		this.addRuleList(new GuangqiaIconRule(this.groupGuanqia));
		this.addRuleList(new MailIconRule(this.mailBtn));
		this.addRuleList(new TaskTraceIconRule(this.taskTraceBtn));
		this.addRuleList(new CDkeyIconRule(this.CDkey));
		this.addRuleList(new FbBtnIconRule(this.fbBtn));
		this.addRuleList(new LadderBtnIconRule(this.ladderBtn));
		this.addRuleList(new MonthCardIconRule(this.monthCard));
		// this.addRuleList(new PartnerIconRule(this.partner));
		this.addRuleList(new MaBiIconRule(this.getMabi));
		this.addRuleList(new FriendsIconRule(this.btnFriends));
		this.addRuleList(new GuildWarIconRule(this.guildWar));
		this.addRuleList(new RankIconRule(this.rankBtn));
		this.addRuleList(new GuildWarRedBagIconRule(this.redBag));
		this.addRuleList(new LimitTaskIconRule(this.limitTask));
		this.addRuleList(new TreasureIconRule(this.treasureHuntBtn));
		this.addRuleList(new MallIconRule(this.shopBtn));
		this.addRuleList(new BoxIconRule(this.boxBtn));
		this.addRuleList(new RingIconRule(this.ringBtn));
		this.addRuleList(new VipGiftIconRule(this.vipGift));
		this.addRuleList(new FunctionOpenIconRule(this.newFuncNoticeBtn));
		this.addRuleList(new NewWorldBossIconRule(this.wpkboss));
		this.addRuleList(new ShareIconRule(this.shareBtn));
		this.addRuleList(new FocusIconRule(this.focusBtn));
		this.addRuleList(new CityIconRule(this.city));
		this.addRuleList(new GodWeaponIconRule(this.godWeaponBtn));
		this.addRuleList(new DoubleElevenIconRule(this.doubleEleven));
		this.addRuleList(new DoubleTwelveRechargeIconRule(this.limitrecharge));
		this.addRuleList(new DoubleTwelveActivityIconRule(this.doubletwelve));
		this.addRuleList(new BattleIconRule(this.battle));
		this.addRuleList(new SuperVipIconRule(this.gsvip));
		this.addRuleList(new PaoDianIconRule(this.passpointBtn));
		this.addRuleList(new RenzhengIconRule(this.renzhengBtn));
		this.addRuleList(new HuanShouIconRule(this.chongwu));
		this.addRuleList(new AwakeIconRule(this.awakeTaskBtn));
		this.addRuleList(new FuncNoticeIconRule(this.funcNoticeEnter));
		this.addRuleList(new KFIconRule(this.kftn));
		this.addRuleList(new HappySevenDayIconRule(this.activitySevenBtn));
		this.addRuleList(new CollectGiftRule(this.collectgiftBtn));
		this.addRuleList(new InviteRule(this.invite));
		this.addRuleList(new AddDeskIconRule(this.adddesk));
		this.addRuleList(new SpringFestivalIconRule(this.spring));
		this.addRuleList(new SpringEightDayIconRule(this.eightday));
		this.guanqiaEff0.width = 90;
		this.guanqiaEff0.addChild(this.swordMc1);
		// this.guanqiaEff1.addChild(this.swordMc3);

		/**播放特效 */
		let swordMask = new egret.Rectangle(-45, -45, 90 * 2, 90 * 2);
		this.swordMc1.mask = swordMask;
		this.swordMc1.playFile(RES_DIR_EFF + "main_sword_bar", -1); 
		// this.swordMc3.playFile(RES_DIR_EFF + "main_sword_lizi", -1);

		// this.barMask = new egret.Shape();
		// this.barMask.x -= 5;
		// this.barMask.y += 4;
		// this.barMask.rotation = -90;
		// this.barMask.touchEnabled = false;
		// this.guanqiaEff0.addChild(this.barMask);

		// this.swordMc1.mask = this.barMask;

		// 屏蔽伙伴按钮
		this.partner.visible = false;
		
		this.vipNum.visible = WxTool.shouldRecharge();
		this.vipBtn0.visible = WxTool.shouldRecharge();	}

	public addRuleList(rule: RuleIconBase) {
		this.ruleList[rule.tar.hashCode] = rule;

		this.ruleParent[rule.tar.hashCode] = rule.tar.parent;
	}

	public addAllTouchEvent() {
		for (let i in this.ruleList) {
			let rule = this.ruleList[i];
			this.addTouchEvent(rule.tar, this.onTap);
		}
	}

	public removeAllTouchEvent() {
		for (let i in this.ruleList) {
			let rule = this.ruleList[i];
			this.removeTouchEvent(rule.tar, this.onTap);
		}
	}

	private showViews([handle, reverse]) {
		let value = 1;
		while (PlayFunShow[value]) {
			var b = (handle & value) == value;
			this.showView(value, reverse ? !b : b);
			value *= 2;
		}
	}

	public showView(handle: number, b: boolean) {
		this.showViewList[handle].visible = b;
	}

	public open(...param: any[]): void {

		this.addAllTouchEvent();
		this.addTouchEvent(this.btn_toolbar, this.onTap);
		this.addTouchEvent(this.treasureHuntBtn, this.onTap);
		this.addTouchEvent(this.funcNoticeBtn, this.onTap);
		this.addTouchEvent(this.autoPkBoss, this.onChange);
		this.addTouchEvent(this.btnFriends, this.onTap);
		this.addTouchEvent(this.rankBtn, this.onTap);
		this.addTouchEvent(this.redBag, this.onTap);
		this.addTouchEvent(this.vipBtn0, this.onTap);
		this.addTouchEvent(this.taskTraceBtn, this.onTaskTrace);
		this.addTouchEvent(this.sword_image, this.onTaskTrace);
		this.addTouchEvent(this.sword_image, this.guanqiaBarClick);

		this.addTouchEvent(this.face, this.onTap);
		this.addTouchEvent(this.set, this.onTap);
		this.addTouchEvent(this.expGroup, this.onTap);
		this.addTouchEvent(this.mapName0, this.onTap);
		this.observe(GameLogic.ins().postEnterMap, this.upDataGuanqia);
		this.observe(UserFb.ins().postGuanqiaInfo, this.upDataGuanQiaInfo);
		this.observe(UserTask.ins().postUpdteTaskTrace, this.changeTaskTrace);
		this.observe(UserTask.ins().postUpdteTaskTrace, this.updateTaskState);
		this.observe(UserFb.ins().postGqIdChange, this.guanqiaChange);
		this.observe(UserEquip.ins().postCheckHaveCan, this.updateTreasureHuntRedPoint);
		this.observe(Friends.ins().postFriendChange, this.updateFriendsApplys);
		this.observe(Rank.ins().postAllPraiseData, this.showRankRedPoint);
		this.observe(Rank.ins().postPraiseData, this.showRankRedPoint);
		this.observe(GameLogic.ins().postEnterMap, this.GuanQiaEffLogic);
		this.observe(Invite.ins().postCollectGift, this.updateCollectGiftRedPoint);
		this.observe(Invite.ins().postInvite, this.updateInviteRedPoint);

		this.observe(GameLogic.ins().postChildRole, this.initData);
		this.observe(Actor.ins().postGoldChange, this.initData);
		this.observe(Actor.ins().postYbChange, this.initData);
		this.observe(Actor.ins().postNameChange, this.initData);
		this.observe(Actor.ins().postPowerChange, this.initData);
		this.observe(GameLogic.ins().postExpMc, this.addExpFlyMc);
		this.observe(UserFb.ins().postAddEnergy, this.upDataGuanqia);
		this.observe(UserFb.ins().postPlayWarm, this.warmWord);

		this.observe(UserVip.ins().postUpdateVipData, this.initData);

		this.observe(UserVip.ins().postUpdataExp, this.upDataVipBtnRedPoint);
		this.observe(UserVip.ins().postUpdateVipAwards, this.upDataVipBtnRedPoint);
		this.observe(UserVip.ins().postUpdateWeekAwards, this.upDataVipBtnRedPoint);
		this.observe(Actor.ins().postLevelChange, this.updateHeadRedPoint);
		this.observe(GameLogic.ins().postLevelBarChange, this.updateLevelBar);
		this.observe(Actor.ins().postExp, this.checkGuide);

		this.observe(CityCC.ins().postEnterCity, this.hideCity);
		this.observe(CityCC.ins().postEscCity, this.showCity);

		this.observe(PlayFun.ins().postShowViews, this.showViews);

		this.observe(GameLogic.ins().postFlyItemTop, this.flyItemToRight);

		this.observe(UserFb.ins().postTeamFbFlowarRecords, this.updateFlower);
		this.observe(UserFb.ins().postTeamFbFlowarRecords1, this.AnimMethod);

		this.addTouchEvent(this.recharge1, this.onTap);
		this.addTouchEvent(this.recharge2, this.onTap);
		this.initData();

		this.upDataGuanQiaInfo();

		this.changeTaskTrace();

		this.updateFuncNoticeBtn();

		this.addRuleEvent();
		this.updateRules();
		this.updateTreasureHuntRedPoint();
		// this.checkBossTipsShow()
		this.upDataWillBoss(Encounter.ins().willBossID);
		this.updateHeadRedPoint();
		this.flameMC.playFile(RES_DIR_EFF + "zhanduolibeijing", -1);

		// 主界面创建时检测一次是否有快捷使用物品
		this.showQuickUse();
		
		this.publicBossRelive(false);
	}

	public close(...param: any[]): void {
		this.removeAllTouchEvent();
		this.removeTouchEvent(this.btn_toolbar, this.onTap);
		this.removeTouchEvent(this.treasureHuntBtn, this.onTap);
		this.removeTouchEvent(this.funcNoticeBtn, this.onTap);
		this.removeTouchEvent(this.autoPkBoss, this.onChange);
		this.removeTouchEvent(this.btnFriends, this.onTap);
		this.removeTouchEvent(this.rankBtn, this.onTap);
		this.removeTouchEvent(this.redBag, this.onTap);
		this.removeTouchEvent(this.recharge1, this.onTap);
		this.removeTouchEvent(this.recharge2, this.onTap);
		this.removeTouchEvent(this.taskTraceBtn, this.onTaskTrace);
		this.removeTouchEvent(this.guanqiaBar, this.onTaskTrace);
		this.removeTouchEvent(this.guanqiaBar, this.guanqiaBarClick);
		DisplayUtils.removeFromParent(this._flowerShowItem);
		this.removeGuanQiaEnergy();
		this.removeObserve();
		this.removeRuleEvent();
	}

	private hideCity() {
		this.city.visible = false;
	}

	private showCity() {
		this.city.visible = true;
	}

	/**开启自动闯关 */
	private pre = -1;

	/** 设置等级 */
	private expChange(lvl?: number): void {
		let lv: number = lvl || Actor.level;
		let zs: number = UserZs.ins() ? UserZs.ins().lv : 0;
		let strLv: string = "|C:0xF1D715&T:" + (zs ? zs + "转" : "") + "|";
		strLv = strLv + lv + "级";
		this.lvTxt.textFlow = TextFlowMaker.generateTextFlow(strLv);
	}

	public hideBtn(): void {
		this.iconGroup.visible = !this.btn_toolbar.selected;
	}

	public showHideBtnMainGroup(boo: boolean): void {
		this.btnGuanQiaGroup.visible = boo;
		if (boo) {
			this.recharge.visible = this.preRecharge;
			this.vip.visible = this.preVip;
		} else {
			this.recharge.visible = this.vip.visible = false;
		}
	}

	private addRuleEvent(): void {
		for (let i in this.ruleList) {
			let rule = this.ruleList[i];
			rule.addEvents();
			ResourceMgr.ins().reloadContainer(rule.tar);
		}
	}

	private removeRuleEvent(): void {
		for (let i in this.ruleList) {
			let rule = this.ruleList[i];
			rule.removeEvent();
		}
	}

	private updateRules(): void {
		TimerManager.ins().doTimer(100, 1, this.startUpdateRule, this);
	}

	private startUpdateRule(): void {
		for (let i in this.ruleList) {
			this.updateRule(this.ruleList[i]);
		}
		//排序按钮
		this.sortBtnList();
		//检测相关引导弹出页面
		this.checkGuide();
	}

	private checkGuide() {
		DieGuide.ins().checkFirstChargeOrVIPWin();
	}

	private updateRuleAndSort(rule: RuleIconBase): void {
		/**延迟刷新,缓解因为通信延迟而造成的update不及时*/
		TimerManager.ins().doTimer(100, 1, function () {
			this.updateRule(rule);
			//排序按钮
			this.sortBtnList();

			this.GuanQiaEffLogic();
		}, this);
	}

	private updateRule(rule: RuleIconBase): void {
		let tar = rule.tar;
		let isShow = rule.checkShowIcon();
		let count = 0;
		//跨服场景中不开启任何图标
		if (KFServerSys.ins().isLinkingKF) isShow = false;
		if (isShow) {
			let tarParent = this.ruleParent[tar.hashCode];
			tarParent.addChildAt(tar, rule.layerCount);
			// if (this.btnSortCodeList[tar.hashCode]) {
			// 	this.iconGroup.addChildAt(tar, rule.layerCount);
			// }
			// else {
			// 	this.addChildAt(tar, rule.layerCount);
			// }
			
			// // 第一次弹出首充按钮则弹出首充气泡图片
			// if (rule.ruleName == 'FirstRechargeIconRule') {
			// 	let recharge:number = Setting.ins().getValue(ClientSet.firstShowRechargeBtn)
			// 	if (recharge != 1) {
			// 		let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
			// 		if (view) {
			// 			view.setDieGuide(DieGuide.RECHARGE);
			// 		}
			// 		Setting.ins().setValue(ClientSet.firstShowRechargeBtn,1);
			// 	}
			// }

			if (tar['redPoint']) {
				count = rule.checkShowRedPoint();
				tar['redPoint'].visible = count;

				if (tar['count']) {
					tar['count'].text = count ? count : "";
				}

			}
			let effName = rule.getEffName(count);
			if (effName) {
				if (!this.ruleEff[tar.hashCode] || !this.ruleEff[tar.hashCode].parent) {
					let mc = this.getEff(tar.hashCode, effName);
					mc.x = rule.effX;
					mc.y = rule.effY;
					mc.scaleX = rule.effScale;
					mc.scaleY = rule.effScale;
					if (rule.effParent) {
						rule.effParent.addChild(mc);
					}
					else {
						tar.addChildAt(mc, 100);
					}
				}
				else {
					(<MovieClip>this.ruleEff[tar.hashCode]).play(-1);
				}
			} else {
				DisplayUtils.removeFromParent(this.ruleEff[tar.hashCode]);
			}
		}
		else {
			DisplayUtils.removeFromParent(tar);
			DisplayUtils.removeFromParent(this.ruleEff[tar.hashCode]);
		}
		tar.visible = isShow;
	}

	private getEff(value: number, effName?: string): MovieClip {
		this.ruleEff[value] = this.ruleEff[value] || new MovieClip;
		if (effName)
			(this.ruleEff[value] as MovieClip).playFile(RES_DIR_EFF + effName, -1);
		return this.ruleEff[value];
	}


	private onChange(e: egret.Event): void {
		if (this.autoPkBoss.selected) {
			if (Object.keys(Artifact.ins().getArtifactsOpenDic()).length <= 0) {
				UserTips.ins().showTips('|C:0xff0000&T:激活第一个神器开启');
				this.autoPkBoss.selected = false;
			} else if (UserFb.ins().guanqiaID < UserFb.AUTO_GUANQIA) {
				UserTips.ins().showTips(`|C:0xff0000&T:挑战至${UserFb.AUTO_GUANQIA}关开启`);
				this.autoPkBoss.selected = false;
			} else if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
				UserTips.ins().showTips(`背包剩余空位不足，请先清理`);
				this.autoPkBoss.selected = false;
			} else {
				this.GuanQiacleanEff();
				PlayFun.ins().openAuto();
			}
		} else {
			PlayFun.ins().closeAuto();
		}
		e.stopPropagation();
		e.stopImmediatePropagation();
	}

	private guanqiaChange(): void {
		this.maskImg.visible = (UserFb.ins().guanqiaID <= 10);
		this.updateFuncNoticeBtn();
	}

	private onTaskTrace(e: egret.TouchEvent) {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data.state == 0) {
			let config = UserTask.ins().getAchieveConfById(data.id);
			switch (config.control) {
				case GuideType.ChallengeBoss:
				case GuideType.AutoPk:
					if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
						return;
					}
					if (UserFb.ins().currentEnergy < UserFb.ins().energy) {
						this.showTaskTips(`能量未满无法挑战，请继续清怪。`);
					}
					if (config.control == GuideType.AutoPk) {
						// let cfg:AchievementTaskConfig = GlobalConfig.AchievementTaskConfig[UserTask.ins().taskTrace.id];
						Hint.ins().postKillBoss(config);
					}
					break;
				case GuideType.KillDeer:
					let text = `正在完成清怪任务，还差|C:0xf8b141&T:${config.target - data.value}|个。`;
					this.showTaskTips(text);
					break;
				case GuideType.FindNpc:
				case GuideType.FindTransPoint:
					UserTask.ins().checkTrace(data);
					break;
			}
		}
	}

	private guanqiaBarClick(e: egret.TouchEvent) {
		if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
			ViewManager.ins().open(BagFullTipsWin);
		} else {
			if (UserFb.ins().currentEnergy >= UserFb.ins().energy) {
				this.GuanQiacleanEff();
				UserFb.ins().autoPk();
			} else {
				// UserTips.ins().showTips("|C:0xf3311e&T:能量不足|");
			}

		}
	}

	public showTaskTips(text) {
		let tips = this.taskTip;
		let label = tips.getChildAt(1) as eui.Label;
		label.textFlow = TextFlowMaker.generateTextFlow1(text);
		egret.Tween.removeTweens(tips);
		tips.bottom = 182;
		tips.visible = true;
		egret.Tween.get(tips).to({ bottom: 232 }, 500).wait(2000).call(() => {
			tips.visible = false;
		});
	}

	private onTap(e: egret.TouchEvent): void {

		let tar = e.currentTarget;
		if (this.ruleList[tar.hashCode]) {
			this.ruleList[tar.hashCode].tapExecute();
			return;
		}
		switch (tar) {
			case this.willBossPrompt:
				ViewManager.ins().open(BossWin, 1);
				break;
			case this.funcNoticeBtn:
				let lv: number = UserFb.ins().guanqiaID;
				let config: FuncNoticeConfig = FuncNoticeWin.getFuncNoticeConfigById(lv);
				if (config.openLv - lv == 0)
					lv += 1;

				UserTips.ins().showFuncNotice(lv);
				break;
			case this.btn_toolbar:
				this.hideBtn();
				break;
			case this.recharge1:
				if(WxTool.shouldRecharge()) {
					let rdata: RechargeData = Recharge.ins().getRechargeData(0);
					if (!rdata || rdata.num != 2) {
						ViewManager.ins().open(Recharge1Win);
					} else {
						ViewManager.ins().open(ChargeFirstWin);
					}
				} else {
					// WarnWin.show("\n\n<font color='#f3311e'>iOS 暂不支持充值</font>", () => {
					// }, this, null, null, "sure");
				}

				break;
			case this.recharge2:
				// if (GameServer.serverOpenDay < 2) {
				// 	UserTips.ins().showTips("|C:0xf3311e&T:开服第三天开启摇钱树|");
				// 	return;
				// }
				// ViewManager.ins().open(FuliWin);
				if(WxTool.shouldRecharge()) {
					Shop.openBuyGoldWin();
				} else {
					// WarnWin.show("\n\n<font color='#f3311e'>iOS 暂不支持充值</font>", () => {
					// }, this, null, null, "sure");
				}
				break;
			case this.vipBtn0:
				ViewManager.ins().open(VipWin);
				break;
			case this.face:
			case this.set:
				ViewManager.ins().open(SettingView);
				if (this.headRedPoint.visible) {
					Setting.ins().setValue(ClientSet.headRed, 1);
					this.updateHeadRedPoint();
				}
				break;
			case this.expGroup:
			case this.mapName0:
				ViewManager.ins().open(EffectivenessTip, 1);
				break;
			case this.monthCard:
				ViewManager.ins().open(FuliWin, 2);
				break;
		}
	}

	private changeTaskTrace(): void {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data) {
			let config: AchievementTaskConfig = UserTask.ins().getAchieveConfById(data.id);
			if (!config) {
				console.log(`任务配置${data.id}不存在！`);
				return;
			}

			if (config.type == 79) {
				this.taskTraceAwards.textFlow = TextFlowMaker.generateTextFlow("|C:0x40df38&T:" + config.desc + "|");
			} else {
				this.taskTraceAwards.text = "" + config.desc;
			}
			switch (data.state) {
				case 0:
					let maxtarget = config.target;
					let value = data.value;
					if (config.type == 79) {//79写死0/1
						value = 0;
						maxtarget = 1;
					}
					//目标描述有误
					if (config.type == 36) {
						value -= 1;
						maxtarget -= 1;
					}
					this.taskTraceName.textFlow = TextFlowMaker.generateTextFlow(config.name + "|C:0xf3311e&T: (" + value + "/" + maxtarget + ")|");
					if (data.value == 0) GameGuider.stopTaskEffect();
					GameGuider.startTaskEffect();
					break;
				case 1:
					this.taskTraceName.textFlow = TextFlowMaker.generateTextFlow(config.name + "|C:0x35e62d&T: (已完成)|");
					GameGuider.stopTaskEffect();
					GameGuider.startTaskEffect();
					break;
			}
			let t: egret.Tween = egret.Tween.get(this.taskTraceAwards);
			t.to({
				"x": this.taskTraceAwards.x + 100,
				"alpha": 0
			}, 200).to({ "x": 0 }, 200).to({ "x": 61, "alpha": 1 }, 200);
			let t1: egret.Tween = egret.Tween.get(this.taskTraceName);
			t1.to({
				"x": this.taskTraceName.x + 100,
				"alpha": 0
			}, 200).to({ "x": 0 }, 200).to({ "x": 61, "alpha": 1 }, 200);
		} else {
			GameGuider.stopTaskEffect();
		}
	}

	private updateTaskState() {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (data) {
			if (data.state == 1) {
				if (this.taskAsseptMc.parent) {
					if (this.taskEffTypes.indexOf(1) < 0) this.taskEffTypes.push(1);
				} else if (!this.taskComMc.parent) {
					this.addTaskEffectIndex(1);
				}
			} else if (data.state == 0 && data.value == 0) {
				if (this.taskComMc.parent) {
					if (this.taskEffTypes.indexOf(0) < 0) this.taskEffTypes.push(0);
				} else if (!this.taskAsseptMc.parent) {
					this.addTaskEffectIndex(0);
				}
			}
		}
	}

	private addTaskEffectIndex(index: number) {
		if (index == 0) {
			this.taskTraceBtn.addChild(this.taskAsseptMc);
			this.taskAsseptMc.playFile(`${RES_DIR_EFF}receive`, 1, () => {
				TimerManager.ins().doNext(() => {
					if (this.taskEffTypes.length) {
						this.addTaskEffectIndex(this.taskEffTypes.shift());
					}
				}, this);
			});
			SoundUtil.ins().playEffect(SoundUtil.TASK);
			this.taskAsseptMc.y = -55;
		} else if (index == 1) {
			this.taskTraceBtn.addChild(this.taskComMc);
			this.taskComMc.playFile(`${RES_DIR_EFF}complete`, 1, () => {
				TimerManager.ins().doNext(() => {
					if (this.taskEffTypes.length) {
						this.addTaskEffectIndex(this.taskEffTypes.shift());
					}
				}, this);
			});
			this.taskComMc.y = -55;
		}
	}

	public lastEnergy: number = -1;

	private upDataGuanQiaInfo(): void {
		// this.expTxt.text = `${UserFb.ins().expEff}/小时`;
		this.expTxt.textFlow = TextFlowMaker.generateTextFlow(`|C:0x35e62d&T:${UserFb.ins().expEff}|/小时`);
		this.upDataGuanqia();
	}

	private upDataGuanqia(): void {
		let gqID = UserFb.ins().guanqiaID;
		this.mapName0.parent.visible = GameMap.fbType != UserFb.FB_TYPE_STORY;
		if (gqID >= 0 && GameMap.sceneInMain()) {
			this.groupGuanqia.visible = true;
			this.upDataExpMcBall(UserFb.ins().currentEnergy, UserFb.ins().energy);
			this.mapName0.textFlow = TextFlowMaker.generateTextFlow(`第|C:0x35e62d&T:${UserFb.ins().guanqiaID}|关`);
			if (UserFb.ins().energy && UserFb.ins().currentEnergy >= UserFb.ins().energy) {
				if (this.guanQicMc && !this.guanQicMc.parent) {
					this.guanQicMc.playFile(`${RES_DIR_EFF}main_sword_light`, -1);
					this.groupGuanqia.addChild(this.guanQicMc);
					this.guanqiaEff1.addChild(this.guanQicMc);
					this.guanqiaEff1.touchEnabled = this.guanQicMc.touchEnabled = false;
				}
			} else {
				if (UserFb.ins().energy > 0 && this.lastEnergy != UserFb.ins().currentEnergy && this.lastEnergy != -1) {
					this.playGuanQiaDoorMc();
				}
				DisplayUtils.removeFromParent(this.guanQicMc);
			}
			this.lastEnergy = UserFb.ins().currentEnergy;
		}
		else {
			DisplayUtils.removeFromParent(this.guanQicMc);
			this.lastEnergy = -1;
			this.groupGuanqia.visible = false;
		}
		if (gqID < UserFb.AUTO_GUANQIA)
			this.pkBossBtnGroup.visible = false;
		else
			this.pkBossBtnGroup.visible = true;


	}

	private removeGuanQiaEnergy(): void {
		DisplayUtils.removeFromParent(this.guanQicMc);
		let t: egret.Tween = egret.Tween.get(this._shap);
		UserFb.ins().currentEnergy = 0;
		t.to({ y: 120 }, 1500).call(() => {

		}, this);

		// let tt: egret.Tween = egret.Tween.get(this.guanQiaLineMc);
		// tt.to({ y: 107 }, 1500).call(() => {
		// 	this.setGuanqiaVis(0);
		// }, this);

	}

	private _shap: egret.Shape = new egret.Shape();
	private toHeight: number = 0;
	private mcWidth: number = 64;
	private mcHeight: number = 71;
	private _currHeight: number = 0;
	private _hasLoadBall: boolean = false;

	private setGuanqiaVis(value: number): void {
		// if (value > 0 && !this._hasLoadBall) {
		// 	this._hasLoadBall = true;
		// 	// this.expBallMc.playFile(RES_DIR_EFF + "guankaliudongeff", -1);
		// }
		// this.guanQiaLineMc.visible = this.expBallMc.visible = (value > 0);
	}

	private upDataExpMcBall(value, total): void {
		// this.setGuanqiaVis(value);
		// DisplayUtils.drawrect(this._shap, this.mcWidth, this.mcHeight);
		// this.toHeight = this.mcHeight * (value / total);
		// this.currHeight = this.toHeight >= this.mcHeight ? this.mcHeight : this.toHeight;
		this.setGuanQiaBar(value, total);
	}

	public set currHeight(value: number) {
		this._currHeight = value;
		let y: number = 120 - Math.floor(this._currHeight);
		let t: egret.Tween = egret.Tween.get(this._shap);
		t.to({ y: y }, 200).call(() => {
		
		}, this);
		
		let tt: egret.Tween = egret.Tween.get(this.guanQiaLineMc);
		tt.to({ y: y - 13 }, 200).call(() => {
		
		}, this);
	}

	public upDataWillBoss(id: number): void {
		if (id) {
			this.willBossPrompt = this.willBossPrompt || new MovieClip();
			this.willBossPrompt.playFile(RES_DIR_EFF + "zaoyuBoss", -1);
			this.willBossPrompt.y = 500;
			this.willBossPrompt.x = 330;
			this.willBossPrompt.touchEnabled = true;
			this.addTouchEvent(this.willBossPrompt, this.onTap);
			this.addChild(this.willBossPrompt);
		}
		else if (this.willBossPrompt) {
			DisplayUtils.removeFromParent(this.willBossPrompt);
			this.removeTouchEvent(this.willBossPrompt, this.onTap);
		}
	}

	public updateHeadRedPoint(): void {
		if (Actor.level >= 30 && !Setting.ins().getValue(ClientSet.headRed)) {
			this.headRedPoint.visible = true;
		} else {
			this.headRedPoint.visible = false;
		}
	}

	public updateLevelBar(lv: number) {
		this.expChange(lv);
	}


	public publicBossRelive(isShow: boolean, bossName: string = "", viewIndex: number = 0, headImage: string = ""): void {
		//取消提示，且boss名字不对应，则跳出处理
		if (!isShow && bossName && bossName != this.reliveBossName) return;
		let boo: boolean = UserBoss.ins().checkBossIconShow();

		PlayFun.ins().newBossRelive = isShow && boo && (GameMap.sceneInMain());
		if (PlayFun.ins().newBossRelive) {
			if (!this.bossReliveArrow) {
				this.bossReliveArrow = new BossReliveArrow();
				this.newBossRelive.addChild(this.bossReliveArrow);
			}
			this.bossReliveArrow.setBossName(bossName, viewIndex, headImage);
		}
		else {
			if (this.bossReliveArrow) {
				this.newBossRelive.removeChild(this.bossReliveArrow);
				this.bossReliveArrow = null;
			}
		}
		this.reliveBossName = isShow ? bossName : "1";
	}

	private checkBossTipsShow(): void {
		if (!GameMap.sceneInMain() && GameMap.fbType != UserFb.FB_TYPE_CITY && GameMap.fbType != UserFb.FB_TYPE_HEFUBOSS) {
			this.publicBossRelive(false);
			this.showHideBtnMainGroup(false);
		} else {
			this.showHideBtnMainGroup(true);
		}
	}


	/** 更新仓库红点 */
	private updateTreasureHuntRedPoint(b: number = 0): void {
		//寻宝仓库是否有道具
		// let bool: boolean = Boolean(UserBag.ins().getHuntGoods(0).length);
		// this.treasureHuntBtn['redPoint'].visible = UserEquip.ins().isFind || bool;
	}

	private sortBtnList(): void {
		let starX: number = this.width - 156;
		let starY: number = 0;
		let btn: eui.Button;

		let showNum: number = 0;

		for (let row = 0; row < this.btnSortList.length; row++) {
			showNum = 0;
			for (let i = 0; i < this.btnSortList[row].length; i++) {
				btn = this.btnSortList[row][i];
				if (btn && btn.visible && btn.parent) {
					btn.x = starX - showNum * 80;
					btn.y = starY + row * 80;
					showNum += 1;
				}
			}
		}

		showNum = 0;
		for (let j: number = 0; j < this.rightBtnList.length; j++) {
			btn = this.rightBtnList[j];
			if (btn) {
				if (btn.visible && btn.parent) {
					btn.bottom = 315 + showNum * 70;
					showNum++;
				}
			}
		}

		showNum = 0;
		for (let j: number = 0; j < this.leftBtnList.length; j++) {
			btn = this.leftBtnList[j];
			if (btn) {
				if (btn.visible && btn.parent) {
					btn.left = 10;
					btn.top = 522 - showNum * 76;
					showNum++;
				}
			}
		}


	}

	private updateCollectGiftRedPoint() {
		this.updateRule(this.ruleList[this.collectgiftBtn.hashCode]);
	}

	private updateInviteRedPoint() {
		this.updateRule(this.ruleList[this.invite.hashCode]);
	}

	private updateFriendsApplys(): void {
		this.updateRule(this.ruleList[this.btnFriends.hashCode]);
	}

	/** 排行红点提示 */
	private showRankRedPoint() {
		this.updateRule(this.ruleList[this.rankBtn.hashCode]);
	}

	private updateFuncNoticeBtn(): void {
		let lv: number = UserFb.ins().guanqiaID;
		let config = FuncNoticeWin.getFuncNoticeConfigById(lv);
		this.funcNoticeBtn.visible = false;
		if (!config) return;

		let bool = (config.openLv - lv <= 10);
		if (bool) {
			if (config.openLv - lv == 0) {
				if (lv - this.funcNoticeLastLv == 1)
					UserTips.ins().showFuncNotice(lv);
				config = FuncNoticeWin.getFuncNoticeConfigById(lv + 1);
				if (!config || config.openLv - lv > 10)
					bool = false;
			}
			if (bool) {
				this.funcNoticeBtn["iconDisplay"].source = "yg_" + config.index + "0";
				this.funcNoticeBtn["txt"].text = `${config.openLv}关开启`;
				if (config.index == 2) {
					this.funcNoticeBtn["iconDisplay"].x = 15;
					this.funcNoticeBtn["iconDisplay"].y = 0;
				}
				else {
					this.funcNoticeBtn["iconDisplay"].x = 3;
					this.funcNoticeBtn["iconDisplay"].y = -30;
				}
			}
		}
		this.funcNoticeLastLv = lv;
		this.funcNoticeBtn.visible = bool;
	}

	private addExpFlyMc(mon: CharMonster) {
		if (GameMap.fbType == UserFb.FB_TYPE_EXP) return;
		if (!UserFb.ins().checkGuanqiaIconShow()) {
			UserFb.ins().postAddEnergy();
			return;
		}
		let movieExp: eui.Image = new eui.Image();
		movieExp.source = "point";
		movieExp.anchorOffsetX = 20;
		movieExp.anchorOffsetY = 20;
		let map: MapView = ViewManager.gamescene.map;
		let point: egret.Point = this.localToGlobal();
		map.globalToLocal(point.x, point.y, point);
		movieExp.x = mon.x - point.x;
		movieExp.y = mon.y - point.y;
		this.addChild(movieExp);

		let tweenX: number = this.groupGuanqia.x + 60;
		let tweenY: number = this.groupGuanqia.y + 60;

		let t: egret.Tween = egret.Tween.get(movieExp);
		t.to({ x: tweenX, y: tweenY, alpha: 0.5 }, 600).call(() => {
			UserFb.ins().postAddEnergy();
			this.removeChild(movieExp);
			egret.Tween.removeTweens(movieExp);
		}, this);

		let tt: egret.Tween = egret.Tween.get(movieExp, { "loop": true });
		tt.to({ "rotation": movieExp.rotation + 360 }, 800);
	}

	public expBallMc: MovieClip;
	public guanqiaEff1: eui.Group;
	public eyesMc: MovieClip;

	private playGuanQiaDoorMc(): void {
		// let guanQiqDoorMc: MovieClip = new MovieClip();
		// guanQiqDoorMc.x = 82;
		// guanQiqDoorMc.y = 83;
		// this.groupGuanqia.addChild(guanQiqDoorMc);
		//  guanQiqDoorMc.playFile(RES_DIR_EFF + "guankamenkuangeff", 1);
		// if (!this.eyesMc)
		// 	this.eyesMc = new MovieClip();
		// if (!this.eyesMc.parent)
		// 	this.guanqiaEff1.addChild(this.eyesMc);
		// this.eyesMc.playFile(RES_DIR_EFF + "guankaeye", 1);
	}

	private warmWord(num: number) {
		if (num) {
			if (GameMap.sceneInMain()) {
				this.mcGroup.visible = true;
				this.aniShadow();
				this.removeGuanQiaEnergy();
			}
		} else {
			this.mcGroup.visible = false;
			egret.Tween.removeTweens(this.alphaGroup);
		}
	}

	public aniShadow(): void {
		this.warmImage.visible = true;
		egret.Tween.removeTweens(this.warmImage);
		let t = egret.Tween.get(this.warmImage);
		this.warmImage.alpha = 0.23;
		t.to({ alpha: 0.9 }, 300).wait(500).to({ alpha: 0 }, 300)
			.call(() => {
				egret.Tween.removeTweens(this.warmImage);
			});

		this.alphaGroup.alpha = 1;
		this.alphaGroup.x = this.mcGroup.width+this.alphaGroup.width/2;
		egret.Tween.removeTweens(this.alphaGroup);
		egret.Tween.get(this.alphaGroup)
			.to({x:this.mcGroup.width/2},300,egret.Ease.sineOut)
			.wait(500)
			.to({alpha:0,x:-this.alphaGroup.width/2},300,egret.Ease.sineIn)
			.call(()=>{
				this.warmImage.visible = false;
				this.mcGroup.visible = false;
				egret.Tween.removeTweens(this.alphaGroup);
			});

	}

	private upDataVipBtnRedPoint(): void {
		if (WxTool.shouldRecharge()) {
			this.redPointVip0.visible = UserVip.ins().getVipState();	
		} else {
			this.redPointVip0.visible = false;
		}
	}

	public recharge: eui.Group;
	public vip: eui.Group;
	private cz: eui.Image;
	private v: eui.Image;

	public setDieGuide(dieType: number) {
		switch (dieType) {
			case DieGuide.RECHARGE:
				if(WxTool.shouldRecharge()) {
					this.preRecharge = this.recharge.visible = true;
					this.cz.source = "swyd_firstrecharge_png";
					this.cz.touchEnabled = this.recharge.touchEnabled = false;
				}
				break;
			case DieGuide.VIP:
				this.preVip = this.vip.visible = true;
				this.v.source = "swyd_vip_png";
				this.v.touchEnabled = this.vip.touchEnabled = false;
				break;
		}
	}

	//关卡进度条
	private setGuanQiaBar(cur: number, total: number) {
		
		let curValue: number = cur;
		let maxValue: number = total;
		if (curValue >= maxValue)
			curValue = maxValue;
			// this.guanqiaBar.value = curValue;
		// this.guanqiaBar.maximum = maxValue;
		// this.swordMc3.visible = (cur != total && cur > 20);
		// this.swordMc3.y = (this.guanqiaBar.height / 2) - this.guanqiaBar.height * (cur / total) + 11;
		// this.guanqiaBar.labelFunction = function () {
			// return ``;
		// }
		let mask = this.swordMc1.mask;
		mask.y = -45 + 90 * (1 - (curValue / total));
		
		// let a = cur / total;
		// let init = 0;
		// let max = 360;
		// DisplayUtils.drawCir(this.barMask, this.guanqiaEff0.width / 2, Math.floor(max * a), false, init);
	}

	//新手新穿戴装备提示（NewEquip监测调用）
	private equipTips: NewEquipWin;

	public updateNewEquip() {
		if (!this.equipTips)
			return;
		this.equipTips.open();
	}

	/**关卡按钮的特效逻辑*/
	private arrow: GuideArrow;
	private eff: MovieClip;

	public GuanQiaEffLogic() {
		if (!GameMap.sceneInMain()) {
			DisplayUtils.removeFromParent(this.eff);
			DisplayUtils.removeFromParent(this.arrow);
			if (this.arrow)
				egret.Tween.removeTweens(this.arrow);
			this.arrow = null;
			this.eff = null;
			return;
		}
		if (this.guanqiaBar && UserFb.ins().showAutoPk == 0) {
			UserFb.ins().showAutoPk = 1;
			if (!this.arrow) {
				this.arrow = new GuideArrow;
				this.arrow.touchEnabled = false;
				this.arrow.lab.text = "点击挑战关卡";
				// this.self.addChild(this.arrow);
				// this.arrow.x = this.guanqiaBar.x;
				// this.arrow.y = this.guanqiaBar.y+this.guanqiaBar.height/2;
				this.addChild(this.arrow);
				let point: egret.Point = this.guanqiaEff0.localToGlobal();
				this.globalToLocal(point.x, point.y, point);
				this.arrow.x = point.x - 45;
				this.arrow.y = point.y + 5;
				if (!this.eff) {
					this.eff = new MovieClip;
					this.eff.playFile(RES_DIR_EFF + "guideff", -1);
					this.groupGuanqia.addChild(this.eff);
					this.eff.x = this.guanqiaBar.x + this.guanqiaBar.width / 2 - 5;
					this.eff.y = this.guanqiaBar.y + this.guanqiaBar.height / 2 + 10;
				}
				egret.Tween.get(this.arrow, { loop: true }).to({ x: this.arrow.x + 40 }, 1000).to({ x: this.arrow.x }, 1000);
				egret.Tween.get(this, { loop: false }).wait(5000).call(() => {
					UserFb.ins().showAutoPk = -1;
					DisplayUtils.removeFromParent(this.eff);
					DisplayUtils.removeFromParent(this.arrow);
					if (this.arrow)
						egret.Tween.removeTweens(this.arrow);
					this.arrow = null;
					this.eff = null;
				});
			}
		}
	}

	public GuanQiacleanEff() {
		UserFb.ins().showAutoPk = -1;
		DisplayUtils.removeFromParent(this.eff);
		DisplayUtils.removeFromParent(this.arrow);
		if (this.arrow)
			egret.Tween.removeTweens(this.arrow);
		this.arrow = null;
		this.eff = null;
	}

	public playUIEff(...param: any[]): void {
		// if (UserFb.ins().showAni) {
		// 	UIAnimation.setAnimation(this.ladderBtn, UIAnimation.ANITYPE_FADEIN_RIGHT_HOR, { time: 100 });
		// 	UIAnimation.setAnimation(this.fbBtn, UIAnimation.ANITYPE_FADEIN_RIGHT_HOR, { time: 200 });
		// 	UIAnimation.setAnimation(this.publicBossBtn, UIAnimation.ANITYPE_FADEIN_RIGHT_HOR, { time: 300 });
		// 	UIAnimation.setAnimation(this.groupGuanqia, UIAnimation.ANITYPE_FADEIN_RIGHT_HOR, { time: 400 });
		// } else {
		// 	UserFb.ins().showAni = true;
		// }
		// egret.log( "this.ladderBtn = "+egret.getQualifiedClassName(this.ladderBtn) );
		// egret.log( "this.taskTraceBtn = "+egret.getQualifiedClassName(this.taskTraceBtn) );
		// egret.log( "this.autoPkBoss = "+egret.getQualifiedClassName(this.autoPkBoss) );
		// egret.log( "this.face = "+egret.getQualifiedClassName(this.face) );
	}

	private flyItemToRight(item: ItemBase) {
		if (item) {
			let p1 = { x: this.width / 2, y: this.height / 2 };
			let p2 = this.ybTxt.parent.localToGlobal(this.ybTxt.x, this.ybTxt.y);
			let img = new eui.Image(item["itemIcon"].imgIcon.source);
			this.addChild(img)
			img.x = p1.x;
			img.y = p1.y;

			egret.Tween.get(img).to({ x: p2.x, y: p2.y }, 1700, egret.Ease.sineOut).call(() => {
				DisplayUtils.removeFromParent(img);
			});
		}
	}

	/*
		采集进度条
		time: 采集时长,单位秒,到小数点后1位
		colllectDes: 采集描述
		callback: 采集完成回调
		callbackObj: 完成回调所属对象
	 */
	public showCollectBar(time: number, colllectDes: string, callback: Function, callbackObj: any): void {
		this.stopCollectBar();
		this.collectGroup.visible = true;
		this.collectText.text = colllectDes;
		this.collectBar.minimum = 0;
		this.collectBar.maximum = time*1000;
		this.collectBar.value = 0;
		TimerManager.ins().doTimer(10,time*100,this.updateCollectBar,this,callback,callbackObj);
	}

	private updateCollectBar(): void {
		this.collectBar.value += 10;
		if (this.collectBar.value >= this.collectBar.maximum) {
			this.collectGroup.visible = false;
		}
	}

	private stopCollectBar(): void {
		TimerManager.ins().remove(this.updateCollectBar, this);
		this.collectGroup.visible = false;
	}

	// 道具快捷使用
	public showQuickUse(): void {
		if (this.itemQuickUse) {
			DisplayUtils.removeFromParent(this.itemQuickUse);
			this.itemQuickUse = null;
		}
		let quickUseData = UserBag.ins().itemQuickUseList[UserBag.ins().itemQuickUseList.length-1];
		if (quickUseData) {
			this.itemQuickUse = new QuickItemUseWin();
			this.itemQuickUse.open(quickUseData);
			this.itemQuickUseGroup.addChild(this.itemQuickUse);
		}
	}

	//鲜花记录入口
	private updateFlower(): void {
		if (!this._flowerShowItem) {
			this._flowerShowItem = new FlowerShowItem();
			this.flower.addChild(this._flowerShowItem);
			return;
		}

		if (!this._flowerShowItem.parent)
			this.flower.addChild(this._flowerShowItem);

		this._flowerShowItem.showEffect();
	}

	/** 移除鲜花入口 */
	public removeFlowerItem(): void {
		DisplayUtils.removeFromParent(this._flowerShowItem);
	}

	private AnimMethod():void{
		let data = UserFb.ins().FlowerRecords;
		let len = data.length;
		if(len<= 0 ) return;
		if(this.Is_Play){
			this.Is_Play = false;
			// console.warn("进来了")
			let flowerData = data.shift();
			let config = GlobalConfig.FlowerConfig;
			
			for(let j in config){
				if (flowerData.id == config[j].id){
					if (config[j].animation == 1){
						ParticleController.ins().playParticle("8",this,10000);
						ParticleController.ins().playParticle("6",this,10000);
						ParticleController.ins().playParticle("7",this,10000);
					} else if (config[j].animation == 2){
						ParticleController.ins().playParticle("1",this,10000);
						ParticleController.ins().playParticle("2",this,10000);
						ParticleController.ins().playParticle("3",this,10000);
					}
					this.doTimer();
					break;
				}
			}
		}
	}

	private doTimer():void{
		TimerManager.ins().doTimer(14000,1,this.StopAnim,this);
	}

	private StopAnim():void{
		// console.warn("出去了")
		this.Is_Play = true;
		if (UserFb.ins().FlowerRecords.length>0){
			this.AnimMethod();
		} else {
			this.RemoveAnim();
		}
	}

	private RemoveAnim():void{
		TimerManager.ins().remove(this.StopAnim, this);
	}
}

ViewManager.ins().reg(PlayFunView, LayerManager.Main_View);