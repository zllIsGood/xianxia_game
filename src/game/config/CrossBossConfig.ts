interface CrossBossConfig {
	id: number;
	bossId: number;
	fbid: number;
	levelLimit: number[];//等级限制{10,100}
	refreshNoticeId: number;
	refreshTime: number;//刷新时间(s)
	belongRewardshow: { [day: number]: RewardData[] };//归属者奖励展示
	sceneName: string;
	statuePos: XY;
}