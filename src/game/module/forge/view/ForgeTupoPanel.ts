/**
 * 突破
 */
class ForgeTupoPanel extends BaseView {

	constructor() {
		super();
	}

	// protected isShowPower(): void {
	// 	this.titleLabel.visible = true;
	// 	this.powerImg.visible = false;
	// }
	//
	// protected panelName(): void {
	// 	this.name = "突破";
	// 	this.icon.source = "vigor";
	// 	this.upGradeBtn.label = "突  破";
	// 	this.curPanel = 3;
	// }
	//
	// protected setTitle(config: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig): void {
	// 	this.titleLabel.text = "总" + this.name + " +" + SubRoles.ins().getSubRoleByIndex(this.curRole).getEquipForgeTotalLv(this.curPanel);
	// }
	//
	// protected setPower(): void {
	//
	// }
	//
	// // protected onTouch(e: TouchEvent): void {
	// // 	let costConfig: TupoCostConfig = UserForge.ins().getTupoCostConfigByLv(this.lv + 1);
	// // 	if (this.itemNum >= costConfig.count) {
	// // 		UserTupo.ins().sendUpGrade(this.curRole, this.pos);
	// // 	} else {
	// // 		UserWarn.ins().setBuyGoodsWarn( costConfig.itemId, costConfig.count - this.itemNum);
	// //
	// // 	}
	// // }
	//
	// // protected onGetItem(e: TouchEvent): void {
	// // 	UserWarn.ins().setBuyGoodsWarn(UserForge.ins().getTupoCostConfigByLv(this.lv + 1).itemId,1);
	// // }
	//
	// protected setAttrData(config: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig): void {
	// 	if (config)
	// 		this.attrLabel.text = "基础属性 +" + config.attr + "%";
	// 	else
	// 		this.attrLabel.text = "基础属性 +" + 0 + "%";
	//
	// 	let nextConfig: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig;
	// 	nextConfig = UserForge.ins().getForgeConfigByPos(this.pos, this.lv + 1, this.curPanel);
	// 	if (nextConfig) {
	// 		this.nextAttrLabel.text = nextConfig.attr + "%";
	// 		this.expendLabel.text = "消耗: ";
	// 		this.expendLabel.textAlign = "left";
	// 		this.icon.visible = true;
	// 		this.countLabel.visible = true;
	// 		this.upGradeBtn.visible = true;
	// 	} else {
	// 		this.expendLabel.text = "已提升至满级";
	// 		this.expendLabel.textAlign = "center";
	// 		this.nextAttrLabel.text = "已满级";
	// 		this.icon.visible = false;
	// 		this.countLabel.visible = false;
	// 		this.upGradeBtn.visible = false;
	// 	}
	// }
	//
	// protected setCount(): void {
	// 	let costConfig: TupoCostConfig = UserForge.ins().getTupoCostConfigByLv(this.lv + 1);
	// 	let cost: number = 0;
	// 	if (costConfig) {
	// 		this.itemNum = UserBag.ins().getBagGoodsCountById(0, costConfig.itemId);
	// 		cost = costConfig.count;
	// 	}
	// 	let colorStr: string = "";
	// 	if (this.itemNum >= cost)
	// 		colorStr = "|C:0x35e62d&T:";
	// 	else
	// 		colorStr = "|C:0xf3311e&T:";
	// 	this.countLabel.textFlow = TextFlowMaker.generateTextFlow(colorStr + this.itemNum + "| / " + cost);
	// }
}
