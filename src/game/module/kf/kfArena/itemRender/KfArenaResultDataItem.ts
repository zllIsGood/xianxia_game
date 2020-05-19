/**
 * Created by MPeter on 2018/3/14.
 * 跨服3v3竞技场数据单元项
 */
class KfArenaResultDataItem extends BaseItemRender {
	public rankTxt: eui.Label;
	public rankImg: eui.Image;
	public nameTxt: eui.Label;
	public kaTxt: eui.Label;
	public collectionTxt: eui.Label;
	public scoreTxt: eui.Label;
	public mvp: eui.Image;
	public arenaPointTxt: eui.Label;
	public arenaScoreTxt: eui.Label;
	public tags: eui.Image;
	public firstBloodImg: eui.Image;
	public firstCollectionImg: eui.Image;

	public constructor() {
		super();

	}

	protected dataChanged(): void {
		if (this.data instanceof KfArenaData) {
			if (this.data.actorid == Actor.actorID) {
				this.currentState = `oneself`;
			}
			else if (this.data.campId == KfArenaSys.ins().myCampId) {
				this.currentState = `own`;
			}
			else this.currentState = `enemy`;

			//有状态切换，可能会出现异常
			egret.callLater(() => {
				if (this.data.rank <= 3) {
					this.rankImg.source = `paihangs${this.data.rank}`;
					this.rankImg.visible = true;
					this.rankTxt.visible = false;
				}
				else {
					this.rankTxt.text = this.data.rank + "";
					this.rankImg.visible = false;
					this.rankTxt.visible = true;
				}

				this.nameTxt.text = `${this.data.playerName}S${this.data.servId}`;
				this.kaTxt.text = `${this.data.killNum}/${this.data.aidNum}`;
				this.collectionTxt.text = this.data.collectNum + "";
				this.scoreTxt.text = this.data.curScore + "";
				this.arenaPointTxt.text = this.data.curGetScore + "";
				if (this.data.arenaScore == 0) {
					this.arenaScoreTxt.text = `${this.data.totalScore} ${KfArenaSys.ins().winCamp == this.data.campId || KfArenaSys.ins().winCamp == 3 ? "+" : "-"}${this.data.arenaScore}`;
				}
				else {
					this.arenaScoreTxt.text = `${this.data.totalScore} ${this.data.arenaScore > 0 ? "+" : ""}${this.data.arenaScore}`;
				}

				this.mvp.visible = this.data.isMvp;

				this.firstBloodImg.visible = this.data.isFirstKiller;
				this.firstCollectionImg.visible = this.data.isFirstCollect;

				if (this.data.isOnWin) {
					this.tags.visible = true;
					this.tags.source = `kfarena_straight_win_tag`;
				}
				else if (this.data.isDeserter) {
					this.tags.visible = true;
					this.tags.source = `kfarena_deserter_tag`;
				}
				else {
					this.tags.visible = false;
				}
			}, this);

		}
	}
}
