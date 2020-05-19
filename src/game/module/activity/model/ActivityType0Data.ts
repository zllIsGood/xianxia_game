/**
 * 活动2类的数据
 */

class ActivityType0Data extends ActivityBaseData {

	constructor(bytes: GameByteArray) {
		super(bytes);


	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);

	}
	public specialState():boolean{
		let hefuTime:number = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服开始时间
		let timeS:number;
		let date:Date;
		let timeE:number;
		let dateE:Date;
		if(this.id == ActivityBtnType.HEFU_BOSS){//远古boss
			let openTime:number[] = [0,1,3,5];//20：00(索引从0开始:0,1,3,5)
			for(let i:number = 0;i < openTime.length;i ++){
				timeS = hefuTime + openTime[i] * DateUtils.MS_PER_DAY;
				date = new Date(timeS);
				date.setHours(20,0,0);
				timeE = hefuTime + (openTime[i]+1) * DateUtils.MS_PER_DAY;//- 3.5*DateUtils.MS_PER_HOUR
				dateE = new Date(timeE);

				// let idx = i;
				// if( idx > 0 ){//20:30开始显示下一个boss开启
				// 	idx -= 1;
				// 	timeS = hefuTime + openTime[idx] * DateUtils.MS_PER_DAY;
				// 	date = new Date(timeS);
				// 	date.setHours(20,0,0);
				// 	timeE = hefuTime + (openTime[i]+1) * DateUtils.MS_PER_DAY - 3.5*DateUtils.MS_PER_HOUR;
				// 	dateE = new Date(timeE);
				// }

				if(GameServer.serverTime >= date.getTime() && GameServer.serverTime < dateE.getTime()){
					let cof:HefuBossConfig = GlobalConfig.HefuBossConfig[i + 1];
					if(!cof){
						return false;
					}
					let killBossId: number = cof.killBossId;
					let obj:any = HefuBossCC.ins().bossKillNumData;
					if (obj && obj[killBossId] != undefined && obj[killBossId][1] != 1) {
						return true;
					}
				}
			}
			return false;
		}else if(this.id == ActivityBtnType.HEFU_JZLC){//天盟争霸
			let openTime:{day:number,hours:number,min:number}[] = GlobalConfig.GuildBattleConst.hefuOpen;
			if(!openTime){
				return false;
			}
            if( GuildWar.ins().getModel().isWatStart  ){//|| (GameServer.serverTime >= date.getTime() && GameServer.serverTime < dateE.getTime())
                return true;
            }
			// for(let i:number = 0;i < openTime.length;i ++){
			// 	timeS = hefuTime + (openTime[i].day-1) * DateUtils.MS_PER_DAY;
			// 	timeE = hefuTime + openTime[i].day * DateUtils.MS_PER_DAY;
			// 	date = new Date(timeS);
			// 	date.setHours(openTime[i].hours,openTime[i].min||0,0,0);
			// 	dateE = new Date(timeE);
			// 	dateE.setHours(openTime[i].hours,(openTime[i].min || 0)+20,0);
			// 	if( GameServer.serverTime >= date.getTime() && GameServer.serverTime < dateE.getTime() ){
			// 		return true;
			// 	}
			// }
			return false;
		}
		return true;
	}
	public canReward(): boolean {
		let cfg = GlobalConfig.ActivityBtnConfig[this.id];
		if (this.id == ActivityBtnType.LEI_JI_DAYS42) {
			return Recharge.ins().rechargeTotal.hasGetDays.length < Recharge.ins().rechargeTotal.totalDay;
		} else if (this.id == ActivityBtnType.LEI_JI_EVERYDAY) {
			let data: RechargeData = Recharge.ins().getRechargeData(0);
			let configs: any = Recharge.ins().getCurRechargeConfig();

			for (let k in configs) {
				let config = configs[k];
				if (data.curDayPay >= config.pay) {
					let state = ((data.isAwards >> config.index) & 1);
					if (!state) {
						return true;
					}
				}
			}
		}
		else if (this.id == ActivityBtnType.THREE_HEROES)
			return ThreeHeroes.ins().awardState == ThreeHeroes.CanGet;
		else if(this.id == ActivityBtnType.HEFU_JZLC || this.id == ActivityBtnType.HEFU_BOSS){
			return true;
		}

		if (cfg && cfg.jump && cfg.jump[0] == StatePageSysType.RING) {
			if (LyMark.ins().checkOpen()) {
				if (!LyMark.ins().isMax) {
					let cfg: FlameStampLevel = GlobalConfig.FlameStampLevel[LyMark.ins().lyMarkLv];
					let itemData: ItemData = UserBag.ins().getBagItemById(cfg.costItem);
					let count: number = itemData ? itemData.count : 0;
					return count >= cfg.costCount;
				}
			}
		}
		return false;
	}

	public getHide():boolean{
		if(this.isHide) return this.isHide;
		if(this.id == ActivityBtnType.LEI_JI_DAYS42) {
			//全部已领取则隐藏
			if(Recharge.ins().rechargeTotal.hasGetDays.length >= 42) {
				this.isHide = true;
			}
		}
		else if (this.id == ActivityBtnType.THREE_HEROES)
			this.isHide = !this.isOpenActivity();
		else if (this.id == ActivityBtnType.HEFU_BOSS){
			let openTime:number[] = [0,1,3,5];//20：00(索引从0开始:0,1,3,5)
			let cof:HefuBossConfig = GlobalConfig.HefuBossConfig[openTime.length];
			if( cof ){//最后一个合服boss被刷完隐藏
				let killBossId: number = cof.killBossId;
				let obj:any = HefuBossCC.ins().bossKillNumData;
				if (obj && obj[killBossId] != undefined && obj[killBossId][1] >= 1) {
					this.isHide = true;
				}
			}
		}
		else if (this.id == ActivityBtnType.HEFU_JZLC){
			let hefuTime:number = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服开始时间
			let openTime:{day:number,hours:number,min:number}[] = GlobalConfig.GuildBattleConst.hefuOpen;
			let i = openTime.length - 1;
			// let timeS = hefuTime + (openTime[i].day-1) * DateUtils.MS_PER_DAY;
			let timeE = hefuTime + openTime[i].day * DateUtils.MS_PER_DAY;
			// let date = new Date(timeS);
			// date.setHours(openTime[i].hours,openTime[i].min||0,0,0);
			let dateE = new Date(timeE);
			dateE.setHours(0,0,0);
			//最后一天结束隐藏
			if(GameServer.serverTime > dateE.getTime()){
				return true;
			}
		}


		return this.isHide;
	}

	public isOpenActivity(): boolean {
		// return true;
		let beganTime = Math.floor((this.startTime - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((this.endTime - GameServer.serverTime) / 1000);
		if (beganTime < 0 && endedTime > 0) {
			return true;
		}
		else if (this.id == ActivityBtnType.THREE_HEROES)
			return ThreeHeroes.ins().showIcon3DaysLater;

		return false;
	}
}
enum StatePageSysType{
	WING = 1,//翅膀界面
	RING = 2,//烈焰印记界面
}
