/**
 * 类型25活动
 */
class ActivityType25Config {
    public id: number;
    public index: number;
    public score: number;//需要积分
    public isCross: number;//是否跨服红包
    public exitTime: number;//是否跨服红包
    public info: {multiple:number,value:number}[];
    public showType: number;//子类型
    public skinType: string;//皮肤红包控件状态
    public record: string;//发红包语
    public blessWord:string;//默认祝福语
    public wordCount:number;//字数限制
}
