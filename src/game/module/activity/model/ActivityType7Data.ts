/**
 * 活动7类的数据
 */

class ActivityType7Data extends ActivityBaseData {
	public static TYPE_RING = 1;
	public static TYPE_HEFUBOSS = 2;
	public static TYPE_LABA = 6;//腊八
	public record: number;

	public personalRewardsSum:number[] = [];//对应积分个人购买次数
	public worldRewardsSum:number[] = [];//对应积分世界购买次数
	public bossScore:number;
	public exchange:number[] = [];//每天兑换次数
	constructor(bytes: GameByteArray) {
		super(bytes);
		this.initBuyData(bytes);
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		let id: number = bytes.readShort();
		let count: number = bytes.readShort();
		this.personalRewardsSum[id] = count;//对应积分个人购买次数
		this.worldRewardsSum[id] = bytes.readShort(); //对应积分世界购买次数
		this.exchange[id] = bytes.readShort();//每天兑换次数
	}

	public initBuyData(bytes: GameByteArray){
		let len = bytes.readShort();
		for (let i: number = 1; i <= len; i++){
			this.personalRewardsSum[i] = bytes.readShort();
			this.worldRewardsSum[i] = bytes.readShort();
			this.exchange[i] = bytes.readShort();//每天兑换次数
		}
		this.bossScore = bytes.readInt();
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
	public checkRedPoint():boolean{
		return Activity.ins().getType7RedPoint(this.id);
	}

    public getExchange(index:number):number{
		let actdata:ActivityType7Data = Activity.ins().getActivityDataById(this.id) as ActivityType7Data;
		let config: ActivityType7Config = GlobalConfig.ActivityType7Config[this.id][index];
		if (!config.items)return Activity.NotReached;
		let isget = Activity.CanGet;
		let worldRewards = actdata.worldRewardsSum[index];
		let exchange = actdata.exchange[index];
		let personalRewards = actdata.personalRewardsSum[index];
		for( let k in config.items ){
			let itemData = UserBag.ins().getBagItemById(config.items[k].id);
			let count = itemData?itemData.count:0;
			if( count < config.items[k].count ){
				isget = Activity.NotReached;
				break;
			}

		}
		if( isget != Activity.NotReached ){
			//全服 个人 每日 同时满足
			if( config.scount ){
				if( worldRewards >= config.scount ){//全服兑换是否兑换完了
					isget = Activity.Geted;
				}
			}
			if( config.count ){//个人兑换次数
				if( personalRewards >= config.count ){//个人兑换是否兑换完了
					isget = Activity.Geted;
				}
			}
			if( config.dailyCount ){
				if( exchange >= config.dailyCount ){//每日兑换是否兑换完了
					isget = Activity.Geted;
				}
			}
		}
		return isget;
	}

	//获取剩余时间(秒)
	public getLeftTime() {
		if(this.endTime) {
			let leftTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime)/1000);
			if(leftTime < 0) {
				leftTime = 0;
			}
			return leftTime;
		}
		return 0;
	}
}
