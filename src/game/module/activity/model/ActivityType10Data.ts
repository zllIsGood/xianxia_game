/**
 * 类型10活动数据
 * Created by hujinheng 2017/12/6
 */
class ActivityType10Data extends ActivityBaseData {

    public record: number;//当前抽取次数 轮数
    public yb:number;//当前活动期间充值的元宝数
    public index:number;//中奖索引
    public state:number;//是否可领奖 1:可领取 0:不可领/已领
    public count:number;//累计次数
    public noticeArr:{name:string,multiple:number,yb:number}[];

    constructor(bytes: GameByteArray) {
        super(bytes);
        this.update(bytes);
    }

    public update(bytes: GameByteArray): void {
        this.record = bytes.readInt();
        this.yb = bytes.readInt();
        this.index = bytes.readInt();
        this.state = bytes.readByte();
        let len = bytes.readByte();
        this.noticeArr = [];
        for (let i = 0; i < len; i++) {
            this.noticeArr.push({name:bytes.readString(), multiple:bytes.readDouble(),yb:bytes.readInt()})
        }
        this.noticeArr.reverse();
    }

    public canReward(): boolean {
        return this.checkRedPoint();

    }

    public isOpenActivity(): boolean {

        // if( this.timeType == ActivityDataFactory.TimeType_Fixed ){
        //     let aconfig:ActivityConfig = GlobalConfig.ActivityConfig[this.id];
        //     if( aconfig ){
        //         let startTime = (new Date(aconfig.startTime)).getTime();
        //         let endTime = (new Date(aconfig.endTime)).getTime();
        //         if( GameServer.serverTime > startTime && GameServer.serverTime < endTime ){
        //             return true;
        //         }
        //     }
        // }else{
            let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
            let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
            if (beganTime < 0 && endedTime > 0) {
                return true;
            }
        // }
        return false;
    }

    //判断红点
    public checkRedPoint(): boolean {
        return Activity.ins().getType10RedPoint(this.id);
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

    /**获取当前第几轮*/
    public getLevel(){
        let config:ActivityType10Config[] = GlobalConfig.ActivityType10Config[this.id];
        let len = Object.keys(config).length;
        let level = this.record + 1;
        if( this.record >= len )
            level = 0;//满轮

        return level;
    }
    /**充值条件*/
    public getCondition(lv:number){
        let config:ActivityType10Config = GlobalConfig.ActivityType10Config[this.id][lv];
        if( !config )
            return false;
        if( this.yb >= config.recharge ){
            return true;
        }
        return false;
    }
}

