class WildPlayerData {
	//是否具有侵略性
	public attackEnable: boolean;
	//假人的行为类型 1--闯关  0--挂机
	public actionType: number;
	public backCount: number;
	public index: number;
	//杀怪数量
	public killNum: number;
	//返回时的x坐标
	public backX: number;
	//返回时的y坐标
	public backY: number;
	//野外玩家灵戒数据
	public fireRing:OtherFireRingData;
}