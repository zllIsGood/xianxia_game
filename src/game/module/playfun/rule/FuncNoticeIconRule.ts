class FuncNoticeIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			FuncNoticeController.ins().postFuncStateUpdate,
		];
	}

	checkShowIcon(): boolean {
		return !FuncNoticeController.ins().isAllFuncOpen();
	}

	checkShowRedPoint(): number {
		let count: number = 0;
		let nextFuncData: any;
		let funcData: any = FuncNoticeController.ins().getFuncNoticeData().funcData;
		for (let key in funcData) {
			if (funcData[key].state==1){
				count++;
			}
			else if (funcData[key].state==0 && !nextFuncData) {
				nextFuncData = funcData[key];
			}
		}
		if (!nextFuncData){
			nextFuncData = funcData[Object.keys(funcData).length];
		}

		if (nextFuncData){
			// 更新按钮状态
			this.tar["imgName"].source = nextFuncData.config.funcName;
			this.tar["img"].source = nextFuncData.config.pic;
			this.tar["des"].text = nextFuncData.config.openShortDes;
		}


		return count;
	}

	tapExecute(): void {
		ViewManager.ins().open(FuncOpenNoticeWin);
	}
}