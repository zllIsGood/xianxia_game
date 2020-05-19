/**
 * Created by hrz on 2017/9/5.
 */

class VipGiftBtnRender extends BaseItemRender {
    public selectIcon: eui.Image;
    public iconDisplay: eui.Image;
    public item: eui.Image;
    public redPoint: eui.Group;
    public mc: MovieClip;
    private viptxt: eui.BitmapLabel;

    constructor() {
        super();
        this.skinName = "VipGiftBtnSkin";
    }

    protected dataChanged(): void {
        let data: VipGiftConfig = this.data as VipGiftConfig;
        this.item.source = data.img;
        this.viptxt.text = UserVip.formatBmpLv(data.vipLv);
        let isShowEff: boolean = UserVip.ins().getVipGiftRedPoint(data.id);

        if (isShowEff) {
            if (!this.mc) {
                this.mc = new MovieClip();
                this.mc.x = this.width / 2 + 2;
                this.mc.y = this.height / 2 + 11;
                this.mc.scaleX = 1.12;
                this.mc.scaleY = 1.12;
            }
            this.mc.playFile(RES_DIR_EFF + "actIconCircle", -1);
            this.addChildAt(this.mc, 4);
        } else {
            DisplayUtils.removeFromParent(this.mc);
            this.mc = null;
        }
        this.redPoint.visible = isShowEff;
    }
}