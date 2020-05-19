/**
 * Created by hrz on 2017/8/15.
 */

interface RichManBaseConfig {
    dicePrice: number;
    diceNum: number;
    cameraWidth:number;
    cameraHeight:number;
    speed:number;
    diceTime:number;//包括服务器返回后 摇骰子时间和停滞展示时间 各取一半
    openDay:number;
}