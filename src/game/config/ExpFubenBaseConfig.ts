/**
 * Created by hrz on 2017/7/6.
 */

interface ExpFubenBaseConfig {
    /** 开启等级 */
    openLv:number;
    /** 每日免费次数*/
    freeCount:number;
    /** VIP额外次数*/
    vipCount:{[vipLv:number]:number};
    /** 领取经验价格*/
    recPrice:number[];
    /** 每日可扫荡次数*/
    buyCount:number;
    /** VIP额外次数*/
    vipBuyCount:{[vipLv:number]:number};
    /** 扫荡价格*/
    buyPrice:number[];
}