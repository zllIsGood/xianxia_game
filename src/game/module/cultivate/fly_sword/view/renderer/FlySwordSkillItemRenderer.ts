class FlySwordSkillItemRenderer extends BaseItemRender {
	public iconBg: eui.Image;
	public icon: eui.Image;
	public skillIcon: eui.Image;
	public blackImg: eui.Rect;
	public openTxt: eui.Label;

	public data: FlySwordSkillData;

	public constructor() {
		super();
	}

	protected dataChanged(): void {
		super.dataChanged();
		if (!this.data)
			return;

		let skillData = this.data.getData();
		let isOpen: boolean = this.data.state >= FlySwordSkillType.ReadyOpen;

		this.icon.visible = !isOpen;
		this.blackImg.visible = this.data.state < FlySwordSkillType.Open;
		this.skillIcon.source = isOpen ? skillData.configID + `_png` : ``;
		this.openTxt.text = this.data.state == FlySwordSkillType.Open ? skillData.name : `第${this.data.level}阶开启`
	}

}