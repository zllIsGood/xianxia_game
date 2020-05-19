/**历练-徽章标签页 */
class XunzhangPanel extends BaseEuiView {

	// public xunzhang: eui.Image;
	public group: eui.Group;
	public com1: XunzhangItem;
	public com2: XunzhangItem;
	public nameTF: eui.Label;
	public manjiTF: eui.Label;
	public taskScroller: eui.Scroller;
	public taskList: eui.List;
	public btn: eui.Button;
	public arrow: eui.Image;

	private starList: StarList;
	/**进度条容器 */
	private progressGroup: eui.Group;

	// private circleEff: MovieClip;
	private costEnought: boolean;
	public stageImg: LevelImage;

	private XunzhangEff: MovieClip;
	private xunzhangMcGroup: eui.Group;

	/**徽章开启相关 */
	private showAct: eui.Group;//徽章界面信息界面
	private Activation: eui.Group;//开启激活/徽章界面

	private UplevelBtn1: eui.Button;//开启徽章按钮
	private eff: MovieClip;
	public constructor() {
		super();
		this.name = `徽章`;
		this.skinName = "XunzhangPanelSkin";
	}

	protected childrenCreated() {
		this.initUI();
	}

	public initUI(): void {
		super.initUI();
		this.init();
	}

	public init(): void {
		this.starList = new StarList(10, 0, 50);
		this.starList.x = 70;
		this.starList.y = -20;
		this.starList.scaleX = 0.7;
		this.starList.scaleY = 0.7;

		this.eff = new MovieClip;
		this.eff.x = this.btn.width/2;
		this.eff.y = this.btn.height/2;
		this.eff.touchEnabled = false;

		// this.circleEff = neMovieClip();
		// this.circleEff.x = 315;
		// this.circleEff.y = 265;
		// this.circleEff.playFile(RES_DIR_EFF + "yuanquan", -1);
		// this.group.addChildAt(this.circleEff, 1);

		this.taskList.itemRenderer = XunZhangTaskItemRenderer;

		this.XunzhangEff = new MovieClip();
		this.XunzhangEff.x = 0;
		this.XunzhangEff.y = 0;
		// console.log(this.XunzhangEff);
		this.xunzhangMcGroup.addChild(this.XunzhangEff);
	}

	public open(): void {
		this.group.addChild(this.starList);
		this.addTouchEvent(this.btn, this.onTab);
		this.addTouchEvent(this.UplevelBtn1, this.onTab);
		this.observe(LiLian.ins().postNobilityData, this.update);
		this.observe(UserTask.ins().postTaskChangeData, this.setTaskList);
		this.taskList.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onListTouch, this);
		this.update();
		// this.circleEff.play();
		// 	this.showActPanel();
	}

	public close(): void {
		this.removeTouchEvent(this.btn, this.onTab);
		this.removeObserve();
		this.taskList.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onListTouch, this);
		DisplayUtils.removeFromParent(this.eff);
		// this.circleEff.stop();
	}

	private onListTouch(e: egret.TouchEvent): void {
		let item: NobilityItem = e.target.parent as NobilityItem;
		if (item.data) {
			GameGuider.taskGuidance((item.data as AchievementData).id, 1);
		}
	}

	private onTab(evt: egret.TouchEvent): void {
		switch (evt.currentTarget) {
			case this.btn:
				this.onBtnDeal();
				break;
			// case this.UplevelBtn1:
			// 	LiLian.ins().sendXunZhangAct();
			// 	break;
		}
	}

	/**
	 * 升级/升阶按钮处理
	 * @returns void
	 */
	private onBtnDeal(): void {
		if (LiLian.ins().getNobilityIsUpGrade()) {
			LiLian.ins().sendNobilityUpgrade();
		} else {
			UserTips.ins().showTips(`|C:0xf3311e&T:任务未完成，无法升级|`);
		}
	}

	private lastLv: number = 0;

	public setTaskList(): void {
		let lv: number = LiLian.ins().nobilityLv;
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[lv];
		this.nameTF.text = config.type;

//		if (this.lastLv != lv) {
			if (!GlobalConfig.DefineEff[config.effid]) {
				egret.log(config.effid + "特效ID出错啦");
				return;
			}
			let effSoure: string = GlobalConfig.DefineEff[config.effid].souce;
			this.XunzhangEff.playFile(RES_DIR_EFF + effSoure, -1);
			this.lastLv = config.effid;

			this.stageImg.setValue(Math.floor(lv / 10) + 1);
	//	}

		//任务列表
		let list: AchievementData[] = [];
		for (let i: number = 0; i < config.achievementIds.length; i++) {
			let taskid: number = config.achievementIds[i].taskId;
			if (taskid > 0) {
				list.push(UserTask.ins().getAchieveByTaskId(taskid));
			}
		}
		this.taskList.dataProvider = new eui.ArrayCollection(list);
	}
	//是否显示激活界面
	private showActPanel() {
		this.Activation.visible = false;//激活徽章界面
		this.showAct.visible = !this.Activation.visible;//徽章信息界面
	}
	/**更新 */
	private update(map?: any): void {
		let refush = false;
		refush = map ? map.refush : false;

		this.showActPanel();

		let lv: number = LiLian.ins().nobilityLv;
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[lv];

		//激活特效界面
		if (LiLian.ins().isXZShow) {
			let img = config.effid;
			Activationtongyong.show(0, config.desc, `j${img}_png`);
			LiLian.ins().isXZShow = false;
		}

		if (LiLian.ins().checkJueWeiOpen()) {
			this.com1.visible = true;
			this.com2.visible = true;
			this.group.visible = true;
		} else {
			//显示未开启状态
			this.com1.visible = false;
			this.com2.visible = false;
			this.group.visible = false;
			return;
		}

		//更新信息
		this.nameTF.text = config.type;

		//更新星级
		let spaing: number = GlobalConfig.KnighthoodBasicConfig.perLevel;
		let stage: number = Math.ceil((lv - spaing) / (spaing + 1) + 1);
		let star: number = lv - (spaing + (stage - 2) * (spaing + 1) + 1);
		this.starList.setStarNum(star, Number(refush));
		this.btn.label = `渡劫`;
		if (lv > 0 && (lv - spaing) % (spaing + 1) == 0) {
			this.btn.label = `升阶`;
		}
		DisplayUtils.removeFromParent(this.eff);
		if (lv == 0) {
			let boo: boolean = this.taskList.numChildren > 0;
			for (let i: number = 0; i < this.taskList.numChildren; i++) {
				let item: XunZhangTaskItemRenderer = this.taskList.getChildAt(i) as XunZhangTaskItemRenderer;
				if (item.currentState == "goon") {
					boo = false;
					break;
				}
			}
			if (boo) {
				this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
				if (!this.eff.parent) this.btn.addChild(this.eff);
			} else {
				DisplayUtils.removeFromParent(this.eff);
			}
		}

		//更新属性
		this.com1.updateInfo1(config, this.starList.starNum);
		config = GlobalConfig.KnighthoodConfig[lv + 1];
		this.btn.visible = true;
		this.manjiTF.visible = false;
		this.com2.visible = true;
		this.arrow.visible = true;
		if (config) {
			this.com1.x = 10;
			this.com2.updateInfo2(config, this.starList.starNum);
		} else {//满级了
			// this.com2.updateInfo2(GlobalConfig.KnighthoodConfig[lv], this.starList.starNum);
			this.btn.visible = false;
			this.manjiTF.visible = true;
			this.com2.visible = false;
			this.arrow.visible = false;
			this.com1.x = 137;
			// this.progressGroup.visible = false;
		}
		this.setTaskList();
	}

	/**
	 * 获取战斗力接口
	 */
	public getPower(): number {
		let lv: number = LiLian.ins().nobilityLv;
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[lv];
		return UserBag.getAttrPower(config.attrs);
	}
}

/**属性Item */
class XunzhangItem extends BaseComponent {

	public nameTF: eui.Label;
	public attrTxt: eui.Label;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
	}

	/**更新数据 */
	public updateInfo1(conf: KnighthoodConfig, starNum: number, isStageUpgrade: boolean = false): void {
		let attrs: AttributeData[] = conf.attrs;
		let str: string = AttributeData.getAttStr1(attrs, AttributeFormat.FORMAT_1());
		if (conf['exattrs'] && conf['exattrs'].length > 0) {
			for (let i: number = 0; i < conf['exattrs'].length; i++) {
				str += "\n";
				str += AttributeData.getExAttrNameByAttrbute(conf['exattrs'][i], true) + "\n";
			}
		}
		this.attrTxt.textFlow = TextFlowMaker.generateTextFlow(str);
		this.addNameTF(this.nameTF, conf, starNum, isStageUpgrade);
	}

	/**更新数据 */
	public updateInfo2(conf: KnighthoodConfig, starNum: number, isStageUpgrade: boolean = false): void {
		let attrs: AttributeData[] = conf.attrs;
		let str: string = AttributeData.getAttStr1(attrs, AttributeFormat.FORMAT_2());
		if (conf['exattrs'] && conf['exattrs'].length > 0) {
			str += "\n";
			for (let i: number = 0; i < conf['exattrs'].length; i++) {
				str += AttributeData.getExAttrNameByAttrbute(conf['exattrs'][i], true, "：", 0x35e62d) + "\n";
			}
		}
		this.attrTxt.textFlow = TextFlowMaker.generateTextFlow(str);
		this.addNameTF(this.nameTF, conf, starNum + 1, isStageUpgrade);
	}

	/**
	 * 添加名字
	 * @param  {eui.Label} label
	 * @param  {KnighthoodConfig} conf
	 * @param  {number} starNum
	 * @param  {boolean=false} isStageUpgrade
	 * @returns void
	 */
	private addNameTF(label: eui.Label, conf: KnighthoodConfig, starNum: number, isStageUpgrade: boolean = false): void {
		if (!label) return;
		if (starNum > 9) starNum = 9;
		if (isStageUpgrade) starNum = 0;
		label.text = conf.desc;
	}
}