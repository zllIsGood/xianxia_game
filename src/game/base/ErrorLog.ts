/**
 * Created by Administrator on 2016/11/4.
 */
class ErrorLog {

	public static httpLog = true;
	private static _ins: ErrorLog;

	public static ins(): ErrorLog {
		this._ins = this._ins || new ErrorLog();
		return this._ins;
	}

	constructor() {
		//异常抛出
		// window.onerror = this.show;
	}

	public show(str: string): void {

		let tapFun: Function = function () {
			DisplayUtils.removeFromParent(this);
			this.removeTouchEvent(this['notBtn'], tapFun);
		};
		let view: BaseView = new BaseView();
		view.skinName = 'ErrorSkin';
		view['notBtn'].addEventListener(egret.TouchEvent.TOUCH_TAP, tapFun, view);
		view['lab'].text = str;
		StageUtils.ins().getUIStage().addChild(view);
	}

	public static Assert(expr: any, msg: string): boolean {
		if (expr) return false;

		if (LocationProperty.isLocation) {
			ErrorLog.ins().show(msg);
		}

		if (ErrorLog.httpLog && !LocationProperty.isLocation && ReportData) {
			ReportData.getIns().report(`${msg}`, ReportData.ERROR);
		} else {
			console.log(msg);
		}
		return true;
	}
}

let Assert = ErrorLog.Assert;

// ErrorLog.ins();
/**
 * @param {String}  errorMessage   错误信息
 * @param {String}  scriptURI      出错的文件
 * @param {Long}    lineNumber     出错代码的行号
 * @param {Long}    columnNumber   出错代码的列号
 * @param {Object}  errorObj       错误的详细信息，Anything
 */
window.onerror = function (...info: any[]) {
	//跨域实例
	//<script type="text/javascript" src="//doitbegin.duapp.com/error.js" crossorigin></script>
	let funName: string = '';
	let callPos: string = '';
	if (info[4] && info[4].stack) {
		let list: string[] = info[4].stack.split("at ");
		funName = list[1].split(" ")[0];

		for (let i: number = 2; i < list.length; i++) {
			let arr: string[] = list[i].split("/");
			callPos += arr[arr.length - 1];
		}
	}

	let str: string = `兼容问题无法获取值`;
	let resultStr: string = `错误信息：${info[0]}\n` +
		`出错位置：${info[2]}行${info[3] ? info[3] + "列" : str}\n` +
		`出错函数：${funName}\n` +
		`函数调用：${callPos}`;
	if (resultStr.indexOf(str) >= 0)
		return;

	if (callPos.indexOf("merged.js") != 0)
		debug.log(resultStr);

	if (!LocationProperty.isLocation && ReportData)
		ReportData.getIns().report(`${resultStr}`, ReportData.ERROR);
};