//神兵技能分页
class GwWeaponView extends BaseView {
	//神兵图标
	private iconImg: eui.Image;
	//神兵名字
	private weaponName: eui.Image;
	private maskPro: eui.Rect;//遮罩
	private progressImg: eui.Image;//进度条图片
	private progressHeadImg: eui.Image//进度条顶部图片
	private needExp: eui.Label;//经验文本
	private clickRect: eui.Rect//点击
	//圆球
	private exp: eui.Group;
	private expText: eui.Label;
	private expschedule: eui.Image;//绿色球
	private expcount: eui.Label;//神兵经验文本
	private expglass: eui.Image;
	private maskRect: eui.Rect//遮罩
	private power: PowerPanel;//战力
	private detailBtn: eui.Image;//详
	// private flameMC: MovieClip;//火
	// private powerCon: eui.BitmapLabel;

	//重置
	private reset: eui.Label;


	//三个按钮
	private weapon0: eui.Button;
	private weapon1: eui.Button;
	private weapon2: eui.Button;
	private selectIcon0: eui.Image;
	private selectIcon1: eui.Image;
	private selectIcon2: eui.Image;
	private bottomGroup: eui.Group;
	//等级
	private lvCount: eui.Label;
	//圣物
	private shengwu1: GwshengwuItem;
	private shengwu2: GwshengwuItem;
	private shengwu3: GwshengwuItem;
	private shengwu4: GwshengwuItem;
	private shengwu5: GwshengwuItem;
	//可用技能点
	private curPointLabel: eui.Label;
	private godweaponskill: GwGodWeaponSkillView;
	private _selectIndex: number = 0;
	private _curWeapon: GodWeaponData;
	// private _glowImg: eui.Image;

	private gwTask: GwTaskView;

	//红点
	private rpImg0: eui.Image;
	private rpImg1: eui.Image;
	private rpImg2: eui.Image;
	//经验求红点
	private rpImgExp: eui.Image;

	constructor() {
		super();
	}

	protected childrenCreated() {

		this.init();
	}

	public init() {
		this.clickRect.touchEnabled = true;
		this.expschedule.mask = this.maskRect;
		this.detailBtn.touchEnabled = true;

		// this._glowImg = new eui.Image();
		// this._glowImg.source = "xuanzhongyuan";
		// this._glowImg.width = this._glowImg.height = 78;
		// this._glowImg.x = 18;
		// this._glowImg.y = 19;
		this.maskPro.touchEnabled = false;
		this.progressImg.mask = this.maskPro;

		this.progressHeadImg = new eui.Image();
		this.exp.addChild(this.progressHeadImg);
		this.progressHeadImg.y = 39;


		// this.flameMC = new MovieClip();
		// this.flameMC.x = 120;
		// this.flameMC.y = 30;
		// this.power.addChildAt(this.flameMC, 0);

		// this.powerCon = BitmapNumber.ins().createNumPic(0, "8", 5);
		// this.powerCon.scaleX = this.power.scaleY = 0.8;
		// this.powerCon.x = 105;
		// this.powerCon.y = 20;
		// this.power.addChild(this.powerCon);

		this.rpImg0.visible = false;
		this.rpImg1.visible = false;
		this.rpImg2.visible = false;
		this.rpImgExp.visible = false;
		this.reset.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.reset.text}`);


	}

	public open() {
		this.setSkinPart("power", new PowerPanel)
		this.addTouchEvent(this.weapon0, this.touchHandler);
		this.addTouchEvent(this.weapon1, this.touchHandler);
		this.addTouchEvent(this.weapon2, this.touchHandler);
		this.addTouchEvent(this.clickRect, this.touchHandler);
		this.addTouchEvent(this.detailBtn, this.touchHandler);
		this.addTouchEvent(this.reset, this.touchHandler);

		this.observe(GodWeaponCC.ins().postUpdateInfo, this.updateView);
		this.observe(GodWeaponCC.ins().postUpdateExp, this.updateGwExp);
		this.observe(GodWeaponCC.ins().postGwTask, this.updateView);

		this.observe(GodWeaponRedPoint.ins().postGwTab1, this.showRedPoint);
		this.observe(GodWeaponRedPoint.ins().postGwTab2, this.showRedPoint);
		this.observe(GodWeaponRedPoint.ins().postGwTab3, this.showRedPoint);

		for (let i: number = 1; i <= 5; i++) {
			this[`shengwu` + i].touchEnabled = true;
			this[`shengwu` + i].touchChildren = false;
			this.addTouchEvent(this[`shengwu` + i], this.touchHandler);
		}
		this.selectIndex(this.getSelectedIndex());
		// this.flameMC.playFile(RES_DIR_EFF + "zhanduolibeijing", -1);
		this.godweaponskill.open();

	}

	private getSelectedIndex(index?: number) {
		if (index == undefined) {
			if (GodWeaponCC.ins().gwTask.taskIdx) {
				index = GodWeaponCC.ins().gwTask.weapon - 1;
			} else {
				index = 0;
			}
		}
		return index;
	}

	public selectIndex(value: number) {
		this._selectIndex = value;

		let actived: boolean = GodWeaponCC.ins().weaponIsActive(value + 1);
		if (actived) {
			this.showWeapon();
		} else {
			this.showTask();
		}
		this.selectBtnImage();
		this.showRedPoint();

		this.reset.visible = actived;
	}

	private showTask() {
		this.currentState = `task`;
		this.gwTask.open(this._selectIndex);
	}

	private showWeapon() {
		//显示红点
		this.currentState = `active`;
		this.validateNow();

		let value = this._selectIndex;
		this._curWeapon = GodWeaponCC.ins().getWeaponData(value + 1);
		this.godweaponskill.selectIndex(value);
		let index: number = value + 1;
		this.weaponName.source = "godweapon_name" + index;
		this.needExp.text = `(${this._curWeapon.curExp}/${this._curWeapon.config.exp})`;
		this.lvCount.text = `Lv.${this._curWeapon.curLv}`;
		if (this._curWeapon.skillPoint == 0) {
			this.curPointLabel.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">神兵等级每提升10级可获得1个技能点</font>');
		} else {
			this.curPointLabel.textFlow = (new egret.HtmlTextParser).parser('<font color="#d1c28f">当前可用的技能点：</font>' + this._curWeapon.skillPoint);
		}
		// this[`weapon${value}`].addChild(this._glowImg);
		this.updateGwExp();
		//经验球处理
		this.expschedule.visible = true;
		let num: number = this._curWeapon.config.everyExp;//每次消耗的点数
		let totalNum: number = num * 2;//2倍;
		let curExp: number = GodWeaponCC.ins().curExp;
		let newScaleY: number;
		if (curExp < totalNum) {
			newScaleY = 1 * curExp / totalNum;
			if (newScaleY < 0) {
				newScaleY = 0;
			}
		} else {
			newScaleY = 1;
		}
		let t: egret.Tween = egret.Tween.get(this.maskRect);
		t.to({ scaleY: newScaleY }, 200);
		this.updateGodItemView();
		this.progressHeadImg.source = `godweapon_expfront`;
		newScaleY = 1 * this._curWeapon.curExp / this._curWeapon.config.exp;
		t = egret.Tween.get(this.maskPro, { onChange: this.funcChange, onChangeObj: this });
		t.to({ scaleX: newScaleY }, 200);
	}
	//选择按钮发光图片
	private selectBtnImage(): void {
		this[`selectIcon${this._selectIndex}`].visible = true;
		switch (this._selectIndex) {
			case 0:
				this[`selectIcon1`].visible = false;
				this[`selectIcon2`].visible = false;
				break;
			case 1:
				this[`selectIcon0`].visible = false;
				this[`selectIcon2`].visible = false;
				break;
			case 2:
				this[`selectIcon0`].visible = false;
				this[`selectIcon1`].visible = false;
				break;
		}
	}
	//判断是否显示红点
	private showRedPoint(): void {
		let b: boolean = GodWeaponCC.ins().maxLvRedPoint();
		if (b) {
			this.rpImg0.visible = GodWeaponCC.ins().weaponIsActive(1) ? true : false;
			this.rpImg1.visible = GodWeaponCC.ins().weaponIsActive(2) ? true : false;
			this.rpImg2.visible = GodWeaponCC.ins().weaponIsActive(3) ? true : false;
			this.rpImgExp.visible = true;
		} else {
			this.rpImg0.visible = GodWeaponRedPoint.ins().gwSbRed1;
			this.rpImg1.visible = GodWeaponRedPoint.ins().gwSbRed2;
			this.rpImg2.visible = GodWeaponRedPoint.ins().gwSbRed3;
			this.rpImgExp.visible = false;
		}
	}

	private funcChange(): void {
		if (341 * this.maskPro.scaleX < 18) {
			this.progressHeadImg.x = 130;
			this.progressHeadImg.scaleX = 1 * (341 * this.maskPro.scaleX) / 18;
		} else {
			this.progressHeadImg.x = 130 + 341 * this.maskPro.scaleX - 18;
			this.progressHeadImg.scaleX = 1;
		}
	}
	//更新圣物
	private updateGodItemView(): void {
		for (let i: number = 0; i < 5; i++) {
			this[`shengwu${i + 1}`].updateView(GodWeaponCC.ins().getGodItemData(this._selectIndex + 1, i + 1));
		}
	}
	// public get selectIndex(): number {
	// 	return this._selectIndex;
	// }
	//更新战力
	private updatePower(): void {
		let ary: { value: number, type: number }[] = GodWeaponCC.ins().gwAddAttr(this._selectIndex);
		let data: AttributeData[] = [];
		for (let i: number = 0; i < ary.length; i++) {
			data.push(new AttributeData(ary[i].type, ary[i].value));
		}
		let power: number = UserBag.getAttrPower(data);
		let addPoser: number = 0;
		let dataGw: GwSkillData
		let max: number = GodWeaponCC.ins().maxSkillIdAry[this._selectIndex];
		for (let i: number = 0; i < max; i++) {
			dataGw = GodWeaponCC.ins().getWeaponSkinIdData(this._selectIndex + 1, i);
			if (dataGw.isOpen) {
				addPoser += dataGw.skillPower;
			}
		}
		power += addPoser;
		this.power.setPower(power)
		// BitmapNumber.ins().changeNum(this.powerCon, power, "8", 5);
	}
	//神兵信息
	private updateView(): void {
		this.selectIndex(this._selectIndex);
	}
	//经验
	private updateGwExp(): void {
		this.updatePower();
		this.expcount.text = `${GodWeaponCC.ins().curExp}`;
	}
	//按钮点击
	private touchHandler(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			switch (e.target) {
				case this.weapon0:
					this.selectIndex(0);
					break;
				case this.weapon1:
					this.selectIndex(1);
					break;
				case this.weapon2:
					this.selectIndex(2);
					break;
			}
		} else if (e.target instanceof GwshengwuItem) {
			let index: number
			switch (e.target) {
				case this.shengwu1:
					index = 1;
					break;
				case this.shengwu2:
					index = 2;
					break;
				case this.shengwu3:
					index = 3;
					break;
				case this.shengwu4:
					index = 4;
					break;
				case this.shengwu5:
					index = 5;
					break;
			}
			this.inlayItem(index);
		} else if (e.target == this.clickRect) {//神级神兵
			let dataWeapon: GodWeaponData = GodWeaponCC.ins().getWeaponData(this._selectIndex + 1);
			if (dataWeapon && dataWeapon.config.everyExp > GodWeaponCC.ins().curExp) {
				UserTips.ins().showTips(`当前经验不足`);
				return;
			}
			GodWeaponCC.ins().gwshowTips = true;
			GodWeaponCC.ins().roleshowTips = SubRoles.ins().subRolesLen;
			GodWeaponCC.ins().upWeapon(this._selectIndex + 1);
		} else if (e.target == this.detailBtn) {
			ViewManager.ins().open(GwAddAttrView, this._selectIndex);
		}
		else if (e.target == this.reset)
			ViewManager.ins().open(GwResetWin, GodWeaponCC.ins().getWeaponData(this._selectIndex + 1));
	}
	//镶嵌圣物
	private inlayItem(index: number): void {
		let data: GwItem = GodWeaponCC.ins().getGodItemData(this._selectIndex + 1, index);
		if (data.isOpen) {
			ViewManager.ins().open(GwShengWuChooseView, data);
		} else {
			UserTips.ins().showTips(`神兵等级达到${data.openLv}级开启`);
		}
	}
	public close(): void {
		this.godweaponskill.close();
		this.removeTouchEvent(this.weapon0, this.touchHandler);
		this.removeTouchEvent(this.weapon1, this.touchHandler);
		this.removeTouchEvent(this.weapon2, this.touchHandler);
		this.removeTouchEvent(this.clickRect, this.touchHandler);
		this.removeTouchEvent(this.detailBtn, this.touchHandler);
		for (let i: number = 1; i <= 5; i++) {
			this.removeTouchEvent(this[`shengwu` + i], this.touchHandler);
		}
		this.removeObserve();
	}
}
class GwshengwuItem extends eui.Component {
	public data: GwItem;
	public frame: eui.Image;
	public lock: eui.Image;
	public add: eui.Image;
	public shengwuImg: eui.Image;
	public rpImgAdd: eui.Image;//红点
	constructor() {
		super();
	}
	public updateView(data: GwItem): void {
		this.data = data;
		if (data) {
			if (data.isOpen) {
				if (data.itemConfig) {
					this.shengwuImg.source = data.itemConfig.icon + "_png";
					this.shengwuImg.visible = true;
					this.add.visible = false;
					this.rpImgAdd.visible = false;
					this.frame.source = `godweapon_quality${ItemConfig.getQuality(data.itemConfig) + 1}`;
				} else {
					this.shengwuImg.visible = false;
					this.add.visible = true;
					this.frame.source = `godweapon_quality1`;
					if (GwShengWuChooseView.getGwItemType(data).length <= 0) {
						this.rpImgAdd.visible = false;
					} else {
						this.rpImgAdd.visible = true;
					}
				}
			} else {
				this.shengwuImg.visible = false;
				this.add.visible = false;
				this.rpImgAdd.visible = false;
				this.frame.source = `godweapon_quality0`;

			}
		} else {
			this.frame.source = "godweapon_quality0";
			this.add.visible = false;
			this.shengwuImg.visible = false;
			this.rpImgAdd.visible = false;
		}
	}

}
/**三个技能页 */
class GwGodWeaponSkillView extends BaseView {
	private skill_wp1: eui.Group;
	private skill_wp2: eui.Group;
	private skill_wp3: eui.Group;

	//wp1
	private weapon1: eui.Image;
	private weapon2: eui.Image;
	private weapon3: eui.Image;
	private _selectIndex: number;
	private max: number = 16;
	constructor() {
		super();
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}


	public init() {
		this.touchEnabled = false;
	}
	public open(): void {
		this.addTouchEvent(this, this.touchHandler);
	}
	public selectIndex(weaponId: number) {
		this._selectIndex = weaponId;
		this.updateView(weaponId);
	}
	public getSelectIndex(): number {
		return this._selectIndex;
	}
	//更新神兵信息
	private updateView(weaponId: number): void {
		switch (weaponId + 1) {
			case 1:
				this.skill_wp1.visible = true;
				this.skill_wp2.visible = false;
				this.skill_wp3.visible = false;
				break;
			case 2:
				this.skill_wp1.visible = false;
				this.skill_wp2.visible = true;
				this.skill_wp3.visible = false;
				break;
			case 3:
				this.skill_wp1.visible = false;
				this.skill_wp2.visible = false;
				this.skill_wp3.visible = true;
				break;
		}
		this.updateWp(weaponId);
	}
	private updateWp(weaponId: number): void {
		let itemV: GwWeaponSkillIcon;
		let data: GwSkillData;
		let unlocks: Array<number> = [];
		for (let i: number = 0; i < this.max; i++) {
			itemV = this.getWpSkill(weaponId + 1, i);
			data = GodWeaponCC.ins().getWeaponSkinIdData(weaponId + 1, i);
			itemV.updateView(data, weaponId);
			if (data && data.isOpen && data.config.lineId) {
				for (let j: number = 0; j < data.config.lineId.length; j++) {
					this[`wp${weaponId + 1}_lock${data.config.lineId[j]}`].visible = false;
					this[`wp${weaponId + 1}_unlock${data.config.lineId[j]}`].visible = true;
					if (unlocks.indexOf(data.config.lineId[j]) == -1)
						unlocks.push(data.config.lineId[j]);
				}
			}
			else if (unlocks.indexOf(i) == -1) {
				this[`wp${weaponId + 1}_lock${i}`].visible = true;
				this[`wp${weaponId + 1}_unlock${i}`].visible = false;
			}
		}
	}
	private touchHandler(e: egret.TouchEvent): void {
		if (e.target instanceof GwWeaponSkillIcon || e.target.className == "GwWeaponSkillIcon") {
			//open 打开升级技能的面板
			let data: GwSkillData = e.target.dataThis;
			ViewManager.ins().open(GwSkillTipView, e.target.dataThis);
		}
	}
	//得到技能icon
	private getWpSkill(weaponId: number, skillId: number): GwWeaponSkillIcon {
		return this[`wp${weaponId}_skill${skillId}`];
	}
	//得到线
	private getWpLine(weaponId: number, lineId: number): eui.Group {
		return this[`wp${weaponId}_line${lineId}`];//wp1_line0
	}
	public close(): void {
		this.removeTouchEvent(this, this.touchHandler);
		for (let i: number = 0; i < 3; i++) {
			let itemV: GwWeaponSkillIcon;
			for (let j: number = 0; j < this.max; j++) {
				itemV = this.getWpSkill(i + 1, j);
				itemV.close();
			}
		}
	}
}
//技能icon
class GwWeaponSkillIcon extends BaseView {
	public Bg1: eui.Image;
	public Bg2: eui.Image;
	public Img: eui.Image;
	public lvFrame: eui.Image;//文本底图
	public lvCount: eui.Label;//文本
	public dataThis: GwSkillData;
	private _effect: MovieClip;
	private glowImg: eui.Image;//可以点将的发光图片
	private _isFirst: boolean = false;

	//图标是否亮
	public imgLight: boolean = false;
	constructor() {
		super();
		this.skinName = "GwItemSkin";
		this.touchChildren = false;
		this.glowImg.visible = false;

		this.touchChildren = false;
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}


	public init() {
		this.touchChildren = false;
	}

	public updateView(data: GwSkillData, weaponId: number): void {
		this.dataThis = data;
		if (this._isFirst == false) { 
			this.validateNow();
			this._isFirst = true;
		}
		if (data.isOpen || this.imgLight) {
			let weaponData = GodWeaponCC.ins().getWeaponData(weaponId + 1);
			if (data.skillLv < data.config.upLevel && weaponData && weaponData.skillPoint > 0) {//小于最大等级就显示特效图片

				if (this._effect && this._effect.parent) {
					this._effect.parent.removeChild(this._effect);
					this._effect.destroy();
				}
				this._effect = new MovieClip();

				if (!this._effect.name) {
					this._effect.playFile(RES_DIR_EFF + "actIconCircle", -1);
					this._effect.x = 46;
					this._effect.y = 55;
				}
				switch (this.dataThis.skillId) {
					case 16:
					case 15:
					case 14:
					case 13:
						this._effect.scaleX = this._effect.scaleY = 1.1;
						break;
					default:
						this._effect.scaleX = this._effect.scaleY = 0.6;
						break;
				}

				this.addChildAt(this._effect, 3);
			} else {
				if (this._effect) {
					this._effect.dispose();	
				}
			}
			this.Img.source = `${data.config.iconId}_N`;
		} else {
			this.glowImg.visible = false;
			this.Img.source = `${data.config.iconId}_L`;
			if (this._effect)
				this._effect.dispose();
		}
		if (data.addLv > 0 || data.skillLv > 0 || data.isOpen) {
			this.lvCount.visible = true;
			this.lvFrame.visible = true;
			if (data.addLv > 0) {
				this.lvCount.textColor = 0x35e26d;
			}
			if (this.dataThis.skillId == 16) {
				this.lvCount.text = data.lvLabel(true);
			} else {
				this.lvCount.text = data.lvLabel();
			}
		} else {
			this.lvCount.visible = false;
			this.lvFrame.visible = false;
		}
	}
	public close(): void {
		this.dataThis = null;
		if (this._effect) {
			this._effect.dispose();	
		}
	}
}