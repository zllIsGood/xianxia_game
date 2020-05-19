/* 引导条件结构体 */
class GuideCondition {
	/**
	 * Start下的状态 1: 接到任务触发 2：点击任务面板出发 3：完成任务触发
	 * Over下的状态 1: 接到任务结束引导
	 */
	public type: number;
	public value: number;
}