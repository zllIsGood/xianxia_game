/**
 * 火焰戒指收费副本的数据
 * Created by Peach.T on 2017/11/7.
 */
class ActivityType8Data extends ActivityBaseData {
    public static TYPE_RING = 1;
    public record: number;

    constructor(bytes: GameByteArray) {
        super(bytes);
        this.update(bytes);
    }

    public update(bytes: GameByteArray): void {
        this.record = bytes.readInt();
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

    //判断红点
    public checkRedPoint(): boolean {
        return Activity.ins().getType8RedPoint(this.id);
    }

    public getRemainTime(): string {
        let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
        let desc: string;
        if (beganTime >= 0) {
            desc = "活动未开启";
        } else if (endedTime <= 0) {
            desc = "活动已结束";
        } else {
            desc = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
        }
        return desc;
    }
}

