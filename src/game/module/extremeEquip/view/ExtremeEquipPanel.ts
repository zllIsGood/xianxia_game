/**
 * Created by Peach.T on 2018/1/5.
 */
class ExtremeEquipPanel extends BaseView {
	public attrGroup0: eui.Group;
	public powerPanel0: PowerPanel;
	public attr0: eui.Label;
	public skill_0_0: eui.Group;
	public skillIcon0: eui.Image;
	public skillName0: eui.Label;
	public skill_0_1: eui.Group;
	public chainImg0: eui.Image;
	public skillChain0: eui.Label;
	public arrow: eui.Image;
	public powerPanel1: PowerPanel;
	public attr1: eui.Label;
	public skill_1_0: eui.Group;
	public skillIcon1: eui.Image;
	public skillName1: eui.Label;
	public skill_1_1: eui.Group;
	public skillChain1: eui.Label;
	public attrGroup1: eui.Group;
	public powerPanel2: PowerPanel;
	public attr2: eui.Label;
	public skill_2_0: eui.Group;
	public skillIcon2: eui.Image;
	public skillName2: eui.Label;
	public skill_2_1: eui.Group;
	public skillChain2: eui.Label;
	public dinghong: eui.Group;
	public leftBtn: eui.Button;
	public leftRed: eui.Image;
	public rightBtn: eui.Button;
	public rightRed: eui.Image;
	public menuScroller: eui.Scroller;
	public menuList: eui.List;
	private menuListData: ArrayCollection;
	public updateBtn: eui.Button;
	public redPoint: eui.Image;
	public extremeName: eui.Image;
	public cost: eui.Label;
	public numLabel: eui.Label;
	public leftGroup: eui.Group;
	public rightGroup: eui.Group;

	public group0: eui.Group;
	public group1: eui.Group;
	public group3: eui.Group;

	private curRole: number;

	private extreme_eff;
	private extreme_eff_bottom;
	private listWidth;
	private pos: number;//实际装备索引EquipPos
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}
	public init() {
		this.menuList.itemRenderer = ExtremeEquipItem;
	}
	public open(...param: any[]): void {
		this.menuListData = new ArrayCollection;
		this.menuList.dataProvider = this.menuListData;
		this.menuList.selectedIndex = 0;
		this.addTouchEvent(this.leftBtn, this.onLeft);
		this.addTouchEvent(this.rightBtn, this.onRight);
		this.addTouchEvent(this.updateBtn, this.update);
		this.addTouchEvent(this[`skillIcon0`], this.onClick);
		this.addTouchEvent(this[`skillIcon1`], this.onClick);
		this.addTouchEvent(this[`chainImg0`], this.onClick);
		this.addTouchEvent(this[`chainImg1`], this.onClick);
		this.addTouchEvent(this[`skillIcon2`], this.onClick);
		this.addTouchEvent(this[`chainImg2`], this.onClick);
		this.menuList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListChange, this);
		this.addChangeEvent(this.menuScroller, this.onChange);
		this.observe(UserEquip.ins().postZhiZunUpgrade, this.undateView);
		(ViewManager.ins().getView(AdvanEquipWin) as AdvanEquipWin).isNotMove = true;
		this.listWidth = 82 * 8 + 70;
		this.setRoleId(param[0]);
	}
	private onClick(e: egret.TouchEvent) {
		let config: SkillsDescConfig;
		let linkconfig: ZhiZunLinkLevel;
		let equipconfig: ZhiZunEquipLevel;
		let level: number;
		let zhiZunLv;
		let sconfig: SkillsConfig;
		let strdesc: string;
		switch (e.currentTarget) {
			case this[`skillIcon0`]://杀戮 庇护
			case this[`skillIcon2`]:
				linkconfig = ExtremeEquipModel.ins().getZhiZunLinkLevelConfig(this.menuList.selectedItem, ExtremeEquipModel.ins().selectJob);
				zhiZunLv = ExtremeEquipModel.ins().getZhiZunLv(ExtremeEquipModel.ins().selectJob, this.menuList.selectedItem);
				equipconfig = ExtremeEquipModel.ins().getZhiZunEquipLevelConfig(this.menuList.selectedItem, zhiZunLv);
				sconfig = GlobalConfig.SkillsConfig[equipconfig.skillId];
				config = GlobalConfig.SkillsDescConfig[sconfig.desc];
				strdesc = config.desc;
				strdesc = strdesc.replace("%s%", sconfig.desc_ex[0] + "");
				ViewManager.ins().open(ExtremeSkillTipsWin, config.name + `Lv.${linkconfig.level}`, strdesc);
				break;
			case this[`chainImg0`]://锁链
			case this[`chainImg2`]:
				linkconfig = ExtremeEquipModel.ins().getZhiZunLinkLevelConfig(this.menuList.selectedItem, ExtremeEquipModel.ins().selectJob);
				ViewManager.ins().open(ExtremeSkillTipsWin, "灵魂锁链" + `Lv.${linkconfig.level}`, linkconfig.chainDesc);
				break;
			case this[`skillIcon1`]://下一杀戮
				linkconfig = ExtremeEquipModel.ins().getZhiZunLinkLevelConfig(this.menuList.selectedItem, ExtremeEquipModel.ins().selectJob);
				zhiZunLv = ExtremeEquipModel.ins().getZhiZunLv(ExtremeEquipModel.ins().selectJob, this.menuList.selectedItem);
				equipconfig = ExtremeEquipModel.ins().getZhiZunEquipLevelConfig(this.menuList.selectedItem, zhiZunLv, true);
				sconfig = GlobalConfig.SkillsConfig[equipconfig.skillId];
				config = GlobalConfig.SkillsDescConfig[sconfig.desc];
				strdesc = config.desc;
				strdesc = strdesc.replace("%s%", sconfig.desc_ex[0] + "");
				ViewManager.ins().open(ExtremeSkillTipsWin, config.name + `Lv.${linkconfig.level}`, strdesc);
				break;
			case this[`chainImg1`]://下一锁链
				linkconfig = ExtremeEquipModel.ins().getZhiZunLinkLevelConfig(this.menuList.selectedItem, ExtremeEquipModel.ins().selectJob, true);
				ViewManager.ins().open(ExtremeSkillTipsWin, "灵魂锁链" + `Lv.${linkconfig.level}`, linkconfig.chainDesc);
				break;
		}
	}
	private undateView(): void {
		let subType = this.menuList.selectedItem;
		// this.selectEquip(subType);
		this.pos = subType;
		this.setRoleId(this.curRole, subType);
	}

	private update(): void {
		let job = ExtremeEquipModel.ins().selectJob;
		let subType = this.menuList.selectedItem;

		let role = SubRoles.ins().getSubRoleByJob(job);
		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (!id) {
			UserTips.ins().showTips(`|C:0xff0000&T:该部位未穿戴装备`);
			return;
		}
		if (!ExtremeEquipModel.ins().canOperate(job, subType)) {
			UserTips.ins().showTips(`|C:0xff0000&T:材料不足`);
			return;
		}
		UserEquip.ins().upgradeZhiZunEquip(role.index, subType);

	}

	private onListChange(): void {
		let data = this.menuList.selectedItem;
		this.pos = data;//this.menuList.selectedIndex;
		this.selectEquip(data);
		this.selectList();
	}

	private onLeft(): void {
		let num: number = 82 * 5;
		let scrollH: number = 0;
		scrollH = this.menuList.scrollH - num;
		scrollH = Math.round(scrollH / 82) * 82;
		if (scrollH < 0) {
			scrollH = 0;
		}
		this.menuList.scrollH = scrollH;
		this.onChange();
	}

	private onRight(): void {
		let num: number = 82 * 5;
		let scrollH: number = 0;
		scrollH = this.menuList.scrollH + num;
		scrollH = Math.round(scrollH / 82) * 82;
		if (scrollH > this.listWidth - this.menuScroller.width) {
			scrollH = this.listWidth - this.menuScroller.width;
		}
		this.menuList.scrollH = scrollH;
		this.onChange();
	}

	public setRoleId(index: number, pos?: number): void {
		index = index ? index : 0;
		this.curRole = index;
		let role = SubRoles.ins().getSubRoleByIndex(index);
		let job = role.job;
		ExtremeEquipModel.ins().selectJob = job;
		this.menuListData.replaceAll(ExtremeEquipModel.ins().positions);
		pos = pos ? pos : (this.pos ? this.pos : EquipPos.WEAPON);
		this.pos = pos;
		// this.menuList.selectedIndex = pos;
		// this.menuList.selectedItems = this.menuList.dataProvider[pos]

		this.selectEquip(pos);
	}

	private onChange(): void {
		if (this.menuList.scrollH < 46) {
			this.leftGroup.visible = false;
			this.rightGroup.visible = true;
		} else if (this.menuList.scrollH >= this.listWidth - this.menuList.width - 46) {
			this.leftGroup.visible = true;
			this.rightGroup.visible = false;
		} else {
			this.leftGroup.visible = true;
			this.rightGroup.visible = true;
		}
		this.updateRedPoint();
	}

	private updateRedPoint() {
		this.leftRed.visible = ExtremeEquipModel.ins().getRedPoint();
		this.rightRed.visible = ExtremeEquipModel.ins().getRedPoint();
	}

	private isItemEnough: boolean;
	public selectEquip(subType: number): void {
		this.extremeName.source = `extreme_name_0${subType}`;
		let job = ExtremeEquipModel.ins().selectJob;
		let role = SubRoles.ins().getSubRoleByJob(job);
		let zhiZunLv = ExtremeEquipModel.ins().getZhiZunLv(job, subType);
		if (!zhiZunLv) {//未激活
			this.attrGroup1.visible = true;
			this.attrGroup0.visible = false;
			this.updateBtn.label = "激 活";
			this.updateBtn.visible = true;
			let preCfg = GlobalConfig.ZhiZunEquipLevel[subType][1];
			let preDesc = AttributeData.getAttStr(preCfg.attrs, 0, 1, "  :  ");
			this.attr2.text = preDesc;
			this.skillChain2.text = `灵魂锁链Lv.${1}`;
			let sname = ExtremeEquipModel.ins().getSkillName(subType);
			if (sname) {
				this.skillName2.text = `${sname}Lv.${1}`;
				this[`skillIcon2`].source = UserSkill.ins().getSkillIdIcon(preCfg.skillId);
			}
			let power2 = Math.floor(UserBag.getAttrPower(preCfg.attrs)) + (preCfg.ex_power || 0);
			power2 += this.getChainAddPower(subType, zhiZunLv);
			this.powerPanel2.setPower(power2);
			let itemCount = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, preCfg.materialInfo.id);
			let item = GlobalConfig.ItemConfig[preCfg.materialInfo.id];
			let count = preCfg.materialInfo.count;
			this.cost.text = item.name;
			let colorStr;
			if (itemCount >= count) {
				colorStr = ColorUtil.GREEN_COLOR;
				this.isItemEnough = true;
			}
			else {
				colorStr = ColorUtil.RED_COLOR;
				this.isItemEnough = false;
			}
			this.numLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${itemCount}</font><font color=${ColorUtil.WHITE_COLOR}>/${count}</font> `);
			this.redPoint.visible = ExtremeEquipModel.ins().canOperate(job, subType);
		} else if (zhiZunLv >= ExtremeEquipModel.ins().getMaxZhiZunEquipLevel(subType)) {//满级
			this.attrGroup1.visible = true;
			this.attrGroup0.visible = false;
			this.updateBtn.visible = this.redPoint.visible = this.cost.parent.visible = false;
			let cfg = GlobalConfig.ZhiZunEquipLevel[subType][zhiZunLv];
			let attrDesc = AttributeData.getAttStr(cfg.attrs, 0, 1, "  :  ");
			this.attr2.text = attrDesc;
			this.skillChain2.text = `灵魂锁链Lv.${ExtremeEquipModel.ins().getZhiZunLinkLvShow(role.index, subType, zhiZunLv)}`;
			let sname = ExtremeEquipModel.ins().getSkillName(subType);
			if (sname) {
				this.skillName2.text = `${sname}Lv.${zhiZunLv}`;
				this[`skillIcon2`].source = UserSkill.ins().getSkillIdIcon(cfg.skillId);
			}
			let power2 = Math.floor(UserBag.getAttrPower(cfg.attrs)) + (cfg.ex_power || 0);
			power2 += this.getChainAddPower(subType, zhiZunLv);
			this.powerPanel2.setPower(power2);
		} else {
			this.attrGroup1.visible = false;
			this.attrGroup0.visible = true;
			this.updateBtn.visible = this.cost.parent.visible = true;
			let cfg = GlobalConfig.ZhiZunEquipLevel[subType][zhiZunLv + 1];
			let item = GlobalConfig.ItemConfig[cfg.materialInfo.id];
			let count = cfg.materialInfo.count;
			this.cost.text = item.name;
			let itemCount = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, cfg.materialInfo.id);

			let colorStr;
			if (itemCount >= count) {
				colorStr = ColorUtil.GREEN_COLOR;
				this.isItemEnough = true;
			}
			else {
				colorStr = ColorUtil.RED_COLOR;
				this.isItemEnough = false;
			}
			this.numLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${itemCount}</font><font color=${ColorUtil.WHITE_COLOR}>/${count}</font> `);

			let attrDesc = AttributeData.getAttStr(cfg.attrs, 0, 1, "  :  ");
			let preDesc;
			let preCfg: ZhiZunEquipLevel;
			if (zhiZunLv == 0) {
				preCfg = GlobalConfig.ZhiZunEquipLevel[subType][1];
				preDesc = AttributeData.getAttStr(preCfg.attrs, 0, 1, "  :  ");
				// preDesc = "攻击：0\n物防：0\n魔防：0\n生命：0";
			}
			else {
				preCfg = GlobalConfig.ZhiZunEquipLevel[subType][zhiZunLv];
				preDesc = AttributeData.getAttStr(preCfg.attrs, 0, 1, "  :  ");
			}
			this.attr0.text = preDesc;
			this.attr1.text = attrDesc;

			let power0 = Math.floor(UserBag.getAttrPower(preCfg.attrs)) + (preCfg.ex_power || 0);
			let power1 = Math.floor(UserBag.getAttrPower(cfg.attrs)) + (cfg.ex_power || 0);
			power0 += this.getChainAddPower(subType, zhiZunLv);
			power1 += this.getChainAddPower(subType, zhiZunLv + 1);
			this.powerPanel0.setPower(power0);
			this.powerPanel1.setPower(power1);

			this.skillChain0.text = `灵魂锁链Lv.${ExtremeEquipModel.ins().getZhiZunLinkLvShow(role.index, subType, zhiZunLv)}`;
			this.skillChain1.text = `灵魂锁链Lv.${ExtremeEquipModel.ins().getZhiZunLinkLvShow(role.index, subType, zhiZunLv + 1)}`;
			let sname = ExtremeEquipModel.ins().getSkillName(subType);
			if (sname) {
				this.skillName0.text = `${sname}Lv.${zhiZunLv}`;
				this.skillName1.text = `${sname}Lv.${zhiZunLv + 1}`;
				this[`skillIcon0`].source = UserSkill.ins().getSkillIdIcon(cfg.skillId);
				this[`skillIcon1`].source = UserSkill.ins().getSkillIdIcon(cfg.skillId);
			}

			this.redPoint.visible = ExtremeEquipModel.ins().canOperate(job, subType);

			this.updateBtn.label = "升 级";
		}


		if (subType == EquipPos.WEAPON || subType == EquipPos.CLOTHES) {
			if (!this.skill_0_0.parent) {
				this.group0.addChild(this.skill_0_0);
			}
			if (!this.skill_1_0.parent) {
				this.group1.addChild(this.skill_1_0);
			}
			if (!this.skill_2_0.parent) {
				this.group3.addChild(this.skill_2_0);
			}
		}
		else {
			if (this.skill_0_0.parent) this.skill_0_0.parent.removeChild(this.skill_0_0);
			if (this.skill_1_0.parent) this.skill_1_0.parent.removeChild(this.skill_1_0);
			if (this.skill_2_0.parent) this.skill_2_0.parent.removeChild(this.skill_2_0);
		}

		this.setEff(subType);
		this.selectList();
		this.onChange();
	}
	private mc1: MovieClip;
	private mc2: MovieClip;
	private setEff(subType: number) {
		if (!this.mc1)
			this.mc1 = new MovieClip;
		if (!this.mc1.parent)
			this.extreme_eff.addChild(this.mc1);
		if (!this.mc2)
			this.mc2 = new MovieClip;
		if (!this.mc2.parent)
			this.extreme_eff_bottom.addChild(this.mc2);
		this.mc1.playFile(RES_DIR_EFF + `extrme_eff_0${subType}`, -1);
		this.mc2.playFile(RES_DIR_EFF + `extrme_eff_bottom`, -1);
	}

	/**
     * 设置左边列表的选中状态
     * @param index
     */
	private selectList(): void {
		let count = this.menuList.dataProvider.length;
		for (let i = 0; i < count; i++) {
			let item = this.menuList.getElementAt(i) as ExtremeEquipItem;
			if (item) {
				if (i != this.menuList.selectedIndex) {
					item.setSelect(false);
				} else {
					item.setSelect(true);
				}
			}

		}
	}

	/**
	 * 获取灵魂锁链加成的战斗力
	 * @param subType
	 * @param zhiZunLv
	 * @returns {number}
	 */
	private getChainAddPower(subType: number, zhiZunLv: number): number {
		if (!zhiZunLv) return 0;
		let zzel: ZhiZunEquipLevel = GlobalConfig.ZhiZunEquipLevel[subType][zhiZunLv];
		if (!zzel) return 0;
		let secPos = ExtremeEquipModel.ins().getLinkEquipPos(subType);
		let zzll: ZhiZunLinkLevel = GlobalConfig.ZhiZunLinkLevel[subType][secPos][zzel.soulLinkLevel];
		if (!zzll) return 0;
		let temp = 0;
		let role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		if (zzll.attrs) {
			temp += UserBag.getAttrPower(zzll.attrs);
			for (let i in zzll.attrs) {
				temp += ItemConfig.relatePower(zzll.attrs[i], role);
			}
		}
		let ex_power = zzll.ex_power ? zzll.ex_power : 0;
		temp = Math.floor(temp) + ex_power;
		return temp;
	}

	public close(): void {
		(ViewManager.ins().getView(AdvanEquipWin) as AdvanEquipWin).isNotMove = false;
	}
}
