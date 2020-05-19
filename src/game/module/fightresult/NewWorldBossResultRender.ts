/**
 * Created by hrz on 2017/10/16.
 */

class NewWorldBossResultRender extends BaseItemRender {
    private nameTxt:eui.Label;
    private valueTxt:eui.Label;
    private paihang:eui.Image;
    constructor(){
        super();
    }

    dataChanged(){
        let data = this.data;
        this.nameTxt.text = data.roleName;
        this.valueTxt.text = Math.floor(data.value)+"";
        this.paihang.source = `common1_no${data.rank}`
    }
}