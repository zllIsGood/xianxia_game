/**
 * 属性描述控件
 * */
class EquipTipsItemBase extends BaseItemRender {
	private attrType:eui.Label;
	private attrName:eui.Label;
	private attrValue:eui.Label;
	private desc1:eui.Group;//天仙套装特殊描述
	private suit:eui.Label;
	constructor() {
		super();
		this.skinName = "UsualEquipTipsItemSkin";
	}

	public dataChanged(): void {
		if( !this.data )return;
		let title:string = this.data.title;
		let colorName = this.data.colorName;
		let colorValue = this.data.colorValue;
		let attrs:AttributeData[] = this.data.attributeData;
		let others:{suitdesc:string,exdesc:string} = this.data.others;
		let attrName = "";
		let attrValue = "";
		if( !others || !others.suitdesc ){
			DisplayUtils.removeFromParent(this.desc1);
		}
		for( let i = 0;i < attrs.length;i++ ){
			attrName += AttributeData.getAttrStrByType(attrs[i].type) + ": \n";
			if( attrs[i].type == AttributeType.atMaxHp ||
				attrs[i].type == AttributeType.atAttack ||
				attrs[i].type == AttributeType.atDef ||
				attrs[i].type == AttributeType.atRes
			){
				attrValue += attrs[i].value;
			}
			else{
				attrValue += attrs[i].value/100 + "%";
			}
			attrValue +="\n";
		}
		if( attrName ){
			let index:number = attrName.lastIndexOf("\n");
			attrName = attrName.substring(0,index);
		}
		if( attrValue ){
			let index:number = attrValue.lastIndexOf("\n");
			attrValue = attrValue.substring(0,index);
		}
		if( others && others.exdesc ){
			let str = others.exdesc.split("+");
			attrName += "\n" + str[0] + ":";
			attrValue += "\n" + str[1];
		}
		this.attrType.textFlow = TextFlowMaker.generateTextFlow1(title);

		this.attrName.textFlow = TextFlowMaker.generateTextFlow1(colorName?`|C:${colorName}&T:${attrName}`:`${attrName}`);
		this.attrValue.textFlow = TextFlowMaker.generateTextFlow1(colorValue?`|C:${colorValue}&T:${attrValue}`:`${attrValue}`);
		if( this.desc1 && this.desc1.parent ){
			this.suit.textFlow = TextFlowMaker.generateTextFlow1(others.suitdesc);
		}
	}



}