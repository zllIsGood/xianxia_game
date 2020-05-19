/**
 * 翅膀条件配置
 */
class WingCommonConfig {
	// public openLevel: number;		   //开启等级
	// public starPerLevel: number;		//每级上限星数
	public lvMax: number;			   //等级上限
	// public starMax: number;			 //星级上限
	public levelItemid: number;		  //羽翼直升丹道具
	public levelItemidStage: number;	 //直升丹使用阶上限
	public levelExpChange: number;	   //超过阶数转换经验数量
	public tempattr:number;
	public openDay:number;				//神羽开服天数开启
	public attrPillId:number; //资质丹ID
	public attrPill:AttributeData[]; //资质丹增加属性
	public flyPillId:number; //飞升丹ID
	public flyPill:number; //飞升丹提升万分比
	public flyPillAttr:AttributeData[]; //飞升丹增加属性
}
