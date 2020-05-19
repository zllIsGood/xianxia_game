/**觉醒套装tips */
class AwakenSuitTipWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public current: eui.Group;
	public curAttr: eui.Label;
	public curCondition: eui.Label;
	public curFight: eui.Label;
	public next: eui.Group;
	public nextAttr: eui.Label;
	public nextCondition: eui.Label;
	public nextFight: eui.Label;

	public constructor() {
		super();
		this.skinName = 'equipjuexingTipSkin';
	}

	private suitData: AwakenSuitData;
	public open(...params) {
		this.suitData = params[0];
		this.addTouchEvent(this, this.onCloseTouch);
		this.show();
	}

	private show() {
		let curCondition = '';
		let curPower = 0;
		let curAttr = '';
		let nextCondition = '';
		let nextPower = 0;
		let nextAttr = '';
		let state = this.suitData.getState();
		if (state == 0) {
			this.currentState = 'disable';
			curCondition = `所有部位达到${this.suitData.needAwakenStage}阶(${this.suitData.cnt}/${this.suitData.maxLevel})`;
			curPower = this.suitData.getSuitPower(1);
			curAttr = AttributeData.getAttStr2(this.suitData.getSuitConf(1).attr);
		} else if (state == 1) {
			this.currentState = 'normal';
			//上一阶
			curCondition = `所有部位达到${this.suitData.getPreStage()}阶(${this.suitData.maxLevel}/${this.suitData.maxLevel})`;
			curPower = this.suitData.getSuitPower(0);
			curAttr = AttributeData.getAttStr2(this.suitData.getSuitConf(0).attr);
			//当前阶(下阶预览)
			nextCondition = `所有部位达到${this.suitData.needAwakenStage}阶(${this.suitData.cnt}/${this.suitData.maxLevel})`;
			nextPower = this.suitData.getSuitPower(1);
			nextAttr = AttributeData.getAttStr2(this.suitData.getSuitConf(1).attr);
		} else {
			this.currentState = 'max';
			curCondition = `所有部位达到${this.suitData.needAwakenStage}阶(${this.suitData.maxLevel}/${this.suitData.maxLevel})`;
			curPower = this.suitData.getSuitPower(1);
			curAttr = AttributeData.getAttStr2(this.suitData.getSuitConf(1).attr);
		}
		this.curCondition.text = curCondition;
		this.curFight.text = `${curPower}`;
		this.curAttr.textFlow = new egret.HtmlTextParser().parser(curAttr);

		this.nextCondition.text = nextCondition;
		this.nextFight.text = `${nextPower}`;
		this.nextAttr.textFlow = new egret.HtmlTextParser().parser(nextAttr);
	}

	private onCloseTouch() {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(AwakenSuitTipWin, LayerManager.UI_Popup);