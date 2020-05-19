/**
 *翅膀装备itemrender 
 */
class WingEquipItemrender extends BaseItemRender {
	public item0: ItemIcon;
	public equipName: eui.Label;
	public equipXuqiu: eui.Label;
	public score: eui.Label;

	private itemConfig: ItemConfig;
	private role: Role;

	public constructor() {
		super();
		this.skinName = "WingEquipItemSkin";

		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public dataChanged(): void {
		let model: Object[] = this.data;
		let curRole: number = <number>model["curRole"];
		let itemData: ItemData = <ItemData>model["data"];
		this.role = SubRoles.ins().getSubRoleByIndex(curRole);
		this.itemConfig = itemData.itemConfig;
		this.item0.setData(itemData.itemConfig);
		this.equipXuqiu.text = `需求：羽翼达到${this.itemConfig.level + 1}阶`;
		this.equipXuqiu.textColor = 0xf3311e;
		this.equipName.text = itemData.itemConfig.name;
		this.score.text = `评分：${itemData.point}`;
	}

	public descut():void{
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	private onClick():void{
		this.openEquipsTips();
	}

	private openEquipsTips(): void {
		ViewManager.ins().open(EquipDetailedWin, 1, this.data.data.handle, this.itemConfig.id, this.data.data, this.role);
	}

}