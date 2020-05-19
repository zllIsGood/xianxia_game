/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场-结算面板
 */
class WJBattlefieldResultWin extends BaseEuiView {
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
	/**退出按钮 */
	private quitBtn: eui.Button;

	private _myScore: eui.BitmapLabel;
	private _enemyScore: eui.BitmapLabel;

	public constructor() {
		super();
		this.skinName = `WJBattleDataSkin`;
		this.currentState = `result`;
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

		//添加互斥接口
		this.addExclusionWin(egret.getQualifiedClassName(WJBattlefieldDataWin));
	}

	public open(...args): void {
		this.addTouchEvent(this.bgClose, this.onTouch);
		// this.addTouchEvent(this.quitBtn, this.onTouch);

		this.upData(args[0], args[1], args[2], args[3]);

	}
	@callLater
	private upData(...args): void {
		let AScores: number = args[0];
		let BScores: number = args[1];
		let mydatas: WJBattleData[] = args[2];
		let enemydatas: WJBattleData[] = args[3];

		this.myList.dataProvider = new eui.ArrayCollection(mydatas);
		this.enemyList.dataProvider = new eui.ArrayCollection(enemydatas);

		BitmapNumber.ins().changeNum(this._myScore, AScores, "1", 5);
		BitmapNumber.ins().changeNum(this._enemyScore, BScores, "1", 5);

		//判断结果
		if (AScores > BScores) {
			this.myResult.source = `wjBattle_json.wj_winning`;
			this.enemyResult.source = `wjBattle_json.wj_fail`;
		}
		else {
			this.enemyResult.source = `wjBattle_json.wj_winning`;
			this.myResult.source = `wjBattle_json.wj_fail`;
		}
	}


	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.quitBtn:
                UserFb.ins().sendExitFb();
				break;
		}
	}
}
ViewManager.ins().reg(WJBattlefieldResultWin, LayerManager.UI_Popup);
