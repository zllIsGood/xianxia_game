class BookUpWin extends BaseEuiView {

	private arrMat: number[];
	private btnUp: eui.Button;
	private btnSelect: eui.Button;
	private list: eui.List;
	private selectData: BooKData;
	private btnAdd: eui.Button;

	private labelCur: eui.Label;
	private labelNext: eui.Label;
	private tujian: eui.Label;
	private info: eui.Label;
	private barGroup: eui.Group;

	// private expBar: eui.ProgressBar;
	// private expLabel: eui.Label;
	private listOpen: eui.List;
	/** 可熔炼装备列表 */
	private smeltEquips: ItemData[];
	private dataInfo: eui.ArrayCollection;

	private barbc: ProgressBarEff;
	private bgClose: eui.Rect;
	private specialAttr: eui.Label;

	public constructor() {
		super();
		this.skinName = `tujianshengxing`;
		this.list.itemRenderer = BookUpItem;
		this.listOpen.dataProvider = null;
		this.listOpen.itemRenderer = BookItem;
		this.isTopLevel = true;
		this.smeltEquips = [];
		this.smeltEquips.length = 10;
		this.dataInfo = new eui.ArrayCollection(this.smeltEquips);
		this.list.dataProvider = this.dataInfo;

		this.setSkinPart("barbc", new ProgressBarEff());
		// this.barbc.setWidth(450);
		// this.barbc.x = -10;
		// this.barbc.y = -15;
		this.barGroup.addChild(this.barbc);
	}

	public open(...param: any[]) {
		this.selectData = param[0];
		this.observe(Book.ins().postDataChange, this.updateView);
		this.updateView();
		this.addTouchEvent(this.btnUp, this.onTap);
		this.addTouchEvent(this.info, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
	}
	public close() {
		this.removeTouchEvent(this.btnUp, this.onTap);
		this.removeTouchEvent(this.info, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}
	private jobName: string[] = ["战士", "法师", "术士"];
	public onTap(e: egret.Event) {
		switch (e.target) {
			case this.btnUp:
				let id: number = Book.ins().getSuitIdByBookId(this.selectData.id);
				if (!id)
					return;
				let isHaveJob = false;
				let roleJob: number = Book.jobs.indexOf(Number(id));
				if (roleJob != -1) {//职业图鉴
					//是否开启了这个职业图鉴对应的职业 没有则不让激活
					for (let i = 0; i < SubRoles.ins().subRolesLen; i++) {
						let role: Role = SubRoles.ins().getSubRoleByIndex(i);
						if (!role)
							continue;
						if (role.job == (roleJob + 1)) {
							isHaveJob = true;
							break;
						}
					}
					//没有这个职业 无法开启对应职业图鉴
					if (!isHaveJob) {
						UserTips.ins().showTips(`|C:0xff0000&T:请先开启${this.jobName[roleJob]}职业`);
						return;
					}

				}
				//符合条件后  isHaveJob是false就是非职业图鉴  true就是职业图鉴
				let config = GlobalConfig.DecomposeConfig[this.selectData.id];
				let itemId: number = config.itemId;
				let name: string = config.name;
				let imgLight: string = config.imgLight;
				if (isHaveJob) {//职业图鉴找269999道具
					let csfg: CardConfig = GlobalConfig.CardConfig[this.selectData.id][0];
					itemId = csfg.itemId;
				}
				if (this.selectData.level == -1) {
					let item = GlobalConfig.ItemConfig[itemId];
					let good = UserBag.ins().getBagItemById(item.id);
					if (good) {
						Book.ins().sendOpen(this.selectData.id);
						ViewManager.ins().close(this);
						ViewManager.ins().open(Activationtongyong, 0, name, imgLight, ActivationtongyongShareType.None, true, () => {
							// ViewManager.ins().open(BookUpWin,this.selectData);
						});
					} else {
						UserWarn.ins().setBuyGoodsWarn(item.id, 1);
					}
				} else {
					//这里注意:其实还是拿的是CardConfig表各自那一行数据  由于三职业经验相同 母本必须经验一样  所以直接拿经验数据就好
					let cardConf = GlobalConfig.CardConfig[this.selectData.id][this.selectData.level];
					if (cardConf.cost > Book.ins().score) {
						UserTips.ins().showTips(`图鉴经验不足`);
					} else {
						Book.ins().sendUp(this.selectData.id);// this.arrMat
					}
				}
				break;
			case this.info:
				if (this.selectData.level == -1) {
					// let config:DecomposeConfig = GlobalConfig.DecomposeConfig[this.selectData.id];
					// let item:ItemConfig = GlobalConfig.ItemConfig[config.itemId];
					// UserWarn.ins().setBuyGoodsWarn(item.id, 1);

					let id: number = Book.ins().getSuitIdByBookId(this.selectData.id);
					if (!id)
						return;
					let config: DecomposeConfig;
					let item: ItemConfig;
					if (Book.jobs.indexOf(Number(id)) == -1) {
						//非职业图鉴获取tips
						config = GlobalConfig.DecomposeConfig[this.selectData.id];
						item = GlobalConfig.ItemConfig[config.itemId];
						UserWarn.ins().setBuyGoodsWarn(item.id, 1);
					} else {
						//职业图鉴获取tips
						let cardConfig: CardConfig = GlobalConfig.CardConfig[this.selectData.id][0];
						item = GlobalConfig.ItemConfig[cardConfig.itemId];
						UserWarn.ins().setBuyGoodsWarn(item.id, 1);
					}

				} else {
					ViewManager.ins().open(BreakDownView, BreakDownView.type_book, ItemType.TYPE_9);
				}
				break;
			case this.btnAdd:
				// this.setMaterial();
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}

	private updateView() {
		let confBase = GlobalConfig.DecomposeConfig[this.selectData.id];
		let level = this.selectData.level > -1 ? this.selectData.level : 0;
		let conf = GlobalConfig.CardConfig[this.selectData.id][level];

		this.listOpen.dataProvider = new eui.ArrayCollection([this.selectData.id]);
		this.listOpen.validateNow();//先刷新列表 不然get不出来
		for (let i: number = 0; i < this.listOpen.numElements; i++) {
			let bitem: BookItem = (this.listOpen.getElementAt(i) as BookItem);
			if (bitem)
				bitem.setRemoveTween(true);
		}

		//attr
		let nextConf = GlobalConfig.CardConfig[this.selectData.id][this.selectData.level + 1];
		this.labelCur.text = AttributeData.getAttStr(conf.attrs, 0, 1, "：");

		this.barbc.setMaximum(nextConf?nextConf.cost:conf.cost);
		this.barbc.setValue(Book.ins().score);

		if (this.selectData.level < 0) {
			this.currentState = `noActive`;
			this.btnUp.label = `激活`;
			this.info.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:获取图鉴|`);
			let newAttrs: any[] = [];
			for (let i in conf.attrs) {
				//特殊属性不显示
				if (conf.attrs[i].type == AttributeType.atHpEx ||
					conf.attrs[i].type == AttributeType.atAtkEx ||
					conf.attrs[i].type == AttributeType.atDamageReduction ||
					conf.attrs[i].type == AttributeType.atDefEx ||
					conf.attrs[i].type == AttributeType.atResEx
				) {
					continue;
				}
				newAttrs.push({ type: conf.attrs[i].type, value: 0 });
			}
			this.labelCur.text = AttributeData.getAttStr(newAttrs, 0, 1, "：");
		} else if (nextConf) {
			this.currentState = `nomax`;
			this.btnUp.label = `升星`;
			this.info.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:获取图鉴经验|`);
		} else {
			this.currentState = `max`;
			this.btnUp.label = `已满星`;
			this.info.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:获取图鉴经验|`);
		}

		if (this.selectData.level < 0) {

			this.tujian.textColor = ItemBase.QUALITY_COLOR[confBase.quality];

			let itemConfig = GlobalConfig.ItemConfig[confBase.itemId];
			this.tujian.text = `${itemConfig.name}x1`;
		}
		if (nextConf) {
			this.barbc.setMaximum(nextConf.cost);
			let nextConf2 = [];
			for (let i in nextConf.attrs) {
				//特殊属性不显示
				if (nextConf.attrs[i].type == AttributeType.atHpEx ||
					nextConf.attrs[i].type == AttributeType.atAtkEx ||
					nextConf.attrs[i].type == AttributeType.atDamageReduction ||
					nextConf.attrs[i].type == AttributeType.atDefEx ||
					nextConf.attrs[i].type == AttributeType.atResEx
				) {
					continue;
				}
				nextConf2[i] = nextConf.attrs[i];
			}
			this.labelNext.text = AttributeData.getAttStr(nextConf2, 0, 1, "：");
		} else {
			this.labelNext.text = `已满星`;
			this.barbc.setLbValueText(`已满星`);
		}

		this.specialAttrDese(conf);

		// this.setMaterial();
	}

	private setMaterial() {
		this.arrMat = Book.ins().getUpChipData(this.selectData);
		let data = new eui.ArrayCollection();
		this.smeltEquips = [];
		this.smeltEquips.length = 10;
		for (let i = 0; i < this.arrMat.length; i++) {
			if (i < 10) {
				let conf = GlobalConfig.CardConfig[this.arrMat[i]][1];
				let itemdata = new ItemData();
				itemdata.itemConfig = GlobalConfig.ItemConfig[conf.itemId];
				this.smeltEquips[i] = itemdata;
			} else
				break;
		}
		this.dataInfo.replaceAll(this.smeltEquips);
		this.list.dataProvider = this.dataInfo;
	}
	//特殊属性文字
	private specialAttrDese(conf: CardConfig) {
		if (!conf) {
			this.specialAttr.visible = false;
			return;
		}
		this.specialAttr.visible = true;
		//特殊属性文字
		let specailDesc: boolean = false;
		let specStr = "";
		for (let k in conf.attrs) {
			if (conf.attrs[k].type == 0 || conf.attrs[k].value == 0) continue;
			if (!specailDesc) {
				if (conf.attrs[k].type == AttributeType.atHpEx ||
					conf.attrs[k].type == AttributeType.atAtkEx ||
					conf.attrs[k].type == AttributeType.atDamageReduction ||
					conf.attrs[k].type == AttributeType.atDefEx ||
					conf.attrs[k].type == AttributeType.atResEx) {
					specStr = "特殊属性:";
					specailDesc = true;
					specStr += "所有角色";
					let specName = AttributeData.getAttrStrByType(conf.attrs[k].type);
					if (conf.attrs[k].type == AttributeType.atDefEx || conf.attrs[k].type == AttributeType.atResEx) {
						specName = "防御加成";
					}
					specStr += specName;
					specStr += "+" + conf.attrs[k].value / 100 + "%";
				}
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
	}

}

ViewManager.ins().reg(BookUpWin, LayerManager.UI_Popup);