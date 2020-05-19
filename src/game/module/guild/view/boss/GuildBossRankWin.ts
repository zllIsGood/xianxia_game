class GuildBossRankWin extends BaseEuiView {
	private bgClose: eui.Image;
	private list: eui.List;
	private index: number = 0;
	private qiansan: eui.Image;
	private myrank: eui.Label;
	private myname: eui.Label;
	private myharm: eui.Label;
	private myreword: eui.Label;
	constructor() {
		super();
		this.skinName = "GuildBossHarmSkin";
		this.isTopLevel = true;
		this.list.itemRenderer = GuildBossRankItemRender;
	}

	public initUI(): void {
		super.initUI();
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}


	public open(...param: any[]): void {
		this.index = param[0];
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private myData: guildBossRankData;
	private setView(): void {
		let arr: any[] = []
		let rankArr = GuildBoss.ins().guildPersonRankDic[this.index + 1] || [];
		for (let i: number = 0; i < rankArr.length; i++) {
			if (!rankArr[i]) continue;
			if (rankArr[i].name == Actor.myName) this.myData = rankArr[i];
			// if (i > 10) continue;
			arr.push(rankArr[i]);
		}
		this.list.dataProvider = new eui.ArrayCollection(arr);
		if (this.myData) {
			this.qiansan.visible = true;
			this.myrank.visible = true;
			this.myname.visible = true;
			this.myharm.visible = true;
			this.myreword.visible = true;
			if (this.myData.rank <= 3) {
				this.qiansan.source = `guildpaihang${this.myData.rank}`;
			} else {
				this.qiansan.source = ``;
			}
			this.myrank.text = this.myData.rank + "";
			this.myname.text = this.myData.name;
			this.myharm.text = this.myData.damage + "";
			this.myreword.text = `${GuildBoss.ins().leftTimes}/${GlobalConfig.GuildBossConfig.dayTimes}`

		} else {
			this.qiansan.visible = false;
			this.myrank.visible = false;
			this.myname.visible = false;
			this.myharm.visible = false;
			this.myreword.visible = false;
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(GuildBossRankWin);
				break;

		}
	}
}

ViewManager.ins().reg(GuildBossRankWin, LayerManager.UI_Popup);
