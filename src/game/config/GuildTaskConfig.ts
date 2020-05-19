class GuildTaskConfig {

	public id: number;
	public type: number;
	/**只对捐献任务有效 31 32 33 */
	public conID:number;
	public target: number;
	/**只对捐献任务有效 31元宝数 32金币数 33 道具id*/
	public param:number
	public name: string;
	public desc: string;
	public controlTarget:number[];
	public constructor() {
	}
}