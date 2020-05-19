
/**
 * Created by MPeter on 2017/12/10.
 * 跨服副本-无极战场-发送公告信息Item
 */
class WJBattleNoticeItem extends BaseItemRender {
	private txtLabel:eui.Label;
	public constructor() {
		super();
	}
	protected dataChanged(): void {
        this.txtLabel.text = this.data;
	}
}