class BossScoreExchangeBtn extends eui.ItemRenderer {
	// private rank: eui.Label;
	private grewUpAllBtn:eui.Button;
	private btnText:eui.Label;
	private redPoint:eui.Image;
	public constructor() {
		super();
		this.skinName = 'hefuBossBtnSkin';
	}
	protected childrenCreated(): void {
		super.childrenCreated();
	}
	protected dataChanged(): void {
		let id:number = this.data.id;
		let index:number = this.data.index;
		let config:ActivityType7Config = GlobalConfig.ActivityType7Config[id][index];
		this.btnText.text = config.title + "转";
		this.redPoint.visible = Activity.ins().IsBossScoreTitle(config.Id,config.title);

	}
	public destruct(): void {

	}

}