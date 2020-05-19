/**
 * 改名窗口
 */
class RenameWin extends BaseEuiView {

	public bgClose: eui.Rect;
	public sureBtn: eui.Button;
	public input: eui.EditableText;
	public constructor() {
		super();

		this.skinName = 'NameChangeSkin';
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.sureBtn, this.onTap);
		this.input.text = '';
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			//关闭
			case this.bgClose:
				ViewManager.ins().close(RenameWin);
				break;

			//确定修改
			case this.sureBtn:
				if (this.input.text.length == 0) {
					UserTips.ins().showTips('您尚未输入名字！');
				}
				else if (UserBag.ins().getBagItemById(ItemConst.RENAME) != null) {
					GameLogic.ins().sendRename(this.input.text);
				}
				break;
		}
	}
}

ViewManager.ins().reg(RenameWin, LayerManager.UI_Popup);

