/**
 *
 * @author cxq
 *
 */
class ArtifactSuiItemRenderer extends BaseItemRender {
	public itemImg: eui.Image;
	public labelMaterial: eui.Label;
	public closeImg: eui.Image;
	public mc: MovieClip;
	public groupMc: eui.Group;

	constructor() {
		super();
		this.skinName = "shenqiItemskin";
	}

	public dataChanged(): void {
		if (this.data["name"] == "") {
			this.itemImg.visible = false;
			this.labelMaterial.visible = false;
			this.closeImg.visible = true;
		}
		else {
			if (this.data["state"]) {
				this.labelMaterial.textColor = 0x35e62d;

			} else {
				this.labelMaterial.textColor = 0xbdbdbd;
			}
			if (this.data[`state2`]) {
				if (!this.mc) {
					this.mc = new MovieClip();
					this.mc.x = 0;
					this.mc.y = 0;
					this.mc.scaleX = 1.2;
					this.mc.scaleY = 1;
				}
				this.groupMc.addChild(this.mc);
				this.mc.playFile(RES_DIR_EFF + `chargeff1`, -1);
			} else {
				if (this.mc) {
					DisplayUtils.removeFromParent(this.mc);
				}
			}
			this.itemImg.visible = true;
			this.labelMaterial.visible = true;
			this.closeImg.visible = false;
			this.itemImg.source = this.data["img"];
			this.labelMaterial.textFlow = (new egret.HtmlTextParser).parser("<u>" + this.data["name"] + "</u>");
		}
	}
}