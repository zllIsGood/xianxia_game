class PunchSkillTipsWin extends BaseEuiView {
	private nameLabel0: eui.Label;
	private desc0: eui.Label;
	private skillitem: PunchSkillItemRender;
	private bgClose: eui.Rect;

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "PunchskillTips";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private setView(): void {
		let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
		let model: Role = SubRoles.ins().getSubRoleByIndex(0);
		let curSkill: SkillData = new SkillData(config.skill_id[model.job - 1]);
		this.skillitem.setData(curSkill);
		this.nameLabel0.text = curSkill.name;
		this.desc0.text = curSkill.desc;

		let qmDic = UserSkill.ins().qimingValueDic;
		let i: number = 0;
		for (let k in qmDic) {
			// for (let j in qmDic[k]) {
			let value: number = qmDic[k].value / 100;
			let des: string;
			if (i < 2) {
				des = StringUtils.substitute(UserSkill.descArr[i], `|C:0x00ff00&T:${value * 3}%|`);
			} else {
				des = StringUtils.substitute(UserSkill.descArr[i], `|C:0x00ff00&T:${value}%|`);
			}
			this[`desc${k}`].textFlow = TextFlowMaker.generateTextFlow1(des);
			i++;
		}
		if (i == 0) {
			this[`desc${3}`].text = "无";
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(PunchSkillTipsWin, LayerManager.UI_Popup);




