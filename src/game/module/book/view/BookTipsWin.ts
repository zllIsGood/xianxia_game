class BookTipsWin extends BaseEuiView {
	private group: eui.Group;
	private forgeGroup: eui.Group;
	private background: eui.Image;
	private nameLabel: eui.Label;
	// private type: eui.Label;
	private lvTxt: eui.Label;
	private qualTxt: eui.Label;
	// private levelKey: eui.Label;
	// private career: eui.Label;
	// private score: eui.Label;
	private btnUse: eui.Button;
	private iconBg: eui.Image;

	private attr1: eui.Label;
	private attr2: eui.Label;
	private attr3: eui.Label;
	private attr4: eui.Label;

	private tips: eui.Image;

	private itemIcon: ItemIcon;

	private roleModel: Role;
	private _bottomY: number = 0;	//最后一个组件的Y坐标值

	private _equipPower: number = 0;
	private _totalPower: number = 0;

	private curRole: number = 0;
	private curId: number = 0;//itemId
	private curLevel: number = 0;//星级
	private handle: number;
	private index: number = 0;
	// private powerGroup:eui.Group;
	private powerPanel: PowerPanel;
	// private quali: eui.Image;
	private qualityImg: eui.Image;
	private bgClose: eui.Image;
	private _confBase: DecomposeConfig;
	private specialAttr: eui.Label;
	private belong: eui.Label;
	private threeLabel: eui.Label;
	constructor() {
		super();
		this.skinName = "tujiantips";
		// this.setSkinPart("powerPanel", new PowerPanel());
	}


	public initUI(): void {
		super.initUI();
		this.init();
	}

	public init() : void {
		this.powerPanel.setBgVis(false);
		this.itemIcon.imgJob.visible = false;
		this.anigroup.touchEnabled = false;
	}

	public open(...param: any[]): void {
		this.curId = param[0];
		this.curLevel = param[1] || 0;
		this.handle = param[2];
		this.addTouchEndEvent(this.bgClose, this.otherClose)
		this.addTouchEndEvent(this.btnUse, this.onTap);
		this.setData(this.curId);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.otherClose);
		this.removeTouchEvent(this.btnUse, this.onTap);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(BookTipsWin);
	}

	private onTap(e: egret.TouchEvent) {
		let btn: eui.Button = e.currentTarget;
		// if (btn.label == `使用`) {
		// } else {
		// }
		ViewManager.ins().close(this);
		ViewManager.ins().open(LiLianWin, 3, this.curId);
	}

	private setData(curId: number): void {
		let confBase = Book.ins().getDecomposeConfigByItemId(curId);
		let conf: CardConfig = GlobalConfig.CardConfig[confBase.id][this.curLevel];

		this._confBase = confBase;
		this._totalPower = 0;
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[conf.itemId];
		if (itemConfig)
			this.nameLabel.text = itemConfig.name;//confBase.name;
		this.nameLabel.textColor = ItemBase.QUALITY_COLOR[confBase.quality];
		this.lvTxt.text = `${conf.level}星`;
		this.qualityImg.source = `common1_tips_${confBase.quality}`;
		this.qualTxt.text = ColorUtil.COLOR_STR[confBase.quality];
		itemConfig = GlobalConfig.ItemConfig[conf.itemId];
		this.itemIcon.setData(itemConfig);

		let ii = 1;
		this.attr1.visible = false;
		this.attr2.visible = false;
		this.attr3.visible = false;
		this.attr4.visible = false;

		let totalAttr: AttributeData[] = [];

		let specailDesc: boolean = false;
		let specStr = ""
		for (let k in conf.attrs) {
			if (conf.attrs[k].type == 0 || conf.attrs[k].value == 0) continue;
			if (conf.attrs[k].type == AttributeType.atHpEx ||
				conf.attrs[k].type == AttributeType.atAtkEx ||
				conf.attrs[k].type == AttributeType.atDamageReduction ||
				conf.attrs[k].type == AttributeType.atDefEx ||
				conf.attrs[k].type == AttributeType.atResEx) {
				if (!specailDesc) {
					specStr = "特殊属性:";
					specStr += "所有角色";
					specailDesc = true;
					let specName = AttributeData.getAttrStrByType(conf.attrs[k].type);
					if (conf.attrs[k].type == AttributeType.atDefEx || conf.attrs[k].type == AttributeType.atResEx) {
						specName = "防御加成";
					}
					specStr += specName;
					specStr += "+" + conf.attrs[k].value / 100 + "%";
					totalAttr.push(conf.attrs[k]);
				}
			} else {
				//普通属性
				let attrStr = "";
				attrStr = AttributeData.getAttStrByType(conf.attrs[k], 0, "  ");
				totalAttr.push(conf.attrs[k]);
				this['attr' + ii].text = attrStr;
				this['attr' + ii].visible = true;
				ii++;
			}
		}
		if (conf.specialAttr) {
			if (specStr == "")
				specStr = "特殊属性:";
			for (let k in conf.specialAttr) {
				if (conf.specialAttr[k].type == 0 || conf.specialAttr[k].value == 0) continue;
				if (conf.specialAttr) {
					specailDesc = true;
					specStr += "挂机获得";
					specStr += conf.specialAttr[k].type == 1 ? `金币` : `经验`;
					specStr += "+" + conf.specialAttr[k].value + "%";
				}
			}
		}
		this.specialAttr.text = specStr;
		this.specialAttr.visible = specailDesc;


		this._equipPower = Math.floor(UserBag.getAttrPower(totalAttr));
		this._totalPower += this._equipPower;
		// this._bottomY = this['attr' + (ii - 1)].y + this['attr' + (ii - 1)].height;

		this.addTipsEx();
		// this.addTips()

		// this.background.height = this._bottomY + 12;
		// this.anigroup.height = this.background.height + 60;
		// this.anigroup.y = this.anigroup.height / 2 - this.background.height / 2;
		let len: number = 3;
		for (let k in GlobalConfig.SuitConfig) {
			if (Book.jobs.indexOf(Number(k)) != -1 && GlobalConfig.SuitConfig[k][1].idList.indexOf(conf.id) != -1) {
				len = 1;//职业角色
				this.threeLabel.visible = false;
				break;
			}
		}
		this._totalPower = this._totalPower * len;//无论几个角色乘以3 Book.ins().getBookPowerNum(this._totalPower,conf.id);
		this.powerPanel.setPower(this._totalPower);

		this.iconBg.source = confBase.imgShow || confBase.imgLight;

		let books = Book.ins().getBookByItemId(this.curId);
		let isAllOpen: boolean = true;
		for (let book of books) {
			if (book.getState() != BookState.haveOpen) {
				isAllOpen = false;
				break;
			}
		}
		if (!isAllOpen) {
			this.btnUse.label = `使用`;
			this.tips.source = 'com_tag_unactivated';
		} else {
			this.btnUse.label = `分解`;
			this.tips.source = 'com_tag_activated';
		}

		this.btnUse.visible = !!this.handle;

		return;
	}
	private addTipsEx(): void {
		let id: number;

		let item = Book.ins().getBookByItemId(this.curId)[0];
		if (item) id = item.id;

		if (!id) return;
		let desc1: string = "";
		for (let j in GlobalConfig.SuitConfig) {
			let config: SuitConfig = GlobalConfig.SuitConfig[j][1];
			if (config.idList.indexOf(id) != -1) {
				desc1 = config.name ? config.name : "";
				id = config.id;
				break;
			}
		}

		// if( desc1 == "" )return;
		let desc2: string = "";
		for (let k in GlobalConfig.BookListConfig) {
			let config: BookListConfig = GlobalConfig.BookListConfig[k];
			if (config.idList.indexOf(id) != -1) {
				desc2 = config.name ? config.name : "";
				break;
			}
		}

		if (desc1 || desc2) {
			this.belong.visible = true;
			let text = desc1 ? desc1 + `·` : "";
			text += desc2;
			this.belong.text = text;
		} else
			this.belong.visible = false;

	}

	private addTips(): void {
		while (this.forgeGroup.numElements) {
			this.forgeGroup.removeChildAt(0);
		}

		let titleAttrTxt: eui.Label = new eui.Label;
		let attrTxt: eui.Label = new eui.Label;
		let count = Book.ins().getSuitNum(this.curId);
		let dev: number = GlobalConfig.SuitConfig[this.curId][1].count;
		let level = Math.floor(count / dev);
		if (level == 0) return;

		let config = GlobalConfig.SuitConfig[this.curId][level];
		if (!titleAttrTxt.parent) this.createTitle(titleAttrTxt, attrTxt);
		let str: string = Book.ins().getTitleById(this.curId);
		// titleAttrTxt.text = `${config.name}(${Book.ins().getSuitNum(this.curId)}/${config.idList.length})`;
		titleAttrTxt.text = `当前套装系列:${str}·${config.name}(${Book.ins().getSuitNum(this.curId)}/${config.idList.length})`;
		attrTxt.text = AttributeData.getAttStr(config.attrs, 1, 1, "  ");

		if (GlobalConfig.SuitConfig[this.curId][level]) {
			let nextTitleAttrTxt: eui.Label = new eui.Label;
			let nextAttrTxt: eui.Label = new eui.Label;
			this._bottomY = attrTxt.y + attrTxt.height;
			this.createTitle(nextTitleAttrTxt, nextAttrTxt);

			let nextConfig = GlobalConfig.SuitConfig[this.curId][level + 1];
			nextTitleAttrTxt.text = `下级套装系列:${str}·${nextConfig.name}(${nextConfig.count}/${config.idList.length})`
			nextAttrTxt.text += AttributeData.getAttStr(nextConfig.attrs, 1, 1, "  ");
			this._bottomY = nextAttrTxt.y + nextAttrTxt.height;
		} else {
			this._bottomY = attrTxt.y + attrTxt.height;
		}


		// let titleAttrTxt: eui.Label = new eui.Label;
		// let attrTxt: eui.Label = new eui.Label;

		// if (data.baseAttr) {
		// 	if (!titleAttrTxt.parent) this.createTitle(titleAttrTxt, attrTxt);
		// 	attrTxt.text += AttributeData.getAttStrByType(data.baseAttr, 1, "");
		// 	this._bottomY = attrTxt.y + attrTxt.height;
		// }
		// if (data.exAttr1) {
		// 	if (!titleAttrTxt.parent) this.createTitle(titleAttrTxt, attrTxt);

		// 	attrTxt.text += AttributeData.getExtAttStrByType(data.exAttr1, 1, "");
		// 	this._bottomY = attrTxt.y + attrTxt.height;
		// }

		// if (data.exAttr2) {
		// 	attrTxt.text = AttributeData.getExtAttStrByType(data.exAttr2, 1, "");
		// 	this._bottomY = attrTxt.y + attrTxt.height;
		// }
	}

	private createTitle(titleAttrTxt: eui.Label, attrTxt: eui.Label): void {
		titleAttrTxt.fontFamily = "Arial";
		titleAttrTxt.size = 20;
		titleAttrTxt.textColor = 0x7e6437;
		titleAttrTxt.bold = true;
		titleAttrTxt.x = 24;
		titleAttrTxt.y = this._bottomY + 10 + 14;
		this.forgeGroup.addChild(titleAttrTxt);
		// titleAttrTxt.text = "极品属性";

		attrTxt.fontFamily = "Arial";
		attrTxt.size = 18;
		attrTxt.lineSpacing = 8;
		attrTxt.x = 46;
		attrTxt.y = titleAttrTxt.y + 24;
		attrTxt.textColor = 0x9F946D;
		this.forgeGroup.addChild(attrTxt);
	}

	static openCheck(...param: any[]) {
		//图鉴中找不到需要当前道具
		if (!Book.ins().getDecomposeConfigByItemId(param[0])) {
			return false;
		}
		return true;
	}

}
ViewManager.ins().reg(BookTipsWin, LayerManager.UI_Popup);