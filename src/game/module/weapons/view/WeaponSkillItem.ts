/**
 * 剑灵技能框控件
 *
 */
class WeaponSkillItem extends BaseItemRender {
	private iconBg:eui.Image;
	private skillIcon:eui.Image;
	private blackImg:eui.Rect;
	constructor() {
		super();
		this.skinName = 'weaponSkillItemSkin';

	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	protected dataChanged(): void {
		if( !this.data )return;
		this.skillIcon.source = this.data.icon + "_png";
	}
	public destruct(): void {

	}
	protected clear(): void {

	}
}