class RingGainItem extends BaseItemRender {
    private desc: eui.Label;
    private newData: GainWay;

    constructor() {
        super();
        this.skinName = "RuneGainTipsItemSkin";
    }

    protected dataChanged(): void {
        this.desc.text = this.data[0];
    }

    public get userData(): GainWay {
        return this.data as GainWay;
    }
}


