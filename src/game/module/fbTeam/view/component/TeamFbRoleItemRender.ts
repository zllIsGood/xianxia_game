/**
 * 组队副本玩家信息列表项
 * @author wanghengshuai
 * 
 */
class TeamFbRoleItemRender extends BaseItemRender{
	
	public body:eui.Image;
	public roleName:eui.Label;
	public position:eui.Image;
	public weapon:eui.Image;
	public nomember:eui.Image;
	public invite:eui.Image;
	public wing:eui.Image;

	public constructor() {
		super();
		this.skinName = "teamFbRoleItem";
		this.touchEnabled = false;
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this,);
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.invite:
			case this.nomember:
				if (!UserFb.ins().isTFCaptain)
				{
					UserTips.ins().showTips(`队长才能邀请玩家`);
					return;
				}

				ViewManager.ins().open(TeamFbInviteWin, GlobalConfig.TeamFuBenBaseConfig.inviteText.replace("{0}", GlobalConfig.TeamFuBenConfig[UserFb.ins().tfPassID + 1].name), UserFb.ins().tfRoomID, this.data.configID);
				break;
			case this.body:
				if (this.data.vo.roleID != Actor.actorID)
					ViewManager.ins().open(MemberInfoWin, this.data.vo);

				break;
		}
	}

	public dataChanged():void{
		if (!this.data.vo)
		{
			this.nomember.visible = this.invite.visible = true;
			this.body.visible = this.position.visible = this.weapon.visible = this.wing.visible =  false;
			this.roleName.text = "虚位以待";
		}
		else
		{
			this.nomember.visible = this.invite.visible = false;
			this.body.visible = this.position.visible = this.weapon.visible = true;

			let vo:TeamFuBenRoleVo = this.data.vo;
			this.roleName.text = vo.roleName;

			if (vo.position != 3)
				this.position.source = vo.position == 1 ? "team_tag" : "team_tag_help";
			else
				this.position.source = "";
			
			this.body.source = this.weapon.source = this.wing.source = null;

			let clothCfg = GlobalConfig.EquipConfig[vo.cloth];
			if (clothCfg) 
			{
				let fileName: string = clothCfg.appearance;
				if (fileName && fileName.indexOf("[job]") > -1)
						fileName = fileName.replace("[job]", vo.job + "");

				this.body.source = (vo.cloth > 0 ? fileName + "_" : `body${vo.job}00_`) + vo.sex + "_c_png";
			}

			let weaponCfg = GlobalConfig.EquipConfig[vo.weapon];
			if (weaponCfg) 
			{
				let fileName: string = weaponCfg.appearance;
				if (fileName && fileName.indexOf("[job]") > -1)
					fileName = fileName.replace("[job]", vo.job + "");
						
				this.weapon.source = vo.weapon > 0 ? `${fileName}_${vo.sex}_c_png` : '';			
			}

			let wingCfg = GlobalConfig.WingLevelConfig[vo.wingLv];
			if (wingCfg) 
				this.wing.source = vo.wingLv >= 0 ? wingCfg.appearance + "_png" : '';

			//时装
			if( vo.pos1 > 0 )//pos1:衣服 pos2:武器 pos3:翅膀
				this.body.source = this.getZhuangbanById(vo.pos1).res + "_" + vo.sex + "_c_png";

			if( vo.pos2 > 0 )//pos1:衣服 pos2:武器 pos3:翅膀
				this.weapon.source = this.getZhuangbanById(vo.pos2).res + "_" + vo.sex + "_c_png";
						
			if( vo.pos3 > 0 )//pos1:衣服 pos2:武器 pos3:翅膀
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