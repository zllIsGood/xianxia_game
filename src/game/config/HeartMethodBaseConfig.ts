/**
 * 心法基础配置
 */
class HeartMethodBaseConfig {
	public serverDay: number = 0;//开服多久开启
	public zsLv: number = 0;//转生等级限制
	public starMax: number = 0;//心法每阶星数
	public proShowList:{id:number,name:string,filter?:number}[];//心法各属性描述 id属性type name属性名 filter是否过滤不显示 1:过滤 空值:不过滤
}
