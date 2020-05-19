/**
 * Created by hrz on 2017/7/22.
 */

class LevelImage extends BaseComponent {
    public label: eui.BitmapLabel;

    private _value: number = 1;
    constructor() {
        super();
        this.skinName = `jiejiSkin`;
    }

    getValue() {
        return this._value;
    }

    setValue(val) {
        this._value = Math.max(val, 1);
        let str = TextFlowMaker.numberToChinese(this._value) + "阶";
        this.label.text = str;
    }
}