
/**
 * Created by MPeter on 2017/12/10.
 * 跨服副本-无极战场-接收公告信息Item
 */
class WJBattleChatItem extends BaseItemRender {
	private msg: eui.Label;
	public constructor() {
		super();
	}
	protected dataChanged(): void {
	    this.msg.text = this.data;
	}
}