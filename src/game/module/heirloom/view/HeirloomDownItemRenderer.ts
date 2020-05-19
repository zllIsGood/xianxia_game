/**
 * 诛仙list列表单控件
 * 皮肤:HeirloomDownItem
 * */
class HeirloomDownItemRenderer extends BaseItemRender {

	private itemicon: HeirloomItem;

	private tip: eui.Label;
	private desc: eui.Label;
	private equipName: eui.Label;

	// private breakDown: eui.Button;//外部调用

	public configID;

	constructor() {
		super();
		this.configID = 0;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public dataChanged(): void {
		let itemConfig: ItemConfig = this.data.itemConfig;
		//根据道具id获取部位
		let hConfig:HeirloomEquipItemConfig[] = GlobalConfig.HeirloomEquipItemConfig;
		for( let i in hConfig ){
			if( hConfig[i].item == itemConfig.id ){
				let pos:number = hConfig[i].pos;
				let info:HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[pos][1];//分解的时候只有可能分解1级
				this.itemicon.data = {pos:pos,info:info};
				this.itemicon.cleanEff();//不显示特效
				let costConfig:ItemConfig = GlobalConfig.ItemConfig[hConfig[i].downitem.id];
				let nameLabel:string = costConfig.name?costConfig.name:"诛仙宝钻";
				this.desc.text = nameLabel+" x"+hConfig[i].downitem.count;
				break;
			}
		}
		//是否显示推荐
		this.tip.visible = this.data.isSuggest;

		this.equipName.text = itemConfig.name;
		this.equipName.textColor = ItemConfig.getQualityColor(itemConfig);

	}

}