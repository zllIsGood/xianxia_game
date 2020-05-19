

class DailyInviteModel {

    /** 累计完成邀请次数 */
    public inviteTotalCount: number;

    /** 累计邀请已领取奖励序号 */
    public awardTotalCount: number;

    /** 每日邀请完成邀请次数 */
    public dailyFinishCount: number;

    /** 每日邀请已领取奖励次数(序号) */
    public dailyAwardCount: number;

    /** 每日邀请下次领取时间(0 现已可领取) */
    public dailyNextTime: number;

    /** 0未上报, 1已上报 */
    public isReport: number;


    public parserData(bytes: GameByteArray): void {
        this.inviteTotalCount = bytes.readInt();
        this.awardTotalCount = bytes.readInt();
        this.dailyFinishCount = bytes.readShort();
        this.dailyAwardCount = bytes.readInt();
        this.dailyNextTime = bytes.readInt();
        this.isReport = bytes.readByte();
    }

}