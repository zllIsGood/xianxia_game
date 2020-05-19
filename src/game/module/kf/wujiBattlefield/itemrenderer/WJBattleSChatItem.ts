
/**
 * Created by MPeter on 2017/12/10.
 * 跨服副本-无极战场-发送公告信息Item
 */
class WJBattleSChatItem extends BaseItemRender {
	public bg: eui.Image;
	private msg: eui.Label;
	public constructor() {
		super();
		this.touchChildren = false;
	}
	protected dataChanged(): void {
		this.msg.text = this.data;
	}
}