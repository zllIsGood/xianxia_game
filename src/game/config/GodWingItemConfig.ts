/**
 * 神羽道具基础配置表
 */
class GodWingItemConfig {
	public itemId :number;   //道具id
	public showlv:number;
	public level: number;   //等级
	public slot: number;   //部位
	public composeItem: {id:number,count:number};//合成/激活消耗
	public needMoney:number;//价格
	public attr: AttributeData[]; //属性
	public exattr: AttributeData[]; //属性
	public exPower:number;//战力加成
}
