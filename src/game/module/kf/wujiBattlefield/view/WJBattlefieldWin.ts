/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场主界面
 */
class WJBattlefieldWin extends BaseEuiView {
	/**选择角色-角色信息面板*/
	private roleSelect: RoleSelectPanel;
	/**帮助按钮 */
	private help: eui.Button;
	/**窗体title */
	private title: eui.Image;
	/**领取奖励按钮 */
	private getAwardBtn: eui.Button;
	/**匹配按钮 */
	private matchBtn: eui.Button;
	/**人生不足自动扩大转生限制 */
	private autoCheckBox: eui.CheckBox;

	/**剩余参与次数 */
	private timesLabel: eui.Label;
	/**功勋商店 */
	private shopLink: eui.Label;
	/**奖励列表 */
	private awardList: eui.List;
	/**本周达标后获得荣誉点标签*/
	private standardLabel: eui.Label;
	/**战场开启时间 */
	private timeLabel: eui.Label;

	private viewArea: eui.Rect;

	public constructor() {
		super();
		this.skinName = `WJBattleSkin`;
		this.isTopLevel = true;//设为1级UI
	}
	public open(...args): void {
		this.addTouchEvent(this.getAwardBtn, this.onTouch);
		this.addTouchEvent(this.matchBtn, this.onTouch);
		this.addTouchEvent(this.shopLink, this.onTouch);
		this.addTouchEvent(this.viewArea, this.onTouch);

		this.upData();
	}
	public close(...args): void {

	}
	public initUI(): void {
		this.awardList.itemRenderer = ItemBase;

		this.shopLink.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.shopLink.text}`);
	}
	/**更新数据 */
	private upData(): void {
		this.timesLabel.text = `剩余参与次数：${WJBattlefieldSys.ins().overCounts}`;
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.getAwardBtn:
				break;
			case this.matchBtn:
				if (WJBattlefieldSys.ins().matchingTime == 0) {
					WJBattlefieldSys.ins().sendMatch(this.autoCheckBox.selected);
				}
				else {//匹配中，则直接打开
					ViewManager.ins().open(WJBattlefieldMatchPanel);
				}


				break;
			case this.shopLink:
				ViewManager.ins().open(ShopWin);
				break;
			case this.viewArea:
			    WJBattlefieldSys.ins().sendViewDataInfo();
				break;

		}
	}
}
ViewManager.ins().reg(WJBattlefieldWin, LayerManager.UI_Main);
