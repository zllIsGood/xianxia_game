/**
 * 剑灵套装配置
 */
class WeaponSoulSuit {
	public id: number = 0;	  //剑灵id
	public level: number = 0;	 //套装等级
	public attr: {type:number,value:number}[] = [];//属性
	public ex_attr: {type:number,value:number}[] = [];//扩展属性
	public skillname:string = "";//技能名字
	public skillicon:string = "";//技能图标
	public skilldesc:string = "";//技能描述
}
