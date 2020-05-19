/**
 * 合服boss
 */
class HefuBossPanel extends BaseView {
	private actTime:eui.Label;//时间
	private actInfo:eui.Label;//活动说明
	private goBtn:eui.Button;
	private time:eui.Label;//开启时间
	private successBtn:eui.Label;
	private redPoint:eui.Image;
	private openTime:number[] = [0,1,3,5];//合服时间1，2，4，6(索引从0开始:0,1,3,5)
	private bossImg:eui.Image;
	private Boss:eui.Group;
	private bossEffect:MovieClip;
	private bossImage:MovieClip;
	private _aryTime:string[] = [];
	public activityID:number;
	private _btnB:boolean;
	private rewardList:eui.List;
	public constructor() {
		super();
		this.skinName = `hefuBoss`;
		this.bossEffect = new MovieClip;
		this.bossEffect.scaleX = -1;
		this.bossEffect.scaleY = 1;
		this.bossEffect.x = 78 + 50;
		this.bossEffect.y = 160;
		this.Boss.addChild(this.bossEffect);

		this.bossImage = new MovieClip;
		this.bossImage.scaleX = -1;
		this.bossImage.scaleY = 1;
		this.bossImage.x = 78 +50;
		this.bossImage.y = 160;
		this.Boss.addChild(this.bossImage);
		this.bossImg.visible = false;
	}
	 protected childrenCreated() {
        super.childrenCreated();
    }
    close(){
        this.removeTouchEvent(this.goBtn,this.onTap);
    }
    open() {
        this.addTouchEvent(this.goBtn, this.onTap);
        this.rewardList.itemRenderer = ItemBase;
		this.initView();
    }
	private initView():void{
		this._aryTime = [];
		this.actInfo.text = GlobalConfig.ActivityBtnConfig[this.activityID].acDesc;
		let hefuTime:number = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服开始时间
		let str:string = "";
		let timeS:number = 0;
		let date: Date;
		let i:number;
		for(i = 0;i < this.openTime.length;i ++){
			if(str.length > 0){
				str += "、";
			}
			timeS = hefuTime + this.openTime[i] * DateUtils.MS_PER_DAY;
			date = new Date(timeS);
			str += (date.getMonth()+1)+"月"+date.getDate()+"日";
			this._aryTime.push((date.getMonth()+1)+"月"+date.getDate()+"日");
		}
		str += "的20:00开启";
		this.actTime.text = str;
		let b:boolean = false;
		let startIndex:number = -1;
		let timeE:number;
		let dateE:Date;
		let firstNum:number;
		let endNum:number;
		//从后往前遍历
		for( i = this.openTime.length-1;i >= 0;i-- ){
			timeS = hefuTime + this.openTime[i] * DateUtils.MS_PER_DAY;
			date = new Date(timeS);
			date.setHours(20,0,0);
			timeE = hefuTime + (this.openTime[i]+1) * DateUtils.MS_PER_DAY;
			dateE = new Date(timeE);
			if(i == 0){
				firstNum = date.getTime();
			}
			if(i == this.openTime.length-1){
				endNum = dateE.getTime();
			}

			//第一个boss时间控制显示预告
			if( !i ){
				if(GameServer.serverTime >= date.getTime()){
					b = true;
				}
				startIndex = i;
				break;
			}

			//第二个boss开始判定前置boss死亡状态
			let idx = i-1;
			if( idx >= 0 ){
				let hefuBoss: HefuBossConfig = this.getBossConfig(i);
				let killBossId: number = hefuBoss.killBossId;
				timeS = hefuTime + this.openTime[i] * DateUtils.MS_PER_DAY;
				let predate = new Date(timeS);
				predate.setHours(0,0,0);
				//上一个boss没有被击杀 而且上一个boss日期没过
				if( HefuBossCC.ins().bossKillNumData[killBossId][1] != 1 && GameServer.serverTime < predate.getTime() ) {
					continue;
				}else{
					//找到上一个boss被击杀为止
					if(GameServer.serverTime >= date.getTime()){
						b = true;
					}
					startIndex = i;
					break;
				}
			}


		}


		if(!b){
			if(GameServer.serverTime < firstNum){
				//未开启
				startIndex = -1;
				// GlobalConfig.HefuBossConfig[1].bossId;
				this.selectCurBoss(GlobalConfig.HefuBossConfig[1].bossId,startIndex);
			}else if(GameServer.serverTime >= endNum){
				//已结束
				startIndex = -2;
				this.selectCurBoss(GlobalConfig.HefuBossConfig[4].bossId,startIndex);
			}else{
				// startIndex = -3;
				// let index:number = this.getNextBossId();
				// let bossid:number = this.getBossConfig(index+1).bossId;
				let bossid:number = this.getBossConfig(startIndex+1).bossId;
				this.selectCurBoss(bossid,startIndex,true);
			}
		}else{
			//开启
			this.selectCurBoss(GlobalConfig.HefuBossConfig[startIndex+1].bossId,startIndex);
		}

		//奖励
		let cbid:number;
		if( startIndex == -1 ){
			cbid = 1;
		}else if( startIndex == -2 ){
			cbid = 4;
		}else{
			cbid = startIndex+1;
		}
		let cbcfg:HefuBossConfig = GlobalConfig.HefuBossConfig[cbid];
		if( cbcfg ){
			this.rewardList.dataProvider = new eui.ArrayCollection(cbcfg.showReward);
		}

	}
	private selectCurBoss(bossId:number,startIndex:number,b:boolean=false):void{
		let monster: MonstersConfig = GlobalConfig.MonstersConfig[bossId];
    	if( startIndex >= 0 ){
    		let bid = GlobalConfig.HefuBossConfig[startIndex+1].bossId;
			monster = GlobalConfig.MonstersConfig[bid];
		}
		let effectPath: string = GlobalConfig.EffectConfig[monster.effect].fileName;
		this.bossImage.playFile(RES_DIR_MONSTER + `monster${monster.avatar}_3s`, -1);
        this.bossEffect.playFile(RES_DIR_EFF + effectPath, -1);
		let str:string;
		// this.goBtn.visible = true;
		// this.goBtn.enabled = true;
		let act:ActivityType0Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType0Data;
		this.redPoint.visible = act.specialState();
		if(startIndex  >= 0){
			if(!b){
				str = this._aryTime[startIndex];
				this.time.text = str + " 20:00";
				let hefuBoss: HefuBossConfig = this.getBossConfig(startIndex+1);
				let killBossId: number = hefuBoss.killBossId;
				if (HefuBossCC.ins().bossKillNumData && HefuBossCC.ins().bossKillNumData[killBossId] != undefined && HefuBossCC.ins().bossKillNumData[killBossId][1] != 1) {
					//没有击杀
					// this.successBtn.visible = false;
					// this.goBtn.visible = true;
					// this.redPoint.visible = true;
					this._btnB = true;
				}else{
					this._btnB = false;
					//已击杀 显示下一个
					str = this._aryTime[startIndex+1];
					if( str ){
						this.time.text = str + " 20:00";
						let bid = GlobalConfig.HefuBossConfig[startIndex+1].bossId;
						monster = GlobalConfig.MonstersConfig[bid];

						let effectPath: string = GlobalConfig.EffectConfig[monster.effect].fileName;
						this.bossImage.playFile(RES_DIR_MONSTER + `monster${monster.avatar}_3s`, -1);
						this.bossEffect.playFile(RES_DIR_EFF + effectPath, -1);
					}
					// this.successBtn.visible = false;
					// this.goBtn.visible = false;
					// this.goBtn.enabled = false;
				}
			}else{//未开启但是在时间里面
				str = this._aryTime[startIndex];
				this.time.text = str + " 20:00";
				// this.successBtn.visible = false;
				this._btnB = false;
			}
		}else{
			this._btnB = false;
			if(startIndex == -2){
				this.time.text = "已结束";
				// this.successBtn.visible = false;
			}else if(startIndex == -1){//未开启开启第一个
				str = this._aryTime[0] + "的20:00开启";
				this.time.text = str;
				// this.successBtn.visible = false;
			}
			// this.goBtn.enabled = false;
		}
	}
	public static getHefuBossConfig(bossId: number): HefuBossConfig {
        let cfg: HefuBossConfig;
        for (let i in GlobalConfig.HefuBossConfig) {
            if (GlobalConfig.HefuBossConfig[i].bossId == bossId && GlobalConfig.HefuBossConfig[i].killBossId <= 999) {
                cfg = GlobalConfig.HefuBossConfig[i];
                break;
            }
        }
        return cfg;
    }


	//得到下一个bos开启
	private getNextBossId():number{
		let hefuTime:number = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服开始时间
		let bossId:number = 0;
		let timeE:number;
		let dateE:Date;
		let timeS:number;
		let date:Date;
		let startIndex:number = 0;
		for(let i:number = 0;i < this.openTime.length;i ++){
			timeS = hefuTime + (this.openTime[i]) * DateUtils.MS_PER_DAY;
			date = new Date(timeS);
			// timeE = hefuTime + this.openTime[i] * DateUtils.MS_PER_DAY;
			// dateE = new Date(timeE);
			// dateE.setHours(20,0,0);
			if(GameServer.serverTime >= date.getTime()){
				startIndex = i;
			}
		}
		return startIndex;
	}
	//根据序列号
	private getBossConfig(index:number):HefuBossConfig{
		return GlobalConfig.HefuBossConfig[index];
	}
	private onTap(e:egret.TouchEvent):void{
		switch (e.currentTarget){
            case this.goBtn:
				if(this._btnB){

				}else{
					UserTips.ins().showTips(`BOSS未开启，请准时参加`);
					return;
				}
				if (HefuBossCC.ins().enterCD > 0) {
					UserTips.ins().showTips(`冷却中，${HefuBossCC.ins().enterCD}秒后可进入主城`);
					return;
				}
				else {
					if (HefuBossCC.ins().isInHefuBoss) {
						TimerManager.ins().doNext(() => {
							let win: BossBelongPanel = ViewManager.ins().getView(BossBelongPanel) as BossBelongPanel;
							if(win){
								win.attrBoss();
							}
						}, this);
					}
					else {
						HefuBossCC.ins().isChallenge = true;
						HefuBossCC.ins().sendEnter();
					}
				}
                ViewManager.ins().close(ActivityExWin);
                break;
        }
	}
}