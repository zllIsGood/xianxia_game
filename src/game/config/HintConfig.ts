/**
 * 提示配置表
 */
class HintConfig {
	public index :number;   //索引
	public type: number;   //提示类型
	public targetType:number;//目标类型
	public target: HintTargetData[]; //目标条件
	public image: string; //提示图片资源
}
