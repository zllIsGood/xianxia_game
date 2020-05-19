/**
 * Created by Peach.T on 2017/12/18.
 */
class SamsaraComposeSecMenuItem extends BaseItemRender
{
	public head:eui.Label;
	public lv:eui.Label;
	public redPoint:eui.Image;
	public chosen:eui.Image;

	protected dataChanged(): void {
		// let type = this.data["type"];
		// let zsLv = this.data["zsLv"];
		// let desc = SamsaraModel.ins().getComposeDesc(type);
		// this.head.text = desc;
		// this.lv.text = `${zsLv}转装备`;
		// this.redPoint.visible = SamsaraModel.ins().isCanZsLvCompose(type, zsLv);

		// let compose:any = (ViewManager.ins().getView(BagWin) as BagWin).reinComposePanel;
		// if(compose.type == type && compose.zsLv == zsLv){
		// 	this.setSelect(true);
		// }
	}

	public setSelect(isSelect: boolean): void {
		this.chosen.visible = isSelect;
	}
}
