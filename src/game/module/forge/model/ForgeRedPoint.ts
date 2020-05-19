/**
 * 锻造红点
 */
class ForgeRedPoint extends BaseSystem {

    redPoint: boolean;

    roleTabs: Map<Map<boolean>> = {};

    tabs: { [tab: number]: boolean };

    //兵魂之灵每个角色红点
    flexible: Map<boolean> = {};

    constructor() {
        super();
        this.tabs = {};
        this.roleTabs = {};
        this.flexible = {};
        this.redPoint = false;
        this.associated(this.postForgeRedPoint,
            this.postForgeBoostRedPoint,
            this.postForgeZhulingRedPoint,
            this.postForgeGemRedPoint,
            this.postForgeWeaponRedPoint,
            this.postForgeAwakenRedPoint
        );

        this.associated(this.postForgeBoostRedPoint,
            UserForge.ins().postForgeUpdate,
            UserForge.ins().postForgeTips
        );

        this.associated(this.postForgeZhulingRedPoint,
            UserForge.ins().postForgeUpdate,
            UserForge.ins().postForgeTips
        );

        this.associated(this.postForgeGemRedPoint,
            UserForge.ins().postForgeUpdate,
            UserForge.ins().postForgeTips
        );

        this.associated(this.postForgeWeaponRedPoint,
            UserForge.ins().postForgeUpdate,
            UserForge.ins().postForgeTips,
            Weapons.ins().postWeaponsUse,
            Weapons.ins().postWeaponsFlexibleAct,
			Weapons.ins().postWeaponsInfo
        );

        this.associated(this.postForgeAwakenRedPoint,
            UserForge.ins().postAwaken,
            Actor.ins().postLevelChange,
            UserBag.ins().postItemAdd,
            UserBag.ins().postItemChange,
            UserBag.ins().postItemDel,
            GameLogic.ins().postChildRole,
        );


    }
    public postForgeRedPoint() {
        let old = this.redPoint;
        this.redPoint = this.tabs[ForgeWin.Page_Select_Boost] ||
            this.tabs[ForgeWin.Page_Select_ZhuLing] ||
            this.tabs[ForgeWin.Page_Select_Gem] ||
            this.tabs[ForgeWin.Page_Select_Weapon] ||
            this.tabs[ForgeWin.Page_Select_Awaken];
        return old != this.redPoint;
    }
    public getRedPoint(tab: number) {
        return this.tabs[tab];
    }
    public postForgeBoostRedPoint() {
        let tab = ForgeWin.Page_Select_Boost;
        let old = this.tabs[tab];
        let b: boolean = false;
        let len: number = SubRoles.ins().subRolesLen;

        for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
            let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
            let index: number = role.getMinEquipIndexByType(tab);
            let lv: number = role.getEquipByIndex(index).strengthen;
            let boostConfig: EnhanceCostConfig = UserForge.ins().getEnhanceCostConfigByLv(lv + 1);
            if (boostConfig) {
                let costNum: number = boostConfig.stoneNum;
                if (costNum) {
                    let goodId: number = boostConfig.stoneId;
                    let goodsNum: number = UserBag.ins().getItemCountById(0, goodId);
                    if (goodsNum >= costNum) {
                        let isRed: boolean = UserForge.ins().isMaxForge(role, tab);
                        if (isRed) {
                            b = true;
                        }
                    }
                    if (!this.roleTabs[tab])
                        this.roleTabs[tab] = {};
                    this.roleTabs[tab][roleIndex] = goodsNum >= costNum;
                }
            }
        }
        this.tabs[tab] = b;
        return old != b;
    }
    public postForgeZhulingRedPoint() {
        let tab = ForgeWin.Page_Select_ZhuLing;
        let old = this.tabs[tab];
        let b: boolean = false;
        let len: number = SubRoles.ins().subRolesLen;

        for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
            let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
            let index: number = role.getMinEquipIndexByType(tab);
            let lv: number = role.getEquipByIndex(index).zhuling;
            let zhulingConfig: ZhulingCostConfig = UserForge.ins().getZhulingCostConfigByLv(lv + 1);
            if (zhulingConfig) {
                let costNum: number = zhulingConfig.count;
                if (costNum) {
                    let goodId: number = zhulingConfig.itemId;
                    let goodsNum: number = UserBag.ins().getItemCountById(0, goodId);
                    if (goodsNum >= costNum) {
                        let isRed: boolean = UserForge.ins().isMaxForge(role, tab);
                        if (isRed) {
                            b = true;
                        }
                    }
                    if (!this.roleTabs[tab])
                        this.roleTabs[tab] = {};
                    this.roleTabs[tab][roleIndex] = goodsNum >= costNum;
                }
            }
        }
        this.tabs[tab] = b;
        return old != b;
    }
    public postForgeGemRedPoint() {
        if (Actor.level < GlobalConfig.StoneOpenConfig[0].openLv)
            return false;//未开启
        let tab = ForgeWin.Page_Select_Gem;
        let old = this.tabs[tab];
        let b: boolean = false;
        let len: number = SubRoles.ins().subRolesLen;

        for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
            let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
            let index: number = role.getMinEquipIndexByType(tab);
            let lv: number = role.getEquipByIndex(index).gem;
            let gemConfig: StoneLevelCostConfig = UserForge.ins().getStoneLevelCostConfigByLv(lv + 1);
            if (gemConfig) {
                let costNum: number = gemConfig.soulNum;
                if (costNum) {
                    let goodId: number = gemConfig.stoneId;
                    let goodsNum: number = Actor.soul;
                    if (goodsNum >= costNum) {
                        let isRed: boolean = UserForge.ins().isMaxForge(role, tab);
                        if (isRed) {
                            b = true;
                        }
                    }
                    if (!this.roleTabs[tab])
                        this.roleTabs[tab] = {};
                    this.roleTabs[tab][roleIndex] = goodsNum >= costNum;
                }
            }
        }
        this.tabs[tab] = b;
        return old != b;
    }
    public postForgeWeaponRedPoint() {
		let tab = ForgeWin.Page_Select_Weapon;
		// let old = this.tabs[tab];
		let ispost = false;
		let b: boolean = false;
		let len: number = SubRoles.ins().subRolesLen;

		for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
			let weapRedPoint: boolean = Weapons.ins().checkRedPoint(roleIndex);
			if (weapRedPoint)
				b = weapRedPoint;
			if (!this.roleTabs[tab])
				this.roleTabs[tab] = {};
			if (!ispost && this.roleTabs[tab][roleIndex] != weapRedPoint)
				ispost = true;
			//兵魂之灵人物红点
			let flexRedPoint: boolean = this.getFlexibleRedPoint(roleIndex);
			this.flexible[roleIndex] = flexRedPoint;
			this.roleTabs[tab][roleIndex] = weapRedPoint;
		}
        this.tabs[tab] = b;
		return ispost;
	}

    /**某一把兵魂是否能激活兵魂之灵*/
	public getFlexibleRedPointOnly(roleId: number, id: number) {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let fb: number[] = role.weapons.getFlexibleData();
		if (role.weapons.flexibleCount <= fb.length) {
			return false;
		}
		let ws: Map<WeaponsSoulInfo> = role.weapons.getSoulInfoData();
		let weaponsIds: number[] = [];
		for (let k in ws) {
			if (ws[k] && ws[k].id) {
				weaponsIds.push(ws[k].id);
			}
		}

		//找到某个角色拥有的某个兵魂有没有激活兵魂之灵
		if (fb.indexOf(id) == -1) {
			return true;
		}

		return false;
	}

    /**已拥有的角色中 某个角色拥有的兵魂是否其中一个未激活兵魂之灵 并且是否拥有足够的丹药激活*/
	public getFlexibleRedPoint(i: number) {
		let role: Role = SubRoles.ins().getSubRoleByIndex(i);
		let fb: number[] = role.weapons.getFlexibleData();
		//判定使用的个数是否大于当前激活的兵魂之灵数量
		//第一个是本身激活的兵魂 丹药是额外次数flexibleCount已经处理+1 所以这里不处理
		if (role.weapons.flexibleCount <= fb.length) {
			return false;
		}
		let ws: Map<WeaponsSoulInfo> = role.weapons.getSoulInfoData();
		let weaponsIds: number[] = [];
		for (let k in ws) {
			if (ws[k] && ws[k].id) {
				weaponsIds.push(ws[k].id);
			}
		}
		for (let j = 0; j < weaponsIds.length; j++) {
			//找到某个角色拥有的某个兵魂没有激活兵魂之灵
			if (fb.indexOf(weaponsIds[j]) == -1) {
				if (role.weapons.flexibleCount - 1 <= GlobalConfig.WeaponSoulBaseConfig.maxItemNum)
					return true;
			}
		}

		return false;
	}
    
    public getFlexibleRoleRedPoint(tab: number) {
		return this.flexible[tab];
	}

    /**
     * 装备觉醒红点
     */
    public postForgeAwakenRedPoint() {
        let len = SubRoles.ins().subRolesLen;
        let ins = UserForge.ins();
        let tab = ForgeWin.Page_Select_Awaken;
        let state = false;
        if (!this.roleTabs[tab]) this.roleTabs[tab] = {};
        for (let i = 0; i < len; i++) {
            this.roleTabs[tab][i] = ins.isHaveAwakenRps(i);
            if (!state) {
                state = this.roleTabs[tab][i];
            }
        }
        this.tabs[tab] = state;
        return true;
    }
}

namespace GameSystem {
    export let  forgeredpoint = ForgeRedPoint.ins.bind(ForgeRedPoint);
}