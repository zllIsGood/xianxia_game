interface CrossBossBase {
	belongMaxCount: number;//BOSS无归属10秒后回满血
	openDay: number;//开服天数
	flagBelongMaxCount: number;//
	flagId: number;//旗帜id
	needTime: number;
	bossBelongCount: number;
	rebornCost: number;//复活元宝
	flagRefreshTime: number;
	rebornCd: number;//复活cd
	cdTime: number;//进入cd(s)
	flagBelongCount: number;//累计最大采旗次数
	bossBelongMaxCount: number;//累计最大可获得boss归属者次数
	showBoss:string;//boss形象展示
	limitZsLv:number;//转生等级限制
	bestDrops:number[];//极品掉落组

}