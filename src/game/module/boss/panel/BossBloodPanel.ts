
class BossBloodPanel extends BaseEuiView {

	public myTxt: eui.Label;
	/** boss名字 */
	public nameTxt: eui.Label;
	/** boss头像 */
	public head: eui.Image;
	/** boss血量 */
	public bloodBar: eui.ProgressBar;
	/** boss等级 */
	// public lvTxt: eui.Label;
	public tipBtn0: eui.Button;

	/**护盾 */
	public hudun: eui.Group;
	public hudunbloodBar: eui.ProgressBar;

	//查看奖励的按钮
	private seeRewardBtn: eui.Button;

	/**复活group */
	public cd: eui.Group;
	public clearBtn: eui.Button;
	public timeLable: eui.Label;
	public autoClear: eui.CheckBox;
	public see: eui.Group;

	public dropDown: DropDown;
	public clearRole: eui.CheckBox;
	private clearSelect: boolean;

	private targetNow: BossTargetInfo;

	private remainM: number;

	private grayImg: eui.Image;
	// private grayImgMask: egret.Rectangle;
	private static GRAYIMG_WIDTH: number = 0;
	private barGroup: eui.Group;
	private currewards: BossRewardsItem;
	private proLab: eui.Label;

	private _curMonsterID:number = 0;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "BossBloodSkin";
		this.bloodBar.slideDuration = 0;

		// this.grayImg.source = "bosshp2";
		// this.grayImg.alpha = 0.5;
		// this.grayImgMask = new egret.Rectangle(0, 0, this.grayImg.width, this.grayImg.height);
		// this.grayImg.mask = this.grayImgMask;
		//BossBloodPanel.GRAYIMG_WIDTH = this.grayImg.width;
		//灰色血条最大宽度取boss血条宽度
		BossBloodPanel.GRAYIMG_WIDTH = this.bloodBar.width;
		this.see.visible = false;

		this.hudunbloodBar.value = 100;
		this.hudunbloodBar.maximum = 100;
	}

	public open(...param: any[]): void {
		this.myTxt.text = `自己：`;
		this.dropDown.setEnabled(false);
		this.hudun.visible = false;

		//主城boss多一个奖励tip按钮
		this.tipBtn0.visible = this.checkShowSeeAwardBtn();

		let dataArr: WorldBossRankItemData[] = UserBoss.ins().rank.concat();
		let len: number = dataArr.length;
		if (len) {
			if (len > 10) {
				len = 10;
			}
			let showArr: WorldBossRankItemData[] = dataArr.slice(1, len);
			this.dropDown.setData(new eui.ArrayCollection(showArr));
			this.dropDown.setLabel(dataArr[0].name);
		}
		else {
			this.dropDown.setData(new eui.ArrayCollection([]));
			this.dropDown.setLabel('');
		}

		len = dataArr.length;
		let id: number = Actor.actorID;
		for (let i = 0; i < len; i++) {
			if (dataArr[i].id == id) {
				this.myTxt.text = `自己:${CommonUtils.overLength(dataArr[i].value)}`;
				break;
			}
		}
		this.observe(CityCC.ins().postHudunPoint, this.huDunChange);
		this.observe(HefuBossCC.ins().postHudunPoint, this.huDunChange);
		this.observe(ZsBoss.ins().postHudunPoint, this.huDunChange);
		this.observe(UserBoss.ins().postShieldPer, this.huDunChange);
		this.addTouchEvent(this.seeRewardBtn, this.onTap);
		this.addChangeEvent(this.clearRole, this.autoClearChange);
		this.addTouchEvent(this.clearBtn, this.onTap);
		this.addTouchEvent(this.tipBtn0, this.onTap);


		this.huDunChange();
		this.clearRole.selected = ZsBoss.ins().clearOther;

		this.checkIsShowFbInfo();
		this.showCurRewards();

		let config: MonstersConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
		if(config) {
			this.updateBaseInfo();
			this.guildFBInfo(config);
		}
	}

	private checkShowSeeAwardBtn():boolean {
		return CityCC.ins().isCity || GwBoss.ins().isGwBoss || GwBoss.ins().isGwTopBoss || HefuBossCC.ins().isInHefuBoss;
	}

	private updateBaseInfo(){
		if(this._curMonsterID == UserBoss.ins().monsterID) return;
		this._curMonsterID = UserBoss.ins().monsterID;

		let config: MonstersConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
		let fbconfig: FbChallengeConfig;
		//只有通天塔显示
		if (GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) {
			if (SkyLevelModel.ins().cruLevel)
				fbconfig = GlobalConfig.FbChallengeConfig[SkyLevelModel.ins().cruLevel];
		}

		let head: string = fbconfig ? `${fbconfig.layer}层守将·` : "";
		if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
			let tf = TextFlowMaker.generateTextFlow1(config.name);
			let tfName = tf[tf.length - 1].text;
			this.nameTxt.text = `${head}${tfName}(${config.level}级)`;
		} else {
			this.nameTxt.text = `${head}${config.name}(${config.level}级)`;
		}
		this.head.source = `monhead${config.head}_png`;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.seeRewardBtn, this.onTap);
		this.clearRole.removeEventListener(egret.Event.CHANGE, this.autoClearChange, this);
		this.removeTouchEvent(this.clearBtn, this.onTap);
		this.closeShowInfoPanel();
		this.removeObserve();
		// WatcherUtil.removeFromArray(UserBoss.ins().rank);
		this._curMonsterID = 0;
		if (this.grayImg) egret.Tween.removeTweens(this.grayImg);
	}

	//  判断仙盟副本
	private guildFBInfo(config: MonstersConfig): void {
		let charm: CharMonster = <CharMonster>EntityManager.ins().getEntityByHandle(UserBoss.ins().bossHandler);
		let monstermodel: EntityModel = charm ? charm.infoModel : null;
		if (GuildWar.ins().getModel().checkinAppoint(1)) {
			let time: number = GuildWar.ins().getModel().doorEndtime;
			this.bloodBar.value = time;
			this.bloodBar.maximum = 120;
			// this.barGroup.y = 101;
			if (time <= 0) {
				this.visible = false;
			} else {
				this.visible = true;
			}
			this.bloodBar.labelFunction = function () {
				return Math.floor(time * 100 / 120) + "%";
			}
			this.curValue = Math.floor(this.bloodBar.value / 120 * 100);
			this.tweenBlood();
		}
		else {
			this.myTxt.visible = this.dropDown.visible = UserBoss.ins().publicBossIdDic.lastIndexOf(config.id) >= 0;
			this.bloodBar.value = UserBoss.ins().hp == undefined ? config.hp : UserBoss.ins().hp;
			this.bloodBar.maximum = config.hp;
			// this.barGroup.y = 20;
			this.visible = (this.bloodBar.value > 0);
			this.curValue = Math.floor(this.bloodBar.value / config.hp * 100);
			this.tweenBlood();
		}
	}

	private curValue: number = 1;

	private tweenBlood(): void {
		//缓动灰色血条
		let bloodPer = (this.curValue * BossBloodPanel.GRAYIMG_WIDTH) / 100;
		//boss血条宽度减少12以上，灰色血条才开始缓动
		let bloodDif = BossBloodPanel.GRAYIMG_WIDTH - bloodPer;
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

	//刷新boss目标信息
	// private refushTargetInfo(): void {
	// 	//判断是否在转生boss
	// 	if (ZsBoss.ins().isZsBossFb(GameMap.fubenID)) {
	// 		if (!this.targetNow) {
	// 			this.targetNow = new BossTargetInfo();
	// 			this.targetNow.x = 260;
	// 			this.targetNow.y = 223;
	// 		}
	// 		let target: CharRole;
	// 		target = <CharRole>(EntityManager.ins().getEntityByHandle(UserBoss.ins().handler));
	// 		if (target) {
	// 			this.targetNow.refushTargetInfo(target);
	// 			this.addChildAt(this.targetNow, 4);
	// 			return;
	// 		}
	// 	}
	// 	if (this.targetNow && this.targetNow.parent) {
	// 		DisplayUtils.removeFromParent(this.targetNow);
	// 	}
	// }

	private autoClearChange(e: egret.Event): void {
		if (ZsBoss.ins().canChange) {
			ZsBoss.ins().clearOther = this.clearRole.selected;
			this.clearSelect = this.clearRole.selected;
			EntityManager.ins().hideOtherEntity(this.clearSelect);
		} else {
			this.clearRole.selected = this.clearSelect;
			UserTips.ins().showTips("操作过于频繁，稍后再试");
		}
	}

	public huDunChange(): void {
		//判断是否在转生boss
		this.proLab.visible = true;
		if (ZsBoss.ins().isZsBossFb(GameMap.fubenID) || GuildWar.ins().getModel().checkinAppoint(1)) {
			if (ZsBoss.ins().hudun && ZsBoss.ins().hudun > 0) {
				this.hudun.visible = true;
				this.hudunbloodBar.value = ZsBoss.ins().hudun;
			} else {
				this.hudun.visible = false;
			}
		}
		else if (CityCC.ins().isCity) {
			this.proLab.visible = false;
			if (CityCC.ins().hudun && CityCC.ins().hudun > 0) {
				this.hudun.visible = true;
				this.hudunbloodBar.value = CityCC.ins().hudun;
				this.hudunbloodBar.maximum = CityCC.ins().huDunMax;
			} else {
				this.hudun.visible = false;
			}
		}else if (HefuBossCC.ins().isInHefuBoss) {
			this.proLab.visible = false;
			if (HefuBossCC.ins().hudun && HefuBossCC.ins().hudun > 0) {
				this.hudun.visible = true;
				this.hudunbloodBar.value = HefuBossCC.ins().hudun;
				this.hudunbloodBar.maximum = HefuBossCC.ins().huDunMax;
			} else {
				this.hudun.visible = false;
			}
		}else if (GwBoss.ins().isGwBoss || GwBoss.ins().isGwTopBoss) {
			this.proLab.visible = false;
			if (UserBoss.ins().shieldType) {
				if (UserBoss.ins().curShield > 0) {
					if(!TimerManager.ins().isExists(this.setTimeShieldChange, this)) TimerManager.ins().doTimer(1000, 0, this.setTimeShieldChange, this);
					this.setTimeShieldChange();
				}
			} else {
				this.setHpShieldChange()
			}
		} else {
			this.hudun.visible = false;
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

	private overTime(): void {
		this.cd.visible = false;
		ViewManager.ins().close(ZSBossCDWin);
	}

	private refushLabel(): void {
		this.remainM--;
		this.timeLable.text = "复活倒数：" + this.remainM + "秒";
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.tipBtn0:
				if (CityCC.ins().isCity) {
					ViewManager.ins().open(CityBossJiangliTipsWin);
				}else if (HefuBossCC.ins().isInHefuBoss) {
					ViewManager.ins().open(HefuBossJiangliTipsWin);
				} else {
					ViewManager.ins().open(PublicBossJiangliTipWin);
				}
				break;
			case this.seeRewardBtn:
				ViewManager.ins().open(ZsBossRewardShowWin);
				break;
			case this.clearBtn:
				if (UserBoss.ins().checkWorldBossMoney()) {
					ViewManager.ins().open(ZSBossCDWin, this.autoClear.selected);
				} else {
					UserTips.ins().showTips("元宝不足");
				}
				break;
		}
	}

	//打开对应副本类型的信息展示界面
	private checkIsShowFbInfo(): void {
		switch (GameMap.fbType) {
			//挑战副本
			case UserFb.FB_TYPE_TIAOZHAN:
				ViewManager.ins().open(ChallengeInfoPanel);
				break;
		}
	}

	private closeShowInfoPanel(): void {
		if (ViewManager.ins().isShow(ChallengeInfoPanel)) {
			ViewManager.ins().close(ChallengeInfoPanel);
		}
	}

	private showCurRewards() {
		//只有通天塔显示
		if (GameMap.fbType != UserFb.FB_TYPE_TIAOZHAN) {
			this.currewards.visible = false;
			return;
		}
		this.currewards.visible = true;
		let rdatas: { rewards: RewardData[] } = { rewards: [] };
		let model: SkyLevelModel = SkyLevelModel.ins();
		//当前奖励
		let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[model.cruLevel];
		if (info) {
			rdatas.rewards = info.clearReward;
		}

		this.currewards.data = rdatas;
	}
}

ViewManager.ins().reg(BossBloodPanel, LayerManager.Game_Main);