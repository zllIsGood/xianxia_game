/**
 * 跨服竞技场玩家信息列表项
 * @author yuyaolong
 *
 */
class KfArenaRoleItemRender extends BaseItemRender {
	public body: eui.Image;
	public roleName: eui.Label;
	public position: eui.Image;
	public weapon: eui.Image;
	public nomember: eui.Image;
	public invite: eui.Image;
	public wing: eui.Image;
	private offLineImg: eui.Image;

	public constructor() {
		super();
		this.skinName = "teamFbRoleItem";
		this.touchEnabled = false;
	}

	public childrenCreated(): void {
		super.childrenCreated();
		
		this.init();	
	}


	

	public init() {
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this,);

	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.invite:
			case this.nomember:
				// if (!KfArenaSys.ins().isTFCaptain)
				// {
				// 	UserTips.ins().showTips(`队长才能邀请玩家`);
				// 	return;
				// }
				ViewManager.ins().open(KfArenaInviteWin);
				break;
			case this.body:
				if (this.data.roleID != Actor.actorID)
					ViewManager.ins().open(kfArenaCheckWin, this.data);

				break;
		}
	}

	public dataChanged(): void {
		if (!this.data) {
			this.nomember.visible = this.invite.visible = true;
			this.offLineImg.visible = this.body.visible = this.position.visible = this.weapon.visible = this.wing.visible = false;
			this.roleName.text = "虚位以待";
		}
		else {
			this.nomember.visible = this.invite.visible = false;
			this.body.visible = this.position.visible = this.weapon.visible = true;
			let vo: KfArenaRoleVo = this.data;
			this.offLineImg.visible = !vo.isonline;
			this.roleName.text = vo.roleName;
			this.position.source = vo.isLeader() ? "tfb_leader" : null;
			this.body.source = this.weapon.source = this.wing.source = null;

			let clothCfg = GlobalConfig.EquipConfig[vo.cloth];
			if (clothCfg) {
				let fileName: string = clothCfg.appearance;
				if (fileName && fileName.indexOf("[job]") > -1)
					fileName = fileName.replace("[job]", vo.job + "");

				this.body.source = (vo.cloth > 0 ? fileName + "_" : `body${vo.job}00_`) + vo.sex + "_c_png";
			}

			let weaponCfg = GlobalConfig.EquipConfig[vo.weapon];
			if (weaponCfg) {
				let fileName: string = weaponCfg.appearance;
				if (fileName && fileName.indexOf("[job]") > -1)
					fileName = fileName.replace("[job]", vo.job + "");

				this.weapon.source = vo.weapon > 0 ? `${fileName}_${vo.sex}_c_png` : '';
			}
			this.wing.visible = true;
			let wingCfg = GlobalConfig.WingLevelConfig[vo.wingLv];
			if (wingCfg)
				this.wing.source = vo.wingLv >= 0 ? wingCfg.appearance + "_png" : '';

			//时装
			if (vo.pos1 > 0)//pos1:衣服 pos2:武器 pos3:翅膀
				this.body.source = this.getZhuangbanById(vo.pos1).res + "_" + vo.sex + "_c_png";

			if (vo.pos2 > 0)//pos1:衣服 pos2:武器 pos3:翅膀
				this.weapon.source = this.getZhuangbanById(vo.pos2).res + "_" + vo.sex + "_c_png";

			if (vo.pos3 > 0)//pos1:衣服 pos2:武器 pos3:翅膀
				this.wing.source = this.getZhuangbanById(vo.pos3).res + "_png";

			if (!this.body.source)
				this.body.source = `body000_${vo.sex}_c_png`;

		}
	}

	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}
}