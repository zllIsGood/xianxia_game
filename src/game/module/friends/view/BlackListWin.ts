/**
 * 黑名单窗口
 */
class BlackListWin extends BaseComponent {
	public img_title: eui.Image;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public list_blackList: eui.List;
	public label_num: eui.Label;
	public group_pingbi: eui.Group;

	constructor(){
		super();

		this.name = `黑名单`;
		// this.skinName = "BlackListWinSkin";
	}

	public open(...param: any[]): void {
		// for (let k in this) {
		// 	if (this[k] instanceof eui.Button && !this[k].hasEventListener(egret.TouchEvent.TOUCH_TAP)) {
		// 		this.addTouchEvent((<eui.Button>this[k]), this.onTap);
		// 	}
		// }
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.list_blackList.itemRenderer = BlackListItemRender;
		this.list_blackList.dataProvider = Friends.ins().blackList;

		this.observe(Friends.ins().postFriendChange, this.updateView);

		//请求黑名单数据
		Friends.ins().sendBlackList();

		this.updateView();
	}

	public onTap(evt: egret.TouchEvent): void {
		switch (evt.target) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(BlackListWin);
				break;
		}
	}

	public updateView(): void {
		this.label_num.text = +this.list_blackList.dataProvider.length + "/" + GlobalConfig.FriendLimit.blacklistLen;
		if (this.group_pingbi) this.group_pingbi.visible = (Friends.ins().blackList.length == 0);
	}
}

ViewManager.ins().reg(BlackListWin, LayerManager.UI_Main);