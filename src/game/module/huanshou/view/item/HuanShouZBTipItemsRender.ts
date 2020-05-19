class HuanShouZBTipItemsRender extends BaseItemRender {
	private skillIcon1: eui.Image;
	private desc: eui.Label;
	public constructor() {
		super();
		this.skinName = 'huanShouHHTipItemsSkin';
	}

	protected dataChanged(): void {
		let tipData = this.data as HuanShouZBTipItemData;
		if (!tipData) return;

		if (tipData.conf.skillInfo )
			this.skillIcon1.source = tipData.conf.skillInfo.icon;
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(`${tipData.conf.stage}阶习得技能|C:0xff00ff&T:【${tipData.conf.skillInfo.name}】\n${tipData.conf.skillInfo.desc}`);
	}
}

class HuanShouZBTipItemData {
	public conf: HuanShouSkinStageConf;
	public skinId: number;
	public constructor() {
	}
}