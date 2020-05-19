/**
 * RoleWin
 */
class RoleWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;

	public roleSelect: RoleSelectPanel;

	public roleInfoPanel: RoleInfoPanel;
	public hejiPanel: HejiPanel;
	public zsPanel: ZsPanel;
	public wingPanel: WingPanel;
	public reincarnationPanel: SamsaraPanel;

	public redPointGroup: eui.Group;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;
	public redPoint4: eui.Image;

	public help: eui.Button;

	/** 可更换的装备 */
	public canChangeEquips: boolean[][];

	public biaoti: eui.Image;
	private roleIndex: number = 0;

	constructor() {
		super();
		this.skinName = "RoleWinSkin";
		this.isTopLevel = true;
		this.addExclusionWin(egret.getQualifiedClassName(SmeltEquipTotalWin));
	}

	public initUI(): void {
		super.initUI()
	}

	public open(...param: any[]): void {
		this.oldIndex = this.tab.selectedIndex = this.viewStack.selectedIndex = param[0] ? param[0] : 0;
		this.addTouchEvent(this, this.onClick);
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.observe(UserRole.ins().postRoleHint, this.redPoint);
		this.observe(UserZs.ins().postZsData, this.redPoint);
		this.observe(Actor.ins().postLevelChange, this.redPoint);
		this.observe(Actor.ins().postUpdateTogeatter, this.redPoint);
		this.observe(UserFb.ins().postGqIdChange, this.redPoint);
		this.observe(UserSkill.ins().postUpgradeForge, this.redPoint);
		this.addTouchEvent(this.help, this.onClick)
		this.roleIndex = param[1] ? param[1] : 0;
		this.roleSelect.setCurRole(this.roleIndex);
		this.redPoint();
	}

	private openSamsara(): void {
		let index = this.viewStack.getChildIndex(this["viewui4"]);
		if (index < 0) {
			this.viewStack.addChild(this["viewui4"]);
		}
		this.tab.dataProvider = this.viewStack;
		this.redPointGroup.horizontalCenter = 42;
		this.redPoint4.visible = !SamsaraModel.ins().isLevMax() && (SamsaraModel.ins().isCanUpgrade() 
									|| SamsaraModel.ins().isCanItemExchange() 
									|| (!SamsaraModel.ins().isMaxSamsara(Actor.samsaraLv) && SamsaraModel.ins().isCanUpgradeSoul())
									|| (Actor.level >= GlobalConfig.ReincarnationBase.levelLimit && SamsaraModel.ins().getExpExchangeTimes() > 0));
	}

	private inactiveSamsara(): void {
		let index = this.viewStack.getChildIndex(this["viewui4"]);
		if (index >= 0) {
			this.viewStack.removeChildAt(index);
		}
		this.tab.dataProvider = this.viewStack;
		this.redPointGroup.horizontalCenter = 42 + 62;
		this.redPoint4.visible = false;
	}

	public close(...param: any[]): void {
		let uiview2: UIView2 = (ViewManager.ins().getView(UIView2) as UIView2);
		if (uiview2)
			uiview2.closeNav(UIView2.NAV_ROLE);
		if (this.roleInfoPanel) this.roleInfoPanel.close();
		if (this.hejiPanel) this.hejiPanel.close();
		if (this.wingPanel) this.wingPanel.close();
		if (this.zsPanel) this.zsPanel.close();
	}

	private checkIsOpen(index: number): boolean {
		//必杀
		let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[1];
		if (index == 1) {
			if (UserSkill.ins().hejiLevel <= 0) {
				UserTips.ins().showTips(`完成主线任务后开启`);
				this.roleSelect.visible = this.roleSelectVis;
				return false;
			}
		}
		else if (index == 2) {
			if (Actor.level < GlobalConfig.ZhuanShengConfig.level) {
				UserTips.ins().showTips(`${GlobalConfig.ZhuanShengConfig.level}级开启转生`);
				return false;
			}
		}
		else if (index == 3) {
			let rt = Wing.ins().remainTask()
			if (rt) {
				UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.WING).name}后开启`);
				return false;
			}
		}
		return true;
	}

	public static openCheck(...param: any[]): boolean {
		if (param[0] == 1) {
			if (UserSkill.ins().hejiLevel <= 0) {
				UserTips.ins().showTips(`完成主线任务后开启`);
				return false;
			}
		}
		else if (param[0] == 2) {
			if (Actor.level < GlobalConfig.ZhuanShengConfig.level) {
				UserTips.ins().showTips(`${GlobalConfig.ZhuanShengConfig.level}级开启转生`);
				return false;
			}
		}
		else if (param[0] == 3) {
			let rt = Wing.ins().remainTask()
			if (rt) {
				UserTips.ins().showTips(`唤醒${UserTask.ins().getAwakeTypeConf(UserTask.AWAKE_TASK_TYPE.WING).name}后开启`);
				return false;
			}
		}
		return true;
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		let index = this.tab.selectedIndex;
		if (index == 4) this.roleSelect.hideRole();
		this.setOpenIndex(index);
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

	private onChange(e: egret.Event): void {
		this.setRoleId(this.roleSelect.getCurRole());
	}

	private setRoleId(roleId: number): void {
		this.setOpenIndex(this.viewStack.selectedIndex);
		// this.roleInfoPanel.curRole = this.wingPanel.curRole = roleId;
	}

	public setTabSelectedIndex(index: number): void {
		this.tab.selectedIndex = index;
		this.oldIndex = index;
		this.setOpenIndex(index);
	}

	private oldIndex: number = 0;
	private roleSelectVis: boolean = true;

	private setOpenIndex(selectedIndex: number): void {
		this.roleSelectVis = this.roleSelect.visible;
		if (this.oldIndex && this.oldIndex == 3 && this.oldIndex != selectedIndex) {
			if (this.getWingPanelInfo()) {
				this.doOpenHintWin(1, this.tab.selectedIndex);
				this.tab.selectedIndex = this.oldIndex;
				return;
			}
		}
		if (selectedIndex != 1 && this.hejiPanel != undefined)
			this.hejiPanel.close();
		this.help.visible = false;
		let viewGroup = this["viewui"+selectedIndex];
		let viewPanel;
		let firstOpen = false;
		switch (selectedIndex) {
			case 0:
				this.biaoti.source = "role_title_txt";
				this.roleSelect.openRole();
				if (!this.roleInfoPanel) {
					this.roleInfoPanel = new RoleInfoPanel();
					viewGroup.addChild(this.roleInfoPanel);
					firstOpen = true;
				}
				viewPanel = this.roleInfoPanel;
				this.roleInfoPanel.curRole = this.roleSelect.getCurRole();
				this.roleInfoPanel.open();
				break;
			case 1:
				this.biaoti.source = "title_koskill";
				this.roleSelect.hideRole();
				if (!this.hejiPanel) {
					this.hejiPanel = new HejiPanel();
					viewGroup.addChild(this.hejiPanel);
					firstOpen = true;
				}
				viewPanel = this.hejiPanel;
				this.hejiPanel.open();
				this.help.visible = true;
				break;
			case 2:
				if (Actor.level >= GlobalConfig.ZhuanShengConfig.level) {
					this.biaoti.source = "title_zs_png";
					this.roleSelect.hideRole();
					if (!this.zsPanel) {
						this.zsPanel = new ZsPanel();
						viewGroup.addChild(this.zsPanel);
						firstOpen = true;
					}
					viewPanel = this.zsPanel;
					this.zsPanel.open();
					this.zsPanel.setData();
				} else {
					UserTips.ins().showTips(`${GlobalConfig.ZhuanShengConfig.level}级开启转生`);
					this.tab.selectedIndex = this.viewStack.selectedIndex;
				}
				break;
			case 3:
				let rt = Wing.ins().remainTask();
				if (rt == 0) {
					this.biaoti.source = "wings_title01";
					this.roleSelect.openRole();
					if (!this.wingPanel) {
						this.wingPanel = new WingPanel();
						viewGroup.addChild(this.wingPanel);
						firstOpen = true;
					}
					viewPanel = this.wingPanel;
					this.wingPanel.curRole = this.roleSelect.getCurRole();
					this.wingPanel.open();
				} else {
					UserTips.ins().showTips(`完成${rt}个任务后开启`);
					this.tab.selectedIndex = this.viewStack.selectedIndex;
				}
				break;
			case 4:
			    this.biaoti.source = "lunhui_title_png";
				if (!this.reincarnationPanel) {
					this.reincarnationPanel = new SamsaraPanel();
					viewGroup.addChild(this.reincarnationPanel);
					firstOpen = true;
				}
				viewPanel = this.reincarnationPanel;
				this.reincarnationPanel.open();
				this.tab.selectedIndex = this.viewStack.selectedIndex = 4;
				this.help.visible = true;
				break;
		}
		if (firstOpen) {
			viewPanel.visible = false;
			egret.setTimeout(()=>{
				viewPanel.width = viewGroup.width;
				viewPanel.height = viewGroup.height;
				viewPanel.visible = true;
			},this,200);
		}
		if (this.oldIndex != selectedIndex) {
			if (this.tab.selectedIndex != this.viewStack.selectedIndex) {
				// let group = this.viewStack.getElementAt(this.oldIndex) as egret.DisplayObject;
				// group.getElementAt(0)
				this["viewui"+this.oldIndex].getChildAt(0)['close']();
				this.oldIndex = selectedIndex;
			}
		} else {
			this.tab.selectedIndex = this.viewStack.selectedIndex = selectedIndex;
		}
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				let uiview2: UIView2 = (ViewManager.ins().getView(UIView2) as UIView2);
				if (uiview2)
					uiview2.closeNav(UIView2.NAV_ROLE);
				break;
			case this.help:
				if (this.tab.selectedIndex == 1) {
					ViewManager.ins().open(ZsBossRuleSpeak, 26);
				} else if (this.tab.selectedIndex == 4) {
					ViewManager.ins().open(ZsBossRuleSpeak, 22);
				}

				break;
		}
	}

	private redPoint() {
		let zsIsOpens = [UserZs.ins().canOpenZSWin() && !UserZs.ins().isMaxLv() && (UserZs.ins().canGet() > 0 || UserZs.ins().canUpgrade())];
		let wingOpens = this.canWingEquip();
		let hejiOpens = UserSkill.ins().canHejiEquip() || UserSkill.ins().canExchange() || UserSkill.ins().canSolve() || UserSkill.ins().canAcitve();
		let equipIsOpens = this.canEquip();//是否能穿戴 或者 附灵
		let samsaraOpen = SamsaraModel.ins().isOpen();
		
		let ringRed = OpenSystem.ins().checkSysOpen(SystemType.RING) &&
						 (UserTask.ins().checkAwakeRedPoint()[0]>0 || 
						SpecialRing.ins().checkHaveUpRing() || 
						 SpecialRing.ins().isCanStudySkill() || 
						 SpecialRing.ins().isCanUpgradeSkill() || 
						 SpecialRing.ins().fireRingRedPoint());

		
		let isOpens = [equipIsOpens, hejiOpens, zsIsOpens, wingOpens];
		let b = false;
		 for (let i: number = 0; i < 3; i++) {
        	 b =  FlySwordRedPoint.ins().totalRedPoint[i];
         if(b) break;
        }
		let flySwordRed = b || ZhanLing.ins().checkRedPoint() || HuanShouRedPoint.ins().isRed;

		let yuPeiRed =  JadeNew.ins().checkRed();

		this.redPoint0.visible = this.and(equipIsOpens) || ringRed || SubRoles.ins().isLockRole() || (SamsaraModel.ins().isOpen() && SamsaraModel.ins().isCanAddSpirit()) || flySwordRed || yuPeiRed;
		this.redPoint1.visible = hejiOpens || UserSkill.ins().getPunchForge().getRedPoint();
		this.redPoint2.visible = this.and(zsIsOpens);
		this.redPoint3.visible = this.and(wingOpens) || this.and(Wing.ins().canGradeupWing())
			|| this.and(Wing.ins().canItemGradeupWing())
			|| Wing.ins().isHaveActivationWing()
			|| GodWingRedPoint.ins().getGodWingRedPoint();

		this.redPoint3.visible = Wing.ins().remainTask() <= 0 ? this.redPoint3.visible : false;

		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let isOpen = false;
			if (this.viewStack.selectedIndex < 4) {
				if (isOpens[this.viewStack.selectedIndex][i]) {
					isOpen = true;
				}
				this.roleSelect.showRedPoint(i, isOpen);
			}
		}

		if (SamsaraModel.ins().isOpen()) {
			this.openSamsara();
			this.setSamsaraEquipVisible(true);

		} else {
			this.inactiveSamsara();
			this.setSamsaraEquipVisible(false);
		}
	}

	private setSamsaraEquipVisible(visible: boolean): void {
		if (this.viewStack.selectedIndex == 4) {
			this.roleInfoPanel["item9"].visible = visible;
			this.roleInfoPanel["item10"].visible = visible;
			this.roleInfoPanel["item11"].visible = visible;
			this.roleInfoPanel["item12"].visible = visible;
		}
	}

	private and(list): boolean {
		for (let k in list) {
			if (list[k] == true)
				return true;
		}

		return false;
	}

	private canWingEquip(): boolean[] {
		let isOpens: boolean[] = [false, false, false];
		let isLevel: boolean[] = Wing.ins().canGradeupWing();
		let isLevelByItem: boolean[] = Wing.ins().canItemGradeupWing();
		let isRoleOpenWing: boolean[] = Wing.ins().canRoleOpenWing();
		let len: number = SubRoles.ins().subRolesLen;

		for (let i: number = 0; i < len; i++) {
			if (Wing.ins().remainTask() > 0) {
				isOpens[i] = false;
				continue;
			}
			//判断角色是否可以激活翅膀
			if (isRoleOpenWing[i]) {
				isOpens[i] = true;
				continue;
			}
			if (isLevel[i] || isLevelByItem[i]) {
				isOpens[i] = true;
			}

			if (Wing.ins().canUseAptitudeByRoleID(i))
				isOpens[i] = true;

			if (Wing.ins().canUseFlyUpByRoleID(i))
				isOpens[i] = true;
		}
		return isOpens;
	}

	private canEquip(): boolean[] {
		let isOpens: boolean[] = [false, false, false];
		if (this.canChangeEquips) {
			let len: number = SubRoles.ins().subRolesLen;
			for (let i: number = 0; i < len; i++) {
				let data = this.canChangeEquips[i];
				for (let k in data) {
					if (data[k]) {
						isOpens[i] = true;
						break;
					}
				}
				if (isOpens[i] == false) {
					for (let a: number = 0; a < 5; a++) {
						let opens: boolean[] = [];
						if (a > 1)
							opens = LongHun.ins().canGradeupLoongSoul(a);
						else
							opens = SpecialRing.ins().canGradeupRing(a);
						if (opens[i]) {
							isOpens[i] = opens[i];
							break;
						}
					}
				}
				if (isOpens[i] == false) {
					if (!UserEquip.ins().checkRedPoint(4, i)) {
						isOpens[i] = UserEquip.ins().checkRedPoint(5, i);
					} else {
						isOpens[i] = true;
					}
				}
				//神装
				let model: Role = SubRoles.ins().getSubRoleByIndex(i);
				let bool: boolean = false;
				for (let j = 0; j < 8; j++) {
					bool = UserEquip.ins().setOrangeEquipItemState(j, model);
					if (!bool && j < 2)
						bool = UserEquip.ins().setLegendEquipItemState(j > 0 ? 2 : 0, model);
					if (bool) {
						let b = UserBag.ins().checkEqRedPoint(i, model);
						bool = b != null ? b : bool;
					}
					if (bool)
						break;
				}
				if (!bool)
					bool = UserEquip.ins().checkRedPoint(4, i);
				if (!bool)
					bool = UserEquip.ins().checkRedPoint(5, i);
				if (!bool)
					bool = Boolean(UserBag.ins().getHuntGoods(0).length);
				if (!bool)
					bool = ExtremeEquipModel.ins().getRedPoint();
				if (bool)
					isOpens[i] = bool;
				if (!isOpens[i]) {
					isOpens[i] = SamsaraModel.ins().checkRoleCanAddSpirit(i);
				}
			}
		}
		return isOpens;
	}

	private wingData: WingsData;
	/*
	 * 是否显示翅膀经验清0 的提示
	 * */
	public getWingPanelInfo(): boolean {
		if (!this.isShow())
			return false;
		if (this.oldIndex != 3)
			return false;
		let chooseData: WingsData;
		let len: number = SubRoles.ins().roles.length;
		for (let i: number = 0; i < len; i++) {
			let data: WingsData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
			if (!chooseData || chooseData.clearTime == 0) {
				chooseData = data;
			} else if (chooseData.clearTime > data.clearTime && data.clearTime > 0) {
				chooseData = data;
			}
		}
		this.wingData = chooseData;
		return chooseData.clearTime > 0 && Wing.hint;
	}

	//type  1--切页   2--关闭   index --切页的下标
	public doOpenHintWin(type: number, index: number = 0): void {
		ViewManager.ins().open(WingHintWin, type, index, this.wingData);
	}

	public getEquipGrid(pos: EquipPos): RoleItem {
		this.validateNow();
		return this.roleInfoPanel.getEquipItem(pos);
	}

	public playUIEff(...param: any[]): void {
	}
}
ViewManager.ins().reg(RoleWin, LayerManager.UI_Main);

