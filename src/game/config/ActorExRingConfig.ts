/**
 * 灵戒玩家系统配置
 */
class ActorExRingConfig {
	public id: number = 0;
	public openDay: number = 0;
	public openVip: number = 0;
	public openYb: number = 0;
	public name: string = "";
	public effid: number = 0;
	public explain: string = "";
	public mtCombat: number = 0;
	public needLevel: number = 0;
	public needZs: number = 0;
	public monsterId: number = 0;
	public order: number = 0;
	public icon: string = "";
	public avatarFileName: number = 0;
	public wexplain: string = "";
	public openTask: TaskIdConfig[]; //任务id集合
	public useYb: number = 0;
	public skillGridYb: number = 0;
	public showMonsterLv: number;
}