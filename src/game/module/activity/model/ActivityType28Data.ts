/**
 * 类型28活动数据
 */
class ActivityType28Data extends ActivityBaseData {

    constructor(bytes: GameByteArray) {
        super(bytes);

    }
    public update(bytes: GameByteArray): void {

    }

    public canReward(): boolean {
        return this.checkRedPoint();
    }
    
    public isOpenActivity(): boolean {
        let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
        if (beganTime < 0 && endedTime > 0) {
            return true;
        }
        return false;
    }

    public getleftTime(){
        if( !this.isOpenActivity() ){
            return 0;
        }
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
        return endedTime;
    }

    //判断红点
    public checkRedPoint(): boolean {
        return false;
    }


}

