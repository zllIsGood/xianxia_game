class RuneExchangeItemRenderer extends eui.ItemRenderer {

	public descLab: eui.Label;
	public descLab1: eui.Label;
	public nameLab0: eui.Label;
	public goBtn: eui.Button;
	public icon: RuneDisplay;
	private effpos:eui.Group;
	public constructor() {
		super();
		this.skinName = "RuneExchangeItemSkin";
		this.goBtn.name = "goBtn";
	}

	protected dataChanged(): void {
	if (!this.data || Object.keys(this.data).length <= 0 || this.data["null"] != null) return;
		let cfg: RuneConverConfig = this.data as RuneConverConfig;
		if (cfg) {
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[cfg.id];

			//图标
			// this.icon.showName(false);
			this.icon.setDataByItemConfig(itemCfg);
			//属性
			let info: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfgByItemConfig(itemCfg);
			this.descLab.text = RuneConfigMgr.ins().getcfgAttrDesc(info);
			//关卡数
			let config = GlobalConfig.FbChallengeConfig[cfg.checkpoint];
			if (!config) {
				this.descLab1.text = `默认解锁`;
			} else {
				this.descLab1.text = `通关通天塔${GlobalConfig.FbChNameConfig[config.group].name}解锁`;
			}
			//数量
			// let colorStr: string = Actor.runeExchange >= cfg.conversion ? "0x35e62d" : "0xf3311e";
			// let finalStr: string = `<font color = ${colorStr}>${Actor.runeExchange}</font>/${cfg.conversion}`;
			// this.nameLab0.textFlow = new egret.HtmlTextParser().parser(finalStr);

			let colorStr: string = "";
			if (Actor.runeExchange >= cfg.conversion)
				colorStr = ColorUtil.GREEN_COLOR;
			else
				colorStr = ColorUtil.RED_COLOR;
			this.nameLab0.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${Actor.runeExchange}</font><font color=${ColorUtil.WHITE_COLOR}>/${cfg.conversion}</font> `);
			this.setEff(itemCfg);
		} else {
			this.retView();
		}

	}
	private EquipEffect: MovieClip;
	private setEff(itemCfg: ItemConfig){
		let quality = ItemConfig.getQuality(itemCfg);
		if( quality == 5 ){
			this.EquipEffect = this.EquipEffect || new MovieClip();
			this.EquipEffect.touchEnabled = false;
			if( !this.EquipEffect.parent )
				this.addChild(this.EquipEffect);
			this.EquipEffect.playFile(RES_DIR_EFF + "chuanqizbeff", -1);
			this.EquipEffect.x = this.effpos.x;
			this.EquipEffect.y = this.effpos.y;
			this.EquipEffect.scaleX = this.effpos.scaleX;
			this.EquipEffect.scaleY = this.effpos.scaleY;
		}
	}
	public close(){
		DisplayUtils.removeFromParent(this.EquipEffect);
	}
	private retView(): void {
		this.descLab.text = "";
		this.descLab1.text = "";
		this.nameLab0.text = "";
		this.icon.setData(null);
		this.close();
	}
}