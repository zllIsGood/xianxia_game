class EverTipsItem extends BaseView {
    public bg: eui.Image;
    public lab: eui.Label;

    protected _labelText: string;
    private _type: number;
    private index: number = 0;
    constructor() {
        super();
        this.skinName = "TipsSkin";

        this.lab.stroke = 1;
        this.lab.strokeColor = 0x000000;
        this.bg.source = "zjmqipao";

    }

    public setIndex(value: number): void {
        this.index = value;
    }


    public get labelText(): string {
        return this._labelText;
    }
    public set labelText(value: string) {
        // this.bg.visible = true;
        //this.bg.scale9Grid = new egret.Rectangle(6, 8, 6, 8);
        this.bg.alpha = 1;
        this._labelText = value;
        this.lab.textFlow = TextFlowMaker.generateTextFlow(this._labelText);
        this.bg.width = this.lab.width + 80;

        this.lab.alpha = 1;

        this.bg.y = 0;
        // this.lab.verticalCenter = -1;

        let t1: egret.Tween = egret.Tween.get(this.bg);
        t1.to({ "y": 0 }, 500
        ).wait(500).to({ "alpha": 0 }, 200).call(() => {
            DisplayUtils.removeFromParent(this);
        }, this);
        // let t: egret.Tween = egret.Tween.get(this.lab);
        // t.to({ "verticalCenter": 0 }, 500
        // ).wait(500).to({ "alpha": 0 }, 200);
    }
}