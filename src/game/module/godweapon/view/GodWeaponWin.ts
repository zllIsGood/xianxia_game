class GodWeaponWin extends BaseEuiView {
	private viewStack: eui.ViewStack;
	private weaponGroup: GwWeaponView;//神兵技能
	private mijingGroup: GwFubenView;//桃源试炼
	private gwBoss: GwBossView;
	private roleSelect: RoleSelectPanel;
	private closeBtn: eui.Button;//关闭按钮
	private help: eui.Button;//关闭按钮
	private tab: eui.TabBar;
	private _selectIndex: number = -1;

	private gwadImg: eui.Image;//预告图片
	private totalNumber: number;
	private timeBp: eui.BitmapLabel;

	//红点
	private gwRp: eui.Image;
	private mjRp: eui.Image;
	private gwBossRp: eui.Image;
	//圣物红点
	public mixRp: eui.Image;
	public constructor() {
		super();
		this.skinName = "GwSkin";
		this.isTopLevel = true;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}



	public init() {
		this.gwRp.visible = false;
		this.mjRp.visible = false;
		this.gwBossRp.visible = false;
		// if (GameLogic.IS_OPEN_SHIELD) {
		// 	this.viewStack.removeChildAt(3);
		// }

	}

	public open(...param: any[]): void {
		this.observe(GodWeaponRedPoint.ins().postGwMj, this.updateRedPoint);
		this.observe(GodWeaponRedPoint.ins().postGwSb, this.updateRedPoint);
		this.observe(GodWeaponRedPoint.ins().postgGwBossRp, this.updateRedPoint);
		this.observe(GodWeaponRedPoint.ins().postGodWeaponItem, this.updateRedPoint);
		GodWeaponCC.ins().requestFubenInfo();
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		// if (GameServer.serverOpenDay < GlobalConfig.GodWeaponBaseConfig.openDay) {
		// 	this.gwadImg.visible = true;
		// 	this.gwadImg.source = `GwadBG_png`;//
		// 	this.tab.visible = false;
		// 	this.timeBp.visible = true;
		// 	this.gwTimeShow();//显示时间
		// 	return;
		// } else {
		this.gwadImg.visible = false;
		this.gwadImg.source = "";
		this.tab.visible = true;
		this.timeBp.visible = false;
		// }
		this.addChangeEvent(this.tab, this.itemTouchHandler);
		this.addChangingEvent(this.tab, this.itemTouching);
		//param[0] = 2;//debug测试默认打开圣物合成
		if (param[0] && this.checkIsOpen(param[0])) {
			this.viewStack.selectedIndex = param[0];
			this.selectIndex = this.tab.selectedIndex =  param[0];
		} else {
			this.viewStack.selectedIndex = 0;
			this.selectIndex = this.tab.selectedIndex = 0;
		}
		this.updateRedPoint();

	}
	//显示时间
	private gwTimeShow(): void {
		let days: number = GlobalConfig.GodWeaponBaseConfig.openDay - GameServer.serverOpenDay;
		let totalNum: number = days * DateUtils.SECOND_PER_DAY;
		this.totalNumber = totalNum - DateUtils.getTodayPassedSecond();
		this.updateAward();
		let num: number = this.totalNumber;
		TimerManager.ins().doTimer(1000, num, this.updateAward, this);
	}
	//每秒执行
	private updateAward(): void {
		if (this.totalNumber <= 0) {
			TimerManager.ins().remove(this.updateAward, this);
			this.updateOpen();
			return;
		}
		let str: string = DateUtils.getFormatBySecond(this.totalNumber, DateUtils.TIME_FORMAT_1);
		let temp: string[] = str.split(":");
		str = temp.join(".");
		this.timeBp.text = str;
		this.totalNumber--;
	}
	//正常打开界面
	private updateOpen(): void {
		this.gwadImg.visible = false;
		this.gwadImg.source = "";
		this.tab.visible = true;
		this.timeBp.visible = false;
		//正常打开
		this.viewStack.selectedIndex = 0;
		this.selectIndex = 0;
	}

	private updateRedPoint() {
		//红点
		this.gwRp.visible = GodWeaponRedPoint.ins().gwSbRed;
		this.mjRp.visible = GodWeaponRedPoint.ins().gwMjRed;
		this.gwBossRp.visible = GodWeaponRedPoint.ins().gwBossRp;
		this.mixRp.visible = GodWeaponRedPoint.ins().gwItem;
	}

	public close(...param: any[]): void {
		if (this._selectIndex > -1)
			this.viewStack.getChildAt(this._selectIndex)['close']();
	}
	private set selectIndex(value: number) {
		if (this._selectIndex > -1) {
			this.viewStack.getChildAt(this._selectIndex)['close']();
		}
		this._selectIndex = value;
		this.viewStack.getChildAt(this._selectIndex)['open']();

		if (this._selectIndex == 3) {
			this.help.visible = true;
		} else {
			this.help.visible = false;
		}
	}
	private get selectIndex(): number {
		return this._selectIndex;
	}
	//item点击
	private itemTouchHandler(e: egret.Event): void {
		this.selectIndex = this.tab.selectedIndex;
	}

	private itemTouching(e: egret.Event) {
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

	private checkIsOpen(selectIndex) {
		if (selectIndex >= 1) {
			// if (selectIndex == 3 && GameLogic.IS_OPEN_SHIELD) {
			// 	return false;
			// }
			// if (!GodWeaponCC.ins().godWeaponIsOpen()) {
			// 	UserTips.ins().showTips(`未激活神兵，无法查看`);
			// 	return false;
			// }
			if(UserZs.ins().lv >= GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel && GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay){
				return true;
			}else{
				if(UserZs.ins().lv < GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel){
					UserTips.ins().showTips(`角色转生等级${GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel}开启`);
				}else if(GameServer.serverOpenDay < GlobalConfig.GodWeaponBaseConfig.openDay){
					UserTips.ins().showTips(`开服${GlobalConfig.GodWeaponBaseConfig.openDay}天开启`);
				}
				return false;
			}
		}
		return true;
	}


	//关闭按钮
	private onTap(e: egret.TouchEvent): void {
		var tar = e.currentTarget;
		switch (tar) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.help:
				if (this._selectIndex == 3)
					ViewManager.ins().open(ZsBossRuleSpeak, 23);
				break;
		}

	}


	// public static openCheck(b): boolean {
	// 	if(UserZs.ins().lv >= GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel && GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay){
	// 		return true;
	// 	}else{
	// 		if(b == false){
	// 			if(UserZs.ins().lv < GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel){
	// 				UserTips.ins().showTips(`角色转生等级${GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel}开启`);
	// 			}else if(GameServer.serverOpenDay < GlobalConfig.GodWeaponBaseConfig.openDay){
	// 				UserTips.ins().showTips(`开服${GlobalConfig.GodWeaponBaseConfig.openDay}天开启`);
	// 			}
	// 		}
	// 		return false;
	// 	}
	// }
}
ViewManager.ins().reg(GodWeaponWin, LayerManager.UI_Main);