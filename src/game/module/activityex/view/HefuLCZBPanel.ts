/**
 * //开服活动-天盟争霸
 */
class HefuLCZBPanel extends BaseView {

	private go:eui.Button;
	private over:eui.Label;
	private actTime:eui.Label;
	public activityID:number;
	//reward1-4
	private effs:MovieClip[];
    private list0:eui.List;
    private list1:eui.List;
    private list2:eui.List;
	private rewards:{type:number,id:number,count:number}[];
    private openTime:number[] = [3,5,7];//3,5,7(索引从1开始)
	private actInfo:eui.Label;
	constructor(...param: any[]) {
		super();
		this.skinName = "hefuLongchengSkin";
		this.effs = [];
		// this.rewards = [
		// 	{type:1,id:900007,count:1},
		// 	{type:1,id:900008,count:1},
		// 	{type:1,id:900009,count:1},
		// 	{type:0,id:2,count:20000},
        //     {type:1,id:900009,count:1},
		// 	{type:0,id:2,count:20000}
		// ];
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		// this.updateData();
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.go, this.onTap);
		this.observe(GuildWar.ins().postHeFuBelong,this.updateBelongs);
		GuildWar.ins().sendHeFuBelong();
		this.updateData();


	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.go, this.onTap);
		this.removeObserve();
		for( let i=0;i<this.effs.length;i++ ){
			if( this.effs[i] )
				DisplayUtils.removeFromParent(this.effs[i]);
		}
		this.effs = [];
	}


	private onTap(e: egret.TouchEvent): void {
		let index: number;
		switch (e.currentTarget) {
			case this.go:
				if( Guild.ins().guildID != 0 ){
					ViewManager.ins().close(ActivityExWin);
					GuildWar.ins().requestWinGuildInfo();
					ViewManager.ins().close(GuildMap);
					ViewManager.ins().open(GuildWarMainWin);
				}else{
					UserTips.ins().showTips("还没加入仙盟");
				}
				break;

		}
	}
	private getTime(activityData: ActivityType0Data):string{
		// let openTime:{day:number,hours:number,min:number}[] = GlobalConfig.GuildBattleConst.hefuOpen;
		// let date = new Date(activityData.startTime - DateUtils.SECOND_PER_DAY*1000);
		// date.setDate(date.getDate()+openTime.day);
		// date.setHours(openTime.hours,openTime.min||0,0,0);

		// let head  = (date.getMonth()+1)+"月"+date.getDate()+"日"+openTime.hours+":"+openTime.min+"-";
		// let end   = openTime.hours+":"+(openTime.min+GlobalConfig.GuildBattleConst.continueTime/60);
		// let week  = date.getDay();
		// let weeklist = ["(周日)","(周一)","(周二)","(周三)","(周四)","(周五)","(周六)"];
		// return head + end + weeklist[Number(week)];
		return;
	}
	public updateData() {
		this.actInfo.text = GlobalConfig.ActivityBtnConfig[this.activityID].acDesc;
		let openTime:{day:number,hours:number,min:number}[] = GlobalConfig.GuildBattleConst.hefuOpen;
        let hefuTime:number = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服开始时间
		let str:string = "";
		let timeS:number = 0;
		let date: Date;
		let i:number;
		for(i = 0;i < openTime.length;i ++){
			if(str.length > 0){
				str += "、";
			}
			timeS = hefuTime + (openTime[i].day-1) * DateUtils.MS_PER_DAY;
			date = new Date(timeS);
			date.setHours(openTime[i].hours,openTime[i].min||0,0,0);
			let min:string = date.getMinutes()<10?("0"+date.getMinutes()):date.getMinutes()+"";
			str += (date.getMonth()+1)+"月"+date.getDate()+"日" + date.getHours()+":"+ min;
		}
		this.actTime.text = str;

        let b:boolean = false;
		let firstNum:number;
		let startIndex:number = 0;
        let timeE:number = 0;
        let dataE:Date;
		let lastNum:number;
		for(i = 0;i < openTime.length;i ++){
			timeS = hefuTime + (openTime[i].day-1) * DateUtils.MS_PER_DAY;
            timeE = hefuTime + openTime[i].day * DateUtils.MS_PER_DAY;
			date = new Date(timeS);
			date.setHours(openTime[i].hours,openTime[i].min||0,0,0);
            dataE = new Date(timeE);
			dataE.setHours(0,0,0);
			if(i == 0){
				firstNum = date.getTime();
			}
			if(i == openTime.length-1){
				lastNum = dataE.getTime();
			}
            if(GameServer.serverTime >= date.getTime() && GameServer.serverTime < dataE.getTime()){
				b = true;
				startIndex = i;
				break;
			}
		}
        if(!b){
            this.over.visible = true;
            if(GameServer.serverTime < firstNum){
            //未开启
                this.over.text = "未开启";
            }else if(GameServer.serverTime >= lastNum){
            //已结束 
                this.over.text = "已结束";
            }else{
            //未开启
                this.over.text = "未开启";
            }
        }else{
            //已开启
            this.over.visible = false;

        }
        this.go.visible = !this.over.visible;

		//前三个用控件
		// for( let i=1;i<=4;i++ ){
		// 	this["reward"+i].data = this.rewards[i-1];
		// }
		let awardany:any= GlobalConfig.GuildBattleConst.hefuAward.leader;
		let list:{id:number,type:number,count:number}[][] = awardany.award;
		this.list0.itemRenderer = ItemBase;
		this.list1.itemRenderer = ItemBase;
		this.list2.itemRenderer = ItemBase;
        this.list0.dataProvider = new eui.ArrayCollection(list[0]);
        this.list1.dataProvider = new eui.ArrayCollection(list[1]);
        this.list2.dataProvider = new eui.ArrayCollection(list[2]);
		// for( let i = 1;i <= 3;i++ ){
		// 	let effname = "chuanqizbeff";
		// 	if( !this.effs[i-1] || !this.effs[i-1].parent ){
		// 		let mc = new MovieClip();
		// 		//let p:egret.Point = this["reward"+i].localToGlobal();
		// 		//this["reward"].globalToLocal(p.x, p.y, p);
		// 		mc.x = this["reward"+i].width/2;
		// 		mc.y = this["reward"+i].height/2;
		// 		mc.y -= 10;
		// 		mc.playFile(RES_DIR_EFF + effname, -1);
		// 		this["reward"+i].addChild(mc);

		// 		this.effs.push(mc);
		// 	}
		// }

	}
	/**更新归属名称*/
	private updateBelongs(){
		for( let i = 0;i < 3;i++ ){
			if( GuildWar.ins().GuildNameBelongs[i] ){
				this[`guild${i}`].visible = true;
				this[`guild${i}`].text = `归属:`+GuildWar.ins().GuildNameBelongs[i];
			}else
				this[`guild${i}`].visible = false;
		}

	}
}