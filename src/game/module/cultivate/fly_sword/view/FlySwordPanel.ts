/**
 * 飞剑面板
 */
class FlySwordPanel extends BaseEuiView {
	/** 当前选择的角色 */
	public curRole: number;
	public closeBtn: eui.Button;
	public nameImage: eui.Image;
	public stairImg: LevelImage;
	public weijihuo: eui.Group;
	public activationBtn: eui.Button;
	public jihuolv: eui.Label;
	public appearanceImage: eui.Image;
	public jihuo: eui.Group;
	public expEffGroup: eui.Group;
	public powerPanel: PowerPanel;
	public skill: eui.List;
	public expGroup: eui.Group;
	public automaticBuyBtn: eui.CheckBox;
	public automaticUpgradeBtn: eui.Button;
	public upgrade: eui.Button;
	public boostPrice: PriceIcon;
	public appearanceBtn: eui.Button;
	public growthDanBtn: eui.Button;
	public feishengCount: eui.Label;
	public qualificationDanBtn: eui.Button;
	public qiannengCount: eui.Label;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	public attrGroup: eui.Group;
	public attr0: AttrUpgrade;
	public attr1: AttrUpgrade;
	public attr2: AttrUpgrade;
	public attr3: AttrUpgrade;
	public itemIcon: eui.Image;
	public lvmax: eui.Label;

	private expEff: MovieClip;
	private expEffMask: egret.Shape;
	private activationEff: MovieClip;
	private attrList: AttrUpgrade[];
	private autoUpgradeBtnName: string = `一键升阶`;
	private stopAutoUpgradeBtnName: string = `停 止`;

	/** 自动进阶 */
	private isAuto: boolean = false;
	/** 是否激活功能 */
	private isActivation: boolean = false;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		this.init();
	}

	public init() {
		this.attrList = [this.attr0, this.attr1, this.attr2, this.attr3];

		// this.expEffMask = new egret.Shape();
		// this.expEffMask.rotation = 122;
		// this.expEffGroup.addChild(this.expEffMask);
		let circleMask = new egret.Rectangle(-200, -190, 400 * 2, 320 * 2);

		this.expEff = new MovieClip();
		// this.expEff.mask = this.expEffMask;
		this.expEff.mask = circleMask;
		this.expEff.scaleX = 0.64;
		this.expEff.scaleY = 0.64;
		this.expEff.y = 8;
		this.expEff.x = -2;
		this.skill.itemRenderer = FlySwordSkillItemRenderer;
		this.skill.dataProvider = new eui.ArrayCollection();
	}

	public open(...param: any[]): void {
		this.setBuy(false);
		// this.isBuy = false;
		this.automaticUpgradeBtn.label = this.autoUpgradeBtnName;
		this.curRole = (param && param[0]) ? param[0] : 0;

		this.initEvents();
		this.initObserve();
		this.once(egret.Event.RENDER, this.onActivation, this);
		// this.expEff.mask = this.expEffMask;
		this.setDanCount();
	}

	private onRender(): void {
		this.onActivation();
	}

	public close(...param: any[]): void {
		this.expEff.mask = null;
		this.clearAutoUpgrade();
		egret.Tween.removeTweens(this.appearanceImage);
	}

	protected initEvents(): void {
		this.addTouchEvent(this.closeBtn, this.onTapBtn);
		this.addTouchEvent(this.upgrade, this.onTapBtn);
		this.addTouchEvent(this.activationBtn, this.onTapBtn);
		this.addTouchEvent(this.automaticUpgradeBtn, this.onTapBtn);
		this.addTouchEvent(this.growthDanBtn, this.onTapBtn);
		this.addTouchEvent(this.appearanceBtn, this.onTapBtn);
		this.addTouchEvent(this.qualificationDanBtn, this.onTapBtn);
		this.addChangeEvent(this.automaticBuyBtn, this.updateCostItem);
		this.addEvent(eui.ItemTapEvent.ITEM_TAP, this.skill, this.onTapSkill);
	}

	protected initObserve(): void {
		this.observe(UserBag.ins().postItemChange, this.updateCost);
		this.observe(FlySword.ins().postUpgradeLevel, this.onUpgrade);
		this.observe(FlySword.ins().postData, this.onUpgrade);
		this.observe(FlySword.ins().postActivation, this.onActivation);
		this.observe(FlySword.ins().postOpenFlySword, this.onActivation);
		this.observe(GameLogic.ins().postChildRole, this.updateCost);
		this.observe(FlySwordRedPoint.ins().postTotalRedPoint, this.updateRedPoint);
		this.observe(FlySwordRedPoint.ins().postLevelRedPoint, this.updateRedPoint);
		this.observe(FlySwordRedPoint.ins().postAppearanceRedPoint, this.updateRedPoint);
		this.observe(FlySword.ins().postUserDan, this.setDanCount);

	}

	private setDanCount() {
		this.feishengCount.text = FlySword.ins().models[this.curRole.toString()].levelModel.growthData.level;
		this.qiannengCount.text = FlySword.ins().models[this.curRole.toString()].levelModel.qualificationData.level;
	}

	private onTapSkill(e: eui.ItemTapEvent): void {
		let data: FlySwordSkillData = e.item;
		if (!data)
			return;

		this.skill.selectedIndex = -1;

		if (data.state == FlySwordSkillType.NotOpen)
			return;

		ViewManager.ins().open(FlySwordSkillTipsWin, data.getData().configID);
	}

	private onTapBtn(e: egret.TouchEvent): void {
		let sys: FlySword = FlySword.ins();

		switch (e.currentTarget) {

			case this.appearanceBtn:
				ViewManager.ins().open(FlySwordAppearanceWin, this.curRole);
				break;

			case this.upgrade:
				FlySword.ins().sendUpgradeLevel(this.curRole, this.getIsBuy());
				break;

			case this.automaticUpgradeBtn:
				this.isAuto ? this.clearAutoUpgrade() : this.startAutoUpgrade();
				this.isAuto = this.automaticUpgradeBtn.label == this.stopAutoUpgradeBtnName;
				break;

			case this.growthDanBtn:
				sys.sendUseGrowthDan(this.curRole);
				break;

			case this.qualificationDanBtn:
				sys.sendUseQualificationDan(this.curRole);
				break;

			case this.activationBtn:
				if (!this.isActivation)
					sys.sendOpenFlySword(this.curRole);
				break;

			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}

		// console.warn(this.skill.x,this.skill.y,111)
	}

	/**
	 * 处理激活新飞剑
	 * @returns void
	 */
	private onActivation(): void {
		let model = FlySword.ins().getAppearanceModel(this.curRole);
		this.isActivation = model ? model.getIsActivation() : false;
		this.currentState = this.isActivation ? `active` : `unactive`;
		this.validateNow();
		this.updateView();
		this.appearanceImage.anchorOffsetY = 0;
		DisplayUtils.upDownGroove(this.appearanceImage, -12, 0);
		this.cleanExp();
	}

	private cleanExp():void{
		let levelModel: FlySwordLevelModel = FlySword.ins().getLevelModel(this.curRole);
		if (!levelModel)
			return;
		let levelData: FlySwordLevelData = levelModel.levelData;
		let currLevelConfig = levelData.getCurrLevelConfig() as FlySwordLevelUpConfig;
		if (Math.floor(360 * (levelData.exp / currLevelConfig.needExp)) == 0){
			DisplayUtils.removeFromParent(this.expEff);
		}
	}

	/**
	 * 处理升阶
	 * @param  {number=0} isUpgrade
	 * @returns void
	 */
	private onUpgrade(isUpgrade: number = 0): void {
		if (isUpgrade)
			this.clearAutoUpgrade();

		this.updateView();
	}

	/**
	 * 更新视图
	 * @returns void
	 */
	private updateView(): void {
		if (this.isActivation) {
			this.updateCost();
			this.skill.dataProvider = null;
			this.skill.dataProvider = new eui.ArrayCollection(FlySword.ins().getLevelModel(this.curRole).skillData);
		}
		this.updateAppearance();
		this.updateRedPoint();
		this.cleanExp();
	}

	/**
	 * 更新外形
	 * @returns void
	 */
	private updateAppearance(): void {
		let levelModel: FlySwordLevelModel = FlySword.ins().getLevelModel(this.curRole);
		if (!levelModel)
			return;

		let levelData: FlySwordLevelData = levelModel.levelData;
		let currLevelConfig = levelData.getCurrLevelConfig() as FlySwordLevelUpConfig;
		let nextLevelConfig = levelData.getNextLevelConfig() as FlySwordLevelUpConfig;;

		let currAppearanceConfig: FlySwordTypeConfig = levelModel.getCurrAppearanceConfig();
		if (currAppearanceConfig) {
			this.nameImage.source = currAppearanceConfig.nameIcon;
			this.appearanceImage.source = `${currAppearanceConfig.uishow}_png`;
		}
		this.stairImg.setValue(currLevelConfig.level);
		// this.expEffMask.visible = this.isActivation;

		if (this.isActivation) {
			this.updateAttr();
			if (!this.expEff.parent) {
				this.expEff.once(egret.Event.CHANGE, this.updateExpEff, this);
				this.expEff.playFile(`${RES_DIR_EFF}huanshoubar`, -1);
				this.expEffGroup.addChild(this.expEff);
			}
			else {
				this.updateExpEff()
			}
			DisplayUtils.removeFromParent(this.activationEff);
		}
		else {
			this.activationEff = this.activationEff || new MovieClip;
			this.activationEff.x = this.activationBtn.width / 2;
			this.activationEff.y = this.activationBtn.height / 2;
			this.activationEff.playFile(`${RES_DIR_EFF}chargeff1`, -1);
			this.activationBtn.addChild(this.activationEff);
			DisplayUtils.removeFromParent(this.expEff);
		}
	}

	private updateAttr(): void {
		let levelModel: FlySwordLevelModel = FlySword.ins().getLevelModel(this.curRole);
		if (!levelModel)
			return;

		let currAttr = levelModel.levelData.getCurrLevelAttr();
		let nextAttr = levelModel.levelData.getNextLevelAttr();

		let len: number = this.attrList.length
		for (let i: number = 0; i < len; i++) {
			if (this.attrList[i])
				this.attrList[i].update(currAttr[i], nextAttr[i]);
		}
	}

	private updateExpEff(): void {
		let levelModel: FlySwordLevelModel = FlySword.ins().getLevelModel(this.curRole);
		if (!levelModel)
			return;
		let levelData: FlySwordLevelData = levelModel.levelData;
		let currLevelConfig = levelData.getCurrLevelConfig() as FlySwordLevelUpConfig;
		if (Math.floor(360 * (levelData.exp / currLevelConfig.needExp)) == 0){
			DisplayUtils.removeFromParent(this.expEff);

		}
		let a = levelData.exp / currLevelConfig.needExp;
		let mask = this.expEff.mask;
		if (mask) {
			mask.y = -190 + 350 * (1 - a);
			this.expEff.mask = mask
		}
		// let init = 0;
		// let max = 296;
		// DisplayUtils.drawCir(this.expEffMask, this.expEff.width, Math.floor(max * (levelData.exp / currLevelConfig.needExp)),false, init);
	}
	/**
	 * 更新消耗
	 * @returns void
	 */
	private updateCost(): void {
		let levelData: FlySwordLevelData = FlySword.ins().getLevelData(this.curRole);
		let currLevelConfig: ICultivateBaseLevelConfig = levelData.getCurrLevelConfig();

		if (currLevelConfig) {
			this.updateCostItem();
			let isMax = levelData.getIsMaxLevelExp();
			this.lvmax.visible = isMax;
			this.expGroup.visible = !isMax
		}
		this.powerPanel.setPower(FlySword.ins().getTotalCombatPower(this.curRole));
		this.cleanExp();
	}

	/**
	 * 更新消耗道具
	 * @returns void
	 */
	public updateCostItem(): void {
		let levelData: FlySwordLevelData = FlySword.ins().getLevelData(this.curRole);
		if (!levelData)
			return;

		this.itemIcon.visible = !this.getIsBuy();
		if (this.getIsBuy()) {
			let config = GlobalConfig.FlySwordCommonConfig;
			let levelConfig = levelData.getCurrLevelConfig() as ICultivateStarLevelConfig;
			if (!levelConfig)
				return;
			this.boostPrice.setType(MoneyConst.yuanbao);
			this.boostPrice.setPrice(config.rmb * levelConfig.itemNum, Actor.yb);
		}
		else {
			let itemData = levelData.getCurrCostItemData();
			this.boostPrice.setData(itemData);
			this.boostPrice.setPrice(itemData.count, levelData.getBagUpgradeItemCount());
		}
	}

	/**
	 * 启动自动进阶
	 * @returns void
	 */
	private startAutoUpgrade(): void {
		TimerManager.ins().remove(this.runAutoUpgrade, this);
		this.automaticUpgradeBtn.label = this.stopAutoUpgradeBtnName;
		TimerManager.ins().doTimer(300, 0, this.runAutoUpgrade, this);
	}

	/**
	 * 运行自动进阶
	 * @returns void
	 */
	private runAutoUpgrade(): void {
		this.isAuto = FlySword.ins().sendUpgradeLevel(this.curRole, this.getIsBuy());
		if (this.isAuto == false) {
			this.clearAutoUpgrade();
		}
	}

	/**
	 * 关闭自动进阶
	 * @returns void
	 */
	private clearAutoUpgrade(): void {
		this.isAuto = false;
		TimerManager.ins().remove(this.runAutoUpgrade, this);
		this.automaticUpgradeBtn.label = this.autoUpgradeBtnName;
	}

	// private get isBuy(): boolean {
	// 	return this.automaticBuyBtn.selected;
	// }

	private getIsBuy(): boolean {
		return this.automaticBuyBtn.selected;
	}

	// private set isBuy(b: boolean) {
		
	// }

	private setBuy(b: boolean) {
		this.automaticBuyBtn.selected = b;
		this.updateCostItem();
	}


	/**
	 * 刷新红点
	 * @returns void
	 */
	private updateRedPoint(): void {
		let redPoint = FlySwordRedPoint.ins();

		if (this.redPoint1)
			this.redPoint1.visible = redPoint.levelRedPoint[this.curRole][CultivateDanType.Qualification];

		if (this.redPoint2)
			this.redPoint2.visible = redPoint.levelRedPoint[this.curRole][CultivateDanType.Growth];

		if (this.redPoint3)
			this.redPoint3.visible = redPoint.appearanceRedPoint[this.curRole].indexOf(true) != -1;
	}

}
