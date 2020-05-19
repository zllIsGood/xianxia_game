class GameNoticePanle extends BaseView {

	public desc: eui.Label;
	public title: eui.Label;
	public getAward:eui.Button;
	public awardList:eui.List;
	public redPoint:eui.Image;

	constructor() {
		super();
		this.skinName = "gameNoticeSkin";
		this.redPoint.visible = false;
	}

	public open(...param: any[]): void {
		this.observe(UserFuLiNotice.ins().postUpdateShow, this.updateNotice);
		this.observe(UserFuLiNotice.ins().postNoticeInfo, this.updateRedPoint);
		this.addTouchEvent(this.getAward, this.onTap);
		
		this.awardList.itemRenderer = ItemBase;
		let str: string = GlobalConfig.HelpInfoConfig[5].text;
		let strList: string[] = str.split("_");
		this.title.textFlow = TextFlowMaker.generateTextFlow(strList[0]);
		this.desc.textFlow = TextFlowMaker.generateTextFlow(window['game_notice'] || strList[1]);

		if (UserFuLi.ins().isOpenNotice) {
			UserFuLi.ins().isOpenNotice = false;
			Notice.ins().postGameNotice();
			Notice.ins().setNoticeOPen();
		}
		this.updateNotice();
	}

	public updateNotice(){
		if(UserFuLiNotice.ins().awardState){
			this.getAward.label = "领取";
			this.redPoint.visible = true;
		}else{
			this.getAward.currentState = "disabled";
			this.getAward.label = "已领取";
			this.redPoint.visible = false;
		}
		let cfg:RewardData[];
		cfg = GlobalConfig.ClickGiftConf.rewards as RewardData[];
		if(!cfg) return;
		this.awardList.dataProvider = new ArrayCollection(cfg);
	}

	public updateRedPoint(state:number):void{
		if(state == 0)
		{
			UserTips.ins().showTips("背包已满");
		}else if(state == 1){
			this.getAward.currentState = "disabled";
			this.getAward.label = "已领取";
			this.redPoint.visible = false;
		}
	}

	public onTap(e:egret.TouchEvent){
		switch (e.currentTarget) {
			case this.getAward:
				UserFuLiNotice.ins().getAward();
			break;
		}
	}

	public close(...param: any[]): void {
	}
}