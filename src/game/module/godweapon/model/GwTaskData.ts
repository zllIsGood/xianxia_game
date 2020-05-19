/**
 * Created by hrz on 2017/11/7.
 */

class GwTaskData {
    static DOING:number = 0; //正在进行的任务
    static DONE:number = 1; //可以完成的任务
    static FINISH:number = 2; //已经完成的任务

    weapon:number;//当前职业神兵任务
    weaponIdx:number; //任务配置weaponIdx
    taskIdx:number; //任务配置taskIdx
    progress:number; //任务进度
    statue:number; //任务状态 0 正在做 1 可以完成 2 已完成

    parser(bytes:GameByteArray){
        this.weaponIdx = bytes.readInt();
        this.weapon = bytes.readInt();
        this.taskIdx = bytes.readInt();
        this.progress = bytes.readInt();
        this.statue = bytes.readInt();
    }
}