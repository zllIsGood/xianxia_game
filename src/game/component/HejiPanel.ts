class HejiPanel extends BaseView {
	private AttrBtn: eui.ToggleButton;
	private punchtogether1: eui.ToggleButton;
	private skillitem: PunchSkillItemRender;
	// private punchtogether2: eui.ToggleButton;

	private Punch: eui.Group;

	private Activation: eui.Group;
	//升级s
	// private UplevelBtn: eui.Button;

	private UplevelBtn1: eui.Button;
	//激活
	private UplevelBtn0: eui.Button;
	private preViewText: eui.Label;
	// private curNameTxt: eui.Label;
	// private curDescTxt: eui.Label;

	// private nextNameTxt: eui.Label;
	// private nextDescTxt: eui.Label;

	private mainGroup: eui.Group;

	private currTitleText: eui.Label;
	private currText0: eui.Label;
	private currText3: eui.Label;
	private currText5: eui.Label;
	private currText8: eui.Label;
	private nextTitleText: eui.Label;
	private nextText0: eui.Label;
	private nextText1: eui.Label;
	private nextText2: eui.Label;
	private nextText3: eui.Label;
	// private attTitle: string[] = ["乾", "巽", "坎", "艮", "坤", "震", "离", "兑"];

	/** 战斗力 */
	// private power: egret.DisplayObjectContainer;

	public clickGroup: eui.Group;

	public item1: PunchEquipItem;
	public item2: PunchEquipItem;
	public item3: PunchEquipItem;
	public item4: PunchEquipItem;
	public item5: PunchEquipItem;
	public item6: PunchEquipItem;
	public item7: PunchEquipItem;
	public item8: PunchEquipItem;

	private itemEff0: MovieClip;
	private itemEff1: MovieClip;
	private itemEff2: MovieClip;
	private itemEff3: MovieClip;
	private itemEff4: MovieClip;
	private itemEff5: MovieClip;
	private itemEff6: MovieClip;
	private itemEff7: MovieClip;
	private effArr: MovieClip[];
	private EffectGroup: eui.Group;

	private desc: eui.Label;

	private otherWhite: string = "#D1C28F";

	private colorWhite: string = "#ffd99d";
	private colorGray: string = "#757575";

	private otherWhiteN: number = 0xD1C28F;
	private colorWhiteN: number = 0xf8b141;
	private colorGrayN: number = 0x757575;

	// private colorWhite: string = "#35e62d";
	// private colorGray: string = "#7e6437";
	// private colorWhiteN: number = 0x35e62d;
	// private colorGrayN: number = 0x7e6437;
	private redPointEx: eui.Image;
	private redPointSo: eui.Image;
	// private powerGroup: eui.Group;
	private powerPanel: PowerPanel;
	private redPointAct: eui.Image;
	private fenjieBtn: eui.Button;
	private activeTipsTxt: eui.Label;

	private Punchpre: eui.Group;

	private RoleMc: eui.Image;
	private EnenyMc: eui.Image;
	private HejiSkillMc1: MovieClip;
	private HejiSkillMc2: MovieClip;
	private mcSkillID: string;
	private targetSkillID: string;
	private skillName: eui.Image;
	private skillIcon: eui.Image;
	private unActTextArr: string[] = ["装备3件印记大幅增强对玩家的伤害", "装备5件印记大幅增强对怪物的伤害", "装备8件印记大幅减少必杀冷却时间"];
	private jobId: number = 0;
	private turnPunchForge: eui.Button;//注灵入口
	private redPointPf: eui.Image;//注灵红点
	private PunchForge: PunchEquipForge;//注灵界面
	// private help: eui.Button;
	constructor() {
		super();
        this.skinName = "PunchEquip";
	}

	public childrenCreated(): void {
		this.init();
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public init(): void {
		// this.RoleMc = new eui.Image;
		// this.RoleMc.x = 100;
		// this.RoleMc.y = 100;
		// this.RoleMc.source = "resource/skins/skill/punchpre1.png";
		// this.Punchpre.addChild(this.RoleMc);

		// this.EnenyMc = new eui.Image;
		// this.EnenyMc.x = 300;
		// this.EnenyMc.y = 300;
		// this.EnenyMc.source = RES_DIR_MONSTER + "monster10128_0h.png";
		// this.Punchpre.addChild(this.EnenyMc);

		this.HejiSkillMc2 = new MovieClip;
		this.HejiSkillMc2.x = 200;
		this.HejiSkillMc2.y = 300;
		this.Punchpre.addChild(this.HejiSkillMc2);

		this.HejiSkillMc1 = new MovieClip;
		this.HejiSkillMc1.x = 395;
		this.HejiSkillMc1.y = 390;
		this.Punchpre.addChild(this.HejiSkillMc1);

		this.preViewText.textFlow = new egret.HtmlTextParser().parser(`<font color = '#23C42A'><u>${this.preViewText.text}</u></font>`);

		this.effArr = []
		for (let i: number = 0; i < 8; i++) {
			this[`itemEff${i}`] = new MovieClip();
			this[`itemEff${i}`].x = 177;
			this[`itemEff${i}`].y = 174;
			this[`itemEff${i}`].rotation = i * 45;
			this[`itemEff${i}`].touchEnabled = false
			this.effArr.push(this[`itemEff${i}`]);
		}
		this.jobId = SubRoles.ins().getSubRoleByIndex(0).job;
		//策划要求，因为资源问题，写死处理
		this.mcSkillID = `fashikoskill`;//[`shifa2`, `wenjing003`, `wanyanxiu003`][this.jobId - 1];
		this.targetSkillID = `fashikoskillsj2`;//[`wanyanzheng002`, `wenjing007`, `sikongqi005`][this.jobId - 1];
		// this.mcSkillID = `skill40${this.jobId}`;
		// let num = 403 + this.jobId;
		// this.targetSkillID = `skill${num}`;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.UplevelBtn0, this.onClick);
		this.addTouchEvent(this.UplevelBtn1, this.onClick);
		this.addTouchEvent(this.AttrBtn, this.onClick);
		this.addTouchEvent(this.punchtogether1, this.onClick);
		this.addTouchEvent(this.preViewText, this.onClick);
		this.addTouchEvent(this.skillitem, this.onClick);
		this.addTouchEvent(this.clickGroup, this.onClick)
		this.addTouchEvent(this.fenjieBtn, this.onClick);
		this.addTouchEvent(this.turnPunchForge, this.onClick);
		// this.addTouchEvent(this.help, () => {
		// 	ViewManager.ins().open(ZsBossRuleSpeak, 26);
		// });
		this.observe(UserSkill.ins().postHejiUpdate, this.setData);
		this.observe(UserSkill.ins().postHejiEquipChange, this.setData);
		this.observe(Actor.ins().postUpdateTogeatter, this.setData);
		this.observe(Actor.ins().postUpdateTogeatter, this.setRedPoint);
		this.observe(UserFb.ins().postGqIdChange, this.setRedPoint);
		this.observe(UserBag.ins().postItemAdd, this.addItem);
		this.observe(UserBag.ins().postItemDel, this.setRedPoint);
		this.observe(UserSkill.ins().postHejiInfo, this.showActive);
		this.resetData();
		this.setData();
		this.setRedPoint();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.UplevelBtn0, this.onClick);
		this.removeTouchEvent(this.UplevelBtn1, this.onClick);
		this.removeTouchEvent(this.AttrBtn, this.onClick);
		this.removeTouchEvent(this.punchtogether1, this.onClick);
		this.removeTouchEvent(this.skillitem, this.onClick);
		this.removeTouchEvent(this.preViewText, this.onClick);
		this.removeTouchEvent(this.fenjieBtn, this.onClick);
		this.removeTouchEvent(this.turnPunchForge, this.onClick);
		this.removeAllEffect();
		this.removeObserve();
		TimerManager.ins().removeAll(this);
		this.PunchForge.visible = false;
		this.PunchForge.close();
	}

	private resetData(): void {
		this.validateNow();
		for (let i: number = 1; i < 9; i++) {
			this["item" + i].data = null;
		}
	}

	private addItem() {
		this.refushPanelInfo();
		this.setRedPoint();
	}

	protected onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.UplevelBtn1:
				if (UserFb.ins().guanqiaID < UserSkill.ACTIVE_LEVEL) {
					UserTips.ins().showTips(`通关到第${UserSkill.ACTIVE_LEVEL}关开启`);
				} else {
					this.Activation.visible = UserSkill.ins().hejiLevel > 0 ? false : true;
					UserSkill.ins().sendGrewUpHejiSkill();
				}
				break;
			case this.AttrBtn:
				ViewManager.ins().open(PunchEquipAttrWin);
				break;
			case this.punchtogether1:
				ViewManager.ins().open(PunchExchangeWin);
				break;
			case this.skillitem:
				ViewManager.ins().open(PunchSkillTipsWin);
				break;
			case this.preViewText:
				ViewManager.ins().open(PunchExtShowWin);
				break;
			// case this.clickGroup:
			// 	let equipArr = UserSkill.ins().equipListData
			// 	for (let k in equipArr) {
			// 		if (equipArr[k] && equipArr[k].configID != 0) {
			// 			return;
			// 		}
			// 	}
			// 	UserWarn.ins().setBuyGoodsWarn(910000, 1);
			// 	break;
			case this.fenjieBtn:
				ViewManager.ins().open(PunchResWin);
				break;
			case this.turnPunchForge:
				this.Activation.visible = false;
				this.Punchpre.visible = false;
				this.Punch.visible = false;
				this.PunchForge.visible = true;
				this.PunchForge.open();
				break;
		}
	}
	//激活必杀特效面板
	private showActive(map: any) {
		let isAct = map.isAct;
		if (isAct) {
			let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
			let skid = config.skill_id;
			let img = skid[0].toString();
			Activationtongyong.show(0, "必杀", `j${img}_png`);
		}
	}

	private setRedPoint(): void {
		this.redPointEx.visible = UserSkill.ins().canExchange();
		this.redPointSo.visible = UserSkill.ins().canSolve();
		this.redPointAct.visible = UserSkill.ins().canAcitve();
		this.redPointPf.visible = UserSkill.ins().getPunchForge().getRedPoint();
	}

	private playSkillAnmi(): void {
		// egret.Tween.removeTweens(this.RoleMc);
		let t: egret.Tween = egret.Tween.get(this.Punchpre);//(this.RoleMc);
		if (!this.HejiSkillMc1.parent) this.Punchpre.addChild(this.HejiSkillMc1);
		this.HejiSkillMc1.playFile(`${RES_DIR_SKILLEFF}${this.mcSkillID}`, 1, null, true);
		t.wait(1500).call(() => {
			if (!this.HejiSkillMc2.parent) this.Punchpre.addChild(this.HejiSkillMc2);
			this.HejiSkillMc2.playFile(`${RES_DIR_SKILLEFF}${this.targetSkillID}`, 1, null, true);
		}, this);
	}

	private setData(): void {
		let len: number = SubRoles.ins().subRolesLen
		if (UserSkill.ins().hejiLevel <= 0) {
			this.Activation.visible = true;
			this.Punchpre.visible = false;
			this.Punch.visible = false;
			this.PunchForge.visible = false;
			this.activeTipsTxt.text = `闯关达到 第${UserSkill.ACTIVE_LEVEL}关 即可开启必杀技能`;
			return;
		}
		else {
			if (Actor.level >= 60) { // 等级大于60开启
				if (this.PunchForge.visible) {
					this.Punch.visible = false;
				} else {
					this.Punch.visible = true;
					this.PunchForge.visible = false;
				}
				this.Activation.visible = false;
				this.Punchpre.visible = false;
				this.setPunchView();
				this.setPunch2View();
				this.refushPanelInfo();
				this.checkShowEff();
			} else {
				this.setPunchpreView();
			}
		}
	}

	private setPunchpreView(): void {
		TimerManager.ins().remove(this.playSkillAnmi, this);
		this.Activation.visible = false;
		this.Punch.visible = false;
		this.Punchpre.visible = true;
		this.PunchForge.visible = false;
		this.skillName.source = `8000${this.jobId}_png`;
		// let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
		// let curSkill: SkillData = new SkillData(config.skill_id[this.jobId - 1]);
		// this.skillIcon.source = `koskill_zzb_json.koskill_icon_00${this.jobId}`;
		TimerManager.ins().doTimer(3000, 0, this.playSkillAnmi, this);
		this.playSkillAnmi();
	}

	private checkShowEff(): void {
		// this.setData();
		let equipList: ItemData[] = UserSkill.ins().equipListData;
		let num: number = -1;
		let len: number = equipList.length;
		if (equipList && equipList.length != 8)
			return;

		for (let i: number = 0; i < len; i++) {
			let item: ItemData = equipList[i];
			if (item && item.itemConfig) {
				if (num == -1) {
					num = (item.itemConfig.zsLevel || 0) * 10000 + item.itemConfig.level;
				} else {
					let tempLv: number = (item.itemConfig.zsLevel || 0) * 10000 + item.itemConfig.level
					if (num != tempLv) {
						this.removeAllEffect();
						return;
					}
				}
			} else {
				return;
			}
		}
		this.playAllEffect();
	}

	private setPunch2View(): void {
		let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
		let curSkill: SkillData = new SkillData(config.skill_id[this.jobId - 1]);
		this.skillitem.setData(curSkill);
	}

	private destructor(): void {

	}

	private updateRedPoint(isOpens: boolean[]): void {

	}

	private refushPanelInfo(): void {
		let attData: AttributeData[] = [];
		for (let i: number = 1; i < 9; i++) {
			this["item" + i].data = i - 1;

			let item = UserSkill.ins().equipListData[i - 1];
			if (attData.length == 0) {
				attData = item.att;
			} else {
				attData = AttributeData.AttrAddition(attData, item.att);
			}
		}
		this.powerPanel.setPower(this.countAllAttNum());
		this.validateNow();
		this.updateForge();
	}

	private refushOne(index: number): void {
		this["item" + (index + 1)].data = index;
		if (ViewManager.ins().isShow(PunchEquipChooseWin))
			ViewManager.ins().close(PunchEquipChooseWin);
		// BitmapNumber.ins().changeNum(this.power, this.countAllAttNum(), "8", 2);
		this.powerPanel.setPower(this.countAllAttNum());
	}

	private countAllAttNum(): number {
		let equipList: ItemData[] = UserSkill.ins().equipListData;
		let num: number = 0;
		let len: number = equipList.length;
		if (equipList && equipList.length <= 0)
			return 0;

		for (let i: number = 0; i < len; i++) {
			let item: ItemData = equipList[i];
			if (item && item.configID) {
				num += item.point;
			}
		}
		return num * SubRoles.ins().subRolesLen;
	}



	private playAllEffect(): void {
		for (let i: number = 0; i < this.effArr.length; i++) {
			if (!this.effArr[i].parent) {
				this.effArr[i].playFile(RES_DIR_EFF + "hejizbjihuoeff", -1);
				this.EffectGroup.addChild(this[`itemEff${i}`]);
			}
		}
	}

	private removeAllEffect(): void {
		for (let i: number = 0; i < this.effArr.length; i++) {
			if (this.effArr[i].parent) {
				DisplayUtils.removeFromParent(this[`itemEff${i}`]);
			}
		}
	}

	private setPunchView(): void {
		let config = UserSkill.ins().qimingAttrDic;
		let zsLv: number = 0;
		let lv: number = 0;
		let nextZslv: number = 0;
		let nextLv: number = 0;
		let currConfig;
		let nextConfig;
		let string1: string = "";
		let string2: string = "";
		let color1: string = "";
		let color2: string = "";


		this.currText3.text = "";
		this.currText5.text = "";
		this.currText8.text = "";

		this.nextText1.text = "";
		this.nextText2.text = "";
		this.nextText3.text = "";

		let currCount: number = 0;
		let nextCount: number = 0;


		if (config && CommonUtils.getObjectLength(config) > 0) {
			for (let k in config) {
				for (let i in config[k]) {
					zsLv = config[k][i].zslv;
					lv = config[k][i].lv;
				}
			}
			nextZslv = zsLv + 1;
			nextLv = 80;
			currConfig = GlobalConfig.TogetherHitEquipQmConfig[zsLv][lv];
			this.paserText("currText", currConfig, config[zsLv * 10000 + lv]);
		} else {
			this.currTitleText.text = "无";
			this.currText0.text = "";
			this.currText3.text = "";
			this.currText5.text = "";
			this.currText8.text = "";
			zsLv = 0;
			lv = 60;
			nextZslv = 1;
			nextLv = 80;

			currConfig = GlobalConfig.TogetherHitEquipQmConfig[zsLv][lv];
			this.paserText("currText", currConfig);
		}
		for (let j: number = 0; j < UserSkill.ins().equipListData.length; j++) {
			let item = UserSkill.ins().equipListData[j].itemConfig;
			if (item) {
				let zsLevel = item.zsLevel ? item.zsLevel : 0;
				let level = item.level ? item.level : 1;
				if (zsLevel >= zsLv && level >= lv) {
					color1 = this.colorWhite;
					currCount++;
				} else {
					color1 = this.colorGray;
				}

				if (zsLevel >= nextZslv && level >= nextLv) {
					color2 = this.colorWhite;
					nextCount++;
				} else {
					color2 = this.colorGray;
				}
			} else {
				color1 = color2 = this.colorGray;
			}
			string1 += `<font color=${color1}>${Role.hejiPosName[j]}  </font>`;
		}
		this.currTitleText.text = zsLv > 0 ? `${zsLv}转齐鸣套装 (${currCount}/8)` : `${lv}级齐鸣套装 (${currCount}/8)`;

		this.currText0.textFlow = (new egret.HtmlTextParser()).parser(string1);

		this.preViewText.x = this.currTitleText.x + this.currTitleText.textWidth + 10;
	}

	private paserText(labName: string, config: any, comparePareConfig: any = null) {
		/** 新显示规则 **/
		let attrs: Map<number> = {};//每个阶段的数量 1转=10000
		let equipListData: ItemData[] = UserSkill.ins().equipListData;
		let sum: number = 0;//所有阶级总件数
		let colorMap: Map<number> = {};//套装颜色集
		for (let k in equipListData) {
			if (equipListData[k].configID != 0) {
				let item: ItemConfig = equipListData[k].itemConfig;
				let lv: number = (item.zsLevel || 0) * 10000 + item.level;
				if (!attrs[lv])
					attrs[lv] = 0;
				attrs[lv] += 1;
				sum++;
				colorMap[lv] = ItemConfig.getQualityColor(item);
			}
		}
		let preSum: number = 0;//上一阶数量
		for (let index in attrs) {
			preSum = attrs[index];
			attrs[index] = sum;//(最低阶是总件数 因为高阶覆盖低阶)
			sum -= preSum;//除去当阶剩余高阶件数
		}

		let descArr: Map<string> = {};//套件属性描述
		let cfg: TogetherHitEquipQmConfig[][][] = GlobalConfig.TogetherHitEquipQmConfig;
		for (let zslv in cfg) {
			for (let lv in cfg[zslv]) {
				for (let i in attrs) {//每阶总套数(高阶包括在低阶中)
					if (Number(i) == Number(zslv) * 10000 + Number(lv)) {//转生数和等级相同
						let tf;
						for (let j in cfg[zslv][lv]) {//套件数
							let str = "";
							if (attrs[i] >= Number(j)) {
								if (Number(zslv)) {
									str = `|C:${colorMap[i]}&T:${zslv}转${j}件套:|C:${this.otherWhiteN}&T:${cfg[zslv][lv][j].desc}`;
								} else {
									str = `|C:${colorMap[i]}&T:${lv}级${j}件套:|C:${this.otherWhiteN}&T:${cfg[zslv][lv][j].desc}`;
								}
								descArr[j] = str;
								tf = TextFlowMaker.generateTextFlow1(str);
							} else {
								//没有描述就不亮起 并且是最低阶
								if (!descArr[j]) {
									let minCfg: TogetherHitEquipQmConfig[][][] = GlobalConfig.TogetherHitEquipQmConfig;
									for (let c1 in minCfg) {
										for (let c2 in minCfg[c1]) {
											str = `|C:${colorMap[i]}&T:${c2}级${j}件套:|C:${this.otherWhiteN}&T:${cfg[c1][c2][j].desc}`;
											tf = TextFlowMaker.generateTextFlow1(str);
											for (let f of tf) {
												if (f.style) {
													delete f.style.textColor;//删掉富文本颜色
												}
											}
											this[`${labName}${j}`].textColor = this.colorGrayN;
											break;
										}
										break;
									}
								}
							}
							if (str)
								this[`${labName}${j}`].textFlow = tf;
						}
						break;//Number(i) == Number(zslv) * 10000 + Number(lv)
					}
				}
				break;
			}
		}



		/** 原显示规则 **/
		// let len: number = 0;
		// for (let i in config) {
		// 	let totalAttr = config[i].exAttr[0];
		// 	let str = '';
		// 	let tf;
		// 	if (UserSkill.ins().qimingValueDic && comparePareConfig && comparePareConfig[i]) {
		// 		let value: number = UserSkill.ins().qimingValueDic[i].value / 100;
		// 		str = `${config[i].desc}`;
		// 		tf = TextFlowMaker.generateTextFlow1(str);
		// 		this[`${labName}${i}`].textColor = this.otherWhiteN;
		// 		len++;
		// 	} else {
		// 		str = `${config[i].desc}`;
		//
		// 		tf = TextFlowMaker.generateTextFlow1(str);
		// 		for (let f of tf) {
		// 			if (f.style) {
		// 				delete f.style.textColor;//删掉富文本颜色
		// 			}
		// 		}
		// 		this[`${labName}${i}`].textColor = this.colorGrayN;
		// 	}
		//
		// 	this[`${labName}${i}`].textFlow = tf;
		// 	// count++;
		// }
	}
	//注灵
	private updateForge() {
		this.turnPunchForge.visible = UserSkill.ins().getPunchForge().isShowPunchEquipForge();

	}
}
