/**
 * 诛仙基础配置表
 */
class HeirloomEquipConfig {
	public slot :number;   //部位
	public lv: number;   //等级
	public expend:{id:number,count:number};//升级消耗
	public attr: AttributeData[]; //属性
	public icon: number; //图标
	public name:string;//装备名称
	public image:string;//边框
	public model:string;//模型展示
	public skillicon:string;//技能图标
	public skillname:string;//技能名字
	public skilldesc:string;//技能描述
	public attr_add:number;//装备基础属性加强
}
