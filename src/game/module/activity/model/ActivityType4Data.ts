class ActivityType4Data extends ActivityBaseData {

	public recrod:number;
	public constructor(bytes: GameByteArray) {
		  super(bytes);
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
	}

	public updateData(bytes:GameByteArray):void{
		
	}

	//是否显示活动图标
	public getHide(): boolean {
		return false;
	}

	//活动是否开启
	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);

		if (beganTime < 0 && endedTime > 0) {
			return true;
		}


		return false;
	}

	/**获取榜单指定额度排名*/
	public myPaiming:number;//根据消费达标 记录自己的实际排名
	public getCostRank(rankdata:any,curIndex:{idx:number}){
		if( !rankdata )return 0;
		let rank:number = 0;//排名
		let value:number = rankdata.numType;//
		let config:ActivityType4Config[] = GlobalConfig.ActivityType4Config[this.id];
		while( config[curIndex.idx] ){
			if( value >= config[curIndex.idx].condValue ){
				rank = config[curIndex.idx].ranking;
				curIndex.idx++;
				if( rankdata.rankIndex == Activity.ins().myPaiming )
					this.myPaiming = rank;
				break;
			}
			curIndex.idx++;
		}

		return rank;
	}
}