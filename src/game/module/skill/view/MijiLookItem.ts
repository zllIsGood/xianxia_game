class MijiLookItem extends BaseItemRender {

	// private item:MijiItem;
	private name1:eui.Label;
	private attrDesc:eui.Label;
	constructor() {
		super();
		this.skinName = "MijiOverViewItemSkin";
	}

	protected dataChanged(): void {
		if( !this.data )return;
		if( typeof this.data == "string" ){
			this.currentState = "title";
			if( this.data == "middle" ){
				this.name1.text = "中级秘术";
			}else{
				this.name1.text = "高级秘术";
			}
		}
		// else if( this.data instanceof MiJiSkillConfig ){
		else if( typeof this.data == "object" && this.data.length ){
			this.currentState = "miji";
			let len = 5;//this.data.length;
			for( let i = 0;i < len;i++ ){
				let config:MiJiSkillConfig = this.data[i];
				if( this[`item${i}`] && config){
					this[`item${i}`].visible = true;
					this[`item${i}`].data = config.id;
					let itemcfg:ItemConfig = GlobalConfig.ItemConfig[config.item];
					this.name1.text = itemcfg.name;
					// this.attrDesc.text = itemcfg.desc;
				}else{
					this[`item${i}`].visible = false;
				}
			}

		}
	}


}
