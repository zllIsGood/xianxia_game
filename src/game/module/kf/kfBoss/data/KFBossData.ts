class KFBossData {
	public constructor() {
	}
}

class KFBossInfoData {
	public dpId: number;
	public serverId: number;
	public bossRefTimer: number;
	public flagRefTimer: number;

	public constructor(bytes: GameByteArray) {
		this.dpId = bytes.readShort();
		this.serverId = bytes.readInt();
		this.bossRefTimer = bytes.readInt() * 1000 + egret.getTimer();//boss刷新时间
		this.flagRefTimer = bytes.readInt() * 1000 + egret.getTimer();//旗帜刷新时间
		//苍月岛不刷新
		if (this.dpId == 8) this.flagRefTimer = Number.MAX_VALUE + egret.getTimer();//旗帜刷新时间
	}
}
