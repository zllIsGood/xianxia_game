class UserRole extends BaseSystem {

	/** 可更换的装备 */
	private canChangeEquips: boolean[][];

	public static oneKeyOpenLevel: number = 60;

	public constructor() {
		super();
		//待改
		this.canChangeEquips = [[], [], []];
		this.observe(UserBag.ins().postItemChange, this.startCheckHaveCan);//道具变更
		this.observe(UserBag.ins().postItemAdd, this.startCheckHaveCan);//道具添加
		this.observe(UserBag.ins().postItemDel, this.startCheckHaveCan);//道具删除
		this.observe(Actor.ins().postLevelChange, this.startCheckHaveCan);
		this.observe(GameLogic.ins().postChildRole, this.startCheckHaveCan);
		this.observe(UserEquip.ins().postEquipChange, this.startCheckHaveCan);
		this.observe(UserZs.ins().postZsData, this.startCheckHaveCan);

		this.observe(LongHun.ins().postStageActive, this.showNavBtnRedPoint);
		this.observe(Actor.ins().postGoldChange, this.showNavBtnRedPoint);
		this.observe(GameLogic.ins().postRuneExchange, this.showNavBtnRedPoint);
		this.observe(GameLogic.ins().postRuneShatter, this.showNavBtnRedPoint);
		this.observe(UserBag.ins().postHuntStore, this.showNavBtnRedPoint);
		this.observe(UserFb.ins().postFbRingInfo, this.showNavBtnRedPoint);
		this.observe(FlySwordRedPoint.ins().postTotalRedPoint, this.showNavBtnRedPoint);
		this.observe(HuanShouRedPoint.ins().postHuanShouRed, this.showNavBtnRedPoint);
	}

	private timeID: number = 0;

	private startCheckHaveCan(isWear: boolean = false, roleIndex: number = -1): void {
		if (this.timeID)
			return;
		this.timeID = 1;
		TimerManager.ins().doTimer(50, 1, () => {
			this.checkHaveCan(isWear, roleIndex);
		}, this);
	}

	public static ins(): UserRole {
		return super.ins() as UserRole;
	}

	/**
	 * 检测是否有装备可以穿
	 * @param isWear 是否要穿可以穿的装备
	 * @param roleIndex 传装备的角色索引
	 */
	public checkHaveCan(isWear: boolean = false, roleIndex: number = -1): void {
		this.timeID = 0;
		//背包装备
		let equipItems: ItemData[] = UserBag.ins().getEquipByType(0);
		if (!equipItems)
			return;

		let startIndex: number = roleIndex >= 0 ? roleIndex : 0;
		let endIndex: number = roleIndex >= 0 ? roleIndex + 1 : SubRoles.ins().subRolesLen;

		let tempChangeEquips: ItemData[][] = [[], [], []];

		for (let i: number = 0; i < SubRoles.ins().subRolesLen; i++) {

			for (let equip of SubRoles.ins().getSubRoleByIndex(i).equipsData) {
				tempChangeEquips[i].push(equip.item);
			}
		}

		for (let item of equipItems) {

			for (let j: number = startIndex; j < endIndex; j++) {
				let job = ItemConfig.getJob(item.itemConfig);
				if (job != 0 && SubRoles.ins().getSubRoleByIndex(j).job != job)
					continue;

				if (UserZs.ins().lv < item.itemConfig.zsLevel)
					continue;
				if (Actor.level < item.itemConfig.level)
					continue;

				let lowEquipIndex: number = UserBag.ins().getLowEquipIndex(tempChangeEquips[j], ItemConfig.getSubType(item.itemConfig));

				if (lowEquipIndex >= 0)
					tempChangeEquips[j][lowEquipIndex] = this.contrastEquip(tempChangeEquips[j][lowEquipIndex] || SubRoles.ins().getSubRoleByIndex(j).equipsData[lowEquipIndex].item, item);
			}
		}
		let len = tempChangeEquips.length;
		for (let i: number = 0; i < len; i++) {
			for (let j: number = 0; j < tempChangeEquips[i].length; j++) {

				this.canChangeEquips[i][j] = false;

				if (tempChangeEquips[i][j] &&
					tempChangeEquips[i][j].handle != SubRoles.ins().getSubRoleByIndex(i).equipsData[j].item.handle) {
					if (isWear && roleIndex == i) {
						UserEquip.ins().sendWearEquipment(tempChangeEquips[i][j].handle, j, roleIndex);
						this.canChangeEquips[i][j] = false;
					}
					else {
						this.canChangeEquips[i][j] = true;
					}
				}
			}

			if (this.canChangeEquips[i].indexOf(true) < 0)
				this.canChangeEquips[i].length = 0;
		}

		this.showNavBtnRedPoint();
	}


	/** 对比装备返回高战力的装备 */
	private contrastEquip(sourceItem: ItemData, item: ItemData): ItemData {
		if (!sourceItem || sourceItem.handle == 0)
			return item;
		if (!item || item.handle == 0)
			return sourceItem;
		let sourceItemScore: number = sourceItem.point;
		let itemScore: number = item.point;
		if (itemScore > sourceItemScore)
			return item;
		else
			return sourceItem;
	}

	public getCanChangeEquips(): boolean {
		//是否有装备可以穿戴
		for (let i: number = 0; i < this.canChangeEquips.length; i++) {
			for (let j: number = 0; j < this.canChangeEquips[i].length; j++) {
				if (this.canChangeEquips[i][j]) {
					return true;
				}
			}
		}
		return false;
	}

	/** 检查是否需要显示红点 */
	public showNavBtnRedPoint(b: boolean = false): void {
		//是否有装备可以穿戴
		for (let i: number = 0; i < this.canChangeEquips.length; i++) {
			for (let j: number = 0; j < this.canChangeEquips[i].length; j++) {
				if (this.canChangeEquips[i][j]) {
					b = true;
					break;
				}
			}
			if (b)
				break;
		}
		if (!b && SamsaraModel.ins().isCanAddSpirit()) {//检测是否有装备能附灵
			b = true;
		}

		//面板的灵戒是否有可以升级的
		if (!b && OpenSystem.ins().checkSysOpen(SystemType.RING) && UserTask.ins().checkAwakeRedPoint()[0]>0 || (SpecialRing.ins().checkHaveUpRing() || SpecialRing.ins().isCanStudySkill() || SpecialRing.ins().isCanUpgradeSkill() || SpecialRing.ins().fireRingRedPoint())) {
			b = true;
		}

		if (!b && UserSkill.ins().canHejiEquip()) {
			b = true;
		}

		if (!b && UserSkill.ins().canExchange()) {
			b = true;
		}

		if (!b && UserSkill.ins().canSolve()) {
			b = true;
		}

		//玉佩界面红点
		if (!b && JadeNew.ins().checkRed()) {
			b = true;
		}

		//面板的龙印护盾血玉是否有可以升级的
		if (!b && LongHun.ins().canShowRedPointInAll()) {
			b = true;
		}

		//转生是否有可以升级
		else if (!b && UserZs.ins().canOpenZSWin() && !UserZs.ins().isMaxLv() && (UserZs.ins().canGet() > 0 || UserZs.ins().canUpgrade())) {
			b = true;
		}

		//翅膀是否有可以升级
		else if (!b && this.and(Wing.ins().canGradeupWing()) || this.and(Wing.ins().canItemGradeupWing()) || Wing.ins().isHaveActivationWing()) {
			b = true;
		}

		//是否可以时装激活
		if (!b && Dress.ins().redPoint()) {
			b = true;
		}

		//是否有符文替换 或者升级 或者有符文可兑换
		if (!b && RuneRedPointMgr.ins().checkAllSituation()) {
			b = true;
		}

		//神装
		if (!b) {
			let len: number = SubRoles.ins().subRolesLen;
			for (let a: number = 0; a < len; a++) {
				let model: Role = SubRoles.ins().getSubRoleByIndex(a);
				for (let i = 0; i < 8; i++) {
					let equipItem: eui.Component = this["equip" + i];
					b = UserEquip.ins().setOrangeEquipItemState(i, model);
					if (!b && i < 2)
						b = UserEquip.ins().setLegendEquipItemState(i > 0 ? 2 : 0, model);
					if (b) {
						let eb = UserBag.ins().checkEqRedPoint(i, model);
						b = eb != null ? eb : b;
					}
					if (b)
						break;
				}
				if (b)
					break;
			}
			// if (!b)
			// 	b = UserEquip.ins().checkRedPoint(4);
			if (!b)
				for (let i = 0; i < len; i++) {
					b = UserEquip.ins().checkRedPoint(5, i);
					if (b) break;
				}
			if (!b)
				b = UserBag.ins().getLegendHasResolve();
			if (!b)
				b = Boolean(UserBag.ins().getHuntGoods(0).length);
			if (!b) {
				b = ExtremeEquipModel.ins().getRedPoint();
			}
		}

		// MessageCenter.ins().dispatch(MessagerEvent.ROLE_HINT, b);  @setattr 4 99999999
		if (!b)
			b = SubRoles.ins().isLockRole();

		if (!b)
			b = GodWingRedPoint.ins().getGodWingRedPoint();

		if (!b)
			//可以升级或者可以兑换时候人物图标有红点
			b = SamsaraModel.ins().isOpen() && (SamsaraModel.ins().isCanUpgrade() || SamsaraModel.ins().isCanItemExchange() ||
				(Actor.level >= GlobalConfig.ReincarnationBase.levelLimit && SamsaraModel.ins().getExpExchangeTimes() > 0));
		if (!b) b =  SamsaraModel.ins().isCanUpgradeSoul();

		// 飞剑
		if (!b)
			b = FlySwordRedPoint.ins().totalRedPoint.indexOf(true) != -1;

		// 宠物
		if (!b) {
			b = HuanShouRedPoint.ins().isRed;
		}

		// 天仙
		if (!b) {
			b = ZhanLing.ins().checkRedPoint();
		}

		this.postRoleHint(b);
	}

	/**
	 * 派发角色按钮提示
	 * 此函数只能由 showNavBtnRedPoint() 传参调用，不可直接调用（设计思路待完善）
	 * */
	public postRoleHint(b: boolean): number {
		return b ? 1 : 0;
	}

	private and(list): boolean {
		for (let k in list) {
			if (list[k] == true)
				return true;
		}

		return false;
	}


	private seekRoleItem(): boolean {
		let isReturn: boolean = false;
		let len: number = UserBag.ins().getBagItemNum(0);
		for (let i: number = 0; i < len; i++) {
			if (isReturn)
				return isReturn;
			let item: ItemData = UserBag.ins().getItemByIndex(0, i);
			switch (item.itemConfig.id) {
				case 200001://翅膀
					break;
				case 200004://经脉丹
					isReturn = this.roleHint(5);
					break;
				case 200013://晕眩碎片
					isReturn = this.roleHint(0);
					break;
				case 200014://护身碎片
					isReturn = this.roleHint(1);
					break;
			}
		}
		return isReturn;
	}

	/**
	 * 角色提示
	 */
	public roleHint(type: number): boolean {
		let len: number = SubRoles.ins().subRolesLen;
		let flag: boolean = false;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			flag = this.roleHintCheck(role, type);
			if (flag) {
				return flag;
			}
		}
		return flag;
	}

	/**
	 * 查找角色提示
	 */
	public roleHintCheck(role: Role, type: number): boolean {
		let lv: number = 1;
		let costNum: number = 0;
		let itemNum: number = 0;
		let itemId: number = 0;
		switch (type) {
			case 0:
				lv = role.getExRingsData(0);
				let ring0Config: ExRing0Config = GlobalConfig[`ExRing${0}Config`][lv];
				if (lv >= 1)
					return false;
				if (ring0Config) {
					costNum = ring0Config.cost;
					itemId = GlobalConfig.ExRingConfig[0].costItem;
				}
				break;
			case 1:
				lv = role.getExRingsData(1);
				let ring1Config: ExRing0Config = GlobalConfig[`ExRing${1}Config`][lv];
				if (lv >= 1)
					return false;
				if (ring1Config) {
					costNum = ring1Config.cost;
					itemId = GlobalConfig.ExRingConfig[1].costItem;
				}
				break;
			case LongHun.TYPE_LONG_HUN:
				lv += role.loongSoulData.level;
				let loongSoulConfig: LoongSoulConfig = GlobalConfig.LoongSoulConfig[lv];
				let loongSoulStageConfig: LoongSoulStageConfig = GlobalConfig.LoongSoulStageConfig[role.loongSoulData.stage];
				if (loongSoulConfig) {
					costNum = loongSoulStageConfig.normalCost;
					itemId = loongSoulConfig.itemId;
				}
				break;
			case LongHun.TYPE_HU_DUN:
				lv += role.shieldData.level;
				let shieldConfig: ShieldConfig = GlobalConfig.ShieldConfig[lv];
				let shieldStageConfig: LoongSoulStageConfig = GlobalConfig.ShieldStageConfig[role.loongSoulData.stage];
				if (shieldConfig) {
					costNum = shieldStageConfig.normalCost;
					itemId = shieldConfig.itemId;
				}
				break;
			case 5:
				lv = role.jingMaiData.level;
				let jingMaiConfig: JingMaiLevelConfig = GlobalConfig.JingMaiLevelConfig[lv];
				if (jingMaiConfig) {
					costNum = jingMaiConfig.count;
					itemId = jingMaiConfig.itemId;
				}
				break;
		}
		if (costNum) {
			itemNum = UserBag.ins().getItemCountById(0, itemId);
			if (itemNum >= costNum)
				return true;
		}
		return false;
	}


	public setCanChange(): void {
		let roleWin: RoleWin = ViewManager.ins().getView(RoleWin) as RoleWin;
		if (roleWin) {
			roleWin.roleInfoPanel.setCanChange(this.canChangeEquips);
			roleWin.canChangeEquips = this.canChangeEquips;
		}
	}
}

namespace GameSystem {
	export let  userRole = UserRole.ins.bind(UserRole);
}