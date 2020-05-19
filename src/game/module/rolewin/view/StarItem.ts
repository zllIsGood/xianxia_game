/**
 *  
 */
class StarItem extends BaseView {
	public fullStarImg: eui.Image;
	public starImg: eui.Image;

	constructor() {
		super();

		this.skinName = "StarItemSkin";

	}

	public isShow(num: number): void {
		this.starImg.source = num ? "common1_p1_json.com_star_gold" : "";
	}

	public isShowFull(num: number): void {
		this.fullStarImg.source = num ? "common1_p1_json.com_star_gray" : "";
	}
}
