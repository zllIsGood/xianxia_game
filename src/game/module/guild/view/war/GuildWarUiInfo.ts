class GuildWarUiInfo extends BaseEuiView {
	public guildName: eui.Label;
	public guildPoint: eui.Label;
	public ownPoint: eui.Label;
	public seeRank: eui.Button;
	public seeMyGuild: eui.Button;
	public playNext: eui.Button;
	public attList: eui.Group;
	public refush: eui.Button;
	public btn: eui.ToggleButton;
	public bar1: eui.Scroller;
	public list1: eui.List;
	public gongxun: eui.Group;
	public point: eui.Label;
	public help: eui.Button;
	public weixie: eui.Group;
	public list2: eui.List;

	public flagGroup: eui.Group;
	public palaceFlag: eui.Button;

	public flag: eui.Group;
	public bloodBar: eui.ProgressBar;
	public scene: eui.Label;
	public mon: eui.Group;
	public timeDesc: eui.Label;
	public ruleDesc: eui.Label;

	public hudun1: eui.Group;
	public hudun: eui.ProgressBar;

	public taskTraceName0: eui.Label;
	public taskTraceAwards0: eui.Label;
	public guid: eui.Group;

	public taskTraceBtn: eui.Group;
	public guid2: eui.Group;
	public descImg: eui.Image;
	private scorePoint: eui.Image;

	public flagStatu: eui.Group;
	public flagTime: eui.Label;
	public guildName1: eui.Label;

	public sceneBar: eui.ProgressBar;
	public lastTime: eui.Label;
	public comNum: eui.Label;

	private clickEffc: MovieClip;
	private pointEff: MovieClip;
	private nextEff: MovieClip;

	public weijihuo1: eui.Image;
	public jihuo1: eui.Image;
	public weijihuo2: eui.Image;
	public jihuo2: eui.Image;
	public jihuo3: eui.Image;
	public weijihuo3: eui.Image;
	public hgweijihuo: eui.Image;
	public hgjh: eui.Image;

	public Nextchengnei: eui.Button;
	public Nextchengnei0: eui.Button;//殿前采旗位置的城内
	public Nextdianqian: eui.Button;
	public Nexthuanggong: eui.Button;

	/** 斩杀 */
	private skillGroup: eui.Group;
	/** 玩家血条 */
	private belongGroup: eui.Group;
	private roleHead0: eui.Image;//头像
	private belongNameTxt0: eui.Label;//名字
	private bloodBar1: eui.ProgressBar;//血条
	private neigongBar1: eui.ProgressBar;

	public initUI(): void {
		super.initUI();
		this.skinName = "GuildWarUiSkin";

		this.clickEffc = new MovieClip;
		// this.clickEffc.x = p.x + this.guid.width;
		// this.clickEffc.y = p.y + this.guid.height/2;

		this.pointEff = new MovieClip;
		// this.pointEff.x = 113 + 462 - 54;
		// this.pointEff.y = 510 + 150 + 90 + 23;
		this.pointEff.x = 61;
		this.pointEff.y = 45;

		this.nextEff = new MovieClip;

		this.list1.itemRenderer = GuildWarMemberHeadRender;
		this.list2.itemRenderer = GuildWarMemberHeadRender;

		this.sceneBar.maximum = 300;
		this.sceneBar.labelFunction = function () {
			return "";
		}

		this.bloodBar1.slideDuration = 0;
		this.bloodBar.labelDisplay.visible = false;

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.Nextchengnei, this.onTap);
		this.addTouchEvent(this.Nextchengnei0, this.onTap);
		this.addTouchEvent(this.Nextdianqian, this.onTap);
		this.addTouchEvent(this.Nexthuanggong, this.onTap);
		this.observe(GameLogic.ins().postEnterMap, this.refushShowInfo);
		this.observe(GuildWar.ins().postPointUpdate, this.refushPoint);
		this.observe(GuildWar.ins().postPointRewardChange, this.refushPointReward);
		this.addTouchEvent(this.seeRank, this.onTap);
		this.observe(GuildWar.ins().postCityownChange, this.cityOwnChange);
		this.addTouchEvent(this.seeMyGuild, this.onTap);
		this.observe(GuildWar.ins().postWeixieChange, this.refushWeixieList);
		this.observe(GuildWar.ins().postCanplayChange, this.refushcanPlayList);
		this.addTouchEvent(this.list1, this.listTap);
		this.addTouchEvent(this.list2, this.listTap);
		this.addTouchEvent(this.btn, this.onTap);
		this.addTouchEvent(this.palaceFlag, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.addTouchEvent(this.mon, this.onTap);
		this.addTouchEvent(this.guid2, this.onTap);
		this.addTouchEvent(this.taskTraceBtn, this.onTap);
		this.observe(GuildWar.ins().postFlagInfoChange, this.refushFlagStatu);
		this.observe(GuildWar.ins().postHudunInfo, this.hudunChange);
		this.observe(GuildWar.ins().postRankListChange, this.rankListChange);
		this.observe(GuildWar.ins().postGuildNumChange, this.refushGuildNum);
		this.observe(GuildWar.ins().postJoinPlayBack, this.doorStatuChange);
		this.observe(GuildWar.ins().postKillHuman, this.showSkill);
		this.observe(GameLogic.ins().postEntityHpChange, this.updateHP);
		this.observe(GameLogic.ins().postChangeTarget, this.updateTarget);
		// this.observe(UserBoss.ins().postHpChange, this.reflashBlood);
		this.addTouchEvent(this.ruleDesc, this.onTap);
		this.belongGroup.visible = false;
		this.ruleDesc.textFlow = new egret.HtmlTextParser().parser("<u>玩法说明</u>");
		this.refushShowInfo();
		this.refushPoint();
		this.cityOwnChange();
		this.refushWeixieList();
		this.refushcanPlayList();
		this.rankListChange();
		this.doorStatuChange();
		this.refushFlagStatu();
		this.refushGuildNum();
	}

	public close(...param: any[]): void {
		if (ViewManager.ins().isShow(GuileWarReliveWin)) {
			ViewManager.ins().close(GuileWarReliveWin);
		}
		if (ViewManager.ins().isShow(TargetPlayerBigBloodPanel)) {
			ViewManager.ins().close(TargetPlayerBigBloodPanel);
		}
		this.currAttackHandle = 0;
		TimerManager.ins().removeAll(this);
		DisplayUtils.removeFromParent(this.clickEffc);
		DisplayUtils.removeFromParent(this.pointEff);
		DisplayUtils.removeFromParent(this.nextEff);
		this.clearRendererItem();

	}

	private refushShowInfo(): void {
		this.gongxun.visible = GuildWar.ins().getModel().checkinAppoint(2);
		this.mon.visible = GuildWar.ins().getModel().checkinAppoint(2);
		this.bar1.y = this.mon.visible ? 99 : 30;
		this.flagGroup.visible = GuildWar.ins().getModel().checkinAppoint(4);
		this.flag.visible = GuildWar.ins().getModel().checkinAppoint(4);
		this.flag.y = 103;
		this.scene.text = GuildWar.ins().getModel().getNextMapName(0);
		this.guid.visible = (GuildWar.ins().getModel().checkinAppoint(2) && GuildWar.ins().getModel().getIntoNextMapGongxun() > GuildWar.ins().getModel().gongXun);
		if (this.guid.visible) {
			this.clickEffc.playFile(RES_DIR_EFF + "tapCircle");
			this.clickEffc.x = this.guid.x - 23;//this.guid.x + this.guid.width + 12;
			this.clickEffc.y = this.guid.y + this.guid.height / 2 - 5;
			this.addChild(this.clickEffc);
		} else {
			DisplayUtils.removeFromParent(this.clickEffc);
		}
		// this.descImg.source = "tips" + GameMap.fubenID;

		let cruInfo: GuildBattleLevel = GuildWar.ins().getModel().getMapLevelInfo();
		// this.playNext.label = cruInfo.btnName;
		this.sceneBar.value = (cruInfo.id - 1) * 100;

		this.weijihuo1.visible = !(cruInfo.id >= 1);
		this.jihuo1.visible = cruInfo.id >= 1;

		this.weijihuo2.visible = !(cruInfo.id >= 2);
		this.jihuo2.visible = cruInfo.id >= 2;

		this.weijihuo3.visible = !(cruInfo.id >= 3);
		this.jihuo3.visible = cruInfo.id >= 3;

		this.hgweijihuo.visible = !(cruInfo.id >= 4);
		this.hgjh.visible = cruInfo.id >= 4;
		this.Nextdianqian.visible = false;
		this.Nextchengnei.visible = cruInfo.id == 1;
		this.Nexthuanggong.visible = cruInfo.id == 3;
		this.Nextchengnei0.visible = cruInfo.id == 3;

		if (cruInfo.id == 4) {
			this.Nextdianqian.visible = true;
		} else if (cruInfo.id == 2) {
			this.refushPoint();
		}

		this.updateNextEff();

		this.lastTime.text = DateUtils.getFormatTimeByStyle(GuildWar.ins().getModel().acEndTime, DateUtils.STYLE_4);
		TimerManager.ins().doTimer(1000, GuildWar.ins().getModel().acEndTime, () => {
			this.lastTime.text = DateUtils.getFormatTimeByStyle(GuildWar.ins().getModel().acEndTime, DateUtils.STYLE_4);
		}, this);
	}

	private updateNextEff(): void {
		let id = GuildWar.ins().getModel().getMapLevelInfo().id;
		let icon = [this.Nextchengnei, this.Nextdianqian, this.Nexthuanggong, this.palaceFlag][id - 1];
		if (!icon)
			return;
		if (icon.visible && icon.enabled) {
			this.nextEff = this.nextEff || new MovieClip;
			this.nextEff.x = 40;
			this.nextEff.y = 50;
			this.nextEff.playFile(`${RES_DIR_EFF}actIconCircle`, -1);
			icon.addChild(this.nextEff);
		}
		else {
			DisplayUtils.removeFromParent(this.nextEff);
		}
	}

	private refushGuildNum(): void {
		this.comNum.text = GuildWar.ins().getModel().guildNum + "人";
	}

	private refushPoint(): void {
		this.guildPoint.text = GuildWar.ins().getModel().guildPoint + "";//帮派积分
		this.ownPoint.text = GuildWar.ins().getModel().ownPoint + "";//个人积分
		this.point.text = GuildWar.ins().getModel().gongXun + "/" + GuildWar.ins().getModel().getIntoNextMapGongxun();//功勋值	
		let cruInfo: GuildBattleLevel = GuildWar.ins().getModel().getMapLevelInfo();
		if (GuildWar.ins().getModel().gongXun >= GuildWar.ins().getModel().getIntoNextMapGongxun()) {
			if (cruInfo.id == 2) {
				this.Nextdianqian.visible = true;
				this.point.visible = false;
				this.gongxun.visible = false;
				this.updateNextEff();
			}
		} else {
			if (cruInfo.id != 4) {
				this.Nextdianqian.visible = false;
				this.point.visible = true;
			}
		}
		this.refushPointReward();
		this.doorStatuChange();
	}

	private refushPointReward(): void {
		let info: GuildBattlePersonalAward = GuildWar.ins().getModel().getMyPointReward();
		if (info) {
			this.taskTraceName0.y = 16;
			let str: string = "积分目标：" + "\r" + GuildWar.ins().getModel().ownPoint + "/" + info.integral;
			str += GuildWar.ins().getModel().pointInfo.isCan ? "<font color = '#35e62d'>(完成)</fomt>" : "";
			this.taskTraceName0.textFlow = new egret.HtmlTextParser().parser(str);
			let itemData: RewardData = info.award[0];
			if (GuildWar.ins().getModel().pointInfo.isCan) {
				this.taskTraceBtn.visible = true;
				this.pointEff.playFile(RES_DIR_EFF + "actIconCircle", -1);
				// this.addChild(this.pointEff);
				this.taskTraceBtn.addChild(this.pointEff);
			} else {
				DisplayUtils.removeFromParent(this.pointEff);
				// let maxInfo: GuildBattlePersonalAward = GuildWar.ins().getModel().getMaxReward();
				// if( GuildWar.ins().getModel().ownPoint >= maxInfo.integral )//领取后不显示
				// 	this.taskTraceBtn.visible = false;

			}
		} else {
			this.taskTraceAwards0.visible = false;
			DisplayUtils.removeFromParent(this.pointEff);
			this.taskTraceBtn.visible = false;
		}
		this.scorePoint.visible = this.pointEff.parent ? true : false;

	}

	private cityOwnChange(): void {
		this.guildName.text = GuildWar.ins().getModel().cityOwn == "" ? "虚位以待" : GuildWar.ins().getModel().cityOwn;//天盟归属
	}

	private refushWeixieList(refushPlayList: number = 0): void {
		this.list2.dataProvider = new eui.ArrayCollection(GuildWar.ins().getModel().weixieList);
		if (refushPlayList == 1) {
			this.refushcanPlayList();
		}
		this.weixie.visible = GuildWar.ins().getModel().checkinAppoint(2, true) && GuildWar.ins().getModel().weixieList.length > 0;
	}

	private refushcanPlayList(data?: any[]): void {
		data = data || GuildWar.ins().getModel().canPlayList;
		this.list1.dataProvider = new eui.ArrayCollection(data);
		this.attList.visible = GuildWar.ins().getModel().checkinAppoint(2, true) && (data.length > 0 || this.mon.visible);
	}

	private doorStatuChange(): void {
		let lastEnabled = this.Nextchengnei.enabled;
		this.Nextchengnei.enabled = GuildWar.ins().getModel().doorDie;
		if (!lastEnabled) {
			this.updateNextEff();
		}
	}

	private rankListChange(): void {
		let dataList: WarRankInfo[] = GuildWar.ins().getModel().rankList;
		let info: WarRankInfo;
		for (let i: number = 0; i < 3; i++) {
			info = dataList[i];
			if (info) {
				this["rankName" + (i + 1)].text = info.name;
				this["rankPoint" + (i + 1)].text = info.point + "";
			} else {
				this["rankName" + (i + 1)].text = "暂无";
				this["rankPoint" + (i + 1)].text = "0";
			}
		}
	}

	//刷新旗子的状态
	private refushFlagStatu(): void {
		TimerManager.ins().remove(this.runTime, this);
		this.hudun1.visible = false;
		if (GuildWar.ins().getModel().flagStatu == 0) {
			this.clearTimeBar();
			this.runTime();
			TimerManager.ins().doTimer(1000, GuildWar.ins().getModel().endTime, this.runTime, this);
		} else if (GuildWar.ins().getModel().flagStatu == 1) {
			this.clearTimeBar();
			this.timeDesc.text = "当前皇旗可采集";
		} else {
			this.runTime();
			this.bloodBar.maximum = GlobalConfig.GuildBattleConst.gatherTime;
			TimerManager.ins().doTimer(1000, GuildWar.ins().getModel().endTime, this.runTime, this);
			this.hudun1.visible = true;
		}
		this.palaceFlag.enabled = GuildWar.ins().getModel().flagStatu == 1;
		//增加显示效果
		this.flagStatu.visible = (GuildWar.ins().getModel().flagStatu == 2 && !this.flagGroup.visible);
		if (this.flagStatu.visible) {
			let t: egret.Tween = egret.Tween.get(this.flagStatu);
			this.flagStatu.x = 480;
			t.to({ "x": 106 }, 500).call(() => {
			}, this);
		}
		this.updateNextEff();
	}

	private clearTimeBar(): void {
		this.bloodBar.maximum = 0;
		this.bloodBar.value = 0;
		this.bloodBar.labelFunction = function () {
			return "";
		}
	}

	private hudunChange(n: number[]): void {
		this.hudun.maximum = n[1];
		this.hudun.value = n[0];
		this.hudun.labelFunction = function () {
			return Math.ceil(n[0] * 100 / n[1]) + "%";
		}
	}

	private runTime(): void {
		--GuildWar.ins().getModel().endTime;
		if (GuildWar.ins().getModel().endTime >= 0) {
			if (GuildWar.ins().getModel().flagStatu != 2) {
				this.timeDesc.text = Math.floor(GuildWar.ins().getModel().endTime / 60) + "分" + GuildWar.ins().getModel().endTime % 60 + "秒后可采集";
			} else {
				this.timeDesc.text = GuildWar.ins().getModel().flagName + " 采集中.....";
				this.bloodBar.value = GuildWar.ins().getModel().endTime;
				this.bloodBar.labelFunction = function () {
					return "采集成功剩余时间：" + Math.floor(GuildWar.ins().getModel().endTime / 60) + "分" + GuildWar.ins().getModel().endTime % 60 + "秒";
				}
				if (this.flagStatu.visible) {
					let str: string = "<font color = '#FFB82A'>" + GuildWar.ins().getModel().flagName + "</font>采集皇旗中（<font color = '#35e62d'>" + Math.floor(GuildWar.ins().getModel().endTime / 60) + "分" + GuildWar.ins().getModel().endTime % 60 + "</font>秒）";
					this.flagTime.textFlow = new egret.HtmlTextParser().parser(str);
					this.guildName1.text = "仙盟：" + GuildWar.ins().getModel().flagGuild;
				}
			}
		}
		if (GuildWar.ins().getModel().endTime <= 0) {
			TimerManager.ins().remove(this.runTime, this);
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.Nextchengnei:
			case this.Nextchengnei0:
			case this.Nextdianqian:
			case this.Nexthuanggong:
				if (GuildWar.ins().getModel().killName != "") {
					UserTips.ins().showTips("|C:0xf3311e&T:复活状态，不能切换地图|");
					return;
				}
				if (GuildWar.ins().getModel().getIntoNextMapGongxun() > GuildWar.ins().getModel().gongXun) {
					UserTips.ins().showTips("|C:0xf3311e&T:战功不满足条件，不能进入下一层|");
					return;
				}
				if (!GuildWar.ins().getModel().doorDie) {
					UserTips.ins().showTips("|C:0xf3311e&T:击破城门后可进入下一关|");
					return;
				}
				let index = 1;//场景索引
				if (e.currentTarget == this.Nextchengnei || e.currentTarget == this.Nextchengnei0) {
					index = 2;
				} else if (e.currentTarget == this.Nextdianqian) {
					index = 3;
				} else if (e.currentTarget == this.Nexthuanggong) {
					index = 4;
				}
				ViewManager.ins().open(GuileWarReliveWin, 1, index);
				break;
			case this.seeRank:
				ViewManager.ins().open(GuildWarRewardWin);
				break;
			case this.seeMyGuild:
				ViewManager.ins().open(GuildWarMemWin);
				break;
			case this.btn:
				if (this.btn.currentState == "down") {
					this.refushcanPlayList([]);
				} else {
					this.refushcanPlayList();
				}
				break;
			case this.palaceFlag:
				//去采集旗子
				if (GuildWar.ins().getModel().flagStatu != 0) {
					GuildWar.ins().requestStartGetFlag();
				} else {
					UserTips.ins().showTips("|C:0xf3311e&T:皇旗当前不可采集|");
				}
				break;
			case this.mon:
				this.clickEffc.playFile(RES_DIR_EFF + "tapCircle", 1);
				this.addChild(this.clickEffc);
				GameLogic.ins().postChangeAttrPoint(0);
				this.guid.visible = false;
				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 7);
				break;
			case this.taskTraceBtn:
				if (GuildWar.ins().getModel().pointInfo.isCan)
					GuildWar.ins().sendPointReward();
				break;
			case this.guid2:
				ViewManager.ins().open(GuildwarTipsPanel);
				break;
		}
	}

	private listTap(e: egret.TouchEvent): void {
		if (e.target.parent instanceof GuildWarMemberHeadRender) {
			let item: GuildWarMemberHeadRender = <GuildWarMemberHeadRender>e.target.parent;
			item.showEffect();
			//点击间隔
			if (!GuildWar.ins().getModel().canClick) {
				return;
			}
			if (GuildWar.ins().getModel().flagAcId == Actor.actorID) {
				WarnWin.show("采集中攻击玩家会导致采集<font color='#FFB82A'>进度归0</font>，确定要攻击玩家嘛？", () => {
					GameLogic.ins().postChangeAttrPoint(item.data);
					EntityManager.ins().showHideSomeOne(item.data);
				}, this);
				return;
			}
			GameLogic.ins().postChangeAttrPoint(item.data);
			if (this.guid.visible) {
				DisplayUtils.removeFromParent(this.clickEffc);
			}
			this.guid.visible = false;
			if (!(GuildWar.ins().getModel().attHandle == item.data))
				EntityManager.ins().showHideSomeOne(item.data);
		}
	}

	private clearRendererItem(): void {
		let len: number = this.list1.numChildren;
		for (let index: number = 0; index < len; index++) {
			let item: GuildWarMemberHeadRender = this.list1.getChildAt(index) as GuildWarMemberHeadRender;
			item.clearEffect();
		}
		len = this.list2.numChildren;
		for (let index: number = 0; index < len; index++) {
			let item: GuildWarMemberHeadRender = this.list2.getChildAt(index) as GuildWarMemberHeadRender;
			item.clearEffect();
		}
	}

	/**斩杀数*/
	private lztitle: eui.BitmapLabel;
	private lzlabel: eui.BitmapLabel;

	private showSkill(value: number) {
		if (!value) {
			egret.Tween.removeTweens(this.lzlabel);
			egret.Tween.removeTweens(this.skillGroup);
			this.skillGroup.visible = false;
			return;
		}
		if (this.skillGroup.visible) {
			egret.Tween.removeTweens(this.lzlabel);
			egret.Tween.removeTweens(this.skillGroup);
		}
		this.skillGroup.visible = true;
		this.skillGroup.alpha = 1;
		this.lzlabel.scaleX = this.lzlabel.scaleY = 1;
		this.lzlabel.text = value + "";
		let self = this;
		egret.Tween.get(this.lzlabel).to({ scaleX: 2, scaleY: 2 }, 200).to({ scaleX: 1, scaleY: 1 }, 100).call(() => {
			egret.Tween.get(self.skillGroup).wait(1000).to({ alpha: 0 }, 1000).call(() => {
				egret.Tween.removeTweens(self.lzlabel);
				egret.Tween.removeTweens(self.skillGroup);
				self.skillGroup.visible = false;
			});
		});

	}

	/**变换攻击目标*/
	private updateTarget() {
		let cruInfo: GuildBattleLevel = GuildWar.ins().getModel().getMapLevelInfo();
		if (cruInfo.id == 1) {
			this.belongGroup.visible = false;
		} else {
			this.belongGroup.visible = true;
		}
		if (GameLogic.ins().currAttackHandle == 0) {
			this.belongGroup.visible = false;
		}
		if (GameLogic.ins().currAttackHandle != 0 && this.currAttackHandle != GameLogic.ins().currAttackHandle) {
			this.currAttackHandle = GameLogic.ins().currAttackHandle;
			let mainRoleInfo: Role;
			let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(this.currAttackHandle);
			if (roleList && roleList.length > 0) {
				mainRoleInfo = <Role>roleList[0].infoModel;
				let tname: string = mainRoleInfo.name;
				let strlist = tname.split("\n");
				if (strlist[1])
					tname = strlist[1];
				else
					tname = strlist[0];

				this.belongNameTxt0.textFlow = TextFlowMaker.generateTextFlow(tname);
				// this.roleHead0.source = `yuanhead${mainRoleInfo.job}${mainRoleInfo.sex}`
				this.roleHead0.source = `main_role_head${mainRoleInfo.job}`
				this.changeHp();
			}
		}
		if (this.belongGroup.visible) {
			this.changeHp();
		}

	}

	/**更新敌方血量*/
	private updateHP(param: Array<any>) {
		let targetRole: CharRole = param[0];
		let sourceRole: CharRole = param[1];
		let type = param[2];
		let value = param[3];
		if (targetRole && targetRole.infoModel.masterHandle == this.currAttackHandle) {
			this.changeHp();
		}
	}

	/**敌方玩家血量*/
	private currAttackHandle: number;

	private changeHp() {
		let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(this.currAttackHandle);
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

					let curNeigong = role.infoModel.getAtt(AttributeType.cruNeiGong) || 0;
					let maxNeigong = role.infoModel.getAtt(AttributeType.maxNeiGong) || 0;
					neigongValue += curNeigong;
					neigongTotal += maxNeigong;
				}
			}

			this.neigongBar1.maximum = neigongTotal;
			this.neigongBar1.value = neigongValue;
			this.bloodBar1.maximum = hpTotal;
			this.bloodBar1.value = hpValue;
			if (hpValue <= 0) {
				this.belongGroup.visible = false;
			}
		}
	}

}

ViewManager.ins().reg(GuildWarUiInfo, LayerManager.UI_Main);