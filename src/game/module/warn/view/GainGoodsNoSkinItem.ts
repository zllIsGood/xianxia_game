/**
 * Created by hrz on 2017/6/20.
 */

class GainGoodsNoSkinItem extends BaseItemRender{
    private desc: eui.Label;
    constructor() {
        super();
    }

    protected dataChanged(): void {
        this.desc.text = this.data[0];
    }

    public get userData():GainWay
    {
        return this.data as GainWay;
    }
}