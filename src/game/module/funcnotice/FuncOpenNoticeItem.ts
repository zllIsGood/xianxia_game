/*
    file: src/game/module/funcnotice/FuncOpenNoticeItem.ts
    date: 2018-9-19
    author: solace
    descript: 功能唤醒界面选择项
*/
class FuncOpenNoticeItem extends BaseItemRender {

	private icon: eui.Image;
	private select: eui.Image;
	private Mask: eui.Rect;
	private checked: eui.Image;
	private reveive: eui.Image;
	private redPoint: eui.Image;
	private des: eui.Label;


	constructor() {
		super();
		this.skinName = "FuncNoticeItemSkin";

	}

	public dataChanged(): void {
		// console.log(this.data);
		
		this.icon.source = this.data.config.icon;
		this.des.text = this.data.config.openShortDes;
		this.Mask.visible = this.data.state==0;
		this.checked.visible = this.data.state==2;
		this.reveive.visible = this.data.state==1;
		this.redPoint.visible = this.data.state==1;

	}

	public setSelect(isSelect: boolean): void {
		this.select.visible = isSelect;
	}
}