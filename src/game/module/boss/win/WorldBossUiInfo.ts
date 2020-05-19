class WorldBossUiInfo extends BaseEuiView {
	public lastTime: eui.Label;

	public list1: eui.List;
	public list2: eui.List;

	public btn: eui.ToggleButton;

	private clickEffc: MovieClip;
	private nextEff: MovieClip;
	private pointEff: MovieClip;

	/** boss名字 */
	public nameTxt: eui.Label;
	/** boss头像 */
	public head: eui.Image;
	/** boss血量 */
	public bloodBar: eui.ProgressBar;
	/** boss等级 */
	public lvTxt: eui.Label;

	public bossConfig: MonstersConfig;

	/**护盾 */
	public hudun: eui.Group;
	public hudunbloodBar: eui.ProgressBar;

	/**复活group */
	public cd: eui.Group;
	public timeLable: eui.Label;
	public see: eui.Group;
	// public autoClear: eui.CheckBox;


	private leftTimeGroup: eui.Group;

	private remainM: number;

	private attackPlayer: BossUIBtnItem;

	private attackBoss: BossUIBtnItem;

	private attguishu: eui.Button;

	private belongGroup: eui.Group;

	private belongNameTxt: eui.Label;

	private roleHead: eui.Image;
	private bloodBar0: eui.ProgressBar;
	private neigongBar0: eui.ProgressBar;

	private bossBloodGroup: eui.Group;

	private grayImg: eui.Image;
	private grayImgMask: egret.Rectangle;
	private GRAYIMG_WIDTH: number = 0;

	private attackGroup: eui.Group;
	private beAttackGroup: eui.Group;
	private attEffectGroup: eui.Group;

	private endGroup: eui.Group;
	private leftTime: eui.Label;
	private winnerName: eui.Label;

	private attackBtnGroup: eui.Group;
	private attList: eui.Group;
	private tipBtn: eui.Button;

	private _curMonsterID: number = 0;

	public initUI(): void {
		super.initUI();
		this.skinName = "WorldBossUiSkin";

		this.clickEffc = new MovieClip;
		this.clickEffc.x = 630;
		this.clickEffc.y = 269;


		this.pointEff = new MovieClip;
		this.pointEff.x = 110;
		this.pointEff.y = 510;

		this.list1.itemRenderer = WorldBossHeadRender;
		this.list2.itemRenderer = WorldBossHeadRender;

		this.bloodBar.slideDuration = 0;
		this.bloodBar0.labelFunction = (value, maximum): string => {
			return '';
		}

		// this.grayImg.source = "bosshp2";
		// this.grayImgMask = new egret.Rectangle(0, 0, this.grayImg.width, this.grayImg.height);
		// this.grayImg.mask = this.grayImgMask;
		//this.GRAYIMG_WIDTH = this.grayImg.width;
		//灰色血条最大宽度取boss血条宽度
		this.GRAYIMG_WIDTH = this.bloodBar.width;
	}

	public open(...param: any[]): void {
		this.hudun.visible = false;
		this.visible = true;
		this.attList.visible = this.attackBtnGroup.visible = (true && UserBoss.ins().winner == "");
		// this.observe(GameLogic.ins().postEnterMap, this.refushShowInfo);
		this.observe(UserBoss.ins().postHasAttackChange, this.refushWeixieList);
		this.observe(UserBoss.ins().postCanplayChange, this.refushcanPlayList);
		this.observe(UserBoss.ins().postHpChange, this.reflashBlood);
		this.observe(UserBoss.ins().postShieldPer, this.huDunChange);
		this.observe(UserBoss.ins().postRemainTime, this.reliveInfoChange);
		this.observe(UserBoss.ins().postWorldBossEndTime, this.worldBossEnd);
		// this.observe(GameLogic.ins().postChangeAttrPoint, this.refushcanPlayList);
		this.observe(GameLogic.ins().postChangeTarget, this.refushcanPlayList);
		// this.list1.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.list1Tap, this);
		this.list2.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.list2Tap, this);
		this.addTouchEvent(this.btn, this.onTap);
		// this.attackBoss.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.attackPlayer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.addEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);
		this.addTouchEvent(this.attackBoss, this.onTap);
		this.addTouchEvent(this.attackPlayer, this.onTap);
		this.addTouchEvent(this.belongGroup, this.onTap)
		this.addTouchEvent(this.tipBtn, this.onTap);
		this.addTouchEvent(this.attguishu, this.onTap);
		TimerManager.ins().doTimer(200, 0, this.reflashAtkInfo, this);

		// this.attackBoss.anchorOffsetX = this.attackBoss.width/2;
		// this.attackBoss.anchorOffsetY = this.attackBoss.height/2;
		// this.attackPlayer.anchorOffsetX = this.attackPlayer.width/2;
		// this.attackPlayer.anchorOffsetY = this.attackPlayer.height/2;
		this.updateBaseInfo();
		this.refushShowInfo();
		this.reflashAtkInfo();
		this.refushWeixieList();
		this.refushcanPlayList();
		this.reflashBlood();
	}

	private updateBaseInfo() {
		this.bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
		if (!this.bossConfig) {
			return;
		}
		this._curMonsterID = UserBoss.ins().monsterID;

		this.nameTxt.text = this.bossConfig.name;
		this.head.source = `monhead${this.bossConfig.head}_png`;
		this.lvTxt.text = `Lv.${this.bossConfig.level}`;
	}

	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().removeAll(this);
		DisplayUtils.removeFromParent(this.clickEffc);
		DisplayUtils.removeFromParent(this.nextEff);
		DisplayUtils.removeFromParent(this.pointEff);
		// this.list1.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.list1Tap, this);
		this.list2.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.list2Tap, this);
		this.removeTouchEvent(this.btn, this.onTap);
		this.removeTouchEvent(this.attackBoss, this.onTap);
		this.removeTouchEvent(this.attackPlayer, this.onTap);
		this.removeTouchEvent(this.belongGroup, this.onTap);
		this.removeTouchEvent(this.attguishu, this.onTap);
		// this.attackPlayer.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.attackBoss.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		// this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);
		this.clearRendererItem();
		this._curMonsterID = 0;
	}

	private refushShowInfo(): void {
		// if(!this.parent) return;
		this.leftTimeGroup.visible = false;
		this.lastTime.text = DateUtils.getFormatTimeByStyle(GuildWar.ins().getModel().acEndTime, DateUtils.STYLE_4);
		if (!TimerManager.ins().isExists(this.showInfoTime, this)) TimerManager.ins().doTimer(1000, GuildWar.ins().getModel().acEndTime, this.showInfoTime, this);
	}

	private showInfoTime() {
		this.lastTime.text = DateUtils.getFormatTimeByStyle(GuildWar.ins().getModel().acEndTime, DateUtils.STYLE_4);
	}

	/**显示世界boss所打的当前handle */
	private reflashAtkInfo(): void {
		let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(UserBoss.ins().attHandle, EntityType.Role);
		if (roleList && roleList.length > 0) {
			let len = roleList.length
			let hpValue: number = 0;
			let hpTotal: number = 0;

			let neigongValue: number = 0;
			let neigongTotal: number = 0;
			let mainRoleInfo: Role;
			for (let i = 0; i < len; i++) {
				let role = roleList[i]
				if (role) {
					let curHp = role.infoModel.getAtt(AttributeType.atHp) || 0;
					let maxHp = role.infoModel.getAtt(AttributeType.atMaxHp) || 0;
					hpValue += curHp;
					hpTotal += maxHp;

					// console.log("index:"+i+",curHp:"+curHp+",maxHp:"+maxHp);

					let curNeigong = role.infoModel.getAtt(AttributeType.cruNeiGong) || 0;
					let maxNeigong = role.infoModel.getAtt(AttributeType.maxNeiGong) || 0;
					neigongValue += curNeigong;
					neigongTotal += maxNeigong;
					if (i == 0) {
						mainRoleInfo = <Role>role.infoModel;
					}
				}
			}

			this.belongGroup.visible = (hpValue > 0 && UserBoss.ins().winner == "");
			let color: number = Actor.handle != UserBoss.ins().attHandle ? ColorUtil.ROLENAME_COLOR_YELLOW : ColorUtil.ROLENAME_COLOR_GREEN;
			let tname: string = mainRoleInfo.name;
			let strlist = tname.split("\n");
			if (strlist[1])
				tname = strlist[1];
			else
				tname = strlist[0];

			tname = StringUtils.replaceStr(tname, "0xffffff", color + "");
			this.belongNameTxt.textFlow = TextFlowMaker.generateTextFlow(`|C:${color}&T:${tname}`);
			// let info: Role = <Role>roleList[0].infoModel;
			// this.roleHead.source = `yuanhead${mainRoleInfo.job}${mainRoleInfo.sex}`;
			this.roleHead.source = `main_role_head${mainRoleInfo.job}`
			this.bloodBar0.maximum = hpTotal;
			this.bloodBar0.value = hpValue;

			this.neigongBar0.maximum = neigongTotal;
			this.neigongBar0.value = neigongValue;
		} else {
			this.belongGroup.visible = false;
		}
	}

	private lastWeixieList: number[] = [];

	private refushWeixieList(refushPlayList: number = 0): void {
		if (UserBoss.ins().weixieList.length > this.lastWeixieList.length) {
			this.showAttGroupEff();
		}
		this.list2.dataProvider = new eui.ArrayCollection(UserBoss.ins().weixieList);
		this.list2.validateNow();
		this.lastWeixieList = UserBoss.ins().weixieList.slice();
		this.list1.dataProvider = new eui.ArrayCollection([GameLogic.ins().currAttackHandle]);
		this.checkListVis();
		if (UserBoss.ins().weixieList.length) {
			this.checkGuide();
		}
	}

	private showAttGroupEff(): void {
		if (!this.attEffectGroup.visible) {
			this.attEffectGroup.touchEnabled = false;
			this.attEffectGroup.visible = true;
			let t: egret.Tween = egret.Tween.get(this.attEffectGroup);
			t.to({ "alpha": 1 }, 500).to({ "alpha": 0 }, 500).to({ "alpha": 1 }, 500).to({ "alpha": 0 }, 500).call(() => {
				this.attEffectGroup.visible = false;
			}, this);
		}
	}

	private refushcanPlayList(): void {
		this.reflashAtkInfo();
		this.checkListVis();
		this.refushWeixieList();
	}

	private checkListVis(): void {
		let role = EntityManager.ins().getNoDieRole();
		let bool = ((role && role.infoModel.getAtt(AttributeType.atHp) > 0) && UserBoss.ins().winner == "");

		this.beAttackGroup.visible = UserBoss.ins().weixieList.length > 0 && bool;
		this.attackGroup.visible = bool;

		this.setBtnState(bool);
	}

	private checkGuide() {
		if (UserFb.ins().guideBossKill == 1) {
			GuideUtils.ins().updateByAppear();
		}
	}

	private setBtnState(bool: boolean): void {
		this.attguishu.visible = true;
		if (!bool) {
			this.attackPlayer.data = "attgsup";
			this.attackBoss.data = "attbossup";
			// this.attackPlayer.currentState = "attgsup"
			// this.attackBoss.currentState = "attbossup";
			return
		}

		if (UserBoss.ins().attHandle == Actor.handle) {
			this.attackPlayer.data = "attgsdis";
			// this.attackPlayer.currentState = "attgsdis";
			this.attguishu.visible = false;
		} else {
			// if (UserBoss.ins().canPlayList.length > 0) {
			if (GameLogic.ins().currAttackHandle) {
				this.attackPlayer.data = "attgsing";
				// this.attackPlayer.currentState = "attgsing";
			} else {
				this.attackPlayer.data = "attgsup";
				// this.attackPlayer.currentState = "attgsup";
			}
		}

		if (GameLogic.ins().currAttackHandle || this.attackPlayer.currentState == "attgsing") {
			this.attackBoss.data = "attbossup";
			// this.attackBoss.currentState = "attbossup";
		} else {
			this.attackBoss.data = "attbossing";
			// this.attackBoss.currentState = "attbossing";
		}
	}

	private onBegin(e: egret.TouchEvent) {
		switch (e.currentTarget) {
			case this.attackPlayer:
				this.attackPlayer.scaleX = this.attackPlayer.scaleY = 0.8;
				break;
			case this.attackBoss:
				this.attackBoss.scaleX = this.attackBoss.scaleY = 0.8;
				break;
		}

	}
	private onEnd(e: egret.TouchEvent) {
		switch (e.currentTarget) {
			case this.attackPlayer:
				this.attackPlayer.scaleX = this.attackPlayer.scaleY = 1;
				break;
			case this.attackBoss:
				this.attackBoss.scaleX = this.attackBoss.scaleY = 1;
				break;
			default:
				this.attackPlayer.scaleX = this.attackPlayer.scaleY = 1;
				this.attackBoss.scaleX = this.attackBoss.scaleY = 1;
				break;
		}
	}
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.btn:
				if (this.btn.currentState == "down") {
					this.list1.dataProvider = new eui.ArrayCollection([]);
				} else {
					this.refushcanPlayList();
				}
				break;
			case this.attackBoss:
				if (GameLogic.ins().currAttackHandle == 0) {
					return;
				}
				this.clearRendererItem();
				GameLogic.ins().postChangeAttrPoint(0);
				break;
			case this.attackPlayer:
			case this.belongGroup:
				if (UserBoss.ins().attHandle == Actor.handle || UserBoss.ins().attHandle == GameLogic.ins().currAttackHandle) {
					return;
				}
				if (!this.list1 || this.list1.dataProvider.length <= 0) return;
				if (!UserBoss.ins().canClick) {
					return;
				}
				this.clearRendererItem();
				if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
					UserFb.ins().sendGuideFbAttacker();
				} else {
					GameLogic.ins().postChangeAttrPoint(UserBoss.ins().attHandle);
				}
				break;
			case this.tipBtn:
				if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS) {
					ViewManager.ins().open(WorldBossJiangliTipWin);
				} else {
					ViewManager.ins().open(PublicBossJiangliTipWin);
				}
				break;
			case this.attguishu:
				UserTips.ins().showTips("正在攻击归属者！");
				break
		}
	}

	private list2Tap(e: eui.ItemTapEvent): void {
		//点击间隔
		if (!UserBoss.ins().canClick || UserBoss.ins().attHandle == GameLogic.ins().currAttackHandle) {
			return;
		}
		let item: WorldBossHeadRender = <WorldBossHeadRender>this.list2.getChildAt(e.itemIndex) as WorldBossHeadRender;
		if (!item) return;
		// item.addAttEffect();
		this.clearRendererItem();
		item.addAttEffect();
		if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
			UserFb.ins().sendGuideFbAttacker();
		} else {
			GameLogic.ins().postChangeAttrPoint(item.data);
		}

		if (!(UserBoss.ins().attHandle == item.data))
			EntityManager.ins().showHideSomeOne(item.data);
	}

	private clearRendererItem(): void {
		let len: number = this.list1.numChildren;
		for (let index: number = 0; index < len; index++) {
			let item: WorldBossHeadRender = this.list1.getChildAt(index) as WorldBossHeadRender;
			item.clearEffect();
		}
		len = this.list2.numChildren;
		for (let index: number = 0; index < len; index++) {
			let item: WorldBossHeadRender = this.list2.getChildAt(index) as WorldBossHeadRender;
			item.clearEffect();
		}
	}

	private reflashBlood(): void {
		if (this._curMonsterID != UserBoss.ins().monsterID) {
			this.updateBaseInfo();
		}

		this.bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
		if (!this.bossConfig) {
			this.bossBloodGroup.visible = false;
			this.checkListVis();
			return;
		}
		let charm: CharMonster = <CharMonster>EntityManager.ins().getEntityByHandle(UserBoss.ins().bossHandler);
		if (!charm || !charm.infoModel) {
			this.bossBloodGroup.visible = false;
			this.checkListVis();
			return;
		}
		let monstermodel: EntityModel = charm ? charm.infoModel : null;
		if (monstermodel) {
			this.bloodBar.maximum = monstermodel.getAtt(AttributeType.atMaxHp);
			this.bloodBar.value = monstermodel.getAtt(AttributeType.atHp);
			this.bossBloodGroup.visible = this.bloodBar.value > 0;
		} else {
			this.bloodBar.maximum = this.bossConfig.hp;
			this.bloodBar.value = this.bossConfig.hp;
			this.bossBloodGroup.visible = this.bloodBar.value > 0;
		}
		this.curValue = Math.floor(this.bloodBar.value / this.bloodBar.maximum * 100);
		this.tweenBlood();
	}

	public huDunChange(): void {
		if (UserBoss.ins().shieldType) {
			if (UserBoss.ins().curShield > 0) {
				if (!TimerManager.ins().isExists(this.setTimeShieldChange, this)) TimerManager.ins().doTimer(1000, 0, this.setTimeShieldChange, this);
				this.setTimeShieldChange();
			}
		} else {
			this.setHpShieldChange()
		}
	}

	private setHpShieldChange(): void {
		if (UserBoss.ins().curShield && UserBoss.ins().curShield > 0) {
			this.hudun.visible = true;
			let value: number = Math.ceil(UserBoss.ins().curShield / UserBoss.ins().totalShield * 100);
			this.hudunbloodBar.value = value;
		} else {
			this.hudun.visible = false;
		}
	}

	private setTimeShieldChange(): void {
		this.hudunbloodBar.value = UserBoss.ins().curShield;
		this.hudunbloodBar.maximum = UserBoss.ins().totalShield;
		if (UserBoss.ins().curShield > 0) {
			this.hudun.visible = true;
		} else {
			TimerManager.ins().remove(this.setTimeShieldChange, this);
			this.hudun.visible = false;
		}
		UserBoss.ins().curShield--;
	}

	private worldBossEnd(): void {
		// if (GameMap.fbType != UserFb.FB_TYPE_ZHUANSHENGBOSS) return;
		TimerManager.ins().remove(this.reflashAtkInfo, this);

		if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS) {
			this.endGroup.visible = true;
			this.winnerName.text = `最终归属者是：${UserBoss.ins().winner}`;
			let time: number = Math.ceil((UserBoss.ins().worldBossEndTime - egret.getTimer()) / 1000);
			this.leftTime.text = DateUtils.getFormatTimeByStyle(time, DateUtils.STYLE_4);
			TimerManager.ins().doTimer(1000, time, () => {
				time--;
				this.leftTime.text = DateUtils.getFormatTimeByStyle(time, DateUtils.STYLE_4);
				if (time == 0) {
					UserFb.ins().sendExitFb();
				}
			}, this);
		}

		this.attList.visible = this.attackBtnGroup.visible = this.attackPlayer.visible = this.attackBoss.visible = false;
	}

	private reliveInfoChange(): void {
		if (UserBoss.ins().reliveTime > 0) {
			ViewManager.ins().open(WorldBossBeKillWin);
		} else {
			ViewManager.ins().close(WorldBossBeKillWin);
		}
		this.refushWeixieList();
	}

	private curValue: number = 1;

	private tweenBlood(): void {
		//缓动灰色血条
		let bloodPer = (this.curValue * this.GRAYIMG_WIDTH) / 100;
		//boss血条宽度减少12以上，灰色血条才开始缓动
		let bloodDif = this.GRAYIMG_WIDTH - bloodPer;
		if (bloodDif <= 12) return;
		let self = this;
		egret.Tween.removeTweens(this.grayImg);
		if (bloodPer < 3) return;
		let t = egret.Tween.get(this.grayImg);
		t.to({ "width": bloodPer }, 1000).call(function (): void {
			if (bloodPer <= 0) {
				self.grayImg.width = 0;
				egret.Tween.removeTweens(this.grayImg);
			}
		}, self);
	}
}
ViewManager.ins().reg(WorldBossUiInfo, LayerManager.UI_Main);