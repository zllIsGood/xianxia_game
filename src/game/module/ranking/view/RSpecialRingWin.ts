class RSpecialRingWin extends BaseEuiView {
	public colorCanvas0: eui.Image;
	public bgClose: eui.Rect;
	public nameLabel: eui.Label;
	public face: eui.Image;
	public bottomBar: eui.Group;
	public btnUse: eui.Button;
	public roleSelect: RoleSelectPanel;
	public specialAttr: eui.Label;
	public iconMc: MovieClip;
	public mcGroup: eui.Group;

	public powerPanel: PowerPanel;
	public index: number;
	public tips: eui.Image;
	public gainList0: eui.List;
	private _otherPlayerData: OtherPlayerData;
	constructor() {
		super();
		this.skinName = "RingTips";
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("powerPanel", new PowerPanel());
	}

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.iconMc = new MovieClip();
		this.iconMc.x = 170;
		this.iconMc.y = 160;
		this.gainList0.itemRenderer = RingGainItem;
		this.btnUse.visible = false;

	}

	public open(...param: any[]): void {
		this.index = param[0];
		if (param[1] == null)
			param[1] = 0;
		this._otherPlayerData = param[2];
		this.roleSelect.setCurRole(param[1]);
		if (this.iconMc && !this.iconMc.parent) this.mcGroup.addChild(this.iconMc);
		this.addTouchEvent(this.colorCanvas0, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addChangeEvent(this.roleSelect, this.roleChange);
		this.gainList0.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		let config: ExRingConfig = GlobalConfig.ExRingConfig[this.index];
		let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[config.costItem];
		this.gainList0.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
		this.roleChange();
		// this.showIcon();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.colorCanvas0, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.roleSelect.removeEventListener(egret.Event.CHANGE, this.roleChange, this);
		this.gainList0.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		DisplayUtils.removeFromParent(this.iconMc);

		this.removeObserve();
	}

	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			GameGuider.guidance(item[1], item[2], true);
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.colorCanvas0:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}

	private showIcon() {
		let effSoure: string = this.index ? `hushen` : `mabi`;
		this.iconMc.playFile(RES_DIR_EFF + effSoure, -1);
	}

	private ringLv: number = 0;
	protected roleChange(isUpgrade: boolean = false): void {
		let select: number = this.roleSelect.getCurRole();
		this.ringLv = this._otherPlayerData.roleData[select].getExRingsData(this.index);
		this.showIcon();
		let config: ExRingConfig = GlobalConfig.ExRingConfig[this.index];
		let ringConfig: ExRing0Config = GlobalConfig[`ExRing${this.index}Config`][0];
		let ringNextConfig: ExRing0Config = GlobalConfig[`ExRing${this.index}Config`][1];
		if (this.ringLv == 0) {
			this.currentState = "lock";
			this.tips.source = `com_tag_unactivated`;
		} else {
			this.currentState = "actived";
			this.tips.source = `com_tag_activated`;
		}
		if (ringNextConfig) {
			let attName: string = "";
			let value: number = 0;
			let i: number = 0;
			let index: number = 0;
			let str: string = "";
			for (let j: number = 0; j < ringNextConfig.attrAward.length; j++) {
				i = ringNextConfig.attrAward[j].type;
				if (i == 15 || i == 13) continue;
				attName = AttributeData.getAttrStrByType(i);
				value = ringNextConfig.attrAward[j].value;
				if (attName.length < 3)
					attName = AttributeData.inserteBlank(attName, 7);
				this[`attr${index}`].text = `${attName}：`;
				if (i > 1 && i < 9) {
					if (i == 7 || i == 8) {
						str = value / 100 + "%";
					} else {
						str = value.toString();
					}
				} else if (i > 12 && i < 15 || i > 15) {
					if (i == AttributeType.atCritEnhance)
						str = (value / 100 + 150) + "%";
					else
						str = value / 100 + "%";
				}
				this[`value${index}`].text = str;
				index++;
			}
			let power = UserBag.getAttrPower(ringNextConfig.attrAward);
			this.powerPanel.setPower(power);
			this.powerPanel.setMcVisible(false);
			this.validateNow();

			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[config.costItem];
			this.specialAttr.textFlow = TextFlowMaker.generateTextFlow1(itemCfg.desc);
			this.nameLabel.text = `${config.name}`;
		}
	}
}

ViewManager.ins().reg(RSpecialRingWin, LayerManager.UI_Main);