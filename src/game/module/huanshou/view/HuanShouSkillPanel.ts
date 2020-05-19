class HuanShouSkillPanel extends BaseView {
	private manual: eui.Button;
	private displace: eui.Button;
	private skillName: eui.Image;
	private skillLevel: eui.Image;
	private curAtt: eui.Label;
	private nextAtt: eui.Label;
	private skillList: eui.List;
	private upLevel: eui.Button;
	private num: eui.Label;
	private huoqu: eui.Label;
	private mount: eui.Button;
	private disass: eui.Button;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;

	public powerPanel: PowerPanel;
	private dataArray: eui.ArrayCollection;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		
		this.skillList.itemRenderer = HuanShouSkillItem;

		this.dataArray = new eui.ArrayCollection(UserHuanShou.ins().skills);
		this.skillList.dataProvider = this.dataArray;
		this.validateNow();

		this.huoqu.textFlow = TextFlowMaker.generateTextFlow(`|U:&T:${this.huoqu.text}|`)

	}

	public open(): void {
		this.skillList.addEventListener(egret.TouchEvent.CHANGING, this.onSkillList, this);
		this.addTouchEvent(this.manual, this.onTap);
		this.addTouchEvent(this.displace, this.onTap);
		this.addTouchEvent(this.upLevel, this.onTap);
		this.addTouchEvent(this.mount, this.onTap);
		this.addTouchEvent(this.huoqu, this.onTap);
		this.addTouchEvent(this.disass, this.onTap);

		this.observe(UserHuanShou.ins().postUpgrade, this.onSkillInfo);
		this.observe(UserHuanShou.ins().postUpdateSkill, this.onSkillInfo);
		this.observe(UserHuanShou.ins().postHuanShouInfo, this.onSkillInfo);
		this.observe(HuanShouRedPoint.ins().postSkillRed, this.updateItem);

		this.onSkillInfo();


	}

	public close(): void {
		this.skillList.removeEventListener(egret.TouchEvent.CHANGING, this.onSkillList, this);
		this.removeTouchEvent(this.manual, this.onTap);
		this.removeTouchEvent(this.displace, this.onTap);
		this.removeTouchEvent(this.upLevel, this.onTap);
		this.removeTouchEvent(this.mount, this.onTap);
		this.removeTouchEvent(this.disass, this.onTap);
		this.removeTouchEvent(this.huoqu, this.onTap);
		this.removeObserve();
	}

	private updateRedPoint(): void {
		let item = this.skillList.getVirtualElementAt(this.skillList.selectedIndex) as HuanShouSkillItem;
		let b = item ? item.redPoint0.visible : false;
		this.redPoint0.visible = this.upLevel.visible && b;
		this.redPoint1.visible = this.mount.visible && b;
	}

	private onSkillInfo(): void {
		this.dataArray.replaceAll(UserHuanShou.ins().skills);
		if (!this.skillList.selectedItem) {
			let skdatas = UserHuanShou.ins().skills;
			let len = skdatas.length;
			let selectedIndex = 0;
			for (let i = 0; i < len; i++) {
				let sd = skdatas[i];
				if (sd.skillId > 0) {
					selectedIndex = i;
					break;
				}
			}
			this.skillList.selectedIndex = selectedIndex;
			this.skillList.dispatchEvent(new egret.Event(egret.TouchEvent.CHANGING));
		}
		this.updateSkill();
		let power = 0;
		let len = UserHuanShou.ins().skills.length;
		let hsData: HsSkillData;
		for (let i = 0; i < len; i++) {
			hsData = UserHuanShou.ins().skills[i];
			if (hsData.isOpen && hsData.skillId > 0) {
				let conf = GlobalConfig.HuanShouSkillConf[hsData.skillId][hsData.skillLv];
				if (conf.attr && conf.attr.length > 0) {
					power += UserBag.getAttrPower(conf.attr);
				}
				power += conf.power;
			}
		}
		let count = SubRoles.ins().subRolesLen;
		this.powerPanel.setPower(power * count);
		this.updateRedPoint();
	}

	private onSkillList(e: egret.Event): void {
		let hsData: HsSkillData = <HsSkillData>e.currentTarget.selectedItem;
		if (!hsData.isOpen) {
			//未激活不能选择
			UserTips.ins().showTips(`${hsData.openRank}阶解锁`);
			e.preventDefault();
			return;
		}
		this.updateSkill();
	}

	private updateSkill(): void {
		let hsData: HsSkillData = <HsSkillData>this.skillList.selectedItem;

		if (!hsData) return;
		if (hsData.skillId > 0) {
			let confs = GlobalConfig.HuanShouSkillConf[hsData.skillId];
			let skillConf: ItemConfig = GlobalConfig.ItemConfig[hsData.skillId];//用道具配置

			if (hsData.skillLv >= Object.keys(confs).length) {

				this.currentState = "max";
				this.validateNow();

			} else {
				this.currentState = "jihuo";
				this.validateNow();
				this.nextAtt.textFlow = TextFlowMaker.generateTextFlow(confs[hsData.skillLv + 1].desc);

			}
			this.curAtt.textFlow = TextFlowMaker.generateTextFlow(confs[hsData.skillLv].desc);

			this.skillName.source = `hsskill_${skillConf.id}_png`;
			let str = hsData.skillLv > 9 ? hsData.skillLv + "" : "0" + hsData.skillLv;
			this.skillLevel.source = `hsnum0${str}_png`;
		} else {
			this.currentState = "huihua";
			this.validateNow();
		}
		this.updateItem();
	}

	private updateItem(): void {
		let hsData: HsSkillData = <HsSkillData>this.skillList.selectedItem;
		if (!hsData) {
			this.num.text = "";
			return;
		}

		if (hsData.skillId > 0) {
			let confs = GlobalConfig.HuanShouSkillConf[hsData.skillId];
			if (hsData.skillLv >= Object.keys(confs).length) {
				this.num.text = "";//已满级
			} else {
				let conf = confs[hsData.skillLv];
				let count = UserBag.ins().getItemCountById(0, conf.id);
				let itemname = GlobalConfig.ItemConfig[conf.id].name;
				let str = "";
				if (conf.costCount > count) {
					str = `|C:0xff0303&T:${itemname}x${conf.costCount}|`
				} else {
					str = `|C:0x18ff00&T:${itemname}x${conf.costCount}|`;
				}
				this.num.textFlow = TextFlowMaker.generateTextFlow(str);
			}
		}
		this.updateRedPoint();
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.disass:
				let hsData: HsSkillData = <HsSkillData>this.skillList.selectedItem;
				if (hsData.skillId > 0) {
					let yb: number = GlobalConfig.HuanShouSkillConf[hsData.skillId][hsData.skillLv].yuanbao;
					if (!yb || yb <= Actor.yb) {
						UserHuanShou.ins().sendRemoveSkill(hsData.pos);
					} else {
						UserTips.ins().showTips("元宝不足");
					}
				}
				break;
			case this.manual:
				ViewManager.ins().open(HuanShouPrevieWin);
				break;
			case this.displace:
				ViewManager.ins().open(HuanShouComposeWin);
				break;
			case this.upLevel:
				hsData = <HsSkillData>this.skillList.selectedItem;
				if (hsData.skillId > 0) {
					let conf = GlobalConfig.HuanShouSkillConf[hsData.skillId][hsData.skillLv];
					let costCount: number = conf.costCount;
					if (costCount <= UserBag.ins().getItemCountById(0, conf.id)) {
						UserHuanShou.ins().sendUpgradeSkill(hsData.pos);
					} else {
						UserTips.ins().showTips(`${GlobalConfig.ItemConfig[conf.id].name} 不足`);
					}
				}
				break;
			case this.mount:
				hsData = <HsSkillData>this.skillList.selectedItem;
				let newitems = UserHuanShou.ins().getFilterSkillItems();
				if (newitems.length > 0) {
					ViewManager.ins().open(HuanShouSkillInlayWin, hsData.pos);
				} else {
					UserTips.ins().showTips(`背包中无可镶嵌的技能`);
				}

				break;
			case this.huoqu:
				hsData = <HsSkillData>this.skillList.selectedItem;
				if (hsData && hsData.skillId > 0) {
					let conf = GlobalConfig.HuanShouSkillConf[hsData.skillId][hsData.skillLv];
					UserWarn.ins().setBuyGoodsWarn(conf.id);
				}


				break;
		}
	}
}