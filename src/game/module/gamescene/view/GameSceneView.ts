/**
 *  游戏战斗场景
 * @author
 *
 */
class GameSceneView extends BaseEuiView {

	public map: MapView;
	public input: eui.TextInput;
	private pkBossBtn: eui.Button;

	/** 挂机状态 */
	private stateImg: eui.Image;
	/** 退出按钮 */
	public escBtn: eui.Button;
	//经验显示
	public flyExpGroup: eui.Group;
	public flyExpGroup1: eui.Group;
	public expTxt: eui.BitmapLabel;
	public lbNum: eui.Label;

	private skillWordList: string[] = [];
	private skillWordImg: eui.Image;
	private guildBossGroup: eui.Group;

	private totleExp: eui.Image;
	private leftTimeImg: eui.Image;
	private killNumImg: eui.Image;

	private leftTimePic: eui.BitmapLabel;


	//***************神兵副本 ********************//
	private GwRankGroup: eui.Group;
	private riseupBtn: eui.Group;
	private requireTime: eui.Label;//多少分钟
	private rewardExp: eui.Label;//s级奖励神兵exp
	private time: eui.Label;//用时多少
	private addLabel: eui.Label;//鼓舞加成文本
	private riseup: eui.Button//鼓舞按钮
	private mijingpassTime: number = 0;//进过了多少秒
	private rank: eui.Image;//评分
	private schedule: eui.Image;//绿色
	private rankbg: eui.Image;//绿色
	private _shap: egret.Shape = new egret.Shape();
	// private rankSReward:eui.Group;//奖励
	// private reward:ItemBase;
	// private getImg:eui.Image;//已领取
	constructor() {
		super();
		this.skinName = "GameFightSceneSkin";
		this.map = new MapView;
		this.map.initMap();
		if (GameMap.mapID == void 0) {
			GameMap.mapID = parseInt(egret.localStorage.getItem("lastMapID") || "1201");
		}
		this.map.changeMap(false);
		this.addChildAt(this.map, 0);
	}

	public initUI(): void {

		super.initUI();

		this.touchEnabled = false;

		this.pkBossBtn.touchEnabled = true;
		this.pkBossBtn.visible = false;

		this.input = new eui.TextInput;
		this.input.visible = false;
		this.input.text = "点我输入命令1645";
		this.input.skinName = "skins.TextInputSkin";
		this.input.y = 300;
		this.addChild(this.input);

		// this.escBtn.visible = false;

		this.skillWordImg = new eui.Image();
		//用约束的方式即使改变了锚点也不会偏移
		// this.skillWordImg.horizontalCenter = -100;
		this.skillWordImg.visible = false;
		this.skillWordImg.touchEnabled = false;
		this.addChild(this.skillWordImg);

		this.GwRankGroup.addChild(this._shap);
		this._shap.rotation = -90;
		this._shap.x = 63;
		this._shap.y = 60;
		this.schedule.mask = this._shap;
		this.riseupBtn.visible = false;
	}


	public open(...param: any[]): void {
		super.open(param);
		this.observe(GameLogic.ins().postHookStateChange, this.upDataGuajiState);
		this.observe(GameLogic.ins().postHpChange, this.updateExpGroup);
		this.observe(UserSkill.ins().postShowSkillWord, this.showSkillWord);
		this.observe(UserFb.ins().postFbExpTotal, this.updateKill);
		this.observe(GameLogic.ins().postEnterMap, this.onEnterMap);
		this.observe(UserFb.ins().postFbTime, this.onSetTime);
		this.observe(GameLogic.ins().postViewOpen, this.onViewOpen);
		this.observe(GodWeaponCC.ins().postFubenInfo, this.updateMijingAdd);
		this.observe(Actor.ins().postExp, this.expChange);
		this.addTouchEvent(this.pkBossBtn, this.onTap);
		this.addTouchEvent(this.escBtn, this.onTap);
		this.addTouchEvent(this.riseup, this.onTap);
	}

	public close(...param: any[]): void {
		super.close(param);

		this.skillWordList = [];
		egret.Tween.removeTweens(this.skillWordImg);
		TimerManager.ins().remove(this.updateTime, this);
		//如果是试炼
		TimerManager.ins().remove(this.updateMijingTime, this);
		this.mijingpassTime = 0;
	}

	private expChange(exp: number) {
		if (GameMap.fbType != UserFb.FB_TYPE_GUANQIABOSS &&
			GameMap.fbType != UserFb.FB_TYPE_TIAOZHAN || !exp)
			return;

		let role = EntityManager.ins().getNoDieRole();
		if (!role) return;

		let blood: eui.BitmapLabel = BitmapNumber.ins().createNumPic('e+' + exp, 'g3', 3.5, 0);
		blood.anchorOffsetX = blood.width / 2;
		blood.y = role.y - role.typeface - 30;
		blood.x = role.x;
		blood.scaleX = blood.scaleY = 1;
		this.map.addChild(blood);

		egret.Tween.get(blood).to({ y: blood.y - 100, scaleX: 2, scaleY: 2 }, 200).to({
			scaleX: 1.2,
			scaleY: 1.2
		}, 100).wait(1000).to({ alpha: 0, y: blood.y - 140 }, 1000).call(() => {
			DisplayUtils.removeFromParent(blood);
		});
	}

	private onViewOpen(tag: number) {
		if (tag == 1) {
			if (this.map.parent) {
				ViewManager.ins().open(GameBlackView);
				this.removeChild(this.map);
			}
		} else {
			if (!this.map.parent) {
				this.addChildAt(this.map, 0);
				ViewManager.ins().close(GameBlackView);
			}
		}
	}

	private onEnterMap() {
		TimerManager.ins().remove(this.updateTime, this);
		ViewManager.ins().close(GwMijingRiseUpView);
		TimerManager.ins().remove(this.updateMijingTime, this);
		this.mijingpassTime = 0;
		this.isStartTime = false;
		if (GameMap.fbType == UserFb.FB_TYPE_EXP) {
			this.curExp = 0;
			this.updateKill();
			this.setExp(this.curExp);
			this.leftFlyExp = 0;
			this.totleExp.source = `chuangtianguan_json.fbljjy`;
			this.killNumImg.source = `chuangtianguan_json.fbjsgw`;
			this.flyExpGroup.visible = true;
			this.flyExpGroup1.visible = true;
		}
		else {
			this.flyExpGroup.visible = false;
			this.flyExpGroup1.visible = false;
		}
		this.guildBossGroup.visible = false;

		this.escBtn.visible = GameMap.fubenID > 0 &&
			GameMap.fbType != UserFb.FB_TYPE_GUANQIABOSS &&
			GameMap.fbType != UserFb.FB_TYPE_CITY &&
			GameMap.fbType != UserFb.FB_TYPE_FIRE_RING &&
			GameMap.fbType != UserFb.FB_TYPE_STORY;

		if (UserSkill.ins().hejiLevel >= 0) this.checkHJState();
		
		//处理神兵副本 试炼
		if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {
			this.GwRankGroup.visible = false;
			// this.riseupBtn.visible = false;
			// this.rankSReward.visible = true;
			this.showMijing();
		} else {
			this.GwRankGroup.visible = false;
			// this.riseupBtn.visible = false;
			// this.rankSReward.visible = false;
		}
		if (GameMap.fbType == UserFb.FB_TYPE_GUARD_WEAPON) {
			ViewManager.ins().open(GuardMainUI);
		}
		else {
			ViewManager.ins().close(GuardMainUI);
			ViewManager.ins().close(GuardCallBossWin);
		}
	}

	//断线重练如果在试炼副本要请求一下试炼副本数据
	private updateMijingAdd(): void {
		if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {
			let data: GwFubenData = GodWeaponCC.ins().fubenInfoData;
			// this.addLabel.text = `鼓舞    攻击+${data.getBuyCount * 10}%`;
			// this.getImg.visible = false;
			let list: GwfubenFloorData[] = data.listData;
			for (let i: number = 0; i < list.length; i++) {
				if (list[i].config.fbId == GameMap.fubenID) {
					// if(list[i].curPoint == 1){
					// 	this.getImg.visible = true;
					// }
					UserFb.ins().oldMijingPoint = list[i].curPoint;
					break;
				}
			}
		}
	}

	//试炼相关
	private gwStartTimes: number = 0;
	private leftTimeMj: number = 0;
	private _miCurFloor: number = 0;

	//显示试炼副本的相关组件
	private showMijing(): void {
		let config: GodWeaponBaseConfig = GlobalConfig.GodWeaponBaseConfig;
		let curJoinFloor: number = 1;
		let confF: GodWeaponFubenConfig;
		for (let key in GlobalConfig.GodWeaponFubenConfig) {
			if (GlobalConfig.GodWeaponFubenConfig[key].fbId == GameMap.fubenID) {
				curJoinFloor = parseInt(key);
				confF = GlobalConfig.GodWeaponFubenConfig[key];
				break;
			}
		}
		this._miCurFloor = curJoinFloor;
		let data: GwFubenData = GodWeaponCC.ins().fubenInfoData;
		if (data) {
			// this.addLabel.text = `鼓舞    攻击+${data.getBuyCount * 10}%`;
			// this.getImg.visible = false;
			let list: GwfubenFloorData[] = data.listData;
			for (let i: number = 0; i < list.length; i++) {
				if (list[i].config.fbId == GameMap.fubenID) {
					// if(list[i].curPoint == 1){
					// 	this.getImg.visible = true;
					// }
					UserFb.ins().oldMijingPoint = list[i].curPoint;
					break;
				}
			}
		} else {
			GodWeaponCC.ins().requestFubenInfo();//请求副本数据;
		}
		// this.reward.data = confF.firstAward[0];
	}

	//部分场景合击开关显示
	private checkHJState(): void {
		if (GameMap.autoPunch()) {
			ViewManager.ins().open(BtnHejiWin);
		}
		else {
			ViewManager.ins().close(BtnHejiWin);
		}
	}

	//移除试炼计时器
	public removeMiingTimeFun(): void {
		TimerManager.ins().remove(this.updateMijingTime, this);
	}

	//每秒执行
	private updateMijingTime(): void {
		if (this.leftTimeMj <= 0) {
			ViewManager.ins().close(GwMijingRiseUpView);
			this.mijingpassTime = 0;
			UserFb.ins().sendExitFb();
			ViewManager.ins().open(GwResultView, GameMap.fubenID, 4)
			TimerManager.ins().remove(this.updateMijingTime, this);
			return;
		} else {
			let passNum: number = 360 - this.leftTimeMj;// this.leftTimeMj剩余多少秒
			let maxNum: number;
			for (let i: number = 0; i < GlobalConfig.GodWeaponBaseConfig.fbGrade.length; i++) {
				if (passNum <= GlobalConfig.GodWeaponBaseConfig.fbGrade[i]) {
					this.mijingpassTime = GlobalConfig.GodWeaponBaseConfig.fbGrade[i] - passNum;
					maxNum = GodWeaponCC.ins().getPinfenTime(i);
					UserFb.ins().mijingFingfen = i + 1;//试炼评分
					UserFb.ins().mijingUseTime = passNum;//副本耗时多少时间	
					this.updateMijingTimeView(maxNum, i);
					break;
				}
			}
			this.leftTimeMj = 360 - (Math.floor(new Date().getTime() / 1000) - this.gwStartTimes);
			// this.leftTimeMj--;
		}
	}

	//更新试炼时间
	private updateMijingTimeView(maxNum: number, mjIndex: number): void {
		if (!this.GwRankGroup.visible) {
			this.GwRankGroup.visible = true;
			this.schedule.source = `godweapon_rankschedule`;
			this.rankbg.source = `GodWeapon_rankball`;
		}
		let angle: number = 360 * this.mijingpassTime / maxNum;
		if (angle == 360) {//临界点处理（评级显示不及时的问题你）；
			angle = 0;
		}
		else if (angle == 0) {
			angle = 360;
		}
		DisplayUtils.drawCir(this._shap, this.schedule.width / 2, 360 - angle, true);//顺时针  逆时针angle,false
		this.rank.source = `godweapon_rank${mjIndex + 1}`;
		this.time.text = DateUtils.getFormatBySecond(this.mijingpassTime, DateUtils.TIME_FORMAT_1);
		let str: string;
		str = GlobalConfig.GodWeaponBaseConfig.fbGrade[mjIndex] + "秒";
		let strP: string = "";
		switch (mjIndex + 1) {
			case 1:
				strP = "S";
				break;
			case 2:
				strP = "A";
				break;
			case 3:
				strP = "B";
				break;
			case 4:
				strP = "C";
				break;
		}
		this.requireTime.textFlow = (new egret.HtmlTextParser).parser(str + '<font color="#FFFFFF">内通关将保持</font>' + strP + '<font color="#FFFFFF">评价</font>');
		let floorConfig: GodWeaponFubenConfig = GlobalConfig.GodWeaponFubenConfig[this._miCurFloor];
		if (floorConfig) {
			let obj: RewardData[] = floorConfig.award[mjIndex + 1];
			if (obj) {
				this.rewardExp.text = `${obj[0].count}`;
			} else {
				this.rewardExp.text = '';
			}
		} else {
			this.rewardExp.text = '';
		}
	}
	//试炼评分评价纠正前端的误差
	public setMJPingfen(point: number): void {
		let sourStr: string = `godweapon_rank${point}`;
		if (this.rank.source != sourStr) {
			this.rank.source = sourStr;
		}
	}
	private upDataGuajiState(value: number): void {
		if (GameMap.fubenID != 0 && value == 1) {
			value = 0;
		}
		this.stateImg.source = value ? "main_word_xundi" : "";
	}

	private leftTime: number = 0;
	private isStartTime: boolean = false;

	private onSetTime(...param: any[]): void {
		if (GameMap.fbType == UserFb.FB_TYPE_GUILD_BOSS) {
			if (param && param[0]) {
				this.leftTime = param[0][1];
				this.leftTimeImg.source = `lastcount`;
				this.guildBossGroup.visible = true;
				//更新恢复次数剩余时间计时
				if (!this.isStartTime) {
					TimerManager.ins().doTimer(1000, 0, this.updateTime, this);
					this.isStartTime = true;
					this.updateTime();
				}
			}
		} else if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {
			if (param && param[0]) {
				this.leftTimeMj = param[0][1];
				if (this.leftTimeMj >= 2) {
					this.leftTimeMj = this.leftTimeMj - 2;//前端多跑两秒
				}
				this.gwStartTimes = Math.floor(new Date().getTime() / 1000) - (360 - this.leftTimeMj);
				TimerManager.ins().doTimer(1000, 0, this.updateMijingTime, this);
				this.updateMijingTime();
			}
		}
	}

	/** 更新恢复次数剩余时间计时 */
	private updateTime(): void {
		if (this.leftTime < 0) {
			//移除计时器
			TimerManager.ins().remove(this.updateTime, this);
			this.isStartTime = false;
			this.guildBossGroup.visible = false;
			this.leftTimePic.text = "0";
			UserFb.ins().sendExitFb();
			return;
		}
		this.leftTimePic.text = this.leftTime + "";
		this.leftTime--;
	}

	private updateKill() {
		this.lbNum.textFlow = TextFlowMaker.generateTextFlow1(`|C:0x35e62b&T:${UserFb.ins().expMonterCountKill}||C:0xF8B141&T:/${UserFb.ins().fbExpTotal}|`);
	}

	private flyExp(point, exp) {
		let movieExp: eui.Image = new eui.Image();
		movieExp.source = "point2";
		movieExp.anchorOffsetX = 20;
		movieExp.anchorOffsetY = 20;

		// let point: egret.Point = this.localToGlobal();
		// mon.parent.globalToLocal(point.x, point.y, point);
		movieExp.x = point.x;
		movieExp.y = point.y;

		this.addChild(movieExp);

		let _x: number = this.flyExpGroup.x + this.expTxt.x;
		let _y: number = this.flyExpGroup.y + this.expTxt.y + this.expTxt.height / 2;

		let t: egret.Tween = egret.Tween.get(movieExp);
		t.to({ x: _x, y: _y, alpha: 0.5 }, 800).call(() => {
			this.addExp(exp);
			this.removeChild(movieExp);
			egret.Tween.removeTweens(movieExp);
		}, this);

		let tt: egret.Tween = egret.Tween.get(movieExp, { "loop": true });
		tt.to({ "rotation": movieExp.rotation + 360 }, 800);
	}

	private leftFlyExp: number = 0;
	private curAddExp: number = 0;
	private curExp: number = 0;

	private rollExp() {
		let addExp = this.leftFlyExp > this.curAddExp ? this.curAddExp : this.leftFlyExp;
		this.leftFlyExp = this.leftFlyExp - addExp;
		this.curExp += addExp;

		this.setExp(this.curExp);

		if (this.leftFlyExp <= 0) {
			TimerManager.ins().remove(this.rollExp, this);
		}
	}

	private addExp(exp) {
		this.leftFlyExp += exp;
		this.curAddExp = Math.floor(this.leftFlyExp / 10);
		if (!TimerManager.ins().isExists(this.rollExp, this)) {
			TimerManager.ins().doTimer(30, 0, this.rollExp, this);
		}
	}

	private setExp(exp) {
		this.expTxt.text = exp + "";
		this.expTxt.anchorOffsetX = this.expTxt.width / 2;
	}

	private updateExpGroup([target, value]) {
		if (value > 0 || GameMap.fbType != UserFb.FB_TYPE_EXP) return;

		let configID = target.infoModel.configID;
		let config = GlobalConfig.ExpFbMonsterConfig[configID];
		if (!config) return;
		let parent = target.parent;
		if (!parent) {
			let role = EntityManager.ins().getNoDieRole();
			if (role) parent = role.parent;
		}

		if (parent) {
			let discount: number = GlobalConfig.MonthCardConfig.expFubenPrecent / 100;
			let addValue: number = Recharge.ins().getIsForeve() ? 1 + discount : 1;

			let point = parent.localToGlobal(target.x, target.y);
			this.flyExp(point, Math.ceil(config.exp * addValue));
		}
		this.updateKill();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.pkBossBtn:
				// this.applyFunc(MapFunc.SEND_PK_BOSS);
				// GameLogic.ins().startPkBoss();
				break;
			case this.escBtn:
				//如果主动退出的是关卡boss，则关闭自动挑战
				if (MineFight.ins().isFighting) {
					UserTips.ins().showTips(`掠夺矿中不可以退出`);
					return;
				}
				if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS)
					PlayFun.ins().closeAuto();
				//如果主动退出的是转生boss，则关闭自动复活
				if (ZsBoss.ins().isZsBossFb(GameMap.fubenID))
					UserBoss.ins().ShowTip = true;
				// this.applyFunc(MapFunc.EXIT_FB);
				//如果主动退出帮会战会有倒计时
				if (GuildWar.ins().getModel().checkinAppoint()) {
					ViewManager.ins().open(GuileWarReliveWin, 3);
					return;
				}
				//退出阵营战
				if (BattleCC.ins().isBattle()) {
					WarnWin.show(`是否退出仙魔战场，退出后有10秒进入CD`, () => {
						UserFb.ins().sendExitFb();
					}, this);

					return;
				}

				//退出泡点
				if (PaoDianCC.ins().isPaoDian) {
					WarnWin.show(`是否确定退出瑶池盛会？退出后将损失大量经验、威望奖励且有30秒进入CD`, () => {
						UserFb.ins().sendExitFb();
					}, this);

					return;
				}

				UserFb.ins().sendExitFb();
				// if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {
				// 	ViewManager.ins().open(GwResultView, GameMap.fubenID, 4)
				// }
				TimerManager.ins().remove(this.updateMijingTime, this);
				this.mijingpassTime = 0;
				break;
			case this.riseup://试炼鼓舞
				ViewManager.ins().open(GwMijingRiseUpView);
				break;
		}
	}

	private showSkillWord(img: string) {
		if (!img)
			return;
		egret.Tween.removeTweens(this.skillWordImg);
		let t = egret.Tween.get(this.skillWordImg);

		let fromX = StageUtils.ins().getWidth() / 2 - 150;
		let p = this.globalToLocal(fromX);
		this.skillWordImg.x = p.x;
		this.skillWordImg.y = 250;
		this.skillWordImg.source = img;
		this.skillWordImg.visible = true;
		this.skillWordImg.scaleX = 3;
		this.skillWordImg.scaleY = 3;
		this.skillWordImg.alpha = 1;
		let endX = this.skillWordImg.x - 50;
		t.to({ x: endX, y: 250, scaleX: 1, scaleY: 1 }, 150).wait(600).to({ alpha: 0 }, 350);
	}


	public destoryView(): void {
		//场景自动释放
	}
}

ViewManager.ins().reg(GameSceneView, LayerManager.Game_Bg);
