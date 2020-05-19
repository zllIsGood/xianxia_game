/**
 * 装备tips控件
 * */
class EquipTipsBase extends BaseEuiView {
	private itemIcon:ItemIcon;
	private nameLabel:eui.Label;
	private score:eui.Label;
	private typeValue:eui.Label;
	private typeName:eui.Label;
	private powerPanel:PowerPanel;
	private changeBtn:eui.Button;
	private content:eui.Group;
	private quali:eui.Image;

	private itemType:number;//道具类型UserBag.BAG_TYPE_OTHTER 道具类型UserBag.BAG_TYPE_EQUIP
	private id:number;//装备id
	private sco:number;//评分
	private power:number;//战力
	private title:string;//属性标题
	private attrs:EquipAttrsTips[];
	private desc:{left:string,right:string};
	private func:Function;
	private colorName:number;
	private colorValue:number;
	constructor() {
		super();
		this.skinName = "UsualEquipTipsSkin";

	}
	private otherClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
	public close(...param: any[]): void {
		if( this.func )
			this.removeEventListener(egret.TouchEvent.TOUCH_END, this.func, this);
	}
	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.itemType = param[0];//道具类型
		this.id = param[1];//道具id
		this.sco = param[2];//评分
		this.power = param[3];//战力
		this.desc = param[4];//道具框右边的描述
		this.attrs = param[5];//描述头 属性集
		this.func = param[6];//按钮函数
		if( this.func ){
			this.addEventListener(egret.TouchEvent.TOUCH_END, this.func, this);
		}else{
			this.setHideButton();
		}
		let itemConfig = GlobalConfig.ItemConfig[this.id];
		this.itemIcon.setData(itemConfig);
		let q = ItemConfig.getQuality(itemConfig);
		this.quali.source = q > 0 ? `quali${q}` : "";
		this.nameLabel.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ItemConfig.getQualityColor(itemConfig)}&T:${itemConfig.name}`);
		this.score.text = `评分：${this.sco}`;
		this.typeName.textFlow = TextFlowMaker.generateTextFlow1(this.desc.left);
		this.typeValue.textFlow = TextFlowMaker.generateTextFlow1(this.desc.right);
		this.powerPanel.setPower(this.power);
		for( let i = 0; i < this.attrs.length;i++ ){
			let equip:EquipTipsItemBase = new EquipTipsItemBase();
			equip.data = {title:this.attrs[i].title,attributeData:this.attrs[i].attr,colorName:this.attrs[i].colorName,colorValue:this.attrs[i].colorValue,others:this.attrs[i].others};
			this.content.addChild(equip);
		}

	}
	public setHideButton(){
		this.changeBtn.visible = false;
	}
}
interface EquipAttrsTips{
	title: string;
	attr: AttributeData[];
	colorName?:number;
	colorValue?:number;
	others?:{suitdesc?:string,exdesc?:string};
}
ViewManager.ins().reg(EquipTipsBase, LayerManager.UI_Popup);