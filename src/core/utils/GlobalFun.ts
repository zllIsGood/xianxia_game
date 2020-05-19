/**
 * 共用方法
 */
class GlobalFun {
	public constructor() {
	}
	/**
	 * 检测货币是否充足
	 * @param num 货币数量
	 * @param moneyType 货币类型，参考枚举：MoneyConst，默认元宝
	 * @param noTips 不足时的提示
	 * @param backFun 不足时确认回调方法，部分地方会用到
	 */
	public static checkMoney(num: number, moneyType: MoneyConst = MoneyConst.yuanbao, noTips: string = ``, backFun?: Function): boolean {
		switch (moneyType) {
			case MoneyConst.gold:
				if (Actor.gold >= num) return true;
				if (noTips == "") noTips = `金币不足`;
				UserTips.ins().showTips(noTips);
				break;
			case MoneyConst.yuanbao:
				if (Actor.yb >= num) return true;
				if (noTips == "") noTips = `元宝不足`;
				UserTips.ins().showTips(noTips);


				if (!KFServerSys.ins().isKF) {
					//不足提示充值
					let w = WarnWin.show(`元宝不足，是否前往充值？`, null, null, () => {
						let rdata: RechargeData = Recharge.ins().getRechargeData(0);
						if (!rdata || rdata.num != 2) {
							ViewManager.ins().open(Recharge1Win);
						} else {
							ViewManager.ins().open(ChargeFirstWin);
						}
						if (backFun && typeof backFun == "function")
							backFun();
					});
					w.setBtnLabel(`取消`, `前往`);
				}

			default:
				debug.log(`检查货币类型不对，请检查=`, moneyType);
				return false;
		}

		return false;
	}
}