/**
 *
 * 经脉窗口
 */
class JingMaiPanel extends BaseView {

	private jinMaiName: eui.Label;
	private jinmaiStage: LevelImage;
	private fightGroup: eui.Group;
	// private totalPower: egret.DisplayObjectContainer;
	private _totalPower: number;
	private attr: eui.Label;
	private nextAttr: eui.Label;
	private countLabel: eui.Label;
	private boostBtn: eui.Button;
	private redPoint0: eui.Image;


	private cursor: MovieClip;
	private cursorLocation: any[][] = [
		[132, 131], [92, 186], [165, 177], [138, 252],
		[84, 231], [96, 316], [152, 339], [126, 431]];
	public curRole: number = 0;
	private _data: JingMaiData;
	/** 直升一阶 */
	private bigUpLevelBtn: eui.Button;

	private danItemID: number;
	private powerPanel: PowerPanel;

	constructor() {
		super();

		this.name = `经脉`;
		this.skinName = "JinMaiSkin";
	}

	public childrenCreated(): void {
		this.init();
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public init(): void {
		this.danItemID = GlobalConfig.JingMaiCommonConfig.levelItemid;
		this.cursor = new MovieClip;
		// this.addChild(this.cursor);
		this.cursor.visible = false;

		// this.totalPower = BitmapNumber.ins().createNumPic(0, "8");
		// this.totalPower.x = 65;
		// this.totalPower.y = 9;
		// this.fightGroup.addChild(this.totalPower);

		//	this.lightList = [this.light_0, this.light_1, this.light_2, this.light_3, this.light_4, this.light_5, this.light_6, this.light_7];
	}

	public open(): void {
		this.addTouchEvent(this.boostBtn, this.onTap);
		this.addTouchEvent(this.bigUpLevelBtn, this.onTap);
		this.observe(UserJingMai.ins().postUpdate, this.setForgeData);
		this.observe(UserBag.ins().postItemAdd, this.setForgeData);//道具添加

		this.cursor.playFile(RES_DIR_EFF + "jingmaiCursor", -1);
		this.setForgeData(false);
	}

	public close(): void {
		this.removeTouchEvent(this.boostBtn, this.onTap);
		this.removeTouchEvent(this.bigUpLevelBtn, this.onTap);
		this.canClick = true;
		this.removeObserve();
	}

	private canClick: boolean = true
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.boostBtn:
				let config: JingMaiLevelConfig = GlobalConfig.JingMaiLevelConfig[this._data.level];

				if (!this.canClick) return;
				if (this._data.level % 10 == 0 && this._data.level / 10 > this._data.stage && this._data.level != 0) {
					this.canClick = false;
					this.showUpgradeEffect();
					TimerManager.ins().doTimer(1000, 1, () => {
						UserJingMai.ins().sendUpgrade(this.curRole);
						SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
						this.canClick = true;
					}, this)
				}
				else {
					if (UserBag.ins().getItemCountById(0, config.itemId) >= config.count) {
						UserJingMai.ins().sendBoost(this.curRole);
						SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
					}
					else {
						UserWarn.ins().setBuyGoodsWarn(config.itemId);
					}
				}
				break;
			// case this.upgradeBtn:
			// 	UserJingMai.ins().sendUpgrade(this.curRole);
			// 	break;

			case this.bigUpLevelBtn:
				let itemName: string = GlobalConfig.ItemConfig[this.danItemID].name;
				WarnWin.show(`确定使用` + itemName + `提升当前经脉吗？\n说明：\n` + GlobalConfig.JingMaiCommonConfig.levelItemidStage + `阶及以下经脉使用可直升1阶\n其他等阶使用转换为` + GlobalConfig.JingMaiCommonConfig.levelItemChange + `个` + GlobalConfig.ItemConfig[GlobalConfig.JingMaiCommonConfig.itemid].name, () => {
					UserJingMai.ins().sendBigUpLevel(this.curRole);
				}, this);
				break;
		}
	}

	/**
	 * 显示亮光
	 */
	private showLight(lv: number, flag: number): void {
		// if (lv > 0) {
		// 	if (lv % 8 == 0) {
		// 		for (let value of this.lightList) {
		// 			value.visible = Boolean(flag);
		// 		}
		// 	} else {
		// 		for (let i: number = 0; i < 8; i++) {
		// 			this.lightList[i].visible = i < lv % 8;
		// 		}
		// 	}
		// }
		// else {
		// 	for (let value of this.lightList) {
		// 		value.visible = false;
		// 	}
		// }
	}

	/**
	 * 显示升阶特效
	 */
	private showUpgradeEffect(): void {
		for (let i: number = 0; i <= 9; i++) {
			this["jinmai_" + i].setLights(4);
		}
	}



	private setForgeData(levelUp: boolean = true): void {
		this._data = SubRoles.ins().getSubRoleByIndex(this.curRole).jingMaiData;

		let stagesConfig: JingMaiStageConfig = GlobalConfig.JingMaiStageConfig[this._data.stage];
		let lvConfig: JingMaiLevelConfig = GlobalConfig.JingMaiLevelConfig[this._data.level];

		this.jinmaiStage.setValue(stagesConfig.level);
		this.jinMaiName.text = stagesConfig.name;
		this.attr.text = AttributeData.getAttStr(AttributeData.AttrAddition(stagesConfig.attr, lvConfig.attr), 0.75);
		this._totalPower = UserBag.getAttrPower(AttributeData.AttrAddition(stagesConfig.attr, lvConfig.attr));
		// BitmapNumber.ins().changeNum(this.totalPower, this._totalPower, "8");
		this.powerPanel.setPower(this._totalPower);
		let flag: number = this._data.level / 10 - stagesConfig.stage;
		if (stagesConfig.stage < GlobalConfig.JingMaiCommonConfig.stageMax) {
			let nextStagesConfig: JingMaiStageConfig;
			let nextLvConfig: JingMaiLevelConfig;
			let count: number = UserBag.ins().getItemCountById(0, lvConfig.itemId);
			this.redPoint0.visible = count >= lvConfig.count;
			if (this._data.level > 0 && this._data.level % 10 == 0 && flag) {
				nextStagesConfig = GlobalConfig.JingMaiStageConfig[this._data.stage + 1];
				nextLvConfig = lvConfig;
			} else {
				nextStagesConfig = stagesConfig;
				nextLvConfig = GlobalConfig.JingMaiLevelConfig[this._data.level + 1];
			}
			if (this.nextAttr.visible == false) {
				this.nextAttr.visible = true;
				this.countLabel.x = 2;
				this.countLabel.y = 497;
			}
			this.nextAttr.text = AttributeData.getAttStr(AttributeData.AttrAddition(nextStagesConfig.attr, nextLvConfig.attr), 0, 1, "+", false, true);
			this.boostBtn.visible = true;
			if (this._data.level > 0 && this._data.level % 10 == 0 && flag) {
				this.boostBtn.label = `升  阶`;
				this.countLabel.text = `经脉等级已满,可进阶`;
				this.cursor.visible = false;
			} else {
				this.boostBtn.label = `冲  脉`;
				// this.cursor.visible = true;
				let colorStr: string = "";
				if (count >= lvConfig.count)
					colorStr = "|C:0x35e62d&T:";
				else
					colorStr = "|C:0xf3311e&T:";

				let itemName: string = GlobalConfig.ItemConfig[lvConfig.itemId].name;
				this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`消耗` + itemName + `:` + colorStr + count + "|/" + lvConfig.count);
			}
			this.cursor.x = this.cursorLocation[this._data.level % 8][0];
			this.cursor.y = this.cursorLocation[this._data.level % 8][1];
			// this.addChild(this.cursor);

			this.showLight(this._data.level, flag);
		} else {
			this.nextAttr.visible = false;
			this.boostBtn.visible = false;
			this.countLabel.x = this.nextAttr.x - 60;
			this.countLabel.y = this.nextAttr.y;
			this.redPoint0.visible = false;
			if (this.cursor.parent) {
				this.removeChild(this.cursor);
			}
			this.countLabel.text = `经脉已满阶`;
		}

		for (let i: number = 0; i < 9; i++) {
			(this["nadis" + i] as eui.Image).source = ((flag == 1 || (i + 1 < this._data.level % 10) ? "jingmai_line_light" : "jingmai_line_dark"));
		}
		let hasGuang: boolean = true;
		let jmItem: JimMaiItem;

		for (let i: number = 0; i <= 9; i++) {
			jmItem = this["jinmai_" + i];
			jmItem.item.visible = ((flag == 1 || (i + 1 <= this._data.level % 10) ? true : false));
			jmItem.bgImg.visible = !jmItem.item.visible;

			if (jmItem.item.visible) {
				jmItem.setLights(2);
			}
			else {
				if (levelUp && hasGuang && (i - 1 >= 0)) {
					this["jinmai_" + (i - 1)].setLights(3);
				}
				jmItem.setLights(hasGuang ? 1 : 0);
				hasGuang = false;
			}
		}


		let count: number = UserBag.ins().getItemCountById(0, this.danItemID);
		if (this.bigUpLevelBtn["redPoint"]) {
			this.bigUpLevelBtn['redPoint'].visible = count > 0;
		}
		if (this.bigUpLevelBtn["txt"]) {
			this.bigUpLevelBtn['txt'].text = count;
		}
	}

}
