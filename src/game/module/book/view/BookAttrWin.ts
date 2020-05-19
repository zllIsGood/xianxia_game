/**
 *
 * @author
 *
 */
class BookAttrWin extends BaseEuiView {
    public attrs:eui.Label;
    public bgClose:eui.Rect;
    private pown: eui.BitmapLabel;
    constructor() {
		super();
		this.skinName = "tujianzonshuxin";
		this.isTopLevel = true;

        this.pown = BitmapNumber.ins().createNumPic(0, '8', 8);
		this.pown.x = 56+169;
		this.pown.y = 199+98+15;
		this.addChild(this.pown);
	}

    public open(...param: any[]): void {
        this.update();
        this.addTouchEvent(this.bgClose,this.onTop)
    }

    public close(...param: any[]): void {

    }
    private onTop():void
    {
        ViewManager.ins().close(BookAttrWin);
    }

    private update():void
    {
        //这个界面没用上
        let str: string = "";
        // let attrs:AttributeData[] = Book.ins().attrs;
        // str = AttributeData.getAttStr(attrs);
        // this.attrs.text = str;
        // let fight:number = UserBag.getAttrPower(attrs);
        // BitmapNumber.ins().changeNum(this.pown,fight,'8');
    }

}
ViewManager.ins().reg(BookAttrWin, LayerManager.UI_Main);