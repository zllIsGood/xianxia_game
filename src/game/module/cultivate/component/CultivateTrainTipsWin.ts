/**
 * 培养培养提示窗口
 */
class CultivateTrainTipsWin extends BaseEuiView {
	public bg: eui.Image;
	public levelLabel: eui.Label;
	public outputLabel: eui.Label;
	public lvLimit: eui.Label;
	public powerImage: eui.Image;
	public powerLabel: eui.BitmapLabel;
	public attrLabel: eui.Label;
	public nextAttrLabel: eui.Label;

	public constructor() {
		super();
		this.skinName = `QualificationTipsSkin`;
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
	}

	public initData(): void {

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.onTapBtn);
		this.updateView(param[0]);
	}

	public close(...param: any[]): void {

	}

	private onTapBtn(evt: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

	private updateView(data: CultivateDanData): void {
		if (data && data instanceof CultivateDanData) {
			let powerNum: number = 0;
			let currAttr: AttributeData[] = data.getAttr(data.level);
			let nextAttr: AttributeData[] = data.getAttr(data.level + 1);
			let levelData = FlySword.ins().getLevelData(data.roleId);

			let attrStr: string = ``;
			//设置当前属性
			if (currAttr) {
				powerNum = data.power;
				let format = AttributeFormat.getFormat();
				format.attrColor = format.wordColor = this.attrLabel.textColor;

				attrStr = AttributeData.getAttStr1(currAttr, format);
				this.attrLabel.textFlow = new egret.HtmlTextParser().parser(attrStr);
			}
			else
				this.attrLabel.text = ``;

			//设置下一级属性
			if (nextAttr) {
				let format = AttributeFormat.getFormat();
				format.attrColor = format.wordColor = this.nextAttrLabel.textColor;

				attrStr = AttributeData.getAttStr1(nextAttr, format);
				this.nextAttrLabel.textFlow = new egret.HtmlTextParser().parser(attrStr);
			}
			else
				this.nextAttrLabel.text = `已满级`;


			let nameStr = CultivateModel.getTypeName(data.type);
			this.lvLimit.text = data.isTopMaxNotLevelMax() && data.getNextConfig() ? `${nameStr}达到${levelData.level + 1}阶后增加使用上限` : ``;
			this.powerLabel.text = powerNum.toString();
			this.outputLabel.text = `活动产出`;
			this.levelLabel.text = `${nameStr}${CultivateModel.getTrainTypeName(data.trainType)}等级：${data.level}级`;
		}
	}

}

ViewManager.ins().reg(CultivateTrainTipsWin, LayerManager.UI_Popup);