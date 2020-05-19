
/**
 *
 * @author
 *
 */
class RRoleInfoPanel extends BaseView {
	/** 装备列表 */
	protected equips: RoleItem[];
	protected groupRole: eui.Group;
	protected groupRoleNext: eui.Group;
	protected nextWingImg: eui.Image;
	protected nextWeaponImg: eui.Image;
	protected nextBodyImg: eui.Image;
	protected wingImg: eui.Image;
	protected weaponImg: eui.Image;
	protected bodyImg: eui.Image;
	protected suitImg: eui.Image;

	protected roleInfoItem0: RoleInfoItem;
	protected roleInfoItem1: RoleInfoItem;

	protected powerPanel: PowerPanel;

	public sef1: eui.Image;
	public sef2: eui.Image;
	public sef3: eui.Image;
	public wsef0: eui.Image;
	public wsef1: eui.Image;
	public nsoulEff: eui.Group;
	public nsef1: eui.Image;
	public nsef2: eui.Image;
	public nsef3: eui.Image;
	public nwsef0: eui.Image;
	public nwsef1__define: eui.Image;

	public bodyEff: eui.Group;
	public bodyEffect0: eui.Image;
	public bodyEffect1: eui.Image;
	public nbodyEff: eui.Group;
	public nbodyEffect0: eui.Image;
	public nbodyEffect1: eui.Image;

	/** 当前选择的角色 */
	public curRole: number = 0;

	protected juesexiangxi: eui.Button;

	public beforeIndex: number = -1;

	private _otherPlayerData: OtherPlayerData;
	private title: eui.Image;

	protected soulEff: eui.Group;
	protected suitEff: MovieClip;
	protected suitEff1: MovieClip;
	protected suitEff5: MovieClip; //当前武器模型
	protected suitEff6: MovieClip; //下一个武器模型
	protected suitEff7: MovieClip; //当前神装特效
	protected suitEff8: MovieClip; //下一个神装特效
	protected suitEff9: MovieClip; //当前武器模型女
	protected suitEff10: MovieClip; //下一个武器模型女

	/**天仙 */
	private fileName: string;
	private warMc: MovieClip;

	constructor() {
		super();
		this.name = "角色";
	}

	public childrenCreated(): void {
		this.init();
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public init(): void {
		this.touchEnabled = false;
		this.touchChildren = true;
		this.groupRole.touchEnabled = false;
		this.groupRoleNext.touchEnabled = false;
		this.groupRole.touchChildren = false;
		this.groupRoleNext.touchChildren = false;
		this.equips = [];
		for (let i = 0; i < EquipPos.MAX; i++) {
			this.equips[i] = this['item' + i];
			this.equips[i].touchEnabled = true;
			this.equips[i].isShowJob(false);
			this.equips[i].isShowTips(false);
		}

		this.suitEff1 = new MovieClip;
		this.suitEff1.x = this.suitImg.x;
		this.suitEff1.y = this.suitImg.y;

		this.suitEff = new MovieClip();
		this.suitEff5 = new MovieClip();
		this.suitEff6 = new MovieClip();
		this.suitEff7 = new MovieClip();
		this.suitEff8 = new MovieClip();
		this.suitEff9 = new MovieClip();
		this.suitEff10 = new MovieClip();
	}

	public clear() {
		this.beforeIndex = -1;
	}

	public open(...param: any[]): void {
		this._otherPlayerData = param[0];
		this.addTouchEvent(this.roleInfoItem0, this.onClick);
		this.addTouchEvent(this.roleInfoItem1, this.onClick);
		this.addTouchEvent(this.juesexiangxi, this.onClick);

		this.updateRing();
		this.updataEquip(false);
		this.updateSamsaraEquip();
		this.clearChangeEff();
		if (this.beforeIndex != -1) {
			this.roleChange(this.beforeIndex, this.curRole);
		} else {
			this.setRole(this.curRole, this.bodyImg, this.weaponImg);
			// this.setWeaponEffect(this.curRole, "wsef", this.soulEff, this.suitEff5);
			this.setWeaponEffect(this.curRole, "bodyEffect", this.bodyEff, this.suitEff7, 2);
			this.setSuit(this.curRole, this.suitImg, this.suitEff1);//齐鸣
			this.setWing();
		}
		this.beforeIndex = this.curRole;
	}

	public close(): void {
		egret.Tween.removeTweens(this.groupRole);
		egret.Tween.removeTweens(this.groupRoleNext);
		DisplayUtils.removeFromParent(this.suitEff);
		DisplayUtils.removeFromParent(this.suitEff5);
		DisplayUtils.removeFromParent(this.suitEff6);
		DisplayUtils.removeFromParent(this.suitEff7);
		DisplayUtils.removeFromParent(this.suitEff8);
		DisplayUtils.removeFromParent(this.suitEff9);
		DisplayUtils.removeFromParent(this.suitEff10);
		this.roleInfoItem0.destory();
		this.roleInfoItem1.destory();
		TimerManager.ins().remove(this.hideZhanling, this);
		TimerManager.ins().remove(this.playZhanLingAttack, this);
		TimerManager.ins().remove(this.startShowZhanling, this);
	}

	public clearChangeEff() {
		egret.Tween.removeTweens(this.groupRole);
		egret.Tween.removeTweens(this.groupRoleNext);
		this.groupRole.x = 0;
		this.groupRoleNext.x = 580;
		this.groupRole.alpha = 1;
		this.groupRoleNext.alpha = 0;
		this.groupRoleNext.visible = false;
		this.setRole(this.curRole, this.bodyImg, this.weaponImg);
		// this.setWeaponEffect(this.curRole, "wsef", this.soulEff, this.suitEff5);
		this.setWeaponEffect(this.curRole, "bodyEffect", this.bodyEff, this.suitEff7, 2);
		this.setSuit(this.curRole, this.suitImg, this.suitEff1);//齐鸣
		this.setWing(this.curRole, this.wingImg);
	}

	/** 角色切换特效 */
	public roleChange(beforeIndex: number, nextIndex: number) {
		if (beforeIndex == nextIndex) {
			this.clearChangeEff();
			return;
		}
		this.groupRoleNext.visible = true;
		this.setWing(beforeIndex, this.wingImg);
		this.setWing(nextIndex, this.nextWingImg);
		this.setSuit(beforeIndex, this.suitImg, this.suitEff1);
		this.setRole(beforeIndex, this.bodyImg, this.weaponImg);
		this.setRole(nextIndex, this.nextBodyImg, this.nextWeaponImg);
		// this.setWeaponEffect(beforeIndex, "wsef", this.soulEff, this.suitEff5);
		// this.setWeaponEffect(nextIndex, "nwsef", this.nsoulEff, this.suitEff6);
		this.setWeaponEffect(beforeIndex, "bodyEffect", this.bodyEff, this.suitEff7, 2);
		this.setWeaponEffect(nextIndex, "nbodyEffect", this.nbodyEff, this.suitEff8, 2);

		let t = egret.Tween.get(this.groupRole);
		let t2 = egret.Tween.get(this.groupRoleNext);
		if (beforeIndex < nextIndex) {
			this.groupRoleNext.x = 580;
			t.to({ x: -580, alpha: 0 }, 600);
			t2.to({ x: 0, alpha: 1 }, 600).call(this.clearChangeEff, this);
		} else {
			this.groupRoleNext.x = -580;
			t.to({ x: 580, alpha: 0 }, 600);
			t2.to({ x: 0, alpha: 1 }, 600).call(this.clearChangeEff, this);
		}

	}


	protected updateRing(): void {
		let ringModel: number[] = this._otherPlayerData.roleData[this.curRole].exRingsData;
		if (ringModel[0] > 0) {
			this.roleInfoItem0.setImgSource(0, 1);
			this.roleInfoItem0.setLv(0);
			this.roleInfoItem0.setNameTxt("晕眩神石");
			this.roleInfoItem0.setBgValue(`common1_Quality_004`);
		}
		else {
			this.roleInfoItem0.setImgSource(0, 0);
			this.roleInfoItem0.setLv(0);
			this.roleInfoItem0.setNameTxt("晕眩神石");
			this.roleInfoItem0.setBgValue(`common1_Quality_000`);
		}
		if (ringModel[1] > 0) {
			this.roleInfoItem1.setImgSource(1, 1);
			this.roleInfoItem1.setLv(0);
			this.roleInfoItem1.setNameTxt("护身皇钟");
			this.roleInfoItem1.setBgValue(`common1_Quality_004`);
		}
		else {
			this.roleInfoItem1.setImgSource(1, 0);
			this.roleInfoItem1.setLv(0);
			this.roleInfoItem1.setNameTxt("护身皇钟");
			this.roleInfoItem1.setBgValue(`common1_Quality_000`);
		}
	}

	protected updataEquip(delay: boolean = true): void {
		let model: Role = this._otherPlayerData.roleData[this.curRole];
		this.setEquip(model);
	}

	private updateSamsaraEquip() {
		let zlv = this._otherPlayerData.zhuan;
		let level = this._otherPlayerData.level;
		let roleLv: number = zlv * 1000 + level;
		let isOpen = roleLv >= GlobalConfig.ReincarnationBase.openLevel;

		for (let i = 9; i < 13; i++) {
			this["item" + i].visible = isOpen;
		}
	}

	/** 设置装备 */
	protected setEquip(role: Role): void {
		if (!role)
			return;
		let len: number = role.getEquipLen();

		this.weaponImg.source = "";
		for (let i = 0; i < len; i++) {
			let element: EquipsData = role.getEquipByIndex(i);
			this.equips[i].setModel(role);
			// this.equips[i].setCurRole(-1);
			this.equips[i].setIndex(i);
			this.equips[i].data = element.item;
			if (element.item.configID == 0) {
				this.equips[i].setItemImg(i >= EquipPos.MAX ? '' : `xb_1${ForgeConst.EQUIP_POS_TO_SUB[i]}`);
				this.equips[i].isShowTips(false);
				// this.addTouchEvent(this.equips[i], this.onClick);
			} else {
				this.equips[i].isShowTips(true);
				// this.removeTouchEvent(this.equips[i], this.onClick);
			}
			if (i >= EquipPos.HAT && i <= EquipPos.SHIELD) {
				if (element.soulLv > 0) {
					(this[`item${i}`] as ItemBase).setSoul(true);
				}
				else {
					(this[`item${i}`] as ItemBase).setSoul(false);
				}
			} else if (i >= EquipPos.WEAPON && i <= EquipPos.SHOE) {
				let itemIcon = (this[`item${i}`] as ItemBase).getItemIcon();
				// itemIcon.extreme.visible = ExtremeEquipModel.ins().getZhiZunLvByRoleID(role, i) > 0;
			}

		}
		this.powerPanel.setPower(role.power);
		this.setRole(this.curRole, this.bodyImg, this.weaponImg);
		// this.setWeaponEffect(this.curRole, "wsef", this.soulEff, this.suitEff5);
		this.setWeaponEffect(this.curRole, "bodyEffect", this.bodyEff, this.suitEff7, 2);
	}

	private setRole(index: number, imgBody: eui.Image, imgWeapon: eui.Image) {
		imgBody.source = null;
		imgWeapon.source = null;
		let role: Role = this._otherPlayerData.roleData[index];
		let zb: number[] = role.zhuangbei;
		let isHaveBody: boolean;
		let bodyId: number = zb[0];
		let weaponId: number = zb[1];
		let weaponConf: EquipsData = role.getEquipByIndex(0);
		let weaponConfId: number = weaponConf.item.configID;
		let bodyConf: EquipsData = role.getEquipByIndex(2);
		let bodyConfId: number = bodyConf.item.configID;
		let id: number = role.getEquipByIndex(0).item.configID;
		let cfg: EquipWithEffConfig = GlobalConfig.EquipWithEffConfig[id + "_" + role.sex];
		//策划要求，武器取图不设置MC
		let showWeapon: boolean = true;//cfg ? false : true;
		if (weaponConfId > 0) {
			imgWeapon.source = showWeapon ? DisplayUtils.getAppearanceByJobSex(
				GlobalConfig.EquipConfig[weaponConfId].appearance, role.job, role.sex) : null;

		}
		if (bodyConfId > 0) {
			imgBody.source = DisplayUtils.getAppearanceByJobSex(GlobalConfig.EquipConfig[bodyConfId].appearance, role.job, role.sex);;
			isHaveBody = true;
		}

		if (!isHaveBody)
			imgBody.source = DisplayUtils.getAppearanceBySex(`body${role.job}00`, role.sex);
		if (weaponId > 0)
			imgWeapon.source = showWeapon ? DisplayUtils.getAppearanceByJobSex(
				this.getZhuangbanById(weaponId).res, role.job, role.sex) : null;
		if (bodyId > 0)
			imgBody.source = DisplayUtils.getAppearanceByJobSex(
				this.getZhuangbanById(bodyId).res, role.job, role.sex);

		this.setWeaponsSuit(role);
	}

	public setSuit(roleId: number, suitImg: eui.Image, suitEff: MovieClip) {
		DisplayUtils.removeFromParent(suitEff);
		let role: Role = this._otherPlayerData.roleData[roleId];
		let cfg: HeirloomEquipSetConfig = role.heirloom.getSuitConfig(role);
		if (cfg) {
			if (!suitEff.parent)
				suitImg.parent.addChildAt(suitEff, suitImg.parent.getChildIndex(suitImg));
			let suitConfig: HeirloomEquipSetConfig = GlobalConfig.HeirloomEquipSetConfig[cfg.lv];
			suitEff.playFile(RES_DIR_EFF + suitConfig.neff, -1);
		}
	}

	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}

	protected onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.juesexiangxi:
				ViewManager.ins().open(RRoleAttrWin, this.curRole, this._otherPlayerData);
				break;
			case this.roleInfoItem0:
				ViewManager.ins().open(RSpecialRingWin, 0, this.curRole, this._otherPlayerData);
				break;
			case this.roleInfoItem1:
				ViewManager.ins().open(RSpecialRingWin, 1, this.curRole, this._otherPlayerData);
				break;
			default:

				break;
		}
	}

	protected setWing(index: number = this.curRole, wingImg: eui.Image = this.wingImg): void {
		wingImg.source = null;
		let wingdata: WingsData = this._otherPlayerData.roleData[index].wingsData;
		let id: number = this._otherPlayerData.roleData[this.curRole].zhuangbei[2];
		if (id > 0) {
			let cfg = GlobalConfig.ZhuangBanId[id];
			if (Assert(cfg, `cant get ZhuangBanId by id: ${id}`)) return;
			wingImg.source = cfg.res + "_png";
		} else if (wingdata.openStatus) {
			wingImg.source = GlobalConfig.WingLevelConfig[wingdata.lv].appearance + "_png";
		} else {
			wingImg.source = "";
		}

	}
	public setWeaponsSuit(role: Role) {
		let wid: number = role.weapons.weaponsId;
		let hideWeapons: boolean = true;// role.hideWeapons();  //是否隐藏剑灵特效
		if (!hideWeapons && wid) {
			this.suitEff.x = this["sef" + role.job].x;
			this.suitEff.y = this["sef" + role.job].y;
			this.suitEff.rotation = this["sef" + role.job].rotation;
			if (!this.suitEff.parent)
				this.soulEff.addChild(this.suitEff);

			let suitConfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[wid];
			this.suitEff.playFile(RES_DIR_EFF + suitConfig.inside[role.job - 1], -1);
		}
		else if (this.suitEff.parent)
			this.suitEff.parent.removeChild(this.suitEff);
	}

	/** 设置武器模型和服装特效 */
	private setWeaponEffect(roleId: number, jobImage: string, soulEffGroup: eui.Group, suitEff: MovieClip, pos: number = 0): void {
		let role: Role = this._otherPlayerData.roleData[roleId];
		let id: number = role.getEquipByIndex(pos).item.configID;
		let cfg: EquipWithEffConfig = GlobalConfig.EquipWithEffConfig[id + "_" + role.sex];
		DisplayUtils.removeFromParent(suitEff);
		let eff: MovieClip = suitEff;
		if (eff == this.suitEff5) {
			if (role.sex == 0)
				DisplayUtils.removeFromParent(this.suitEff9);
			else
				eff = this.suitEff9;
		}
		else if (eff == this.suitEff6) {
			if (role.sex == 0)
				DisplayUtils.removeFromParent(this.suitEff10);
			else
				eff = this.suitEff10;
		}

		if (cfg) {
			eff.x = this[jobImage + role.sex].x + cfg.offX;
			eff.y = this[jobImage + role.sex].y + cfg.offY;
			eff.rotation = this[jobImage + role.sex].rotation;
			eff.scaleX = eff.scaleY = cfg.scaling;
			eff.playFile(RES_DIR_EFF + cfg.inShowEff, -1);
			soulEffGroup.addChild(eff);
		}
		else
			DisplayUtils.removeFromParent(eff);
	}

	//显示天仙
	public showZhanling(otherPlayerData: OtherPlayerData) {
		let zhanlingID: number = otherPlayerData.zhanlingID;
		let zhanlingLevel: number = otherPlayerData.zhanlingLevel;
		if (zhanlingLevel < 0)//未开启天仙
			return;

		let config;
		if(zhanlingID <= 0 ){
			 config = GlobalConfig.ZhanLingLevel[zhanlingID][zhanlingLevel];
		}
		this.fileName = zhanlingID > 0 ? GlobalConfig.ZhanLingLevel[zhanlingID][0].appearance :config.appearance;
		if (!this.warMc) {
			this.warMc = new MovieClip;
			this.warMc.x = 140;
			this.warMc.y = 370;
			this.powerPanel.addChildAt(this.warMc, 1);
			this.warMc.playFile(RES_DIR_MONSTER + this.fileName + "_3s", -1);
			this.warMc.touchEnabled = false;
		}
		let anchorOffset = GlobalConfig.ZhanLingConfig.anchorOffset[0];
		this.warMc.anchorOffsetX = anchorOffset[0] || 0;
		this.warMc.anchorOffsetY = anchorOffset[1] || 0;
		TimerManager.ins().remove(this.startShowZhanling, this);
		TimerManager.ins().remove(this.playZhanLingAttack, this);
		TimerManager.ins().doTimer(200, 1, this.playZhanLingAttack, this);

	}

	/** 天仙播放攻击*/
	private playZhanLingAttack() {
		if (this.warMc) {
			let s: string = RES_DIR_MONSTER + this.fileName + "_3" + EntityAction.ATTACK;
			this.warMc.playFile(s, 1, () => {
				let src: string = RES_DIR_MONSTER + this.fileName + "_3" + EntityAction.STAND;
				this.warMc.playFile(src, -1, null, false);
				TimerManager.ins().remove(this.playZhanLingAttack, this);
				TimerManager.ins().doTimer(2800, 1, this.hideZhanling, this);
			}, false);
		}
	}

	//隐藏天仙
	private hideZhanling() {
		if (this.warMc) {
			egret.Tween.get(this.warMc).to({ alpha: 0 }, GlobalConfig.ZhanLingConfig.disappearTime || 1500).call(() => {
				this.powerPanel.removeChild(this.warMc);
				this.warMc.destroy();
				this.warMc = null;
				TimerManager.ins().remove(this.hideZhanling, this);
				TimerManager.ins().doTimer(7000, 1, this.startShowZhanling, this);
			});
		}
	}

	/** 间隔显示天仙*/
	private startShowZhanling(): void {
		this.showZhanling(this._otherPlayerData);
	}

}

