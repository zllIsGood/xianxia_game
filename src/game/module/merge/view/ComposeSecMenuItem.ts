/**
 * Created by hrz on 2018/1/22.
 */

class ComposeSecMenuItem extends BaseItemRender
{
    public lv:eui.Label;
    public redPoint:eui.Image;
    public chosen:eui.Image;

    protected dataChanged(): void {
        let data:MergeConfig = this.data;
        this.lv.text = `${data.btn_name}`;
        this.redPoint.visible = MergeCC.ins().isCanMergeByIndex(data.id, data.index);

        let compose: ComposePanel = (ViewManager.ins().getView(BagWin) as BagWin).reinComposePanel;
        if(compose.id == data.id && compose.index == data.index){
            this.setSelect(true);
        }
    }

    public setSelect(isSelect: boolean): void {
        this.chosen.visible = isSelect;
    }
}
