/** 活动类型25数据 */
class ActivityType25Data extends ActivityBaseData{

    public score:number;//积分
    public logs:{name:string,serverId:number,index:number}[];
    private _envelopeData:RedEnvelope[];//红包数据 红包id 红包cd
	constructor(bytes: GameByteArray,id:number) {
        super(bytes);
       this.init(bytes,id);

    }
    public init(bytes: GameByteArray,id:number){
        this.score = bytes.readInt();
        let len = bytes.readShort();
        this.logs = [];
        for( let i = 0;i < len;i++ ){
            let index = bytes.readShort();
            let name = bytes.readString();
            let serverId = bytes.readInt();
            this.logs.push({name:name,serverId:serverId,index:index});
        }
        //检测是否放入了检测区
        if( Activity.ins().activityTimers.indexOf(id) == -1 )
            Activity.ins().activityTimers.push(id);
    }

	public update(bytes: GameByteArray): void {
        let eId = bytes.readUnsignedShort();//红包id
        let yb = bytes.readInt();//元宝
        let gold = bytes.readInt();//金币
        let len = bytes.readShort();
        let arr = [];
        let role:Role = SubRoles.ins().getSubRoleByIndex(0);
        arr.push({job:role.job,sex:role.sex,name:Actor.myName,yb:yb,gold:gold});
        for( let i = 0; i < len;i++ ){
            let job = bytes.readShort();
            let sex = bytes.readShort();
            let otherName = bytes.readString();
            let otherYB  = bytes.readInt();
            if( Actor.myName != otherName )
                arr.push({job:job,sex:sex,name:otherName,yb:otherYB,gold:0});
        }
        Activity.ins().postGetRedEnvelope(this.id,eId,yb,gold,arr);//派发红包奖励情况
    }
    public get envelopeData():RedEnvelope[]{
        this._envelopeData = this._envelopeData?this._envelopeData:[];
	    return this._envelopeData;
    }
    public set envelopeData(value:RedEnvelope[]){
	    value.sort(this.sortTimer);
	    this._envelopeData = value;
    }
    //排序
    private sortTimer(a:RedEnvelope,b:RedEnvelope){
        return Algorithm.sortAsc(a.timer,b.timer);
    }
    /**
     * 清理红包数量
     * 每秒秒进入检测清理
     * */
    private static maxEnvelope = 10;
    private envelopeSum = ActivityType25Data.maxEnvelope;//检测最大红包数
    private SecondCount = 0;//跑过的秒数
    public checkClear(){
        if( this.envelopeData.length >= this.envelopeSum ){
            this.SecondCount = 0;
            this.clearEnvelopeData();//清理红包列表
            //至少多余maxEnvelope个红包才做最大增加红包上限数检测 因为可能堆积的红包都没有过期
            if( this.envelopeSum > ActivityType25Data.maxEnvelope ){
                this.envelopeSum = this.envelopeData.length + ActivityType25Data.maxEnvelope;
            }
        }
        //10秒内如果仍然大于最大值就重新赋值 保持红包列表仅保存少于10封红包
        else if( this.SecondCount > 10 && this.envelopeSum > ActivityType25Data.maxEnvelope ){
            this.SecondCount = 0;
            this.envelopeSum = ActivityType25Data.maxEnvelope;
        }
        //1分钟都少于最大红包数就清理红包列表
        else if( this.SecondCount > 60 && this.envelopeData.length < ActivityType25Data.maxEnvelope ){
            this.SecondCount = 0;
            this.clearEnvelopeData();
        }
        this.SecondCount++;
    }
    //清理过期红包
    public clearEnvelopeData(){
        //前面的红包是旧的  后面是新的
        for( let i = 0; i < this.envelopeData.length; ){
            if( !this.envelopeData[i] || this.envelopeData[i].isOverTimer() ){//已过期
                this.envelopeData.splice(i,1);
            }
            i++;
        }
    }
    public clearAll(){
        this.envelopeData = [];
        this.envelopeSum = ActivityType25Data.maxEnvelope;
    }
    //移除红包
    public popEnvelope(eId:number){
        //遍历移除的原因是由于不能保证这个红包是最尾  可能此时有别的红包插入列表尾
        for( let i = 0;i < this.envelopeData.length; ){
            if( !this.envelopeData[i] || this.envelopeData[i].id == eId ){
                this.envelopeData.splice(i,1);//移除领过的红包
                break;
            }
            i++
        }
    }
    public canReward(): boolean {
        return this.checkRedPoint();

    }

    public isOpenActivity(): boolean {
        let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
        if (beganTime < 0 && endedTime > 0)
            return true;

        return false;
    }

    //判断红点
    public checkRedPoint(): boolean {
        let config:ActivityType25Config[] = GlobalConfig.ActivityType25Config[this.id];
        for( let k in config ){
            if( this.score >= config[k].score )
                return true;
        }
        return false;   
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
/**红包数据*/
class RedEnvelope{
    public id:number;//红包id
    public timer:number;//红包结束时间 2010时间戳
    public constructor(){
        this.id = 0;
        this.timer = 0;
    }
    public isOverTimer(){
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.timer) - GameServer.serverTime) / 1000);
        return endedTime <= 0?true:false;
    }
}
/**红包具体数据*/
class EnvelopeData{
    public id:number;//活动id
    public eId:number;//红包id
    public job:number//战法道123
    public sex:number;//男女01
    public index:number;//活动序号
    public serverId:number;//服务器id
    public name:string;//名字
    public desc:string;//祝福语
    public constructor(){
        this.id = 0;
        this.eId = 0;
        this.job = 0;
        this.sex = 0;
        this.index = 0;
        this.serverId = 0;
        this.name = "";
        this.desc = "";
    }
}
/**25-2协议类型*/
enum EnvelopeType{
    SEND = 1,//发红包(25-2发送参数: 活动id, 活动序号index, EnvelopeType.SEND, 祝福语? )
    GET  = 2,//领红包(25-2发送参数: 活动id, 红包id, EnvelopeType.GET )
}
