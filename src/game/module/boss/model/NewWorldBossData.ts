/**
 * Created by hrz on 2017/9/13.
 */

class NewWorldBossData {
    isOpen:boolean;//是否开启进入boss入口
    startTime:number;//开始时间(时间戳)
    // reliveCD:number;//复活cd(reliveCD - egret.getTime() = 剩余时间)
    bossID:number;//bossId 未进入boss场景用到
    curHp:number;//当前血量
    isKill:boolean;//是否击杀boss
    rank:number;//伤害排名
    addAttrNum:number = 0;//鼓舞次数

    rankList:NewWorldBossRankData[];//积分排行

    totalTime:number;//副本使用时间

    lastKillRoleName:string;//最后一击的玩家
    randomRoleName:string;//随机抽奖获得者
    randomAwards:RewardData[];
}

class NewWorldBossRankData extends WorldBossRankItemData {
    id:number;//角色id
    roleName:string; //角色名字
    value:number; //积分
}