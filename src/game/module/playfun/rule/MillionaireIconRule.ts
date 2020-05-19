/**
 * Created by hjh on 2017/8/31.
 */
class MillionaireIconRule extends RuleIconBase {
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [

		];
	}

	checkShowIcon(): boolean {
		return true;
	}

	checkShowRedPoint(): number {
		return 0;
	}

	getEffName(redPointNum: number): string {

		return undefined;
	}

	tapExecute(): void {
		//打开界面获取大富翁数据
		Millionaire.ins().sendMillionaireInfo();
	}
}
