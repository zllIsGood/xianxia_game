class HuanShouSkinTips extends BaseEuiView {
	// private bgClose: eui.Image;
	// private anigroup: eui.Group;
	private itemname: eui.Label;
	private skillIcon0: eui.Image;
	private desc: eui.Label;
	private bottomD: eui.Group;
	private zhanling: eui.Group;
	private skillList: eui.List;
	private zhanlingName: eui.Image;
	private power: eui.Group;
	// private powerImg1: eui.Image;
	// private closeBtn0: eui.Button;

	private itemid: number = 0;
	private hsId: number = 0;
	private model: HuanShouMc;
	private bottomMc: MovieClip;
	public powerPanel: PowerPanel;

	public constructor() {
		super();
		this.skinName = 'huanShouHHTipsSkin';
	}

	public initUI(): void {
		super.initUI();
		this.skillList.itemRenderer = HuanShouZBTipItemsRender;
	}

	public open(...param: any[]): void {
		this.itemid = param[0];
		this.addTouchEndEvent(this, this.closeWin);

		let confs = GlobalConfig.HuanShouSkinConf;
		for (let key in confs) {
			if (confs.hasOwnProperty(key)) {
				let element = confs[key];
				if (element.itemId == this.itemid) {
					this.hsId = element.skinId;
					break;
				}
			}
		}
		let skinConf = confs[this.hsId];
		this.zhanlingName.source = skinConf.nameIcon;

		//模型
		if (!this.model)
			this.model = new HuanShouMc();
		if (!this.model.parent)
			this.zhanling.addChild(this.model);
		this.model.x = skinConf.xy[0];
		this.model.y = skinConf.xy[1];
		this.model.setData(skinConf.avatar);
		if (!this.bottomMc)
			this.bottomMc = new MovieClip();
		if (!this.bottomMc.parent)
			this.bottomD.addChild(this.bottomMc);
		if (!this.bottomMc.isPlaying)
			this.bottomMc.playFile(RES_DIR_EFF + "zhanling_dz", -1);

		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[this.itemid];
		this.itemname.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ItemBase.QUALITY_COLOR[itemConfig.quality]}&T:${itemConfig.name}`);

		let talentConf = GlobalConfig.HuanShouTalentConf[skinConf.talentId][1];
		let tfdesc = "激活后获得强力天赋:";
		if (talentConf.skillInfo && talentConf.skillInfo.icon) {
			this.skillIcon0.source = talentConf.skillInfo.icon;
			if (talentConf.skillInfo.desc)
				tfdesc += talentConf.skillInfo.desc;
		}
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(tfdesc);

		//战斗力
		let stageConflist = GlobalConfig.HuanShouSkinStageConf[this.hsId];
		let stageConf = stageConflist[1];
		let trainConf = GlobalConfig.HuanShouSkinTrainConf[this.hsId][0];
		let power = UserBag.getAttrPower(stageConf.attr);
		power += stageConf.skillPower + UserBag.getAttrPower(stageConf.skillAttr);
		power += UserBag.getAttrPower(trainConf.attr);
		power += talentConf.power + UserBag.getAttrPower(talentConf.attr);
		this.powerPanel.setPower(power * 3);

		let arr = [];
		for (let key in stageConflist) {
			if (stageConflist.hasOwnProperty(key)) {
				let element = stageConflist[key];
				if (element.skillInfo) {
					let obj = new HuanShouZBTipItemData();
					obj.conf = element;
					obj.skinId = this.hsId;
					arr.push(obj);
				}
			}
		}
		this.skillList.dataProvider = new eui.ArrayCollection(arr);
	}
}
ViewManager.ins().reg(HuanShouSkinTips, LayerManager.UI_Popup);