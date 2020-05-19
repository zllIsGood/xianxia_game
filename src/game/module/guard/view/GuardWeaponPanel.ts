/**
 * Created by Peach.T on 2017/12/26.
 */
class GuardWeaponPanel extends BaseView {
	public btnChallenge: eui.Button;
	public lbTime: eui.Label;
	public itemList: eui.List;
	public noticeList:eui.List;
	constructor() {
		super();
		// this.skinName = `guardGodWeaponSkin`;
	}
	protected childrenCreated() {
		this.init();
	}

	public init() {
		this.itemList.itemRenderer = ItemBase;
		this.noticeList.itemRenderer = GuardLogsListRenderer;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.btnChallenge, this.challenge);
		this.observe(UserFb.ins().postGuardWeaponLogs,this.updateLogs);
		this.observe(UserFb.ins().postGuardInfo,this.updateChallgeTimes);
		this.updateChallgeTimes();
		this.itemList.dataProvider = new eui.ArrayCollection(GlobalConfig.GuardGodWeaponConf.showReward[UserZs.ins().lv]);
		UserFb.ins().sendGuardWeaponLogs();
		this.btnChallenge.label = GuardWeaponModel.ins().isShowSweep ?"扫  荡":"挑  战";
	}

	public updateChallgeTimes():void{
		this.lbTime.text = (GlobalConfig.GuardGodWeaponConf.dailyCount - GuardWeaponModel.ins().challengeTimes).toString();
	}

	public challenge(): void {
		if(!GuardWeaponModel.ins().isShowSweep){
			if (!KfArenaSys.ins().checkIsMatching()) {
				return;
			}
			UserFb.ins().challengeGuard();
		}
		else
		{
			if(GlobalConfig.GuardGodWeaponConf.dailyCount - GuardWeaponModel.ins().challengeTimes <= 0){
				UserTips.ins().showCenterTips("今天次数已用完，请明天再参加");
				return;
			}
			
				
			ViewManager.ins().open(BuySpecialWin);
		}
			
	}
	private updateLogs(arr:{noticeId:number,roleName:string,monsterName:string,itemName:string}[]){
		this.noticeList.dataProvider = new eui.ArrayCollection(arr);
	}
	public close(): void {
	}

}