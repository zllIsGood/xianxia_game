/**
 * Created by MPeter on 2018/3/15.
 *  排行单元格
 */
class KfArenaRankItemRender extends BaseItemRender {
	/*背景图*/
	public bg: eui.Image;
	/*文本排名*/
	public rankTxt: eui.Label;
	/*玩家名字*/
	public player: eui.Label;
	/*积分*/
	public score: eui.Label;
	/*排位*/
	public seasonTitle: eui.Label;
	/*区服ID*/
	public serverId: eui.Label;
	/*位图排名（前三名）*/
	public rankImg: eui.Image;
	/*vip图标*/
	public vip: eui.Image;


	public constructor() {
		super();
		this.touchChildren = false;
	}

	protected  dataChanged(): void {
		if (this.data instanceof KfArenaRankData) {
			//前三名排名特殊处理
			if (this.data.rank <= 3) {
				this.rankImg.source = `paihang${this.data.rank}`;
				this.rankTxt.visible = false;
				this.rankImg.visible = true;
			}
			else {
				this.rankTxt.text = this.data.rank + "";
				this.rankTxt.visible = true;
				this.rankImg.visible = false;

			}


			this.player.text = `${this.data.playerName}`;
			this.score.text = this.data.score + "";
			this.seasonTitle.text = GlobalConfig.CrossArenaBase.scoreMetalName[this.data.dan - 1];
			this.serverId.text = `S${this.data.servId}`;
			this.vip.visible = this.data.vip > 0;

		}

	}

}
