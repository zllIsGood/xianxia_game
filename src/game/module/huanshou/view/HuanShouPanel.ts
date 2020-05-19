import Button = eui.Button;
class HuanShouPanel extends BaseView {
	private fabaoName: eui.Image;
	private fabaoName0: eui.Image;
	private huanshouGroup: eui.Group;
	private upgradeBtn: eui.Button;
	private upgradeBtn0: eui.Button;
	private curLabel: eui.Label;
	private nextLabel: eui.Label;

	private label1: eui.Label;
	private label2: eui.Label;
	private num: eui.Label;
	private huoqu: eui.Label;
	private huanhua: eui.Button;
	private behuanhua:eui.Image;
	private red: eui.Image;
	private leftBtn: eui.Button;
	private rightBtn: eui.Button;
	private bar: eui.Group;
	private barMask: egret.Shape;
	private up0: eui.Button;
	private redPoint0: eui.Image;
	private used0: eui.Label;
	private up2: eui.Button;
	private redPoint2: eui.Image;
	private used2: eui.Label;
	private yslq: eui.Button;
	private rightRedzb: eui.Image; 
	public powerPanel: PowerPanel;
	private appearanceBtn:eui.Button;
	private redhuanhua:eui.Image;
	private skillBtn:eui.Button;
	private redskill:eui.Image;

	private expEff: MovieClip;
	private hsMC: HuanShouMc;
	private currShowRank: number = 0;//当前模型显示阶数
	public constructor() {
		super();
		this.name = "宠物";
	}

	public childrenCreated(): void {
		this.init();
	}

	private init(): void {
		this.hsMC = new HuanShouMc();
		this.huanshouGroup.addChild(this.hsMC);

		this.huoqu.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.huoqu.text}|`);

		this.curLabel = this["AttrLabel"];

		let circleMask = new egret.Rectangle(-200, -190, 400 * 2, 320 * 2);
		
		// this.barMask = new egret.Shape();
		// this.barMask.rotation = 122;
		// this.barMask.touchEnabled = false;
		// this.bar.addChild(this.barMask);
		
		this.expEff = new MovieClip();
		// this.expEff.mask = this.barMask;
		this.expEff.mask = circleMask;

		this.bar.x-=1;
		this.bar.y+=3;
	}

	public open(): void {
		this.addTouchEvent(this.upgradeBtn, this.onTap);
		this.addTouchEvent(this.huoqu, this.onTap);
		this.addTouchEvent(this.huanhua, this.onTap);
		this.addTouchEvent(this.upgradeBtn0, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.up0, this.onTap);
		this.addTouchEvent(this.up2, this.onTap);
		this.addTouchEvent(this.yslq, this.onTap);
		this.addTouchEvent(this.appearanceBtn, this.onTap);
		this.addTouchEvent(this.skillBtn, this.onTap);
		this.observe(UserHuanShou.ins().postHuanShouInfo, this.onUpdateIfo);

		this.observe(HuanShouRedPoint.ins().postUpgradeRed, this.updateBtnRed);
		this.observe(HuanShouRedPoint.ins().postEquipTotalRed, this.updateBtnRed);
		this.observe(HuanShouRedPoint.ins().postSkillRed, this.updateBtnRed);
		this.observe(HuanShouRedPoint.ins().postDanRed, this.updateBtnRed);
		this.observe(HuanShouRedPoint.ins().postSkinTotalRed, this.updateBtnRed);
		this.observe(UserHuanShou.ins().postUpdateSkill, this.updateBtnRed);
		
		this.observe(UserHuanShou.ins().postUpgrade, this.onUpdateIfo);
		this.observe(UserHuanShou.ins().postUpdateDanInfo, this.updateView);
		this.observe(UserHuanShou.ins().postHuanShouChange, this.onUpdateRankChange);
		this.observe(UserHuanShou.ins().postSkinTrainInfo, this.onChange);
		this.observe(UserBag.ins().postItemChange,this.UpdataRed);
		
		this.onUpdateIfo();
		this.onUpdateEquipRed();
		// this.expEff.mask = this.barMask;
		this.updateBtnRed();
	}

	private updateBtnRed():void{
		this.redhuanhua.visible = HuanShouRedPoint.ins().skinTotalRed;
		this.redskill.visible = HuanShouRedPoint.ins().skillRed;
		this.onUpdateDan();
	}

	private UpdataRed():void{
		this.onChange();
		this.onUpdateItem();
	}

	private onChange():void{
		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];
		let str = "";
		let bagCount = UserBag.ins().getItemCountById(0, levelConf.itemId);

		if(!UserBag.ins().element || !UserBag.ins().element.count) return;
		if (UserBag.ins().element.count < levelConf.count) {
			str = `|C:0xff0303&T:${bagCount}/${levelConf.count}|`
		} else {
			str = `|C:0x18ff00&T:${bagCount}/${levelConf.count}|`;
		}
		this.num.textFlow = TextFlowMaker.generateTextFlow(str);
	}

	public close(): void {
		this.expEff.mask = null;
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.upgradeBtn:
				if (this.upgradeBtn.label == "升　阶") {
					UserHuanShou.ins().sendUpgrade();
				} else {
					let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];

					if (levelConf.itemId > 0) {
						let confCount = levelConf.count;
						let bagCount = UserBag.ins().getItemCountById(0, levelConf.itemId);
						if (bagCount >= confCount) {
							UserHuanShou.ins().sendUpgrade();
						} else {
							UserTips.ins().showTips(`道具不足`);
						}
					}
				}
				break;
			case this.upgradeBtn0:
				UserHuanShou.ins().sendUpgrade();
				break;
			case this.huoqu:
				let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];
				if (!levelConf)
					return;
				UserWarn.ins().setBuyGoodsWarn(levelConf.itemId);
				break;

			case this.huanhua:
				if (this.currShowRank != UserHuanShou.ins().changeIndex && UserHuanShou.ins().rank >= this.currShowRank)
					UserHuanShou.ins().sendHuanShouChange(this.currShowRank, 0);
				break;
			case this.leftBtn:
				if (this.currShowRank > 1) {
					this.currShowRank--;
					this.udpateMonsterShow();
				}
				this.updatecurrShowRankState();
				break;
			case this.rightBtn:
				if (this.currShowRank + 1 <= UserHuanShou.ins().rank + 1 && GlobalConfig.HuanShouStageConf[this.currShowRank + 1]) {
					this.currShowRank++;
					this.udpateMonsterShow();
				}
				this.updatecurrShowRankState();
				break;
			case this.up0:
				if (this.redPoint0.visible) {
					UserHuanShou.ins().sendUseDan(0);
				} else {
					ViewManager.ins().open(HuanShouItemTips, 0);
				}

				break;
			case this.up2:
				if (this.redPoint2.visible) {
					UserHuanShou.ins().sendUseDan(1);
				} else {
					ViewManager.ins().open(HuanShouItemTips, 1);
				}

				break;
			case this.yslq:
				ViewManager.ins().open(HuanShouEquipWin);
				break;
			case this.appearanceBtn:
			    ViewManager.ins().open(HuanHuaWin);
				break;
			case this.skillBtn:
			    ViewManager.ins().open(HuanHuaSkillWin);
				break;
		}
	}

	private onUpdateRankChange(): void {
		this.updatecurrShowRankState();
	}

	private onUpdateDan(): void {
		this.redPoint0.visible = HuanShouRedPoint.ins().danRed[0];
		this.redPoint2.visible = HuanShouRedPoint.ins().danRed[1];
	}

	private onUpdateEquipRed(): void {
		if (UserHuanShou.ins().rank <= 0)
			return;
		this.rightRedzb.visible = HuanShouRedPoint.ins().equipTotalRed;
	}

	private updatecurrShowRankState(): void {
		this.leftBtn.visible = this.currShowRank > 1;
		this.rightBtn.visible = GlobalConfig.HuanShouStageConf[this.currShowRank + 1] && (this.currShowRank + 1 <= UserHuanShou.ins().rank + 1);
		this.huanhua.visible = UserHuanShou.ins().changeIndex != this.currShowRank && this.currShowRank <= UserHuanShou.ins().rank;
		this.behuanhua.visible = this.rightBtn.visible == true ? !this.huanhua.visible : this.rightBtn.visible;
	}

	private notActive(): void {
		let rank = 1;//显示一阶
		let str: string = rank > 9 ? rank + "" : "0" + rank;
		this.fabaoName0.source = "sqlevel_" + str;
		this.fabaoName.source = "hsname_001_png";
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank];
		this.setHsMC(conf);
		this.huanhua.visible = false;
		this.behuanhua.visible = !this.huanhua.visible;
	}

	private setHsMC(conf: HuanShouStageConf): void {
		let avatar: string = conf.avatar ? conf.avatar : GlobalConfig.MonstersConfig[conf.monsterId].avatar;
		this.hsMC.setData(avatar);
		if (conf.xy) {
			this.hsMC.x = conf.xy[0];
			this.hsMC.y = conf.xy[1];
		} else {
			this.hsMC.x = 0;
			this.hsMC.y = 0;
		}

	}
	private updateView(): void {
		if (!UserHuanShou.ins().rank)
			return;

		this.used0.text = UserHuanShou.ins().qianNengCount + "";
		this.used2.text = UserHuanShou.ins().feiShengCount + "";
		let rank = UserHuanShou.ins().rank;
		let exp = UserHuanShou.ins().exp;
		let level = UserHuanShou.ins().level;
		let str: string = rank > 9 ? rank + "" : "0" + rank;
		this.fabaoName0.source = "sqlevel_" + str;
		str = rank > 9 ? rank + "" : "0" + rank;
		this.fabaoName.source = `hsname_0${str}_png`;
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank];
		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[level];
		let starAttrs: AttributeData[] = levelConf.attr || [];
		let levelAttrs: AttributeData[] = conf.attr || [];
		let attrs: AttributeData[] = AttributeData.AttrChangeAddition(starAttrs, levelAttrs);
		let nextAttrs: AttributeData[];
		let maxLevel: boolean = false;
		if (exp >= conf.exp) {
			this.upgradeBtn.label = "升　阶";
			let nConf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank + 1];
			if (nConf) {
				nextAttrs = AttributeData.AttrChangeAddition(nConf.attr, starAttrs);
			} else {
				maxLevel = true;
			}
		} else {
			this.upgradeBtn.label = "培　养";
			if (GlobalConfig.HuanShouTrainConf[level + 1]) {
				nextAttrs = AttributeData.AttrChangeAddition(levelAttrs, GlobalConfig.HuanShouTrainConf[level + 1].attr);
			}
		}

		if (!this.expEff.parent) {
			this.expEff.once(egret.Event.CHANGE, this.updateExp, this);
			this.expEff.playFile(`${RES_DIR_EFF}huanshoubar`, -1);
			this.bar.addChild(this.expEff);
		}
		this.updateExp();

		this.label2.visible = maxLevel;
		this.upgradeBtn.visible = !maxLevel;

		let equipPercent = UserHuanShou.ins().equipPercent;
		let danPercent = UserHuanShou.ins().danPercent;
		//统计万份比加成
		for (let key in attrs) {
			let attr = attrs[key];
			let percent = 0;
			if (!isNaN(equipPercent[attr.type])) {
				percent += equipPercent[attr.type];
			}
			if (!isNaN(danPercent[attr.type])) {
				percent += danPercent[attr.type];
			}
			if (percent > 0) {
				attr.value = (attr.value * (1 + percent / 10000)) >> 0;
			}
		}
		let equipAttrs = UserHuanShou.ins().equipAttrs;
		let confEquipAttrs = GlobalConfig.HuanShouConf.equipAttrs;
		let len = confEquipAttrs.length;
		let newEquipAttrs = [];
		///过虑装备不加人物身上的属性
		for (let i = 0; i < len; i++) {
			let attr = confEquipAttrs[i];
			for (let key in equipAttrs) {
				if (equipAttrs.hasOwnProperty(key)) {
					let element = equipAttrs[key];
					if (element.type == attr.type) {
						newEquipAttrs.push(element);
						break;
					}
				}
			}
		}
		attrs = AttributeData.AttrChangeAddition(attrs, newEquipAttrs);//加入装备属性
		attrs = AttributeData.AttrChangeAddition(attrs, UserHuanShou.ins().danAttrs);//加入丹药属性
		attrs = AttributeData.AttrChangeAddition(attrs, UserHuanShou.ins().filterPassiveAttr);
		
		this.curLabel.text = AttributeData.getAttStr(attrs, 1, 1, ":");
		if (nextAttrs) {
			//统计万份比加成
			for (let key in nextAttrs) {
				let attr = nextAttrs[key];
				let percent = 0;
				if (!isNaN(equipPercent[attr.type])) {
					percent += equipPercent[attr.type];
				}
				if (!isNaN(danPercent[attr.type])) {
					percent += danPercent[attr.type];
				}
				if (percent > 0) {
					attr.value = (attr.value * (1 + percent / 10000)) >> 0;
				}
			}
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, newEquipAttrs);//加入装备属性
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, UserHuanShou.ins().danAttrs);//加入丹药属性
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, UserHuanShou.ins().filterPassiveAttr);

			this.nextLabel.text = AttributeData.getAttStr(nextAttrs, 1, 1, ":");
		} else {
			this.nextLabel.text = "";
		}

		let power = UserBag.getAttrPower(attrs);
		let count = SubRoles.ins().subRolesLen;
		this.powerPanel.setPower(power * count);

		this.setHsMC(conf);
		this.currShowRank = rank;
		this.updatecurrShowRankState();
	}

	private updateExp(): void {
		let exp = UserHuanShou.ins().exp;
		let rank = UserHuanShou.ins().rank;
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank];
		if (!conf)
			return;

		let toExp = conf.exp;
		if (rank > 1) {
			let lostExp = GlobalConfig.HuanShouStageConf[rank - 1].exp;
			toExp = conf.exp - lostExp;
			exp -= lostExp;
		}
		let a = exp / toExp;
		let mask = this.expEff.mask;
		mask.y = -190 + 380 * (1 - a);
		// let init = 0;
		// let max = 296;
		// DisplayUtils.drawCir(this.barMask, this.expEff.width / 2, Math.floor(max * a), false, init);
	}

	private udpateMonsterShow(): void {
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[this.currShowRank];
		this.setHsMC(conf);
		let str: string = this.currShowRank > 9 ? this.currShowRank + "" : "0" + this.currShowRank;
		this.fabaoName.source = `hsname_0${str}_png`;

		this.fabaoName0.source = "sqlevel_" + str;
	}

	private onUpdateIfo(): void {
		let rank = UserHuanShou.ins().rank;

		if (!rank) {
			this.currentState = `jihuo`;
			this.validateNow();
			this.notActive();
			this.powerPanel.visible = false;
			this.skillBtn.visible = false;
			this.behuanhua.visible = false;
		} else {

			if (!GlobalConfig.HuanShouStageConf[rank + 1] && !GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level + 1]) {
				this.currentState = "max";
			} else {
				this.currentState = "normal";
				this.skillBtn.visible = true;
				this.behuanhua.visible = true;
			}
			this.validateNow();
			this.updateView();
			this.onUpdateItem();
			this.powerPanel.visible = true;

		}

		this.onUpdateDan();
		this.onUpdateEquipRed();
	}

	private onUpdateItem(): void {
		
		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];

		if (!levelConf || this.upgradeBtn.label == "升　阶") {
			this.red.visible = this.upgradeBtn.label == "升　阶" && this.currentState != "max";
			this.num.text = "";
			this.label1.text = "";
			return;
		}

		let itemId: number = levelConf.itemId;

		if (itemId > 0) {

			let confCount = levelConf.count;
			let bagCount = UserBag.ins().getItemCountById(0, itemId);
			this.red.visible =confCount <= bagCount;
			let str = "";
			if (bagCount < confCount) {
				str = `|C:0xff0303&T:${bagCount}/${confCount}|`
			} else {
				str = `|C:0x18ff00&T:${bagCount}/${confCount}|`;
			}
			this.num.textFlow = TextFlowMaker.generateTextFlow(str);
			this.label1.text = `消耗${GlobalConfig.ItemConfig[itemId].name}：`;
		} else {
			this.num.text = "";
			this.label1.text = "";
			this.red.visible = false;
		}
		if (this.currentState == "max") {
			this.red.visible = false;
		}
	}
}