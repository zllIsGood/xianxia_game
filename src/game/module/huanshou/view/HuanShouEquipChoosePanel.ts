class HuanShouEquipChoosePanel extends BaseView {
	private pos0: HuanShouEquipItem;
	private pos1: HuanShouEquipItem;
	private pos2: HuanShouEquipItem;
	private pos3: HuanShouEquipItem;
	private pos4: HuanShouEquipItem;
	private pos5: HuanShouEquipItem;
	private currpos: HuanShouEquipItem;
	private nextPos: HuanShouEquipItem;
	// private arrows0: eui.Image;
	private needLabel0: eui.Label;
	// private name3: eui.Label;
	private name0: eui.Label;
	private name1: eui.Label;
	private attrLabel0: eui.Label;
	private nextAttrLabel0: eui.Label;
	// private arrows1: eui.Image;
	// private upInfo: eui.Group;
	private jihuo0: eui.Button;
	// private neatEff: eui.Group;
	private tab0: eui.List;

	private equipList: HuanShouEquipItem[];
	private listData: eui.ArrayCollection;
	private selectPos: number = -1;

	private ins: UserHuanShou;

	constructor() {
		super();
		this.skinName = `huanShouEquipComposeSkin`;
		this.name = `合成`;

		this.equipList = [this.pos0, this.pos1, this.pos2, this.pos3, this.pos4, this.pos5];
		this.tab0.itemRenderer = HsEquipChooseItem;
		this.listData = new eui.ArrayCollection();
		this.tab0.dataProvider = this.listData;
	}

	public open(): void {
		this.ins = UserHuanShou.ins();
		this.observe(HuanShouRedPoint.ins().postEquipPosRed, this.updateView);
		this.observe(UserHuanShou.ins().postComposeEquip, this.updateDataProvider);
		this.addTouchEvent(this.tab0, this.onSelectTab);
		this.addTouchEvent(this.jihuo0, this.onComposeEquip);
		let len = this.equipList.length;
		for (let i = 0; i < len; i++) {
			let edata = new HsEquipData();
			edata.pos = i + 1;
			edata.equipId = 0;
			this.equipList[i].data = edata;
			this.addTouchEvent(this.equipList[i], this.onPos);
		}

		this.selectPos = 1;
		this.updateSelectPos();
		this.updateView();
	}

	public close(): void {

	}

	private updateView(): void {
		this.updateDataProvider();
		this.onUpdatePos();
	}

	private onComposeEquip(): void {
		if (this.isCompose) {
			let id = this.tempIds[this.tab0.selectedIndex];
			UserHuanShou.ins().sendComposeEquip(id);
		} else {
			UserTips.ins().showTips(`材料不足，无法合成`);
		}
	}

	private onPos(e: egret.TouchEvent): void {
		let item = e.currentTarget as HuanShouEquipItem;
		let eData = item.data as HsEquipData;
		this.selectPos = eData.pos;

		this.updateSelectPos();
		this.updateDataProvider();
	}

	private onSelectTab(): void {
		this.comData();
	}

	private updateSelectPos(): void {
		let len = this.equipList.length;
		for (let i = 0; i < len; i++) {
			this.equipList[i].select(this.selectPos == i + 1);
		}
	}

	private onUpdatePos(): void {
		let len = this.equipList.length;
		for (let i = 0; i < len; i++) {
			this.equipList[i].setredPoint(HuanShouRedPoint.ins().equipPosRed[i]);
		}

	}

	private tempIds: number[];

	private updateDataProvider(): void {
		// HsEquipChooseItemData
		if (!this.tempIds)
			this.tempIds = [];
		else
			this.tempIds.length = 0;
		let ids = this.ins.getEquipIdsByPos(this.selectPos);
		let len = ids.length;
		let tmepList = [];
		for (let i = 0; i < len; i++) {
			let conf = this.ins.getEquipConfById(ids[i]);
			if (conf && conf.mat) {
				if (UserHuanShou.ins().isComposeEquip(ids[i])) {
					this.tempIds.push(ids[i]);
				} else {
					tmepList.push(ids[i]);
				}
			}
		}
		this.tempIds = this.tempIds.concat(tmepList);
		this.listData.source = this.tempIds;
		if (this.tab0.selectedIndex == -1)
			this.tab0.selectedIndex = 0;
		this.comData();

	}

	private isCompose: boolean = false;

	/**合成所需的材料 */
	private comData(): void {
		this.isCompose = false;
		let id = this.tempIds[this.tab0.selectedIndex];
		let conf = this.ins.getEquipConfById(id);
		let edata = new HsEquipData();
		edata.pos = conf.pos;
		edata.equipId = conf.mat.id;
		this.currpos.data = edata;

		edata = new HsEquipData();
		edata.pos = conf.pos;
		edata.equipId = conf.equipId;
		this.nextPos.data = edata;
		//材料装备战力
		let comConf = this.ins.getEquipConfById(conf.mat.id);

		let str = AttributeData.getAttStr(comConf.attrs, 0.5, 1, ":");
		let power: number = UserBag.getAttrPower(comConf.attrs);
		if (comConf.percent_attrs) {
			str += "\n";
			for (let key in comConf.percent_attrs) {
				let temp = comConf.percent_attrs[key];
				str += AttributeData.getCustomAttName(temp.type, `加成`, ":");
				str += (temp.percent / 100) + `%`;
				str += "\n";
			}
			power += comConf.expower;
		}
		this.attrLabel0.text = str;
		this.name0.text = `战斗力：${power}`;
		//合成装备战力
		str = AttributeData.getAttStr(conf.attrs, 0.5, 1, ":");
		power = UserBag.getAttrPower(conf.attrs);
		if (conf.percent_attrs) {
			str += "\n";
			for (let key in conf.percent_attrs) {
				let temp = conf.percent_attrs[key];
				str += AttributeData.getCustomAttName(temp.type, `加成`, ":");
				str += (temp.percent / 100) + `%`;
				str += "\n";
			}
			power += conf.expower;
		}
		this.nextAttrLabel0.text = str;
		this.name1.text = `战斗力：${power}`;

		let cou: number = UserBag.ins().getItemCountById(0, conf.mat.id);
		if (this.ins.isWearEquipIdById(conf.mat.id)) {
			cou++;
		}
		let colorStr: string = "";
		if (cou >= conf.mat.count) {
			this.isCompose = true;
			colorStr = "|C:0x00ff00&T:";
		} else
			colorStr = "|C:0xff0000&T:";
		this.needLabel0.textFlow = TextFlowMaker.generateTextFlow(`消耗：${colorStr}${cou}|/${conf.mat.count}`)

	}


}