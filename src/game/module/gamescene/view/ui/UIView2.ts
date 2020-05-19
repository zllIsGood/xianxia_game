/**
 * 主界面最底下导航栏
 */
class UIView2 extends BaseEuiView {

	private navBind: any[];
	private navBtn: eui.ToggleButton[];

	/** 角色导航按钮 */
	private roleBtn: eui.ToggleButton;
	/** 背包导航按钮 */
	private bagBtn: eui.ToggleButton;
	/** 锻造导航按钮 */
	private forgingBtn: eui.ToggleButton;
	/** 技能导航按钮 */
	private furnaceBtn: eui.ToggleButton;
	/** 修炼按钮 */
	private taskBtn: eui.ToggleButton;
	/** 经验条 */
	private expBar: eui.ProgressBar;

	/** 任务奖励道具抛物图*/
	private taskItemImg: eui.Image;

	public hjGrp: eui.Group;


	private hpBall: MovieClip;
	private mpBall: MovieClip; // 内功特效
	private mpClipShape: egret.Shape; // 内功特效遮罩

	public groupBagTips: eui.Group;

	private isExitUsedItem: boolean;
	private isItemCountChange: boolean;

	private tips: eui.Image;

	/**角色导航按钮 */
	public static NAV_ROLE: number = 0;
	/**技能导航按钮 */
	public static NAV_SKILL: number = 1;
	/**历练导航按钮 */
	public static NAV_LILIAN: number = 2;
	/**锻造导航按钮 */
	public static NAV_SMITH: number = 3;
	/**背包导航按钮 */
	public static NAV_BAG: number = 4;

	private closeBtn: eui.Button;

	private powerGroup: eui.Group;
	private guideGroup: eui.Group;

	private hPGroup: eui.Group;
	private mPGroup: eui.Group;

	private lockImg: eui.Image;

	private hjMc: MovieClip;
	private hjMiddleMc: MovieClip;

	private hpLineMc: MovieClip;
	private hpLineClipShape: egret.Shape;

	private mpMask: eui.Image;
	private hpMask: eui.Image;
	private flyItemGroup: eui.Group;

	private backBtnGroup: eui.Group;
	private backMc: MovieClip;
	private circleImg: MovieClip;

	private tweenTaskObj: { factor: number };

	private lastLevel: number = 0;
	private flyExpLevel: number[][] = [];
	private tipsText: eui.Label;

	private imageLoadBtn: eui.Button; // 测试按钮用于下载查看加载资源文件

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "UIView2Skin";
		this.expBar.slideDuration = 0;

		this.navBtn = [this.roleBtn, this.furnaceBtn, this.taskBtn, this.forgingBtn, this.bagBtn];

		for (let i = 0; i < this.navBtn.length; i++) {
			this.navBtn[i]['redPoint'].visible = false;
		}

		this.navBind = [RoleWin, SkillWin, LiLianWin, ForgeWin, BagWin];

		this.hpBall = new MovieClip;
		this.hpBall.mask = new egret.Rectangle(-88 / 2, -97 / 2, 88 * 2, 97 * 2);
		this.hpBall.x = 43;
		this.hpBall.y = 38;

		this.hpLineMc = new MovieClip;
		this.hpLineMc.x = 45;
		this.hpLineMc.y = 0;
		this.hpLineMc.mask = this.hpMask;
		// 浮动血条遮罩
		this.hpLineClipShape = new egret.Shape;

		// 内功进度特效
		this.mpBall = new MovieClip;

		this.hjMc = new MovieClip;
		// this.hjMc.x = 40;
		// this.hjMc.y = 40;
		this.hjMc.touchEnabled = false;


		this.circleImg = new MovieClip;
		
		let circleImgMask = new egret.Rectangle(-88, -88, 88 * 2, 88 * 2);
		this.circleImg.mask = circleImgMask;
		
		this.circleImg.x = 40;
		this.circleImg.y = 40;
		// this.circleImg.scaleX = this.circleImg.scaleY = 1.09;
		this.circleImg.touchEnabled = false;

		let mpBallMask = new egret.Rectangle(-88, -88, 88 * 2, 88 * 2);
		this.mpBall.mask = mpBallMask;


		this.taskItemImg = new eui.Image;
		this.taskItemImg.x = 250;
		this.taskItemImg.y = 730;
		this.taskItemImg.visible = false;
		this.flyItemGroup.addChild(this.taskItemImg);

		this.backMc = new MovieClip;
		this.backMc.x = 50;
		this.backMc.y = 50;

		this.isExitUsedItem = false;
		this.isItemCountChange = false;
		this.backBtnGroup.visible = false;
		this.powerGroup.visible = true;
		this.backBtnGroup.touchEnabled = this.backMc.touchEnabled = false;

		
		this.imageLoadBtn.visible = false;
		this.addTouchEvent(this.imageLoadBtn, function () {
			FixUtil.imageLoadSave();
		});
	}

	public open(...param: any[]): void {
		super.open(param);

		this.lastLevel = Actor.level || 0;

		for (let i = 0; i < this.navBtn.length; i++) {
			this.addTouchEvent(this.navBtn[i], this.onClick);
		}
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.powerGroup, this.onClick);
		this.addTouchEvent(this.lockImg, this.onClick);
		this.observe(Actor.ins().postExp, this.expChange);
		this.observe(Actor.ins().postInit, this.expChange);
		this.observe(UserRole.ins().postRoleHint, this.showRoleBtnRedPoint);
		this.observe(GameLogic.ins().postMpChange, this.updateHuShen);
		this.observe(GameLogic.ins().postCOEntity, this.updateHuShen);
		this.observe(GameLogic.ins().postHpChange, this.readyUpdateHp);
		this.observe(GameLogic.ins().postHpChange, this.flyGQBossExpToBar);
		this.observe(GameLogic.ins().postCOEntity, this.readyUpdateHp);
		this.observe(UserTask.ins().postParabolicItem, this.runItem);
		this.observe(UserBag.ins().postItemCountChange, this.showBagBtnRedPoint);//道具数量变更
		this.observe(ForgeRedPoint.ins().postForgeRedPoint, this.showForgingBtnRedPoint);
		this.observe(UserBag.ins().postBagWillFull, this.setBagTips);//背包是否即将满
		this.observe(UserBag.ins().postItemCanUse, this.setIsExitUsedItem);//背包是否有可用道具提示
		this.observe(UserBoss.ins().postBossAppear, this.onBossAppear);
		this.observe(MonsterSpeak.ins().postMonsterSpeak, this.onMonsterSpeak);
		this.observe(UserFb.ins().postExpFly, this.flyExpToBar);
		this.observe(Encounter.ins().postFightResult, this.onFightResult);

		this.observe(NeiGong.ins().postNeiGongDataChange, this.startUpdateRedPoint);
		this.observe(UserJingMai.ins().postUpdate, this.startUpdateRedPoint);
		this.observe(UserBag.ins().postItemAdd, this.startUpdateRedPoint);//道具添加
		this.observe(UserZs.ins().postZsData, this.startUpdateRedPoint);
		this.observe(Actor.ins().postLevelChange, this.startUpdateRedPoint);
		this.observe(Actor.ins().postGoldChange, this.startUpdateRedPoint);
		this.observe(UserSkill.ins().postSkillUpgradeAll, this.startUpdateRedPoint);

		this.observe(GameLogic.ins().postViewOpen, this.checkViewOpen);
		this.observe(UserBoss.ins().postBossData, this.publicBossRelive);

		this.observe(UserBag.ins().postItemAdd, this.setLilianRedPoint);//道具添加
		this.observe(LiLian.ins().postLilianData, this.setLilianRedPoint);
		this.observe(LiLian.ins().postNobilityData, this.setLilianRedPoint);
		this.observe(UserTask.ins().postTaskChangeData, this.setLilianRedPoint);
		this.observe(Artifact.ins().postNewArtifactUpdate, this.setLilianRedPoint);
		this.observe(Artifact.ins().postNewArtifactInit, this.setLilianRedPoint);
		this.observe(BookRedPoint.ins().postRedPoint, this.setLilianRedPoint);
		this.observe(Actor.ins().postLevelChange, this.setLilianRedPoint);
		this.observe(LiLian.ins().postJadeLv, this.setLilianRedPoint);
		this.observe(UserBag.ins().postItemChange, this.setLilianRedPoint);

		this.observe(UserSkill.ins().postHejiRemove, this.resetHejiCd);
		this.observe(UserSkill.ins().postHejiStartCD, this.resetHejiCd);
		this.observe(UserSkill.ins().postHejiUpdate, this.checkHejiOpen);
		this.observe(LiLian.ins().postGetLilianReward, this.lilianRewardFlash);
		this.observe(Guild.ins().postGuildCreate, this.setRedPiont);//创建仙盟成功关联仙盟礼包
		this.observe(Guild.ins().postProcessJoin, this.setRedPiont);//加入仙盟成功关联仙盟礼包
		this.observe(GameLogic.ins().postFlyItem, this.flyItemToBag);//道具飞向背包
		this.observe(GameLogic.ins().postFlyItemEx, this.flyItemToBagEx);//道具飞向背包2
		this.observe(Recharge.ins().postRecharge1Data, this.setRedPiont);

		this.observe(GameLogic.ins().postEnterMap, this.cleanPowerGuilderEff);

		this.hpBall.playFile(RES_DIR_EFF + "blood_red", -1);
		this.mpBall.playFile(RES_DIR_EFF + "neigonghulu", -1);
		this.hPGroup.addChildAt(this.hpBall, 0);
		this.mPGroup.addChildAt(this.mpBall, 0);

		// this.mpClipShape = new egret.Shape;
		// this.mPGroup.addChild(this.mpClipShape);
		// this.mpBall.mask = this.mpClipShape;

		this.hpLineMc.playFile(RES_DIR_EFF + "hpsxeff", -1);
		this.hPGroup.addChildAt(this.hpLineMc, 1);
		this.hpLineClipShape = new egret.Shape;
		this.hpLineClipShape.x = this.hpBall.x;
		this.hpLineClipShape.y = this.hpBall.y;
		this.hpLineClipShape.graphics.lineStyle( 1, 0xff0000 );
        this.hpLineClipShape.graphics.beginFill( 0xff0000, 1);
        this.hpLineClipShape.graphics.drawCircle( 0, 0, 45 );
        this.hpLineClipShape.graphics.endFill();
		this.hPGroup.addChild(this.hpLineClipShape);
		this.hpLineMc.mask = this.hpLineClipShape;

		//不能放在这里，新号就会立刻加载此资源
		// this.circleImg.playFile(RES_DIR_EFF + "hejianniueff", -1);
		this.powerGroup.addChildAt(this.circleImg, 3);

		// this.powerGroup.addChild(this._shap);
		// this.circleImg.mask = this._shap;

		this.checkHejiOpen();
		if (UserSkill.ins().hejiLevel > 0) UserSkill.ins().postHejiStartCD();
		this.startUpdateRedPoint();

		this.showForgingBtnRedPoint();
	}

	private checkHejiOpen(): void {
		if (UserSkill.ins().hejiLevel > 0) {
			this.powerGroup.touchEnabled = true;
			this.circleImg.playFile(RES_DIR_EFF + "hejianniueff", -1);
			this.powerImg.visible = true;
			this.lockImg.visible = false;
			this.powerImg.source = UserSkill.ins().getHejiSkillIdIcon();
			this.powerImg.scaleX = 0.70;
			this.powerImg.scaleY = 0.70;
		} else {
			this.powerGroup.touchEnabled = false;
			this.powerImg.visible = false;
			this.lockImg.visible = true;
		}
	}

	private checkViewOpen(type: number = 0): void {
		if (type == 1) {
			this.backBtnGroup.visible = true;
			this.powerGroup.visible = false;
			if (!this.backMc.parent) {
				this.backMc.playFile(RES_DIR_EFF + "fanhuibtneff", -1);
				this.backBtnGroup.addChild(this.backMc);
			}
		} else {
			this.backBtnGroup.visible = false;
			this.powerGroup.visible = true;
			DisplayUtils.removeFromParent(this.backMc);
		}
		// this.checkShowHejiIcon(type);
	}

	public close(...param: any[]): void {
		TimerManager.ins().removeAll(this);
	}

	private showRoleBtnRedPoint(b: number): void {
		this.roleBtn['redPoint'].visible = b > 0;
	}

	private showBagBtnRedPoint(b: number): void {
		this.isItemCountChange = b > 0;
		this.setRedPiont();
	}

	private showForgingBtnRedPoint(): void {
		this.forgingBtn['redPoint'].visible = ForgeRedPoint.ins().redPoint;
	}

	@callLater
	private setLilianRedPoint(): void {
		let lilian = LiLian.ins();
		let isMaxLevel: boolean = LiLian.ins().getNobilityIsMaxLevel();
		let flag: boolean = lilian.getLilianShenGongStast() ||
			Artifact.ins().showRedPoint() ||
			(lilian.checkXunZhangOpen() && lilian.getNobilityIsUpGrade() && !isMaxLevel) ||
			Artifact.ins().showRedPoint() ||
			BookRedPoint.ins().redpoint || lilian.checkJadeRed();
		this.taskBtn['redPoint'].visible = flag;
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				SoundUtil.ins().playEffect(SoundUtil.WINDOW);
				let view: BaseView = ViewManager.ins().getView(RoleWin);
				if (view && (view as RoleWin).getWingPanelInfo()) {
					(view as RoleWin).doOpenHintWin(2)
				} else {
					ViewManager.ins().closeLastTopView();
				}
				break;
			case this.lockImg:
				UserTips.ins().showTips(`完成主线任务后开启`);
				break;
			case this.powerImg:
			case this.powerGroup:
				if (UserSkill.ins().hejiLevel <= 0) {
					//必杀没开启点击不提示
					return;
				}
				if (!this.hjMc || !this.hjMc.parent) {
					UserTips.ins().showTips(`怒气未满，无法释放必杀`);
					return;
				}

				let state = this.useHejiSkill();
				if (state == -1) {
					UserTips.ins().showTips(`释放距离过远，无法释放`);
				} else if (state == -2) {
					UserTips.ins().showTips(`请先选择攻击目标`);
				} else if (state == -3) {
					UserTips.ins().showTips(`晕眩状态中，无法释放`);
				} else if (state == -4) {
					UserTips.ins().showTips(`冲刺状态中，无法释放`);
				} else {
					this.cleanPowerGuilderEff();
				}
				// UserSkill.ins().postHejiRemove();
				break;
			//测试1
			// case this.roleBtn:
			// 	// egret.log("57-1");
			// 	Millionaire.ins().sendMillionaireInfo();
			// 	break;
			// case this.furnaceBtn:
			// 	// egret.log("57-2");
			// 	Millionaire.ins().sendTurnDice();
			// 	break;
			// case this.taskBtn:
			// 	egret.log("请求激活升级突破部位2");
			// 	Weapons.ins().sendWeaponsUpLevel(0,2);
			// 	break;
			// case this.forgingBtn:
			// 	egret.log("请求激活升级突破部位3");
			// 	Weapons.ins().sendWeaponsUpLevel(0,3);
			// 	break;
			// case this.bagBtn:
			// 	egret.log("使用剑灵1");
			// 	Weapons.ins().sendWeaponsUse(0,1);
			// 	break;
			default:
				let index: number = this.navBtn.indexOf(e.currentTarget);
				if (this.navBtn[index].selected) {
					let win: IBaseView = this.openWindow(index);
					//如果打开不成功，则返回按钮选择状态
					if (!win) {
						this.navBtn[index].selected = false;
					}
				}
				else {
					this.closeWindow(index);
				}

				for (let i = 0; i < this.navBtn.length; i++) {
					if (index != i) {
						this.closeWindow(i);
					}
				}
				break;
		}
	}

	private useHejiSkill() {
		if (UserSkill.ins().hejiEnable && this.canClick) {

			let skill = UserSkill.ins().getHejiSkillId();
			let role = EntityManager.ins().getNoDieRole();
			if (!role) {
				return;
			}
			let tempArr = EntityManager.ins().screeningTargetByPos(role, false, skill.affectCount, skill.castRange);
			if (!tempArr || tempArr.length == 0) {
				return -1;
			}

			if (GameMap.fbType == UserFb.FB_TYPE_GUILD_WAR
				|| GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS
				|| GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS
				|| GameMap.fbType == UserFb.FB_TYPE_HOMEBOSS
				|| CityCC.ins().isCity
				|| GwBoss.ins().isGwBoss || GwBoss.ins().isGwTopBoss
				|| BattleCC.ins().isBattle() || PaoDianCC.ins().isPaoDian
			) {
				let handle = GameLogic.ins().currHandle;
				let entity = EntityManager.ins().getEntityByHandle(handle);
				if (!handle || !entity || (entity.infoModel.getAtt(AttributeType.atHp) <= 0)) {
					return -2;
				}
			}

			this.canClick = false;
			TimerManager.ins().doTimer(50, 1, this.setClickDelay, this);
			if (GameMap.fubenID != 0 && !GameMap.sceneInMine()) {
				let len: number = SubRoles.ins().subRolesLen;
				let charRole: CharRole;
				let isStraight: boolean = false;
				for (let i: number = 0; i < len; i++) {
					charRole = EntityManager.ins().getMainRole(i);
					if (charRole && charRole.infoModel && charRole.infoModel.getAtt(AttributeType.atHp) > 0) {
						break;
					}
				}

				//硬直状态不能使用必杀
				if (charRole.hasEffById(1)) {
					isStraight = true
				}

				if (isStraight || charRole.hasBuff(51001) || charRole.hasBuff(14001) || charRole.hasBuff(23001) || charRole.hasBuff(70001)) {
					// UserTips.ins().showTips(`晕眩状态中，不能使用必杀技能`);
					return -3;
				}

				if (charRole.action == EntityAction.FLY) {
					return -4;
				}

				UserSkill.ins().sendUseHejiSkill();
			} else {
				UserSkill.ins().fieldUse = true;
			}
		} else {

		}
	}

	private canClick: boolean = true;

	private setClickDelay(): void {
		this.canClick = true;
	}

	/**此函数用来兼容 navBind的在修改过程中的不同类型 */
	private openWindow(index: number): IBaseView {
		if (KFServerSys.ins().checkIsKFBattle(`跨服战场内，无法操作!`)) {
			return;
		}
		return ViewManager.ins().open(this.navBind[index]);
	}

	/**此函数用来兼容 navBind的在修改过程中的不同类型 */
	private closeWindow(index: number): void {
		ViewManager.ins().close(this.navBind[index]);
	}

	private expChange(exp?: number, force: boolean = false) {
		if (!force && (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS || GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN))
			return;

		if (!this.lastLevel) {
			this.lastLevel = Actor.level;
		}

		let isNew: boolean = this.flyExpLevel.length == 0;
		if (this.flyExpLevel.length) {
			this.flyExpLevel[this.flyExpLevel.length - 1][0] = Actor.level;
			this.flyExpLevel[this.flyExpLevel.length - 1][1] = Actor.exp;
		} else {
			this.flyExpLevel.push([Actor.level, Actor.exp]);
		}

		let newLv = this.flyExpLevel[0][0];
		let newExp = this.flyExpLevel[0][1];

		if (this.lastLevel < newLv) {
			if (!this.expBar['tween_count'] || isNew) {
				let maxExp = GlobalConfig.ExpConfig[this.lastLevel].exp;
				egret.Tween.removeTweens(this.expBar);
				let tween = egret.Tween.get(this.expBar);
				tween.to({ "value": this.expBar.maximum }, 300).wait(100).call(() => {
					this.expBar.maximum = maxExp;
					this.expBar.value = 0;
					this.lastLevel += 1;
					GameLogic.ins().postLevelBarChange(this.lastLevel);
					SoundUtil.ins().playEffect(SoundUtil.LEVEL_UP);
					this.expChange();
				}, this);
			}
		} else {
			egret.Tween.removeTweens(this.expBar);
			let maxExp: number = GlobalConfig.ExpConfig[newLv].exp;
			if (this.expBar.maximum != maxExp) {
				this.expBar.maximum = maxExp;
			}
			let tween: egret.Tween = egret.Tween.get(this.expBar);
			tween.to({ "value": newExp }, 400);
			this.flyExpLevel.shift();
		}
	}

	/**
	 * 设置某个导航栏到关闭状态
	 * @param index UIView2中的静态值
	 * */
	public closeNav(index: number): void {
		this.navBtn[index].selected = false;
	}

	private updateHuShen(model: EntityModel): void {
		// //如果是创建实体的协议触发的判断
		if (model && model.team != Team.My) return;

		let len: number = SubRoles.ins().subRolesLen;
		let role: Role;
		let value: number = 0;
		let total: number = 0;
		for (let i = 0; i < len; i++) {
			role = SubRoles.ins().getSubRoleByIndex(i);
			value += role.getAtt(AttributeType.atMp);
			total += role.getAtt(AttributeType.atMaxMp);
		}
		if (value > total)//差装备换好装备显示出现问题
			value = total;
			
		// 内功条遮罩
		DisplayUtils.drawCir(this.mpClipShape,50,269.9-value/total*359.8,true,-90);
	}

	private onBossAppear() {
		if (GameMap.fbType != UserFb.FB_TYPE_STORY)
			this.showEffectTips(`tishi_20_png`);
	}

	private onMonsterSpeak(tips) {
		this.showEffectTips(tips);
	}

	private onFightResult(result) {
		if (result) {
			this.showEffectTips(`pktishi_png`);
		} else {
			this.showEffectTips(`pktishi1_png`);
		}
	}

	private showEffectTips(tipsStr) {
		this.tips.source = tipsStr;
		egret.Tween.removeTweens(this.tips);
		this.tips.visible = true;
		this.tips.alpha = 1;
		egret.Tween.get(this.tips).wait(4000).to({ alpha: 0 }, 1000).call(() => {
			this.tips.visible = false;
		});

	}

	private readyUpdateHp(data: [CharMonster] | EntityModel) {
		if (!data) return;
		if (data instanceof EntityModel) {
			if (!data.isMy) return;
		}
		else {
			if (!data[0].isMy) return;
		}
		this.updateHp();
	}

	@callLater
	private updateHp(): void {
		let len: number = SubRoles.ins().subRolesLen;
		let value: number = 0;
		let total: number = 0;
		for (let i = 0; i < len; i++) {
			let role = SubRoles.ins().getSubRoleByIndex(i);
			if (role) {
				let curHp = role.getAtt(AttributeType.atHp) || 0;
				let maxHp = role.getAtt(AttributeType.atMaxHp) || 0;
				value += curHp;
				total += maxHp;
			}
		}
		let mask = this.hpBall.mask;
		// egret.log("******************************");
		// egret.log("value = "+value);
		// egret.log("total = "+total);
		// egret.log("修改前");
		// egret.log("mask.y = "+mask.y);
		// egret.log("mthis.hpLineMc.y = "+this.hpLineMc.y);
		if (value > total)//差装备换好装备显示出现问题
			value = total;
		mask.y = -32 + 86 * (1 - (value / total));
		// mask.y = -53 + 106 * (1 - 0.5);
		this.hpLineMc.y = mask.y + 36;
		// egret.log("修改后");
		// egret.log("mask.y = "+mask.y);
		// egret.log("mthis.hpLineMc.y = "+this.hpLineMc.y);
	}

	/**
	 * 神功升级特效
	 */
	private lilianUpgradeSuccess(soureArr: string[]) {
		let self = this;
		for (let i: number = 0; i < 3; i++) {
			let img: eui.Image = new eui.Image();
			img.source = soureArr[i];
			img.x = 261 + i * 63;
			img.y = 200;
			self.addChild(img);
			img.visible = false;
			let tween: egret.Tween = egret.Tween.get(img);
			tween.wait(130 * i).to({ visible: true }, 1).to({
				x: 326,
				y: 730
			}, 900).call(() => {
				self.removeChild(img);
			});
		}

	}

	/**
	 * 领取神功等级奖励成功
	 * @param soure
	 */
	private lilianGetRankSuccess(soure: string) {
		let self = this;
		let img: eui.Image = new eui.Image();
		img.source = soure;
		img.x = 260;
		img.y = 100;
		this.addChild(img);
		let tween: egret.Tween = egret.Tween.get(img);
		tween.to({ x: 326, y: 730 }, 1000).call(() => {
			self.removeChild(img);
		});

	}


	/**
	 * 抛物 - 任务奖励道具
	 */
	private runItem(): void {
		let data: AchievementData = UserTask.ins().taskTrace;
		let awardList: RewardData[] = UserTask.ins().getAchieveConfById(data.id).awardList;
		this.runStrat(awardList, 0);
	}


	/**
	 * 移动道具
	 * @param awardList
	 * @param index
	 */
	private runStrat(awardList: RewardData[], index: number): void {
		let str: string = "";
		if (awardList[index] == undefined) return;
		if (awardList[index].type == 0) {
			switch (awardList[index].id) {
				case MoneyConst.exp:
					str = "";
					break;
				case MoneyConst.gold:
					str = "icgoods117_png";
					break;
				case MoneyConst.yuanbao:
					str = "icgoods121_png";
					break;
			}
		} else {
			str = "" + awardList[index].id + "_png";
		}
		this.taskItemImg.visible = true;
		this.taskItemImg.source = str;

		let self = this;

		if (!this.tweenTaskObj) {
			this.tweenTaskObj = {
				get factor() {
					return 0;
				},
				set factor(value) {
					self.taskItemImg.x = (1 - value) * (1 - value) * 250 + 2 * value * (1 - value) * 380 + value * value * 426;
					self.taskItemImg.y = (1 - value) * (1 - value) * 730 + 2 * value * (1 - value) * 630 + value * value * 820;
				}
			}
		}

		egret.Tween.removeTweens(this.tweenTaskObj);
		let t: egret.Tween = egret.Tween.get(this.tweenTaskObj);
		t.to({ factor: 1 }, 400).call(() => {
			this.taskItemImg.visible = false;
			if (awardList.length > (++index)) {
				let roleData = SubRoles.ins().getSubRoleByIndex(0);
				if (awardList[index].job) {
					if (awardList[index].job == roleData.job) {
						this.runStrat(awardList, index);
					}
				} else {
					this.runStrat(awardList, index);
				}
			}
		}, this);
	}

	// public get factor(): number {
	// 	return 0;
	// }
	//
	// public set factor(value: number) {
	// 	// this.taskItemImg.x = (1 - value) * (1 - value) * 250 + 2 * value * (1 - value) * 380 + value * value * 426;
	// 	// this.taskItemImg.y = (1 - value) * (1 - value) * 730 + 2 * value * (1 - value) * 630 + value * value * 820;
	// }

	private setBagTips(result: number): void {
		this.groupBagTips.visible = result > 0;
		if (result) {
			if (result == 2) {
				this.tipsText.text = `有装备可以熔炼`;
			} else {
				this.tipsText.text = `背包将满，请熔炼`;
			}
		}
	}

	/** 背包道具使用红点 */
	private setIsExitUsedItem(result: number): void {
		this.isExitUsedItem = UserBag.ins().getIsExitUsedItem();
		this.setRedPiont();
	}

	/** 设置背包提示红点 */
	private setRedPiont(b?: boolean): void {
		if (b) {
			this.bagBtn['redPoint'].visible = b;
			return;
		}
		if (this.isExitUsedItem || this.isItemCountChange ||
			UserBag.ins().getItemCountByType(8) || UserBag.ins().getItemCountByType(12) || UserBag.ins().getRuneCountByType(8)
			|| (MergeCC.ins().isOpen() && MergeCC.ins().redPoint())) {
			this.bagBtn['redPoint'].visible = true;
		} else {
			this.bagBtn['redPoint'].visible = false;
		}
	}

	public publicBossRelive(params: Array<any>): void {
		let isShow: boolean = params[0];
		let bossName: string = params[1];
	}

	/**进度椭圆底图 */
	private resetHejiCd(): void {
		this.reset();
		DisplayUtils.removeFromParent(this.hjMc);
		// DisplayUtils.removeFromParent(this.hjMiddleMc);

		this._shap.graphics.clear();
		if (!TimerManager.ins().isExists(this.showAni, this)) TimerManager.ins().doTimer(500, 0, this.showAni, this);
		this.drawProgress(0);
	}


	private powerImg: eui.Image;
	private _shap: egret.Shape = new egret.Shape();

	public curRole: number;

	private _type: number;

	private radius: number = 0;
	private _curAngle: number = 0;
	private _toAngle: number = 0;
	private _oldAngle: number = 360;

	public reset(): void {
		this._curAngle = 0;
		this._toAngle = 0;
		this._oldAngle = 360;
		UserSkill.ins().hejiEnable = false;
		UserSkill.ins().fieldUse = false;
		this.radius = (this.powerGroup.width >> 1) + 2;
	}

	private showAni(): void {
		let skill = UserSkill.ins().getHejiSkillId();
		let cdPercent: number = 1 - (UserSkill.ins().hejiCD - GameServer.serverTime) / (skill.cd - UserSkill.ins().reduceCD);
		let count = 360 * cdPercent;
		this.drawProgress(count);
	}


	public drawProgress(toPos: number, isTween: boolean = true): void {

		let total: number = 360;
		if (toPos > total) { toPos = total; }

		if (toPos < 0) toPos = 0;

		if (toPos == 0 || toPos == total) {
			if (toPos == total) {
				UserSkill.ins().hejiEnable = true;
				this.addAutoUse();
				this.addPowerEff();
			}
			return;
		}

		this.removeAutoUse();
		let mask = this.circleImg.mask;
		mask.y = -44 + 90 * (1 - (toPos / total));
	}

	private addPowerEff() {
		if (this.hjMc && this.hjMc.parent) return;
		this.hjMc.playFile(RES_DIR_EFF + "hejibtn", -1);
		this.hjGrp.addChild(this.hjMc);
		this.powerGuilderEff();
		// this.hjMiddleMc.playFile(RES_DIR_EFF + "hejibtneff", -1);
		// this.powerGroup.addChild(this.hjMiddleMc);
	}

	//必杀引导指向
	private arrow: GuideArrow;
	private eff: MovieClip;
	private eff2: MovieClip;
	private guilderMap: number[] = [1203,1205];

	private powerGuilderEff() {
		if (UserFb.ins().guanqiaID > 5) {
			this.cleanPowerGuilderEff();
			return;
		}
		if (!UserFb.ins().pkGqboss && !(GameMap.fbType == UserFb.FB_TYPE_STORY && this.guilderMap.indexOf(GameMap.mapID)!=-1)) {
			this.cleanPowerGuilderEff();
			return;
		}
		if (this.backBtnGroup.visible) return;
		if (!this.arrow) {
			this.arrow = new GuideArrow;
			this.arrow.touchEnabled = false;
			this.arrow.lab.text = "点击释放必杀";
			this.guideGroup.addChild(this.arrow);
			this.arrow.x = 0
			this.arrow.y = this.powerGroup.height / 2;

			if (!this.eff) {
				this.eff = new MovieClip;
				this.eff.playFile(RES_DIR_EFF + "guideff", -1);
				this.hjGrp.addChild(this.eff);
				this.eff.x = this.hjGrp.width / 2;
				this.eff.y = this.hjGrp.height / 2;
			}

			if (!this.eff2) {
				this.eff2 = new MovieClip;
				this.eff2.playFile(RES_DIR_EFF + "forceguildeff", -1);
				this.eff2.scaleX = this.eff2.scaleY = 3.3;
				this.hjGrp.addChild(this.eff2);
				this.eff2.x = this.hjGrp.width / 2;
				this.eff2.y = this.hjGrp.height / 2;
			}

			let self = this;
			egret.Tween.get(this.arrow, { loop: true }).to({ x: this.arrow.x + 40 }, 1000).to({ x: this.arrow.x }, 1000);
			egret.Tween.get(this.powerGroup, { loop: false }).wait(5000).call(() => {
				self.cleanPowerGuilderEff();
			});
		}
	}

	private cleanPowerGuilderEff() {
		if (this.arrow)
			egret.Tween.removeTweens(this.arrow);
		if (this.eff)
			egret.Tween.removeTweens(this.eff);
		if (this.eff2)
			egret.Tween.removeTweens(this.eff2);
		DisplayUtils.removeFromParent(this.arrow);
		DisplayUtils.removeFromParent(this.eff);
		DisplayUtils.removeFromParent(this.eff2);
		this.arrow = null;
		this.eff = null;
		this.eff2 = null;
	}

	private addAutoUse() {
		// TimerManager.ins().remove(this.showAni, this);
		if (UserSkill.ins().hejiEnable && this.checkIsAutoUse()) {
			if (!TimerManager.ins().isExists(this.autoUseHeji, this)) {
				TimerManager.ins().doTimer(400, 0, this.autoUseHeji, this);
			}
		}
	}

	//是否自动释放必杀
	private checkIsAutoUse() {
		//自动合击第一判断逻辑
		if (GameMap.autoPunch()) {
			let handle = GameLogic.ins().currHandle;
			let entity = EntityManager.ins().getEntityByHandle(handle);
			if (!entity || entity.infoModel.type == EntityType.CollectionMonst)return false;
			return Setting.ins().getValue(ClientSet.autoHeji);
		}

		return SysSetting.ins().getBool(SysSetting.AUTO_HEJI) &&
			(GameMap.fbType != UserFb.FB_TYPE_HOMEBOSS &&
				GameMap.fbType != UserFb.FB_TYPE_NEW_WORLD_BOSS &&
				GameMap.fbType != UserFb.FB_TYPE_ALLHUMENBOSS &&
				GameMap.fbType != UserFb.FB_TYPE_ZHUANSHENGBOSS &&
				GameMap.fbType != UserFb.FB_TYPE_GUILD_WAR &&
				!CityCC.ins().isCity && !BattleCC.ins().isBattle() && !PaoDianCC.ins().isPaoDian &&
				!GwBoss.ins().isGwBoss && !GwBoss.ins().isGwTopBoss
			);
	}

	private removeAutoUse() {
		TimerManager.ins().remove(this.autoUseHeji, this);
	}

	private autoUseHeji() {
		this.useHejiSkill();
	}

	public get curAngle(): number {
		return this._curAngle;
	}

	public set curAngle(value: number) {
		this._curAngle = value;
		DisplayUtils.drawCir(this._shap, this.radius, this._curAngle);
	}

	private jingMaiCanUp(): boolean {
		let data: JingMaiData;
		for (let i in SubRoles.ins().roles) {
			data = SubRoles.ins().roles[i].jingMaiData;
			if (data.jingMaiCanUp()) {
				let openLevel = GlobalConfig.JingMaiCommonConfig.openLevel;
				if (Actor.level >= openLevel)
					return true;
			}

		}
		return false;
	}

	public getToggleBtn(index: number): eui.ToggleButton {
		this.validateNow();
		return this.navBtn[index];
	}

	private lilianRewardFlash(source: string[]): void {
		let self = this;
		let len: number = source.length;
		let stageX: number = StageUtils.ins().getWidth() / 2 - 290;
		for (let i: number = 0; i < len; i++) {
			let img: eui.Image = new eui.Image();
			img.source = source[i];
			img.x = 74 + i * 91 + stageX;
			img.y = 260;
			self.addChild(img);
			img.visible = false;
			img.scaleX = img.scaleY = 1;
			let tween: egret.Tween = egret.Tween.get(img);
			tween.wait(130 * i).to({ visible: true }, 1).to({
				x: 441 + stageX,
				y: 872,
				scaleX: 0.6,
				scaleY: 0.6
			}, 900).call(() => {
				self.removeChild(img);
			});
		}
	}

	private startUpdateRedPoint(): void {
		TimerManager.ins().remove(this.updateRedPoint, this);
		TimerManager.ins().doTimer(50, 1, this.updateRedPoint, this);
	}

	/** 更新技能提示红点 */
	private updateRedPoint(): void {
		let b = false;
		if (UserFb.ins().guanqiaID > 2 && (this.and(UserSkill.ins().canGrewupSkill()) || NeiGongModel.ins().canUp() ||NeiGongModel.ins().checkRedPoint() || this.jingMaiCanUp()))
			b = true;
		if (!b)
			b = UserMiji.ins().isMjiSum();
		// if (!b)
		// 	b = ZhanLing.ins().checkRedPoint();
		this.furnaceBtn['redPoint'].visible = b;
	}

	private and(list): boolean {
		for (let k in list) {
			if (list[k] == true)
				return true;
		}
		return false;
	}

	public getBagBtn() {
		return this.bagBtn;
	}

	private flyGQBossExpToBar([target, value]: [CharMonster, number]) {
		if (GameMap.fbType || value > 0) return;

		let movieExp: eui.Image = new eui.Image();
		movieExp.source = "point2";
		movieExp.anchorOffsetX = 20;
		movieExp.anchorOffsetY = 20;

		movieExp.x = 100;
		movieExp.y = 100;
		this.addChild(movieExp);
		let _x: number = Math.ceil(StageUtils.ins().getWidth() / 2);
		let _y: number = Math.ceil(StageUtils.ins().getHeight()) + 60;

		let t: egret.Tween = egret.Tween.get(movieExp);
		t.to({ x: _x, y: _y, alpha: 0.5 }, 800).call(() => {
			this.removeChild(movieExp);
			egret.Tween.removeTweens(movieExp);
		}, this);

		let tt: egret.Tween = egret.Tween.get(movieExp, { "loop": true });
		tt.to({ "rotation": movieExp.rotation + 360 }, 800);
	}

	private flyExpToBar([from, count, delay]: [XY, number, number]) {
		let point = this.globalToLocal(from.x, from.y);

		let _x: number = this.expBar.x + Math.ceil(StageUtils.ins().getWidth() / 2) - 260;
		let _y: number = this.expBar.y;
		let endPoint = new egret.Point(_x, _y);

		for (let i = 0; i < count; i++) {

			let center = egret.Point.interpolate(point, endPoint, MathUtils.limit(0.2, 0.8));
			center.x += MathUtils.limitInteger(-100, 100);
			center.y += MathUtils.limitInteger(-100, 100);

			let movieExp: eui.Image = new eui.Image();
			movieExp.source = "point2";
			movieExp.anchorOffsetX = 20;
			movieExp.anchorOffsetY = 20;

			movieExp.x = point.x;
			movieExp.y = point.y;

			this.addChild(movieExp);

			let bezier = Bezier.pop(point, endPoint);
			bezier.display = movieExp;
			bezier.centerPoint = center;
			bezier.start(1000, () => {
				Bezier.push(bezier);

				this.removeChild(movieExp);
				egret.Tween.removeTweens(movieExp);
				if (!i) this.expChange(0, true);
			}, this, i * delay);

			egret.Tween.get(movieExp).to({ alpha: 0.5 }, 1000);

			let tt: egret.Tween = egret.Tween.get(movieExp, { "loop": true });
			tt.to({ "rotation": movieExp.rotation + 360 }, 500);
		}
	}

	private flyItemToBag(item: CharItem2): void {
		if (item && item.parent && !ViewManager.ins().hasTopView()) {
			let p1 = item.parent.localToGlobal(item.x, item.y);
			let p2 = this.bagBtn.parent.localToGlobal(this.bagBtn.x + this.bagBtn.width / 2, this.bagBtn.y + this.bagBtn.height / 2);
			this.globalToLocal(p2.x,p2.y,p2);
			DisplayUtils.removeFromParent(item);
			item.reset();
			item.setItemParent(this);
			item.x = p1.x;
			item.y = p1.y;

			egret.Tween.get(item).to({ x: p2.x, y: p2.y }, 1700, egret.Ease.sineOut).call(() => {
				DisplayUtils.removeFromParent(item);
				item.destruct();
				ObjectPool.push(item);
			});
		} else {
			DisplayUtils.removeFromParent(item);
			ObjectPool.push(item);
		}
	}

	private flyItemToBagEx(item: egret.DisplayObject): void {
		if (item.parent) {
			let p1 = item.parent.localToGlobal(item.x, item.y);
			let p2 = this.bagBtn.parent.localToGlobal(this.bagBtn.x + this.bagBtn.width / 2 - item.width / 4, this.bagBtn.y + this.bagBtn.height / 2 - item.width / 4);
			this.globalToLocal(p2.x,p2.y,p2);
			DisplayUtils.removeFromParent(item);

			item.x = p1.x;
			item.y = p1.y;
			this.addChild(item);

			egret.Tween.get(item).to({ x: p2.x, y: p2.y }, 1700, egret.Ease.sineOut).call(() => {
				DisplayUtils.removeFromParent(item);
			});
		} else {
			DisplayUtils.removeFromParent(item);
		}

	}


	public playUIEff(...param: any[]): void {

	}

	//是否隐藏所有主按钮
	public isHideNavBtn(boo: boolean): void {
		for (let btn of this.navBtn) {
			btn.visible = boo;
		}
		this.expBar.visible = boo;
	}

}

ViewManager.ins().reg(UIView2, LayerManager.UI_Popup);
