/**
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveRechargeItem extends ItemRenderer {
	public item:ItemBase;
	public nameTxt:eui.Label;

	protected dataChanged(): void {

		this.item.isShowName(false);
		this.item.data = this.data;

		let item = GlobalConfig.ItemConfig[this.data.id];
		this.nameTxt.text = item.name;
		this.nameTxt.textColor = ItemConfig.getQualityColor(item);
	}
}
