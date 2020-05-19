/**
 * 天仙丹药道具tips界面
 *
 */
class ZhanLingItemTips extends BaseEuiView {
	private nameLabel: eui.Label;
	private itemIcon: ItemIcon;
	private use: eui.Label;
	private num: eui.Label;
	private num0: eui.Label;
	private attr: eui.Label;
	private info: eui.Label;
	private id: number;//天仙id
	private itemid: number;//道具id
	private bgClose: eui.Rect;

	constructor() {
		super();
		this.skinName = 'ZhanglingUpTipsSkin';
	}

	public close(...param: any[]): void {

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEvent(this.bgClose, this.otherClose);
		this.id = param[0];
		this.itemid = param[1];
		let config: ItemConfig = GlobalConfig.ItemConfig[this.itemid];
		this.itemIcon.setData(config);
		this.nameLabel.textFlow = TextFlowMaker.generateTextFlow1(config.name);
		let curCount = ZhanLingModel.ins().getZhanLingDataByDrug(this.id, this.itemid);//使用数量
		let level = ZhanLingModel.ins().getZhanLingDataByLevel(this.id);
		let zllevel: ZhanLingLevel = GlobalConfig.ZhanLingLevel[this.id][level];
		let maxCount = zllevel.maxCount[this.itemid];//最大使用数量
		let color = curCount >= maxCount ? 0x00ff00 : 0xff0000;
		this.use.textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:${curCount}|/${maxCount}`);
		let itemData: ItemData = UserBag.ins().getBagItemById(this.itemid);//背包拥有数
		this.num.text = itemData ? `${itemData.count}` : "0";

		// let lv = Math.floor(level%10);
		// if( level ){
		// 	lv = lv?lv:10;
		// }else{
		// 	lv = 0;
		// }
		let stage = ZhanLingModel.ins().getZhanLingDataByStage(this.id) + 1;
		if (stage * 10 > CommonUtils.getObjectLength(GlobalConfig.ZhanLingLevel[this.id])) {
			DisplayUtils.removeFromParent(this.info);
		} else {
			this.num0.text = `${stage}阶${1}星`;
		}
		let upgradeInfo = GlobalConfig.ZhanLingConfig.upgradeInfo[this.itemid];
		let attrtext: string = AttributeData.getAttStr(upgradeInfo.attr, 0, 1, "+");
		if (upgradeInfo.precent) {
			attrtext += `\n天仙基础属性+${upgradeInfo.precent / 100}%`;
		}
		this.attr.text = attrtext;

	}

	private otherClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(ZhanLingItemTips, LayerManager.UI_Popup);
