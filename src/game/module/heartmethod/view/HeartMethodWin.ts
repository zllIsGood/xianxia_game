/**
 * 心法主界面
 */
class HeartMethodWin extends BaseView {

	/** 当前选择的角色 */
	public curRole: number;

	/**心法控件*/
	private showGroup: eui.Group;
	private powerPanel: PowerPanel;
	private xiangxishuxing: eui.Button;
	private bigIcon: eui.Image;//心法内观图底图
	private effGroup: eui.Group;
	private bigEff: MovieClip;
	private heartmethodStage: LevelImage;//阶级
	private xinfaName: eui.Label;//心法名
	private leftBtn: eui.Button;
	private rightBtn: eui.Button;

	private skill: eui.Image;//技能预览
	private fenjie: eui.Image;//分解

	//item1~5 HeartMethodItemRenderer
	private shuxingbianhua: eui.Group;//属性组
	private curAtt0: eui.Label;
	private cursor0: eui.Image;
	private nextAtt0: eui.Label;

	private upInfo: eui.Group;//心法修炼组
	private icon0: eui.Image;
	private countLabel0: eui.Label;
	private getItemTxt0: eui.Label;

	private redPoint0: eui.Image;
	private boostBtn: eui.Button;

	private countLabel: eui.Label;//心法满级

	private jihuoGroup: eui.Group;//学习心法组
	private sysDescText0: eui.Label;
	private activeBtn0: eui.Button;
	private redPoint1: eui.Image;

	private starList: StarList;
	private starGroup: eui.Group;

	private redPoint2: eui.Image;//左边红点
	private redPoint3: eui.Image;//右边红点
	private redPoint: eui.Image;//分解红点

	private conditionDesc: eui.Label;//心法修炼条件描述
	/**心法数据*/
	public heartId: number;//当前心法id
	private costId: number;//消耗道具Id
	private showGroupY: number;
	private showGroupMoveY: number;
	private isHeartUp: boolean;//是否可以修炼
	private isAct: boolean;//是否激活心法
	private heartPos: number;//当前心法页面索引
	private heartPages: HeartMethodConfig[] = [];//心法id页面展示顺序
	public constructor() {
		super();
	}

	public close(...param: any[]): void {
		// this.stopIconTween();
	}


	public open(...param: any[]): void {
		// this.playIconTween();
		this.addTouchEvent(this.xiangxishuxing, this.onTap);
		this.addTouchEvent(this.skill, this.onTap);
		this.addTouchEvent(this.fenjie, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.activeBtn0, this.onTap);
		this.addTouchEvent(this.boostBtn, this.onTap);
		this.addTouchEvent(this.getItemTxt0, this.onTap);
		this.observe(HeartMethodRedPoint.ins().postHeartRoleRedPoint, this.updateUI);

		//部位
		for (let i = 0; i < 5; i++) {
			this.addTouchEvent(this[`item${i + 1}`], this.onSlot);
		}

		let selectedIndex = (param && param[0]) ? param[0] : 0;
		this.curRole = selectedIndex;
		this.heartId = (param && param[1]) ? param[1] : 1;
		this.init();
		this.updateUI();
	}

	//选择部位
	private onSlot(e: egret.TouchEvent): void {
		let id = this.getHeartId(this.heartPos);
		for (let i = 0; i < 5; i++) {
			if (e.currentTarget == this[`item${i + 1}`]) {
				//检查身上是否有同部位 没有则直接穿戴
				let slotId: number = HeartMethod.ins().getHeartSlotItemId(this.curRole, id, i + 1);
				if (!slotId) {
					let itemData: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_18);
					itemData.sort(HeartMethod.ins().changeSort);//从好到坏
					let isSend = false;
					for (let data of itemData) {
						let sconfig: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[data.configID];
						if (sconfig.heartmethodId == id) {
							let pos = GlobalConfig.HeartMethodConfig[id].posList.indexOf(sconfig.posId);
							if (pos != -1 && pos == i) {//身上有同心法同部位的道具
								isSend = true;
								HeartMethod.ins().sendHeartChange(this.curRole, id, i + 1, sconfig.posItem);
								break;
							}
						}
					}
					if (!isSend)
						UserTips.ins().showTips(`身上没有适合的道具穿戴`);
				} else {
					ViewManager.ins().open(HeartMethodTips, this.curRole, id, slotId);
				}
				break;
			}
		}
	}

	private onTap(e: egret.TouchEvent): void {
		let id = this.getHeartId(this.heartPos);
		switch (e.currentTarget) {
			case this.boostBtn://修炼/进阶
				if (this.currentState == "narmal") {
					//是否达到额外修炼条件
					if (!HeartMethod.ins().heartUpCondition(this.curRole, id)) {
						UserTips.ins().showTips(`|C:0xff0000&T:条件不足`);
						return;
					}
					//修炼
					if (!this.isHeartUp) {
						UserTips.ins().showTips(`|C:0xff0000&T:材料不足`);
						return;
					}
					HeartMethod.ins().sendHeartUpLevel(this.curRole, id, 0);
				} else if (this.currentState == "stage") {
					//进阶
					HeartMethod.ins().sendHeartUpLevel(this.curRole, id, 0);
				}
				break;
			case this.activeBtn0://学习心法
				this.isAct = true;
				HeartMethod.ins().sendHeartUpLevel(this.curRole, id, 0);
				break;
			case this.xiangxishuxing:
				ViewManager.ins().open(HeartMethodAttrWin, this.curRole, id);
				break;
			case this.skill:
				ViewManager.ins().open(HeartMethodSkillTips, this.curRole, id);
				break;
			case this.fenjie:
				ViewManager.ins().open(HeartMethodDecomposePanel, id);
				break;
			case this.leftBtn:
				let preId: number = this.getHeartId(this.heartPos - 1);//this.heartId - 1
				let precfg: HeartMethodConfig = GlobalConfig.HeartMethodConfig[preId];
				if (precfg) {
					this.heartPos--;
					this.heartId = preId;
					this.updateUI();
				} else {
					UserTips.ins().showTips(`没有上一个心法`);
				}
				break;
			case this.rightBtn:
				let nextId: number = this.getHeartId(this.heartPos + 1);//this.heartId + 1;
				let nextcfg: HeartMethodConfig = GlobalConfig.HeartMethodConfig[nextId];
				if (nextcfg) {
					this.heartPos++;
					this.heartId = nextId;
					this.updateUI();
				} else {
					UserTips.ins().showTips(`没有下一个心法`);
				}
				break;
			case this.getItemTxt0:
				if (this.conditionDesc.visible) {
					let hmcfg: HeartMethodConfig = GlobalConfig.HeartMethodConfig[this.getHeartId(this.heartPos)];
					UserWarn.ins().setBuyGoodsWarn(hmcfg.posGainGuide);
				} else
					UserWarn.ins().setBuyGoodsWarn(this.costId);
				break;
		}
	}

	private init() {
		this.showGroupY = this.showGroup.y;
		this.showGroupMoveY = this.showGroupY - 10;
		this.heartPages = [];
		for (let k in GlobalConfig.HeartMethodConfig) {
			this.heartPages.push(GlobalConfig.HeartMethodConfig[k]);
		}
		this.heartPages.sort((a: HeartMethodConfig, b: HeartMethodConfig) => {
			if (a.sort < b.sort)
				return -1;
			else
				return 1;
		});
		this.heartPos = 0;
		for (let i = 0; i < this.heartPages.length; i++) {
			if (this.heartPages[i].id == this.heartId) {
				this.heartPos = i;
				break;
			}
		}
	}

	private getHeartId(posId: number) {
		if (this.heartPages[posId])
			return this.heartPages[posId].id;
		return 0;
	}

	/** UI更新 */
	private updateUI() {
		this.updateAct();
		this.updateState();
		this.updatePower();
		this.updateHeart();
		this.updateRedPoint();
		this.updateBtn();
	}

	private updateAct() {
		if (this.isAct) {
			Activationtongyong.show(0, GlobalConfig.HeartMethodConfig[this.heartId].name, GlobalConfig.HeartMethodConfig[this.heartId].pic);
		}
		this.isAct = false;
	}

	//更新左右按钮状态
	private updateBtn() {
		this.leftBtn.visible = this.rightBtn.visible = true;
		let id: number = this.getHeartId(this.heartPos - 1);//this.heartId - 1;
		let cfg: HeartMethodConfig = GlobalConfig.HeartMethodConfig[id];
		if (!cfg) {
			this.redPoint2.visible = this.leftBtn.visible = false;
		}
		else {
			if (!HeartMethod.ins().heartOpenCondition(id)) {
				this.leftBtn.visible = false;
			}
		}
		id = this.getHeartId(this.heartPos+1);//this.heartId + 1;
		cfg = GlobalConfig.HeartMethodConfig[id];
		if (!cfg) {
			this.redPoint3.visible = this.rightBtn.visible = false;
		}
		else {
			if (!HeartMethod.ins().heartOpenCondition(id)) {
				this.rightBtn.visible = false;
			}
		}
		id = this.getHeartId(this.heartPos);
		cfg = GlobalConfig.HeartMethodConfig[id];//this.heartId
		let zslv = cfg.openCondition ? cfg.openCondition.zs : GlobalConfig.HeartMethodBaseConfig.zsLv;
		this.sysDescText0.text = `${cfg.openTips}\n\n${zslv}转可学习`;
	}

	//根据当前心法情况来显示状态
	private updateState() {
		let id = this.getHeartId(this.heartPos);
		let hminfo: Map<HearMethodData> = HeartMethod.ins().HeartMethodInfo[this.curRole];
		if (!hminfo || !hminfo[id] || !hminfo[id].id) {//激活
			this.currentState = "open";
		} else if (HeartMethod.ins().isHeartMax(this.curRole, id)) {//满级
			this.currentState = "max";
		} else if (hminfo[id].isUp) {//升阶阶段
			this.currentState = "stage";
		} else {//正常升级
			this.currentState = "narmal";
		}
		this.validateNow();
	}

	private updatePower() {
		let id = this.getHeartId(this.heartPos);
		let proShowList: HeartTypeData[] = HeartMethod.ins().proShowList;
		let attrvalue: number[] = HeartMethod.ins().calcHeartTotalValue(this.curRole, id);
		let attr: AttributeData[] = [];
		for (let i = 0; i < proShowList.length; i++) {
			let at: AttributeData = new AttributeData();
			at.type = proShowList[i].id;
			at.value = attrvalue[i];
			attr.push(at);
		}
		let power: number = UserBag.getAttrPower(attr);
		//心法等级额外战力
		let hminfo: Map<HearMethodData> = HeartMethod.ins().HeartMethodInfo[this.curRole];
		if (hminfo) {
			let hmdata: HearMethodData = hminfo[id];
			if (hmdata) {
				let hmLevelConfig: HeartMethodLevelConfig = GlobalConfig.HeartMethodLevelConfig[id][hmdata.lv];
				if (hmLevelConfig) {
					let lpower = hmLevelConfig.power ? hmLevelConfig.power : 0;
					power += lpower;
				}
			}
		}
		//心法技能额外战力
		let suitLv = HeartMethod.ins().calcHeartSkillLevel(this.curRole, id);
		if (suitLv) {
			let suitConfig: HeartMethodSuitConfig = GlobalConfig.HeartMethodSuitConfig[id][suitLv];
			let expower = suitConfig.power ? suitConfig.power : 0;
			power += expower;
		}
		this.powerPanel.setPower(power);
	}

	private updateHeart() {
		let id = this.getHeartId(this.heartPos);
		let hminfo: Map<HearMethodData> = HeartMethod.ins().HeartMethodInfo[this.curRole];
		let hmdconfig: HeartMethodConfig = GlobalConfig.HeartMethodConfig[id];
		if (hmdconfig) {
			this.bigIcon.source = hmdconfig.pic;
			this.bigIcon.visible = true;
			if (!this.bigEff)
				this.bigEff = new MovieClip;
			if (!this.bigEff.parent)
				this.effGroup.addChild(this.bigEff);
			let slv = HeartMethod.ins().calcHeartSkillLevel(this.curRole, id);
			if (slv) {
				let suitConfig: HeartMethodSuitConfig = GlobalConfig.HeartMethodSuitConfig[id][slv];
				this.bigEff.playFile(RES_DIR_EFF + suitConfig.inside, -1);
			}
			else
				this.bigEff.playFile(RES_DIR_EFF + hmdconfig.inside, -1);
		}
		if (hminfo && hminfo[id]) {
			this.heartmethodStage.visible = true;
			this.heartmethodStage.setValue(hminfo[id].stage);
			this.xinfaName.text = hmdconfig ? hmdconfig.name : "";
		} else {
			this.heartmethodStage.visible = false;
		}

		if (hmdconfig && hminfo && hminfo[id]) {
			for (let i = 0; i < hmdconfig.posList.length; i++) {
				let pId: number = hmdconfig.posList[i];
				let redPoint: boolean = false;
				//检查身上是否有同部位 没有则直接穿戴
				let slotId: number = HeartMethod.ins().getHeartSlotItemId(this.curRole, id, i + 1);
				redPoint = slotId ? true : false;
				if (slotId) {
					//部位有穿东西 刷新显示该部位索引处所穿戴控件数据 身上不可能没有这个数据!
					let isBug = true;
					for (let j = 0; j < hminfo[id].slots.length; j++) {//找到该部位数据
						let itemid: number = hminfo[id].slots[j];
						let sId: number = HeartMethod.ins().calcHeartSlotChange(this.curRole, id, itemid);
						redPoint = sId ? true : false;
						if (!redPoint && itemid)
							redPoint = HeartMethod.ins().calcHeartSlotCost(itemid);
						let hmscfg: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
						if (hmscfg && hmscfg.posId == pId) {
							isBug = false;
							this[`item${i + 1}`].data = {itemid: itemid, redPoint: redPoint};
							break;
						}
					}
					//走到这证明数据异常
					if (isBug) {
						ErrorLog.Assert(!isBug, `Bug定位:角色id:${this.curRole} 心法id:${id} 部位索引:${i + 1} 部位id:${pId} itemId:${slotId}数据异常`);
						this[`item${i + 1}`].data = null;
					}
				} else {
					//检查背包是否有同心法同部位的可穿
					let configId = HeartMethod.ins().getHeartSlotItemIdWear(this.curRole, id, i + 1);
					redPoint = configId ? true : false;
					this[`item${i + 1}`].data = {blank: hmdconfig.blankIcon[i], redPoint: redPoint};
				}
			}
			//心法属性
			let attrs: AttributeData[] = HeartMethod.ins().calcHeartAttrs(this.curRole, id);
			let attrsNext: AttributeData[] = HeartMethod.ins().calcHeartAttrsNext(this.curRole, id);
			this.curAtt0.text = AttributeData.getAttStr(attrs, 0, 1, "：");
			this.nextAtt0.text = AttributeData.getAttStr(attrsNext, 0, 1, "：");

			//心法修炼消耗
			let cost: { itemid: number, count: number } = HeartMethod.ins().calcHeartCost(this.curRole, id);
			this.redPoint0.visible = false;
			this.isHeartUp = false;
			let item: ItemData;
			if (cost) {
				this.costId = cost.itemid;
				let str = this.getItemTxt0.text;
				this.getItemTxt0.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${str}`);
				this.icon0.source = GlobalConfig.ItemConfig[cost.itemid].icon + "_png";
				item = UserBag.ins().getBagItemById(cost.itemid);
				let color = "";
				if (item && item.count >= cost.count) {
					color = `|C:0x00ff00&T:`;
					this.redPoint0.visible = item.count >= GlobalConfig.HeartMethodStageConfig[id][hminfo[id].stage].normalCostTip;
					this.isHeartUp = true;
				} else {
					color = `|C:0xff0000&T:`;
				}
				let sum = item ? item.count : 0;
				this.countLabel0.textFlow = TextFlowMaker.generateTextFlow1(`${color}${sum}|C:0xD1C28F&T:/${cost.count}`);
			}
			if (!this.redPoint0.visible)
				this.redPoint0.visible = hminfo[id].isUp ? true : false;
			if (this.currentState == "max")
				this.redPoint0.visible = false;
			else if (this.currentState == "narmal") {
				//心法修炼描述
				if (this.conditionDesc) {
					//心法达到额外修炼限制
					if (HeartMethod.ins().heartUpCondition(this.curRole, id)) {
						this[`costGroup0`].visible = true;
					} else {
						this[`costGroup0`].visible = false;
					}
					this.conditionDesc.visible = !this[`costGroup0`].visible;
					if (this.conditionDesc.visible) {
						this.redPoint0.visible = false;
						this.conditionDesc.text = `需要集齐${hmdconfig.upGradeCondition}个心法部位,才能修炼`;
					}
				}
			}

			if (!this.starList) {
				this.starList = new StarList(10);
				this.starList.horizontalCenter = 0;
				this.starList.y = 0;
				this.starGroup.addChild(this.starList);
			}

			//升星
			let lv: number = hminfo[id].lv;
			if (lv > 0) {
				this.starList.setStarNum(lv % 10 == 0 ? 10 : lv % 10);
			} else {
				this.starList.setStarNum(0);
			}
			if (lv > 0 && lv % 10 == 0) {
				if (hminfo[id].isUp) {
					this.starList.setStarNum(10);
				}
				else {
					this.starList.setStarNum(0);
				}
			}

		}

	}

	//检测红点
	private updateRedPoint() {
		let leftId = this.getHeartId(this.heartPos - 1);//this.heartId-1;
		let rightId = this.getHeartId(this.heartPos + 1);//this.heartId+1;
		let leftconfig: HeartMethodConfig = GlobalConfig.HeartMethodConfig[leftId];
		if (!leftconfig) {
			this.redPoint2.visible = false;
		} else {
			let b = false;
			for (let i = this.heartPos - 1; i > 0; i--) {
				let lhid = this.getHeartId(i);
				if (!lhid)break;
				if (HeartMethod.ins().heartOpenCondition(lhid))
					b = HeartMethodRedPoint.ins().checkHeartRedPoint(this.curRole, lhid);
				if (b)
					break;
			}
			this.redPoint2.visible = b;
		}
		let rightconfig: HeartMethodConfig = GlobalConfig.HeartMethodConfig[rightId];
		if (!rightconfig) {
			this.redPoint3.visible = false;
		} else {
			let b = false;
			let len = CommonUtils.getObjectLength(GlobalConfig.HeartMethodConfig);
			for (let i = this.heartPos + 1; i <= len; i++) {
				let rhid = this.getHeartId(i);
				if (!rhid)break;
				if (HeartMethod.ins().heartOpenCondition(rhid))
					b = HeartMethodRedPoint.ins().checkHeartRedPoint(this.curRole, rhid);
				if (b)
					break;
			}
			this.redPoint3.visible = b;
		}
		let id = this.getHeartId(this.heartPos);
		//分解红点
		this.redPoint.visible = false;

		//UI
		let config: HeartMethodConfig = GlobalConfig.HeartMethodConfig[id];
		this.skill.source = config.skillButton;
	}


	/**
	 * 播放icon缓动
	 */
	private playIconTween() {
		this.showGroup.y = this.showGroupY;
		egret.Tween.removeTweens(this.bigIcon);
		egret.Tween.get(this.bigIcon, {loop: true}).to({y: this.showGroupMoveY}, 1000).to({y: this.showGroupY}, 1000);
	}

	/**
	 * 停止icon缓动
	 */
	private stopIconTween() {
		egret.Tween.removeTweens(this.showGroup);
	}

}
