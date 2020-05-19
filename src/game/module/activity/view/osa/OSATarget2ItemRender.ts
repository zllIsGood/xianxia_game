/**
 * 
 */
class OSATarget2ItemRender extends BaseItemRender {

    bg: eui.Image
    imgName: eui.Image
    select: eui.Image
    labName: eui.Label

    public constructor() {
        super();
        this.skinName = "OSAItem2skin";
    }

    protected childrenCreated(): void {
        super.childrenCreated();

        this.init();
    }
    public init() {



    }

    protected dataChanged(): void {
        super.dataChanged();
        let data = this.data
        if (!data)
            return;
        this.labName.text = data.giftName
        this.bg.source = data.source[0]
        this.imgName.source = data.source[1]
        
    }

}