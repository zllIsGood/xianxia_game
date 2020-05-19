class RoleEquipChooseItem extends eui.ItemRenderer {
	public nameTxt: eui.Label;
	public attr1: eui.Label;
	public changeBtn: eui.Button;
	public itemIcon: ItemIcon;
	public power: eui.Label;
	public upImg: eui.Image;
	public levelText: eui.Label;
	public best: eui.Label;
	// public userIngText: eui.Label;
	public now: eui.Group;
	public levelStrText: eui.Label;
	public constructor() {
		super();
		this.skinName = 'RoleChooseEquipItemSkin';
	}

	protected dataChanged(): void {
		if (!this.data || !this.data.itemConfig)
			return;

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);

		let itemdata: ItemData = this.data as ItemData;
		this.itemIcon.setData(this.data.itemConfig);
		this.nameTxt.text = itemdata.itemConfig.name;
		this.nameTxt.textColor = ItemConfig.getQualityColor(this.data.itemConfig);
		let att = UserBag.ins().getEquipAttrs(this.data);
		let config = GlobalConfig.EquipConfig[this.data.itemConfig.id];
		let exPower: number = 0;
		// if (config && config.exPower) exPower = config.exPower;//在point里面已经计算
		let itemPoint: number = this.data.point + exPower;

		this.power.text = `评分：${itemPoint}`;
		let itemSubType: number = ItemConfig.getSubType(this.data.itemConfig)
		this.upImg.x = this.power.x + this.power.textWidth + 10;
		let boo: boolean = (Actor.level >= (this.data.itemConfig.level || 1) && UserZs.ins().lv >= (this.data.itemConfig.zsLevel || 0));
		let color: string = boo ? "0x35E62D" : "0xfe4444";
		if (itemSubType == EquipPos.DZI) {
			this.levelStrText.text = "等阶:";
			this.levelText.text = UserBag.ins().getGuanyinLevel(itemdata.itemConfig);
		} else {
			this.levelStrText.text = "等级:";
			let str: string = isNaN(this.data.itemConfig.zsLevel) ? `${this.data.itemConfig.level || 1}级` : `${this.data.itemConfig.zsLevel}转`
			this.levelText.textFlow = TextFlowMaker.generateTextFlow(`|C:${color}&T:${str}|`);
		}
		// this.levelText.textColor = color;
		let job: number = 0;
		this.now.visible = !this.showUpimage;
		if (!this.data.itemConfig.job) {
			let w = ViewManager.ins().getView(RoleChooseEquipWin);
			let index = (w as RoleChooseEquipWin).roleSelect;
			let roleData = SubRoles.ins().getSubRoleByIndex(index);
			job = roleData.job;
		} else {
			job = ItemConfig.getJob(this.data.itemConfig);
		}
		let comparePower: number = UserBag.ins().getEquipPowerDic(job, itemSubType);
		if ((itemPoint > comparePower) && this.showUpimage && boo) {
			this.upImg.visible = true;
			let t: egret.Tween = egret.Tween.get(this.upImg, { "loop": true });
			t.to({ y: this.upImg.y - 3 }, 250).to({ y: this.upImg.y + 3 }, 250)
		} else {
			this.upImg.visible = false;
		}


		if (this.itemIndex == 0 && this.showUpimage && boo) {
			if (itemPoint > comparePower) {
				this.best.visible = true;
				this.best.x = this.upImg.x + this.upImg.width + 9;
			} else {
				this.best.visible = false;
			}
		} else {
			this.best.visible = false;
		}
		let str1: string = "";
		let str2: string = "";
		for (let i: number = 0; i < att.length; i++) {
			if (att[i].type == 0 || att[i].value == 0) continue;
			let str: string = AttributeData.getAttrNameByAttrbute(att[i], true);
			// str1 += StringUtils.complementByChar(str, 32);
			str1 += str + "\n";
		}
		this.attr1.textFlow = new egret.HtmlTextParser().parser(str1);
		if (UserZs.ins().lv < (this.data.itemConfig.zsLevel || 0) || Actor.level < (this.data.itemConfig.level || 1)) {
			this.changeBtn.visible = false;
			// this.levelText.textColor = ColorUtil.RED_COLOR_N;
		} else {
			this.changeBtn.visible = true;
			// this.levelText.textColor = ColorUtil.NORMAL_COLOR;
		}
	}

	private onRemove() {
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		egret.Tween.removeTweens(this.upImg);
	}

	private showUpimage: boolean = true;

	public setUpImage(boo: boolean): void {
		this.showUpimage = boo;
	}

	public setBtnStatu(): void {
		this.changeBtn.visible = false;
		this.now.visible = true;
	}
}

