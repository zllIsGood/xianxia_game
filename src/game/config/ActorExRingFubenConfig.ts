/**
 * Created by hrz on 2017/11/3.
 */

interface ActorExRingFubenConfig {
    freeCount: number;
    recPrice: {[key:number]:number};
    vipCount: {[key:number]:number};
    vipcost: number;
    item: number;
    reward: RewardData[];
}