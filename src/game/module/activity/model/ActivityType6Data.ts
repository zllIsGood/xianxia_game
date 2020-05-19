/**
 * 活动6类的数据
 */

class ActivityType6Data extends ActivityBaseData {
	public record: number;
	public rewardsBossSum:number[] = [];//二进制标记位

	constructor(bytes: GameByteArray) {
		super(bytes);
		this.initBuyData(bytes);
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		let id: number = bytes.readShort();
		this.record = bytes.readInt();
	}

	public initBuyData(bytes: GameByteArray){
		this.record = bytes.readInt();
		let len = bytes.readShort();
		for (let i: number = 1; i <= len; i++)//每一个boss领取记录
			this.rewardsBossSum[i] = bytes.readShort();

	}

	public canReward(): boolean {
		return this.checkRedPoint();
		// // return this.isOpenActivity() && Activity.ins().getisCanBuyXianGou(this.id + "");
		// //是否首冲
		// let rch:RechargeData = Recharge.ins().getRechargeData(0);
		// if( !rch.num ){
		// 	return false;
		// }
		// //其中一个礼包达到可领取条件
		// let activityData: ActivityType2Data = Activity.ins().getActivityDataById(this.id) as ActivityType2Data;
		// let config:ActivityType2Config[] = GlobalConfig.ActivityType6Config[this.id];
		// for( let i = 0; i < config.length;i++ ){
		// 	let cfd:ActivityType2Config = config[i];
		// 	if (activityData.sumRMB >= cfd.needRecharge && Actor.yb >= cfd.price) {
		// 		return true;
		// 	}
		// }

		// return false;
	}
	//获取boss击杀组
	public getBossGroup(bossRecord:number,config:ActivityType6Config){
		let bossIndex:number[] = this.getBossGroupIndex(bossRecord,config);
		for( let i=0;i<bossIndex.length;i++ ){
			if( !bossIndex[i] )
				return Activity.NOKILL;//每组boss只要有一个没完成就是退出
		}

		return Activity.KILL;//全部完成则是击杀组完成
	}
	//获取每组boss具体击杀情况
	public getBossGroupIndex(bossRecord:number,config:ActivityType6Config):number[]{
		let bossIndex:number[] = [];
		let tmpRecord:number = bossRecord << 1;//和奖励统一 从第一位开始算
		for( let i=1;i<=3;i++ ){
			let record = Math.floor(tmpRecord / Math.pow(2,i)) % 2;
			bossIndex.push(record);
		}
		return bossIndex;
	}
	//获取boss击杀后是否可领取
	public getBossGroupGiftIndex(config:ActivityType6Config){
		let record = Math.floor(this.record / Math.pow(2, (config.index))) % 2;
		return record ? Activity.Geted : Activity.CanGet;
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
	public checkRedPoint():boolean{
		let config: ActivityType6Config[] = GlobalConfig.ActivityType6Config[this.id];
		let i:number =1;
		for( let k in config ) {//所有击杀奖励
			let record = this.getBossGroupGiftIndex(config[k]);//判断奖励数据 1:可领取 2:已领取
			//0:未击杀 1:已击杀
			let bossRecord:number =this.getBossGroup(this.rewardsBossSum[i],config[k]);
			if( bossRecord == Activity.KILL && record == Activity.CanGet){//已击杀 + 可领取 = 可领取
				return true;
			}
			i++
		}

		return false;
	}

	//是否显示活动图标
	public getHide():boolean{
		if( this.isHide )
			return this.isHide;
		let rec:number = this.record >> 1;
		let tmplist: ActivityType6Config[] = GlobalConfig.ActivityType6Config[this.id];
		let tlist:string[] = Object.keys(tmplist);
		if( rec >= Math.pow(2, tlist.length)-1 ){
			this.isHide = true;
			return this.isHide;
			// let aWin:ActivityWin = ViewManager.ins().getView(ActivityWin) as ActivityWin;
			// for( let i=0;i<aWin.activityPanelList.length;i++ ){
			// 	if( aWin.activityPanelList[i].activityID == this.id ){
			// 		aWin.viewStack.removeChild(aWin.activityPanelList[i]);
			// 		aWin.activityPanelList.slice(i,1);
			// 		this.isHide = true;
			// 		break;
			// 	}
			// }
		}
		this.isHide = false;
		return this.isHide;
	}
}
