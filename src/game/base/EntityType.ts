enum EntityType {
	Actor = 0,
	Role,
	Monster,
	/** 服务器npc类型*/
	Snpc,
	/** 天梯对象 */
	LadderPlayer,
	/**采集怪 */
	CollectionMonst = 5,
	/** 掉落物 */
	DropItem,
	/**幻兽怪 */
	HuanShouMonster = 8,

	/** 客户端假人npc*/
	Npc = 100,
	/** 传送*/
	Transfer,
	/** 矿工*/
	Mine
}