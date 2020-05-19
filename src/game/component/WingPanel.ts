/**
 * 翅膀
 */
class WingPanel extends BaseView {
	private wingImg: eui.Image;
	private arrows: eui.Image;
	private attrLabel: eui.Label;
	private nextAttrLabel: eui.Label;
	private attrTempLabel: eui.Label;
	private openStatusBtn: eui.Button;
	private boostBtn1: eui.Button;
	private boostBtn0: eui.Button;
	private boostPrice1: PriceIcon;
	private _totalPower: number;
	private _wingsData: WingsData;
	public curRole: number = 0;
	// private mc: MovieClip;
	private _lastLv: number = 0;
	private _isAutoUp: boolean = false;
	/** 可更换的翅膀装备 */
	// public canChangeWingEquips: boolean[][];
	private rightBtn: eui.Button;
	private leftBtn: eui.Button;
	public checkBoxs: eui.CheckBox;
	private expGroup: eui.Group;
	private skillGroup: eui.Group;
	private nameTxt: eui.Label;
	private skillIconArr: WingSkillItemRender[];
	public weijihuo: eui.Group;
	public jihuo: eui.Group;
	public jihuolv: eui.Label;

	public clearGroup: eui.Group;
	private desc: eui.Label;
	private lastTime: eui.Label;
	private timeLabel: eui.Label;
	private powerPanel: PowerPanel;
	private danItemID: number;
	public maxInfo: eui.Group;

	private bigUpLevelBtn: eui.Button;
	private noclean: eui.Label;

	private reliveEff: MovieClip;
	private barbc: ProgressBarEff;
	private attrGroup: eui.Group;
	private redPoint: eui.Image;
	private shenyu: eui.Button;
	private redPoint0: eui.Image;

	public feishengBtn:eui.Button;
	public redPoint1:eui.Image;
	public zizhiBtn:eui.Button;
	public redPoint2:eui.Image;
	constructor() {
		super();
		this.skinName = "WingSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.setSkinPart("barbc", new ProgressBarEff());
		this.boostPrice1.setType(MoneyConst.wing);

		this.wingImg.touchEnabled = false;

		this.reliveEff = new MovieClip();
		this.reliveEff.x = 280;
		this.reliveEff.y = 527;

		this.skillIconArr = [];
		for (let i = 0; i < 5; i++) {
			this.skillIconArr[i] = this[`itemicon${i}`];
		}
		this.danItemID = GlobalConfig.WingCommonConfig.levelItemid;
		this.feishengBtn.visible = true;
		this.zizhiBtn.visible = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.openStatusBtn, this.onTap);
		this.addTouchEvent(this.boostBtn1, this.onTap);
		this.addTouchEvent(this.checkBoxs, this.isShowUpGradeBtn);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.bigUpLevelBtn, this.onTap);
		this.addTouchEvent(this.boostBtn0, this.onTap);
		this.addTouchEvent(this.shenyu, this.onTap);
		this.addTouchEvent(this.feishengBtn, this.onTap);
		this.addTouchEvent(this.zizhiBtn, this.onTap);

		for (let i: number = 0; i < 5; i++) {
			this.addTouchEvent(this.skillIconArr[i], this.skillItemClick);
		}
		this.observe(Wing.ins().postBoost, this.showBoost);
		this.observe(Wing.ins().postWingUpgrade, this.updateLevel);
		this.observe(Wing.ins().postActivate, this.setWingData);
		this.observe(Wing.ins().postWingEquip, this.setWingData);
		this.observe(Wing.ins().postWingTime, this.setTimeDown);
		this.observe(UserBag.ins().postItemChange, this.isShowUpGradeBtn);//道具变更
		this.observe(UserBag.ins().postItemAdd, this.isShowUpGradeBtn);//道具添加
		this.observe(UserBag.ins().postItemDel, this.isShowUpGradeBtn);//道具删除
		this.observe(GodWingRedPoint.ins().postGodWingRedPoint, this.updateRedPoint);//神羽红点
		this.observe(Wing.ins().postUseDanSuccess, this.setWingData); //使用飞升丹或资质丹
		this.barbc.reset();
		this.setWingData();
		this.updateLevel();
		this.updateRedPoint();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.openStatusBtn, this.onTap);
		this.removeTouchEvent(this.boostBtn1, this.onTap);
		this.removeTouchEvent(this.checkBoxs, this.isShowUpGradeBtn);
		this.removeTouchEvent(this.rightBtn, this.onTap);
		this.removeTouchEvent(this.leftBtn, this.onTap);
		this.removeTouchEvent(this.boostBtn0, this.onTap);
		this.removeTouchEvent(this.bigUpLevelBtn, this.onTap);
		this.removeTouchEvent(this.shenyu, this.onTap);
		for (let i: number = 0; i < 5; i++) {
			this.removeTouchEvent(this.skillIconArr[i], this.skillItemClick);
		}
		TimerManager.ins().remove(this.autoUpStar, this);
		this.removeObserve();
		if (this._isAutoUp) {
			this.stopAutoUp();
		}
		TimerManager.ins().remove(this.refushTimeLabel, this);
	}

	private updateLevel(): void {
		let wingSkills: number[] = SubRoles.ins().getSubRoleByIndex(this.curRole).wingSkillData;
		let curIndex: number = 0;
		for (let i: number = 0; i < 5; i++) {
			if (wingSkills[i] && wingSkills[i] > 0) {
				this.skillIconArr[i].data = wingSkills[i];
				this[`openTxt${i}`].text = ``;
				curIndex = i + 1;
			} else {
				let level: number = Wing.ins().getLevelBySkill(i);
				this[`openTxt${i}`].text = `${level + 1}阶开启`;
				this.skillIconArr[i].skillIcon.visible = false;
			}
		}
		//下一级预览
		if (curIndex < 5) {
			let icon: number;
			let wingConfig = GlobalConfig.WingLevelConfig;
			let idx = 0;
			for (let k in wingConfig) {
				let cfg: WingLevelConfig = wingConfig[k];
				if (cfg && cfg.pasSkillId) {
					icon = cfg.pasSkillId;
					if (idx == curIndex) break;
					idx++;
				}
			}
			if (icon) {
				this.skillIconArr[curIndex].data = icon;
				this.skillIconArr[curIndex].blackImg.visible = true;
			}
		}

		if (this._isAutoUp) {
			this.stopAutoUp();
		}
		this.setWingData();
	}

	/** 刷新飞升丹和资质丹 */
	private updateDans():void
	{
		this.redPoint1.visible = Wing.ins().canUseFlyUpByRoleID(this.curRole);
		this.redPoint2.visible = Wing.ins().canUseAptitudeByRoleID(this.curRole);
	}

	private currViewNum: number = 0;

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.openStatusBtn:
				if (Wing.ins().remainTask() == 0)
					Wing.ins().sendActivate(this.curRole);
				else {
					UserTips.ins().showTips("|C:0xf3311e&T:等级不够，无法激活|");
				}
				break;
			case this.boostBtn1:
				if (this._isAutoUp) {
					this.stopAutoUp();
				}
				this.autoUpStar();
				break;
			case this.rightBtn:
				this.currViewNum++;
				this.setSeeBtnStatu();
				this.setWingView(this.currViewNum);
				break;
			case this.leftBtn:
				this.currViewNum--;
				this.setSeeBtnStatu();
				this.setWingView(this.currViewNum);
				break;
			case this.boostBtn0:
				if (this.boostBtn0.label == "停 止") {
					if (this._isAutoUp) {
						this.stopAutoUp();
					}
				} else {
					this._isAutoUp = true;
					this.boostBtn0.label = "停 止";
					TimerManager.ins().doTimer(150, 0, this.autoUpStar, this);
				}
				break;
			case this.bigUpLevelBtn:
				let itemName: string = GlobalConfig.ItemConfig[this.danItemID].name;
				WarnWin.show(`确定使用${itemName}提升羽翼吗？\n说明：\n${GlobalConfig.ItemConfig[this.danItemID].desc}`, () => {
					Wing.ins().sendBigUpLevel(this.curRole);
				}, this);
				break;
			case this.shenyu:
				//神羽入口
				ViewManager.ins().open(GodWingWin);
				break;
				case this.feishengBtn: //飞升
			ViewManager.ins().open(WingFeishengTipsWin, this.curRole);
				break;
			case this.zizhiBtn: //资质丹
				ViewManager.ins().open(WingZizhiTipsWin, this.curRole);
				break;
		}
	}

	private skillItemClick(e: egret.TouchEvent): void {
		let index: number = this.skillIconArr.indexOf(e.currentTarget);
		if (index >= 0) {
			if (!this.skillIconArr[index].skillIcon.visible)
				return;
			ViewManager.ins().open(WingSkillTipPanel, Wing.ins().getWingSkillByIndex(index));
		}
	}

	private stopAutoUp(): void {
		this._isAutoUp = false;
		this.boostBtn0.label = "一键升阶";
		TimerManager.ins().remove(this.autoUpStar, this);
	}

	private autoUpStar(): void {
		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		let count: number = UserBag.ins().getItemCountById(0, config.itemId);
		if (count >= config.itemNum) {
			Wing.ins().sendBoost(this.curRole, 0);
		}
		else if (this.checkBoxs.selected) {
			if (Actor.yb >= config.itemNum * config.itemPrice) {
				Wing.ins().sendBoost(this.curRole, 1);
			}
			else {
				this.stopAutoUp();
			}
		} else {
			this.stopAutoUp();
			UserTips.ins().showTips("|C:0xf3311e&T:羽毛不足，可自动消耗元宝升级|");
		}

	}

	/**
	 * 未激活
	 */
	private notOpenStatus(): void {
		this.expGroup.visible = false;
		this.skillGroup.visible = false;
		this.barbc.visible = false;
		this.boostBtn0.visible = false;
		this.boostBtn1.visible = false;
		this.boostPrice1.visible = false;
		this.powerPanel.visible = false;
		this.openStatusBtn.visible = true;
		this.rightBtn.visible = false;
		this.leftBtn.visible = false;
		this.jihuo.visible = false;
		this.weijihuo.visible = true;
		let flag: boolean = (Wing.ins().remainTask() > 0);
		this.jihuolv.visible = flag;
		this.jihuolv.text = `${Wing.ins().remainTask()}个任务后开启`;
		this.bigUpLevelBtn.visible = this.redPoint.visible = false;
		if (!flag) {
			this.reliveEff.playFile(RES_DIR_EFF + "chargeff1", -1);
			this.weijihuo.addChild(this.reliveEff);
		}
	}

	/**
	 * 已激活
	 */
	private openStatusOpen(): void {
		this.skillGroup.visible = true;
		this.openStatusBtn.visible = false;
		this.barbc.visible = true;
		this.boostBtn0.visible = true;
		this.boostBtn1.visible = true;
		this.powerPanel.visible = true;
		this.rightBtn.visible = true;
		this.leftBtn.visible = true;
		this.jihuo.visible = true;
		this.weijihuo.visible = false;
		this.bigUpLevelBtn.visible = true;
		if (this._wingsData.lv >= Wing.WingMaxLv) {
			//最高级
			this.arrows.visible = false;
			this.nextAttrLabel.text = "";
			this.attrLabel.horizontalCenter = 0;
			this.expGroup.visible = false;
			this.maxInfo.visible = true;
		} else {
			//不是最高级
			this.arrows.visible = true;
			this.attrLabel.horizontalCenter = -100;
			this.expGroup.visible = true;
			this.maxInfo.visible = false;
		}
		this.redPoint.visible = this.bigUpLevelBtn.visible && this._wingsData.lv == Wing.WingExpRedPoint;
		//神羽入口显示
		this.shenyu.visible = GameServer.serverOpenDay + 1 >= GlobalConfig.WingCommonConfig.openDay ? true : false;//开服第五天
	}

	/**
	 * 培养表现
	 * @param crit 暴击（1=不暴击，2=两倍暴击，以此类推）
	 * @param addExp 增加的经验
	 */
	private showBoost(param: any): void {

		let crit: number = param[0];
		let addExp: number = param[1];

		let label: eui.Label = new eui.Label;
		label.size = 20;
		let str: string = "";
		if (crit > 1) {
			label.textColor = 0xf3311e;
			str = "暴击 羽翼经验 + ";
			label.x = 205;
		} else {
			label.textColor = 0x35e62d;
			str = "羽翼经验 + ";
			label.x = 225;
		}
		label.y = 326;
		label.text = str + addExp;
		this.addChild(label);

		let t: egret.Tween = egret.Tween.get(label);
		t.to({ "y": label.y - 45 }, 500).call(() => {
			this.removeChild(label);
		}, this);

		this.expBarChange();

		this.updateAtt();

		this.isShowUpGradeBtn();
	}

	private setWingView(lv: number): void {
		this.updateDans();
		if (lv > Wing.WingMaxLv || lv < 0) {
			return;
		}
		let tempConfig = GlobalConfig.WingLevelConfig[lv]
		this.wingImg.source = tempConfig.appearance + "_png";
		this.nameTxt.text = tempConfig.name;
	}

	private setWingData(): void {
		this._wingsData = SubRoles.ins().getSubRoleByIndex(this.curRole).wingsData;
		this.wingImg.source = this._wingsData.getImgSource();
		this.currViewNum = this._wingsData.lv;
		this.setSeeBtnStatu();
		let cfg: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		this.nameTxt.text = cfg.name;
		this.updateDans();

		if (this._wingsData.openStatus) {
			this.openStatusOpen();
		} else {
			this.notOpenStatus();
			return;
		}

		this.expBarChange();

		this.updateAtt();

		this.isShowUpGradeBtn();

		this.setTimeDown();

		if (this._lastLv == 0)
			this._lastLv = this._wingsData.lv;
		if (this._lastLv != this._wingsData.lv) {
			this._lastLv = this._wingsData.lv;
		}
	}

	private setSeeBtnStatu(): void {
		if (this.currViewNum >= Wing.WingMaxLv || this.currViewNum >= this._wingsData.lv + 1) {
			this.rightBtn.enabled = false;
			this.leftBtn.enabled = true;
		} else if (this.currViewNum <= 0) {
			this.leftBtn.enabled = false;
			this.rightBtn.enabled = true;
		} else {
			this.leftBtn.enabled = true;
			this.rightBtn.enabled = true;
		}
	}

	private lastTimeDown: number = 0;

	private setTimeDown(): void {
		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		if (!config) {
			return;
		}
		TimerManager.ins().remove(this.refushTimeLabel, this);
		if (config.clearTime) {
			this.clearGroup.visible = true;
			// this.desc.text = `本阶祝福值会清空和临时属性会清空`;
			if (this._wingsData.clearTime > 0) {
				this.lastTime.text = "剩余时间：";
				this.lastTimeDown = Math.floor((DateUtils.formatMiniDateTime(this._wingsData.clearTime) - GameServer.serverTime) / 1000);
				this.lastTimeDown = Math.max(0, this.lastTimeDown);
				this.timeLabel.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1);
				TimerManager.ins().remove(this.refushTimeLabel, this);
				TimerManager.ins().doTimer(1000, this.lastTimeDown, this.refushTimeLabel, this);
			} else {
				this.lastTime.text = "";
				this.timeLabel.text = "";
				TimerManager.ins().remove(this.refushTimeLabel, this);
			}
		} else {
			this.clearGroup.visible = false;
		}
		this.noclean.visible = !this.clearGroup.visible;
	}

	private refushTimeLabel(): void {
		if (this.lastTimeDown > 0) {
			--this.lastTimeDown;
			this.timeLabel.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1);
		}
	}

	private updateAtt(): void {
		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		let nextLvConfig: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv + 1];
		let power: number = 0;
		this._totalPower = UserBag.getAttrPower(config.attr);
        let addAttrs:AttributeData[] = this.getDanAttrs(this._wingsData.lv);
		this._totalPower += UserBag.getAttrPower(addAttrs);

		this.attrLabel.text = AttributeData.getAttStr(AttributeData.AttrAddition(addAttrs, config.attr), 1);
		if (this._wingsData && this._wingsData.exp && nextLvConfig) {
			let tempAttr: AttributeData[] = [];
			let attr = nextLvConfig.attr;
			let configPercent: number = GlobalConfig.WingCommonConfig.tempattr ? GlobalConfig.WingCommonConfig.tempattr : 1;
			for (let index = 0; index < attr.length; index++) {
				let attrs: AttributeData = new AttributeData;
				attrs.type = attr[index].type;
				attrs.value = Math.ceil((this._wingsData.exp / config.exp) * (configPercent * attr[index].value));
				tempAttr.push(attrs);
			}
			this.attrTempLabel.text = AttributeData.getAttStr(tempAttr, 1, 1, "（临时+", false, false, null, "）");
			power = UserBag.getAttrPower(tempAttr);
			this.attrGroup.horizontalCenter = -143;
		} else {
			this.attrTempLabel.text = "";
			this.attrGroup.horizontalCenter = -100;
		}

		this._totalPower = this._totalPower + power;
		this.powerPanel.setPower(this._totalPower);
		if (this._wingsData.lv < Wing.WingMaxLv) {
			this.nextAttrLabel.text = AttributeData.getAttStr(AttributeData.AttrAddition(addAttrs, nextLvConfig.attr), 1);
		}
	}

	/** 资质丹和飞升丹增加的属性 */
	private getDanAttrs(lv:number):AttributeData[]
	{
		let role:Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[lv];
		let len:number = config.attr.length;
		let pAttr:AttributeData[] = [];
		for (let i:number = 0; i < len; i++)
			pAttr.push(new AttributeData(config.attr[i].type, Math.floor(config.attr[i].value * GlobalConfig.WingCommonConfig.flyPill / 10000 * role.wingsData.flyUpDan)));

		let attrs:AttributeData[] = GlobalConfig.WingCommonConfig.attrPill;
		len = attrs.length;
		for (let i:number = 0; i < len; i++)
			pAttr.push(new AttributeData(attrs[i].type, attrs[i].value * role.wingsData.aptitudeDan));

		attrs = GlobalConfig.WingCommonConfig.flyPillAttr;
		len = attrs.length;
		for (let i:number = 0; i < len; i++)
			pAttr.push(new AttributeData(attrs[i].type, attrs[i].value * role.wingsData.flyUpDan));

		return pAttr;
	}

	private expBarChange(): void {
		let starConfig: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		let maxExp: number = starConfig.exp;

		if (this.barbc.getMaximum() != maxExp) {
			this.barbc.setData(this._wingsData.exp, maxExp);
		}
		else {
			this.barbc.setValue(this._wingsData.exp);
		}
	}

	private isShowUpGradeBtn(): void {
		this.updateDans();
		if (this._wingsData.lv >= Wing.WingMaxLv) {
			return;
		}

		let config: WingLevelConfig = GlobalConfig.WingLevelConfig[this._wingsData.lv];
		if (this._wingsData.lv >= Wing.WingMaxLv) {
			this.boostBtn1.visible = false;
			this.boostPrice1.visible = false;
			this.bigUpLevelBtn.visible = false;
		} else {
			this.boostBtn1.visible = true;
			this.boostPrice1.visible = true;
			let count: number = UserBag.ins().getItemCountById(0, this.danItemID);
			this.bigUpLevelBtn.visible = count > 0;
			let itemData: ItemData = UserBag.ins().getBagItemById(config.itemId);
			if (itemData) {
				if (itemData.count < config.itemNum && this.checkBoxs.selected) {
					this.boostPrice1.setType(MoneyConst.yuanbao);
					this.boostPrice1.setPrice(config.itemPrice * config.itemNum, Actor.yb);
				} else {
					this.boostPrice1.setType(MoneyConst.wing);
					this.boostPrice1.setPrice(config.itemNum, itemData.count)
				}
			} else {
				if (this.checkBoxs.selected) {
					this.boostPrice1.setType(MoneyConst.yuanbao);
					this.boostPrice1.setPrice(config.itemPrice * config.itemNum, Actor.yb);
				} else {
					this.boostPrice1.setType(MoneyConst.wing);
					this.boostPrice1.setPrice(config.itemNum, 0);
				}
			}
		}
		this.redPoint.visible = this.bigUpLevelBtn.visible && this._wingsData.lv == Wing.WingExpRedPoint;
	}

	private rapetNum: number = 0;
	private openEffect: MovieClip;
	private flyUpEffect: MovieClip;
	private wingeff: eui.Group;
	private wingMid: eui.Image;
	private wingL: eui.Image;
	private wingR: eui.Image;
	private showOpenMovie(): void {
		StageUtils.ins().setTouchChildren(false);
		DisplayUtils.removeFromParent(this.reliveEff);
		this.openStatusBtn.visible = false;
		if (!this.flyUpEffect) {
			this.flyUpEffect = new MovieClip();
			let p: egret.Point = this.flyUpEffect.localToGlobal();
			p.x = 290;
			p.y = 400;
			this.flyUpEffect.globalToLocal(p.x, p.y, p);
			this.flyUpEffect.x = p.x;
			this.flyUpEffect.y = p.y;
		}

		this.wingeff.addChild(this.flyUpEffect);
		this.flyUpEffect.playFile(RES_DIR_EFF + "functionopeneff", -1);

		let masksp = new egret.Sprite();
		let square: egret.Shape = new egret.Shape();
		square.graphics.beginFill(0xffffff);
		square.graphics.drawRect(0, 0, 640, 640);
		square.graphics.endFill();
		masksp.anchorOffsetX = 0;
		masksp.anchorOffsetY = 0;
		let p: egret.Point = masksp.localToGlobal();
		p.x = 0;
		p.y = 640;
		masksp.globalToLocal(p.x, p.y, p);
		masksp.x = p.x;
		masksp.y = p.y;
		masksp.addChild(square);
		this.wingeff.addChild(masksp);

		this.flyUpEffect.mask = masksp;

		let tween0: egret.Tween = egret.Tween.get(masksp);
		tween0.to({ "y": 0 }, 1500).call(() => {
			egret.Tween.removeTweens(this.flyUpEffect);
			this.flyUpEffect.visible = false;
			this.wingeff.removeChild(masksp);
			this.wingeff.removeChild(this.flyUpEffect);
			this.flowReckEffect();
		});
	}

	private flowReckEffect(): void {
		if (!this.openEffect) {
			this.openEffect = new MovieClip();
			this.openEffect.x = 290;
			this.openEffect.y = 400;
		}
		this.addChild(this.openEffect);
		this.openEffect.playFile(RES_DIR_EFF + "wingstart", 1);

		TimerManager.ins().doTimer(500, 1, () => {
			this.openEffect.scaleX += 1;
			this.openEffect.scaleY += 1;
			let tween0: egret.Tween = egret.Tween.get(this.openEffect, {
				loop: false, onChange: () => {
					
				}
			});


		}, this);
	}
	private updateRedPoint() {
		if (this._wingsData.openStatus) {
			this.redPoint0.visible = GodWingRedPoint.ins().getGodWingRedPoint();
		}
		else {
			this.redPoint0.visible = false;
		}
	}
}
