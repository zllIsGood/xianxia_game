class MijiLockWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private smeltBtn: eui.Button;
	private link: eui.Label;
	private labCount: eui.Label;
	//秘籍按钮
	public mijiBtns: MijiItem[];
	public mijiBtn0: MijiItem;
	public mijiBtn1: MijiItem;
	public mijiBtn2: MijiItem;
	public mijiBtn3: MijiItem;
	public mijiBtn4: MijiItem;
	public mijiBtn5: MijiItem;
	public mijiBtn6: MijiItem;
	public mijiBtn7: MijiItem;
	public curRole: number = 0;
	private roleID: number;
	public roleSelect: RoleSelectPanel;
	private selItem: number = 0;
	private isFirst: boolean = true;
	private otherRect: eui.Rect;

	constructor() {
		super();
		this.skinName = "MijiLockSkin";
	}

	public initUI(): void {
		super.initUI();
		this.mijiBtns = [this.mijiBtn0, this.mijiBtn1, this.mijiBtn2, this.mijiBtn3, this.mijiBtn4, this.mijiBtn5, this.mijiBtn6, this.mijiBtn7];
		this.link.textFlow = new egret.HtmlTextParser().parser("<u>获得道具</u>");
		this.roleSelect.hideTop();
	}

	public open(...param: any[]): void {
		this.isFirst = true;
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.smeltBtn, this.onTap);
		this.addTouchEvent(this.link, this.onTap);
		this.addChangeEvent(this.roleSelect, this.onChange);
		this.addTouchEndEvent(this.otherRect, this.otherClose);
		for (let a in this.mijiBtns) {
			this.addTouchEvent(this.mijiBtns[a], this.onTap);
		}
		this.observe(UserMiji.ins().postMijiLockInfo, this.setData);
		if (param[0] == UserMiji.BAGOPEN) {
			this.bagSelectIndex();
		} else {
			this.roleSelect.setCurRole(isNaN(param[0]) ? 0 : param[0]);
			this.selItem = this.getindex(isNaN(param[0]) ? 0 : param[0]);
		}
		this.setCurRole(this.roleSelect.getCurRole());
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	public close(...param: any[]): void {

	}

	private onChange(e: egret.Event): void {
		let roleId = this.roleSelect.getCurRole();
		if(!this.isFirst)
			this.selItem = this.getindex(roleId);
		this.isFirst = false;
		this.setCurRole(roleId);
	}

	public setCurRole(roleId: number): void {
		this.curRole = roleId;
		this.setData();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.smeltBtn:
				let mijiData = this.mijiBtns[this.selItem].data as MijiData;
				if (mijiData.isLocked) {
					UserMiji.ins().sendMijiDelLock(this.curRole, mijiData.id);
					return;
				}
				UserMiji.ins().sendMijiAddLock(this.curRole, mijiData.id);
				break;
			case this.link:
				UserWarn.ins().setBuyGoodsWarn(
					GlobalConfig.MijiBaseConfig.lockId, 1
				);
				break;
			default:
				let index = this.mijiBtns.indexOf(e.target.parent);
				let data = this.mijiBtns[index].data;
				if (!this.mijiBtns[index] || !data)
					return;
				if (data.id == 0) {
					UserTips.ins().showCenterTips(`未学习秘术的孔位无法加锁`);
					return;
				}
				this.selItem = index;
				let ins: UserMiji = UserMiji.ins();
				if (!ins.grid || this.selItem >= ins.grid) {
					UserTips.ins().showTips("未开启");
					return;
				}
				this.updateBtnState();
				break;
		}
	}

	private updateBtnState(): void {
		for (let i = 0; i < this.mijiBtns.length; i++) {
			this.mijiBtns[i].setSelected(false);
		}
		this.labCount.text = ``;
		this.link.visible = false;
		let num = UserBag.ins().getBagGoodsCountById(UserBag.BAG_TYPE_OTHTER, GlobalConfig.MijiBaseConfig.lockId);
		let isHas: boolean = num > 0;
		if (isHas) {
			this.labCount.text = `剩余道具： ${num}`;
		}
		this.link.visible = !isHas;
		if (this.selItem < 0) {
			this.smeltBtn.label = `孔位加锁`;
			this.smeltBtn.enabled = false;
			return;
		}
		this.mijiBtns[this.selItem].setSelected(true);
		let mijiData = this.mijiBtns[this.selItem].data as MijiData;

		if (mijiData.isLocked) {
			this.smeltBtn.label = `孔位解锁`;
			this.smeltBtn.enabled = true;
		}
		else {
			this.smeltBtn.label = `孔位加锁`;
			this.smeltBtn.enabled = isHas;
		}

	}

	/**
	 * 设置界面数据
	 */
	public setData(): void {
		let ins: UserMiji = UserMiji.ins();
		let showSetCount: boolean = true;
		for (let i = 0; i < 8; i++) {
			if (ErrorLog.Assert(ins.miji, "MijiPanel   data.miji is null")) {
				this.mijiBtns[i].data = null;
			} else {
				let numList: MijiData[] = ins.miji[this.curRole];
				if (ErrorLog.Assert(numList, "MijiPanel   numList " +
					"is null  roleId = " + this.curRole)) {
					this.mijiBtns[i].data = null;
				} else {
					this.mijiBtns[i].data = !numList[i] ? null : numList[i];
					if(numList[i] && numList[i].id == 0)
						this.mijiBtns[i].setUnlearn(true);
					else
						this.mijiBtns[i].setUnlearn(false);
					if (!numList[i]) {
						if (showSetCount) {
							this.mijiBtns[i].setCountLabel(i);
							showSetCount = false;
						}
					}
				}
			}
		}
		this.updateBtnState();
	}

	/** 自动选中*/
	private getindex(roleId:number): number {
		let numList: MijiData[] = UserMiji.ins().miji[roleId];
		for (let i = 0; i < numList.length; i++) {
			if (numList[i].id != 0)
				return i;
		}
		return -1;
	}

	private bagSelectIndex(): void {
		let role = 0;
		let b = false;
		this.selItem = 0;
		let len = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let numList: MijiData[] = UserMiji.ins().miji[i];
			for (let j = 0; j < numList.length; j++) {
				if (numList[j].id != 0 && numList[j].isLocked == 0) {
					role = i;
					this.selItem = j;
					b = true;
					break;
				}
			}
			if(b)
				break;
		}
		this.roleSelect.setCurRole(role);
	}
}

ViewManager.ins().reg(MijiLockWin, LayerManager.UI_Popup);