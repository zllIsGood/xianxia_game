/**
 * 提示目标数据结构
 */
class HintTargetData {
	public sceneid:number;//当前场景Id
	public achievementId:number;
	public taskId:number;
	public presceneid:number;//上一个场景Id
	public prefbId:number;//上一个副本Id
	public fbId:number;//当前副本Id
	public guanqiaId:number;//被击杀的bossId所对应关卡
	public isfull:number;//是否判断背包已满
}