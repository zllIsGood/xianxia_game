/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场-查看战场数据
 */
class WJBattlefieldDataWin extends BaseEuiView {
	/**闭合背景 */
	private bgClose: eui.Rect;
	/**我的队伍列表 */
	private myList: eui.List;
	/**敌方的队伍列表 */
	private enemyList: eui.List;
	/**我的结果 */
	private myResult: eui.Image;
	/**敌方的结果 */
	private enemyResult: eui.Image;
	/**UI组 */
	private group: eui.Group;

	private _myScore: eui.BitmapLabel;
	private _enemyScore: eui.BitmapLabel;

	public constructor() {
		super();
		this.skinName = `WJBattleDataSkin`;
		this.currentState = `data`;
	}
	public initUI(): void {
		this.myList.itemRenderer = WJBattleDataItem;

		this._myScore = BitmapNumber.ins().createNumPic(0, "1", 5);
		this._myScore.x = 95;
		this._myScore.y = 100;
		this.group.addChild(this._myScore);

		this._enemyScore = BitmapNumber.ins().createNumPic(0, "1", 5);
		this._enemyScore.x = 300;
		this._enemyScore.y = 100;
		this.group.addChild(this._enemyScore);
	}

	public open(...args): void {
		this.addTouchEvent(this.bgClose, this.onTouch);

		let mydatas: WJBattleData[] = args[0];
		let enemydatas: WJBattleData[] = args[1];

		// egret.callLater(() => {
			this.myList.dataProvider = new eui.ArrayCollection(mydatas);
			this.enemyList.dataProvider = new eui.ArrayCollection(enemydatas);
		// }, this);



		BitmapNumber.ins().changeNum(this._myScore, WJBattlefieldSys.ins().campAScores, "1", 5);
		BitmapNumber.ins().changeNum(this._enemyScore, WJBattlefieldSys.ins().campBScores, "1", 5);

	}
	public close(...args): void {
		this.myList.dataProvider = null;

		this.enemyList.dataProvider = null;
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}

	}
}
ViewManager.ins().reg(WJBattlefieldDataWin, LayerManager.UI_Popup);
