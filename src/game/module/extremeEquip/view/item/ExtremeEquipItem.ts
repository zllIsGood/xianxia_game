/**
 * Created by Peach.T on 2018/1/5.
 */
class ExtremeEquipItem extends ItemRenderer{

	public itemIcon:eui.Image;
	public selectIcon:eui.Image;
	public redPoint:eui.Group;
	public nameLabel:eui.Label;

	protected dataChanged(): void {
		// if (!this.data || Object.keys(this.data).length <= 0 || this.data["null"] != null) return;
		if (typeof(this.data) != "number") return;
		let subType = this.data;
		this.redPoint.visible = ExtremeEquipModel.ins().canOperate(ExtremeEquipModel.ins().selectJob, subType);
		let zhiZunLv = ExtremeEquipModel.ins().getZhiZunLv(ExtremeEquipModel.ins().selectJob, subType);
		let desc;
		if(zhiZunLv <= 0){
			desc = ExtremeEquipModel.ins().descNames[subType];//"未激活";
		}
		else
		{
			desc = ExtremeEquipModel.ins().descNames[subType];
		}
		this.nameLabel.text = desc;
		this.selectIcon.visible = this.selected;
		this.itemIcon.source = `icon_extreme_0${subType}`;
	}

	public setSelect(isSelect: boolean): void{
		this.selectIcon.visible = isSelect;
	}
}
