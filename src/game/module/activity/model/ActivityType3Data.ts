/*连续充值奖励数据*/
class ActivityType3Data extends ActivityBaseData {
	public recrod: number;
	public dabiao: number[] = [];
	public chongzhiNum: number = 0;//当天累积充值数
	public chongzhiTotal: number = 0;//总累计充值数
	private _day7text: string;
	private _totaltext: string;
	public maxTotal: number;
	public rewards1: RewardData[];
	public rewards2: RewardData[];
	public btn1: boolean = false;
	public btn2: boolean = false;
	public image1: boolean = false;
	public image2: boolean = false;
	public constructor(bytes: GameByteArray) {
		super(bytes);
		this.updateData(bytes);
		this.recrod = bytes.readInt();
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		let rewardID = bytes.readShort();
		this.recrod = bytes.readInt();
	}

	public openDay():number
	{
		let configs: ActivityType3Config[] = GlobalConfig['ActivityType3Config'][this.id];
		if(configs &&　configs[0])
		{
			return configs[0].day;
		}
		return 7;
	}

	//是否可以领取奖励
	public canReward(): boolean {
		let configs: ActivityType3Config[] = GlobalConfig['ActivityType3Config'][this.id];
		let records = this.recrod;
		let curIndex = -1;
		var i:number = 0;
		for (let k in configs) {
			let record = (records>>configs[k].index) & 1;//Math.floor(records / Math.pow(2, (configs[k].index))) % 2;
			if (configs[k].type == 1) {
				if (this.dabiao[i] >= configs[k].day) {
					if (record == 0)
						return true;
				}
			}
			else if (configs[k].type == 2 && configs[k].val <= this.chongzhiTotal) {
				if (record == 0)
					return true;
			}
			else if (configs[k].type == 3 && configs[k].val <= this.chongzhiNum) {
				if(curIndex == -1){
					curIndex = this.getCurIndex(3);
				}
				if (curIndex == configs[k].index && record == 0)
					return true;
			}

			i++;
		}
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
	//一些界面的数据处理
	public updateData(bytes: GameByteArray): void {
		let num: number = bytes.readShort();
		this.dabiao = [];
		for (let i = 0; i < num; i++) {
			this.dabiao.push(bytes.readShort());
		}
		this.chongzhiNum = bytes.readInt();
		this.chongzhiTotal = bytes.readInt();
	}

	public get day7text(): string {
		let configs: ActivityType3Config[] = GlobalConfig['ActivityType3Config'][this.id];
		for (let k in configs) {
			if (configs[k].type == 1) {
				this.rewards1 = configs[k].rewards;
				this._day7text = `累计${"<font color='#ffff00'>" + configs[k].day + "</font>"}天，每日充值${"<font color='#ffff00'>" + configs[k].val + "</font>"}元宝可领取`;
			}
		}
		return this._day7text;
	}

	public get totaltext(): string {
		let configs: ActivityType3Config[] = GlobalConfig['ActivityType3Config'][this.id];
		for (let k in configs) {
			if (configs[k].type == 2) {
				this.maxTotal = configs[k].val;
				this.rewards2 = configs[k].rewards;
				this._totaltext = `活动期间累计充值${"<font color='#ffff00'>" + configs[k].val + "</font>"}元宝可领取`;
			}
		}
		return this._totaltext;
	}

	//是否单个活动领取奖励
	public canOnlyReward(): void {
		let configs: ActivityType3Config[] = GlobalConfig['ActivityType3Config'][this.id];
		let records = this.recrod;
		this.btn1 = false;
		this.btn2 = false;
		this.image1 = false;
		this.image2 = false;
		for (let k in configs) {
			let record = (records>>configs[k].index) & 1;//Math.floor(records / Math.pow(2, (configs[k].index))) % 2;
			if (configs[k].type == 1 && this.dabiao) {
				if (this.dabiao[0] >= configs[k].day) {
					if (record == 0)
						this.btn1 = true;
					if (record == 1)
						this.image1 = true;
				}
			}
			if (configs[k].type == 2 && configs[k].val <= this.chongzhiTotal) {
				if (record == 0)
					this.btn2 = true;
				if (record == 1)
					this.image2 = true;
			}
		}
	}

	private getDateTime(str:string) {
		let arr = str.split(/[-,.,:]/g);
		let date = new Date(+arr[0],+arr[1]-1,+arr[2],+arr[3]||0,+arr[4]||0);
		return date.getTime();
	}

	public curOpenDay(){
		let actConfig = GlobalConfig.ActivityConfig[this.id];
		let day = 0;//活动已开始天数 0是活动当天
		if (actConfig.timeType == 0) {//开服时间
			let time = +actConfig.startTime.split("-")[0];
			day = GameServer.serverOpenDay - time;
		} else if (actConfig.timeType == 1) {//固定活动时间
			let time = GameServer.serverTime;

			let openTime = this.getDateTime(actConfig.startTime);//(new Date(actConfig.startTime)).getTime();
			let endTime = this.getDateTime(actConfig.endTime);
			day = Math.floor((time - openTime)/1000/3600/24);
		} else if (actConfig.timeType == 2) {//合服时间
			let time = +actConfig.startTime.split("-")[0];
			let openTime = Math.floor( ( GameServer.serverTime - DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime) )/1000/3600/24);
			day = openTime - time;
		}
		return day;
	}

	/**
	 * 是否过期
	 * @param tarday 目标天
	 * @return 过期标识
	 * */
	public isOverTimer(index:number){
		let curday = this.curOpenDay();//索引从0开始是当天
		let config: ActivityType3Config = GlobalConfig.ActivityType3Config[this.id][index];
		let record = (this.recrod>>config.index) & 1;
		if( curday+1 > config.day && record != Activity.Geted )
			return true;
		return false;
	}

	public getCurIndex(type?:number) {
		let actConfig = GlobalConfig.ActivityConfig[this.id];
		let type3Config:ActivityType3Config[] = GlobalConfig.ActivityType3Config[this.id];
		let day = 0;//活动已开始天数
		if (actConfig.timeType == 0) {//开服时间
			let time = +actConfig.startTime.split("-")[0];
			day = GameServer.serverOpenDay - time;
		} else if (actConfig.timeType == 1) {//活动时间
			let time = GameServer.serverTime;

			let openTime = this.getDateTime(actConfig.startTime);//(new Date(actConfig.startTime)).getTime();
			let endTime = this.getDateTime(actConfig.endTime);
			day = Math.floor((time - openTime)/1000/3600/24);
		} else if (actConfig.timeType == 2) {//合服时间
			let time = +actConfig.startTime.split("-")[0];
			let openTime = Math.floor((GameServer.serverTime - (GameServer._serverHeZeroTime * 1000 + DateUtils.SECOND_2010 * 1000))/1000/3600/24);
			day = openTime - time;//索引从1开始
		}

		let types = {};
		for (let t in type3Config) {
			types[type3Config[t].type] = 1;
		}

		let keys = Object.keys(types);
		if (keys.length == 1 || type == undefined) {
			type = +keys[0];
		}

		let configArr = [];
		let i;
		for (i in type3Config) {
			if(type3Config[i].type == type){
				configArr.push(type3Config[i]);
			}
			// day -= type3Config[i].day;
		}
		configArr.sort((a:ActivityType3Config,b:ActivityType3Config)=>{
			if(a.day < b.day)
				return -1;
			return 1;
		});

		for (let conf of configArr) {
			i = conf.index;
			if(type == 1 || type == 2) {
				if(day < conf.day) {
					return +i;
				}
			} else if (type == 3){
				if(day < conf.day) {//conf.day
					return +i;
				}
				// day -= 1;//conf.day;
			}
		}
		return +i;
	}

	//获取剩余时间(秒)
	public getLeftTime() {
		if(this.endTime) {
			let end_time = this.endTime + DateUtils.SECOND_2010 + 20;
			let leftTime = end_time - Math.floor(GameServer.serverTime/1000);
			if(leftTime < 0) {
				leftTime = 0;
			}
			return leftTime;
		}
		let actConfig = GlobalConfig.ActivityConfig[this.id];
		let type3Config:ActivityType3Config[] = GlobalConfig.ActivityType3Config[this.id];
		let day = 0;//活动已开始天数
		let endDay:number = 0;//结束时间
		if (actConfig.timeType == 0) {//开服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;
			day = GameServer.serverOpenDay - time;
		} else if (actConfig.timeType == 1) {//活动时间
			let time = GameServer.serverTime;
			let openTime = (new Date(actConfig.startTime)).getTime();
			let endTime = (new Date(actConfig.endTime)).getTime();
			day = Math.floor((time - openTime)/1000/3600/24);
			endDay = Math.round((endTime - openTime)/1000/3600/24);
		} else if (actConfig.timeType == 2) {//合服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;//合服活动期间天数
			//至今距离合服时间天数
			let farTime = Math.floor((GameServer.serverTime - (GameServer._serverHeZeroTime * 1000 + DateUtils.SECOND_2010 * 1000))/1000/3600/24);
			day = farTime - time;//距离指定合服活动起始天数
		}

		let curDate = new Date(GameServer.serverTime);
		let leftDay = endDay-day;
		// let i;
		// for (i in type3Config) {
		// 	if(day <= type3Config[i].day) {
		// 		leftDay = type3Config[i].day - day;
		// 		break;
		// 	}
		// 	// day -= type3Config[i].day;
		// }
		if (leftDay <= 0) return 0;

		let endDate = new Date(GameServer.serverTime);
		endDate.setDate(curDate.getDate()+leftDay);
		endDate.setHours(0,0,0,0);
		return Math.floor((endDate.getTime() - GameServer.serverTime)/1000) + 20;
	}
	/**每一行奖励情况*/
	getRewardStateById(index: number): number {
		let config: ActivityType3Config = GlobalConfig.ActivityType3Config[this.id][index];
		//判断是否有领取资格
		switch (config.showType){
			case Show3Type.TYPE6:
				if( this.chongzhiTotal < config.val )
					return Activity.NotReached;
				break;
			case Show3Type.TYPE7:
				if( this.dabiao[index-1] < config.day )
					return Activity.NotReached;
				break;
			case Show3Type.TYPE9:
				if( this.chongzhiTotal < config.val )
					return Activity.NotReached;
				break;
		}

		//判断可领取和已领取
		let record = (this.recrod>>config.index) & 1;
		return record ? Activity.Geted : Activity.CanGet;

	}
}

enum Show3Type{
	TYPE1 = 1,// 开服活动-七日连充
	TYPE2  = 2,//开服活动-七日每日充 7日累充
	TYPE3 = 3,//累计充值送诛仙装备
	TYPE4 = 4,//合服活动-累充活动/感恩节活动
	TYPE5 = 5,//神装改成图鉴
	TYPE6 = 6,//合服累充162
	TYPE7 = 7,//合服连冲162
	TYPE9 = 9,//版本庆典累充
}

