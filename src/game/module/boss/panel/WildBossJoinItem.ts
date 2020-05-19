class WildBossJoinItem extends BaseItemRender {

	private bg: eui.Image;

	private txt0: eui.Label;
	private txt1: eui.Label;
	private txt2: eui.Label;

	constructor() {
		super();
	}

	public dataChanged(): void {
		this.bg.visible = this.itemIndex % 2 == 0;

		//显示时间		
		if (this.data[3]) {
			this.txt0.text = this.data[0];
		}
		else//显示名次
			this.txt0.text = (this.itemIndex + 1) + "";
		// this.txt0.text = this.data[0];//玩家id
		this.txt1.text = this.data[1];
		this.txt2.text = this.data[2];
	}
}