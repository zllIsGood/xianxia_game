class KFDropRecordData {
	public time: number;
	public roleId: number;
	public servId: number;
	public nick: string;
	public sceneName: string;
	public bossName: string;
	public goodsId: number;

	public guildName: string;

	/**掉落类型*/
	public type: KFDropType;
	/**极品置顶装备*/
	public isBest: boolean;

	constructor(bytes: GameByteArray) {
		this.type = bytes.readShort();
		if (this.type == KFDropType.KF_BOSS) {
			this.kfBossData(bytes);
		}
		else if (this.type == KFDropType.DEVILDOM) {
			this.devildomData(bytes);
		}
	}

	/*跨服boss数据*/
	private kfBossData(bytes: GameByteArray): void {
		this.time = bytes.readInt();
		this.roleId = bytes.readInt();
		this.servId = bytes.readInt();
		this.nick = bytes.readString();
		this.sceneName = bytes.readString();
		this.bossName = bytes.readString();
		this.goodsId = bytes.readInt();

		//转换时间
		this.time = Math.floor(DateUtils.formatMiniDateTime(this.time) / DateUtils.MS_PER_SECOND);
	}

	/*魔界入侵数据*/
	private devildomData(bytes: GameByteArray): void {
		this.time = bytes.readInt();
		this.servId = bytes.readInt();
		this.guildName = bytes.readString();
		this.bossName = bytes.readString();
		//拍卖ID
		this.goodsId = bytes.readInt();
		//转换时间
		this.time = Math.floor(DateUtils.formatMiniDateTime(this.time) / DateUtils.MS_PER_SECOND);
	}

}

enum  KFDropType{
	/**跨服boss*/
	KF_BOSS = 1,
		/**魔界入侵*/
	DEVILDOM = 2
}