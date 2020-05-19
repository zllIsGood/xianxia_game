/**
 * 天仙套装tips界面
 *
 */
class ZhanLingSuitTip extends BaseEuiView {
	private name0: eui.Label;
	private content0: eui.Label;
	private attr0: eui.Label;
	private name1: eui.Label;
	private content1: eui.Label;
	private attr1: eui.Label;
	private id: number;//天仙id
	private bgClose: eui.Rect;

	constructor() {
		super();
		this.skinName = 'ZhanlingSuitTipsSkin';
	}

	public close(...param: any[]): void {

	}

	private otherClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEvent(this.bgClose, this.otherClose);
		this.id = param[0];
		let lv = ZhanLingModel.ins().getZhanLingDataBySuit(this.id);
		let maxLv = CommonUtils.getObjectLength(GlobalConfig.ZhanLingSuit);
		let maxCount = GlobalConfig.ZhanLingConfig.equipPosCount;
		let curCount = 0;
		if (!lv) {
			this.currentState = "unactive";
			lv = 1;
		} else {
			curCount = ZhanLingModel.ins().getZhanLingDataBySuitCount(this.id, lv);
			if (lv >= maxLv && curCount >= maxCount) {//激活后 显示的是active 如果当前已经满足最大 证明是满级
				this.currentState = "max";
			} else {
				this.currentState = "active";
			}
		}
		this.validateNow();
		//当前
		let config: ZhanLingSuit = GlobalConfig.ZhanLingSuit[lv];
		let content = StringUtils.replace(config.suitCondition, `${curCount}`, `${maxCount}`);
		if (this.currentState == "unactive") {
			this.content0.textFlow = TextFlowMaker.generateTextFlow1(content);
		}
		let attStr = AttributeData.getAttStr(config.attrs, 0, 1, "+");
		attStr += "\n" + "天仙基础属性+" + config.precent / 100 + "%";
		this.attr0.text = attStr;
		this.name0.text = config.suitTname;
		//下一级
		if (this.currentState == "active") {
			let nextconfig: ZhanLingSuit = GlobalConfig.ZhanLingSuit[lv + 1];
			curCount = ZhanLingModel.ins().getZhanLingDataBySuitCount(this.id, lv + 1);
			content = StringUtils.replace(nextconfig.suitCondition, `${curCount}`, `${maxCount}`);
			this.content1.textFlow = TextFlowMaker.generateTextFlow1(content);
			let nattStr = AttributeData.getAttStr(nextconfig.attrs, 0, 1, "+");
			nattStr += "\n" + "天仙基础属性+" + nextconfig.precent / 100 + "%";
			this.attr1.text = nattStr;
			this.name1.text = nextconfig.suitTname;
		}
	}
}
ViewManager.ins().reg(ZhanLingSuitTip, LayerManager.UI_Popup);
