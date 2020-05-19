/**
 * 关卡地图项
 */
class GuanQiaMapItem extends BaseComponent {
	public nameTxt: eui.Label;
	public boxGroup: eui.Group;
	public box: eui.Image;
	public redPointBox: eui.Image;
	public barGroup: eui.Group;
	public barBg: eui.Image;
	public bar: eui.ProgressBar;
	public levelLabel: eui.Label;

	public constructor() {
		super();
		this.skinName = "CheckItemSkin";
	}
}