class AdvanEquipWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;

	public orangeEquipPanel: OrangeEquipPanel;//神装
	public extremeEquipPanel: ExtremeEquipPanel;//至尊
	public legendEquipPanel: LegendEquipPanel;//传奇

	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;

	/**角色选择面板 */
	public roleSelect: RoleSelectPanel;
	/** 当前选择的角色 */
	private curRole: number = 0;

	private panelArr: any[];

	private curSelectIndex: number = 0;
	public isNotMove: boolean;


	constructor() {
		super();
		this.skinName = "AdvanEquipWinSkin";
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("orangeEquipPanel", new OrangeEquipPanel());
		// this.setSkinPart("legendEquipPanel", new LegendEquipPanel());
		this.panelArr = [this.orangeEquipPanel, this.legendEquipPanel, this.extremeEquipPanel];
		this.isTopLevel = true;
		this.roleSelect.parent.touchEnabled = false;
	}

	public initUI(): void {
		super.initUI();

		if (!WxTool.shouldRecharge()) {
			let tempChildrens = [];
			let horizontalCenter = -66;
			for (let i = 0; i < this.viewStack.$children.length; i++) {
				let temp = this.viewStack.$children[i];
				if (temp.name != "寻宝") {
					tempChildrens.push(temp);
					horizontalCenter += (i * 114);
					let redPoint = this['redPoint' + i];
					redPoint.horizontalCenter = horizontalCenter;
				} else {
					this.removeChild(this.redPoint3);
				}
			}
			this.viewStack.$children = tempChildrens;
		}
		this.viewStack.selectedIndex = 0;
		this.tab.dataProvider = this.viewStack;
		// this.roleSelectPanel.visible = false;
	}

	public destoryView(): void {
		super.destoryView();
		this.roleSelect.destructor();
	}

	public open(...param: any[]): void {
		let page: number = param[0] ? param[0] : 0;
		let selectedIndex = param ? param[1] : 0;
		this.roleSelect.setCurRole(selectedIndex);
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addChangingEvent(this.tab, this.onTabTouching);
		this.observe(UserBag.ins().postItemChange, this.setRedPoint);//道具变更
		this.observe(UserBag.ins().postItemAdd, this.setRedPoint);//道具添加
		this.observe(UserBag.ins().postItemDel, this.setRedPoint);//道具删除
		this.observe(GameLogic.ins().postChildRole, this.setRedPoint);//子角色变更
		this.addChangeEvent(this.roleSelect, this.switchRole);
		this.setSelectedIndex(page);
		this.setRedPoint();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.closeBtn0, this.onClick);
		// this.tab.removeEventListener(egret.Event.CHANGE, this.onTabTouch, this);
		this.roleSelect.removeEventListener(egret.Event.CHANGE, this.switchRole, this);
		this.removeObserve();
		this.panelArr[this.curSelectIndex].close();
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}

	private switchRole() {
		let curRole = this.roleSelect.getCurRole();
		this.panelArr[this.curSelectIndex].setRoleId(curRole);
	}

	private onTabTouching(e: egret.TouchEvent) {
		if (e.currentTarget.selectedIndex == 3) {
			ViewManager.ins().open(TreasureHuntWin, 0);
			e.preventDefault();
			return;
		}
		if (!this.checkIsOpen(e.currentTarget.selectedIndex)) {
			e.preventDefault();
			return;
		}
	}

	private checkIsOpen(index: number) {
		switch (index) {
			case 2:
				if (!OpenSystem.ins().checkSysOpen(SystemType.EXTREME_EQUIP)) {
					UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.EXTREME_EQUIP));
					return false;
				}
				break;
		}
		return true;
	}

	private onTabTouch(e: egret.TouchEvent): void {
		this.panelArr[this.curSelectIndex].close();
		let selectedIndex = e.currentTarget.selectedIndex;
		this.setSelectedIndex(selectedIndex);
		this.setRedPoint();

		ViewManager.ins().close(LimitTaskView);

	}

	private setSelectedIndex(selectedIndex: number) {
		this.curSelectIndex = selectedIndex;
		// this.roleSelectPanel.visible = false;
		this.panelArr[selectedIndex].open();
		this.viewStack.selectedIndex = selectedIndex;
	}

	public static openCheck(...param: any[]): boolean {
		if (Actor.level >= 10)
			return true;
		UserTips.ins().showTips("10级开启");
		return false;
	}

	private setRedPoint(): void {
		this.redPoint2.visible = this.redPoint0.visible = this.redPoint1.visible = this.redPoint3.visible = false;
		let bool: boolean = false;
		let len: number = SubRoles.ins().subRolesLen;
		let rolePoint: boolean[] = [false, false, false];
		for (let a: number = 0; a < len; a++) {
			for (let i = 0; i < 8; i++) {
				// let equipItem: eui.Component = this["equip" + i];
				bool = UserEquip.ins().setOrangeEquipItemState(i, SubRoles.ins().getSubRoleByIndex(a));
				// if (bool)
				// 	bool = this.orangeEquipPanel["equip" + i].redPoint.visible;
				if (bool)
					break;
			}
			this.roleSelect.showRedPoint(a, bool);
			if (bool)
				this.redPoint0.visible = bool;

		}
		// if (this.redPoint0.visible == false)
		// 	this.redPoint0.visible = UserEquip.ins().checkRedPoint(4);
		bool = false;
		for (let a: number = 0; a < len; a++) {
			for (let i = 0; i < 2; i++) {
				bool = UserEquip.ins().setLegendEquipItemUpState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a));
				bool = UserEquip.ins().setLegendEquipItemState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a)) || bool;
				// if (this.viewStack.selectedIndex == 1) {
				if (i == 1) {
					if (bool) {
						this.redPoint1.visible = bool;
						break;
					}
				}
			}
			if (this.viewStack.selectedIndex == 1) {
				this.roleSelect.showRedPoint(a, bool);
			}
		}
		if (this.redPoint1.visible == false) {
			this.redPoint1.visible = UserEquip.ins().checkRedPoint(5, this.roleSelect.getCurRole()) || this.legendEquipPanel.setRedPoint();
			// this.redPoint1.visible = this.redPoint1.visible?( !UserEquip.ins().getLegendEquipItemUpMax(this.roleSelect.getCurRole()) ):this.redPoint1.visible;
		}

		//至尊装备分页红点
		if (this.viewStack.selectedIndex == 2) {
			this.roleSelect.clearRedPoint();
			for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
				let role: Role = SubRoles.ins().getSubRoleByIndex(i);
				let b = ExtremeEquipModel.ins().getRedPointByJob(role.job);
				if (b) {
					this.roleSelect.showRedPoint(i, b);
				}
			}
		}
		//只关联寻宝装备分页的红点
		this.redPoint2.visible = Boolean(UserBag.ins().getHuntGoods(0).length);
		this.redPoint3.visible = ExtremeEquipModel.ins().getRedPoint();
	}

}

ViewManager.ins().reg(AdvanEquipWin, LayerManager.UI_Main);