/**
 * Created by Peach.T on 2017/11/27.
 */
class SamsaraVO {
	public constructor(lv: number, exp: number, expUpgradeNum: number, normalUpgradeNum: number, advancedUpgradeNum: number) {
		this.lv = lv;
		this.exp = exp;
		this.expUpgradeNum = expUpgradeNum;
		this.normalUpgradeNum = normalUpgradeNum;
		this.advancedUpgradeNum = advancedUpgradeNum;
	}

	public lv: number;
	public exp: number;
	public expUpgradeNum: number;
	public normalUpgradeNum: number;
	public advancedUpgradeNum: number;
}
