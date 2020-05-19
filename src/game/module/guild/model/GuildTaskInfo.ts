class GuildTaskInfo {

	public taskID: number;
	/**任务当前变量 */
	public param: number;
	/**任务状态（0正在进行，1可以领奖，2已经领奖） */
	public state: number;

	public stdTask: GuildTaskConfig;

	public constructor() {
	}
}