/**
 * 强化
 */
class ForgeBoostPanel extends BaseEuiView {
	public bg: eui.Image;
	public icon: eui.Image;
	public countLabel: eui.Label;
	public upGradeBtn: eui.Button;
	public upGradeBtn0: eui.Button;
	public getItemTxt: eui.Label;
	public attr2: eui.Label;
	public attr1: eui.Label;
	// public selectIcon: eui.Image;
	private _totalPower: number;

	public curRole: number;		   //当前角色
	protected curPanel: number;	   //当前面板索引
	protected pos: number;		   //部位
	protected lv: number;			//等级
	private isMax: boolean = false;
	public isAutoUp: boolean = false;
	public maxDesc: eui.Label;
	public upInfo: eui.Group;
	public itemGroup: eui.Group;
	public itemList: any;

	public costGroup: eui.Group;

	protected itemNum: number = 0;	//消耗道具数量
	protected startPos: number = 0;
	private powerPanel: PowerPanel;
	private eff: MovieClip;
	private strengthen_effect: eui.Image;
	constructor() {
		super();
		this.name = `强化`;
		this.skinName = "boostskin";
	}

	protected childrenCreated() {
		this.init();
	}

	public init(): void {
		super.initUI();
		this.upGradeBtn.label = `强  化`;
		this.curPanel = ForgeWin.Page_Select_Boost;

		this.getItemTxt.textFlow = (new egret.HtmlTextParser).parser(`<u>${this.getItemTxt.text}</u>`);

		this.eff = new MovieClip;
		this.eff.x = this.upGradeBtn.width / 2;
		this.eff.y = this.upGradeBtn.height / 2;
		// this.eff.scaleX = this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
		this.strengthen_effect.visible = false;
		this.itemList = {};
		for (let i = 0; i < 8; i++) {
			this.itemList[i] = this[`pos${i}`];
		}
	}

	public getGuildButton(): any {
		this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
		this.eff.x = this.upGradeBtn.width / 2;
		this.eff.y = this.upGradeBtn.height / 2;
		if (!this.eff.parent) this.upGradeBtn.addChild(this.eff);
		return this.upGradeBtn;
	}

	public open(pos: number, lv: number): void {
		this.addTouchEvent(this.upGradeBtn, this.onTouch);
		this.addTouchEvent(this.upGradeBtn0, this.onTouch);
		this.addTouchEvent(this.getItemTxt, this.onGetItem);
		this.observe(UserBag.ins().postItemAdd, this.setCount);
		this.observe(UserBag.ins().postItemChange, this.setCount);//道具变更
		this.observe(Actor.ins().postLevelChange, this.setView);
		this.isMax = false;
		this.setView();
		this.changeData(pos, lv);
		this.stopAutoUp();
	}

	public close(): void {
		this.removeTouchEvent(this.upGradeBtn, this.onTouch);
		this.removeTouchEvent(this.getItemTxt, this.onGetItem);
		DisplayUtils.removeFromParent(this.eff);
		this.stopAutoUp();
	}

	private setView(): void {
		// this.costGroup.horizontalCenter = this.upGradeBtn.horizontalCenter = Actor.level >= UserRole.oneKeyOpenLevel ? -100 : 0;
		this.upGradeBtn0.visible = UserVip.ins().lv >= 5; // vip等级达到5开启一键强化
		this.upGradeBtn.visible = !this.upGradeBtn0.visible;
		DisplayUtils.removeFromParent(this.eff);
	}

	protected onTouch(e: egret.Event): void {
		switch (e.target) {
			case this.upGradeBtn:
				this.upgrade();
				break;
			case this.upGradeBtn0:
				this.isAutoUp = !this.isAutoUp;
				this.autoBtnState();
				this.upgrade();
				break;
		}
	}

	private upgrade() {
		DisplayUtils.removeFromParent(this.eff);
		let costConfig: EnhanceCostConfig = UserForge.ins().getEnhanceCostConfigByLv(this.lv + 1);
		if (!costConfig)
			return;
		if (this.itemNum >= costConfig.stoneNum) {
			SoundUtil.ins().playEffect(SoundUtil.FORGE);
			UserForge.ins().sendUpGrade(this.curRole, this.pos);
			DisplayUtils.flashingOnceObj(this.strengthen_effect, false, 400);
		} else {
			UserWarn.ins().setBuyGoodsWarn(costConfig.stoneId, costConfig.stoneNum - this.itemNum);
			this.stopAutoUp();
		}
	}

	private autoBtnState() {
		this.upGradeBtn0.label = this.isAutoUp?'停 止':'一键强化';
	}

	public stopAutoUp(): void {
		this.isAutoUp = false;
		this.autoBtnState();
	}

	public autoUpBack(index: number) {
		if (this.isAutoUp) {
			this.upgrade();
		}
	}
	protected onGetItem(e: TouchEvent): void {
		UserWarn.ins().setBuyGoodsWarn(UserForge.ins().getEnhanceCostConfigByLv(this.lv + 1).stoneId, 1);
	}

	public changeData(pos: number, lv: number, bool: boolean = true): void {
		this.pos = pos;
		this.lv = lv;
		let attrList: AttributeData[] = UserForge.ins().countAllBoostAttr(this.curRole, this.curPanel);
		this.setAttrData(attrList);
		this.setPower();
		this.setSlectedInfo();
		if (bool) {
			this.setCount();
			this.upGradeBtn.touchEnabled = true;
		} else {
			this.upGradeBtn.touchEnabled = false;
		}

	}


	protected setPower(): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		this._totalPower = model.getForgeTotalPower(this.curPanel);
		this.powerPanel.setPower(this._totalPower);
	}

	//设置选中信息
	private setSlectedInfo(): void {
		// let img: eui.Image = this["pos" + this.pos] as eui.Image;
		// if (img) {
		// 	this.selectIcon.x = img.x - 10;
		// 	this.selectIcon.y = img.y - 10;
		// }

		//设置等级显示
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let equipData: EquipsData[] = roleData.equipsData;
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			let level: number = equipData[i].strengthen;
			this["level_" + i].text = level > 0 ? `+${level}` : "";
			this["show" + (i + 1)].visible = i == this.pos;
			this["lianjiexian" + i].visible = (i == this.pos);
		}
	}

	protected setAttrData(attrList: AttributeData[]): void {
		let nextConfig: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig;
		let len: number = attrList.length;
		attrList.sort(AttributeData.sortAttribute);
		//最多显示4个属性
		for (let i: number = 0; i < 4; i++) {
			this["attr" + i].text = len > i ? AttributeData.getAttStrByType(attrList[i], 0.5) : "";
		}
		nextConfig = UserForge.ins().getForgeConfigByPos(this.pos, this.lv + 1, this.curPanel);
		if (nextConfig) {
			this.isMax = false;
			let str: string = "";
			let addList: AttributeData[] = UserForge.ins().countAllBoostAttr(this.curRole, this.curPanel, this.pos, true);
			addList.sort(AttributeData.sortAttribute);
			//最多显示4个属性
			for (let i: number = 0; i < 4; i++) {
				if (len > i) {
					let attr: AttributeData = attrList[i];
					str = this.getAttrByType(addList, attr);
				}
				this["arrow" + i].visible = str.length > 0;
				this["addAttr" + i].text = str;
			}
		} else {
			this.isMax = true;
			for (let i: number = 0; i < 4; i++) {
				this["arrow" + i].visible = false;
				this["addAttr" + i].text = "";
			}
		}
		this.upInfo.visible = !this.isMax;
		this.maxDesc.visible = this.isMax;
	}

	protected setCount(): void {
		let costConfig: EnhanceCostConfig = UserForge.ins().getEnhanceCostConfigByLv(this.lv + 1);
		let cost: number = 0;
		if (costConfig) {
			this.itemNum = UserBag.ins().getItemCountById(0, costConfig.stoneId);
			cost = costConfig.stoneNum;
		}
		let colorStr: string = "";
		if (this.itemNum >= cost)
			colorStr = ColorUtil.GREEN_COLOR;
		else
			colorStr = ColorUtil.RED_COLOR;

		this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${this.itemNum}</font><font color=${ColorUtil.WHITE_COLOR}>/${cost}</font> `);
	}

	private getAttrByType(attrs: AttributeData[], attr: AttributeData): string {
		let len: number = attrs.length;
		for (let i: number = 0; i < len; i++) {
			if (attrs[i].type == attr.type && attrs[i].value != attr.value) {
				return `${attrs[i].value}`;
			}
		}
		return "";
	}
}
