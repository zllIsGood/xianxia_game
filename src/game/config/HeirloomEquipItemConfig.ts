/**
 * 诛仙合成配置表
 */
class HeirloomEquipItemConfig {
	public pos : number;//对应部位
	public item :number;   //合成道具
	public expend: {id:number,count:number};//消耗道具/数量
	public downitem: {id:number,count:number};//分解道具/数量
}
