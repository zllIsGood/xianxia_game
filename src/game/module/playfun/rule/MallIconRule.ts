/**
 * 商城
 */
class MallIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			ShopRedPoint.ins().postShopRedPoint,
		];
	}

	checkShowIcon(): boolean {
		if(WxTool.shouldRecharge()) {
			return OpenSystem.ins().checkSysOpen(SystemType.MALL);
		} else {
			return false;
		}
	}

	checkShowRedPoint(): number {
		if( ShopRedPoint.ins().shopRedPoint || !ShopRedPoint.ins().nfirstLogin ){

			return 1;
		}

		return 0;
	}

	tapExecute(): void {
		ViewManager.ins().open(ShopWin);
		ShopRedPoint.ins().nfirstLogin = true;
		this.update();
	}
}