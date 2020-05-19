/**
 * 活动基类的数据
 */

class ActivityBaseData {
	public id: number;
	public startTime: number;
	public endTime: number;
	public type: number;
	public isHide:boolean;
	public timeType:number;
	public activityType:number;//ActivityType
	public pageStyle:number;//页面显示类型(把活动显示到具体的icon页面中去)
	public relyOn:number[];//静态页用于依赖某个活动id组开启
	constructor(bytes: GameByteArray) {
	}

	public update(bytes: GameByteArray): void {

	}

	// 子类必须实现
	public canReward(): boolean {
		return false;
	}

	// 子类必须实现
	public isOpenActivity(): boolean {
		return false;
	}

	get rewardState(): number {
		return 0;
	}
	//特殊活动
	public specialState():boolean{
		return true;
	}
	public getHide():boolean{
		return false;
	}
}

enum ActivityType{
	Normal = 0,//正常活动 包括【 合服活动 开服活动 节日活动 展示页活动(如:龙城争霸)】
	Personal = 1,//个人活动 类型同上
	Nesting = 2,//嵌套活动
}
