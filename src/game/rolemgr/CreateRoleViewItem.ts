/**
 * @author LF
 */
class CreateRoleViewItem extends eui.ItemRenderer {
	public constructor() {
		super();
	}

	private labelInfo: eui.Label;

	public dataChanged() {
		if (this.data == "") {
			this.labelInfo.text = "";
			return;
		}
		let str = "玩家  " + "|C:0x3EADFF&T:" + this.data + "|" + "  正在进入游戏";
		this.labelInfo.textFlow = TextFlowMaker.generateTextFlow1(str);
	}
}