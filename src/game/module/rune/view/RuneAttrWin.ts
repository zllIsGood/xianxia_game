/**
 * 符文属性窗体
 */
class RuneAttrWin extends BaseEuiView {
	public bg: eui.Image;
	public job: eui.Image;
	public leftBtn: eui.Button;
	public rightBtn: eui.Button;
	public closeBtn: eui.Button;
	public attr: eui.Label;

	private mainGroup:eui.Group;

	private _lastX: number = 0;
	private proShowList: any[] = null;
	/** 当前选择的角色 */
	public curRole: number = 0;
	private imgGroup: eui.Group;
	public constructor() {
		super();
		this.skinName = "RuneAttrsSkin";
	}

	public initUI(): void {
		super.initUI();
	}

	private setAttrList(): void {
		this.proShowList = [];
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let runeList: ItemData[] = role.runeDatas;
		let runeBaseConfig: RuneBaseConfig[] = GlobalConfig.RuneBaseConfig;
		if (!Assert(runeBaseConfig, "RuneAttrTypeConfig is null")) {
			for (let k in runeList) {
				let item: ItemData = runeList[k];
				if (item.configID) {
					let cfg: RuneBaseConfig = runeBaseConfig[item.configID];
					if (!Assert(cfg, "cfg is null   id == " + item.configID))
						this.setProShowList(cfg);
				}
			}
		}
	}

	private setProShowList(cfg: RuneBaseConfig): void {
		this.checkIsRepeat(cfg.attr, 0);
		this.checkIsRepeat(cfg.equipAttr, 1);
		this.checkIsRepeat(cfg.exAttr, 2);
		this.checkIsRepeat(cfg.specialAttr, 3);
	}


	private checkIsRepeat(addList: AttributeData[], index: number): void {
		if (!this.proShowList[index]) {
			this.proShowList[index] = [];
		}
		let list: AttributeData[] = this.proShowList[index];
		if (!addList) {
			return;
		}
		let flag: boolean = false;
		let additem: AttributeData;
		for (let i in addList) {
			additem = addList[i];
			flag = false;
			for (let k in list) {
				if (list[k].type == additem.type) {
					list[k].value = list[k].value + additem.value;
					flag = true;
				}
			}
			if (!flag) {
				list.push(additem);
			}
		}
	}

	public open(...param: any[]): void {
		//设置角色索引
		this.curRole = isNaN(param[0]) ? 0 : param[0];

		//设置侦听
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onClose);
		this.addTouchEndEvent(this.bg, this.onMove);
		// this.addTouchEndEvent(this.bg, this.onMove);
		this.addTouchEndEvent(this, this.otherClose);

		//更新属性合集
		this.setAttrList();
		//设置属性合集
		this.setAttrs();
		//设置按钮状态
		this.setBtns();
	}

	public close(...param: any[]): void {
		MessageCenter.ins().removeAll(this);
	}

	/**
	 * 关闭处理
	 * @param  {egret.TouchEvent} e
	 */
	private onClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	/**
	 * 点击其他地方处理
	 * @param  {egret.TouchEvent} e
	 */
	private otherClose(e: egret.TouchEvent) {
		if (e.target == this.bg || e.target instanceof eui.Button)
			return;
		ViewManager.ins().close(this);
	}

	/**
	 * 点击处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			switch (e.currentTarget) {
				case this.leftBtn:
					this.curRole--;
					this.setAttrList();
					this.setAttrs();
					this.setBtns();
					break;
				case this.rightBtn:
					this.curRole++;
					this.setAttrList();
					this.setAttrs();
					this.setBtns();
					break;
			}
		}
	}

	/**
	 * 移动处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onMove(e: egret.TouchEvent): void {
		switch (e.type) {
			case egret.TouchEvent.TOUCH_BEGIN:
				this._lastX = e.localX;
				break;
			case egret.TouchEvent.TOUCH_END:
				if (this._lastX > e.localX) {
					if (this.curRole < 3) {
						this.curRole++;
						this.setAttrList();
						this.setAttrs();
						this.setBtns();
					}
				} else if (this._lastX < e.localX) {
					if (this.curRole > 0) {
						this.curRole--;
						this.setAttrList();
						this.setAttrs();
						this.setBtns();
					}
				}
				break;
		}
	}

	/**
	 * 设置属性
	 * @returns void
	 */
	private setAttrs(): void {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		if (role) {
			//职业
			this.job.source = JobTitleImg[role.job];

			let str: string = "";
			for (let j: number = this.imgGroup.numChildren - 1; j >= 0; j--) {
				let item = this.imgGroup.getChildAt(j);
				DisplayUtils.removeFromParent(item);
				item = null;
			}

			let count: number = 0;
			for (let i: number = 0; i < this.proShowList.length; i++) {
				let list: AttributeData[] = this.proShowList[i];
				str += RuneConfigMgr.ins().getAttrByList(list, i);
				
				let imgH = 19;
				let space = 9;
				for (let k in list) {
					let img: eui.Image = new eui.Image();
					img.source = "com_point01";
					img.y = count * (imgH + space);
					img.x = -5;
					this.imgGroup.addChild(img);
					count++
				}
			}
			if (str.length <= 0) {
				str = `暂无属性\n`;
			}
			this.attr.textFlow = TextFlowMaker.generateTextFlow(str);
			this.mainGroup.height = this.attr.height + 190;
		}
	}

	/**
	 * 设置按钮
	 * @returns void
	 */
	private setBtns(): void {
		let len: number = SubRoles.ins().subRolesLen;
		if (len == 1) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = false;
		} else if (len > 1) {
			if (this.curRole == 0) {
				this.leftBtn.visible = false;
				this.rightBtn.visible = true;
			} else if (this.curRole == 1) {
				this.leftBtn.visible = true;
				this.rightBtn.visible = len >= 3;
			} else if (this.curRole == 2) {
				this.leftBtn.visible = true;
				this.rightBtn.visible = false;
			}
		}
	}
}

ViewManager.ins().reg(RuneAttrWin, LayerManager.UI_Popup); 