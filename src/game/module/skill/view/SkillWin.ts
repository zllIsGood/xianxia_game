/**
 * 转生界面
 */
class SkillWin extends BaseEuiView {
	public static Panel_ZHANLING = 4;//天仙

	public viewStack: eui.ViewStack;
	public skillPanel: SkillPanel;
	public jingMai: JingMaiPanel;
	public mijiPanel: MijiPanel;
	public neiGongPanel: NeiGongWin;
	// public zhanlingPanel: ZhanLingPanel;
	public tab: eui.TabBar;
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;

	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	public redPoint4: eui.Image;
	public roleSelect: RoleSelectPanel;
	private redPointGroup: eui.Group;

	private skillTitle: eui.Image;

	constructor() {
		super();
		this.skinName = "ZsSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {

		// this.tab.selectedIndex = param ? param[0] : 0;
		// this.viewStack.selectedIndex = param ? param[0] : 0;

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangeEvent(this.roleSelect, this.onChange);

		this.observe(UserBag.ins().postItemAdd, this.updateRedPoint);//道具添加
		this.observe(UserBag.ins().postItemDel, this.updateRedPoint);
		this.observe(UserBag.ins().postItemChange, this.updateRedPoint);

		this.observe(NeiGong.ins().postNeiGongDataChange, this.updateRedPoint);
		this.observe(NeiGong.ins().postNeiGongAct, this.updateRedPoint);
		this.observe(UserJingMai.ins().postUpdate, this.updateRedPoint);

		this.observe(Actor.ins().postGoldChange, this.updateRedPoint);
		this.observe(Actor.ins().postLevelChange, this.updateRedPoint);
		this.observe(UserSkill.ins().postSkillUpgradeAll, this.updateRedPoint);
		this.observe(UserMiji.ins().postBagUseMiji, this.onBagUseMiji);
		this.observe(ZhanLing.ins().postZhanLingComposeItem, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingInfo, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingUpExp, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingDrug, this.updateRedPoint);
		this.observe(ZhanLing.ins().postZhanLingWear, this.updateRedPoint);

		// this.lastIndex = param[0] == undefined ? this.lastIndex : param[0];
		// this.viewStack.selectedIndex = this.lastIndex;

		// this.checkPage();
		let selectIndex = param[0] != undefined ? param[0] : 0;
		let roleIndex = param[1] ? param[1] : 0;

		this.viewStack.selectedIndex = this.tab.selectedIndex = selectIndex;

		this.roleSelect.setCurRole(roleIndex);
		this.setOpenIndex(selectIndex);
	}

	private checkPage() {
		// if (!ZhanLingModel.ins().ZhanLingOpen()) {
		// 	if (this.zhanlingPanel.parent)
		// 		this.viewStack.removeChild(this.zhanlingPanel);
		// 	if (this[`redPoint${SkillWin.Panel_ZHANLING}`].parent)
		// 		DisplayUtils.removeFromParent(this[`redPoint${SkillWin.Panel_ZHANLING}`]);
		// } else {
		// 	if (!this.zhanlingPanel.parent)
		// 		this.viewStack.addChild(this.zhanlingPanel);
		// 	if (!this[`redPoint${SkillWin.Panel_ZHANLING}`].parent)
		// 		this.redPointGroup.addChild(this[`redPoint${SkillWin.Panel_ZHANLING}`]);
		// }
	}

	public close(...param: any[]): void {
		TimerManager.ins().removeAll(this);

		let uiview2: UIView2 = (ViewManager.ins().getView(UIView2) as UIView2);
		if (uiview2)
			uiview2.closeNav(UIView2.NAV_SKILL);

		if (this.skillPanel) this.skillPanel.close();
		if (this.neiGongPanel) this.neiGongPanel.close();
		if (this.jingMai) this.jingMai.close();
		if (this.mijiPanel) this.mijiPanel.close();		
	}

	private lastIndex: number = 0;

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(e.currentTarget.selectedIndex)) {
			e.preventDefault();
			return;
		}
	}

	private setOpenIndex(selectedIndex: number): void {
		let openLevel: number;
		let openGuanqia: number;
		
		this.roleSelect.openRole();

		let viewGroup = this["viewui"+selectedIndex];
		let viewPanel;
		let firstOpen = false;

		switch (selectedIndex) {
			case 0:
				this.skillTitle.source = "word_skill_png";
				
				if (!this.skillPanel) {
					this.skillPanel = new SkillPanel();
					viewGroup.addChild(this.skillPanel);
					firstOpen = true;
				}
				viewPanel = this.skillPanel;
				this.skillPanel.curRole = this.roleSelect.getCurRole();
				this.skillPanel.open();

				break;
			case 1:
				openLevel = GlobalConfig.NeiGongBaseConfig.openLevel;
				openGuanqia = GlobalConfig.NeiGongBaseConfig.openGuanqia;
				if (UserFb.ins().guanqiaID <= openGuanqia) {
					UserTips.ins().showTips(`通关${openGuanqia}关开启`);
					selectedIndex = this.tab.selectedIndex = this.tab.selectedIndex = this.viewStack.selectedIndex;
				} else {

					this.skillTitle.source = "internal_title";

					if (!this.neiGongPanel) {
						this.neiGongPanel = new NeiGongWin();
						viewGroup.addChild(this.neiGongPanel);
						firstOpen = true;
					}
					viewPanel = this.neiGongPanel;
					this.neiGongPanel.open(this.roleSelect.getCurRole());
				}
				break;
			case 2:
				openLevel = GlobalConfig.JingMaiCommonConfig.openLevel;
				if (Actor.level < openLevel) {
					UserTips.ins().showTips(`${openLevel}级开启`);
					// selectedIndex = this.tab.selectedIndex = this.viewStack.selectedIndex = this.lastIndex;
					this.tab.selectedIndex = this.viewStack.selectedIndex;
				} else {
					this.skillTitle.source = "title_jingmai";
					if (!this.jingMai) {
						this.jingMai = new JingMaiPanel();
						viewGroup.addChild(this.jingMai);
						firstOpen = true;
					}
					viewPanel = this.jingMai;
					this.jingMai.curRole = this.roleSelect.getCurRole();
					this.jingMai.open();
				}
				break;
			case 3:
				let zsLv: number = UserMiji.ZsLv;
				if (UserZs.ins().lv < zsLv) {
					UserTips.ins().showTips(`${zsLv}转开启`);
					selectedIndex = this.tab.selectedIndex = this.tab.selectedIndex = this.viewStack.selectedIndex;
				} else {
					
					this.skillTitle.source = "title_occult";

					if (!this.mijiPanel) {
						this.mijiPanel = new MijiPanel();
						viewGroup.addChild(this.mijiPanel);
						firstOpen = true;
					}
					viewPanel = this.mijiPanel;
					this.mijiPanel.curRole = this.roleSelect.getCurRole();
					this.mijiPanel.open();
				}
				break;
			case SkillWin.Panel_ZHANLING:
				if (!ZhanLingModel.ins().ZhanLingOpen()) {
					UserTips.ins().showTips(`开服第${GlobalConfig.ZhanLingConfig.openserverday}天并达到${GlobalConfig.ZhanLingConfig.openzhuanshenglv}转开启`);
				} 
				else if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING)){
					UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.ZHANLING).name}开启`);
					this.tab.selectedIndex = this.viewStack.selectedIndex;
				}
				// else {
				// 	this.roleSelect.hideRole();
				// 	this.zhanlingPanel.open();
				// 	this.skillTitle.source = "biaoti_zhanling";
				// }
				break;
		}

		if (firstOpen) {
			viewPanel.visible = false;
			egret.setTimeout(() => {
				viewPanel.width = viewGroup.width;
				viewPanel.height = viewGroup.height;
				viewPanel.visible = true;
			}, this, 200);
		}

		if (this.lastIndex != selectedIndex) {
			if (this.tab.selectedIndex != this.viewStack.selectedIndex) {
				this["viewui"+this.lastIndex].getChildAt(0)['close']();
				this.lastIndex = selectedIndex;
			}
		} else {
			this.tab.selectedIndex = this.viewStack.selectedIndex = selectedIndex;
		}
	
		this.updateRedPoint();
	}

	private checkIsOpen(index: number): boolean {
		let openLevel: number;
		let openGuanqia: number;
		switch (index) {
			case 0:
				break;
			case 1:
				openLevel = GlobalConfig.NeiGongBaseConfig.openLevel;
				openGuanqia = GlobalConfig.NeiGongBaseConfig.openGuanqia;
				if (UserFb.ins().guanqiaID <= openGuanqia) {
					UserTips.ins().showTips(`通关${openGuanqia}关开启`);
					return false;
				}
				break;
			case 2:
				openLevel = GlobalConfig.JingMaiCommonConfig.openLevel;
				if (Actor.level < openLevel) {
					UserTips.ins().showTips(`${openLevel}级开启`);
					return false;
				}
				break;
			case 3:
				let zsLv: number = UserMiji.ZsLv;
				if (UserZs.ins().lv < zsLv) {
					UserTips.ins().showTips(`${zsLv}转开启`);
					return false;
				}
				break;
			case SkillWin.Panel_ZHANLING:
				if (!ZhanLingModel.ins().ZhanLingOpen()) {
					UserTips.ins().showTips(`开服第${GlobalConfig.ZhanLingConfig.openserverday}天并达到${GlobalConfig.ZhanLingConfig.openzhuanshenglv}转开启`);
					return false;
				}
				else if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING)){
					UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.ZHANLING).name}开启`);
					return false;
				}
				break;
		}
		return true;
	}

	private updateRedPoint(): void {
		if (!TimerManager.ins().isExists(this.updateRed, this)) TimerManager.ins().doTimer(100, 1, this.updateRed, this);
	}

	private onBagUseMiji(itemId: number) {
		let len = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			if (!UserMiji.ins().hasEquipMiji(itemId, i)) {
				this.roleSelect.setCurRole(i);
				this.setRoleId(i);
				break;
			}
		}
		this.mijiPanel.onBagUseMiji(itemId);
	}

	private updateRed(): void {
		this.redPoint0.visible = this.and(UserSkill.ins().canGrewupSkill());
		this.redPoint1.visible = NeiGongModel.ins().canUp() || NeiGongModel.ins().checkRedPoint();
		this.redPoint2.visible = this.jingMaiCanUp();
		this.redPoint3.visible = UserMiji.ins().isMjiSum();
		// this.redPoint4.visible = ZhanLing.ins().checkRedPoint();

		let len: number = SubRoles.ins().subRolesLen;
		this.roleSelect.clearRedPoint();
		for (let i: number = 0; i < len; i++) {
			let isCanUpLevel: boolean;
			if (this.tab.selectedIndex == 0) {
				isCanUpLevel = UserSkill.ins().canGrewupAllSkills(i);
			}
			else if (this.tab.selectedIndex == 1) {
				isCanUpLevel = NeiGongModel.ins().canUpById(i);
			} else if (this.tab.selectedIndex == 2) {
				let data: JingMaiData = SubRoles.ins().roles[i].jingMaiData;
				isCanUpLevel = data.jingMaiCanUp();
			} else if (this.tab.selectedIndex == 3) {
				isCanUpLevel = UserMiji.ins().isMjiSum();
			}
			this.roleSelect.showRedPoint(i, isCanUpLevel);
		}
	}

	private onChange(e: egret.Event): void {
		this.setRoleId(this.roleSelect.getCurRole());
	}

	private setRoleId(roleId: number): void {
		this.setOpenIndex(this.viewStack.selectedIndex);
	}

	private and(list): boolean {
		for (let k of list) {
			if (k == true)
				return true;
		}
		return false;
	}

	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

	public static openCheck(): boolean {
		return true;
	}

	private jingMaiCanUp(): boolean {
		let data: JingMaiData;
		for (let i in SubRoles.ins().roles) {
			data = SubRoles.ins().roles[i].jingMaiData;
			if (data.jingMaiCanUp()) {
				let openLevel = GlobalConfig.JingMaiCommonConfig.openLevel;
				if (Actor.level >= openLevel)
					return true;
			}
		}
		return false;
	}

}

ViewManager.ins().reg(SkillWin, LayerManager.UI_Main);