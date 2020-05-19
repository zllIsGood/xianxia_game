/**
 * 心法技能tips界面
 *
 */
class HeartMethodSkillTips extends BaseEuiView {
	private bgClose: eui.Rect;
	private skillName: eui.Label;
	//curskillDesc0~3
	//nextskillTitle0~3
	private roleId: number;
	private heartId: number;
	private skillShow: eui.Image;

	constructor() {
		super();
		this.skinName = 'heartmethodSkillTipSkin';

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onClick);
		this.observe(HeartMethod.ins().postHeartUpLevel, this.updateUI);
		this.roleId = param[0];
		this.heartId = param[1];
		this.updateUI();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick);

	}

	private onClick(e: egret.Event) {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}


	private updateUI() {
		let suitLv = HeartMethod.ins().calcHeartSkillLevel(this.roleId, this.heartId);
		let config: HeartMethodSuitConfig[] = GlobalConfig.HeartMethodSuitConfig[this.heartId];
		let maxLv = Object.keys(config).length;
		let curConfig: HeartMethodSuitConfig;
		if (!suitLv) {
			this.currentState = "initial";
			curConfig = config[1];
		} else if (suitLv >= maxLv) {
			this.currentState = "max";
			curConfig = config[maxLv];
		} else {
			this.currentState = "normal";
			curConfig = config[suitLv];
		}
		this.validateNow();
		let hmcfg: HeartMethodConfig = GlobalConfig.HeartMethodConfig[this.heartId];
		if (hmcfg) {
			this.skillName.text = hmcfg.name;
			this.skillShow.source = hmcfg.skillShowPic + "_jpg";
		}
		let color = ItemBase.QUALITY_COLOR[curConfig.level];
		this[`curskillDesc0`].textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:【${curConfig.skillname}】`);
		let suitCount = "";
		let curCount = HeartMethod.ins().getHeartSuitCount(this.roleId, this.heartId, curConfig.level);
		let maxCount = GlobalConfig.HeartMethodConfig[this.heartId].posList.length;
		suitCount = `(${curCount}/${maxCount})`;
		if (this.currentState == "initial") {
			this[`curskillDesc2`].text = this.getColorDesc(curConfig.level) + suitCount;
			this[`curskillDesc3`].text = curConfig.skilldesc;
		} else if (this.currentState == "normal") {
			let nextConfig = config[suitLv + 1];
			this[`curskillDesc3`].text = curConfig.skilldesc;
			curCount = HeartMethod.ins().getHeartSuitCount(this.roleId, this.heartId, nextConfig.level);
			suitCount = `(${curCount}/${maxCount})`;
			color = ItemBase.QUALITY_COLOR[nextConfig.level];
			this[`nextskillTitle0`].textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:【${nextConfig.skillname}】`);
			this[`nextskillTitle2`].text = this.getColorDesc(nextConfig.level) + suitCount;
			this[`nextskillTitle3`].text = nextConfig.skilldesc;
		} else if (this.currentState == "max") {
			this[`nextskillTitle0`].textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:【${curConfig.skillname}】`);
			this[`nextskillTitle3`].text = curConfig.skilldesc;
		}
	}

	//白,绿,紫,橙,红
	private getColorDesc(quality: number) {
		let str = "";
		switch (quality) {
			case 0:
				str = "白色";
				break;
			case 1:
				str = "绿色";
				break;
			case 2:
				str = "紫色";
				break;
			case 3:
				str = "橙色";
				break;
			case 4:
				str = "红色";
				break;
		}
		if (str)
			str = `收集一套${str}心法残页激活`;

		return str;
	}

}
ViewManager.ins().reg(HeartMethodSkillTips, LayerManager.UI_Popup);