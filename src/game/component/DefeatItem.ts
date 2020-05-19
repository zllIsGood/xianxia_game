class DefeatItem extends BaseItemRender {

	protected icon: eui.Image;
	protected iconName: eui.Label;
	protected desc: eui.Label;
	protected openRole0: eui.Button;
	private cfg: DeathgainWayConfig;
	protected jump: eui.Label;//前往下划线
	protected up: eui.Image;//可提升icon
	protected method: eui.Image;//iconName-Icon
	private mc: MovieClip;
	constructor() {
		super();
		this.skinName = 'DefeatItemSkin';
		this.init();
	}

	/**触摸事件 */
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		//获取控件label设置成下划线 因为UI编辑没有这个属性
		let str = "|U&S:" + this.jump.size + "&C:" + this.jump.textColor + "&T:" + this.jump.text + "|";
		this.jump.textFlow = TextFlowMaker.generateTextFlow1(str);

	}

	public onClick(e: egret.TouchEvent) {
		switch (e.target) {
			case this.openRole0:
			case this.jump://前往下划线
				this.showDetail();
				break;
		}
	}

	protected showDetail() {
		if (this.cfg) {
			if (ViewManager.ins().isShow(MaterialResultWin))
				ViewManager.ins().close(MaterialResultWin);
			else if (ViewManager.ins().isShow(TongResultWin))
				ViewManager.ins().close(TongResultWin);
			else if (ViewManager.ins().isShow(CityResultWin))
				ViewManager.ins().close(CityResultWin);
			else if (ViewManager.ins().isShow(NewWorldBossResultPanel))
				ViewManager.ins().close(NewWorldBossResultPanel);
			else if (ViewManager.ins().isShow(BossResultWin))
				ViewManager.ins().close(BossResultWin);
			else if (ViewManager.ins().isShow(PersonalResultWin))
				ViewManager.ins().close(PersonalResultWin);
			else
				ViewManager.ins().close(ResultWin);

			if (this.cfg.gainWay[1] == "VipWin") {
				//能进来这里代表vip未满级
				ViewManager.ins().open(this.cfg.gainWay[1], UserVip.ins().lv + 1);
			} else {
				ViewManager.ins().open(this.cfg.gainWay[1], this.cfg.gainWay[2]);
			}

		}
	}

	protected dataChanged(): void {
		if (!isNaN(this.data)) {
			this.cfg = null;
			let cfg: DeathgainWayConfig
			for (let i in GlobalConfig.DeathgainWayConfig) {
				cfg = GlobalConfig.DeathgainWayConfig[i];
				if (cfg.level == this.data) {
					this.cfg = cfg;
					break;
				}
			}
			if (this.cfg) {
				if (this.cfg.level == 14) {//首充
					let rch: RechargeData = Recharge.ins().getRechargeData(0);
					if (rch.num && rch.num != 2) {
						//首充后死亡弹vip
						this.cfg = GlobalConfig.DeathgainWayConfig[20];
						//旧逻辑
						// let boo2 = Recharge.ins().getCurDailyRechargeIsAllGet();
						// if( !boo2 ){
						// 	this.cfg = GlobalConfig.DeathgainWayConfig[18];//每日充
						// }else{
						// 	this.cfg = GlobalConfig.DeathgainWayConfig[19];//每日充
						// }
					}
				}
				this.icon.source = this.cfg.itemId;
				this.iconName.text = this.cfg.gainWay[0];
				let count: number;
				let len: number;
				let b: boolean = false;
				let head = "siwangyd";
				this.desc.visible = false;
				// switch (this.cfg.level) {
				// 	case 1://强化装备
				// 		count = UserBag.ins().getBagGoodsCountById(0, 200002);
				// 		// this.desc.visible = UserForge.ins().forgeHint(0, count);
				// 		// this.method.source = head + "qh" + "_png";
				// 		break;
				// 	case 2://翅膀
				// 		// this.desc.visible = this.and(Wing.ins().canGradeupWing()) || this.and(Wing.ins().canItemGradeupWing()) || this.and(Wing.ins().canRoleOpenWing())
				// 		break;
				// 	case 3://铸造
				// 		count = UserBag.ins().getBagGoodsCountById(0, 200003);
				// 		// this.desc.visible = UserForge.ins().forgeHint(1, count);
				// 		break;
				// 	case 4://龙印
				// 		len = SubRoles.ins().subRolesLen;
				// 		b = false;
				// 		for (let i: number = 0; i < len; i++) {
				// 			if (LongHun.ins().canShowRedPointInRole(i)) {
				// 				b = true;
				// 				break;
				// 			}
				// 		}
				// 		// this.desc.visible = b;
				// 		break;
				// 	case 5://精炼
				// 		// this.desc.visible = UserForge.ins().jingLianCanUp();
				// 		// this.method.source = head + "jl" + "_png";
				// 		break;
				// 	case 6://内功
				// 		// this.desc.visible = NeiGongModel.ins().canUp();
				// 		// this.method.source = head + "ng" + "_png";
				// 		break;
				// 	case 7://装备
				// 		// this.desc.visible = UserRole.ins().getCanChangeEquips();
				// 		// this.method.source = head + "zb" + "_png";
				// 		break;
				// 	case 8://秘术
				// 		// this.desc.visible = false;
				// 		break;
				// 	case 9://经脉
				// 		let data: JingMaiData;
				// 		for (let i in SubRoles.ins().roles) {
				// 			data = SubRoles.ins().roles[i].jingMaiData;
				// 			if (data.jingMaiCanUp()) {
				// 				b = true;
				// 				break;
				// 			}
				// 		}
				// 		// this.desc.visible = b;
				// 		// this.method.source = head + "jm" + "_png";
				// 		break;
				// 	case 10://经脉
				// 		UserSkill.ins().canGrewupSkill();
				// 		// this.desc.visible = this.and(UserSkill.ins().canGrewupSkill());
				// 		// this.method.source = head + "jm" + "_png";
				// 		break;
				// 	case 11://印记
				// 		// this.desc.visible = UserSkill.ins().canHejiEquip() || UserSkill.ins().canExchange();
				// 		break;
				// 	case 12://符文
				// 		// this.desc.visible = RuneRedPointMgr.ins().checkAllSituation();
				// 		break;
				// 	case 13://灵戒
				// 		// this.desc.visible = RuneRedPointMgr.ins().checkAllSituation();
				// 		break;
				// 	default:
				// 		// this.desc.visible = false;
				// 		break;
				// }
				//可提升和对应icon同显同隐
				this.up.visible = this.desc.visible;
			}
			//死亡引导
			if (this.data == 16) {
				if (!this.mc)
					this.mc = new MovieClip;
				if (!this.mc.parent) {
					this.jump.parent.addChild(this.mc);
					this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
					this.mc.touchEnabled = false;
				}
				this.mc.x = this.jump.x + 18;
				this.mc.y = this.jump.y + 10;
				this.mc.scaleX = this.mc.scaleY = 0.6;
				//this.icon.scaleX = 0.5; this.icon.scaleY = 0.45;
			}
		}
	}

	private and(list): boolean {
		for (let k in list) {
			if (list[k] == true)
				return true;
		}

		return false;
	}
}