class HuanShouSkinPanel extends BaseView {
	private bar: eui.Group;
	private huanshou: eui.Group;
	private group2: eui.Group;
	private btn2: eui.Button;
	private rightRed2: eui.Image;
	private group0: eui.Group;
	private btn0: eui.Button;
	private rightRed0: eui.Image;
	private bg: eui.Image;
	private listScroller0: eui.Scroller;
	private list0: eui.List;
	private upBtn0: eui.Button;
	private upBtnEx0: eui.Button;
	private upRedPoint0: eui.Image;
	private upBtn1: eui.Button;
	private icon0: eui.Image;
	private countLabel0: eui.Label;
	private countLabel1: eui.Label;
	private curAtt0: eui.Label;
	private nextAtt0: eui.Label;
	private list1: eui.List;
	private talentSkill: HuanShouSkinTalentSkill;
	private huanshouName: eui.Image;
	private fabaoName0: eui.Image;
	private huanhua0: eui.Button;
	private max: eui.Group;
	private power: eui.Group;

	public powerPanel: PowerPanel;
	private barMask: egret.Shape;
	private hsMC: HuanShouMc;
	private expEff: MovieClip;
	private skillData: eui.ArrayCollection;
	private listData: eui.ArrayCollection;
	private showZLlist: HuanShouSkinConf[];//所显示的皮肤列表
	private renderItem: HuanShouSkinItem;

	private _isAutoUp: boolean = false;

	public constructor() {
		super();
	}

	public init() {
		this.list1.itemRenderer = HuanShouSkinSkillItem;
		this.skillData = new eui.ArrayCollection();
		this.list1.dataProvider = this.skillData;

		this.list0.itemRenderer = HuanShouSkinItem;
		this.listData = new eui.ArrayCollection();
		this.list0.dataProvider = this.listData;
		this.showZLlist = [];

		this.barMask = new egret.Shape();
		this.barMask.rotation = 122;
		this.barMask.touchEnabled = false;
		this.bar.addChild(this.barMask);
		this.expEff = new MovieClip();
		this.expEff.mask = this.barMask;

		this.hsMC = new HuanShouMc();
		this.huanshou.addChild(this.hsMC);

		this.countLabel1.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.countLabel1.text}|`);

		this.bar.x+=1.5;
		this.bar.y-=2;
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public open(): void {
		this.addTouchEvent(this.talentSkill, this.onTouch);
		this.addTouchEvent(this.icon0, this.onTouch);
		this.addTouchEvent(this.upBtn0, this.onTouch);
		this.addTouchEvent(this.huanhua0, this.onTouch);
		this.addTouchEvent(this.upBtnEx0, this.onTouch);
		this.addTouchEvent(this.btn2, this.onTouch);
		this.addTouchEvent(this.btn0, this.onTouch);
		this.addTouchEvent(this.countLabel1, this.onTouch);
		this.addChangeEvent(this.listScroller0, this.onShowScrollChange);
		this.addEvent(eui.ItemTapEvent.ITEM_TAP, this.list0, this.onSkinList);
		this.addEvent(eui.ItemTapEvent.ITEM_TAP, this.list1, this.onSkillList);
		this.observe(UserHuanShou.ins().postSkinTrainInfo, this.updateTrain);
		this.observe(UserHuanShou.ins().postTalentSkill, this.updateTalent);
		this.observe(UserHuanShou.ins().postHuanShouChange, this.updateChange);
		this.observe(HuanShouRedPoint.ins().postSkinTotalRed, this.updateRedPoint2);
		this.observe(UserBag.ins().postItemChange,this.BuyItemUpdataRed);

		this.updateSkinList();
		TimerManager.ins().doNext(() => {
			this.list0.selectedIndex = 0;
			this.list0.dispatchEvent(new egret.Event(eui.ItemTapEvent.ITEM_TAP));
			this.scroll();
		}, this);

		this.expEff.mask = this.barMask;
	}

	public close(): void {
		this._isAutoUp = false;
		this.updateAutoBtn();
		this.expEff.mask = null;
	}

	//界面元宝购买进阶丹，更新红点
	private BuyItemUpdataRed():void{
		this.updateCost();
		this.updateRedPoint();
		this.updateRedPoint2();
		this.onSkinList();
	}

	private showIconTips() {
		if (this.currentState == "nomal") {
			let skinData = UserHuanShou.ins().skinList[this.selectId];
			let conf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][skinData.trainCount];
			if (conf)
				ViewManager.ins().open(ItemDetailedWin, 0, conf.itemId)
		} else if (this.currentState == "jihuo") {
			let conf = GlobalConfig.HuanShouSkinConf[this.selectId];
			ViewManager.ins().open(HuanShouSkinTips, conf.itemId);
		}
	}

	private scroll(): void {
		this.listScroller0.viewport.scrollV = this.listScroller0.viewport.contentHeight * (this.list0.selectedIndex / this.showZLlist.length);
		let move: number = this.listScroller0.viewport.height;
		if (this.listScroller0.viewport.scrollV > this.listScroller0.viewport.contentHeight - move) {
			if (this.listScroller0.viewport.contentHeight - move > 0)
				this.listScroller0.viewport.scrollV = this.listScroller0.viewport.contentHeight - move;
			else
				this.listScroller0.viewport.scrollV = 0;
		}

		this.onShowScrollChange();
	}

	private onTouch(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.talentSkill:
				if (HuanShouRedPoint.ins().skinListTalentRed[this.selectId]) {
					UserHuanShou.ins().sendUpgradeSkinTalent(this.selectId);
				} else {
					let talentData = this.talentSkill.data as TalentSkillData;
					let talentconf = talentData.conf;
					if (talentData)
						ViewManager.ins().open(HuanShouSkinTalentTips, this.selectId, talentconf.level, talentconf.skillInfo);
				}
				break;
			case this.icon0:
				this.showIconTips();
				break;
			case this.upBtnEx0://激活
				if (HuanShouRedPoint.ins().skinListRed[this.selectId]) {
					UserHuanShou.ins().sendTrainSkin(this.selectId);
				} else {
					let conf = GlobalConfig.HuanShouSkinConf[this.selectId];
					let itemConf: ItemConfig = GlobalConfig.ItemConfig[conf.itemId];
					UserTips.ins().showTips(`|C:0xff0000&T:${itemConf.name}不足`);
				}
				break;
			case this.countLabel1:
				if (this.itemId > 0)
					UserWarn.ins().setBuyGoodsWarn(this.itemId);
				break;
			case this.upBtn0:
				if (this.currentState == "nomal") {
					if (!this._isAutoUp) {
						if (HuanShouRedPoint.ins().skinListRed[this.selectId])
							UserHuanShou.ins().sendTrainSkin(this.selectId);
						else {
							let skinData = UserHuanShou.ins().skinList[this.selectId];
							let conf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][skinData.trainCount];
							if (!conf)
								return;
							let itemConf: ItemConfig = GlobalConfig.ItemConfig[conf.itemId];
							UserTips.ins().showTips(`|C:0xff0000&T:${itemConf.name}不足`);
						}
					}
				} else {
					UserHuanShou.ins().sendTrainSkin(this.selectId);
				}
				break;
			case this.upBtn1://一键
				if (this.upBtn1.label == "取 消") {
					this._isAutoUp = false;
				} else {
					this._isAutoUp = true;
					this.sendAutoFun();
				}
				this.updateAutoBtn();
				break;
			case this.huanhua0:
				if (UserHuanShou.ins().skinList[this.selectId]) {
					UserHuanShou.ins().sendHuanShouChange(0, this.selectId);
				}
				break;
			case this.btn2://上
				let move: number = this.listScroller0.viewport.height;
				if (this.listScroller0.viewport.scrollV - move <= move)
					this.listScroller0.viewport.scrollV = 0;
				else
					this.listScroller0.viewport.scrollV -= move;
				this.onShowScrollChange();
				break;
			case this.btn0://下
				move = this.listScroller0.viewport.height;
				if (this.listScroller0.viewport.scrollV + move > this.listScroller0.viewport.contentHeight - move)
					this.listScroller0.viewport.scrollV = this.listScroller0.viewport.contentHeight - move;
				else
					this.listScroller0.viewport.scrollV += move;
				this.onShowScrollChange();
				break;
		}
	}

	private onShowScrollChange(): void {
		let move: number = this.listScroller0.viewport.height;

		this.group2.visible = this.listScroller0.viewport.scrollV > 0;
		this.group0.visible = this.listScroller0.viewport.scrollV < (this.listScroller0.viewport.contentHeight - move);
	}

	private updateChange(): void {
		this.updateSkinChange();
	}

	private updateTalent(): void {
		this.updateSkill();
		this.updateValue();
		this.updateSkinList(true);
	}

	private updateTrain(...param): void {
		let oldRank = param[0];
		let rank = param[1];
		if (oldRank != -1 && rank > oldRank) {
		}
		this.updateSkinList(rank > oldRank);
		this.updateView();
	}

	private updateAutoBtn(): void {
		// if (this._isAutoUp) {
		// 	this.upBtn1.label = "取 消";
		// } else {
		// 	this.upBtn1.label = "一键升星";
		// }
	}

	private maxCount: number = 0;

	private onSkinList(): void {
		if (this.list0.selectedItem) {
			let item = this.list0.selectedItem as HuanShouSkinConf;
			this.selectId = item.skinId;
			this.maxCount = CommonUtils.getObjectLength(GlobalConfig.HuanShouSkinTrainConf[this.selectId]) - 1;
			this.updateView();
			this.renderItem && this.renderItem.setSelect(false);
			this.renderItem = this.list0.getVirtualElementAt(this.list0.selectedIndex) as HuanShouSkinItem;
			this.renderItem.setSelect(true);
		}
	}

	private onSkillList(): void {
		if (this.list1.selectedItem) {
			let skillData = this.list1.selectedItem as HSSkinSkillData;
			ViewManager.ins().open(HuanShouSkinSkillTips, this.selectId, skillData.conf.stage, skillData.conf.skillInfo);
		}
	}

	private updateView(): void {
		if (!this.expEff.parent) {
			this.expEff.once(egret.Event.CHANGE, this.updateDown, this);
			this.expEff.playFile(`${RES_DIR_EFF}huanshoubar`, -1);
			this.bar.addChild(this.expEff);
		}
		this.updateState();
		this.updateModel();
		this.updateSkill();
		this.updateDown();
		this.updateCost();
		this.updateValue();
		this.updateSkinChange();
		this.updateRedPoint();
		if (this._isAutoUp) {
			TimerManager.ins().doTimer(180, 1, this.sendAutoFun, this);
		}
	}

	private sendAutoFun(): void {
		// if (NewWarSpirit.ins().isUpGradeByStar(this.zlId)) {
		// 	NewWarSpirit.ins().sendZhanLingUpExp(this.zlId);
		// }
		// else {
		// 	this._isAutoUp = false;
		// 	UserTips.ins().showTips(`|C:0xff0000&T:天仙进阶丹不足`);
		// }
	}

	private updateSkinChange(): void {
		if (UserHuanShou.ins().skinList[this.selectId]) {
			this.huanhua0.visible = UserHuanShou.ins().skinChangeId != this.selectId;
		} else {
			this.huanhua0.visible = false;
		}
		this.listData.replaceAll(this.listData.source);
	}

	//战力属性等数值
	private updateValue() {
		let attrs: AttributeData[] = [];
		let powerNum: number = 0;
		let zlData = UserHuanShou.ins().skinList[this.selectId];
		let config = GlobalConfig.HuanShouSkinConf[this.selectId];
		if (zlData) {
			let nextAttrs: AttributeData[] = [];
			let talent = config.talentId;
			let lv = zlData.talentLv;
			let tatconfig = GlobalConfig.HuanShouTalentConf[talent][lv];

			let talentAttrs = AttributeData.getAttrFilter(tatconfig.attr, GlobalConfig.HuanShouConf.talentAttrs);
			attrs = AttributeData.AttrChangeAddition(attrs, talentAttrs);
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, talentAttrs);
			powerNum = UserBag.getAttrPower(tatconfig.attr);
			//加入天赋技能战力
			if (tatconfig.power) {
				powerNum += tatconfig.power;
			}
			let stageConfList = GlobalConfig.HuanShouSkinStageConf[this.selectId];
			let stageConf = stageConfList[zlData.rank];
			//加入技能战力与属性
			if (stageConf) {
				attrs = AttributeData.AttrChangeAddition(attrs, stageConf.attr);
				powerNum += UserBag.getAttrPower(stageConf.attr);
				if (stageConf.skillPower) {
					powerNum += stageConf.skillPower;
				}
				if (stageConf.skillAttr) {
					attrs = AttributeData.AttrChangeAddition(attrs, stageConf.skillAttr);
					powerNum += UserBag.getAttrPower(stageConf.skillAttr);
				}
			}
			let trainConf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][zlData.trainCount];
			attrs = AttributeData.AttrChangeAddition(attrs, trainConf.attr);
			powerNum += UserBag.getAttrPower(trainConf.attr);

			this.curAtt0.text = AttributeData.getAttStr(attrs, 0, 1, "：");

			//下级

			if (zlData.trainCount < this.maxCount) {
				if (zlData.exp >= stageConf.exp) {
					//升阶
					stageConf = stageConfList[zlData.rank + 1];
					nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, trainConf.attr);//加上当前培养属性
					nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, stageConf.attr);
				} else {
					trainConf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][zlData.trainCount + 1];
					if (!trainConf) return;
					nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, trainConf.attr);
					//加上当前阶属性
					nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, stageConf.attr);
				}
				if (stageConf.skillAttr) {
					nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, stageConf.skillAttr);
				}
				this.nextAtt0.text = AttributeData.getAttStr(nextAttrs, 0, 1, "：");
			} else {
				this.nextAtt0.text = "";
			}
		} else {
			let trainConf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][0];
			let stageConf = GlobalConfig.HuanShouSkinStageConf[this.selectId][1];
			if (trainConf && stageConf) {
				attrs = AttributeData.AttrChangeAddition(attrs, trainConf.attr);
				attrs = AttributeData.AttrChangeAddition(attrs, stageConf.attr);
				let newAttrs = AttributeData.getAttrStarAdd(attrs, 0);
				this.curAtt0.text = AttributeData.getAttStr(newAttrs, 0, 1, "：");
				this.nextAtt0.text = AttributeData.getAttStr(attrs, 0, 1, "：");
			} else {
				this.curAtt0.text = "";
				this.nextAtt0.text = "";
			}
		}
		let rolelen = SubRoles.ins().subRolesLen;
		this.powerPanel.setPower(powerNum * rolelen);
	}

	private itemId: number = 0;

	private updateCost() {
		let zlData = UserHuanShou.ins().skinList[this.selectId];
		let curCount = 0;
		let totalCount = 0;

		if (zlData) {
			if (zlData.trainCount < this.maxCount) {
				let conf = GlobalConfig.HuanShouSkinTrainConf[this.selectId][zlData.trainCount];
				if (!conf)
					return;
				this.itemId = conf.itemId;
				curCount = UserBag.ins().getItemCountById(0, this.itemId);
				totalCount = conf.count;
			}
		} else {
			//未激活
			let conf = GlobalConfig.HuanShouSkinConf[this.selectId];
			this.itemId = conf.itemId;
			curCount = UserBag.ins().getItemCountById(0, this.itemId);
			totalCount = conf.count;
		}

		if (this.itemId) {
			let config: ItemConfig = GlobalConfig.ItemConfig[this.itemId];
			this.icon0.source = config.icon + "_png";
		}
		let color = curCount >= totalCount ? 0x00ff00 : 0xff0000;
		this.countLabel0.textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:${curCount}|/${totalCount}`);
	}

	//进度条
	private updateDown() {
		let zlData: HSSkinData;
		if (this.selectId) {
			//如果是皮肤判定是否激活 未激活不显示
			zlData = UserHuanShou.ins().skinList[this.selectId];
		}
		let per: number = 1;//未激活就显示满
		if (zlData) {
			let tempValue = 0;
			let conf = GlobalConfig.HuanShouSkinStageConf[this.selectId][zlData.rank];
			if (zlData.rank > 1) {
				let temp = GlobalConfig.HuanShouSkinStageConf[this.selectId][zlData.rank - 1];
				tempValue = temp.exp;
			}

			per = (zlData.exp - tempValue) / (conf.exp - tempValue);
		}

		let init = 0;
		let max = 296;
		DisplayUtils.drawCir(this.barMask, this.expEff.width / 2, init + Math.floor(max * per), false,init);
	}

	private skillList: { [key: number]: HSSkinSkillData[] } = [];
	private talentData: TalentSkillData;
	//技能
	private updateSkill() {
		let zlData = UserHuanShou.ins().skinList[this.selectId];
		let config = GlobalConfig.HuanShouSkinConf[this.selectId];
		if (!config) return;
		let talentLv = zlData ? zlData.talentLv : 1;
		let talentConf = GlobalConfig.HuanShouTalentConf[config.talentId][talentLv];
		if (!this.talentData) {
			this.talentData = new TalentSkillData();
		}
		this.talentData.conf = talentConf;
		this.talentData.skinId = this.selectId;
		this.talentSkill.data = this.talentData;

		let stage = zlData ? zlData.rank : 1;
		if (!this.skillList[this.selectId]) {
			this.skillList[this.selectId] = [];
			let confs: HuanShouSkinStageConf[] = GlobalConfig.HuanShouSkinStageConf[this.selectId];
			for (let key in confs) {
				if (!confs[key].skillInfo)
					continue;
				let obj = new HSSkinSkillData();
				obj.conf = confs[key];
				obj.stage = stage;
				this.skillList[this.selectId].push(obj);
			}
		} else {
			let len = this.skillList[this.selectId].length;
			for (let i = 0; i < len; i++) {
				this.skillList[this.selectId][i].stage = stage;
			}
		}
		this.skillData.replaceAll(this.skillList[this.selectId]);
	}

	private selectId: number = 0;

	private updateState() {
		let zlData = UserHuanShou.ins().skinList[this.selectId];
		let rank = zlData ? zlData.rank : 1;
		let conflist = GlobalConfig.HuanShouSkinStageConf[this.selectId];

		let statename: string = "";
		this.bar.visible = true;
		if (!zlData) {
			statename = "jihuo";//激活
			this.bar.visible = false;
		} else if (this.maxCount <= zlData.trainCount) {
			statename = "max";//满阶满级
		} else {
			let conf = conflist[rank];
			if (zlData.exp < conf.exp) {
				statename = "nomal";//升星
			} else {
				statename = "upgrade";//升阶
			}
		}
		if (statename != this.currentState) {
			this.currentState = statename;
			this.validateNow();
		}
	}

	static sortHuanShouSkin(a: HuanShouSkinConf, b: HuanShouSkinConf): number {
		if (a.sort > b.sort) {
			return 1;
		}
		return -1;
	}

	private updateSkinList(b: boolean = false): void {
		this.showZLlist.length = 0;
		for (let k in GlobalConfig.HuanShouSkinConf) {
			this.showZLlist.push(GlobalConfig.HuanShouSkinConf[k]);
		}
		this.showZLlist.sort(HuanShouSkinPanel.sortHuanShouSkin);
		this.listData.replaceAll(this.showZLlist);
		if (!this.list0.dataProvider || b) {
			this.list0.dataProvider = this.listData;
		}
		this.list0.validateNow();

		this.updateRedPoint2();
	}

	private updateModel() {
		let zlData = UserHuanShou.ins().skinList[this.selectId];
		let level = zlData ? zlData.rank : 1;
		let cfg = GlobalConfig.HuanShouSkinConf[this.selectId];
		this.huanshouName.source = cfg.nameIcon;//名字
		let rank = level ? level : 1;
		this.fabaoName0.source = `sqlevel_${rank < 10 ? "0" + rank : rank}`;//"sqlevel_01";//阶级数描述
		this.hsMC.x = cfg.xy[0];
		this.hsMC.y = cfg.xy[1];
		this.hsMC.setData(cfg.avatar);
	}

	/**红点*/
	private updateRedPoint() {
		this.upRedPoint0.visible = HuanShouRedPoint.ins().skinListRed[this.selectId];
	}

	private updateRedPoint2() {
		this.rightRed2.visible = this.rightRed0.visible = HuanShouRedPoint.ins().skinTotalRed;
	}
}