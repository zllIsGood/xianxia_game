/**
 * Created by hrz on 2017/8/8.
 */

interface CaiKuangConfig {
    maxOpenKuangCount: number;
    maxKuangCount: number;
    openLevel: number;
    openServerDay: number;
    refreshItemId: number;
    maxRobCount: number;
    quickCost: number;
    refreshCost: number[];
    transPos: {y:number,x:number}[];
    fubenId: number;
    kuangPos: {y:number,x:number,d:number}[];
    maxBeRobCount: number;
    doubleCost:number;
    needItem:{id:number,count:number}
}