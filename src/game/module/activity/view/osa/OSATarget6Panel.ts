/**
 *
 * @author hepeiye
 *
 */
class OSATarget6Panel extends ActivityPanel {

	private actTime:eui.Label;
	private actInfo:eui.Label;
	private leftBtn:eui.Button;
	private rightBtn:eui.Button;

	// boss1-3
	// item0-3
	// monName0-2
	// state0-2
	private goBtn:eui.Button;
	private successBtn:eui.Label;
	public index:number;//sortId
	public bindex:number;
	public maxIndex:number;
	public redPoint:eui.Image;
	private actTitle:eui.Image;
	private giftTitle:eui.Image;
	constructor() {
		super();

		this.skinName = "OSABoss";

		this.maxIndex = 0;

	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();

	}

	public init() {
		let sortId:number = this.getRule();
		this.updateData(sortId);

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.goBtn, this.onTap);
		this.observe(Activity.ins().postRewardResult,this.GetCallBack);

		for( let i = 1;i <= 3;i++ ){
			this.addTouchEvent(this["boss"+i], this.onClick);
		}

		this.maxIndex = 0;
		for( let k in GlobalConfig.ActivityType6Config[this.activityID] )
			this.maxIndex++;

		let sortId:number = this.getRule();
		this.updateData(sortId);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.leftBtn, this.onTap);
		this.removeTouchEvent(this.rightBtn, this.onTap);
		this.removeTouchEvent(this.goBtn, this.onTap);
		this.removeObserve();
	}
	public onClick(e: egret.TouchEvent){
		for( let i = 1;i<=3;i++ ){
			if( e.currentTarget == this["boss"+i] ){
				let idx:number = this.calcIndex(this.index);
				let config:ActivityType6Config = GlobalConfig.ActivityType6Config[this.activityID][idx];
				if( config && config.bossID && config.jump ){
					ViewManager.ins().open(config.jump[0][0], config.jump[0][1],config.bossID[i-1][0]);
				}
				break;
			}
		}
	}

	public onTap(e: egret.TouchEvent){
		let config:ActivityType6Config;
		let idx:number;
		switch (e.currentTarget) {
			case this.leftBtn:
				--this.index;
				idx = this.calcIndex(this.index);
				if( !idx )return;
				config = GlobalConfig.ActivityType6Config[this.activityID][idx];
				if(!config || this.index - 1 <= 0){
					this.index = 1;
					this.leftBtn.visible = false;
				}
				this.rightBtn.visible = true;
				this.updateData(this.index);
				break;
			case this.rightBtn:
				++this.index;
				idx = this.calcIndex(this.index);
				if( !idx )return;
				config = GlobalConfig.ActivityType6Config[this.activityID][idx];
				if(!config || this.index + 1 > this.maxIndex){
					this.index = this.maxIndex;
					this.rightBtn.visible = false;
				}
				this.leftBtn.visible = true;
				this.updateData(this.index);
				break;
			case this.goBtn:
				idx = this.calcIndex(this.index);
				if( !idx )return;
				if( this.goBtn.label == "前往击杀" ){
					ViewManager.ins().close(ActivityWin);
					config = GlobalConfig.ActivityType6Config[this.activityID][idx];
					if( config && config.bossID && config.jump){
						ViewManager.ins().open(config.jump[0][0], config.jump[0][1],config.bossID[0][0]);
					}
				}else{
					Activity.ins().sendReward(this.activityID,idx);
				}
				break;
		}
	}
	private GetCallBack(activityID:number){
		if( this.activityID != activityID )return;
		if(!Activity.ins().isSuccee){
			if( !UserBag.ins().getSurplusCount() ) {
				UserTips.ins().showTips("背包已满");
			}else{
				UserTips.ins().showTips("领取失败");
				let activityData: ActivityType6Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType6Data;
				Activity.ins().sendChangePage(activityData.id);
			}
		}
		Activity.ins().isSuccee = false;
		let sortId:number = this.getRule();
		this.updateData(sortId);
	}
	private sortRule(a: ActivityType6Config, b: ActivityType6Config){
		if (a.sort > b.sort)
			return 1;
		else if (a.sort < b.sort)
			return -1;
		else
			return 0;
	}
	//根据显示规则显示当前击杀boss的页面
	public getRule():number{
		let activityData: ActivityType6Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType6Data;
		let copyConfig: ActivityType6Config[] = GlobalConfig.ActivityType6Config[this.activityID];
		//显示boss:(分开判断原因是可领取有可能在未击杀后面)
		let ruleIndex1:number = 0;//是否可领取 最左边
		let ruleIndex2:number = 0;//是否击杀 最左边
		let isRule:boolean = false;
		let config: ActivityType6Config[] = [];
		for( let i in copyConfig ){
			config.push(copyConfig[i]);
		}
		config.sort(this.sortRule);
		for( let k in config ){//所有击杀奖励
			let idx:number = this.calcIndex(Number(k));
			let record = activityData.getBossGroupGiftIndex(config[k]);//判断奖励数据 1:可领取 2:已领取
			//0:未击杀 1:已击杀
			let bossRecord:number = activityData.getBossGroup(activityData.rewardsBossSum[idx],config[k]);
			if( record == Activity.Geted ){//已领取 = 已领取

			}
			else if( bossRecord == Activity.KILL && record == Activity.CanGet){//已击杀 + 可领取 = 可领取
				if( !ruleIndex1 || config[k].sort < ruleIndex1 ){
					ruleIndex1 = config[k].sort;
					isRule = true;//找到第一个可领取就退出

				}
				break;
			}
			else if( bossRecord == Activity.NOKILL && record == Activity.CanGet){//未击杀 + 可领取 = 未完成
				if( !ruleIndex2 || config[k].sort < ruleIndex2 )//这种情况不要退出遍历 后面可能出现可领取
					ruleIndex2 = config[k].sort;
				break;
			}
			if( isRule )break;
		}
		let curIndex:number = 0;//sortId
		if( ruleIndex1 )
			curIndex = ruleIndex1;
		else
			curIndex = ruleIndex2;

		curIndex = curIndex?curIndex:config[0].sort;//防止为0 最左边
		return curIndex;
	}
	public updateData(sortId:number = 1) {
		if( sortId > this.maxIndex ){
			this.index = this.maxIndex;
			return;
		}
		this.index = sortId;
		let id:number = this.calcIndex(this.index);
		if( !id )return;
		let activityData: ActivityType6Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType6Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
		this.actInfo.text = GlobalConfig.ActivityConfig[this.activityID].desc;

		//奖励
		let curRole:Role = SubRoles.ins().getSubRoleByIndex(0);//以第一个职业为准

		let config = GlobalConfig.ActivityType6Config[this.activityID][id];
		let idx = 0;
		for( let i=0;i < config.rewards.length;i++ ){
			if( !this["item"+idx] )break;//防止越界
			let rew:RewardData = config.rewards[i];
			if( rew.job && curRole.job != rew.job)continue;
			// let cfg:ItemConfig = GlobalConfig.ItemConfig[rew.id];
			// if( cfg )
			// 	this["item"+idx].data = rew.id;
			// else{
			// 	this["item"+idx].data = {type:rew.type,count:rew.count,id:rew.id};
			// }
			this["item"+idx].data = {type:rew.type,count:rew.count,id:rew.id};
			this["item"+idx].visible = true;
			idx++;
		}
		for( let j=idx;j < 4;j++ ){
			this["item"+j].visible = false;
		}

		//boss头像
		let bossList = config.bossID;
		for( let i = 0;i< 3;i++ ){
			if( this["boss"+(i+1)] ){
				let mid = bossList[i][0];//第一个为头像
				let mcfg:MonstersConfig = GlobalConfig.MonstersConfig[mid];
				this["boss"+(i+1)].source = "monhead"+mcfg.head+"_png";
				this["monName"+i].text = mcfg.name;
			}
		}

		//检查当前boss页面是否可领取
		let record = activityData.getBossGroupGiftIndex(config);//判断奖励数据 1:可领取 2:已领取
		let bossRecord:number = activityData.getBossGroup(activityData.rewardsBossSum[id],config);
		this.redPoint.visible = false;
		if( record == Activity.Geted ){//已领取 = 已领取
			this.successBtn.visible = true;
			this.goBtn.visible = false;
		}
		else if( bossRecord == Activity.KILL && record == Activity.CanGet){//已击杀 + 可领取 = 可领取
			this.goBtn.visible = true;
			this.successBtn.visible = false;
			this.goBtn.label = "领取";
			this.redPoint.visible = true;
		}
		else if( bossRecord == Activity.NOKILL && record == Activity.CanGet){//未击杀 + 可领取 = 未完成
			this.goBtn.visible = true;
			this.successBtn.visible = false;
			this.goBtn.label = "前往击杀";
		}
		//左右
		this.leftBtn.visible = true;
		this.rightBtn.visible = true;
		if( this.index == 1 ){
			this.leftBtn.visible = false;
			this.rightBtn.visible = true;
		}
		else if( this.index == this.maxIndex ){
			this.rightBtn.visible = false;
			this.leftBtn.visible = true;
		}


		//显示每组击杀情况
		let group:number[] = activityData.getBossGroupIndex(activityData.rewardsBossSum[id],config);
		for( let i = 0;i<group.length;i++ ){
			if( group[i] ){
				this["state"+i].visible = true;
			}else{
				this["state"+i].visible = false;
			}
		}

		this.actTitle.source = config.groupName;
		this.giftTitle.source = config.giftName;
	}
	/**通过index计算sortId*/
	private calcSortId(index:number):number{
		for( let i in GlobalConfig.ActivityType6Config[this.activityID] ){
			let cfg:ActivityType6Config = GlobalConfig.ActivityType6Config[this.activityID][i];
			if( cfg.index == index )
				return cfg.sort;
		}
		return 0;
	}
	/**通过sortId计算index*/
	private calcIndex(sortId:number):number{
		for( let i in GlobalConfig.ActivityType6Config[this.activityID] ){
			let cfg:ActivityType6Config = GlobalConfig.ActivityType6Config[this.activityID][i];
			if( cfg.sort == sortId )
				return cfg.index;
		}
		return 0;
	}


}
