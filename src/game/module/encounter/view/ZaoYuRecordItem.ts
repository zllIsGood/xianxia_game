/**
 *
 * @author hepeiye
 *
 */
class ZaoYuRecordItem extends BaseItemRender {
	private resultImg: eui.Image;

	private time: eui.Label;
	private playerName: eui.Label;
	private money: eui.Label;
	private prestige: eui.Label;
	private exp: eui.Label;
	private lingpo: eui.Label;

	constructor() {
		super();

		this.skinName = "ZaoYuRecordInfoSkin";
	}

	public dataChanged(): void {
		let data = this.data;

		this.time.text = DateUtils.getFormatBySecond(DateUtils.formatMiniDateTime(data[0])/1000, 2);
		this.playerName.textFlow = (new egret.HtmlTextParser()).parser(`遭遇玩家：<font color="#3681FC">${data[2]}</font>`);
		this.exp.text = "" + data[3];
		this.money.text = "" + data[4];
		this.prestige.text = "" + data[5];
		this.lingpo.text = data[6] || "0";

		if (data[1]) {
			this.currentState = "win";
		} else {
			this.currentState = "lose";
		}
	}


}