class RoleItemRenderer extends BaseItemRender {
	private otherPlayerData: OtherPlayerData;

	protected suitImg: eui.Image;
	protected wingImg: eui.Image;
	protected bodyImg: eui.Image;
	protected weaponImg: eui.Image;
	protected soulEff: eui.Group;
	protected bodyEff: eui.Group;

	private _bodyEff0: MovieClip;
	private _bodyEff1: MovieClip;
	private _bodyEff2: MovieClip;
	private _weaponEff0: MovieClip;
	private _weaponEff1: MovieClip;
	private _weaponEff2: MovieClip;

	protected suitEff5: MovieClip; //当前武器模型男
	protected suitEff7: MovieClip; //当前神装特效
	protected suitEff9: MovieClip; //当前武器模型女
	protected suitEff: MovieClip;//当前齐鸣
	protected suitEff2: MovieClip;//当前兵魂

	public index: number = 0;

	constructor() {
		super();
		this.skinName = "RoleShowSkin";
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showRole, this);

		this.suitEff = new MovieClip;
		this.suitEff.x = this.suitImg.x;
		this.suitEff.y = this.suitImg.y;

		this.suitEff2 = new MovieClip;
		this.suitEff5 = new MovieClip();
		this.suitEff7 = new MovieClip();
		this.suitEff9 = new MovieClip();
	}


	public dataChanged(): void {

		if (!this.data || !this.data.otherPlayerData || !(this.data.otherPlayerData instanceof OtherPlayerData)) {
			this[`bodyImg`].source = "";
			this[`weaponImg`].source = "";
			this[`wingImg`].source = "";
			if (this.suitEff)
				DisplayUtils.removeFromParent(this.suitEff);
			if (this.suitEff2)
				DisplayUtils.removeFromParent(this.suitEff2);
			if (this.suitEff5)
				DisplayUtils.removeFromParent(this.suitEff5);
			if (this.suitEff7)
				DisplayUtils.removeFromParent(this.suitEff7);
			return;
		}

		let otherPlayerData = this.data.otherPlayerData as OtherPlayerData;


		let role: Role = otherPlayerData.roleData[this.index];
		if (role) {
			this.setWing(role.index, this.wingImg);
			this.setRole(role.index, this.bodyImg, this.weaponImg);
			this.setRoleEff(role.index);
		}

	}

	private setRole(index: number, imgBody: eui.Image, imgWeapon: eui.Image) {
		imgBody.source = null;
		imgWeapon.source = null;
		// let role: Role = SubRoles.ins().getSubRoleByIndex(index);
		let role: Role = this.data.otherPlayerData.roleData[index];
		let id: number = role.getEquipByIndex(0).item.configID;
		let zb: number[] = role.zhuangbei;
		let isHaveBody: boolean;
		let bodyId: number = zb[0];
		let weaponId: number = zb[1];
		let weaponConf: EquipsData = role.getEquipByIndex(0);
		let weaponConfId: number = weaponConf.item.configID;
		let bodyConf: EquipsData = role.getEquipByIndex(2);
		let bodyConfId: number = bodyConf.item.configID;
		if (weaponConfId > 0) {
			let fileName: string = GlobalConfig.EquipConfig[weaponConfId].appearance;
			if (fileName && fileName.indexOf("[job]") > -1)
				fileName = fileName.replace("[job]", role.job + "");
			imgWeapon.source = !GlobalConfig.EquipWithEffConfig[id + "_" + role.sex] ? fileName + "_" + role.sex + "_c_png" : null;

		}
		if (bodyConfId > 0) {
			let fileName: string = GlobalConfig.EquipConfig[bodyConfId].appearance;
			if (fileName && fileName.indexOf("[job]") > -1)
				fileName = fileName.replace("[job]", role.job + "");
			imgBody.source = fileName + "_" + role.sex + "_c_png";
			isHaveBody = true;
		}

		if (!isHaveBody)
			imgBody.source = `body000_${role.sex}_c_png`;
		if (weaponId > 0)
			imgWeapon.source = this.getZhuangbanById(weaponId).res + "_" + role.sex + "_c_png";
		if (bodyId > 0)
			imgBody.source = this.getZhuangbanById(bodyId).res + "_" + role.sex + "_c_png";
	}

	protected setWing(index: number = 0, wingImg: eui.Image = this.wingImg): void {
		wingImg.source = null;
		let role: Role = this.data.otherPlayerData.roleData[index];
		let wingdata: WingsData = role.wingsData;
		let id: number = role.zhuangbei[2];
		if (id > 0)
			wingImg.source = GlobalConfig.ZhuangBanId[id].res + "_png";
		else if (wingdata.openStatus) {
			wingImg.source = GlobalConfig.WingLevelConfig[wingdata.lv].appearance + "_png";
		} else {
			wingImg.source = "";
		}
	}

	/**特效*/
	public setRoleEff(roleIndex: number) {
		//只展示玩家第一个角色
		this.setSuit(roleIndex, this.suitImg, this.suitEff);//传世
		this.setWeaponsSuit(roleIndex, "sef", this.soulEff, this.suitEff2)//兵魂
		this.setWeaponEffect(roleIndex, "wsef", this.soulEff, this.suitEff5);//武器
		this.setWeaponEffect(roleIndex, "bodyEffect", this.bodyEff, this.suitEff7, 2);//衣服
	}


	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}

	private showRole(e: egret.TouchEvent) {
		if (!this.data || !this.data.otherPlayerData) {
			// UserReadPlayer.ins().sendFindPlayer(this.actorId);
			return;
		}
		ViewManager.ins().open(RRoleWin, this.data.otherPlayerData);
		let view = ViewManager.ins().open(RRoleWin, this.data.otherPlayerData) as RRoleWin;
		view.hideEx(2);
	}

	public setSuit(roleId: number, suitImg: eui.Image, suitEff: MovieClip) {
		DisplayUtils.removeFromParent(suitEff);
		// let role: Role = SubRoles.ins().getSubRoleByIndex(roleId)
		let role: Role = this.data.otherPlayerData.roleData[roleId];
		let cfg: HeirloomEquipSetConfig = role.heirloom.getSuitConfig(role);
		if (cfg) {
			if (!suitEff.parent)
				suitImg.parent.addChildAt(suitEff, suitImg.parent.getChildIndex(suitImg));
			let suitConfig: HeirloomEquipSetConfig = GlobalConfig.HeirloomEquipSetConfig[cfg.lv];
			suitEff.playFile(RES_DIR_EFF + suitConfig.neff, -1);
		}
	}

	public setWeaponsSuit(roleId: number, jobImage: string, soulEffGroup: eui.Group, suitEff: MovieClip) {
		// let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let role: Role = this.data.otherPlayerData.roleData[roleId];
		suitEff.x = this[jobImage + role.job].x;//"sef"  suitEff2
		suitEff.y = this[jobImage + role.job].y;
		suitEff.rotation = this[jobImage + role.job].rotation;
		DisplayUtils.removeFromParent(suitEff);
		let wid: number = role.weapons.weaponsId;
		let hideWeapons: boolean = role.hideWeapons();  //是否隐藏兵魂特效

		if (!hideWeapons && wid) {
			if (!suitEff.parent)
				soulEffGroup.addChild(suitEff);
			let suitConfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[wid];
			suitEff.playFile(RES_DIR_EFF + suitConfig.inside[role.job - 1], -1);
		}
	}

	/** 设置武器模型和服装特效 */
	private setWeaponEffect(roleId: number, jobImage: string, soulEffGroup: eui.Group, suitEff: MovieClip, pos: number = 0): void {
		// let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let role: Role = this.data.otherPlayerData.roleData[roleId];
		let id: number = role.getEquipByIndex(pos).item.configID;
		let cfg: EquipWithEffConfig = GlobalConfig.EquipWithEffConfig[id + "_" + role.sex];
		DisplayUtils.removeFromParent(suitEff);

		let zb: number[] = role.zhuangbei;
		let eff: MovieClip = suitEff;
		if (eff == this.suitEff5) {
			if (role.sex == 0)
				DisplayUtils.removeFromParent(this.suitEff9);
			else
				eff = this.suitEff9;
		}

		if (cfg && ((pos == 0 && zb[1] <= 0) || (pos == 2 && zb[0] <= 0))) {
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

}