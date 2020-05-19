class GwSkillTipView extends BaseEuiView {
	private bgClose: eui.Button;//关闭按钮
	private skillName: eui.Label;//技能名字
	private skillImg: eui.Image;//技能图片
	private lvCount: eui.Label;//等级
	private nowskillDesc: eui.Label;//当前属性
	private nextskillDesc: eui.Label;//下一级属性
	private nextImg: eui.Image;//下一等级的底图
	private unlcokTitle: eui.Label;//解锁条件
	private fullLvDesc: eui.Label;//解锁提示文本
	private pointCount: eui.Label;//可用技能点
	private update: eui.Button;//点击升级技能按钮
	private unlockDesc: eui.Label;//解锁条件
	private ultraskillDesc: eui.Label;//技能描述
	private _dataInfo: GwSkillData;
	public constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "GwSkillTipSkin";
		this.bgClose.touchEnabled = true;
	}
	public open(...param: any[]): void {
		this._dataInfo = param[0];
		this.addTouchEvent(this.update, this.touchHandler);
		this.addTouchEvent(this.bgClose, this.closeHandler);
		this.observe(GodWeaponCC.ins().postUpdateInfo, this.updateView);
		this.updateView();
	}
	private updateView(): void {
		let curWeapon: GodWeaponData = GodWeaponCC.ins().getWeaponData(this._dataInfo.weaponId);
		if (this._dataInfo.skillId == 16) {
			this.currentState = "max";
			if (this._dataInfo.isOpen) {
				this.update.visible = true;
				this.pointCount.visible = true;
				this.unlockDesc.visible = false;
				this.unlcokTitle.visible = false;
				this.validateNow();
				if (!curWeapon || curWeapon.skillPoint == 0) {
					this.pointCount.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">神兵等级每提升10级可获得1个技能点</font>');
				} else {
					this.pointCount.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">当前可用的技能点：</font>' + curWeapon.skillPoint);
				}
				if (this._dataInfo.skillLv == 0) {
					this.nowskillDesc.text = `提升等级可学会${this._dataInfo.config.skillName}技能`;
					this.ultraskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addExAttrstr(1));
				} else {
					this.nowskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addAttrValyeType(this._dataInfo.skillLv));
					this.ultraskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addExAttrstr(this._dataInfo.skillLv));
				}
				this.nextskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addAttrValyeType(this._dataInfo.skillLv + 1));
				this.skillImg.source = `${this._dataInfo.config.iconId}_N`;
			} else {
				this.validateNow();
				this.update.visible = false;
				this.pointCount.visible = false;
				this.unlcokTitle.visible = true;
				this.unlockDesc.visible = true;
				this.unlockDesc.text = this._dataInfo.openTip;
				this.skillImg.source = `${this._dataInfo.config.iconId}_L`;
				this.nowskillDesc.text = `提升等级可学会${this._dataInfo.config.skillName}技能`;
				this.ultraskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addExAttrstr(1));
				this.nextskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addAttrValyeType(this._dataInfo.skillLv + 1));
			}
		} else {
			if (this._dataInfo.isOpen) {
				this.validateNow();
				if (this._dataInfo.skillLv < this._dataInfo.config.upLevel) {
					this.currentState = "normal";
					if (!curWeapon || curWeapon.skillPoint == 0) {
						this.pointCount.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">神兵等级每提升10级可获得1个技能点</font>');
					} else {
						this.pointCount.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">当前可用的技能点：</font>' + curWeapon.skillPoint);
					}
				} else {
					this.currentState = "fullLv";
				}
				if (this._dataInfo.skillLv == 0) {
					this.nowskillDesc.text = `提升等级可学会${this._dataInfo.config.skillName}技能`;
				} else {
					this.nowskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addatrStr(this._dataInfo.skillLv));
					if (this._dataInfo.config.skill) {
						this.nowskillDesc.textFlow = TextFlowMaker.generateTextFlow(this._dataInfo.specialSkill(this._dataInfo.skillLv));
					}
					this.descTextAlign(this.nowskillDesc);
				}
				this.nextskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addatrStr(this._dataInfo.skillLv + 1));
				if (this._dataInfo.config.skill) {
					this.nextskillDesc.textFlow = TextFlowMaker.generateTextFlow(this._dataInfo.specialSkill(this._dataInfo.skillLv + 1));
				}
				this.descTextAlign(this.nextskillDesc);
				this.skillImg.source = `${this._dataInfo.config.iconId}_N`;
			} else {
				this.validateNow();
				this.currentState = "lock";
				this.nowskillDesc.textFlow = TextFlowMaker.generateTextFlow(this._dataInfo.config.lockDesc);//`提升等级可学会${this._dataInfo.config.lockDesc}技能`;
				// this.nextskillDesc.textFlow = (new egret.HtmlTextParser).parser(this._dataInfo.addatrStr(this._dataInfo.skillLv + 1));
				// if(this._dataInfo.config.skill){
				// 	this.nextskillDesc.textFlow = TextFlowMaker.generateTextFlow(this._dataInfo.specialSkill(this._dataInfo.skillLv + 1));
				// }
				this.descTextAlign(this.nowskillDesc);
				this.unlockDesc.text = this._dataInfo.openTip;
				this.skillImg.source = `${this._dataInfo.config.iconId}_L`;
			}
		}
		this.skillName.text = this._dataInfo.config.skillName;
		if (this._dataInfo.skillId == 16) {
			this.lvCount.text = this._dataInfo.lvLabel(true);
		} else {
			this.lvCount.text = this._dataInfo.lvLabel();
		}
		let weaponData = GodWeaponCC.ins().getWeaponData(this._dataInfo.weaponId);
		let num: number = (weaponData && weaponData.skillPoint) || 0;
		if (num <= 0) {
			this.update.enabled = false;
		} else {
			this.update.enabled = true;
		}
	}
	private descTextAlign(txt: eui.Label): void {
		if (this._dataInfo.config.attr) {
			txt.textAlign = "center";
		} else {
			if (txt.numLines >= 2) {
				txt.textAlign = "left";
			} else {
				txt.textAlign = "center";
			}
		}
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.update, this.touchHandler);
		this.removeTouchEvent(this.bgClose, this.closeHandler);
	}
	private touchHandler(e: egret.TouchEvent): void {
		if (this._dataInfo.skillLv >= this._dataInfo.config.upLevel) {
			UserTips.ins().showTips(`已达到最大等级`);
			return;
		}
		let weaponData = GodWeaponCC.ins().getWeaponData(this._dataInfo.weaponId);
		let num: number = (weaponData && weaponData.skillPoint) || 0;
		if (num <= 0) {
			UserTips.ins().showTips(`当前可用技能点不足`);
			return;
		}
		GodWeaponCC.ins().gwshowTips = true;
		GodWeaponCC.ins().roleshowTips = SubRoles.ins().subRolesLen;
		GodWeaponCC.ins().upSkill(this._dataInfo.weaponId, this._dataInfo.skillId);
	}
	private closeHandler(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(GwSkillTipView, LayerManager.UI_Popup);