/**
 * 好友申请列表窗口
 */
class FriendsAddWin extends BaseEuiView {
	public img_title: eui.Image;
	public closeBtn0: eui.Button;
	public btn_add: eui.Button;
	public editText_name: eui.EditableText;
	private shadow: eui.Rect;

	constructor() {
		super();
		this.skinName = "FriendsAddWinSkin";

	}

	public open(...param: any[]): void {
		// for (let k in this) {
		// 	if (this[k] instanceof eui.Button && !this[k].hasEventListener(egret.TouchEvent.TOUCH_TAP)) {
		// 		this.addTouchEvent((<eui.Button>this[k]), this.onTap);
		// 	}
		// }
		this.addTouchEvent(this.btn_add, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.shadow, this.onTap);
		this.observe(Friends.ins().postFriendChange, this.updateView);
	}

	public close(...param: any[]): void {
	}

	public onTap(evt: egret.TouchEvent): void {
		switch (evt.target) {
			case this.closeBtn0:
				ViewManager.ins().close(FriendsAddWin);
				break;
			case this.btn_add:
				if (this.editText_name.text == Actor.myName) {
					UserTips.ins().showTips("不能添加自己为好友");
					return
				}
				if (this.editText_name.text != "") {
					Friends.ins().sendAddFriend(0, this.editText_name.text)
				}
				ViewManager.ins().close(FriendsAddWin);
				break;
			case this.shadow:
				ViewManager.ins().close(this);
				break;
		}
	}

	public updateView(): void {

	}
}

ViewManager.ins().reg(FriendsAddWin, LayerManager.UI_Popup);