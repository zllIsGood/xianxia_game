/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵-主界面怪物选项卡
 */
class DevildomBossTab extends BaseItemRender {
	public itemIcon: eui.Image;
	public selectIcon: eui.Image;
	public redPoint: eui.Image;
	public nameLabel: eui.Label;
	/**状态*/
	public state: eui.Image;

	public constructor() {
		super();

	}


	protected dataChanged(): void {
		if (this.data.id) {
			let devildomSys = DevildomSys.ins();
			this.itemIcon.source = `invasion_boss_head${this.data.id - 1}`;

			this.nameLabel.text = GlobalConfig.DevilBossConfig[this.data.id].bossName;

			this.redPoint.visible = DevildomRedPoint.ins().redPoints[this.data.id];
			this.state.visible = devildomSys.killedState[this.data.id];
		}
	}


}
