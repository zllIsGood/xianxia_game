/**
 * Created by Peach.T on 2017/11/20.
 */
class GodweaponItem extends BaseItemRender {

	public frame: eui.Image;
	public shengwuImg: eui.Image;
	public shengwuName: eui.Label;
	public count: eui.Label;
	public imgJob: eui.Image;

	protected dataChanged(): void {
		let item = GlobalConfig.ItemConfig[this.data.id];
		this.shengwuImg.source = `${item.icon}_png`;
		this.shengwuName.text = item.name;
		this.shengwuName.textColor = ItemConfig.getQualityColor(item);
		this.frame.source = `godweapon_quality${ItemConfig.getQuality(item) + 1}`;
		this.imgJob.source = `common1_profession${ItemConfig.getJob(item)}`;
		if (this.data.count) {
			this.count.text = this.data.count;
		}
		else {
			this.count.text = "";
		}

	}
}
