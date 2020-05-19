/**天仙进阶属性 */
class ZhanLingStage {
	public stage:number;//天仙阶数
	public star:number;//天仙星级
	public attr:AttributeData[];//每星属性
	public starexp:number[];//每星经验值
	public tupoattr:AttributeData[];//突破属性
	public tupofubenid:number;//突破副本
	public skillid:number;//技能ID
	public skillattr:AttributeData[];//技能属性
	public skillpower:number;//技能战斗力
	public costItems:number[];//进阶消耗
	public addexp:number;//进阶增加经验值
	public constructor() {
	}
}