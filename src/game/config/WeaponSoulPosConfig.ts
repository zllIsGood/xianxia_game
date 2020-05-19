/**
 * 剑灵部位配置
 */
class WeaponSoulPosConfig {
	public id:number = 0;
	public level:number = 0;
	public costItem:number = 0;
	public costNum:number = 0;
	public showlv:number = 0;
	public assault: number;	//突破等级
	public icon:string;//部位资源
	public name:string;//部位名
	public attr: {type:number,value:number}[];
	public ex_attr: {type:number,value:number}[];
}
