/**
 * 心法详情
 *
 */
class HeartMethodAttrWin extends BaseEuiView {
	private bg: eui.Image;
	private job: eui.Image;
	private attr: eui.Label;
	private attrName: eui.Label;
	private leftBtn: eui.Button;
	private rightBtn: eui.Button;
	private closeBtn: eui.Button;
	private bgClose: eui.Rect;
	/** 当前选择的角色 */
	public curRole: number;
	private heartId: number;//心法id
	private _lastX: number = 0;

	private attrGroup: eui.Group;

	private proShowList: HeartTypeData[] = [];

	constructor() {
		super();
		this.skinName = "heartmethodAttrSkin";
		this.isTopLevel = true;
		this.proShowList = HeartMethod.ins().proShowList;
	}

	public initUI(): void {
		super.initUI();
	}


	public open(...param: any[]): void {
		this.curRole = param[0];
		this.heartId = param[1];
		this.setRoleAttr(this.curRole);
		let len: number = SubRoles.ins().subRolesLen;
		if (len > 1) {
			this.addTouchEvent(this.leftBtn, this.onTouch);
			this.addTouchEvent(this.rightBtn, this.onTouch);
			this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMove, this);
			this.addTouchEndEvent(this.bg, this.onMove);

		}
		this.addTouchEndEvent(this, this.otherClose);
		// this.addTouchEvent(this.closeBtn, this.onClose);
		// this.addTouchEvent(this.bgClose, this.onClose);
	}

	public close(...param: any[]): void {
		let len: number = SubRoles.ins().subRolesLen;
		if (len > 1) {
			this.removeTouchEvent(this.leftBtn, this.onTouch);
			this.removeTouchEvent(this.rightBtn, this.onTouch);
			this.bg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMove, this);
			this.bg.removeEventListener(egret.TouchEvent.TOUCH_END, this.onMove, this);
		}
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
		// this.removeTouchEvent(this.closeBtn, this.onClose);
		// this.removeTouchEvent(this.bgClose, this.onClose);
	}

	private onClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private otherClose(e: egret.TouchEvent) {
		if (e.target == this.bg || e.target instanceof eui.Button)
			return;
		ViewManager.ins().close(this);
	}

	private onMove(e: egret.TouchEvent): void {
		switch (e.type) {
			case egret.TouchEvent.TOUCH_BEGIN:
				this._lastX = e.localX;
				break;
			case egret.TouchEvent.TOUCH_END:
				if (this._lastX > e.localX) {
					if (this.curRole < 2) {
						this.curRole++;
						this.setRoleAttr(this.curRole);
						this.moveAttr(-200);
					}
				} else if (this._lastX < e.localX) {
					if (this.curRole > 0) {
						this.curRole--;
						this.setRoleAttr(this.curRole);
						this.moveAttr(200);
					}
				}
				break;
		}

	}

	private moveAttr(num: number): void {
		let t: egret.Tween = egret.Tween.get(this.attrGroup);
		let toNum: number;
		if (num > 0)
			toNum = 0;
		else
			toNum = 242;
		t.to({"x": this.attrGroup.x + num, "alpha": 0}, 200).to({"x": toNum}, 200).to({"x": 80, "alpha": 1}, 200);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.leftBtn:
				if (this.curRole > 0) {
					this.curRole--;
					this.setRoleAttr(this.curRole);
					this.moveAttr(200);
				}

				break;
			case this.rightBtn:
				if (this.curRole < 2) {
					this.curRole++;
					this.setRoleAttr(this.curRole);
					this.moveAttr(-200);
				}
				break;
		}
	}

	private setRoleAttr(roleId: number): void {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		switch (role.job) {
			case 1:
			    this.job.source = "partner_word_wanyanzheng";
				break;
			case 2:
			    this.job.source = "partner_word_wenjing";
				break;
			case 3:
			    this.job.source = "partner_word_sikongqi";
				break;
		}
		
		let str: string = "";
		let strName: string = "";
		// let attName: string = "";
		let value: number = 0;
		let i: number = 0;
		let attrsList: number[] = HeartMethod.ins().calcHeartTotalValue(role.index, this.heartId);
		for (let j: number = 0; j < this.proShowList.length; j++) {
			i = this.proShowList[j].id;
			value = attrsList[j];
			if (!value)continue;
			if (this.proShowList[j].id == AttributeType.atZhuiMingPro)
				str += value + "%";
			else
				str += value + "";
			strName += HeartMethod.ins().getAttrStrByType(i) + ":";
			// value = role.attributeData[i];
			// if (i > 1 && i < 9) {
			// 	if (i == 7 || i == 8) {
			// 		str += value / 100 + "%";
			// 	} else {
			// 		str += value;
			// 	}
			// } else if (i > 12 && i < 15 || i > 15) {
			// 	str += value / 100 + "%";
			// }
			// else
			// 	continue;
			if (j < this.proShowList.length - 1) {
				str += "\n";
				strName += "\n";
			}

		}
		// for(let i: number = 0;i < role.attributeData.length; i++){

		// }
		this.attr.text = str;
		this.attrName.text = strName;
		this.setBtn();
	}

	private setBtn(): void {
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
				if (len < 3)
					this.rightBtn.visible = false;
				else
					this.rightBtn.visible = true;
			} else if (this.curRole == 2) {
				this.leftBtn.visible = true;
				this.rightBtn.visible = false;
			}
		}
	}
}

ViewManager.ins().reg(HeartMethodAttrWin, LayerManager.UI_Popup);
