/**
 * 天仙皮肤道具tips界面
 *
 */
class ZhanlingZBTipWin extends BaseEuiView {
	private zhanlingName: eui.Image;
	private powerPanel: PowerPanel;
	private itemname: eui.Label;//物品名称
	private skillIcon0: eui.Image;
	private desc: eui.Label;
	private zhanling: eui.Group;
	private zlId: number;
	private itemid: number;
	private model: MovieClip;
	private bottomD: eui.Group;
	private bottomMc: MovieClip;
	private quali: eui.Image;
	private skillList: eui.List;
	private gainList: eui.List;

	constructor() {
		super();
		this.skinName = 'ZhanlingZBTipsSkin';
	}

	public close(...param: any[]): void {

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.gainList.itemRenderer = GainGoodsItem;
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.skillList.itemRenderer = ZhanlingZBTipItemsRender;
		this.itemid = param[0];
		for (let k in GlobalConfig.ZhanLingBase) {
			let zlBase: ZhanLingBase = GlobalConfig.ZhanLingBase[k];
			if (zlBase.mat == this.itemid) {
				this.zlId = zlBase.id;//找到皮肤道具对应的天仙皮肤id
				break;
			}
		}
		let cfg: ZhanLingLevel = GlobalConfig.ZhanLingLevel[this.zlId][0];
		this.zhanlingName.source = cfg.zlName;//天仙名字

		//模型
		if (!this.model)
			this.model = new MovieClip();
		if (!this.model.parent)
			this.zhanling.addChild(this.model);
		if (this.model.name != RES_DIR_EFF + cfg.innerAppearance)
			this.model.playFile(RES_DIR_EFF + cfg.innerAppearance, -1);
		if (!this.bottomMc)
			this.bottomMc = new MovieClip();
		if (!this.bottomMc.parent)
			this.bottomD.addChild(this.bottomMc);
		if (!this.bottomMc.isPlaying)
			this.bottomMc.playFile(RES_DIR_EFF + "zhanlingbottom", -1);
		//物品名
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[this.itemid];
		this.itemname.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ItemConfig.getQualityColor(itemConfig)}&T:${itemConfig.name}`);
		let q = ItemConfig.getQuality(itemConfig);
		this.quali.source = q > 0 ? `quali${q}` : "";

		//天赋
		let zlBase = GlobalConfig.ZhanLingBase[this.zlId];
		let zlTconfig: ZhanLingTalent = GlobalConfig.ZhanLingTalent[zlBase.talent][1];
		if (!zlTconfig)
			zlTconfig = GlobalConfig.ZhanLingTalent[zlBase.talent][1];
		//在天赋描述中有就拿天赋描述 否则拿技能数据的icon
		let tfdesc = "激活后获得强力天赋:";
		if (zlTconfig.talentDesc && zlTconfig.talentDesc.icon) {
			this.skillIcon0.source = zlTconfig.talentDesc.icon;
			if (zlTconfig.talentDesc.desc)
				tfdesc += zlTconfig.talentDesc.desc;

		} else {
			if (zlTconfig.passive)
				this.skillIcon0.source = Math.floor(zlTconfig.passive[0].id / 1000) * 1000 + "_png";
			let skconfig: SkillsConfig = GlobalConfig.SkillsConfig[zlTconfig.passive[0].id];
			let skdconfig: SkillsDescConfig = GlobalConfig.SkillsDescConfig[skconfig.desc];
			tfdesc += StringUtils.replace(skdconfig.desc, skconfig.desc_ex);
		}
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(tfdesc);

		//战力计算
		let roleLen = 3;
		let zlLevel: ZhanLingLevel = GlobalConfig.ZhanLingLevel[this.zlId][0];
		let zlValue = UserBag.getAttrPower(zlLevel.attrs) * roleLen;
		let tfValue = (zlTconfig.expower + UserBag.getAttrPower((zlTconfig.attrs ? zlTconfig.attrs : [])) ) * roleLen;
		let jnValue = 0;
		//技能
		let arrSkId: { id: number, zlId: number }[] = [];
		for (let i = 0; i < zlBase.skill.length; i++) {
			let skillid = zlBase.skill[i].id;
			let zlsConfig: ZhanLingSkill = GlobalConfig.ZhanLingSkill[skillid];
			if (!zlsConfig.attrs)continue;
			jnValue += UserBag.getAttrPower(zlsConfig.attrs) * roleLen;//计算N角色技能战力
			arrSkId.push({id: skillid, zlId: zlBase.id});
		}
		this.skillList.dataProvider = new ArrayCollection(arrSkId);

		zlValue = zlValue + tfValue + jnValue;
		this.powerPanel.setPower(zlValue);

		let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[this.itemid];
		if (gainConfig)
			this.gainList.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
	}

	private otherClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null || !item[1]) {
			return;
		}
		ViewManager.ins().open(item[1], item[2]);
	}
}
ViewManager.ins().reg(ZhanlingZBTipWin, LayerManager.UI_Popup);
