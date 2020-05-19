/**
 * Created by MPeter on 2017/12/7.
 * 跨服副本-无极战场-战场数据Item
 */
class WJBattleDataItem extends BaseItemRender {
	private bg: eui.Image;
	/**玩家昵称标签 */
	private nickLabel: eui.Label;
	/**信息组数量标签（杀人数/死亡/助攻） */
	private numLabel: eui.Label;
	/**采集旗子数标签 */
	private collectFlagLabel: eui.Label;
	/**获取荣誉标签 */
	private honorLabel: eui.Label;
	/**mvp荣誉 */
	private mvpImg: eui.Image;
	/**首杀 */
	private firstKillImg: eui.Image;

	public constructor() {
		super();
	}
	protected dataChanged(): void {
		if (this.data instanceof WJBattleData) {
			let dt: WJBattleData = this.data;
			if (dt.isResult) {
				this.currentState = `result`;
			}
			else {
				this.currentState = `data`;
			}


			this.nickLabel.text = dt.playerName;
			this.numLabel.text = `${dt.killNum}/${dt.killedNum}/${dt.assistsNum}`;
			this.collectFlagLabel.text = dt.collectFlagNum + "";
			this.firstKillImg.visible = dt.isFirstKiller > 0;
			this.mvpImg.visible = dt.isMVP > 0;
			this.mvpImg.source = dt.camp == WJBattlefieldSys.ins().myCampId ? `wj_mvp_green` : `wj_mvp_red`;

			this.honorLabel.text = ``;

			//不同阵营不同背景色
			this.bg.source = dt.camp == WJBattlefieldSys.ins().myCampId ? `wj_data_item_bg2` : `wj_data_item_bg1`;


		}
	}
}