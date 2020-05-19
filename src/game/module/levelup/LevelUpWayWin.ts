/*升级提示界面*/
class LevelUpWayWin extends BaseEuiView {
	public frame: eui.Image;
	public desc: eui.Label;
	public desc0: eui.Label;
	public bgClose: eui.Rect;

	private gainList: eui.List;
	//描述 主面板类名 分页索引  星星数
	private gainWay: any[] = [["通关关卡", "GuanQiaRewardWin", 0,3], ["通天塔", "FbWin", 2,5], ["执行悬赏令", "LadderWin", 0,4], ["经验副本", "FbWin", 1,5]]
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "LevelUpWaySkin";
		this.gainList.itemRenderer = GainGoodsItem;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.gainList.dataProvider = new eui.ArrayCollection(this.gainWay);
		this.gainList.validateNow();
		for( let i = 0;i < this.gainList.numElements;i++ ){
			let gitem:GainGoodsItem = (this.gainList.getElementAt(i) as GainGoodsItem);
			if( gitem ){
				let isOpen:boolean = false;
				let needLv:number;
				let needZs:number;
				let guanka:number;
				//通关关卡
				if( i <= 0 ){
					isOpen = true;
				}
				//通天塔
				else if( i == 1 ){
					isOpen = UserZs.ins().lv >= GlobalConfig.FbChallengeConfig[1].zsLevelLimit && Actor.level >= GlobalConfig.FbChallengeConfig[1].levelLimit;
					needLv = GlobalConfig.FbChallengeConfig[1].levelLimit;
					needZs = GlobalConfig.FbChallengeConfig[1].zsLevelLimit;
				}
				//击杀附近的人(追血令)
				else if( i == 2 ){
					isOpen = UserFb.ins().guanqiaID >= GlobalConfig.SkirmishBaseConfig.openLevel;
					guanka = GlobalConfig.SkirmishBaseConfig.openLevel;
				}
				//经验副本
				else if( i == 3 ){
					//经验副本
					isOpen = Actor.level >= GlobalConfig.ExpFubenBaseConfig.openLv;
					needLv = GlobalConfig.ExpFubenBaseConfig.openLv;
				}
				gitem.gainData(isOpen,this.gainWay[i][3],{needLv:needLv,needZs:needZs,guanka:guanka});
			}
		}
		// this.gainList.validateNow();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
	}

	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			ViewManager.ins().closeTopLevel();
			if (item[1] == "GuanQiaRewardWin") {
				if( UserFb.ins().guanqiaID < UserFb.AUTO_GUANQIA ){
					UserFb.ins().setAutoPk();//指引点击闯关
					ViewManager.ins().close(LevelUpWayWin);
					return;
				}
				PlayFun.ins().openAuto();
				GameGuider.challengeBoss();
				ViewManager.ins().close(LevelUpWayWin);
				return;
			}
			GameGuider.guidance(item[1], item[2]);
			ViewManager.ins().close(LevelUpWayWin);
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			// case this.group:
			// 	ViewManager.ins().open(FbWin, 1);
			// 	ViewManager.ins().close(this);
			// 	break;
			// case this.group1:
			// 	ViewManager.ins().open(GuanQiaRewardWin);
			// 	ViewManager.ins().close(this);
			// 	break;
		}
	}

}

ViewManager.ins().reg(LevelUpWayWin, LayerManager.UI_Popup);