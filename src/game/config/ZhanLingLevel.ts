/**天仙等级属性 */
class ZhanLingLevel {
	public id:number;//皮肤编号
	public level:number;//天仙等级
	public exp:number;//升级需要经验
	public count:number;//单次消耗进阶丹
	public attrs:AttributeData[];//属性
	public talentLevel:number;//天赋等级
	public maxCount:number;//提升道具最大个数
	public expower:number;//天仙额外战力(皮肤编号为0的用)
	public appearance:string;//天仙外观
	public innerAppearance:string;//天仙内观
	public zlName:string;//天仙名字资源图
	public stageDesc:string;//阶级数
	public activeLv:number;//是否需要弹出激活页面
	public zlNameLabel:string;//天仙名字
}