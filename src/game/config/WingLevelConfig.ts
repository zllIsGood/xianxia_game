/**
 * 翅膀等级配置
 */
class WingLevelConfig {
	public level: number;		   //等级
	public name: string;			//翅膀名字
	public normalCost: number;	  //普通培养的消耗
	public normalCostTip: number;   //普通培养的提示
	public itemId: number;		  //高级培养道具id
	public itemNum: number;		 //高级培养消耗道具数量
	public itemPrice: number;	   //道具的价格
	public attr: AttributeData[];   //属性
	public appearance: string;	  //外观
	public exp: number = 0;
	public pasSkillId: number = 0; //翅膀技能ID
	public clearTime: number;  //清除祝福值的倒计时
	public attrPill:number; //资质丹最大使用个数
	public flyPill:number; //飞升丹最大使用个数
}
