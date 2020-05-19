/**
 * 属性升级面板
 */
class AttrUpgradePanel extends eui.Component {
	public curTxt: eui.Label;
	public nextTxt: eui.Label;

	private hasCreated: boolean = false;


	public constructor() {
		super();

		// this.skinName = `AttrUpgradePanelSkin`;
	}

	/**
	 * 创建完成
	 * @returns void
	 */
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init()
	}

	public init(): void {
		this.hasCreated = true;
	}

	/**
	 * 显示属性
	 * @param  {AttributeData[]} curAttr
	 * @param  {AttributeData[]} nextAttr
	 * @param  {boolean=true} nextShowName
	 * @returns void
	 */
	public showAttr(curAttr: AttributeData[], nextAttr: AttributeData[], nextShowName: boolean = true): void {
		if (!this.hasCreated) return;
		let str: string = ``;
		//当前
		if (curAttr && curAttr.length > 0) {
			str = AttributeData.getAttStr(curAttr);
			this.curTxt.textFlow = new egret.HtmlTextParser().parser(str);
		}
		else {
			//如果当前属性为空，则把下一级属性深拷贝一份出来，并把值置为0，用于强化面板
			if (nextAttr && nextAttr.length > 0) {
				let copyAttr: AttributeData[] = CommonUtils.copyDataHandler(nextAttr);
				for (let item of copyAttr) {
					item.value = 0;
				}
				str = AttributeData.getAttStr(copyAttr);
				this.curTxt.textFlow = new egret.HtmlTextParser().parser(str);
			} else {
				this.curTxt.text = `读取中...`;
			}

		}

		//下级
		if (nextAttr && nextAttr.length > 0) {
			str = AttributeData.getAttStr(nextAttr);
			this.nextTxt.textFlow = new egret.HtmlTextParser().parser(str);
		}
		else {
			this.nextTxt.text = `已满级`;
		}
	}
}