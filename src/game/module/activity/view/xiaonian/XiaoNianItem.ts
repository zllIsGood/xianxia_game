/**
 * 红包界面控件类(红包界面点击左右按钮更新的内容)
 */
class XiaoNianItem extends BaseItemRender {
	constructor() {
		super();
		this.skinName = 'XNHongBaoItem';
	}
	protected childrenCreated(): void {
		super.childrenCreated();

	}

	protected dataChanged(): void {
		if( !this.data )return;
		this.currentState = this.data;
	}

	public destruct(): void {

	}


}