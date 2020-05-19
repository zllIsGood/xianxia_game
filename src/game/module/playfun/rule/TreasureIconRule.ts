/**
 * 寻宝
 */
class TreasureIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserBag.ins().postItemAdd,
			UserBag.ins().postHuntStore,
			UserBag.ins().postUseItemSuccess,
			Actor.ins().postLevelChange,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			Heirloom.ins().postHuntBoxInfo,
			GameServer.ins().postServerOpenDay,
			UserZs.ins().postZsLv,
		];
	}

	checkShowIcon(): boolean {
		if(WxTool.shouldRecharge()) {
			return OpenSystem.ins().checkSysOpen(SystemType.TREASURE);
		} else {
			return false;
		}
	}

	checkShowRedPoint(): number {
		//每天首次红点
		if(Setting.ins().getValue(ClientSet.firstClickTreasure) != new Date(GameServer.serverTime).getDate()){
			return 1;
		}
		if (Boolean(UserBag.ins().getHuntGoods(0).length) || Boolean(UserBag.ins().getHuntGoods(1).length) || Rune.ins().getIsGetBox() || 
		( Heirloom.ins().isHeirloomHuntOpen() && (Boolean(UserBag.ins().getHuntGoods(2).length) || Heirloom.ins().getIsGetBox())) ||RuneRedPointMgr.ins().checkCanExchange())
		return 1;
		// return 0;
		
		let item: ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, GlobalConfig.TreasureHuntConfig.huntItem);
		let sum: number = 0;
		if (item) {
			sum = item.count;
		}
		if (sum>0){
			return 1;
		}else{
			return 0;
		}

	}

	tapExecute(): void {
		ViewManager.ins().open(TreasureHuntWin);

		let date = new Date(GameServer.serverTime).getDate();
		if (Setting.ins().getValue(ClientSet.firstClickTreasure)  != date) {
			Setting.ins().setValue(ClientSet.firstClickTreasure, date);
			this.update();
		}
	}
}